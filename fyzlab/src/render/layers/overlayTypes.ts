/**
 * Typy overlay vrstvy (náhledy nástrojů, marquee, výběr). Žijí v render/,
 * aby editor → render závislost zůstala jednosměrná: editorState tyto
 * typy implementuje, OverlayLayer je čte.
 */
import type { AABB, Vec2 } from '@engine/core/math';
import type { Body } from '@engine/scene/schema';

export type Preview =
  | { kind: 'circle'; center: Vec2; r: number; fill: string }
  | { kind: 'box'; center: Vec2; hw: number; hh: number; angle: number; fill: string }
  | { kind: 'polyline'; points: readonly Vec2[]; closed: boolean; fill: string }
  | { kind: 'line'; a: Vec2; b: Vec2 };

export interface SelectedBodyDrawData {
  body: Body;
  pose: { x: number; y: number; angle: number };
}

/** Úchopy transformací kolem výběru (světové souřadnice). */
export interface HandleSet {
  center: Vec2;
  rotate: Vec2;
  scale: Vec2;
  aabb: AABB;
}

/** Co overlay vrstva potřebuje vidět z editoru (pull model, čte se per frame). */
export interface OverlaySource {
  /** Bump při každé změně — overlay se překresluje jen při změně verze. */
  readonly version: number;
  readonly preview: Preview | null;
  readonly marquee: AABB | null;
  /** Vybraná tělesa s aktuálními pózami (pro obrysy). */
  selectedBodies(): SelectedBodyDrawData[];
  /** Vybrané klouby — světové polohy kotev (a = strana A, b = strana B). */
  selectedJoints(): ReadonlyArray<{ a: Vec2; b: Vec2 }>;
  /** Vybrané přístroje — koncové body paprsku. */
  selectedInstruments(): ReadonlyArray<{ a: Vec2; b: Vec2 }>;
  /** Úchopy (null = nezobrazovat, např. za běhu). pxToWorld převádí px → m. */
  handles(pxToWorld: (px: number) => number): HandleSet | null;
}
