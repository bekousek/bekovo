/**
 * Wrapper pro ikony z lucide-react.
 * Mapuje logické názvy (např. 'drag', 'play') na konkrétní Lucide komponenty.
 * Fyzikální nástroje bez přesné ikony mají co nejbližší alternativu.
 */
import {
  Activity,
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDot,
  CircleHelp,
  FolderOpen,
  Grid3x3,
  Hand,
  Link,
  Minus,
  Moon,
  Pause,
  PenLine,
  Pin,
  Play,
  Redo2,
  RotateCcw,
  Save,
  Scan,
  SkipForward,
  Spline,
  Square,
  Sun,
  Undo2,
  X,
  Zap,
  Droplets,
  type LucideProps,
} from 'lucide-react';
import type { FC } from 'react';

/** Mapování logických názvů ikon na Lucide komponenty. */
const ICON_MAP = {
  // Nástroje — tělesa
  drag: Hand,
  box: Square,
  circle: Circle,
  polygon: PenLine,
  plane: Minus,
  // Nástroje — spoje
  axle: CircleDot,
  spring: Spline,
  fixed: Pin,
  thruster: ArrowUp,
  // Nástroje — přístroje
  photogate: Scan,
  laser: Zap,
  fluid: Droplets,
  // TopBar
  library: BookOpen,
  open: FolderOpen,
  help: CircleHelp,
  save: Save,
  share: Link,
  vectors: ArrowUpRight,
  tracer: Activity,
  // SimControls
  undo: Undo2,
  redo: Redo2,
  play: Play,
  pause: Pause,
  step: SkipForward,
  reset: RotateCcw,
  // Ostatní
  snap: Grid3x3,
  close: X,
  sun: Sun,
  moon: Moon,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
} satisfies Record<string, FC<LucideProps>>;

export type IconName = keyof typeof ICON_MAP;

export interface IconProps {
  name: IconName;
  /** Velikost v px; výchozí 18 */
  size?: number;
  /** Tloušťka čáry; výchozí 1.75 */
  strokeWidth?: number;
  className?: string;
}

/** Liniová ikona z lucide-react. Vždy aria-hidden (popisek patří do nadřazeného prvku). */
export function Icon({ name, size = 18, strokeWidth = 1.75, className }: IconProps) {
  const Component = ICON_MAP[name];
  return <Component size={size} strokeWidth={strokeWidth} className={className} aria-hidden />;
}
