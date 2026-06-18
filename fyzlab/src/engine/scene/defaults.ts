import { parseSceneDoc, type SceneDoc, type SceneDocInput } from './schema';

/** Demo scéna fáze 0: podlaha + dva míče + bedna. */
export function demoScene(): SceneDoc {
  const input: SceneDocInput = {
    format: 'fyzlab-scene',
    version: 1,
    meta: { id: 'demo-fall', title: 'Padající tělesa' },
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
