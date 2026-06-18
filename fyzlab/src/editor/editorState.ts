/**
 * Sdílený mutable stav editoru mimo React: výběr, náhled nástroje, marquee,
 * úchopy. Overlay vrstva ho čte per frame (přes OverlaySource), React přes
 * subscribe.
 */
import { rotate, type AABB } from '@engine/core/math';
import { jointWorldAnchors, type JointAnchorsWorld } from '@engine/scene/jointGeom';
import type { Body, Instrument, Joint } from '@engine/scene/schema';
import type {
  HandleSet,
  OverlaySource,
  Preview,
  SelectedBodyDrawData,
} from '@render/layers/overlayTypes';
import { bodyWorldAABB, type Pose } from './bounds';

export type PoseProvider = (id: string) => Pose | null;
export type BodyLookup = (id: string) => Body | null;
export type JointLookup = (id: string) => Joint | null;
export type InstrumentLookup = (id: string) => Instrument | null;

export class EditorState implements OverlaySource {
  version = 0;
  preview: Preview | null = null;
  marquee: AABB | null = null;
  readonly selection = new Set<string>();

  private listeners = new Set<() => void>();
  /** Zapojuje bootstrap (doc + snapshot pózy + stav simulace). */
  lookupBody: BodyLookup = () => null;
  lookupJoint: JointLookup = () => null;
  lookupInstrument: InstrumentLookup = () => null;
  lookupPose: PoseProvider = () => null;
  showHandles: () => boolean = () => true;

  /** Póza tělesa: ze snapshotu, jinak z dokumentu (než dorazí snapshot). */
  poseOf(id: string): Pose | null {
    const p = this.lookupPose(id);
    if (p) return p;
    const b = this.lookupBody(id);
    return b ? { x: b.transform.x, y: b.transform.y, angle: b.transform.angle } : null;
  }

  bump(): void {
    this.version += 1;
    for (const fn of this.listeners) fn();
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  setPreview(preview: Preview | null): void {
    this.preview = preview;
    this.bump();
  }

  setMarquee(marquee: AABB | null): void {
    this.marquee = marquee;
    this.bump();
  }

  setSelection(ids: Iterable<string>): void {
    this.selection.clear();
    for (const id of ids) this.selection.add(id);
    this.bump();
  }

  clearSelection(): void {
    if (this.selection.size === 0) return;
    this.selection.clear();
    this.bump();
  }

  selectedBodies(): SelectedBodyDrawData[] {
    const out: SelectedBodyDrawData[] = [];
    for (const id of this.selection) {
      const body = this.lookupBody(id);
      const pose = this.poseOf(id);
      if (body && pose) out.push({ body, pose });
    }
    return out;
  }

  /** Vybrané klouby — světové kotvy pro zvýraznění v overlay. */
  selectedJoints(): JointAnchorsWorld[] {
    const out: JointAnchorsWorld[] = [];
    for (const id of this.selection) {
      const joint = this.lookupJoint(id);
      if (!joint) continue;
      const anchors = jointWorldAnchors(joint, (bid) => this.poseOf(bid));
      if (anchors) out.push(anchors);
    }
    return out;
  }

  /** Vybrané přístroje — koncové body paprsku pro zvýraznění v overlay. */
  selectedInstruments(): JointAnchorsWorld[] {
    const out: JointAnchorsWorld[] = [];
    for (const id of this.selection) {
      const inst = this.lookupInstrument(id);
      if (!inst) continue;
      const d = rotate({ x: 0, y: 1 }, inst.transform.angle);
      const L = inst.gate.halfLength;
      out.push({
        a: { x: inst.transform.x - d.x * L, y: inst.transform.y - d.y * L },
        b: { x: inst.transform.x + d.x * L, y: inst.transform.y + d.y * L },
      });
    }
    return out;
  }

  /** Světové AABB výběru (bez nekonečných rovin). */
  selectionAABB(): AABB | null {
    let acc: AABB | null = null;
    for (const { body, pose } of this.selectedBodies()) {
      const a = bodyWorldAABB(body, pose);
      if (!a) continue;
      if (!acc) acc = { ...a };
      else {
        acc.minX = Math.min(acc.minX, a.minX);
        acc.minY = Math.min(acc.minY, a.minY);
        acc.maxX = Math.max(acc.maxX, a.maxX);
        acc.maxY = Math.max(acc.maxY, a.maxY);
      }
    }
    return acc;
  }

  handles(pxToWorld: (px: number) => number): HandleSet | null {
    if (!this.showHandles() || this.selection.size === 0) return null;
    const aabb = this.selectionAABB();
    if (!aabb) return null;
    const cx = (aabb.minX + aabb.maxX) / 2;
    const cy = (aabb.minY + aabb.maxY) / 2;
    return {
      aabb,
      center: { x: cx, y: cy },
      rotate: { x: cx, y: aabb.maxY + pxToWorld(44) },
      scale: { x: aabb.maxX + pxToWorld(26), y: aabb.minY - pxToWorld(26) },
    };
  }
}
