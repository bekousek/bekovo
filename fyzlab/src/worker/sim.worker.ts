/// <reference lib="webworker" />
/**
 * Simulační worker — vlastní veškerou fyzikální pravdu za běhu.
 *
 * Smyčka: setTimeout plánovaný na další tick + FixedStepAccumulator.
 * Snapshoty se posílají nejvýše každý druhý tick (~60 Hz) jako
 * transferable buffery z recyklačního poolu.
 */
import { Engine } from '@engine/Engine';
import { FixedStepAccumulator } from '@engine/core/timing';
import { clamp } from '@engine/core/math';
import type { SceneDoc } from '@engine/scene/schema';
import type { MainToWorker, WorkerToMain } from './protocol';

declare const self: DedicatedWorkerGlobalScope;

/** Strop dohánění — víc ticků na probuzení = spirála smrti, radši zpomalit. */
const MAX_CATCHUP_TICKS = 4;
/** Snapshot každý N-tý tick (120 Hz / 2 = 60 Hz). */
const SNAPSHOT_EVERY = 2;

let engine: Engine | null = null;
let acc: FixedStepAccumulator | null = null;
let running = false;
let speed = 1;
let lastWake = 0;
let seq = 0;
let topologyVersion = 0;
let lastSnapshotTick = -1;
let tickMsAvg = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
let snapshotBytes = 0;
const bufferPool: ArrayBuffer[] = [];

function post(msg: WorkerToMain, transfer?: Transferable[]): void {
  if (transfer) self.postMessage(msg, { transfer });
  else self.postMessage(msg);
}

function postStatus(): void {
  post({ type: 'status', running, speed });
}

function sendIdTable(): void {
  if (!engine) return;
  topologyVersion += 1;
  snapshotBytes = engine.snapshotByteLength();
  bufferPool.length = 0; // staré buffery mají špatnou velikost
  post({ type: 'idTable', topologyVersion, ids: [...engine.orderIds] });
}

function takeBuffer(): ArrayBuffer {
  for (;;) {
    const b = bufferPool.pop();
    if (!b) return new ArrayBuffer(snapshotBytes);
    if (b.byteLength === snapshotBytes) return b;
  }
}

function sendSnapshot(slowMotion: boolean): void {
  if (!engine) return;
  const buffer = takeBuffer();
  engine.writeSnapshotInto(buffer);
  lastSnapshotTick = engine.tickIndex;
  post(
    {
      type: 'snapshot',
      seq: ++seq,
      simTime: engine.simTime,
      tickIndex: engine.tickIndex,
      slowMotion,
      topologyVersion,
      bodyCount: engine.bodyCount,
      tickMs: tickMsAvg,
      bodies: buffer,
    },
    [buffer],
  );
}

function loop(): void {
  timer = null;
  if (!running || !engine || !acc) return;

  const now = performance.now();
  const elapsed = (now - lastWake) / 1000;
  lastWake = now;

  const { ticks, dropped } = acc.advance(elapsed * speed);
  if (ticks > 0) {
    const t0 = performance.now();
    for (let i = 0; i < ticks; i++) engine.tick();
    const perTick = (performance.now() - t0) / ticks;
    tickMsAvg = tickMsAvg === 0 ? perTick : tickMsAvg * 0.9 + perTick * 0.1;

    if (engine.tickIndex - lastSnapshotTick >= SNAPSHOT_EVERY) {
      sendSnapshot(dropped);
    }
    const events = engine.drainEvents();
    if (events.length > 0) post({ type: 'events', events });
    const plotSamples = engine.drainPlotSamples();
    if (plotSamples.length > 0) post({ type: 'plotChunk', samples: plotSamples });
    const fbd = engine.drainFbdSample();
    if (fbd) post({ type: 'fbdSample', sample: fbd });
    const predResult = engine.drainPredictionResult();
    if (predResult !== null) post({ type: 'predictionResult', value: predResult });
    const rays = engine.readRaySegments();
    if (rays.length > 0) post({ type: 'raysUpdate', segments: rays as import('@engine/optics/OpticsModule').RaySegment[] });
  }
  schedule();
}

function schedule(): void {
  if (!running || timer !== null || !acc) return;
  const ms = (acc.secondsToNextTick / speed) * 1000;
  timer = setTimeout(loop, clamp(ms, 0, 8));
}

function setRunning(value: boolean): void {
  if (running === value) return;
  running = value;
  if (running) {
    lastWake = performance.now();
    acc?.reset();
    schedule();
  } else {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    // Finální snapshot, ať render sedí přesně na stavu pauzy…
    sendSnapshot(false);
    // …a stateSync, aby si editor slil výsledné pozice do dokumentu
    // (implicitní undoable krok „simulace proběhla").
    if (engine) post({ type: 'stateSync', states: engine.readState() });
  }
  postStatus();
}

async function handleInit(doc: SceneDoc): Promise<void> {
  engine = await Engine.create(doc);
  acc = new FixedStepAccumulator(engine.dt, MAX_CATCHUP_TICKS);
  sendIdTable();
  sendSnapshot(false);
  post({ type: 'ready' });
  postStatus();
}

function handleLoadScene(doc: SceneDoc): void {
  if (!engine) return;
  setRunning(false);
  engine.load(doc);
  acc = new FixedStepAccumulator(engine.dt, MAX_CATCHUP_TICKS);
  sendIdTable();
  sendSnapshot(false);
}

function handleControl(action: 'play' | 'pause' | 'step'): void {
  if (!engine) return;
  switch (action) {
    case 'play':
      setRunning(true);
      break;
    case 'pause':
      setRunning(false);
      break;
    case 'step':
      if (!running) {
        engine.tick();
        sendSnapshot(false);
        const events = engine.drainEvents();
        if (events.length > 0) post({ type: 'events', events });
        const plotSamples = engine.drainPlotSamples();
        if (plotSamples.length > 0) post({ type: 'plotChunk', samples: plotSamples });
        const fbd = engine.drainFbdSample();
        if (fbd) post({ type: 'fbdSample', sample: fbd });
        const predResult = engine.drainPredictionResult();
        if (predResult !== null) post({ type: 'predictionResult', value: predResult });
        const rays = engine.readRaySegments();
        if (rays.length > 0) post({ type: 'raysUpdate', segments: rays as import('@engine/optics/OpticsModule').RaySegment[] });
        post({ type: 'stateSync', states: engine.readState() });
      }
      break;
  }
}

function handlePatch(ops: import('@engine/scene/ops').DocOp[]): void {
  if (!engine) return;
  const { topologyChanged } = engine.applyPatch(ops, running);
  if (topologyChanged) sendIdTable();
  // V pauze nový stav nepřijde s dalším tickem — poslat snapshot hned.
  if (!running || topologyChanged) sendSnapshot(false);
}

self.onmessage = (e: MessageEvent<MainToWorker>) => {
  const msg = e.data;
  try {
    switch (msg.type) {
      case 'init':
        void handleInit(msg.doc).catch((err) => {
          post({ type: 'error', message: String(err) });
        });
        break;
      case 'loadScene':
        handleLoadScene(msg.doc);
        break;
      case 'patch':
        handlePatch(msg.ops);
        break;
      case 'control':
        handleControl(msg.action);
        break;
      case 'setSpeed':
        speed = clamp(msg.speed, 0.05, 10);
        postStatus();
        break;
      case 'pointer':
        if (!engine) break;
        if (msg.ev.kind === 'dragStart') {
          engine.pointerDragStart(msg.ev.entityId, { x: msg.ev.x, y: msg.ev.y });
        } else if (msg.ev.kind === 'dragMove') {
          engine.pointerDragMove({ x: msg.ev.x, y: msg.ev.y });
        } else {
          engine.pointerDragEnd();
        }
        break;
      case 'requestStateSync':
        if (engine) post({ type: 'stateSync', states: engine.readState() });
        break;
      case 'setRecordBodyId':
        engine?.setRecordBodyId(msg.bodyId);
        break;
      case 'setFbdBodyId':
        engine?.setFbdBodyId(msg.bodyId);
        break;
      case 'setPredictionTarget':
        engine?.setPredictionTarget(msg.bodyId, msg.quantity);
        break;
      case 'returnBuffer':
        if (msg.buffer.byteLength === snapshotBytes) bufferPool.push(msg.buffer);
        break;
    }
  } catch (err) {
    post({ type: 'error', message: String(err) });
  }
};
