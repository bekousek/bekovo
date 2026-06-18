/**
 * Hit-test bodů proti tělesům na main threadu: tvary z dokumentu +
 * aktuální pózy z posledního snapshotu.
 */
import { pointInPolygon, rotate, type Vec2 } from '@engine/core/math';
import { jointWorldAnchors, type PoseLike } from '@engine/scene/jointGeom';
import type { Body, SceneDoc } from '@engine/scene/schema';

export type PoseProvider = (id: string) => PoseLike | null;

/** Leží bod v některém tvaru tělesa? Roviny se přeskakují (jsou nekonečné). */
function bodyContains(ent: Body, pose: PoseLike, p: Vec2): boolean {
  // Bod v lokálních souřadnicích tělesa.
  const local = rotate({ x: p.x - pose.x, y: p.y - pose.y }, -pose.angle);
  for (const shape of ent.shapes) {
    if (shape.type === 'circle') {
      const dx = local.x - shape.offset.x;
      const dy = local.y - shape.offset.y;
      if (dx * dx + dy * dy <= shape.r * shape.r) return true;
    } else if (shape.type === 'box') {
      const l = rotate(
        { x: local.x - shape.offset.x, y: local.y - shape.offset.y },
        -shape.angle,
      );
      if (Math.abs(l.x) <= shape.hw && Math.abs(l.y) <= shape.hh) return true;
    } else if (shape.type === 'polygon') {
      if (pointInPolygon(local, shape.points)) return true;
    }
  }
  return false;
}

/** Vrátí id nejvrchnějšího DYNAMICKÉHO tělesa pod bodem (uchopení), jinak null. */
export function makeHitTester(
  getDoc: () => SceneDoc,
  getPose: PoseProvider,
): (p: Vec2) => string | null {
  return (p: Vec2): string | null => {
    const doc = getDoc();
    // Odzadu = vrchní vrstvy mají přednost.
    for (let i = doc.entities.length - 1; i >= 0; i--) {
      const ent = doc.entities[i]!;
      if (ent.kind !== 'body' || ent.bodyType !== 'dynamic') continue;
      const pose = getPose(ent.id);
      if (!pose) continue;
      if (bodyContains(ent, pose, p)) return ent.id;
    }
    return null;
  };
}

/**
 * Vrátí id všech těles pod bodem odshora dolů — i statických (klouby se
 * připojují i k podstavci či podlaze). Roviny vynechává: kloub „do prázdna"
 * se kotví ke světu, což je fyzikálně totéž.
 */
export function makeStackHitTester(
  getDoc: () => SceneDoc,
  getPose: PoseProvider,
): (p: Vec2) => string[] {
  return (p: Vec2): string[] => {
    const doc = getDoc();
    const out: string[] = [];
    for (let i = doc.entities.length - 1; i >= 0; i--) {
      const ent = doc.entities[i]!;
      if (ent.kind !== 'body') continue;
      const pose = getPose(ent.id);
      if (!pose) continue;
      if (bodyContains(ent, pose, p)) out.push(ent.id);
    }
    return out;
  };
}

/** Vzdálenost bodu od úsečky AB. */
function pointSegmentDistance(p: Vec2, ax: number, ay: number, bx: number, by: number): number {
  const abx = bx - ax;
  const aby = by - ay;
  const len2 = abx * abx + aby * aby;
  const t = len2 > 0 ? Math.max(0, Math.min(1, ((p.x - ax) * abx + (p.y - ay) * aby) / len2)) : 0;
  return Math.hypot(p.x - (ax + abx * t), p.y - (ay + aby * t));
}

/** Najde přístroj (paprsek fotobrány) do `tol` od bodu. */
export function findInstrumentAt(doc: SceneDoc, p: Vec2, tol: number): string | null {
  for (let i = doc.entities.length - 1; i >= 0; i--) {
    const e = doc.entities[i]!;
    if (e.kind !== 'instrument') continue;
    const d = rotate({ x: 0, y: 1 }, e.transform.angle);
    const L = e.gate.halfLength;
    const dist = pointSegmentDistance(
      p,
      e.transform.x - d.x * L,
      e.transform.y - d.y * L,
      e.transform.x + d.x * L,
      e.transform.y + d.y * L,
    );
    if (dist <= tol) return e.id;
  }
  return null;
}

/** Najde kloub, jehož kotva (kterýkoli konec) leží do `tol` od bodu. */
export function findJointAt(
  doc: SceneDoc,
  getPose: PoseProvider,
  p: Vec2,
  tol: number,
): string | null {
  for (let i = doc.entities.length - 1; i >= 0; i--) {
    const e = doc.entities[i]!;
    if (e.kind !== 'joint') continue;
    const anchors = jointWorldAnchors(e, getPose);
    if (!anchors) continue;
    const da = Math.hypot(anchors.a.x - p.x, anchors.a.y - p.y);
    const db = Math.hypot(anchors.b.x - p.x, anchors.b.y - p.y);
    if (Math.min(da, db) <= tol) return e.id;
  }
  return null;
}
