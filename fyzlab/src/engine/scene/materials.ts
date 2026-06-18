/**
 * Presety materiálů — reálné hustoty (kg/m² při tloušťce 1 m ≈ kg/m³),
 * rozumné tření a restituce pro výuku. Popisky řeší app/i18n (engine je
 * headless); `fill` je doporučená barva, ať led vypadá jako led.
 */
import type { Material } from './schema';

export interface MaterialPreset extends Material {
  id: string;
  fill: string;
}

export const MATERIAL_PRESETS: readonly MaterialPreset[] = [
  { id: 'wood', density: 600, friction: 0.45, restitution: 0.3, fill: '#b45309' },
  { id: 'steel', density: 7850, friction: 0.35, restitution: 0.15, fill: '#94a3b8' },
  { id: 'ice', density: 917, friction: 0.05, restitution: 0.05, fill: '#bae6fd' },
  { id: 'rubber', density: 1100, friction: 1.2, restitution: 0.82, fill: '#1f2937' },
  { id: 'glass', density: 2500, friction: 0.5, restitution: 0.2, fill: '#a5f3fc' },
  { id: 'stone', density: 2600, friction: 0.7, restitution: 0.1, fill: '#78716c' },
  { id: 'foam', density: 30, friction: 0.6, restitution: 0.35, fill: '#e2e8f0' },
  { id: 'gold', density: 19300, friction: 0.45, restitution: 0.1, fill: '#fbbf24' },
  // Vznášet se začne až s hustotou vzduchu (fáze 2) — hodnota je ale reálná už teď.
  { id: 'helium', density: 0.17, friction: 0.1, restitution: 0.5, fill: '#fca5a5' },
] as const;

export function materialPreset(id: string): MaterialPreset | undefined {
  return MATERIAL_PRESETS.find((m) => m.id === id);
}
