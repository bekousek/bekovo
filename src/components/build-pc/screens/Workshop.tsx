import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useGame, type GameState, type Rot } from '../state';
import { Dialog, ScreenHead } from '../ui';
import { ArtSvg, Icon, fitScale } from '../pixel/Sprite';
import { ICONS, SPRITES, type Art } from '../pixel/sprites';
import { PART_BY_ID, formatKc, type Motherboard } from '../data/parts';
import { refundOf } from '../logic/assembly';
import {
  DIRECT, apply, buildItems, directAction, nextStep, remove, resetAsm, type Item,
} from '../assembly/steps';
import { BackScene, ManualBoard, MiniMap, SideScene } from '../assembly/scenes';
import { CROP, TARGETS, WORLD_W, hitBox, type Rect, type TargetId, type View } from '../assembly/slots';
import { addNote } from '../state';
import { sfx } from '../sfx';

const VIEW_NAME: Record<View, string> = { case: 'Skříň', board: 'Deska', back: 'Záda' };
/** Místa přes celou desku nebo skříň: bez rámečku a jmenovky při najetí. */
const BIG: TargetId[] = ['mat', 'standoffs', 'panel'];

export default function Workshop() {
  const { s, go } = useGame();
  if (s.owned.length === 0) {
    return (
      <>
        <ScreenHead title="Doma v dílně" lead="Tady složíš počítač z dílů, které koupíš." />
        <div className="px-frame px-panel" style={{ display: 'grid', gap: 16, maxWidth: 640 }}>
          <p>Zatím tu nic nemáš. Nejdřív si vydělej na brigádách a nakup díly v PC obchodě.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <button type="button" className="px-btn" onClick={() => go('shop')}><Icon name="cart" /> Do PC obchodu</button>
            <button type="button" className="px-btn px-btn--dark" onClick={() => go('jobs')}><Icon name="bag" /> Na brigádu</button>
          </div>
        </div>
      </>
    );
  }
  if (s.os.done) return <Finished />;
  return <Bench />;
}

function Finished() {
  const { s, go } = useGame();
  return (
    <>
      <ScreenHead title="Doma v dílně" lead="Počítač je složený a systém nainstalovaný." />
      <div className="px-frame px-panel" style={{ display: 'grid', gap: 16, maxWidth: 680 }}>
        <p>{s.sw.done.length ? `Nainstalované programy: ${s.sw.done.length}.` : 'Ještě do něj nainstaluj základní programy.'}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button type="button" className="px-btn" onClick={() => go('software')}>Programy <Icon name="arrow" /></button>
          <button type="button" className="px-btn px-btn--dark" onClick={() => go('finish')}><Icon name="star" /> Výsledek</button>
        </div>
      </div>
    </>
  );
}

/** Je místo právě ve scéně k dispozici? (Např. konektor karty jen s kartou.) */
function available(id: TargetId, s: GameState, view: View): boolean {
  const a = s.asm;
  const boardVisible = view === 'board' ? !!a.mb : !!a.caseId;
  switch (id) {
    case 'mat': return !a.caseId;
    case 'standoffs': return !a.caseId;
    case 'gpu-power': return !!a.gpu;
    case 'hdd-sata': return !!a.hdd;
    case 'port-gpu': return !!a.gpu;
    case 'port-mb': case 'usb-mb': return !!a.caseId;
    case 'psu-switch': return !!a.psu;
    case 'panel': case 'psu-bay': case 'drive-bay': case 'power-btn': return true;
    default: return boardVisible;
  }
}

interface Feedback { ok: boolean | null; text: string }

function Bench() {
  const { s, commit, update, go, toast, flags } = useGame();
  const items = buildItems(s);
  const [heldKey, setHeldKey] = useState<string | null>(null);
  const [view, setView] = useState<View>(s.asm.caseId ? 'case' : 'board');
  const [anim, setAnim] = useState<{ key: number; cls: string }>({ key: 0, cls: '' });
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [tries, setTries] = useState<Record<string, number>>({});
  const [shown, setShown] = useState<TargetId[]>([]);
  const [hintFor, setHintFor] = useState<string | null>(null);
  const [paste, setPaste] = useState<'pea' | 'lots' | 'none' | null>(null);
  const [manual, setManual] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [drag, setDrag] = useState<{ key: string; x: number; y: number; over: TargetId | null } | null>(null);
  const dragRef = useRef<{ key: string; sx: number; sy: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const held = items.find((i) => i.key === heldKey && i.holdable) ?? null;

  const switchView = (next: View) => {
    if (next === view) return;
    const cls = next === 'back' || view === 'back' ? 'view-turn' : next === 'board' ? 'view-zoom-in' : 'view-zoom-out';
    setAnim((x) => ({ key: x.key + 1, cls }));
    setView(next);
  };

  const pick = (it: Item) => {
    if (suppressClick.current) { suppressClick.current = false; return; }
    if (!it.holdable) return;
    sfx('click');
    setHeldKey(heldKey === it.key ? null : it.key);
    setShown([]);
    if (it.key !== 'tool:paste') setPaste(null);
  };

  const run = (target: TargetId) => {
    const d: GameState = structuredClone(s);
    // páčka, šroubek, vypínač a tlačítko fungují i bez nářadí v ruce
    if (DIRECT.includes(target)) {
      const res = directAction(d, target);
      if (res === 'power') {
        sfx('power');
        update((x) => { x.postTries += 1; });
        go('post');
        return;
      }
      if (res) {
        commit(d);
        setFeedback({ ok: res.ok, text: res.text });
        sfx(res.ok ? 'place' : 'bad');
        if (res.ok) setShown([]);
        return;
      }
      if (!held) { setFeedback({ ok: null, text: TARGETS[target].what }); return; }
    }
    if (!held) {
      setFeedback({ ok: null, text: `${TARGETS[target].what} Vezmi si z účtenky díl nebo kabel a zkus, kam patří.` });
      return;
    }
    if (held.key === 'tool:paste' && target === 'socket' && s.asm.cpu && !s.asm.cooler && !s.asm.paste) {
      if (!paste) { setFeedback({ ok: false, text: 'Nejdřív v účtence pod pastou vyber, kolik jí naneseš.' }); return; }
      if (paste !== 'pea') {
        update((x) => addNote(x, 'mistake', 'Špatné množství teplovodivé pasty.'));
        sfx('bad');
        setFeedback({ ok: false, text: paste === 'lots' ? 'Moc! Pasta by se rozlila kolem procesoru až na desku. Stačí kapka velká jako hrášek, chladič ji rozprostře.' : 'Bez pasty zůstane mezi procesorem a chladičem vzduch, který vede teplo špatně. Procesor by se přehříval.' });
        return;
      }
    }
    const res = apply(d, held, target);
    if (res.miss) {
      const n = (tries[held.key] ?? 0) + 1;
      setTries({ ...tries, [held.key]: n });
      let text = res.text;
      if (n >= 2 && held.hint) text += ` Nápověda: ${held.hint}`;
      if (n >= 3) {
        text += ' Správné místo teď bliká.';
        setShown(held.goal);
        if (n === 3) d.hints += 1;
      }
      commit(d);
      setFeedback({ ok: false, text });
      sfx('bad');
      return;
    }
    commit(d);
    setFeedback({ ok: res.ok, text: res.text });
    sfx(res.ok ? 'place' : 'bad');
    if (res.ok) {
      setTries({ ...tries, [held.key]: 0 });
      setShown([]);
      const still = buildItems(d).find((i) => i.key === held.key && i.holdable);
      if (!still) setHeldKey(null);
      if (held.key === 'tool:paste') setPaste(null);
    }
  };

  // Nápověda po stupních: poprvé jen řekne, co dál, podruhé ukáže místo.
  const hint = () => {
    const next = nextStep(s, items);
    const again = hintFor === next.text;
    update((x) => { x.hints += 1; });
    setHintFor(next.text);
    if (next.itemKey && items.some((i) => i.key === next.itemKey && i.holdable)) setHeldKey(next.itemKey);
    if (!again || !next.goal?.length) {
      setFeedback({ ok: null, text: `Co dál: ${next.text}${next.goal?.length ? ' Když místo nenajdeš, klikni na nápovědu znovu.' : ''}` });
      setShown([]);
      return;
    }
    setFeedback({ ok: null, text: `Co dál: ${next.text} Správné místo teď bliká.` });
    setShown(next.goal);
    const goalView = TARGETS[next.goal[0]].views;
    if (!goalView.includes(view)) switchView(goalView[0]);
  };

  const doReturn = (it: Item) => {
    const p = it.partId ? PART_BY_ID[it.partId] : null;
    if (!p) return;
    const back = refundOf(p);
    update((d) => {
      const i = d.owned.indexOf(p.id);
      if (i >= 0) d.owned.splice(i, 1);
      d.asm.blocked = d.asm.blocked.filter((x) => x !== p.id);
      d.money += back;
      d.spent -= back;
      d.returns += 1;
    });
    sfx('coin');
    toast('info', `${p.short} vrácen, zpátky ${formatKc(back)}. Správný díl kup v obchodě.`);
  };

  // ——— Tažení z účtenky ———
  const onDown = (it: Item, e: RPointerEvent<HTMLElement>) => {
    if (!it.holdable) return;
    dragRef.current = { key: it.key, sx: e.clientX, sy: e.clientY, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: RPointerEvent<HTMLElement>) => {
    const dr = dragRef.current;
    if (!dr) return;
    if (!dr.moved && Math.hypot(e.clientX - dr.sx, e.clientY - dr.sy) < 6) return;
    if (!dr.moved) { dr.moved = true; setHeldKey(dr.key); }
    const el = document.elementsFromPoint(e.clientX, e.clientY).find((x) => (x as HTMLElement).dataset?.target) as HTMLElement | undefined;
    setDrag({ key: dr.key, x: e.clientX, y: e.clientY, over: (el?.dataset.target as TargetId) ?? null });
  };
  const onUp = () => {
    const dr = dragRef.current;
    dragRef.current = null;
    if (!dr?.moved) return;
    suppressClick.current = true;
    window.setTimeout(() => { suppressClick.current = false; }, 0);
    const over = drag?.over;
    setDrag(null);
    if (over) run(over);
  };

  const dragHandlers = { onDown, onMove, onUp, cancel: () => { dragRef.current = null; setDrag(null); } };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (held?.partId && PART_BY_ID[held.partId]?.cat === 'cpu' && (e.key === 'r' || e.key === 'R') && !(e.target instanceof HTMLInputElement)) {
        update((d) => { d.asm.cpuRot = (((d.asm.cpuRot + 90) % 360) as Rot); });
      }
      if (e.key === 'Escape') setHeldKey(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const crop = CROP[view];
  // velká místa (podložka, skříň) dospodu, ať nepřekryjí drobné konektory
  const zones = Object.values(TARGETS)
    .filter((t) => t.views.includes(view) && available(t.id, s, view))
    .sort((a, b) => b.rect[2] * b.rect[3] - a.rect[2] * a.rect[3]);
  const parts = items.filter((i) => i.group === 'part');
  const tools = items.filter((i) => i.group === 'tool');
  const caption = captionFor(view, s);

  return (
    <>
      <ScreenHead title="Doma v dílně" lead="Vezmi z účtenky díl a najdi ve scéně, kam patří. Nic nesvítí, místo musíš poznat sám." />

      <div className="ws">
        <aside className="receipt ws-receipt px-frame" aria-label="Účtenka, díly a nářadí">
          <div className="receipt__head">
            <span className="receipt__shop">Účtenka</span>
            <span className="receipt__sub">Klikni na díl a pak na místo ve scéně</span>
          </div>
          {([['Díly z obchodu', parts], ['Kabely a nářadí', tools]] as const).map(([title, list]) => (
            <TrayGroup
              key={title}
              title={title}
              items={list}
              held={held}
              cpuRot={s.asm.cpuRot}
              drag={dragHandlers}
              onPick={pick}
              onReturn={doReturn}
              onRemove={(it) => { update((d) => remove(d, it)); setFeedback({ ok: null, text: `${it.label}: vyndáno.` }); }}
              panelOpen={!s.asm.panel}
              tools={(it) => <HandTools item={it} paste={paste} setPaste={setPaste} onDrop={() => setHeldKey(null)} />}
            />
          ))}
          <div className="ws-help">
            <button type="button" className="px-btn px-btn--dark px-btn--small px-btn--block" onClick={hint}>Co dál? (nápověda)</button>
            <p className="ws-help__note">Nápovědy: {s.hints}. Počítají se do výsledku.</p>
          </div>
        </aside>

        <section className="ws-scene" aria-label="Pracovní stůl">
          <div className="ws-scene__bar">
            <div role="tablist" aria-label="Pohled na počítač" className="view-tabs">
              {(['case', 'board', 'back'] as View[]).map((v) => (
                <button key={v} type="button" role="tab" aria-selected={view === v} className="view-tab" onClick={() => switchView(v)}>
                  <ArtSvg art={VIEW_ICON[v]} scale={2} /> {VIEW_NAME[v]}
                </button>
              ))}
            </div>
            <div className="ws-scene__tools">
              <button type="button" className="px-btn px-btn--dark px-btn--small" onClick={() => setManual(true)} disabled={!items.some((i) => i.partId && PART_BY_ID[i.partId]?.cat === 'mb')}>
                <Icon name="book" /> Manuál desky
              </button>
              <button type="button" className="px-btn px-btn--dark px-btn--small" onClick={() => setConfirmReset(true)}>Rozebrat</button>
            </div>
          </div>
          <p className="ws-caption">{caption}</p>

          <div className={`ws-tip px-frame${feedback?.ok === false ? ' ws-tip--bad' : feedback?.ok ? ' ws-tip--ok' : ''}`} aria-live="polite">
            <Icon name={feedback?.ok === false ? 'warn' : feedback?.ok ? 'check' : 'info'} />
            <p>{feedback?.text ?? (held ? `Máš v ruce: ${held.label}. Najdi ve scéně, kam patří. Položit ho můžeš klávesou Esc nebo dalším klikem na řádek.` : 'Klikni v účtence na díl, kabel nebo nářadí. Když nic nedržíš, klik na místo ve scéně ti řekne, co to je.')}</p>
          </div>

          <div className="ws-stage px-frame">
            {view === 'board' ? (
              <div className="stage-minimap" title="Kam se díváš">
                <MiniMap onMat={!s.asm.caseId} />
                <span>{s.asm.caseId ? 've skříni' : 'na stole'}</span>
              </div>
            ) : null}
            <Stage crop={crop}>
              {(scale) => (
                <div key={anim.key} className={`ws-world ${anim.cls}`}>
                  <svg width={crop[2] * scale} height={crop[3] * scale} viewBox={crop.join(' ')} shapeRendering="crispEdges" aria-hidden="true">
                    {view === 'back' ? <BackScene s={s} /> : <SideScene s={s} view={view} />}
                  </svg>
                  <Orientation view={view} scale={scale} crop={crop} />
                  {zones.map((t) => {
                    const hb = hitBox(t, scale, crop);
                    const pulse = shown.includes(t.id);
                    const over = drag?.over === t.id;
                    const cls = ['drop', BIG.includes(t.id) ? 'drop--big' : '', flags.hitbox ? 'drop--debug' : '', pulse ? 'drop--target' : '', over ? 'drop--over' : ''].join(' ');
                    return (
                      <button
                        key={t.id}
                        type="button"
                        data-target={t.id}
                        className={cls}
                        style={{ left: hb.left, top: hb.top, width: hb.width, height: hb.height }}
                        aria-label={held ? `${held.label}: zkusit dát na ${labelOf(t.id, s)}` : labelOf(t.id, s)}
                        onClick={() => run(t.id)}
                      >
                        <span className="drop__ring" style={{ left: hb.ring.left, top: hb.ring.top, width: hb.ring.width, height: hb.ring.height }} />
                        {!BIG.includes(t.id) ? (
                          <span className={`drop__label${t.labelTop ? ' drop__label--top' : ''}`}>{labelOf(t.id, s)}</span>
                        ) : null}
                      </button>
                    );
                  })}
                  {drag ? <Ghost item={items.find((i) => i.key === drag.key)} x={drag.x} y={drag.y} scale={scale} rot={s.asm.cpuRot} /> : null}
                </div>
              )}
            </Stage>
          </div>

        </section>
      </div>

      {manual ? <Manual s={s} onClose={() => setManual(false)} /> : null}
      {confirmReset ? (
        <Dialog
          title="Rozebrat počítač?"
          onClose={() => setConfirmReset(false)}
          actions={
            <>
              <button type="button" className="px-btn px-btn--dark px-btn--small" onClick={() => setConfirmReset(false)}>Ne</button>
              <button type="button" className="px-btn px-btn--bad px-btn--small" onClick={() => { update((d) => resetAsm(d)); setConfirmReset(false); setFeedback(null); setView('board'); }}>Rozebrat</button>
            </>
          }
        >
          <p>Všechny díly se vrátí do krabic a můžeš skládat znovu. Nic se neztratí ani nezaplatí.</p>
        </Dialog>
      ) : null}
    </>
  );
}

function labelOf(id: TargetId, s: GameState): string {
  if (id === 'socket' && s.asm.cpu) return 'Procesor v patici';
  return TARGETS[id].label;
}

function captionFor(view: View, s: GameState): string {
  const a = s.asm;
  if (view === 'case') return 'Skříň zboku: levá bočnice je sundaná a díváš se dovnitř. Vlevo jsou záda skříně, vpravo předek, dole kryt se zdrojem.';
  if (view === 'back') return 'Záda počítače: skříň jsi otočil. Vlevo je strana s deskou, vpravo bočnice. Tady se zapojuje monitor a zapíná zdroj.';
  if (!a.mb) return 'Antistatická podložka na stole. Sem patří základní deska, než ji osadíš.';
  if (!a.caseId) return 'Deska leží na antistatické podložce a díváš se na ni shora.';
  return 'Deska zblízka: stejný pohled jako Skříň, jen přiblížený. Rámeček v mapce ukazuje, kam se díváš.';
}

/** Plocha scény: největší měřítko, které se vejde do šířky i do výšky okna. */
function Stage({ crop, children }: { crop: Rect; children: (scale: number) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      // pod lištou zůstanou vidět záložky, popisek i zpráva nad scénou
      const h = Math.max(260, window.innerHeight - 360);
      const fit = Math.min(w / crop[2], h / crop[3], 4);
      setScale(Math.max(0.75, Math.floor(fit * 4) / 4));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [crop]);
  return (
    <div ref={ref} className="stage">
      {scale > 0 ? (
        <div className="stage__inner" style={{ width: crop[2] * scale, height: crop[3] * scale, ['--s' as string]: `${Math.max(2, Math.round(scale))}px` }}>
          {children(scale)}
        </div>
      ) : null}
    </div>
  );
}

/** Popisky po stranách: kde jsou záda a kde předek skříně. */
function Orientation({ view, scale, crop }: { view: View; scale: number; crop: Rect }) {
  const at = (x: number, y: number) => ({ left: (x - crop[0]) * scale, top: (y - crop[1]) * scale, transform: 'translateY(-50%)' });
  const atRight = (x: number, y: number) => ({ right: (crop[0] + crop[2] - x) * scale, top: (y - crop[1]) * scale, transform: 'translateY(-50%)', textAlign: 'right' as const });
  if (view === 'case') {
    return (
      <>
        <span className="stage-tag" style={at(4, 150)}>◀ záda</span>
        <span className="stage-tag" style={atRight(WORLD_W - 2, 150)}>předek ▶</span>
      </>
    );
  }
  if (view === 'back') {
    return (
      <>
        <span className="stage-tag" style={at(30, 150)}>◀ strana s deskou</span>
        <span className="stage-tag" style={atRight(370, 150)}>bočnice ▶</span>
      </>
    );
  }
  return null;
}

function TrayGroup({ title, items, held, cpuRot, drag, onPick, onReturn, onRemove, panelOpen, tools }: {
  title: string;
  items: readonly Item[];
  held: Item | null;
  cpuRot: Rot;
  drag: { onDown: (it: Item, e: RPointerEvent<HTMLElement>) => void; onMove: (e: RPointerEvent<HTMLElement>) => void; onUp: () => void; cancel: () => void };
  onPick: (it: Item) => void;
  onReturn: (it: Item) => void;
  onRemove: (it: Item) => void;
  panelOpen: boolean;
  tools: (it: Item) => ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <div className="tray">
      <h3 className="tray__title">{title}</h3>
      <ul className="tray__list">
        {items.map((it) => {
          const art = SPRITES[it.sprite];
          const sc = fitScale(art, 68, 50);
          const done = it.state === 'in' || it.state === 'used';
          return (
            <li key={it.key}>
              <button
                type="button"
                className={`tray-row${held?.key === it.key ? ' tray-row--held' : ''}${done ? ' tray-row--done' : ''}${it.state === 'block' ? ' tray-row--block' : ''}`}
                disabled={!it.holdable}
                aria-pressed={it.holdable ? held?.key === it.key : undefined}
                onClick={() => onPick(it)}
                onPointerDown={(e) => drag.onDown(it, e)}
                onPointerMove={drag.onMove}
                onPointerUp={drag.onUp}
                onPointerCancel={drag.cancel}
                style={it.holdable ? { touchAction: 'none' } : undefined}
              >
                <span className="tray-row__art"><ArtSvg art={art} scale={sc} rotate={it.sprite === 'cpu' ? cpuRot : 0} /></span>
                <span className="tray-row__text">
                  <span className="tray-row__name">
                    <span>{it.label}</span>
                    {done ? <ArtSvg art={ICONS.check} scale={1.5} tint="teal" title="hotovo" /> : it.state === 'block' ? <ArtSvg art={ICONS.cross} scale={1.5} tint="red" title="nepasuje" /> : null}
                  </span>
                  <span className="tray-row__note">{it.note}</span>
                </span>
              </button>
              {held?.key === it.key ? tools(it) : null}
              {(it.state === 'block' || it.state === 'extra') && it.partId ? (
                <button type="button" className="receipt__x tray-row__link" onClick={() => onReturn(it)}>Vrátit za {formatKc(refundOf(PART_BY_ID[it.partId]))}</button>
              ) : null}
              {it.removable && it.state === 'in' && panelOpen ? (
                <button type="button" className="receipt__x tray-row__link" style={{ color: 'var(--c-slate)' }} onClick={() => onRemove(it)}>Vyndat</button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Co jde s dílem v ruce udělat ještě před vložením: natočit procesor, odměřit pastu. */
function HandTools({ item, paste, setPaste, onDrop }: { item: Item; paste: string | null; setPaste: (v: 'pea' | 'lots' | 'none') => void; onDrop: () => void }) {
  const { s, update } = useGame();
  const isCpu = !!item.partId && PART_BY_ID[item.partId]?.cat === 'cpu';
  return (
    <div className="tray-hand">
      {isCpu ? (
        <>
          <div className="tray-hand__cpu">
            <ArtSvg art={SPRITES.cpu} scale={3} rotate={s.asm.cpuRot} title="Procesor v ruce" />
            <p>Do patice jde jen jedním směrem. Natoč ho, aby zlatý trojúhelník v rohu seděl se značkou na patici.</p>
          </div>
          <button type="button" className="px-btn px-btn--small" onClick={() => { sfx('click'); update((d) => { d.asm.cpuRot = (((d.asm.cpuRot + 90) % 360) as Rot); }); }}>
            <Icon name="rotate" /> Otočit o 90° (R)
          </button>
        </>
      ) : item.key === 'tool:paste' ? (
        <>
          <p>Kolik pasty naneseš? Pak klikni na procesor.</p>
          <div className="ws-choice__opts" role="radiogroup" aria-label="Množství pasty">
            {([['pea', 'Kapku jako hrášek'], ['lots', 'Celou tubu'], ['none', 'Žádnou']] as const).map(([v, label]) => (
              <button key={v} type="button" role="radio" aria-checked={paste === v} className={`px-btn px-btn--small ${paste === v ? '' : 'px-btn--dark'}`} onClick={() => setPaste(v)}>
                {label}
              </button>
            ))}
          </div>
        </>
      ) : null}
      <button type="button" className="receipt__x" style={{ color: 'var(--c-silver)' }} onClick={onDrop}>Položit zpátky</button>
    </div>
  );
}

/**
 * Díl pod prstem. Kreslí se přímo do <body>: uvnitř scény by ho posunula
 * animace pohledu (transform mění, od čeho se počítá position: fixed)
 * a ořízl rámeček.
 */
function Ghost({ item, x, y, scale, rot }: { item?: Item; x: number; y: number; scale: number; rot: Rot }) {
  if (!item) return null;
  const art = SPRITES[item.sprite];
  const sc = Math.min(Math.max(1, Math.round(scale)), fitScale(art, 200, 140));
  return createPortal(
    <div className="ghost" style={{ transform: `translate(${x - (art.w * sc) / 2}px, ${y - (art.h * sc) / 2}px)` }}>
      <ArtSvg art={art} scale={sc} rotate={item.sprite === 'cpu' ? rot : 0} />
    </div>,
    document.body,
  );
}

const MANUAL_LABELS: TargetId[] = ['socket', 'fan-cpu', 'A1', 'A2', 'B1', 'B2', 'm2', 'pcie', 'pcie2', 'atx24', 'eps8', 'sata-mb', 'fan-sys'];

function Manual({ s, onClose }: { s: GameState; onClose: () => void }) {
  const mbId = s.asm.mb ?? s.owned.find((id) => PART_BY_ID[id]?.cat === 'mb');
  const mb = mbId ? (PART_BY_ID[mbId] as Motherboard) : null;
  if (!mb) return null;
  const crop = CROP.board;
  const scale = window.innerWidth < 520 ? 1.5 : 2;
  return (
    <Dialog
      wide
      title={`Manuál desky ${mb.short}`}
      onClose={onClose}
      actions={<button type="button" className="px-btn px-btn--small" onClick={onClose}>Zavřít</button>}
    >
      <div className="manual">
        <div className="manual__board" style={{ width: crop[2] * scale, height: crop[3] * scale }}>
          <svg width={crop[2] * scale} height={crop[3] * scale} viewBox={crop.join(' ')} shapeRendering="crispEdges" aria-hidden="true">
            <ManualBoard mb={mb} />
          </svg>
          {MANUAL_LABELS.map((id) => {
            const t = TARGETS[id];
            const hb = hitBox(t, scale, crop);
            return (
              <span key={id} className={`manual__tag${t.labelTop ? ' manual__tag--top' : ''}`} style={{ left: hb.left + hb.width / 2, top: t.labelTop ? hb.top : hb.top + hb.height }}>
                {t.label}
              </span>
            );
          })}
        </div>
        <ul className="manual__rules">
          <li><b>Patice {mb.socket}</b>: jen procesory se stejnou paticí. Zlatý trojúhelník na procesoru patří k trojúhelníku na patici.</li>
          <li><b>Paměti {mb.mem}</b>: jeden modul do A2, dva moduly do A2 a B2 (dva kanály).</li>
          <li><b>CPU_FAN</b>: větrák chladiče procesoru. SYS_FAN je pro větráky skříně.</li>
          <li><b>M.2</b>: SSD zasuň šikmo a přišroubuj.</li>
          <li><b>PCIe x16 (horní)</b>: grafická karta. Dolní slot má jen 4 linky.</li>
          <li><b>24pin ATX</b> napájí desku, <b>8pin CPU</b> procesor. Porty <b>SATA</b> jsou pro datové kabely disků.</li>
        </ul>
      </div>
    </Dialog>
  );
}

// Ikony pohledů: odkud se na počítač díváš.
const VIEW_ICON: Record<View, Art> = {
  case: { w: 12, h: 12, px: [[1, 0, 10, 12, 'slate'], [2, 1, 8, 10, 'night'], [3, 2, 4, 5, 'teal'], [3, 9, 6, 1, 'gold'], [10, 1, 1, 10, 'silver']] },
  board: { w: 12, h: 12, px: [[0, 0, 12, 12, 'teal'], [2, 2, 8, 8, 'ink'], [3, 3, 3, 3, 'silver'], [7, 3, 1, 5, 'slate'], [8, 3, 1, 5, 'slate'], [3, 8, 4, 1, 'night']] },
  back: { w: 12, h: 12, px: [[3, 0, 6, 12, 'slate'], [4, 1, 4, 10, 'ink'], [4, 2, 2, 3, 'silver'], [6, 2, 2, 2, 'night'], [4, 9, 4, 2, 'night'], [5, 6, 3, 1, 'silver']] },
};
