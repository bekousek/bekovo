/** Rozhraní nástrojů. Nástroje dostávají světové souřadnice, nikdy pixely. */
import type { Vec2 } from '@engine/core/math';
import type { SimWorkerClient } from '@worker/SimWorkerClient';
import type { DocumentStore } from '../DocumentStore';
import type { EditorState } from '../editorState';
import type { SnapService } from '../snap';
import type { Camera } from '../camera';

export interface ToolPointerEvent {
  world: Vec2;
  screen: Vec2;
  pointerId: number;
  pointerType: 'mouse' | 'touch' | 'pen';
  buttons: number;
  isPrimary: boolean;
  shiftKey: boolean;
}

export interface ToolContext {
  client: SimWorkerClient;
  store: DocumentStore;
  state: EditorState;
  snap: SnapService;
  camera: Camera;
  /** Vrátí id tělesa pod bodem (světové souřadnice), jinak null. */
  hitTest: (p: Vec2) => string | null;
  /** Všechna tělesa pod bodem odshora dolů, i statická (pro klouby). */
  hitTestAll: (p: Vec2) => string[];
  isRunning: () => boolean;
}

export interface Tool {
  readonly id: string;
  pointerDown(e: ToolPointerEvent): void;
  pointerMove(e: ToolPointerEvent): void;
  pointerUp(e: ToolPointerEvent): void;
  /** Násilné ukončení gesta (např. začátek pinche druhým prstem). */
  cancel(): void;
}
