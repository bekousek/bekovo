/**
 * Panel vlastností (vpravo): SI jednotky, přesné hodnoty, presety materiálů.
 * Bez výběru ukazuje svět (gravitaci). Čísla se commitují na Enter/blur jako
 * undoable Command; slidery jdou transientně a commit má undo z počátku tahu.
 * Funguje i za běhu simulace (live-edit).
 */
import { useCallback, useRef, useSyncExternalStore } from 'react';
import { Activity, Crosshair } from 'lucide-react';
import { cmdReplaceEntity, cmdSetKinematics, cmdSetWorld, kinematicsOf } from '@editor/commands';
import type { DocumentStore } from '@editor/DocumentStore';
import type { DocOp, TransformPatch, VelocityPatch } from '@engine/scene/ops';
import { MATERIAL_PRESETS, type MaterialPreset } from '@engine/scene/materials';
import type { Body, BodyOptics, Entity, Fluid, Instrument, Joint, OpticalSource } from '@engine/scene/schema';
import type { Runtime } from './bootstrap';
import { useUiStore } from './store/uiStore';
import { t } from './i18n/t';
import type { MsgKey } from './i18n/cs';
import { Panel, Section, Field, NumberInput, Slider, Chip, Swatch, Button } from './ui';

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

/** Vlnové délky s odpovídajícími barvami pro vizuální identifikaci. */
const WL_PRESETS = [
  { label: '405 nm', value: 405, dot: '#8b00ff' },
  { label: '450 nm', value: 450, dot: '#2255ff' },
  { label: '550 nm', value: 550, dot: '#22cc44' },
  { label: '589 nm', value: 589, dot: '#ffd700' },
  { label: '650 nm', value: 650, dot: '#ff2222' },
];

const DEG = 180 / Math.PI;

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
      <Field label={t('propGravity')} unit="m/s²">
        <NumberInput value={-g.y} step={0.1} onCommit={setGravity} />
      </Field>
      <div className="flex flex-wrap gap-1.5">
        <Chip active={Math.abs(-g.y - 9.81) < 1e-9} onClick={() => setGravity(9.81)}>
          {t('presetEarth')} 9,81
        </Chip>
        <Chip active={Math.abs(-g.y - 1.62) < 1e-9} onClick={() => setGravity(1.62)}>
          {t('presetMoon')} 1,62
        </Chip>
        <Chip active={g.y === 0} onClick={() => setGravity(0)}>
          {t('presetZeroG')}
        </Chip>
      </div>
      <Field label={t('propAir')} unit="kg/m³">
        <NumberInput value={air} step={0.1} onCommit={setAir} />
      </Field>
      <div className="flex flex-wrap gap-1.5">
        <Chip active={air === 0} onClick={() => setAir(0)}>
          {t('presetVacuum')}
        </Chip>
        <Chip active={Math.abs(air - 1.2) < 1e-9} onClick={() => setAir(1.2)}>
          {t('presetAir')} 1,2
        </Chip>
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
          active={
            current.density === p.density &&
            current.friction === p.friction &&
            current.restitution === p.restitution
          }
          onClick={() => apply(p)}
        >
          {t(MAT_LABEL[p.id] ?? 'propMaterial')}
        </Chip>
      ))}
    </div>
  );
}

function BodyOpticsSection({ store, body }: { store: DocumentStore; body: Body }) {
  const replace = (label: string, after: Body) => store.apply(cmdReplaceEntity(label, body, after));
  const optics = body.optics;

  const DEFAULT_OPTICS: BodyOptics = {
    mode: 'glass',
    refractiveIndex: 1.5,
    cauchyB: 0,
    reflectivity: 0.04,
    focalLength: 1.0,
  };

  const MODES: { id: BodyOptics['mode']; label: string }[] = [
    { id: 'mirror', label: t('opticsMirror') },
    { id: 'glass', label: t('opticsGlass') },
    { id: 'absorb', label: t('opticsAbsorb') },
    { id: 'lens', label: t('opticsLens') },
  ];

  return (
    <Section title={t('propBodyOptics')}>
      <Field label={t('opticsEnabled')}>
        <input
          type="checkbox"
          className="h-4 w-4 accent-[var(--accent)]"
          checked={!!optics}
          onChange={(e) =>
            replace(t('opticsEnabled'), {
              ...body,
              optics: e.target.checked ? DEFAULT_OPTICS : undefined,
            })
          }
        />
      </Field>
      {optics && (
        <>
          <p className="text-[11px] font-medium [color:var(--text-muted)]">{t('opticsMode')}</p>
          <div className="flex flex-wrap gap-1.5">
            {MODES.map(({ id, label }) => (
              <Chip
                key={id}
                active={optics.mode === id}
                onClick={() =>
                  optics.mode !== id && replace(t('opticsMode'), { ...body, optics: { ...optics, mode: id } })
                }
              >
                {label}
              </Chip>
            ))}
          </div>
          {optics.mode === 'glass' && (
            <>
              <Field label={t('opticsRefIndex')}>
                <NumberInput
                  value={optics.refractiveIndex}
                  step={0.05}
                  onCommit={(v) =>
                    v >= 1 && v <= 3 && replace(t('opticsRefIndex'), { ...body, optics: { ...optics, refractiveIndex: v } })
                  }
                />
              </Field>
              <Field label={t('opticsCauchyB')} unit="µm²">
                <NumberInput
                  value={optics.cauchyB}
                  step={0.005}
                  onCommit={(v) =>
                    v >= 0 && replace(t('opticsCauchyB'), { ...body, optics: { ...optics, cauchyB: v } })
                  }
                />
              </Field>
            </>
          )}
          {optics.mode === 'lens' && (
            <Field label={t('opticsFocalLength')} unit="m">
              <NumberInput
                value={optics.focalLength}
                step={0.1}
                onCommit={(v) =>
                  v !== 0 && replace(t('opticsFocalLength'), { ...body, optics: { ...optics, focalLength: v } })
                }
              />
            </Field>
          )}
          {optics.mode !== 'lens' && (
            <Field label={t('opticsReflectivity')}>
              <NumberInput
                value={optics.reflectivity}
                step={0.05}
                onCommit={(v) =>
                  v >= 0 && v <= 1 && replace(t('opticsReflectivity'), { ...body, optics: { ...optics, reflectivity: v } })
                }
              />
            </Field>
          )}
        </>
      )}
    </Section>
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
              active={body.bodyType === 'dynamic'}
              onClick={() =>
                body.bodyType !== 'dynamic' && replace(t('typeDynamic'), { ...body, bodyType: 'dynamic' })
              }
            >
              {t('typeDynamic')}
            </Chip>
            <Chip
              active={body.bodyType === 'static'}
              onClick={() =>
                body.bodyType !== 'static' &&
                replace(t('typeStatic'), {
                  ...body,
                  bodyType: 'static',
                  velocity: { vx: 0, vy: 0, omega: 0 },
                })
              }
            >
              {t('typeStatic')}
            </Chip>
          </div>
        )}
        <Field label="x" unit="m">
          <NumberInput value={body.transform.x} onCommit={(v) => setTransform({ x: v })} />
        </Field>
        <Field label="y" unit="m">
          <NumberInput value={body.transform.y} onCommit={(v) => setTransform({ y: v })} />
        </Field>
        <Field label={t('propAngle')} unit="°">
          <NumberInput
            value={body.transform.angle * DEG}
            step={5}
            onCommit={(v) => setTransform({ angle: v / DEG })}
          />
        </Field>
        {body.bodyType === 'dynamic' && (
          <>
            <Field label="vₓ" unit="m/s">
              <NumberInput value={body.velocity.vx} onCommit={(v) => setVelocity({ vx: v })} />
            </Field>
            <Field label="v_y" unit="m/s">
              <NumberInput value={body.velocity.vy} onCommit={(v) => setVelocity({ vy: v })} />
            </Field>
            <Field label="ω" unit="rad/s">
              <NumberInput value={body.velocity.omega} onCommit={(v) => setVelocity({ omega: v })} />
            </Field>
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
          <Field label={t('propDensity')} unit="kg/m²">
            <NumberInput
              value={body.material.density}
              step={10}
              onCommit={(v) =>
                v > 0 && replace(t('propDensity'), { ...body, material: { ...body.material, density: v } })
              }
            />
          </Field>
          <Slider
            label={t('propFriction')}
            value={body.material.friction}
            min={0}
            max={1.5}
            step={0.01}
            onTransient={(v) => transientMaterial({ friction: v })}
            onCommit={(s, e) => commitMaterial('friction', s, e)}
          />
          <Slider
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
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((c) => (
            <Swatch
              key={c}
              color={c}
              active={body.appearance.fill.toLowerCase() === c}
              onClick={() =>
                replace(t('propColor'), { ...body, appearance: { ...body.appearance, fill: c } })
              }
            />
          ))}
        </div>
        {body.bodyType === 'dynamic' && (
          <Field label={t('showVelocityBody')}>
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--accent)]"
              checked={body.appearance.showVelocity}
              onChange={(e) =>
                replace(t('showVelocityBody'), {
                  ...body,
                  appearance: { ...body.appearance, showVelocity: e.target.checked },
                })
              }
            />
          </Field>
        )}
      </Section>

      {body.bodyType === 'dynamic' && (
        <Button
          variant="secondary"
          active={isTracking}
          className="w-full gap-1.5 text-xs"
          onClick={() => {
            const ui = useUiStore.getState();
            ui.clearPlotBuffer();
            ui.setPlotBodyId(body.id);
            runtime.client.setRecordBodyId(body.id);
          }}
        >
          <Activity size={14} />
          {t('plotTrack')}
        </Button>
      )}

      {body.bodyType === 'dynamic' && (
        <Button
          variant="secondary"
          active={isFbd}
          className="w-full gap-1.5 text-xs"
          onClick={() => {
            const ui = useUiStore.getState();
            const next = isFbd ? null : body.id;
            ui.setFbdBodyId(next);
            runtime.client.setFbdBodyId(next);
          }}
        >
          <Crosshair size={14} />
          {t('fbdTrack')}
        </Button>
      )}

      <BodyOpticsSection store={store} body={body} />
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
        <Field label={t('motorEnabled')}>
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--accent)]"
            checked={axle.enabled}
            onChange={(e) => setAxle(t('motorEnabled'), { enabled: e.target.checked })}
          />
        </Field>
        <Field label={t('motorTarget')} unit="rad/s">
          <NumberInput
            value={axle.targetVelocity}
            step={0.5}
            onCommit={(v) => setAxle(t('motorTarget'), { targetVelocity: v })}
          />
        </Field>
        <Field label={t('motorTorque')} unit="N·m">
          <NumberInput
            value={axle.maxTorque}
            step={10}
            onCommit={(v) => v > 0 && setAxle(t('motorTorque'), { maxTorque: v })}
          />
        </Field>
      </Section>
    );
  }

  if (joint.type === 'spring') {
    const spring = joint.spring ?? { restLength: 0.5, stiffness: 100, damping: 1 };
    const setSpring = (label: string, patch: Partial<typeof spring>) =>
      replace(label, { ...joint, spring: { ...spring, ...patch } });
    return (
      <Section title={t('propJointSpring')}>
        <Field label={t('springRest')} unit="m">
          <NumberInput
            value={spring.restLength}
            onCommit={(v) => v >= 0 && setSpring(t('springRest'), { restLength: v })}
          />
        </Field>
        <Field label={t('springStiffness')} unit="N/m">
          <NumberInput
            value={spring.stiffness}
            step={10}
            onCommit={(v) => v > 0 && setSpring(t('springStiffness'), { stiffness: v })}
          />
        </Field>
        <Field label={t('springDamping')} unit="N·s/m">
          <NumberInput
            value={spring.damping}
            step={1}
            onCommit={(v) => v >= 0 && setSpring(t('springDamping'), { damping: v })}
          />
        </Field>
      </Section>
    );
  }

  if (joint.type === 'thruster') {
    const thruster = joint.thruster ?? { enabled: true, fx: 0, fy: 20 };
    const setThruster = (label: string, patch: Partial<typeof thruster>) =>
      replace(label, { ...joint, thruster: { ...thruster, ...patch } });
    return (
      <Section title={t('propJointThruster')}>
        <Field label={t('thrusterEnabled')}>
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--accent)]"
            checked={thruster.enabled}
            onChange={(e) => setThruster(t('thrusterEnabled'), { enabled: e.target.checked })}
          />
        </Field>
        <Field label={t('thrusterFx')} unit="N">
          <NumberInput
            value={thruster.fx}
            step={1}
            onCommit={(v) => setThruster(t('thrusterFx'), { fx: v })}
          />
        </Field>
        <Field label={t('thrusterFy')} unit="N">
          <NumberInput
            value={thruster.fy}
            step={1}
            onCommit={(v) => setThruster(t('thrusterFy'), { fy: v })}
          />
        </Field>
      </Section>
    );
  }

  return (
    <Section title={t('propJointFixed')}>
      <p className="text-[12px] [color:var(--text-secondary)]">{t('fixedInfo')}</p>
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
      <Field label="x" unit="m">
        <NumberInput
          value={tf.x}
          onCommit={(v) => replace(t('propPosition'), { ...instrument, transform: { ...tf, x: v } })}
        />
      </Field>
      <Field label="y" unit="m">
        <NumberInput
          value={tf.y}
          onCommit={(v) => replace(t('propPosition'), { ...instrument, transform: { ...tf, y: v } })}
        />
      </Field>
      <Field label={t('propAngle')} unit="°">
        <NumberInput
          value={tf.angle * DEG}
          step={5}
          onCommit={(v) =>
            replace(t('propAngle'), { ...instrument, transform: { ...tf, angle: v / DEG } })
          }
        />
      </Field>
      <Field label={t('gateHalfLength')} unit="m">
        <NumberInput
          value={instrument.gate.halfLength}
          onCommit={(v) =>
            v > 0 && replace(t('gateHalfLength'), { ...instrument, gate: { halfLength: v } })
          }
        />
      </Field>
    </Section>
  );
}

function OpticalSourceSection({
  store,
  source,
}: {
  store: DocumentStore;
  source: OpticalSource;
}) {
  const replace = (label: string, after: OpticalSource) =>
    store.apply(cmdReplaceEntity(label, source, after));
  const tf = source.transform;

  const SOURCE_TYPES: { id: OpticalSource['type']; label: string }[] = [
    { id: 'laser', label: t('optSourceLaser') },
    { id: 'beam', label: t('optSourceBeam') },
    { id: 'point', label: t('optSourcePoint') },
  ];

  // Název tělesa, ke kterému je laser přichycen.
  const parentName = source.parentId
    ? (store.doc.entities.find((e) => e.id === source.parentId)?.name ?? source.parentId)
    : null;

  return (
    <Section title={t('propOpticalSource')}>
      {/* Typ zdroje */}
      <p className="text-[11px] font-medium [color:var(--text-muted)]">{t('optSourceType')}</p>
      <div className="flex flex-wrap gap-1.5">
        {SOURCE_TYPES.map(({ id, label }) => (
          <Chip
            key={id}
            active={source.type === id}
            onClick={() => source.type !== id && replace(t('optSourceType'), { ...source, type: id })}
          >
            {label}
          </Chip>
        ))}
      </div>

      {/* Poloha a úhel */}
      <Field label="x" unit="m">
        <NumberInput
          value={tf.x}
          onCommit={(v) => replace(t('propPosition'), { ...source, transform: { ...tf, x: v } })}
        />
      </Field>
      <Field label="y" unit="m">
        <NumberInput
          value={tf.y}
          onCommit={(v) => replace(t('propPosition'), { ...source, transform: { ...tf, y: v } })}
        />
      </Field>
      <Field label={t('propAngle')} unit="°">
        <NumberInput
          value={tf.angle * DEG}
          step={5}
          onCommit={(v) => replace(t('propAngle'), { ...source, transform: { ...tf, angle: v / DEG } })}
        />
      </Field>

      {/* Vlnová délka */}
      <Field label={t('optWavelength')} unit="nm">
        <NumberInput
          value={source.wavelength}
          step={10}
          onCommit={(v) => v >= 0 && v <= 750 && replace(t('optWavelength'), { ...source, wavelength: v })}
        />
      </Field>
      <div className="flex flex-wrap gap-1">
        {WL_PRESETS.map(({ label, value, dot }) => (
          <Chip
            key={value}
            active={source.wavelength === value}
            onClick={() => replace(t('optWavelength'), { ...source, wavelength: value })}
          >
            <span
              className="inline-block h-2 w-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: dot }}
              aria-hidden="true"
            />
            {label}
          </Chip>
        ))}
      </div>

      {/* Počet paprsků (beam/point) */}
      {source.type !== 'laser' && (
        <Field label={t('optRayCount')}>
          <NumberInput
            value={source.rayCount}
            step={1}
            onCommit={(v) => v >= 1 && v <= 64 && replace(t('optRayCount'), { ...source, rayCount: Math.round(v) })}
          />
        </Field>
      )}
      {source.type === 'beam' && (
        <Field label={t('optBeamWidth')} unit="m">
          <NumberInput
            value={source.beamWidth}
            onCommit={(v) => v > 0 && replace(t('optBeamWidth'), { ...source, beamWidth: v })}
          />
        </Field>
      )}

      {/* Přichycení */}
      <p className="text-[10px] [color:var(--text-muted)]">
        {t('optParent')}: {parentName ?? t('optParentNone')}
      </p>
      {source.parentId && (
        <Chip
          active={false}
          onClick={() => replace('Odpojit laser', { ...source, parentId: null })}
        >
          Odpojit od tělesa
        </Chip>
      )}
    </Section>
  );
}

function FluidSection({ store, fluid }: { store: DocumentStore; fluid: Fluid }) {
  const replace = (label: string, after: Fluid) => store.apply(cmdReplaceEntity(label, fluid, after));
  return (
    <Section title={t('propFluid')}>
      <Field label={t('fluidDensity')}>
        <NumberInput
          value={fluid.restDensity}
          step={50}
          onCommit={(v) => v > 0 && replace(t('fluidDensity'), { ...fluid, restDensity: v })}
        />
      </Field>
      <Slider
        label={t('fluidViscosity')}
        value={fluid.viscosity}
        min={0}
        max={1}
        step={0.01}
        onTransient={(v) => {
          const op: DocOp = { op: 'replaceEntity', entity: { ...fluid, viscosity: v } };
          store.applyTransient([op]);
        }}
        onCommit={(_s, e) =>
          replace(t('fluidViscosity'), { ...fluid, viscosity: e })
        }
      />
      <Field label={t('fluidRadius')} unit="m">
        <NumberInput
          value={fluid.particleRadius}
          step={0.01}
          onCommit={(v) => v > 0 && replace(t('fluidRadius'), { ...fluid, particleRadius: v })}
        />
      </Field>
      <Section title={t('fluidColor')}>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((c) => (
            <Swatch
              key={c}
              color={c}
              active={fluid.color.toLowerCase() === c}
              onClick={() => replace(t('fluidColor'), { ...fluid, color: c })}
            />
          ))}
        </div>
      </Section>
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
          <div className="flex flex-wrap gap-1.5">
            {COLORS.map((c) => (
              <Swatch
                key={c}
                color={c}
                active={false}
                onClick={() =>
                  applyAll(t('propColor'), (b) => ({ ...b, appearance: { ...b.appearance, fill: c } }))
                }
              />
            ))}
          </div>
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
      ) : e.kind === 'opticalSource' ? (
        <OpticalSourceSection store={store} source={e} />
      ) : e.kind === 'fluid' ? (
        <FluidSection store={store} fluid={e} />
      ) : (
        null
      );
  } else {
    content = <MultiSection store={store} entities={entities} />;
  }

  return (
    <Panel className="max-h-[72vh] w-60 space-y-3 overflow-y-auto p-3">
      {content}
    </Panel>
  );
}
