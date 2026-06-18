/**
 * Normalizace vstupu: myš + dotyk + pero přes Pointer Events.
 *
 * Gesta mají přednost před nástrojem:
 *  - 2 dotykové prsty → pinch-pan-zoom kamery; rozběhnuté gesto nástroje
 *    dostane cancel (kritické pro interaktivní tabule — dlaň nesmí kreslit).
 *  - kolečko → zoom ke kurzoru; prostřední tlačítko → pan.
 *  - po skončení pinche jsou zbylé prsty potlačené až do zvednutí všech
 *    (žádné „dokreslení" třetím prstem).
 */
import { clamp, type Vec2 } from '@engine/core/math';
import type { Camera } from '../camera';
import type { ToolManager } from '../tools/ToolManager';
import type { ToolPointerEvent } from '../tools/Tool';

interface ActivePointer {
  screen: Vec2;
  pointerType: string;
}

type Mode = 'idle' | 'tool' | 'pinch' | 'pan';

const LONG_PRESS_MS = 450;
const LONG_PRESS_SLOP_PX = 8;

export class PointerManager {
  private active = new Map<number, ActivePointer>();
  private mode: Mode = 'idle';
  private toolPointerId: number | null = null;
  private panLast: Vec2 | null = null;
  private pinchLast: { mid: Vec2; dist: number } | null = null;
  private suppressedUntilAllUp = false;

  private lpTimer: number | null = null;
  private lpPointerId = -1;
  private lpStart: Vec2 | null = null;

  /** Kontextová akce (radiální menu): pravé tlačítko / long-press dotykem. */
  onContextAction: ((screen: Vec2, world: Vec2) => void) | null = null;
  /** Long-press jen v pauze — za běhu drží prst těleso (drag joint). */
  longPressEnabled: () => boolean = () => true;

  private readonly abort = new AbortController();

  constructor(
    private readonly el: HTMLElement,
    private readonly camera: Camera,
    private readonly tools: ToolManager,
  ) {
    const opts: AddEventListenerOptions = { signal: this.abort.signal };
    el.addEventListener('pointerdown', (e) => this.onDown(e), opts);
    el.addEventListener('pointermove', (e) => this.onMove(e), opts);
    el.addEventListener('pointerup', (e) => this.onUp(e), opts);
    el.addEventListener('pointercancel', (e) => this.onUp(e), opts);
    el.addEventListener('wheel', (e) => this.onWheel(e), { ...opts, passive: false });
    el.addEventListener(
      'contextmenu',
      (e) => {
        e.preventDefault();
        const screen = this.screenPos(e);
        this.onContextAction?.(screen, this.camera.screenToWorld(screen));
      },
      opts,
    );
  }

  private screenPos(e: MouseEvent): Vec2 {
    const rect = this.el.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private toolEvent(e: PointerEvent, screen: Vec2): ToolPointerEvent {
    return {
      world: this.camera.screenToWorld(screen),
      screen,
      pointerId: e.pointerId,
      pointerType: (e.pointerType || 'mouse') as ToolPointerEvent['pointerType'],
      buttons: e.buttons,
      isPrimary: e.isPrimary,
      shiftKey: e.shiftKey,
    };
  }

  private touchPoints(): Vec2[] {
    const pts: Vec2[] = [];
    for (const p of this.active.values()) {
      if (p.pointerType === 'touch') pts.push(p.screen);
    }
    return pts;
  }

  private onDown(e: PointerEvent): void {
    const screen = this.screenPos(e);
    try {
      this.el.setPointerCapture(e.pointerId);
    } catch {
      // Syntetické eventy / již uvolněný pointer — capture není kritická.
    }
    this.active.set(e.pointerId, { screen, pointerType: e.pointerType || 'mouse' });

    // Druhý prst → pinch (a zrušit případné gesto nástroje i long-press).
    if (e.pointerType === 'touch' && this.touchPoints().length === 2) {
      this.clearLongPress();
      if (this.mode === 'tool') {
        this.tools.cancelActive();
        this.toolPointerId = null;
      }
      this.mode = 'pinch';
      this.pinchLast = this.pinchState();
      return;
    }

    if (this.suppressedUntilAllUp || this.mode === 'pinch') return;

    // Prostřední tlačítko = pan.
    if (this.mode === 'idle' && e.pointerType === 'mouse' && e.button === 1) {
      this.mode = 'pan';
      this.panLast = screen;
      return;
    }

    if (this.mode === 'idle' && (e.button === 0 || e.pointerType !== 'mouse')) {
      this.mode = 'tool';
      this.toolPointerId = e.pointerId;
      this.tools.pointerDown(this.toolEvent(e, screen));

      // Long-press dotykem/perem = kontextové menu (myš má pravé tlačítko).
      if (e.pointerType !== 'mouse' && this.longPressEnabled()) {
        this.lpPointerId = e.pointerId;
        this.lpStart = screen;
        this.lpTimer = window.setTimeout(() => this.fireLongPress(), LONG_PRESS_MS);
      }
    }
  }

  private clearLongPress(): void {
    if (this.lpTimer !== null) window.clearTimeout(this.lpTimer);
    this.lpTimer = null;
    this.lpPointerId = -1;
    this.lpStart = null;
  }

  private fireLongPress(): void {
    const start = this.lpStart;
    const pid = this.lpPointerId;
    this.clearLongPress();
    if (!start || this.mode !== 'tool' || this.toolPointerId !== pid) return;
    // Gesto nástroje zrušit; zbytek doteku už nesmí nic kreslit.
    this.tools.cancelActive();
    this.toolPointerId = null;
    this.mode = 'idle';
    this.suppressedUntilAllUp = true;
    this.onContextAction?.(start, this.camera.screenToWorld(start));
  }

  private pinchState(): { mid: Vec2; dist: number } | null {
    const pts = this.touchPoints();
    if (pts.length < 2) return null;
    const a = pts[0]!;
    const b = pts[1]!;
    return {
      mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      dist: Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)),
    };
  }

  private onMove(e: PointerEvent): void {
    const screen = this.screenPos(e);
    const entry = this.active.get(e.pointerId);
    if (entry) entry.screen = screen;

    // Posun nad práh ruší čekající long-press.
    if (
      this.lpTimer !== null &&
      e.pointerId === this.lpPointerId &&
      this.lpStart &&
      Math.hypot(screen.x - this.lpStart.x, screen.y - this.lpStart.y) > LONG_PRESS_SLOP_PX
    ) {
      this.clearLongPress();
    }

    switch (this.mode) {
      case 'pinch': {
        const now = this.pinchState();
        if (now && this.pinchLast) {
          this.camera.panByScreen(now.mid.x - this.pinchLast.mid.x, now.mid.y - this.pinchLast.mid.y);
          this.camera.zoomAt(now.mid, clamp(now.dist / this.pinchLast.dist, 0.5, 2));
          this.pinchLast = now;
        }
        return;
      }
      case 'pan': {
        if (this.panLast) {
          this.camera.panByScreen(screen.x - this.panLast.x, screen.y - this.panLast.y);
          this.panLast = screen;
        }
        return;
      }
      case 'tool': {
        if (e.pointerId === this.toolPointerId) {
          this.tools.pointerMove(this.toolEvent(e, screen));
        }
        return;
      }
      case 'idle':
        return;
    }
  }

  private onUp(e: PointerEvent): void {
    const screen = this.screenPos(e);
    this.active.delete(e.pointerId);
    if (e.pointerId === this.lpPointerId) this.clearLongPress();

    if (this.mode === 'pinch') {
      const touches = this.touchPoints().length;
      if (touches < 2) {
        this.pinchLast = null;
        if (touches === 1) {
          // Zbylý prst nesmí nic „dokreslit".
          this.suppressedUntilAllUp = true;
          this.mode = 'idle';
        } else {
          this.mode = 'idle';
        }
      }
    } else if (this.mode === 'pan' && this.panLast) {
      this.mode = 'idle';
      this.panLast = null;
    } else if (this.mode === 'tool' && e.pointerId === this.toolPointerId) {
      this.tools.pointerUp(this.toolEvent(e, screen));
      this.toolPointerId = null;
      this.mode = 'idle';
    }

    if (this.active.size === 0) {
      this.suppressedUntilAllUp = false;
      if (this.mode !== 'idle') {
        // Pojistka proti uvíznutí v gestu bez aktivních pointerů.
        if (this.mode === 'tool') this.tools.cancelActive();
        this.mode = 'idle';
        this.panLast = null;
        this.pinchLast = null;
        this.toolPointerId = null;
      }
    }
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    const factor = Math.exp(-e.deltaY * 0.0012);
    this.camera.zoomAt(this.screenPos(e), factor);
  }

  dispose(): void {
    this.abort.abort();
  }
}
