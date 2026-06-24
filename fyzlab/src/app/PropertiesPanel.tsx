/**
 * Panel vlastností (vpravo): SI jednotky, přesné hodnoty, presety materiálů.
 * Bez výběru ukazuje svět (gravitaci). Čísla se commitují na Enter/blur jako
 * undoable Command; slidery jdou transientně a commit má undo z počátku tahu.
 * Funguje i za běhu simulace (live-edit).
 */
import { useCallback, useRef, useState, useSyncExternalStore } from 'react';
import { cmdReplaceEntity, cmdSetKinematics, cmdSetWorld, kinematicsOf } from '@editor/commands';
import type { DocumentStore } from '@editor/DocumentStore';
import type { DocOp, TransformPatch, VelocityPatch } from '@engine/scene/ops';
import { MATERIAL_PRESETS, type MaterialPreset } from '@engine/scene/materials';
import type { Body, Entity, Instrument, Joint } from '@engine/scene/schema';
import type { Runtime } from './bootstrap';
import { useUiStore } from './store/uiStore';
import { t } from './i18n/t';
import type { MsgKey } from './i18n/cs';

const MAT_LABEL: Record<string, MsgKey> = {
  wood: 'matWood',
  steel: 'matSteel',
  ice: 'matIce',
  rubber: 'matRubber',
  glass: 'matGlass',
  stone: 'matStone',
  foam: 'matFoam',
  gold: 'matGold',
  helium: 'matHelium',
};

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#64748b',
  '#1f2937',
];

const DEG = 180 / Math.PI;

/** Zaokrouhlení pro zobrazení (f32 šum: −1.2000000476 → −1.2). */
function fmt(v: number): string {
  const r = Math.round(v * 1000) / 1000;
  return String(Object.is(r, -0) ? 0 : r);
}

/** Překreslit panel při každé změně výběru/dokumentu/snapshotu. */
export function useEditorVersion(rt: Runtime): number {
  const counter = useRef(0);
  const subscribe = useCallback(
    (notify: () => void) => {
      const u1 = rt.state.subscribe(() => {
        counter.current += 1;
        notify();
      });
      const u2 = rt.controller.store.subscribe(() => {
        counter.current += 1;
        notify();
      });
      return () => {
        u1();
        u2();
      };
    },
    [rt],
  );
  return useSyncExternalStore(subscribe, () => counter.current);
}

// ---------------------------------------------------------------------------
// Stavební prvky
// ---------------------------------------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h3 className="text-[11px] font-bold tracking-wide text-slate-400 uppercase">{title}</h3>
      {children}
    </section>
  );
}

function NumberField({
  label,
  unit,
  value,
  step = 0.1,
  onCommit,
}: {
  label: string;
  unit?: string;
  value: number;
  step?: number;
  onCommit: (v: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const v = Number(draft.replace(',', '.'));
    setDraft(null);
    if (Number.isFinite(v) && v !== value) onCommit(v);
  };

  return (
    <label className="flex items-center justify-between gap-2 text-xs text-slate-600">
      <span className="whitespace-nowrap">{label}</span>
      <span className="flex items-center gap-1">
        <input
          type="number"
          className="w-20 rounded-md border border-slate-200 bg-white px-1.5 py-1 text-right text-xs tabular-nums focus:border-blue-400 focus:outline-none"
          value={draft ?? fmt(value)}
          step={step}
          onChange={(e) => setDraft(e.target.value)}
          onFocus={() => setDraft(fmt(value))}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commit();
              e.currentTarget.blur();
            } else if (e.key === 'Escape') {
              setDraft(null);
              e.currentTarget.blur();
            }
          }}
        />
        <span className="w-9 text-[10px] text-slate-400">{unit ?? ''}</span>
      </span>
    </label>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onTransient,
  onCommit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  /** Živá změna během tahu (bez undo záznamu). */
  onTransient: (v: number) => void;
  /** Konec tahu: hodnota z počátku tahu → finální (jeden undo krok). */
  onCommit: (start: number, end: number) => void;
}) {
  const start = useRef<number | null>(null);
  const last = useRef(value);

  return (
    <label className="block text-xs text-slate-600">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="text-slate-400 tabular-nums">{fmt(value)}</span>
      </span>
      <input
        type="range"
        className="w-full accent-blue-600"
        min={min}
        max={max}
        step={step}
        value={value}
        onPointerDown={() => {
          start.current = value;
          last.current = value;
        }}
        onChange={(e) => {
          const v = Number(e.target.value);
          last.current = v;
          if (start.current !== null) onTransient(v);
          else onCommit(value, v); // klávesnice — rovnou commit
        }}
        onPointerUp={() => {
          if (start.current !== null && last.current !== start.current) {
            onCommit(start.current, last.current);
          }
          start.current = null;
        }}
      />
    </label>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2 py-1 text-[11px] transition select-none active:scale-95 ${
        active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  );
}

function ColorSwatches({ value, onPick }: { value: string; onPick: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {COLORS.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={c}
          onClick={() => onPick(c)}
          className={`h-6 w-6 rounded-full ring-2 transition active:scale-90 ${
            value.toLowerCase() === c ? 'ring-blue-500' : 'ring-transparent hover:ring-slate-300'
          }`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sekce: svět / těleso / kloub / multi-výběr
// ---------------------------------------------------------------------------

function WorldSection({ store }: { store: DocumentStore }) {
  const g = store.doc.world.gravity;
  const air = store.doc.world.airDensity;
  const setGravity = (down: number) => {
    store.apply(cmdSetWorld(t('propGravity'), { gravity: g }, { gravity: { x: 0, y: -down } }));
  };
  const setAir = (rho: number) => {
    if (rho < 0) return;
    store.apply(cmdSetWorld(t('propAir'), { airDensity: air }, { airDensity: rho }));
  };
  return (
    <Section title={t('propWorld')}>
      <NumberField label={t('propGravity')} unit="m/s²" value={-g.y} step={0.1} onCommit={setGravity} />
      <div className="flex flex-wrap gap-1.5">
        <Chip label={`${t('presetEarth')} 9,81`} active={Math.abs(-g.y - 9.81) < 1e-9} onClick={() => setGravity(9.81)} />
        <Chip label={`${t('presetMoon')} 1,62`} active={Math.abs(-g.y - 1.62) < 1e-9} onClick={() => setGravity(1.62)} />
        <Chip label={t('presetZeroG')} active={g.y === 0} onClick={() => setGravity(0)} />
      </div>
      <NumberField label={t('propAir')} unit="kg/m³" value={air} step={0.1} onCommit={setAir} />
      <div className="flex flex-wrap gap-1.5">
        <Chip label={t('presetVacuum')} active={air === 0} onClick={() => setAir(0)} />
        <Chip label={`${t('presetAir')} 1,2`} active={Math.abs(air - 1.2) < 1e-9} onClick={() => setAir(1.2)} />
      </div>
    </Section>
  );
}

function presetChips(current: { density: number; friction: number; restitution: number }, apply: (p: MaterialPreset) => void) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {MATERIAL_PRESETS.map((p) => (
        <Chip
          key={p.id}
          label={t(MAT_LABEL[p.id] ?? 'propMaterial')}
          active={
            current.density === p.density &&
            current.friction === p.friction &&
            current.restitution === p.restitution
          }
          onClick={() => apply(p)}
        />
      ))}
    </div>
  );
}

function BodySection({ store, body, runtime }: { store: DocumentStore; body: Body; runtime: Runtime }) {
  const plotBodyId = useUiStore((s) => s.plotBodyId);
  const fbdBodyId = useUiStore((s) => s.fbdBodyId);
  const isTracking = plotBodyId === body.id;
  const isFbd = fbdBodyId === body.id;
  const isPlane = body.shapes.some((s) => s.type === 'plane');

  const replace = (label: string, after: Body) => store.apply(cmdReplaceEntity(label, body, after));

  const setTransform = (patch: Partial<TransformPatch>) => {
    const before = kinematicsOf(store.doc, body.id);
    if (!before) return;
    store.apply(
      cmdSetKinematics(t('propPosition'), body.id, before, {
        transform: { ...before.transform, ...patch },
      }),
    );
  };
  const setVelocity = (patch: Partial<VelocityPatch>) => {
    const before = kinematicsOf(store.doc, body.id);
    if (!before) return;
    store.apply(
      cmdSetKinematics(t('propVelocity'), body.id, before, {
        velocity: { ...before.velocity, ...patch },
      }),
    );
  };

  const transientMaterial = (patch: Partial<Body['material']>) => {
    const e = store.doc.entities.find((x) => x.id === body.id);
    if (!e || e.kind !== 'body') return;
    const op: DocOp = {
      op: 'replaceEntity',
      entity: { ...e, material: { ...e.material, ...patch } },
    };
    store.applyTransient([op]);
  };
  const commitMaterial = (key: 'friction' | 'restitution', start: number, end: number) => {
    const e = store.doc.entities.find((x) => x.id === body.id);
    if (!e || e.kind !== 'body') return;
    store.apply(
      cmdReplaceEntity(
        key === 'friction' ? t('propFriction') : t('propRestitution'),
        { ...e, material: { ...e.material, [key]: start } },
        { ...e, material: { ...e.material, [key]: end } },
      ),
    );
  };

  return (
    <>
      <Section title={t('propBody')}>
        {!isPlane && (
          <div className="flex gap-1.5">
            <Chip
              label={t('typeDynamic')}
              active={body.bodyType === 'dynamic'}
              onClick={() =>
                body.bodyType !== 'dynamic' && replace(t('typeDynamic'), { ...body, bodyType: 'dynamic' })
              }
            />
            <Chip
              label={t('typeStatic')}
              active={body.bodyType === 'static'}
              onClick={() =>
                body.bodyType !== 'static' &&
                replace(t('typeStatic'), {
                  ...body,
                  bodyType: 'static',
                  velocity: { vx: 0, vy: 0, omega: 0 },
                })
              }
            />
          </div>
        )}
        <NumberField label="x" unit="m" value={body.transform.x} onCommit={(v) => setTransform({ x: v })} />
        <NumberField label="y" unit="m" value={body.transform.y} onCommit={(v) => setTransform({ y: v })} />
        <NumberField
          label={t('propAngle')}
          unit="°"
          value={body.transform.angle * DEG}
          step={5}
          onCommit={(v) => setTransform({ angle: v / DEG })}
        />
        {body.bodyType === 'dynamic' && (
          <>
            <NumberField label="vₓ" unit="m/s" value={body.velocity.vx} onCommit={(v) => setVelocity({ vx: v })} />
            <NumberField label="v_y" unit="m/s" value={body.velocity.vy} onCommit={(v) => setVelocity({ vy: v })} />
            <NumberField
              label="ω"
              unit="rad/s"
              value={body.velocity.omega}
              onCommit={(v) => setVelocity({ omega: v })}
            />
          </>
        )}
      </Section>

      {!isPlane && (
        <Section title={t('propMaterial')}>
          {presetChips(body.material, (p) =>
            replace(t('propMaterial'), {
              ...body,
              material: { density: p.density, friction: p.friction, restitution: p.restitution },
              appearance: { ...body.appearance, fill: p.fill },
            }),
          )}
          <NumberField
            label={t('propDensity')}
            unit="kg/m²"
            value={body.material.density}
            step={10}
            onCommit={(v) =>
              v > 0 && replace(t('propDensity'), { ...body, material: { ...body.material, density: v } })
            }
          />
          <SliderField
            label={t('propFriction')}
            value={body.material.friction}
            min={0}
            max={1.5}
            step={0.01}
            onTransient={(v) => transientMaterial({ friction: v })}
            onCommit={(s, e) => commitMaterial('friction', s, e)}
          />
          <SliderField
            label={t('propRestitution')}
            value={body.material.restitution}
            min={0}
            max={1}
            step={0.01}
            onTransient={(v) => transientMaterial({ restitution: v })}
            onCommit={(s, e) => commitMaterial('restitution', s, e)}
          />
        </Section>
      )}

      <Section title={t('propColor')}>
        <ColorSwatches
          value={body.appearance.fill}
          onPick={(c) =>
            replace(t('propColor'), { ...body, appearance: { ...body.appearance, fill: c } })
          }
        />
        {body.bodyType === 'dynamic' && (
          <label className="flex items-center justify-between text-xs text-slate-600">
            <span>{t('showVelocityBody')}</span>
            <input
              type="checkbox"
              className="h-4 w-4 accent-blue-600"
              checked={body.appearance.showVelocity}
              onChange={(e) =>
                replace(t('showVelocityBody'), {
                  ...body,
                  appearance: { ...body.appearance, showVelocity: e.target.checked },
                })
              }
            />
          </label>
        )}
      </Section>

      {body.bodyType === 'dynamic' && (
        <button
          type="button"
          onClick={() => {
            const ui = useUiStore.getState();
            ui.clearPlotBuffer();
            ui.setPlotBodyId(body.id);
            runtime.client.setRecordBodyId(body.id);
          }}
          className={`w-full rounded-lg px-2 py-1.5 text-xs transition select-none active:scale-95 ${
            isTracking
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isTracking ? '● ' : ''}{t('plotTrack')}
        </button>
      )}

      {body.bodyType === 'dynamic' && (
        <button
          type="button"
          onClick={() => {
            const ui = useUiStore.getState();
            const next = isFbd ? null : body.id;
            ui.setFbdBodyId(next);
            runtime.client.setFbdBodyId(next);
          }}
          className={`w-full rounded-lg px-2 py-1.5 text-xs transition select-none active:scale-95 ${
            isFbd ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isFbd ? '● ' : ''}{t('fbdTrack')}
        </button>
      )}
    </>
  );
}

function JointSection({ store, joint }: { store: DocumentStore; joint: Joint }) {
  const replace = (label: string, after: Joint) => store.apply(cmdReplaceEntity(label, joint, after));

  if (joint.type === 'axle') {
    const axle = joint.axle ?? { enabled: false, targetVelocity: 5, maxTorque: 50 };
    const setAxle = (label: string, patch: Partial<typeof axle>) =>
      replace(label, { ...joint, axle: { ...axle, ...patch } });
    return (
      <Section title={t('propJointAxle')}>
        <label className="flex items-center justify-between text-xs text-slate-600">
          <span>{t('motorEnabled')}</span>
          <input
            type="checkbox"
            className="h-4 w-4 accent-blue-600"
            checked={axle.enabled}
            onChange={(e) => setAxle(t('motorEnabled'), { enabled: e.target.checked })}
          />
        </label>
        <NumberField
          label={t('motorTarget')}
          unit="rad/s"
          value={axle.targetVelocity}
          step={0.5}
          onCommit={(v) => setAxle(t('motorTarget'), { targetVelocity: v })}
        />
        <NumberField
          label={t('motorTorque')}
          unit="N·m"
          value={axle.maxTorque}
          step={10}
          onCommit={(v) => v > 0 && setAxle(t('motorTorque'), { maxTorque: v })}
        />
      </Section>
    );
  }

  if (joint.type === 'spring') {
    const spring = joint.spring ?? { restLength: 0.5, stiffness: 100, damping: 1 };
    const setSpring = (label: string, patch: Partial<typeof spring>) =>
      replace(label, { ...joint, spring: { ...spring, ...patch } });
    return (
      <Section title={t('propJointSpring')}>
        <NumberField
          label={t('springRest')}
          unit="m"
          value={spring.restLength}
          onCommit={(v) => v >= 0 && setSpring(t('springRest'), { restLength: v })}
        />
        <NumberField
          label={t('springStiffness')}
          unit="N/m"
          value={spring.stiffness}
          step={10}
          onCommit={(v) => v > 0 && setSpring(t('springStiffness'), { stiffness: v })}
        />
        <NumberField
          label={t('springDamping')}
          unit="N·s/m"
          value={spring.damping}
          step={1}
          onCommit={(v) => v >= 0 && setSpring(t('springDamping'), { damping: v })}
        />
      </Section>
    );
  }

  if (joint.type === 'thruster') {
    const thruster = joint.thruster ?? { enabled: true, fx: 0, fy: 20 };
    const setThruster = (label: string, patch: Partial<typeof thruster>) =>
      replace(label, { ...joint, thruster: { ...thruster, ...patch } });
    return (
      <Section title={t('propJointThruster')}>
        <label className="flex items-center justify-between text-xs text-slate-600">
          <span>{t('thrusterEnabled')}</span>
          <input
            type="checkbox"
            className="h-4 w-4 accent-blue-600"
            checked={thruster.enabled}
            onChange={(e) => setThruster(t('thrusterEnabled'), { enabled: e.target.checked })}
          />
        </label>
        <NumberField
          label={t('thrusterFx')}
          unit="N"
          value={thruster.fx}
          step={1}
          onCommit={(v) => setThruster(t('thrusterFx'), { fx: v })}
        />
        <NumberField
          label={t('thrusterFy')}
          unit="N"
          value={thruster.fy}
          step={1}
          onCommit={(v) => setThruster(t('thrusterFy'), { fy: v })}
        />
      </Section>
    );
  }

  return (
    <Section title={t('propJointFixed')}>
      <p className="text-xs text-slate-500">{t('fixedInfo')}</p>
    </Section>
  );
}

function InstrumentSection({
  store,
  instrument,
}: {
  store: DocumentStore;
  instrument: Instrument;
}) {
  const replace = (label: string, after: Instrument) =>
    store.apply(cmdReplaceEntity(label, instrument, after));
  const tf = instrument.transform;
  return (
    <Section title={t('propPhotogate')}>
      <NumberField
        label="x"
        unit="m"
        value={tf.x}
        onCommit={(v) => replace(t('propPosition'), { ...instrument, transform: { ...tf, x: v } })}
      />
      <NumberField
        label="y"
        unit="m"
        value={tf.y}
        onCommit={(v) => replace(t('propPosition'), { ...instrument, transform: { ...tf, y: v } })}
      />
      <NumberField
        label={t('propAngle')}
        unit="°"
        value={tf.angle * DEG}
        step={5}
        onCommit={(v) =>
          replace(t('propAngle'), { ...instrument, transform: { ...tf, angle: v / DEG } })
        }
      />
      <NumberField
        label={t('gateHalfLength')}
        unit="m"
        value={instrument.gate.halfLength}
        onCommit={(v) =>
          v > 0 && replace(t('gateHalfLength'), { ...instrument, gate: { halfLength: v } })
        }
      />
    </Section>
  );
}

function MultiSection({ store, entities }: { store: DocumentStore; entities: Entity[] }) {
  const bodies = entities.filter((e): e is Body => e.kind === 'body');

  const applyAll = (label: string, map: (b: Body) => Body) => {
    const doOps: DocOp[] = [];
    const undoOps: DocOp[] = [];
    for (const b of bodies) {
      doOps.push({ op: 'replaceEntity', entity: map(b) });
      undoOps.push({ op: 'replaceEntity', entity: b });
    }
    if (doOps.length) store.apply({ label, do: doOps, undo: undoOps });
  };

  return (
    <>
      <Section title={`${t('selectionCount')}: ${entities.length}`}>
        {bodies.length > 0 &&
          presetChips({ density: -1, friction: -1, restitution: -1 }, (p) =>
            applyAll(t('propMaterial'), (b) => ({
              ...b,
              material: { density: p.density, friction: p.friction, restitution: p.restitution },
              appearance: { ...b.appearance, fill: p.fill },
            })),
          )}
      </Section>
      {bodies.length > 0 && (
        <Section title={t('propColor')}>
          <ColorSwatches
            value=""
            onPick={(c) =>
              applyAll(t('propColor'), (b) => ({ ...b, appearance: { ...b.appearance, fill: c } }))
            }
          />
        </Section>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------

export function PropertiesPanel({ runtime }: { runtime: Runtime }) {
  useEditorVersion(runtime);
  const store = runtime.controller.store;

  const entities: Entity[] = [];
  for (const id of runtime.state.selection) {
    const e = store.doc.entities.find((x) => x.id === id);
    if (e) entities.push(e);
  }

  let content: React.ReactNode;
  if (entities.length === 0) {
    content = <WorldSection store={store} />;
  } else if (entities.length === 1) {
    const e = entities[0]!;
    content =
      e.kind === 'body' ? (
        <BodySection store={store} body={e} runtime={runtime} />
      ) : e.kind === 'joint' ? (
        <JointSection store={store} joint={e} />
      ) : e.kind === 'instrument' ? (
        <InstrumentSection store={store} instrument={e} />
      ) : (
        null
      );
  } else {
    content = <MultiSection store={store} entities={entities} />;
  }

  return (
    <div className="pointer-events-auto max-h-[72vh] w-60 space-y-3 overflow-y-auto rounded-2xl bg-white/90 p-3 shadow-lg ring-1 ring-slate-200 backdrop-blur">
      {content}
    </div>
  );
}
