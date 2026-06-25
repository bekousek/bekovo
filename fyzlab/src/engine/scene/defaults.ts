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
  // Tři lasery míří VODOROVNĚ a PŘEKRÝVAJÍ SE (jako bílé světlo) na střed
  // levé stěny hranolu; za hranolem se rozdělí do barevného vějíře (disperze).
  // Levá stěna jde z (0.5, 2.366) do (-0.25, 1.067) → svislý střed ≈ 1,72 m.
  const laserAngle = 0;
  const ly0 = 1.72;
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
        transform: { x: -2, y: ly0, angle: laserAngle },
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
        transform: { x: -2, y: ly0, angle: laserAngle },
        wavelength: 650,
        power: 1,
        rayCount: 1,
        beamWidth: 0.1,
        parentId: null,
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Preset: spojná čočka (F3-D).
 *
 * Svazek 7 rovnoběžných paprsků prochází spojnou čočkou (f=1,0 m) a sbíhá
 * se v ohnisku. Žák změní ohniskovou vzdálenost a sleduje posun ohniska.
 */
export function convergingLensScene(): SceneDoc {
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-spojka',
      title: 'Spojná čočka',
      curriculum: { subject: 'fyzika', grade: 7, topic: 'optika' },
    },
    world: { gravity: { x: 0, y: -9.81 } },
    camera: { center: { x: 0.5, y: 1.5 }, metersPerScreenH: 6 },
    entities: [
      {
        kind: 'body',
        id: 'lens',
        name: 'Spojná čočka (f=1 m)',
        bodyType: 'static',
        transform: { x: 0, y: 1.5 },
        // Velmi tenký box = čočková rovina; optická osa = svět-x
        shapes: [{ type: 'box', hw: 0.02, hh: 0.55 }],
        material: { density: 2500, friction: 0.3, restitution: 0.1 },
        appearance: { fill: '#bae6fd' },
        optics: { mode: 'lens', focalLength: 1.0, refractiveIndex: 1.5, cauchyB: 0, reflectivity: 0 },
      },
      {
        kind: 'opticalSource',
        id: 'beam',
        name: 'Rovnoběžný svazek',
        type: 'beam',
        transform: { x: -3, y: 1.5, angle: 0 },
        wavelength: 550,
        power: 1,
        rayCount: 7,
        beamWidth: 0.9,
        parentId: null,
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Preset: rozptylná čočka (F3-D).
 *
 * Stejný svazek, ale čočka má zápornou ohniskovou vzdálenost (f=−1,0 m) →
 * paprsky se rozbíhají jako by vycházely z virtuálního ohniska.
 */
export function divergingLensScene(): SceneDoc {
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-rozptylka',
      title: 'Rozptylná čočka',
      curriculum: { subject: 'fyzika', grade: 7, topic: 'optika' },
    },
    world: { gravity: { x: 0, y: -9.81 } },
    camera: { center: { x: 0.5, y: 1.5 }, metersPerScreenH: 6 },
    entities: [
      {
        kind: 'body',
        id: 'lens',
        name: 'Rozptylná čočka (f=−1 m)',
        bodyType: 'static',
        transform: { x: 0, y: 1.5 },
        shapes: [{ type: 'box', hw: 0.02, hh: 0.55 }],
        material: { density: 2500, friction: 0.3, restitution: 0.1 },
        appearance: { fill: '#bae6fd' },
        optics: { mode: 'lens', focalLength: -1.0, refractiveIndex: 1.5, cauchyB: 0, reflectivity: 0 },
      },
      {
        kind: 'opticalSource',
        id: 'beam',
        name: 'Rovnoběžný svazek',
        type: 'beam',
        transform: { x: -3, y: 1.5, angle: 0 },
        wavelength: 550,
        power: 1,
        rayCount: 7,
        beamWidth: 0.9,
        parentId: null,
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Preset: periskop — dvě zrcadla přesměrují světlo přes překážku (F3-D).
 *
 * Vodorovný laser je zrcadlem odkloněn dolů, druhé zrcadlo ho vrátí zpět
 * do vodorovného směru (Z-tvar světelné dráhy). Ukazuje zákon odrazu.
 */
export function periscopeScene(): SceneDoc {
  // Obě zrcadla „\" (+45°): horní stočí vodorovný paprsek DOLŮ k dolnímu
  // zrcadlu, to ho stočí zpět do vodorovného směru ven (klasický periskop).
  // (−45° „/" by horní zrcadlo odrazilo paprsek vzhůru mimo scénu.)
  const A = Math.PI / 4;
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-periskop',
      title: 'Periskop (dvě zrcadla)',
      curriculum: { subject: 'fyzika', grade: 7, topic: 'optika' },
    },
    world: { gravity: { x: 0, y: -9.81 } },
    camera: { center: { x: 0, y: 1.5 }, metersPerScreenH: 7 },
    entities: [
      {
        kind: 'body',
        id: 'mirror-top',
        name: 'Zrcadlo 1',
        bodyType: 'static',
        transform: { x: 0, y: 2.8, angle: A },
        shapes: [{ type: 'box', hw: 0.02, hh: 0.5 }],
        material: { density: 2500, friction: 0.3, restitution: 0.1 },
        appearance: { fill: '#cbd5e1' },
        optics: { mode: 'mirror', reflectivity: 0.95, refractiveIndex: 1.5, cauchyB: 0, focalLength: 1 },
      },
      {
        kind: 'body',
        id: 'mirror-bot',
        name: 'Zrcadlo 2',
        bodyType: 'static',
        transform: { x: 0, y: 0.4, angle: A },
        shapes: [{ type: 'box', hw: 0.02, hh: 0.5 }],
        material: { density: 2500, friction: 0.3, restitution: 0.1 },
        appearance: { fill: '#cbd5e1' },
        optics: { mode: 'mirror', reflectivity: 0.95, refractiveIndex: 1.5, cauchyB: 0, focalLength: 1 },
      },
      {
        kind: 'opticalSource',
        id: 'laser',
        name: 'Laser',
        type: 'laser',
        transform: { x: -3, y: 2.8, angle: 0 },
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
 * Kapalina v nádobě: voda se usadí na dně ohrazené 3 rovinami.
 * Demonstruje gravitaci a tlak kapaliny.
 */
export function waterInBoxScene(): SceneDoc {
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: { id: 'preset-voda-nadoba', title: 'Voda v nádobě' },
    world: { gravity: { x: 0, y: -9.81 } },
    camera: { center: { x: 1.5, y: 1.5 }, metersPerScreenH: 6 },
    entities: [
      {
        kind: 'body',
        id: 'floor',
        name: 'Podlaha',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.5, restitution: 0.1 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'body',
        id: 'wall-l',
        name: 'Levá stěna',
        bodyType: 'static',
        transform: { x: 0, y: 0, angle: -Math.PI / 2 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.5, restitution: 0.1 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'body',
        id: 'wall-r',
        name: 'Pravá stěna',
        bodyType: 'static',
        transform: { x: 3, y: 0, angle: Math.PI / 2 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.5, restitution: 0.1 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'fluid',
        id: 'water',
        name: 'Voda',
        restDensity: 1000,
        viscosity: 0.05,
        color: '#3b82f6',
        region: { x: 0.1, y: 0.1, width: 2.8, height: 1.8 },
        particleRadius: 0.07,
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Dvě kapaliny různé hustoty: simulace rozvrstvení (lehčí plave na těžší).
 * Demonstruje vztlak a Archimédův zákon v kapalinách.
 */
export function twoDensitiesScene(): SceneDoc {
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: { id: 'preset-dve-kapaliny', title: 'Dvě kapaliny' },
    world: { gravity: { x: 0, y: -9.81 } },
    camera: { center: { x: 1.5, y: 2 }, metersPerScreenH: 7 },
    entities: [
      {
        kind: 'body',
        id: 'floor',
        name: 'Podlaha',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.5, restitution: 0.1 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'body',
        id: 'wall-l',
        name: 'Levá stěna',
        bodyType: 'static',
        transform: { x: 0, y: 0, angle: -Math.PI / 2 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.5, restitution: 0.1 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'body',
        id: 'wall-r',
        name: 'Pravá stěna',
        bodyType: 'static',
        transform: { x: 3, y: 0, angle: Math.PI / 2 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.5, restitution: 0.1 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'fluid',
        id: 'heavy',
        name: 'Těžká kapalina',
        restDensity: 1500,
        viscosity: 0.05,
        color: '#f59e0b',
        region: { x: 0.1, y: 0.1, width: 2.8, height: 1.0 },
        particleRadius: 0.07,
      },
      {
        kind: 'fluid',
        id: 'light',
        name: 'Lehká kapalina',
        restDensity: 700,
        viscosity: 0.05,
        color: '#3b82f6',
        region: { x: 0.1, y: 1.2, width: 2.8, height: 1.0 },
        particleRadius: 0.07,
      },
    ],
  } satisfies SceneDocInput);
}

// ---------------------------------------------------------------------------
// F5-B: Kurikulární scény — mechanika, srážky, energie
// ---------------------------------------------------------------------------

/**
 * Volný pád z výšky 20 m.
 * Lesson (numeric): předpověď maximální rychlosti před dopadem.
 * Analyticky: v = √(2gh) = √(2 × 9,81 × 20) ≈ 19,8 m/s.
 */
export function freeFallScene(): SceneDoc {
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-volny-pad',
      title: 'Volný pád z výšky 20 m',
      curriculum: { subject: 'fyzika', grade: 6, topic: 'pohyb a gravitace' },
    },
    lesson: {
      question: 'Těleso padá z klidu z výšky 20 m. Jakou rychlost [m/s] bude mít těsně před dopadem?',
      prediction: {
        kind: 'numeric',
        targetBodyId: 'ball',
        quantity: 'max-speed',
        tolerance: 0.05,
        unit: 'm/s',
      },
      hint: 'Vzorec: v = √(2 · g · h). Gravitační zrychlení g ≈ 9,81 m/s².',
      level: 'základní',
    },
    world: { gravity: { x: 0, y: -9.81 } },
    camera: { center: { x: 0, y: 10 }, metersPerScreenH: 26 },
    entities: [
      {
        kind: 'body',
        id: 'ground',
        name: 'Podlaha',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.5, restitution: 0.0 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'body',
        id: 'ball',
        name: 'Těleso',
        transform: { x: 0, y: 20.3 },
        shapes: [{ type: 'circle', r: 0.3 }],
        material: { density: 1000, friction: 0.3, restitution: 0.0 },
        appearance: { fill: '#3b82f6' },
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Šikmý vrh pod 45° s počáteční rychlostí 10 m/s.
 * Lesson (numeric): předpověď vodorovného dostřelu.
 * Analyticky: R = v₀²·sin(2θ)/g = 100/9,81 ≈ 10,19 m.
 */
export function projectile45Scene(): SceneDoc {
  const v0 = 10;
  const angle45 = Math.PI / 4;
  const vx0 = v0 * Math.cos(angle45); // ≈ 7.071
  const vy0 = v0 * Math.sin(angle45); // ≈ 7.071
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-sikmyvrh-45',
      title: 'Šikmý vrh 45°',
      curriculum: { subject: 'fyzika', grade: 7, topic: 'pohyb' },
    },
    lesson: {
      question: 'Těleso je vrženo pod úhlem 45° s počáteční rychlostí 10 m/s. Kam dopadne (vodorovná vzdálenost v m)?',
      prediction: {
        kind: 'numeric',
        targetBodyId: 'ball',
        quantity: 'landing-x',
        tolerance: 0.08,
        unit: 'm',
      },
      hint: 'Dostřel: R = v₀² · sin(2θ) / g. Pro θ = 45° je sin(90°) = 1.',
      level: 'střední',
    },
    world: { gravity: { x: 0, y: -9.81 }, airDensity: 0 },
    camera: { center: { x: 5, y: 2.5 }, metersPerScreenH: 10 },
    entities: [
      {
        kind: 'body',
        id: 'ground',
        name: 'Podlaha',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.0, restitution: 0.0 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'body',
        id: 'ball',
        name: 'Těleso',
        transform: { x: 0, y: 0.2 },
        velocity: { vx: vx0, vy: vy0, omega: 0 },
        shapes: [{ type: 'circle', r: 0.2 }],
        material: { density: 1000, friction: 0.0, restitution: 0.0 },
        appearance: { fill: '#ef4444', showVelocity: true },
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Páka (jednoduché stroje): nerovnoramenná páka na čepu.
 * Levá zátěž 3× těžší než pravá, stejná vzdálenost od čepu.
 * Lesson (choice): na kterou stranu se nakloní?
 */
export function leverScene(): SceneDoc {
  const r = 0.22;
  // Hustota: m = ρ·π·r² → pro r=0,22: area ≈ 0,152 m²
  const heavyDensity = Math.round(3 / (Math.PI * r * r)); // m ≈ 3 kg
  const lightDensity = Math.round(1 / (Math.PI * r * r)); // m ≈ 1 kg
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-paka',
      title: 'Páka — jednoduché stroje',
      curriculum: { subject: 'fyzika', grade: 7, topic: 'jednoduché stroje' },
    },
    lesson: {
      question: 'Páka je vyvážena na středovém čepu. Na levém konci (2 m od čepu) visí závaží 3 kg, na pravém konci (2 m od čepu) závaží 1 kg. Co se stane?',
      prediction: {
        kind: 'choice',
        choices: [
          { id: 'left', label: 'Levá strana klesne dolů' },
          { id: 'balance', label: 'Páka zůstane vodorovně' },
          { id: 'right', label: 'Pravá strana klesne dolů' },
        ],
        correctId: 'left',
      },
      hint: 'Moment síly = síla × vzdálenost od čepu. Která strana má větší moment?',
      level: 'základní',
    },
    world: { gravity: { x: 0, y: -9.81 } },
    camera: { center: { x: 0, y: 1 }, metersPerScreenH: 7 },
    entities: [
      {
        kind: 'body',
        id: 'ground',
        name: 'Podlaha',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.5, restitution: 0.0 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'body',
        id: 'lever',
        name: 'Páka',
        bodyType: 'dynamic',
        transform: { x: 0, y: 0.5 },
        shapes: [{ type: 'box', hw: 2.5, hh: 0.05 }],
        material: { density: 200, friction: 0.5, restitution: 0.0 },
        appearance: { fill: '#b45309' },
      },
      {
        kind: 'joint',
        id: 'pivot',
        name: 'Čep páky',
        type: 'axle',
        bodyA: null,
        bodyB: 'lever',
        anchorA: { x: 0, y: 0.5 },
        anchorB: { x: 0, y: 0 },
      },
      {
        kind: 'body',
        id: 'mass-heavy',
        name: 'Závaží 3 kg',
        bodyType: 'dynamic',
        transform: { x: -2, y: 0.5 + 0.05 + r },
        shapes: [{ type: 'circle', r }],
        material: { density: heavyDensity, friction: 0.8, restitution: 0.0 },
        appearance: { fill: '#dc2626' },
      },
      {
        kind: 'body',
        id: 'mass-light',
        name: 'Závaží 1 kg',
        bodyType: 'dynamic',
        transform: { x: 2, y: 0.5 + 0.05 + r },
        shapes: [{ type: 'circle', r }],
        material: { density: lightDensity, friction: 0.8, restitution: 0.0 },
        appearance: { fill: '#16a34a' },
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Elastická srážka dvou těles stejné hmotnosti.
 * Lesson (choice): co se stane po srážce?
 * Analyticky: pohyblivé těleso se zastaví, druhé přejme jeho rychlost.
 */
export function elasticCollisionScene(): SceneDoc {
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-srazka-elasticka',
      title: 'Srážka — zachování hybnosti',
      curriculum: { subject: 'fyzika', grade: 9, topic: 'hybnost a srážky' },
    },
    lesson: {
      question: 'Těleso A (3 m/s doprava) narazí do klidového tělesa B stejné hmotnosti. Restituce je 1 (dokonale pružná srážka). Co se stane?',
      prediction: {
        kind: 'choice',
        choices: [
          { id: 'a-stops', label: 'A se zastaví, B se rozjede rychlostí 3 m/s' },
          { id: 'both', label: 'Obě tělesa se pohybují rychlostí 1,5 m/s' },
          { id: 'a-back', label: 'A se odrazí zpět, B zůstane' },
        ],
        correctId: 'a-stops',
      },
      hint: 'Zákon zachování hybnosti + energie: pro stejné hmotnosti se rychlosti vymění.',
      level: 'střední',
    },
    world: { gravity: { x: 0, y: -9.81 } },
    camera: { center: { x: 1, y: 0.8 }, metersPerScreenH: 5 },
    entities: [
      {
        kind: 'body',
        id: 'ground',
        name: 'Podlaha',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.0, restitution: 0.0 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'body',
        id: 'ball-a',
        name: 'Těleso A',
        bodyType: 'dynamic',
        transform: { x: -2, y: 0.3 },
        velocity: { vx: 3, vy: 0, omega: 0 },
        shapes: [{ type: 'circle', r: 0.3 }],
        material: { density: 500, friction: 0.0, restitution: 1.0 },
        appearance: { fill: '#3b82f6', showVelocity: true },
      },
      {
        kind: 'body',
        id: 'ball-b',
        name: 'Těleso B',
        bodyType: 'dynamic',
        transform: { x: 0.6, y: 0.3 },
        shapes: [{ type: 'circle', r: 0.3 }],
        material: { density: 500, friction: 0.0, restitution: 1.0 },
        appearance: { fill: '#f59e0b', showVelocity: true },
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Neelastická srážka: dvě tělesa se slepí a pohybují dál společně.
 * Demonstruje zachování hybnosti, ztrátu kinetické energie.
 */
export function inelasticCollisionScene(): SceneDoc {
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-srazka-neelasticka',
      title: 'Neelastická srážka',
      curriculum: { subject: 'fyzika', grade: 9, topic: 'hybnost a srážky' },
    },
    lesson: {
      question: 'Těleso A (5 m/s, 2 kg) narazí do klidového tělesa B (2 kg) a slepí se s ním. Jakou rychlostí [m/s] se budou pohybovat po srážce?',
      prediction: {
        kind: 'numeric',
        targetBodyId: 'ball-a',
        quantity: 'max-speed',
        tolerance: 0.15,
        unit: 'm/s',
      },
      hint: 'Hybnost se zachovává: m·v = (m+m)·v₂ → v₂ = v/2.',
      level: 'střední',
    },
    world: { gravity: { x: 0, y: -9.81 } },
    camera: { center: { x: 1.5, y: 0.8 }, metersPerScreenH: 5 },
    entities: [
      {
        kind: 'body',
        id: 'ground',
        name: 'Podlaha',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.0, restitution: 0.0 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'body',
        id: 'ball-a',
        name: 'Těleso A (2 kg, 5 m/s)',
        bodyType: 'dynamic',
        transform: { x: -2, y: 0.32 },
        velocity: { vx: 5, vy: 0, omega: 0 },
        shapes: [{ type: 'box', hw: 0.32, hh: 0.32 }],
        material: { density: 488, friction: 0.9, restitution: 0.0 }, // 488 × 0.64² ≈ 2 kg
        appearance: { fill: '#3b82f6', showVelocity: true },
      },
      {
        kind: 'body',
        id: 'ball-b',
        name: 'Těleso B (2 kg)',
        bodyType: 'dynamic',
        transform: { x: 1, y: 0.32 },
        shapes: [{ type: 'box', hw: 0.32, hh: 0.32 }],
        material: { density: 488, friction: 0.9, restitution: 0.0 },
        appearance: { fill: '#f59e0b', showVelocity: true },
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Domino efekt: kaskáda 8 kvádrů.
 * Demonstruje přenos energie a hybnosti, setrvačnost.
 */
export function dominoScene(): SceneDoc {
  const hw = 0.055; // šířka domina ÷2
  const hh = 0.3;   // výška domina ÷2 (výška 0,6 m)
  const spacing = 0.38; // rozteč mezi středy
  const n = 8;
  const startX = -((n - 1) * spacing) / 2;
  const dominos = Array.from({ length: n }, (_, i) => ({
    kind: 'body' as const,
    id: `d${i}`,
    name: `Domino ${i + 1}`,
    bodyType: 'dynamic' as const,
    transform: {
      x: startX + i * spacing,
      y: hh,
      angle: i === 0 ? -0.18 : 0, // první domino mírně nakloněno
    },
    shapes: [{ type: 'box' as const, hw, hh }],
    material: { density: 800, friction: 0.6, restitution: 0.05 },
    appearance: { fill: i % 2 === 0 ? '#f8fafc' : '#1e293b' },
  }));
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-domino',
      title: 'Domino — přenos energie',
      curriculum: { subject: 'fyzika', grade: 9, topic: 'hybnost a srážky' },
    },
    world: { gravity: { x: 0, y: -9.81 } },
    camera: { center: { x: 0, y: 1 }, metersPerScreenH: 5 },
    entities: [
      {
        kind: 'body',
        id: 'ground',
        name: 'Podlaha',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.5, restitution: 0.0 },
        appearance: { fill: '#94a3b8' },
      },
      ...dominos,
    ],
  } satisfies SceneDocInput);
}

/**
 * Newtonova kolébka — 3 kuličky na čepech.
 * Demonstruje zachování hybnosti a energie při sériových srážkách.
 */
export function newtonsCradleScene(): SceneDoc {
  const r = 0.18;       // poloměr kuličky
  const L = 1.8;        // délka závěsu
  const spacing = 2 * r; // mezera mezi středy (dotýkají se)
  const pivotY = 4.0;
  const restY = pivotY - L;
  // Pivoty: ball0 vlevo, 1 uprostřed, 2 vpravo
  const pivots = [-spacing, 0, spacing].map((dx) => ({ x: dx, y: pivotY }));
  // Ball0 zatažena o theta=35° vlevo
  const theta = (35 * Math.PI) / 180;
  const ball0 = {
    x: -spacing - L * Math.sin(theta),
    y: pivotY - L * Math.cos(theta),
  };
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-newtonova-kolebka',
      title: 'Newtonova kolébka',
      curriculum: { subject: 'fyzika', grade: 9, topic: 'hybnost a srážky' },
    },
    world: { gravity: { x: 0, y: -9.81 } },
    camera: { center: { x: 0, y: 3 }, metersPerScreenH: 6 },
    entities: [
      {
        kind: 'body',
        id: 'frame',
        name: 'Rám',
        bodyType: 'static',
        transform: { x: 0, y: pivotY + 0.15 },
        shapes: [{ type: 'box', hw: 1.2, hh: 0.15 }],
        material: { density: 1000, friction: 0.3, restitution: 0.0 },
        appearance: { fill: '#64748b' },
      },
      // Kulička 0 — zatažena vlevo
      {
        kind: 'body',
        id: 'ball-0',
        name: 'Kulička 1',
        bodyType: 'dynamic',
        transform: { x: ball0.x, y: ball0.y },
        shapes: [{ type: 'circle', r }],
        material: { density: 7800, friction: 0.0, restitution: 0.98 },
        appearance: { fill: '#94a3b8' },
      },
      // Kulička 1 — středová, v klidu
      {
        kind: 'body',
        id: 'ball-1',
        name: 'Kulička 2',
        bodyType: 'dynamic',
        transform: { x: 0, y: restY },
        shapes: [{ type: 'circle', r }],
        material: { density: 7800, friction: 0.0, restitution: 0.98 },
        appearance: { fill: '#94a3b8' },
      },
      // Kulička 2 — pravá, v klidu
      {
        kind: 'body',
        id: 'ball-2',
        name: 'Kulička 3',
        bodyType: 'dynamic',
        transform: { x: spacing, y: restY },
        shapes: [{ type: 'circle', r }],
        material: { density: 7800, friction: 0.0, restitution: 0.98 },
        appearance: { fill: '#94a3b8' },
      },
      // Závěsy (axle joints)
      {
        kind: 'joint',
        id: 'string-0',
        name: 'Závěs 1',
        type: 'axle',
        bodyA: null,
        bodyB: 'ball-0',
        anchorA: { x: pivots[0]!.x, y: pivots[0]!.y },
        anchorB: { x: pivots[0]!.x - ball0.x, y: pivots[0]!.y - ball0.y },
      },
      {
        kind: 'joint',
        id: 'string-1',
        name: 'Závěs 2',
        type: 'axle',
        bodyA: null,
        bodyB: 'ball-1',
        anchorA: { x: pivots[1]!.x, y: pivots[1]!.y },
        anchorB: { x: 0, y: L },
      },
      {
        kind: 'joint',
        id: 'string-2',
        name: 'Závěs 3',
        type: 'axle',
        bodyA: null,
        bodyB: 'ball-2',
        anchorA: { x: pivots[2]!.x, y: pivots[2]!.y },
        anchorB: { x: 0, y: L },
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Přeměna energie: kulička klouže po nakloněné rovině bez tření.
 * Potenciální energie → kinetická. Lesson: předpověď max rychlosti.
 * Analyticky: v = √(2gh), h ≈ 2 m → v ≈ 6,26 m/s.
 */
export function rollingRampScene(): SceneDoc {
  const theta = Math.PI / 6; // 30°
  const r = 0.3;
  const s = 4.5; // vzdálenost podél roviny
  const tx = Math.cos(theta);
  const ty = Math.sin(theta);
  const nx = -Math.sin(theta);
  const ny = Math.cos(theta);
  const bx = tx * s + nx * r;
  const by = ty * s + ny * r;
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-kulicka-rampa',
      title: 'Přeměna energie — nakloněná rovina',
      curriculum: { subject: 'fyzika', grade: 8, topic: 'mechanická energie' },
    },
    lesson: {
      question: 'Kulička startuje z výšky ≈ 2 m na hladké nakloněné rovině (bez tření). Jakou maximální rychlost [m/s] dosáhne?',
      prediction: {
        kind: 'numeric',
        targetBodyId: 'ball',
        quantity: 'max-speed',
        tolerance: 0.12,
        unit: 'm/s',
      },
      hint: 'Zákon zachování energie: E_p = E_k → mgh = ½mv² → v = √(2gh).',
      level: 'střední',
    },
    world: { gravity: { x: 0, y: -9.81 } },
    camera: { center: { x: 1.5, y: 1.5 }, metersPerScreenH: 8 },
    entities: [
      {
        kind: 'body',
        id: 'ground',
        name: 'Podlaha',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.0, restitution: 0.0 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'body',
        id: 'ramp',
        name: 'Rovina',
        bodyType: 'static',
        transform: { x: 0, y: 0, angle: theta },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.0, restitution: 0.0 },
        appearance: { fill: '#78716c' },
      },
      {
        kind: 'body',
        id: 'ball',
        name: 'Kulička',
        transform: { x: bx, y: by },
        shapes: [{ type: 'circle', r }],
        material: { density: 800, friction: 0.0, restitution: 0.0 },
        appearance: { fill: '#3b82f6' },
      },
    ],
  } satisfies SceneDocInput);
}

// ---------------------------------------------------------------------------
// F5-C: Dalších 8 kurikulárních scén (30 celkem)
// ---------------------------------------------------------------------------

/**
 * Galilův pokus: ocelová a pěnová koule stejné velikosti puštěné ve vakuu.
 * Dopadnou SOUČASNĚ — tíhové zrychlení nezávisí na hmotnosti. Lesson (choice).
 */
export function twoFallsScene(): SceneDoc {
  const r = 0.28;
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-galileo',
      title: 'Galilův pokus — volný pád',
      curriculum: { subject: 'fyzika', grade: 6, topic: 'pohyb a gravitace' },
    },
    lesson: {
      question: 'Ocelová koule (hustota 7 800 kg/m², velmi těžká) a pěnová koule (hustota 50 kg/m², lehká) jsou stejně velké. Jsou puštěny ze stejné výšky VE VAKUU. Která dopadne dřív?',
      prediction: {
        kind: 'choice',
        choices: [
          { id: 'heavy', label: 'Těžší (ocelová) dopadne dřív' },
          { id: 'same', label: 'Obě dopadnou současně' },
          { id: 'light', label: 'Lehčí (pěnová) dopadne dřív' },
        ],
        correctId: 'same',
      },
      hint: 'Ve vakuu působí jen tíha. Zrychlení g = (m·g)/m = g — nezáleží na hmotnosti!',
      level: 'základní',
    },
    world: { gravity: { x: 0, y: -9.81 }, airDensity: 0 },
    camera: { center: { x: 0, y: 5 }, metersPerScreenH: 14 },
    entities: [
      {
        kind: 'body',
        id: 'ground',
        name: 'Podlaha',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.5, restitution: 0.0 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'body',
        id: 'ball-heavy',
        name: 'Ocelová koule (těžká)',
        transform: { x: -0.8, y: 9.5 },
        shapes: [{ type: 'circle', r }],
        material: { density: 7800, friction: 0.3, restitution: 0.0 },
        appearance: { fill: '#475569' },
      },
      {
        kind: 'body',
        id: 'ball-light',
        name: 'Pěnová koule (lehká)',
        transform: { x: 0.8, y: 9.5 },
        shapes: [{ type: 'circle', r }],
        material: { density: 50, friction: 0.3, restitution: 0.0 },
        appearance: { fill: '#fbbf24' },
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Délka kyvadla a perioda: dvě kyvadla (L=0,8 m a L=2,0 m) vychýlena o 20°.
 * Kratší má kratší periodu (T ∝ √L). Lesson (choice).
 */
export function pendulumLengthScene(): SceneDoc {
  const theta = (20 * Math.PI) / 180;
  const pivot1 = { x: -1.5, y: 3.8 };
  const pivot2 = { x: 1.5, y: 3.8 };
  const L1 = 0.8;
  const L2 = 2.0;
  const r = 0.15;
  const ball1 = {
    x: pivot1.x + L1 * Math.sin(theta),
    y: pivot1.y - L1 * Math.cos(theta),
  };
  const ball2 = {
    x: pivot2.x + L2 * Math.sin(theta),
    y: pivot2.y - L2 * Math.cos(theta),
  };
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-kyvadla-delka',
      title: 'Délka kyvadla a perioda',
      curriculum: { subject: 'fyzika', grade: 8, topic: 'kmitání' },
    },
    lesson: {
      question: 'Dvě kyvadla jsou vychýlena o stejný úhel (20°). Levé má délku závěsu 0,8 m, pravé 2,0 m. Které kyvadlo dokončí jeden celý kmit DŘÍVE?',
      prediction: {
        kind: 'choice',
        choices: [
          { id: 'short', label: 'Levé — kratší závěs (0,8 m)' },
          { id: 'same', label: 'Obě ve stejný čas' },
          { id: 'long', label: 'Pravé — delší závěs (2,0 m)' },
        ],
        correctId: 'short',
      },
      hint: 'Perioda kyvadla: T = 2π · √(L/g). Záleží jen na délce závěsu, ne na hmotnosti.',
      level: 'střední',
    },
    world: { gravity: { x: 0, y: -9.81 } },
    camera: { center: { x: 0, y: 2.5 }, metersPerScreenH: 8 },
    entities: [
      {
        kind: 'body',
        id: 'ground',
        name: 'Podlaha',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.5, restitution: 0.0 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'body',
        id: 'ceiling',
        name: 'Strop',
        bodyType: 'static',
        transform: { x: 0, y: 4.0 },
        shapes: [{ type: 'box', hw: 2.2, hh: 0.15 }],
        material: { density: 1000, friction: 0.3, restitution: 0.0 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'body',
        id: 'bob-1',
        name: 'Závaží 1 (L=0,8 m)',
        transform: { x: ball1.x, y: ball1.y },
        shapes: [{ type: 'circle', r }],
        material: { density: 1000, friction: 0.1, restitution: 0.1 },
        appearance: { fill: '#3b82f6' },
      },
      {
        kind: 'body',
        id: 'bob-2',
        name: 'Závaží 2 (L=2,0 m)',
        transform: { x: ball2.x, y: ball2.y },
        shapes: [{ type: 'circle', r }],
        material: { density: 1000, friction: 0.1, restitution: 0.1 },
        appearance: { fill: '#ef4444' },
      },
      {
        kind: 'joint',
        id: 'string-1',
        name: 'Závěs 1',
        type: 'axle',
        bodyA: null,
        bodyB: 'bob-1',
        anchorA: pivot1,
        anchorB: { x: pivot1.x - ball1.x, y: pivot1.y - ball1.y },
      },
      {
        kind: 'joint',
        id: 'string-2',
        name: 'Závěs 2',
        type: 'axle',
        bodyA: null,
        bodyB: 'bob-2',
        anchorA: pivot2,
        anchorB: { x: pivot2.x - ball2.x, y: pivot2.y - ball2.y },
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Vodorovný vrh z výšky 5 m s počáteční rychlostí 5 m/s (bez odporu vzduchu).
 * Analyticky: t = √(2h/g) ≈ 1,01 s; x = v₀·t ≈ 5,05 m.
 * Lesson (numeric): předpověď vodorovného dostřelu.
 */
export function horizontalThrowScene(): SceneDoc {
  const r = 0.2;
  const v0x = 5.0;
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-vodorovny-vrh',
      title: 'Vodorovný vrh z výšky',
      curriculum: { subject: 'fyzika', grade: 7, topic: 'pohyb' },
    },
    lesson: {
      question: 'Těleso je vrženo VODOROVNĚ z výšky 5 m s počáteční rychlostí 5 m/s (žádný vzduchový odpor). Kde dopadne (vodorovná vzdálenost v m)?',
      prediction: {
        kind: 'numeric',
        targetBodyId: 'ball',
        quantity: 'landing-x',
        tolerance: 0.1,
        unit: 'm',
      },
      hint: 'Vodorovně: x = v₀·t. Svisle: h = ½·g·t² → t = √(2h/g). Dosaď: x = v₀·√(2h/g).',
      level: 'střední',
    },
    world: { gravity: { x: 0, y: -9.81 }, airDensity: 0 },
    camera: { center: { x: 3, y: 3 }, metersPerScreenH: 10 },
    entities: [
      {
        kind: 'body',
        id: 'ground',
        name: 'Podlaha',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.0, restitution: 0.0 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'body',
        id: 'ball',
        name: 'Těleso',
        transform: { x: 0, y: 5.0 + r },
        velocity: { vx: v0x, vy: 0, omega: 0 },
        shapes: [{ type: 'circle', r }],
        material: { density: 1000, friction: 0.0, restitution: 0.0 },
        appearance: { fill: '#ef4444', showVelocity: true },
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Akce a reakce (3. Newtonův zákon): těleso A (≈1 kg) a B (≈2 kg) stlačená pružinou
 * na kluzké podlaze. Po uvolnění letí A rychleji (m·v = konst., p = 0).
 * Lesson (choice).
 */
export function newtonThirdScene(): SceneDoc {
  const hw = 0.3;
  const hh = 0.3;
  // m = density × area, area = (2hw)(2hh) = 0.36 m²
  // m_A ≈ 1 kg: density = 1/0.36 ≈ 3
  // m_B ≈ 2 kg: density = 2/0.36 ≈ 6
  const xA = -1.2;
  const xB = 1.2;
  const yBox = hh;
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-akce-reakce',
      title: 'Akce a reakce — pružina',
      curriculum: { subject: 'fyzika', grade: 8, topic: 'silové účinky' },
    },
    lesson: {
      question: 'Těleso A (≈1 kg) a B (≈2 kg) stojí na kluzké podlaze a je mezi nimi stlačená pružina. Po uvolnění se pohybují v opačných směrech. Které poletí rychleji?',
      prediction: {
        kind: 'choice',
        choices: [
          { id: 'same', label: 'Obě stejně rychle — na obě působí stejná síla' },
          { id: 'a', label: 'A (lehčí) poletí rychleji' },
          { id: 'b', label: 'B (těžší) poletí rychleji' },
        ],
        correctId: 'a',
      },
      hint: 'Zachování hybnosti: p = 0 → m_A·v_A = m_B·v_B → v_A/v_B = m_B/m_A = 2.',
      level: 'střední',
    },
    world: { gravity: { x: 0, y: -9.81 }, airDensity: 0 },
    camera: { center: { x: 0, y: 1.2 }, metersPerScreenH: 7 },
    entities: [
      {
        kind: 'body',
        id: 'ground',
        name: 'Kluzká podlaha',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.0, restitution: 0.0 },
        appearance: { fill: '#e2e8f0' },
      },
      {
        kind: 'body',
        id: 'box-a',
        name: 'Těleso A (≈1 kg)',
        transform: { x: xA, y: yBox },
        shapes: [{ type: 'box', hw, hh }],
        material: { density: 3, friction: 0.0, restitution: 0.0 },
        appearance: { fill: '#3b82f6', showVelocity: true },
      },
      {
        kind: 'body',
        id: 'box-b',
        name: 'Těleso B (≈2 kg)',
        transform: { x: xB, y: yBox },
        shapes: [{ type: 'box', hw, hh }],
        material: { density: 6, friction: 0.0, restitution: 0.0 },
        appearance: { fill: '#f59e0b', showVelocity: true },
      },
      {
        kind: 'joint',
        id: 'spring',
        name: 'Pružina (stlačená)',
        type: 'spring',
        bodyA: 'box-a',
        bodyB: 'box-b',
        anchorA: { x: hw, y: 0 },
        anchorB: { x: -hw, y: 0 },
        spring: { restLength: 3.0, stiffness: 100, damping: 0.0 },
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Moment síly — rovnováha páky: závaží 2 kg (1 m vlevo) vs závaží 1 kg (2 m vpravo).
 * Momenty se vyrovnají → páka zůstane vodorovně. Neintuitivní! Lesson (choice).
 */
export function momentBalanceScene(): SceneDoc {
  const levHw = 2.8;
  const levHh = 0.05;
  const levY = 0.55;
  const r = 0.2;
  // density = mass / (π·r²); pro m=2 kg a r=0.2: ρ=2/(π·0.04)≈16 kg/m²
  const densityA = 16; // ≈ 2.01 kg
  const densityB = 8;  // ≈ 1.01 kg
  const massY = levY + levHh + r;
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-moment-rovnovaha',
      title: 'Moment síly — rovnováha páky',
      curriculum: { subject: 'fyzika', grade: 9, topic: 'tuhé těleso' },
    },
    lesson: {
      question: 'Páka je ve vodorovné poloze. Závaží A (≈2 kg) sedí 1 m VLEVO od čepu. Závaží B (≈1 kg) sedí 2 m VPRAVO od čepu. Co se stane po spuštění simulace?',
      prediction: {
        kind: 'choice',
        choices: [
          { id: 'left', label: 'Levá strana klesne — závaží A je těžší' },
          { id: 'balance', label: 'Páka zůstane přibližně vodorovně — momenty sil jsou stejné' },
          { id: 'right', label: 'Pravá strana klesne — závaží B je dál od čepu' },
        ],
        correctId: 'balance',
      },
      hint: 'Moment síly M = F · d. Pro A: 2 kg × 1 m = 2 (N·m/g). Pro B: 1 kg × 2 m = 2 (N·m/g). Stejné momenty = rovnováha!',
      level: 'střední',
    },
    world: { gravity: { x: 0, y: -9.81 } },
    camera: { center: { x: 0.5, y: 1.2 }, metersPerScreenH: 6 },
    entities: [
      {
        kind: 'body',
        id: 'ground',
        name: 'Podlaha',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.5, restitution: 0.0 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'body',
        id: 'support',
        name: 'Podpora',
        bodyType: 'static',
        transform: { x: 0, y: 0.22 },
        shapes: [{ type: 'box', hw: 0.06, hh: 0.22 }],
        material: { density: 1000, friction: 0.5, restitution: 0.0 },
        appearance: { fill: '#64748b' },
      },
      {
        kind: 'body',
        id: 'lever',
        name: 'Páka',
        bodyType: 'dynamic',
        transform: { x: 0, y: levY },
        shapes: [{ type: 'box', hw: levHw, hh: levHh }],
        material: { density: 200, friction: 0.3, restitution: 0.0 },
        appearance: { fill: '#b45309' },
      },
      {
        kind: 'joint',
        id: 'pivot',
        name: 'Čep páky',
        type: 'axle',
        bodyA: null,
        bodyB: 'lever',
        anchorA: { x: 0, y: levY },
        anchorB: { x: 0, y: 0 },
      },
      {
        kind: 'body',
        id: 'mass-a',
        name: 'Závaží A (≈2 kg, 1 m vlevo)',
        transform: { x: -1.0, y: massY },
        shapes: [{ type: 'circle', r }],
        material: { density: densityA, friction: 0.8, restitution: 0.0 },
        appearance: { fill: '#dc2626' },
      },
      {
        kind: 'body',
        id: 'mass-b',
        name: 'Závaží B (≈1 kg, 2 m vpravo)',
        transform: { x: 2.0, y: massY },
        shapes: [{ type: 'circle', r }],
        material: { density: densityB, friction: 0.8, restitution: 0.0 },
        appearance: { fill: '#16a34a' },
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Pružnost odrazu (restituce): tři míče padají ze stejné výšky s různou restitucí.
 * Červený (e=0,05) se téměř neodrází; zelený (e=0,9) skáče téměř do původní výšky.
 * Explorační scéna — bez lekce.
 */
export function restitutionScene(): SceneDoc {
  const r = 0.25;
  const startY = 5.0 + r;
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-restituce',
      title: 'Pružnost odrazu — restituce',
      curriculum: { subject: 'fyzika', grade: 7, topic: 'silové účinky' },
    },
    world: { gravity: { x: 0, y: -9.81 }, airDensity: 0 },
    camera: { center: { x: 0, y: 3.5 }, metersPerScreenH: 10 },
    entities: [
      {
        kind: 'body',
        id: 'ground',
        name: 'Podlaha',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.5, restitution: 0.0 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'body',
        id: 'ball-plastic',
        name: 'Plastický (e=0,05)',
        transform: { x: -1.5, y: startY },
        shapes: [{ type: 'circle', r }],
        material: { density: 1000, friction: 0.3, restitution: 0.05 },
        appearance: { fill: '#ef4444' },
      },
      {
        kind: 'body',
        id: 'ball-mid',
        name: 'Poloelastický (e=0,5)',
        transform: { x: 0, y: startY },
        shapes: [{ type: 'circle', r }],
        material: { density: 1000, friction: 0.3, restitution: 0.5 },
        appearance: { fill: '#f59e0b' },
      },
      {
        kind: 'body',
        id: 'ball-elastic',
        name: 'Pružný (e=0,9)',
        transform: { x: 1.5, y: startY },
        shapes: [{ type: 'circle', r }],
        material: { density: 1000, friction: 0.3, restitution: 0.9 },
        appearance: { fill: '#10b981' },
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Kruhový pohyb: motor otáčí ramenem s koulí na konci (ω=2 rad/s).
 * Závaží opisuje kružnici — pozoruj dostředivou sílu v FBD díagramu.
 * Explorační scéna bez lekce.
 */
export function circularMotionScene(): SceneDoc {
  const pivotY = 4.0;
  const armHw = 1.2;
  const armHh = 0.04;
  const ballR = 0.22;
  const omega = 2.0;
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-kruhovy-pohyb',
      title: 'Kruhový pohyb — motor a osa',
      curriculum: { subject: 'fyzika', grade: 8, topic: 'pohyb' },
    },
    world: { gravity: { x: 0, y: -9.81 } },
    camera: { center: { x: 0, y: pivotY }, metersPerScreenH: 8 },
    entities: [
      {
        kind: 'body',
        id: 'hub',
        name: 'Osa (pevná)',
        bodyType: 'static',
        transform: { x: 0, y: pivotY },
        shapes: [{ type: 'circle', r: 0.12 }],
        material: { density: 1000, friction: 0.3, restitution: 0.0 },
        appearance: { fill: '#64748b' },
      },
      {
        kind: 'body',
        id: 'spinner',
        name: 'Rameno + závaží',
        bodyType: 'dynamic',
        transform: { x: 0, y: pivotY },
        velocity: { vx: 0, vy: 0, omega },
        shapes: [
          { type: 'box', hw: armHw, hh: armHh, offset: { x: armHw, y: 0 } },
          { type: 'circle', r: ballR, offset: { x: armHw * 2 + ballR, y: 0 } },
        ],
        material: { density: 15, friction: 0.3, restitution: 0.0 },
        appearance: { fill: '#6366f1' },
      },
      {
        kind: 'joint',
        id: 'motor-axle',
        name: 'Motor',
        type: 'axle',
        bodyA: null,
        bodyB: 'spinner',
        anchorA: { x: 0, y: pivotY },
        anchorB: { x: 0, y: 0 },
        axle: { enabled: true, targetVelocity: omega, maxTorque: 500 },
      },
    ],
  } satisfies SceneDocInput);
}

/**
 * Pád ve vzduchu — terminální rychlost: těžká vs. lehká koule stejného rozměru.
 * Těžší dopadne dřív (velká tíha, malý relativní odpor vzduchu).
 * Lehčí rychle dosáhne terminální rychlosti ≈ 5,4 m/s a padá pomalu.
 * Lesson (choice).
 */
export function airResistanceFallScene(): SceneDoc {
  const r = 0.3;
  const startY = 14.7;
  return parseSceneDoc({
    format: 'fyzlab-scene',
    version: 1,
    meta: {
      id: 'preset-pad-ve-vzduchu',
      title: 'Pád ve vzduchu — terminální rychlost',
      curriculum: { subject: 'fyzika', grade: 8, topic: 'silové účinky' },
    },
    lesson: {
      question: 'Obě koule mají STEJNÝ PRŮMĚR (r=0,3 m). Koule A (hustota 200 kg/m², ≈56 kg) a B (hustota 3 kg/m², ≈0,8 kg) padají vzduchem ze stejné výšky. Která dopadne dřív?',
      prediction: {
        kind: 'choice',
        choices: [
          { id: 'same', label: 'Obě současně — Galilěův zákon' },
          { id: 'heavy', label: 'Těžší A dříve — velká tíha, malý relativní odpor' },
          { id: 'light', label: 'Lehčí B dříve — menší tíha k překonání' },
        ],
        correctId: 'heavy',
      },
      hint: 'Galilěův zákon platí jen VE VAKUU. Ve vzduchu závisí odpor na průřezu, ale tíha na hmotnosti → těžší objekt má výhodu.',
      level: 'střední',
    },
    world: { gravity: { x: 0, y: -9.81 }, airDensity: 1.2 },
    camera: { center: { x: 0, y: 8 }, metersPerScreenH: 22 },
    entities: [
      {
        kind: 'body',
        id: 'ground',
        name: 'Podlaha',
        bodyType: 'static',
        transform: { x: 0, y: 0 },
        shapes: [{ type: 'plane' }],
        material: { density: 1000, friction: 0.5, restitution: 0.0 },
        appearance: { fill: '#94a3b8' },
      },
      {
        kind: 'body',
        id: 'ball-heavy',
        name: 'Koule A — těžká (ρ=200, ≈56 kg)',
        transform: { x: -0.8, y: startY },
        shapes: [{ type: 'circle', r }],
        material: { density: 200, friction: 0.3, restitution: 0.0 },
        appearance: { fill: '#475569', showVelocity: true },
      },
      {
        kind: 'body',
        id: 'ball-light',
        name: 'Koule B — lehká (ρ=3, ≈0,8 kg)',
        transform: { x: 0.8, y: startY },
        shapes: [{ type: 'circle', r }],
        material: { density: 3, friction: 0.3, restitution: 0.0 },
        appearance: { fill: '#fbbf24', showVelocity: true },
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
