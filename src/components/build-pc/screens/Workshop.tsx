import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { addNote, useGame, type GameState, type Rot } from '../state';
import { Dialog, PixelStage, ScreenHead } from '../ui';
import { ArtSvg, Icon, Sprite } from '../pixel/Sprite';
import { ICONS, SPRITES, type IconKey } from '../pixel/sprites';
import type { PalKey } from '../pixel/palette';
import { PART_BY_ID, formatKc } from '../data/parts';
import { refundOf } from '../logic/assembly';
import { buildLines, place, remove, resetAsm, type Line } from '../assembly/steps';
import { BackScene, BoardScene, CaseScene } from '../assembly/scenes';
import { SCENE_H, SCENE_W, TARGETS, hitBox, type TargetId, type View } from '../assembly/slots';
import { sfx } from '../sfx';

const VIEW_TITLE: Record<View, string> = { board: 'Deska zblízka', case: 'Skříň z boku', back: 'Záda počítače' };

interface Drag {
  key: string;
  x: number;
  y: number;
  over: TargetId | null;
}

export default function Workshop() {
  const { s, go } = useGame();
  if (s.owned.length === 0) {
    return (
      <>
        <ScreenHead title="Doma v dílně" lead="Tady složíš počítač podle účtenky z obchodu." />
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
  const swDone = s.sw.done.length;
  return (
    <>
      <ScreenHead title="Doma v dílně" lead="Počítač je složený a systém nainstalovaný." />
      <div className="px-frame px-panel" style={{ display: 'grid', gap: 16, maxWidth: 680 }}>
        <p>{swDone ? `Nainstalované programy: ${swDone}.` : 'Ještě do něj nainstaluj základní programy.'}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button type="button" className="px-btn" onClick={() => go('software')}>Programy <Icon name="arrow" /></button>
          <button type="button" className="px-btn px-btn--dark" onClick={() => go('finish')}><Icon name="star" /> Výsledek</button>
        </div>
      </div>
    </>
  );
}

function Bench() {
  const { s, commit, update, go, toast, flags } = useGame();
  const lines = buildLines(s);
  const [heldKey, setHeldKey] = useState<string | null>(null);
  const [manualView, setManualView] = useState<View | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const dragRef = useRef<{ key: string; sx: number; sy: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const held = lines.find((l) => l.key === heldKey && l.status === 'ready') ?? null;
  const firstReady = lines.find((l) => l.status === 'ready') ?? null;
  const view: View = held?.view ?? manualView ?? firstReady?.view ?? 'board';
  const active = held ?? (firstReady && firstReady.view === view ? firstReady : null);
  const doneCount = lines.filter((l) => l.status === 'done').length;
  const total = lines.filter((l) => l.status !== 'extra').length;

  const tryPlace = (line: Line, target: TargetId) => {
    const d: GameState = structuredClone(s);
    const fresh = buildLines(d).find((l) => l.key === line.key);
    if (!fresh || fresh.status !== 'ready') return;
    const res = place(d, fresh, target);
    commit(d);
    setFeedback(res);
    setHeldKey(null);
    setManualView(null);
    // Hláška se ukáže v pruhu nad scénou, kam se žák právě dívá.
    sfx(res.ok ? 'place' : 'bad');
  };

  const runInstant = (line: Line) => {
    if (line.instant === 'panel') {
      update((d) => { d.asm.panel = true; });
      setFeedback({ ok: true, text: 'Bočnice je zavřená. Teď počítač otoč a zapoj monitor.' });
      sfx('place');
    } else if (line.instant === 'power') {
      sfx('power');
      update((d) => { d.postTries += 1; });
      go('post');
    }
  };

  const onLineClick = (line: Line) => {
    if (suppressClick.current) { suppressClick.current = false; return; }
    if (line.status !== 'ready') return;
    if (line.instant) { runInstant(line); return; }
    sfx('click');
    setManualView(null);
    setHeldKey(heldKey === line.key ? null : line.key);
  };

  const doReturn = (line: Line) => {
    const p = line.partId ? PART_BY_ID[line.partId] : null;
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

  const doRemove = (line: Line) => {
    update((d) => remove(d, line));
    setFeedback({ ok: true, text: `${line.label}: vyndáno. Bočnici jsi kvůli tomu otevřel.` });
  };

  // ——— Tažení z účtenky ———
  const onHandleDown = (line: Line, e: RPointerEvent<HTMLElement>) => {
    if (line.status !== 'ready' || line.instant || !line.sprite) return;
    dragRef.current = { key: line.key, sx: e.clientX, sy: e.clientY, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onHandleMove = (e: RPointerEvent<HTMLElement>) => {
    const dr = dragRef.current;
    if (!dr) return;
    if (!dr.moved && Math.hypot(e.clientX - dr.sx, e.clientY - dr.sy) < 6) return;
    if (!dr.moved) {
      dr.moved = true;
      setHeldKey(dr.key);
      setManualView(null);
    }
    const el = document.elementsFromPoint(e.clientX, e.clientY).find((x) => (x as HTMLElement).dataset?.target) as HTMLElement | undefined;
    setDrag({ key: dr.key, x: e.clientX, y: e.clientY, over: (el?.dataset.target as TargetId) ?? null });
  };
  const onHandleUp = () => {
    const dr = dragRef.current;
    dragRef.current = null;
    if (!dr?.moved) return;
    suppressClick.current = true;
    window.setTimeout(() => { suppressClick.current = false; }, 0);
    const over = drag?.over;
    const line = lines.find((l) => l.key === dr.key);
    setDrag(null);
    if (line && over) tryPlace(line, over);
  };

  // R = otočit procesor
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (active?.tool === 'rotate' && (e.key === 'r' || e.key === 'R') && !(e.target instanceof HTMLInputElement)) {
        update((d) => { d.asm.cpuRot = (((d.asm.cpuRot + 90) % 360) as Rot); });
      }
      if (e.key === 'Escape') setHeldKey(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const zoneIds: TargetId[] = flags.hitbox
    ? (Object.keys(TARGETS) as TargetId[]).filter((t) => TARGETS[t].view === view)
    : active ? [...active.targets, ...active.traps].filter((t) => TARGETS[t].view === view) : [];

  const hasCase = lines.some((l) => l.view === 'case' && l.status !== 'missing');
  const tabs: { id: View; enabled: boolean }[] = [
    { id: 'board', enabled: true },
    { id: 'case', enabled: hasCase },
    { id: 'back', enabled: s.asm.panel },
  ];

  const tip = feedback ?? (active ? { ok: true, text: active.sub ?? '' } : { ok: true, text: firstReady ? 'Pokračuj podle zvýrazněného řádku na účtence.' : 'Na účtence teď není nic, co by šlo udělat. Podívej se, co chybí.' });

  return (
    <>
      <ScreenHead
        title="Doma v dílně"
        lead="Skládej podle účtenky. Ťukni na zvýrazněný řádek a pak na svítící místo, nebo díl přetáhni."
      >
        <button type="button" className="px-btn px-btn--dark px-btn--small" onClick={() => setConfirmReset(true)}>
          Rozebrat všechno
        </button>
      </ScreenHead>

      <div className="ws">
        <aside className="receipt ws-receipt px-frame" aria-label="Účtenka a postup">
          <div className="receipt__head">
            <span className="receipt__shop">Účtenka</span>
            <span className="receipt__sub">Seřazeno podle montáže</span>
          </div>
          <ol className="ws-lines">
            {lines.map((l) => (
              <li key={l.key}>
                <button
                  type="button"
                  className={lineClass(l, active?.key === l.key, held?.key === l.key)}
                  disabled={l.status !== 'ready'}
                  aria-pressed={l.status === 'ready' && !l.instant ? held?.key === l.key : undefined}
                  onClick={() => onLineClick(l)}
                  onPointerDown={(e) => onHandleDown(l, e)}
                  onPointerMove={onHandleMove}
                  onPointerUp={onHandleUp}
                  onPointerCancel={() => { dragRef.current = null; setDrag(null); }}
                  style={l.status === 'ready' && l.sprite && !l.instant ? { touchAction: 'none' } : undefined}
                >
                  <span className="ws-line__mark"><Mark status={l.status} /></span>
                  <span className="ws-line__name">
                    <span>{l.label}</span>
                    {l.price ? <span className="t-num">{formatKc(l.price)}</span> : null}
                  </span>
                  {l.sub ? <span className="ws-line__sub">{l.sub}</span> : null}
                </button>
                {(l.status === 'block' || l.status === 'extra') && l.partId ? (
                  <button type="button" className="receipt__x" style={{ marginLeft: 42 }} onClick={() => doReturn(l)}>
                    Vrátit za {formatKc(refundOf(PART_BY_ID[l.partId]))}
                  </button>
                ) : null}
                {l.status === 'missing' ? (
                  <button type="button" className="receipt__x" style={{ marginLeft: 42 }} onClick={() => go('shop')}>
                    Do obchodu
                  </button>
                ) : null}
                {l.status === 'done' && l.removable && !s.asm.panel ? (
                  <button type="button" className="receipt__x" style={{ marginLeft: 42, color: 'var(--c-slate)' }} onClick={() => doRemove(l)}>
                    Vyndat
                  </button>
                ) : null}
              </li>
            ))}
          </ol>
          <div className="ws-progress"><span>Hotovo</span><span>{doneCount} z {total}</span></div>
        </aside>

        <section className="ws-scene" aria-label="Pracovní stůl">
          <div className="ws-scene__bar">
            <h2 className="ws-scene__title">{VIEW_TITLE[view]}</h2>
            <div role="tablist" aria-label="Pohled" style={{ display: 'flex', gap: 4 }}>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={view === t.id}
                  className="shop-tab"
                  disabled={!t.enabled}
                  onClick={() => { setHeldKey(null); setManualView(t.id); }}
                >
                  {t.id === 'board' ? 'Deska' : t.id === 'case' ? 'Skříň' : 'Záda'}
                </button>
              ))}
            </div>
          </div>

          <div className="ws-tip px-frame" style={{ ['--line' as string]: tip.ok ? 'var(--c-slate)' : 'var(--c-orange)' }} aria-live="polite">
            <Icon name={tip.ok ? (feedback ? 'check' : 'info') : 'warn'} />
            <p>{tip.text}</p>
          </div>
          <div className="ws-stage px-frame">
            <PixelStage artW={SCENE_W} artH={SCENE_H} reserveH={290} maxScale={5}>
              {(scale) => (
                <>
                  <svg width={SCENE_W * scale} height={SCENE_H * scale} viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} shapeRendering="crispEdges" aria-hidden="true">
                    {view === 'board' ? <BoardScene s={s} /> : view === 'case' ? <CaseScene s={s} /> : <BackScene s={s} />}
                  </svg>
                  {zoneIds.map((id) => {
                    const t = TARGETS[id];
                    const hb = hitBox(t, scale);
                    const isTrap = !!active?.traps.includes(id);
                    const over = drag?.over === id;
                    const cls = ['drop', flags.hitbox ? 'drop--debug' : '', over ? (isTrap ? 'drop--nope' : 'drop--over') : 'drop--target'].join(' ');
                    return (
                      <button
                        key={id}
                        type="button"
                        data-target={id}
                        className={cls}
                        style={{ left: hb.left, top: hb.top, width: hb.width, height: hb.height }}
                        aria-label={active ? `${active.label}: dát na ${t.label}` : t.label}
                        onClick={() => { if (active) tryPlace(active, id); }}
                      >
                        <span className="drop__ring" style={{ left: hb.ring.left, top: hb.ring.top, width: hb.ring.width, height: hb.ring.height }} />
                        {id !== 'mat' && id !== 'panel' && id !== 'standoffs' && id !== 'cpu-top' ? (
                          <span className={`drop__label${t.labelTop ? ' drop__label--top' : ''}`}>{t.label}</span>
                        ) : null}
                      </button>
                    );
                  })}
                  {drag ? <Ghost line={lines.find((l) => l.key === drag.key)} x={drag.x} y={drag.y} scale={scale} rot={s.asm.cpuRot} /> : null}
                </>
              )}
            </PixelStage>
          </div>

          {active ? <Tools line={active} onInstant={runInstant} /> : null}
        </section>
      </div>

      {confirmReset ? (
        <Dialog
          title="Rozebrat počítač?"
          onClose={() => setConfirmReset(false)}
          actions={
            <>
              <button type="button" className="px-btn px-btn--dark px-btn--small" onClick={() => setConfirmReset(false)}>Ne</button>
              <button type="button" className="px-btn px-btn--bad px-btn--small" onClick={() => { update((d) => resetAsm(d)); setConfirmReset(false); setFeedback(null); }}>
                Rozebrat
              </button>
            </>
          }
        >
          <p>Všechny díly se vrátí na účtenku a můžeš skládat znovu. Nic se neztratí ani nezaplatí.</p>
        </Dialog>
      ) : null}
    </>
  );
}

function lineClass(l: Line, isActive: boolean, isHeld: boolean): string {
  const c = ['ws-line'];
  if (l.status === 'done') c.push('ws-line--done');
  if (l.status === 'block') c.push('ws-line--block');
  if (isHeld) c.push('ws-line--held');
  else if (isActive) c.push('ws-line--now');
  return c.join(' ');
}

const MARK: Record<Line['status'], { icon: IconKey; tint: PalKey }> = {
  done: { icon: 'check', tint: 'teal' },
  ready: { icon: 'arrow', tint: 'night' },
  wait: { icon: 'arrow', tint: 'silver' },
  block: { icon: 'cross', tint: 'red' },
  extra: { icon: 'box', tint: 'slate' },
  missing: { icon: 'warn', tint: 'red' },
};

function Mark({ status }: { status: Line['status'] }) {
  const m = MARK[status];
  return <ArtSvg art={ICONS[m.icon]} scale={2} tint={m.tint} title={STATUS_LABEL[status]} />;
}

const STATUS_LABEL: Record<Line['status'], string> = {
  done: 'hotovo', ready: 'na řadě', wait: 'čeká', block: 'nepasuje', extra: 'navíc', missing: 'chybí',
};

function Ghost({ line, x, y, scale, rot }: { line?: Line; x: number; y: number; scale: number; rot: Rot }) {
  if (!line?.sprite) return null;
  const art = SPRITES[line.sprite];
  const sc = Math.max(2, Math.min(scale, line.sprite === 'mb' || line.sprite === 'gpu' ? 3 : scale));
  return (
    <div className="ghost" style={{ transform: `translate(${x - (art.w * sc) / 2}px, ${y - (art.h * sc) / 2}px)` }}>
      <ArtSvg art={art} scale={sc} rotate={line.sprite === 'cpu' ? rot : 0} />
    </div>
  );
}

function Tools({ line, onInstant }: { line: Line; onInstant: (l: Line) => void }) {
  const { s, update, toast } = useGame();

  if (line.tool === 'rotate') {
    return (
      <div className="ws-choice px-frame">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
          <div style={{ padding: 12, background: 'var(--c-night)' }}>
            <Sprite name="cpu" scale={6} rotate={s.asm.cpuRot} title="Procesor v ruce" />
          </div>
          <div style={{ display: 'grid', gap: 8, maxWidth: '44ch' }}>
            <p>Zlatý trojúhelník na procesoru musí být vlevo dole, stejně jako značka na patici.</p>
            <div className="ws-choice__opts">
              <button type="button" className="px-btn px-btn--small" onClick={() => { sfx('click'); update((d) => { d.asm.cpuRot = (((d.asm.cpuRot + 90) % 360) as Rot); }); }}>
                <Icon name="rotate" /> Otočit o 90°
              </button>
            </div>
            <p className="t-muted t-16">Klávesa R otočí procesor taky.</p>
          </div>
        </div>
      </div>
    );
  }

  if (line.tool === 'paste') {
    const pick = (ok: boolean, text: string) => {
      if (ok) {
        sfx('place');
        update((d) => { d.asm.paste = true; });
        toast('ok', text);
      } else {
        sfx('bad');
        update((d) => addNote(d, 'mistake', 'Špatné množství teplovodivé pasty.'));
        toast('bad', text);
      }
    };
    return (
      <div className="ws-choice px-frame">
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Sprite name="paste" scale={5} />
          <p className="t-pixel t-20">Kolik teplovodivé pasty naneseš na procesor?</p>
        </div>
        <div className="ws-choice__opts">
          <button type="button" className="px-btn px-btn--small px-btn--dark" onClick={() => pick(true, 'Přesně tak. Kapka velká jako hrášek se po přitlačení chladiče sama rozprostře.')}>
            Kapku velkou jako hrášek
          </button>
          <button type="button" className="px-btn px-btn--small px-btn--dark" onClick={() => pick(false, 'Moc! Pasta by vytekla kolem procesoru na desku. Stačí kapka jako hrášek.')}>
            Celou tubu, ať to chladí
          </button>
          <button type="button" className="px-btn px-btn--small px-btn--dark" onClick={() => pick(false, 'Bez pasty zůstane mezi procesorem a chladičem vzduch, který vede teplo špatně. Procesor by se přehříval.')}>
            Žádnou, chladič stačí
          </button>
        </div>
      </div>
    );
  }

  if (line.instant) {
    return (
      <div className="ws-choice px-frame">
        <button type="button" className={`px-btn ${line.instant === 'power' ? 'px-btn--ok' : ''}`} onClick={() => onInstant(line)}>
          <Icon name={line.instant === 'power' ? 'power' : 'check'} /> {line.instant === 'power' ? 'Zapnout počítač' : 'Nasadit bočnici'}
        </button>
      </div>
    );
  }

  if (!line.sprite) return null;
  return (
    <div className="ws-choice px-frame" style={{ gridTemplateColumns: 'auto 1fr', alignItems: 'center' }}>
      <div style={{ padding: 10, background: 'var(--c-night)', display: 'grid', placeItems: 'center' }}>
        <Sprite name={line.sprite} scale={line.sprite === 'gpu' || line.sprite === 'ram' || line.sprite === 'ramDdr4' || line.sprite === 'mb' ? 3 : 4} />
      </div>
      <p className="t-16">
        <b>{line.label}</b>. Ťukni na svítící místo ve scéně, nebo díl přetáhni ze řádku účtenky.
      </p>
    </div>
  );
}
