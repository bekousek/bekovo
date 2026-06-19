/**
 * Pixi v8 renderer: world container (metry, y-up → y-flip), vrstvy
 * grid + bodies, frame smyčka se vzorkováním interpolátoru.
 */
import { Application, Container } from 'pixi.js';
import type { Camera } from '@editor/camera';
import type { Body, SceneDoc } from '@engine/scene/schema';
import { BODY_STRIDE, readBodyInto, type BodySnapshotView } from '@engine/snapshot/layout';
import { Interpolator, type Snapshot } from './Interpolator';
import { BodiesLayer } from './layers/bodiesLayer';
import { GridLayer } from './layers/gridLayer';
import { InstrumentsLayer } from './layers/instrumentsLayer';
import { JointsLayer } from './layers/jointsLayer';
import { OverlayLayer } from './layers/overlayLayer';
import { VectorsLayer } from './layers/vectorsLayer';
import { TracerLayer } from './layers/tracerLayer';
import type { OverlaySource } from './layers/overlayTypes';
import type { SnapshotMsg } from '@worker/protocol';

export interface RenderStats {
  fps: number;
  tickMs: number;
  bodies: number;
  slowMotion: boolean;
  /** Simulační čas posledního snapshotu [s] — stopky. */
  simTime: number;
}

export class Renderer {
  private app: Application;
  private world = new Container();
  private grid = new GridLayer();
  private bodies = new BodiesLayer();
  private joints = new JointsLayer();
  private vectors = new VectorsLayer();
  private tracer = new TracerLayer();
  private instruments = new InstrumentsLayer();
  private overlay = new OverlayLayer();

  /** Globální přepínač vektorů rychlosti (zapojuje bootstrap → uiStore). */
  vectorsEnabled: () => boolean = () => false;
  /** Globální přepínač stopy pohybu (zapojuje bootstrap → uiStore). */
  tracerEnabled: () => boolean = () => false;
  private interp = new Interpolator();
  private overlaySource: OverlaySource | null = null;

  private lastTickMs = 0;
  private lastSlowMotion = false;
  private lastSimTime = 0;
  private fpsEma = 60;
  private lastStatsPush = 0;
  private poseScratch: BodySnapshotView = { x: 0, y: 0, angle: 0, vx: 0, vy: 0, omega: 0 };

  onReleaseBuffer: ((buffer: ArrayBuffer) => void) | null = null;
  onStats: ((stats: RenderStats) => void) | null = null;

  private constructor(
    app: Application,
    private readonly camera: Camera,
  ) {
    this.app = app;
    app.stage.addChild(this.grid.g);
    app.stage.addChild(this.world);
    this.world.addChild(this.bodies.container);
    this.world.addChild(this.joints.g);
    this.world.addChild(this.instruments.g);
    this.world.addChild(this.tracer.g);
    this.world.addChild(this.vectors.g);
    this.world.addChild(this.overlay.g);
    app.ticker.add(() => this.frame());
  }

  attachOverlaySource(src: OverlaySource): void {
    this.overlaySource = src;
  }

  static async create(host: HTMLElement, camera: Camera): Promise<Renderer> {
    const app = new Application();
    await app.init({
      background: '#f8fafc',
      antialias: true,
      preference: 'webgl',
      resizeTo: host,
      resolution: Math.min(globalThis.devicePixelRatio || 1, 2),
      autoDensity: true,
    });
    host.appendChild(app.canvas);
    app.canvas.style.display = 'block';
    return new Renderer(app, camera);
  }

  setScene(doc: SceneDoc, ids: readonly string[]): void {
    this.bodies.setScene(doc, ids);
    this.tracer.setScene(doc);
    this.setDocLayers(doc);
  }

  clearTracer(): void {
    this.tracer.clear();
  }

  /**
   * Obnoví vrstvy čtoucí dokument (klouby, vektory). Změny kloubů/vzhledu
   * nemění topologii těles (worker neposílá idTable), takže to musí volat
   * editor po každé změně dokumentu.
   */
  setDocLayers(doc: SceneDoc): void {
    this.joints.setScene(doc);
    this.vectors.setScene(doc);
    this.instruments.setScene(doc);
  }

  updateEntity(body: Body): void {
    this.bodies.updateEntity(body);
  }

  pushSnapshot(msg: SnapshotMsg): void {
    const snap: Snapshot = {
      seq: msg.seq,
      simTime: msg.simTime,
      topologyVersion: msg.topologyVersion,
      bodyCount: msg.bodyCount,
      bodies: new Float32Array(msg.bodies, 0, msg.bodyCount * BODY_STRIDE),
      buffer: msg.bodies,
      arrivalMs: performance.now(),
    };
    this.lastTickMs = msg.tickMs;
    this.lastSlowMotion = msg.slowMotion;
    this.lastSimTime = msg.simTime;
    for (const released of this.interp.push(snap)) {
      this.onReleaseBuffer?.(released);
    }
  }

  /** Aktuální (poslední známá) póza tělesa — pro hit-test na main threadu. */
  getBodyPose(id: string): BodySnapshotView | null {
    const latest = this.interp.latest;
    if (!latest) return null;
    const index = this.bodies.indexOf(id);
    if (index === undefined || index >= latest.bodyCount) return null;
    return readBodyInto(latest.bodies, index, this.poseScratch);
  }

  private frame(): void {
    const now = performance.now();

    this.camera.setViewport(this.app.screen.width, this.app.screen.height);

    // Transform world containeru: metry → pixely, y-flip.
    const origin = this.camera.worldToScreen({ x: 0, y: 0 });
    this.world.position.set(origin.x, origin.y);
    this.world.scale.set(this.camera.pixelsPerMeter, -this.camera.pixelsPerMeter);

    this.grid.draw(this.camera);
    if (this.overlaySource) this.overlay.draw(this.overlaySource, this.camera.pixelsPerMeter);

    const sample = this.interp.sample(now);
    if (sample) {
      this.bodies.apply(sample);
      if (this.tracerEnabled()) this.tracer.update((id) => this.bodies.poseOf(id));
    }
    if (this.tracerEnabled()) {
      this.tracer.draw(this.camera.pixelsPerMeter);
    }
    this.joints.draw((id) => this.bodies.poseOf(id), this.camera.pixelsPerMeter);
    this.vectors.draw(
      this.interp.latest,
      (id) => this.bodies.indexOf(id),
      this.camera.pixelsPerMeter,
      this.vectorsEnabled(),
    );
    this.instruments.draw(this.camera.pixelsPerMeter);

    // FPS + stats (push ~2× za sekundu)
    const dtMs = this.app.ticker.deltaMS;
    if (dtMs > 0) this.fpsEma = this.fpsEma * 0.95 + (1000 / dtMs) * 0.05;
    if (now - this.lastStatsPush > 500) {
      this.lastStatsPush = now;
      this.onStats?.({
        fps: Math.round(this.fpsEma),
        tickMs: this.lastTickMs,
        bodies: this.interp.latest?.bodyCount ?? 0,
        slowMotion: this.lastSlowMotion,
        simTime: this.lastSimTime,
      });
    }
  }

  dispose(): void {
    for (const b of this.interp.clear()) this.onReleaseBuffer?.(b);
    this.app.destroy(true, { children: true });
  }
}
