/**
 * Nástroje tvorby tvarů: obdélník, kruh, rovina, polygon od ruky (tužka).
 * Náhled jde do overlay vrstvy; Command se commitne až na pointer-up
 * (zrušení gesta je zdarma, undo je uniformní). Kreslit lze i za běhu
 * simulace — těleso se okamžitě účastní (Algodoo live-edit).
 */
import { distance, type Vec2 } from '@engine/core/math';
import { polygonArea, polygonCentroid, simplifyPolyline } from '@engine/rigid/geometry';
import type { Body, Shape } from '@engine/scene/schema';
import { cmdAddEntity } from '../commands';
import { newEntityId } from '../newId';
import type { Tool, ToolContext, ToolPointerEvent } from './Tool';

/** Hravá paleta — nová tělesa barvu střídají. */
const PALETTE = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
];
let colorCursor = 0;
const peekColor = () => PALETTE[colorCursor % PALETTE.length]!;
const takeColor = () => PALETTE[colorCursor++ % PALETTE.length]!;

const MIN_HALF = 0.02; // 2 cm — minimální poloviční rozměr

function makeBody(
  id: string,
  x: number,
  y: number,
  angle: number,
  shapes: Shape[],
  fill: string,
  opts: { isStatic?: boolean; density?: number } = {},
): Body {
  return {
    kind: 'body',
    id,
    bodyType: opts.isStatic ? 'static' : 'dynamic',
    transform: { x, y, angle },
    velocity: { vx: 0, vy: 0, omega: 0 },
    shapes,
    material: { density: opts.density ?? 800, friction: 0.5, restitution: 0.3 },
    appearance: { fill, showVelocity: false },
  };
}

abstract class DraftTool implements Tool {
  abstract readonly id: string;
  protected pointer = -1;

  constructor(protected readonly ctx: ToolContext) {}

  abstract begin(p: Vec2): void;
  abstract update(p: Vec2): void;
  abstract commit(p: Vec2): void;

  pointerDown(e: ToolPointerEvent): void {
    if (this.pointer !== -1) return;
    this.pointer = e.pointerId;
    this.begin(e.world);
  }

  pointerMove(e: ToolPointerEvent): void {
    if (e.pointerId !== this.pointer) return;
    this.update(e.world);
  }

  pointerUp(e: ToolPointerEvent): void {
    if (e.pointerId !== this.pointer) return;
    this.commit(e.world);
    this.reset();
  }

  cancel(): void {
    if (this.pointer === -1) return;
    this.reset();
  }

  protected reset(): void {
    this.pointer = -1;
    this.ctx.state.setPreview(null);
  }
}

export class BoxTool extends DraftTool {
  readonly id = 'box';
  private start: Vec2 | null = null;

  begin(p: Vec2): void {
    this.start = this.ctx.snap.point(p);
  }

  private dims(p: Vec2) {
    const cur = this.ctx.snap.point(p);
    const s = this.start!;
    return {
      center: { x: (s.x + cur.x) / 2, y: (s.y + cur.y) / 2 },
      hw: Math.abs(cur.x - s.x) / 2,
      hh: Math.abs(cur.y - s.y) / 2,
    };
  }

  update(p: Vec2): void {
    const { center, hw, hh } = this.dims(p);
    this.ctx.state.setPreview({ kind: 'box', center, hw, hh, angle: 0, fill: peekColor() });
  }

  commit(p: Vec2): void {
    const { center, hw, hh } = this.dims(p);
    if (hw < MIN_HALF || hh < MIN_HALF) return;
    const doc = this.ctx.store.doc;
    const body = makeBody(
      newEntityId(doc, 'b'),
      center.x,
      center.y,
      0,
      [{ type: 'box', hw, hh, offset: { x: 0, y: 0 }, angle: 0 }],
      takeColor(),
    );
    this.ctx.store.apply(cmdAddEntity('Přidat obdélník', body));
  }
}

export class CircleTool extends DraftTool {
  readonly id = 'circle';
  private center: Vec2 | null = null;

  begin(p: Vec2): void {
    this.center = this.ctx.snap.point(p);
  }

  private radius(p: Vec2): number {
    return this.ctx.snap.length(distance(this.center!, p));
  }

  update(p: Vec2): void {
    this.ctx.state.setPreview({
      kind: 'circle',
      center: this.center!,
      r: Math.max(this.radius(p), MIN_HALF),
      fill: peekColor(),
    });
  }

  commit(p: Vec2): void {
    const r = this.radius(p);
    if (r < MIN_HALF) return;
    const doc = this.ctx.store.doc;
    const body = makeBody(
      newEntityId(doc, 'b'),
      this.center!.x,
      this.center!.y,
      0,
      [{ type: 'circle', r, offset: { x: 0, y: 0 } }],
      takeColor(),
    );
    this.ctx.store.apply(cmdAddEntity('Přidat kruh', body));
  }
}

export class PlaneTool extends DraftTool {
  readonly id = 'plane';
  private start: Vec2 | null = null;
  private angle = 0;

  begin(p: Vec2): void {
    this.start = this.ctx.snap.point(p);
    this.angle = 0;
    this.preview();
  }

  private preview(): void {
    const s = this.start!;
    const dir = { x: Math.cos(this.angle), y: Math.sin(this.angle) };
    this.ctx.state.setPreview({
      kind: 'line',
      a: { x: s.x - dir.x * 60, y: s.y - dir.y * 60 },
      b: { x: s.x + dir.x * 60, y: s.y + dir.y * 60 },
    });
  }

  update(p: Vec2): void {
    const s = this.start!;
    const d = { x: p.x - s.x, y: p.y - s.y };
    // Tah určuje směr povrchu; krátký tah = vodorovná podlaha.
    this.angle = Math.hypot(d.x, d.y) > 0.15 ? this.ctx.snap.angle(Math.atan2(d.y, d.x)) : 0;
    this.preview();
  }

  commit(_p: Vec2): void {
    const s = this.start!;
    const doc = this.ctx.store.doc;
    const body = makeBody(newEntityId(doc, 'b'), s.x, s.y, this.angle, [{ type: 'plane' }], '#94a3b8', {
      isStatic: true,
    });
    this.ctx.store.apply(cmdAddEntity('Přidat rovinu', body));
  }
}

export class PolygonTool extends DraftTool {
  readonly id = 'polygon';
  private points: Vec2[] = [];

  begin(p: Vec2): void {
    this.points = [{ x: p.x, y: p.y }];
  }

  update(p: Vec2): void {
    const last = this.points.at(-1)!;
    if (distance(last, p) >= this.ctx.snap.pxToWorld(2.5)) {
      this.points.push({ x: p.x, y: p.y });
    }
    this.ctx.state.setPreview({
      kind: 'polyline',
      points: this.points,
      closed: false,
      fill: peekColor(),
    });
  }

  commit(_p: Vec2): void {
    const tol = this.ctx.snap.pxToWorld(3);
    let pts = simplifyPolyline(this.points, tol);

    // Uzavřít: případný duplicitní koncový bod pryč.
    while (pts.length >= 2 && distance(pts[0]!, pts.at(-1)!) < tol * 2) pts.pop();
    if (pts.length < 3) return;

    let area = polygonArea(pts);
    const minArea = this.ctx.snap.pxToWorld(12) ** 2;
    if (Math.abs(area) < minArea) return;
    if (area < 0) {
      pts = [...pts].reverse(); // CCW
      area = -area;
    }

    const c = polygonCentroid(pts);
    const local = pts.map((p) => ({ x: p.x - c.x, y: p.y - c.y }));
    const doc = this.ctx.store.doc;
    const body = makeBody(
      newEntityId(doc, 'b'),
      c.x,
      c.y,
      0,
      [{ type: 'polygon', points: local }],
      takeColor(),
    );
    this.ctx.store.apply(cmdAddEntity('Přidat polygon', body));
  }

  protected override reset(): void {
    this.points = [];
    super.reset();
  }
}
