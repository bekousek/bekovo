import { parseSceneDoc, type SceneDoc, type SceneDocInput } from './schema';

/** Prázdná scéna: jen podlaha, kamera ve výchozí poloze. */
export function emptyScene(): SceneDoc {
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: { id: 'empty', title: 'Prázdná scéna' },
    world: {},
    camera: { center: { x: 0, y: 2 }, metersPerScreenH: 8 },
    entities: [
      {
        kind: 'body',
        id: 'ground',
        name: 'Podlaha',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.5, restitution: 0.3 },
        appearance: { fill: '#94a3b8' },
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Preset: matematické kyvadlo.
 *
 * Koule (r=0,15 m, hustota 1000 kg/m²) zavěšená čepem 1,5 m pod stropem.
 * Výchylka 15° — perioda T = 2π√(L/g) ≈ 2,5 s. Žák může měnit délku závěsu.
 */
export function pendulumScene(): SceneDoc {
  const L = 1.5;
  const theta0 = (15 * Math.PI) / 180;
  const pivot = { x: 0, y: 3.1 };
  const ball = {
    x: pivot.x + L * Math.sin(theta0),
    y: pivot.y - L * Math.cos(theta0),
  };
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-kyvadlo',
      title: 'Kyvadlo',
      curriculum: { subject: 'fyzika', grade: 8, topic: 'kmitání' },
    },
    world: { gravity: { x: 0, y: -9.81 } },
    camera: { center: { x: 0, y: 2 }, metersPerScreenH: 7 },
    entities: [
      {
        kind: 'body',
        id: 'ceiling',
        name: 'Strop',
        bodyType: 'static',
        transform: { x: 0, y: 3.25 },
        shapes: [{ type: 'box', hw: 1.5, hh: 0.15 }],
        material: { density: 1000, friction: 0.3, restitution: 0.1 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'body',
        id: 'bob',
        name: 'Závaží',
        transform: { x: ball.x, y: ball.y },
        shapes: [{ type: 'circle', r: 0.15 }],
        material: { density: 1000, friction: 0.3, restitution: 0.5 },
        appearance: { fill: '#3b82f6' },
      },
      {
        kind: 'joint',
        id: 'pivot',
        name: 'Čep',
        type: 'axle',
        bodyA: null,
        bodyB: 'bob',
        anchorA: pivot,
        anchorB: { x: pivot.x - ball.x, y: pivot.y - ball.y },
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Preset: nakloněná rovina.
 *
 * Kvádr (dřevo, μ=0,45) na rovině skloněné 30°. Skluz nastane, pokud tan θ > μ.
 * Žák zkouší různé úhly nebo materiály.
 */
export function inclineScene(): SceneDoc {
  const theta = Math.PI / 6; // 30°
  const hh = 0.15;
  const s = 1.8; // vzdálenost podél roviny od počátku
  const nx = -Math.sin(theta);
  const ny = Math.cos(theta);
  const tx = Math.cos(theta);
  const ty = Math.sin(theta);
  const bx = tx * s + nx * hh;
  const by = ty * s + ny * hh;
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-naklon',
      title: 'Nakloněná rovina',
      curriculum: { subject: 'fyzika', grade: 7, topic: 'silové účinky' },
    },
    world: { gravity: { x: 0, y: -9.81 } },
    camera: { center: { x: 0.8, y: 1.2 }, metersPerScreenH: 7 },
    entities: [
      {
        kind: 'body',
        id: 'ramp',
        name: 'Rovina',
        bodyType: 'static',
        transform: { x: 0, y: 0, angle: theta },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.45, restitution: 0.1 },
        appearance: { fill: '#78716c' },
      },
      {
        kind: 'body',
        id: 'box',
        name: 'Kvádr',
        transform: { x: bx, y: by, angle: theta },
        shapes: [{ type: 'box', hw: 0.25, hh }],
        material: { density: 600, friction: 0.45, restitution: 0.1 },
        appearance: { fill: '#b45309' },
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Preset: pružina se závažím.
 *
 * Závaží (m ≈ 1 kg) na svislé pružině (k=50 N/m). Rovnovážná poloha je
 * o mg/k ≈ 0,20 m níže než klidová délka; žák může měnit tuhost nebo hmotnost.
 */
export function springMassScene(): SceneDoc {
  const r = 0.2;
  const m = 1.0;
  const density = m / (Math.PI * r * r);
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-pruzina',
      title: 'Pružina se závažím',
      curriculum: { subject: 'fyzika', grade: 8, topic: 'kmitání' },
    },
    world: { gravity: { x: 0, y: -9.81 } },
    camera: { center: { x: 0, y: 1.8 }, metersPerScreenH: 6 },
    entities: [
      {
        kind: 'body',
        id: 'ceiling',
        name: 'Strop',
        bodyType: 'static',
        transform: { x: 0, y: 3.1 },
        shapes: [{ type: 'box', hw: 0.8, hh: 0.1 }],
        material: { density: 1000, friction: 0.3, restitution: 0.1 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'body',
        id: 'mass',
        name: 'Závaží',
        // Spuštění z klidové délky pružiny (1 m pod kotvou) → kmitání kolem rovnováhy.
        transform: { x: 0, y: 2 },
        shapes: [{ type: 'circle', r }],
        material: { density: Math.round(density), friction: 0.2, restitution: 0.1 },
        appearance: { fill: '#f59e0b' },
      },
      {
        kind: 'joint',
        id: 'spring',
        name: 'Pružina',
        type: 'spring',
        bodyA: null,
        bodyB: 'mass',
        anchorA: { x: 0, y: 3 },
        anchorB: { x: 0, y: 0 },
        spring: { restLength: 1, stiffness: 50, damping: 0.4 },
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Preset: heliový balón.
 *
 * Balón plněný heliem (ρ=0,17 kg/m³, r=0,45 m) ve vzduchu (ρ=1,2 kg/m³).
 * Vztlaková síla převažuje tíhu → balón stoupá; vzduchový odpor ho zpomalí
 * na terminální rychlost. Žák může přidat závaží (pružinu nebo fixaci).
 */
export function heliumBalloonScene(): SceneDoc {
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-balonek',
      title: 'Heliový balón',
      curriculum: { subject: 'fyzika', grade: 7, topic: 'vztlaková síla' },
    },
    world: { gravity: { x: 0, y: -9.81 }, airDensity: 1.2 },
    camera: { center: { x: 0, y: 3 }, metersPerScreenH: 10 },
    entities: [
      {
        kind: 'body',
        id: 'ground',
        name: 'Podlaha',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.5, restitution: 0.2 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'body',
        id: 'balloon',
        name: 'Balón (He)',
        transform: { x: 0, y: 1.2 },
        shapes: [{ type: 'circle', r: 0.45 }],
        // helium: 0,17 kg/m³ (viz materialPreset); hmotnost ≈ 0,11 kg
        material: { density: 0.17, friction: 0.1, restitution: 0.4 },
        appearance: { fill: '#fca5a5' },
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Preset: raketa s tryskou.
 *
 * Lehká pěnová raketa (foam 30 kg/m², 0,2 × 0,5 m → hmotnost 3 kg, tíha ≈ 29,4 N)
 * s výchozí silou trysky 20 N (nestoupá). Žák si ověří, že pro vzlet musí
 * nastavit fy > tíha ≈ 30 N. Scéna je bez odporu vzduchu pro čistou fyziku.
 */
export function rocketScene(): SceneDoc {
  const input: SceneDocInput = {
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-raketa',
      title: 'Raketa s tryskou',
      curriculum: { subject: 'fyzika', grade: 8, topic: 'silové účinky' },
    },
    world: { gravity: { x: 0, y: -9.81 }, airDensity: 0 },
    camera: { center: { x: 0, y: 3 }, metersPerScreenH: 9 },
    entities: [
      {
        kind: 'body',
        id: 'ground',
        name: 'Podlaha',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.5, restitution: 0.2 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'body',
        id: 'rocket',
        name: 'Raketa',
        bodyType: 'dynamic',
        transform: { x: 0, y: 0.55, angle: 0 },
        shapes: [{ type: 'box', hw: 0.1, hh: 0.25 }],
        // foam: 30 kg/m², plocha 0,2 × 0,5 = 0,1 m² → hmotnost 3 kg, tíha 29,4 N
        material: { density: 30, friction: 0.4, restitution: 0.1 },
        appearance: { fill: '#e2e8f0' },
      },
      {
        kind: 'joint',
        id: 'thr-1',
        name: 'Tryska',
        type: 'thruster',
        bodyA: null,
        bodyB: 'rocket',
        anchorA: { x: 0, y: 0 },
        // Tryska připevněna ke spodku rakety (lokální -y).
        anchorB: { x: 0, y: -0.25 },
        thruster: { enabled: true, fx: 0, fy: 20 },
      },
    ],
  };
  return parseSceneDoc(input);
}

/**
 * Preset: lom světla na skleněném bloku (F3-B).
 *
 * Zelený laser (λ=550 nm) dopadá na skleněný kvádr pod úhlem ≈20°.
 * Viditelně se zlomí na vstupu i výstupu (n=1,5, kritický úhel 41,8°).
 * Žák může hýbat blokem nebo změnit úhel laseru → ověří Snellův zákon.
 */
export function laserScene(): SceneDoc {
  const glassX = 0;
  const glassY = 1.2;
  // Laser vychází z (−2, 1.7), míří na střed skleněného bloku (0, 1.2):
  // vektor (2, −0.5) → úhel = atan2(−0.5, 2) ≈ −0.245 rad
  const laserAngle = Math.atan2(-0.5, 2);
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-laser-lom',
      title: 'Lom světla — skleněný blok',
      curriculum: { subject: 'fyzika', grade: 7, topic: 'optika' },
    },
    world: { gravity: { x: 0, y: -9.81 } },
    camera: { center: { x: 0, y: 1.2 }, metersPerScreenH: 6 },
    entities: [
      {
        kind: 'body',
        id: 'glass-block',
        name: 'Skleněný blok',
        bodyType: 'static',
        transform: { x: glassX, y: glassY },
        shapes: [{ type: 'box', hw: 0.6, hh: 0.3 }],
        material: { density: 2500, friction: 0.4, restitution: 0.1 },
        appearance: { fill: '#bae6fd' },
        optics: { mode: 'glass', refractiveIndex: 1.5, cauchyB: 0, reflectivity: 0.04 },
      },
      {
        kind: 'opticalSource',
        id: 'laser-green',
        name: 'Laser (zelený)',
        type: 'laser',
        transform: { x: -2, y: 1.7, angle: laserAngle },
        wavelength: 550,
        power: 1,
        rayCount: 1,
        beamWidth: 0.1,
        parentId: null,
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Preset: disperze světla — hranol (F3-B).
 *
 * Skleněný hranol (trojúhelník, n=1,5, kauchyB=0,01 → disperze) osvícen třemi
 * barevnými lasery (modrý 450 nm, zelený 550 nm, červený 650 nm). Hranol je
 * statický. Různé indexy lomu pro různé vlnové délky → duha.
 * Žák změní kauchyB a sleduje rozptyl barev.
 */
export function prismScene(): SceneDoc {
  // Rovnostranný trojúhelník (s = 1,5 m) — vrcholy v lokálních souřadnicích.
  const s = 1.5;
  const h = (s * Math.sqrt(3)) / 2; // výška trojúhelníku
  const prismPoints = [
    { x: 0, y: (2 / 3) * h },           // vrchol
    { x: -s / 2, y: -(1 / 3) * h },     // levý dolní roh
    { x: s / 2, y: -(1 / 3) * h },      // pravý dolní roh
  ];
  // Laser dopadá na levou stranu hranolu (vektor lomenicí zleva-doprava)
  // Tři lasery blízko sebe, trochu pod sebou, v úhlu ≈ 30° (π/6 dolů od vodorovné).
  const laserAngle = -Math.PI / 6; // 30° dolů od vodorovné = útok na levou stranu trianglu
  const ly0 = 1.8; // střed
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-hranol-disperze',
      title: 'Disperze — hranol',
      curriculum: { subject: 'fyzika', grade: 7, topic: 'optika' },
    },
    world: { gravity: { x: 0, y: -9.81 } },
    camera: { center: { x: 0.5, y: 1.5 }, metersPerScreenH: 7 },
    entities: [
      {
        kind: 'body',
        id: 'prism',
        name: 'Skleněný hranol',
        bodyType: 'static',
        transform: { x: 0.5, y: 1.5 },
        shapes: [{ type: 'polygon', points: prismPoints }],
        material: { density: 2500, friction: 0.3, restitution: 0.1 },
        appearance: { fill: '#e0f2fe' },
        optics: { mode: 'glass', refractiveIndex: 1.5, cauchyB: 0.01, reflectivity: 0.04 },
      },
      {
        kind: 'opticalSource',
        id: 'laser-blue',
        name: 'Laser (modrý 450 nm)',
        type: 'laser',
        transform: { x: -2, y: ly0 + 0.08, angle: laserAngle },
        wavelength: 450,
        power: 1,
        rayCount: 1,
        beamWidth: 0.1,
        parentId: null,
      },
      {
        kind: 'opticalSource',
        id: 'laser-green',
        name: 'Laser (zelený 550 nm)',
        type: 'laser',
        transform: { x: -2, y: ly0, angle: laserAngle },
        wavelength: 550,
        power: 1,
        rayCount: 1,
        beamWidth: 0.1,
        parentId: null,
      },
      {
        kind: 'opticalSource',
        id: 'laser-red',
        name: 'Laser (červený 650 nm)',
        type: 'laser',
        transform: { x: -2, y: ly0 - 0.08, angle: laserAngle },
        wavelength: 650,
        power: 1,
        rayCount: 1,
        beamWidth: 0.1,
        parentId: null,
      },
    ],
  } satisfies SceneDocInput);
}

/** Demo scéna fáze 0: podlaha + dva míče + bedna. */
export function demoScene(): SceneDoc {
  const input: SceneDocInput = {
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'demo-fall',
      title: 'Padající tělesa',
      curriculum: { subject: 'fyzika', topic: 'mechanika' },
    },
    world: {},
    camera: { center: { x: 0, y: 2.2 }, metersPerScreenH: 7 },
    entities: [
      {
        kind: 'body',
        id: 'ground',
        name: 'Podlaha',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.8, restitution: 0.2 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'body',
        id: 'ball-1',
        name: 'Míč',
        transform: { x: -1.2, y: 3.0 },
        shapes: [{ type: 'circle', r: 0.3 }],
        material: { density: 900, friction: 0.4, restitution: 0.65 },
        appearance: { fill: '#3b82f6' },
      },
      {
        kind: 'body',
        id: 'ball-2',
        name: 'Míček',
        transform: { x: -0.85, y: 4.4 },
        shapes: [{ type: 'circle', r: 0.22 }],
        material: { density: 700, friction: 0.4, restitution: 0.75 },
        appearance: { fill: '#10b981' },
      },
      {
        kind: 'body',
        id: 'box-1',
        name: 'Bedna',
        transform: { x: 1.1, y: 2.5, angle: 0.35 },
        shapes: [{ type: 'box', hw: 0.35, hh: 0.25 }],
        material: { density: 600, friction: 0.6, restitution: 0.1 },
        appearance: { fill: '#f59e0b' },
      },
    ],
  };
  return parseSceneDoc(input);
}
