/**
 * Main-thread fasáda nad simulačním workerem: typované odesílání,
 * callbacky pro příchozí zprávy, koalescence dragMove na 1 zprávu/frame.
 */
import type { Vec2 } from '@engine/core/math';
import type { SceneDoc } from '@engine/scene/schema';
import type { BodyState, InstrumentEvent } from '@engine/core/SimModule';
import type { DocOp } from '@engine/scene/ops';
import type { MainToWorker, SnapshotMsg, WorkerToMain } from './protocol';

export class SimWorkerClient {
  private worker: Worker;
  private readyResolve: (() => void) | null = null;
  private readyReject: ((err: Error) => void) | null = null;
  readonly ready: Promise<void>;

  onSnapshot: ((msg: SnapshotMsg) => void) | null = null;
  onIdTable: ((topologyVersion: number, ids: string[]) => void) | null = null;
  onStatus: ((running: boolean, speed: number) => void) | null = null;
  onStateSync: ((states: BodyState[]) => void) | null = null;
  onEvents: ((events: InstrumentEvent[]) => void) | null = null;
  onError: ((message: string) => void) | null = null;

  private pendingMove: Vec2 | null = null;
  private moveFlushScheduled = false;

  constructor() {
    this.worker = new Worker(new URL('./sim.worker.ts', import.meta.url), {
      type: 'module',
      name: 'fyzlab-sim',
    });
    this.ready = new Promise((resolve, reject) => {
      this.readyResolve = resolve;
      this.readyReject = reject;
    });
    this.worker.onmessage = (e: MessageEvent<WorkerToMain>) => this.handle(e.data);
    this.worker.onerror = (e) => {
      this.readyReject?.(new Error(e.message));
      this.onError?.(e.message);
    };
  }

  private handle(msg: WorkerToMain): void {
    switch (msg.type) {
      case 'ready':
        this.readyResolve?.();
        break;
      case 'error':
        this.readyReject?.(new Error(msg.message));
        this.onError?.(msg.message);
        break;
      case 'idTable':
        this.onIdTable?.(msg.topologyVersion, msg.ids);
        break;
      case 'snapshot':
        this.onSnapshot?.(msg);
        break;
      case 'status':
        this.onStatus?.(msg.running, msg.speed);
        break;
      case 'stateSync':
        this.onStateSync?.(msg.states);
        break;
      case 'events':
        this.onEvents?.(msg.events);
        break;
    }
  }

  private send(msg: MainToWorker, transfer?: Transferable[]): void {
    if (transfer) this.worker.postMessage(msg, transfer);
    else this.worker.postMessage(msg);
  }

  async init(doc: SceneDoc): Promise<void> {
    this.send({ type: 'init', doc });
    await this.ready;
  }

  loadScene(doc: SceneDoc): void {
    this.send({ type: 'loadScene', doc });
  }

  play(): void {
    this.send({ type: 'control', action: 'play' });
  }

  pause(): void {
    this.send({ type: 'control', action: 'pause' });
  }

  step(): void {
    this.send({ type: 'control', action: 'step' });
  }

  patch(ops: DocOp[]): void {
    this.send({ type: 'patch', ops });
  }

  setSpeed(speed: number): void {
    this.send({ type: 'setSpeed', speed });
  }

  requestStateSync(): void {
    this.send({ type: 'requestStateSync' });
  }

  returnBuffer(buffer: ArrayBuffer): void {
    this.send({ type: 'returnBuffer', buffer }, [buffer]);
  }

  // --- Drag s koalescencí pohybu na frame ---------------------------------

  dragStart(entityId: string, p: Vec2): void {
    this.pendingMove = null;
    this.send({ type: 'pointer', ev: { kind: 'dragStart', entityId, x: p.x, y: p.y } });
  }

  dragMove(p: Vec2): void {
    this.pendingMove = { x: p.x, y: p.y };
    if (this.moveFlushScheduled) return;
    this.moveFlushScheduled = true;
    requestAnimationFrame(() => {
      this.moveFlushScheduled = false;
      this.flushMove();
    });
  }

  private flushMove(): void {
    if (!this.pendingMove) return;
    const p = this.pendingMove;
    this.pendingMove = null;
    this.send({ type: 'pointer', ev: { kind: 'dragMove', x: p.x, y: p.y } });
  }

  dragEnd(): void {
    this.flushMove();
    this.send({ type: 'pointer', ev: { kind: 'dragEnd' } });
  }

  dispose(): void {
    this.worker.terminate();
  }
}
