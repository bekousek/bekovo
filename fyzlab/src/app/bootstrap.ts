/**
 * Sestavení runtime: worker klient + editor (DocumentStore/Controller/State)
 * + kamera + renderer + nástroje + vstup. App.tsx tohle volá jednou po
 * mountu canvas hostu.
 */
import { demoScene } from '@engine/scene/defaults';
import { Camera } from '@editor/camera';
import { EditorController } from '@editor/EditorController';
import { EditorState } from '@editor/editorState';
import { findJointAt, makeHitTester, makeStackHitTester } from '@editor/hitTest';
import { newEntityId } from '@editor/newId';
import { PointerManager } from '@editor/pointer/PointerManager';
import { installShortcuts } from '@editor/shortcuts';
import { SnapService } from '@editor/snap';
import { cmdRemoveEntities } from '@editor/commands';
import { defaultPasteOffset, EditorClipboard } from '@editor/clipboard';
import { cmdToggleFrozen, duplicateSelection } from '@editor/quickActions';
import { PhotogateTool } from '@editor/tools/InstrumentTools';
import { AxleTool, FixTool, SpringTool } from '@editor/tools/JointTools';
import { SelectTool } from '@editor/tools/SelectTool';
import { BoxTool, CircleTool, PlaneTool, PolygonTool } from '@editor/tools/ShapeTools';
import { ToolManager } from '@editor/tools/ToolManager';
import type { ToolContext } from '@editor/tools/Tool';
import { Renderer } from '@render/Renderer';
import { installSceneDrop } from '@share/fileIO';
import { decodeSceneParam, sceneParamFromHash } from '@share/urlCodec';
import { SimWorkerClient } from '@worker/SimWorkerClient';
import type { SceneDoc } from '@engine/scene/schema';
import { useUiStore } from './store/uiStore';
import { t } from './i18n/t';

export interface Runtime {
  client: SimWorkerClient;
  controller: EditorController;
  tools: ToolManager;
  snap: SnapService;
  state: EditorState;
  camera: Camera;
  /** Rychlé akce nad výběrem (radiální menu, panel). */
  actions: {
    deleteSelection: () => void;
    duplicate: () => void;
    mirror: () => void;
    toggleFrozen: () => void;
  };
  /** Načte novou scénu (soubor/URL): worker rebuild, kamera, výběr, historie. */
  loadScene: (doc: SceneDoc) => void;
  /** Aktuální dokument s kamerou podle skutečného pohledu (uložení/sdílení). */
  docForSave: () => SceneDoc;
  dispose: () => void;
}

export async function bootstrap(host: HTMLElement): Promise<Runtime> {
  let initialDoc = demoScene();
  // Scéna z odkazu #s=… má přednost před demem.
  const sceneParam = sceneParamFromHash(window.location.hash);
  if (sceneParam) {
    try {
      initialDoc = await decodeSceneParam(sceneParam);
    } catch (err) {
      console.error('[fyzlab] Scénu z URL se nepodařilo načíst:', err);
    }
  }

  const client = new SimWorkerClient();
  const controller = new EditorController(client, initialDoc);
  const store = controller.store;
  const state = new EditorState();

  const camera = new Camera(initialDoc.camera.center, initialDoc.camera.metersPerScreenH);
  const snap = new SnapService(camera);
  const renderer = await Renderer.create(host, camera);

  renderer.onReleaseBuffer = (buffer) => client.returnBuffer(buffer);
  renderer.onStats = (stats) => useUiStore.getState().setStats(stats);
  renderer.attachOverlaySource(state);

  state.lookupBody = (id) => {
    const e = store.doc.entities.find((x) => x.id === id);
    return e && e.kind === 'body' ? e : null;
  };
  state.lookupJoint = (id) => {
    const e = store.doc.entities.find((x) => x.id === id);
    return e && e.kind === 'joint' ? e : null;
  };
  state.lookupInstrument = (id) => {
    const e = store.doc.entities.find((x) => x.id === id);
    return e && e.kind === 'instrument' ? e : null;
  };
  state.lookupPose = (id) => {
    // getBodyPose vrací sdílený scratch — kopie, ať si volající smí referenci nechat.
    const p = renderer.getBodyPose(id);
    return p ? { x: p.x, y: p.y, angle: p.angle } : null;
  };
  state.showHandles = () => !controller.isRunning;

  client.onIdTable = (_version, ids) => renderer.setScene(store.doc, ids);
  client.onSnapshot = (msg) => {
    renderer.pushSnapshot(msg);
    // Obrysy výběru a úchopy sledují pohyb těles (pózy jdou ze snapshotů).
    if (state.selection.size > 0) state.bump();
  };
  client.onStatus = (running, speed) => {
    controller.handleStatus(running);
    state.bump(); // úchopy se za běhu skrývají
    const ui = useUiStore.getState();
    ui.setRunning(running);
    ui.setSpeed(speed);
  };
  client.onStateSync = (states) => controller.handleStateSync(states);
  client.onEvents = (events) => useUiStore.getState().applyInstrumentEvents(events);
  client.onError = (message) => {
    console.error('[fyzlab worker]', message);
  };

  store.subscribe((doc, ops) => {
    const ui = useUiStore.getState();
    ui.setHistory(store.canUndo, store.canRedo);
    // Změna geometrie/vzhledu jednoho tělesa → překreslit jen jeho Graphics.
    for (const op of ops) {
      if (op.op === 'replaceEntity' && op.entity.kind === 'body') {
        renderer.updateEntity(op.entity);
      }
    }
    // Klouby/vektory/přístroje nejsou v idTable (nemění topologii) → obnovit vždy.
    renderer.setDocLayers(doc);
    // Nová scéna (Reset, soubor, URL) → stará měření fotobran neplatí.
    if (ops.some((op) => op.op === 'replaceDoc')) ui.clearGateReadings();
    // Výběr nesmí ukazovat na smazané entity.
    let selectionDirty = false;
    for (const id of state.selection) {
      if (!doc.entities.some((e) => e.id === id)) {
        state.selection.delete(id);
        selectionDirty = true;
      }
    }
    if (selectionDirty) state.bump();
  });

  const hitTest = makeHitTester(
    () => store.doc,
    (id) => renderer.getBodyPose(id),
  );
  const hitTestAll = makeStackHitTester(
    () => store.doc,
    (id) => renderer.getBodyPose(id),
  );

  const toolCtx: ToolContext = {
    client,
    store,
    state,
    snap,
    camera,
    hitTest,
    hitTestAll,
    isRunning: () => controller.isRunning,
  };

  const tools = new ToolManager();
  tools.register(new SelectTool(toolCtx), 'v');
  tools.register(new BoxTool(toolCtx), 'b');
  tools.register(new CircleTool(toolCtx), 'k');
  tools.register(new PolygonTool(toolCtx), 'p');
  tools.register(new PlaneTool(toolCtx), 'r');
  tools.register(new AxleTool(toolCtx), 'o');
  tools.register(new SpringTool(toolCtx), 's');
  tools.register(new FixTool(toolCtx), 'f');
  tools.register(new PhotogateTool(toolCtx), 't');
  tools.onActiveChange = (id) => useUiStore.getState().setActiveToolId(id);

  const deleteSelection = () => {
    if (state.selection.size === 0) return;
    store.apply(cmdRemoveEntities('Smazat výběr', store.doc, [...state.selection]));
  };
  const mirror = () => EditorClipboard.mirror(store, state);
  const duplicate = () =>
    duplicateSelection(store, state, defaultPasteOffset((px) => snap.pxToWorld(px)));
  const toggleFrozen = () => {
    const cmd = cmdToggleFrozen(store.doc, state.selection);
    if (cmd) store.apply(cmd);
  };

  const clipboard = new EditorClipboard();

  const pointer = new PointerManager(host, camera, tools);
  // Kontextové menu: pravé tlačítko kdykoli, long-press jen v pauze.
  pointer.longPressEnabled = () => !controller.isRunning;
  pointer.onContextAction = (screen, world) => {
    const jointHit = findJointAt(
      store.doc,
      (id) => state.poseOf(id),
      world,
      14 / camera.pixelsPerMeter,
    );
    const hit = jointHit ?? hitTestAll(world)[0] ?? null;
    if (hit) {
      if (!state.selection.has(hit)) state.setSelection([hit]);
    } else if (state.selection.size === 0) {
      return; // prázdné místo bez výběru — není nad čím otevírat
    }
    useUiStore.getState().setRadialMenu({ x: screen.x, y: screen.y });
  };

  const removeShortcuts = installShortcuts({
    controller,
    tools,
    state,
    snap,
    onSnapChange: (enabled) => useUiStore.getState().setSnapEnabled(enabled),
    onDeleteSelection: deleteSelection,
    onCopy: () => clipboard.copy(store.doc, state.selection),
    onPaste: () => clipboard.paste(store, state, defaultPasteOffset((px) => snap.pxToWorld(px))),
    onMirror: mirror,
  });

  const loadScene = (doc: SceneDoc) => {
    state.clearSelection();
    controller.loadScene(doc);
    camera.setFromDoc(doc.camera.center, doc.camera.metersPerScreenH);
  };
  const docForSave = (): SceneDoc => ({
    ...store.doc,
    camera: {
      center: { x: camera.center.x, y: camera.center.y },
      metersPerScreenH: camera.metersPerScreenH,
    },
  });

  // Přetažení .fyzlab souboru na plátno = otevřít.
  const removeDrop = installSceneDrop(host, loadScene, (err) => {
    console.error('[fyzlab] drop:', err);
    useUiStore.getState().setToast(t('toastLoadError'));
  });

  // Globální přepínač vektorů rychlosti čte renderer z uiStore.
  renderer.vectorsEnabled = () => useUiStore.getState().showVelocityAll;

  await client.init(initialDoc);

  if (import.meta.env.DEV) {
    // Ladicí okno do runtime (jen dev build).
    (globalThis as unknown as Record<string, unknown>).__fyzlab = {
      camera,
      renderer,
      hitTest,
      hitTestAll,
      client,
      controller,
      store,
      state,
      tools,
      snap,
      pointer,
      newEntityId,
      loadScene,
      docForSave,
      getDoc: () => store.doc,
    };
  }

  return {
    client,
    controller,
    tools,
    snap,
    state,
    camera,
    actions: { deleteSelection, duplicate, mirror, toggleFrozen },
    loadScene,
    docForSave,
    dispose: () => {
      removeDrop();
      removeShortcuts();
      pointer.dispose();
      renderer.dispose();
      client.dispose();
    },
  };
}
