/**
 * Theming — design tokeny pro canvas (PixiJS) a přepínání světlého/tmavého motivu.
 *
 * UI barvy jsou definovány jako CSS proměnné v styles.css.
 * Canvas (PixiJS) potřebuje numerické hex hodnoty — ty jsou zde.
 */

export type ThemeMode = 'light' | 'dark';

/** Paleta pro PixiJS renderer — numerické 0xRRGGBB hodnoty. */
export interface CanvasPalette {
  canvasBg: number;
  gridMinor: number;
  gridMajor: number;
  gridAxis: number;
  bodyStroke: number;
  bodyFillDefault: number;
  fbdGravity: number;
  fbdNormal: number;
  fbdFriction: number;
  fbdSpring: number;
  fbdOther: number;
  vectorVelocity: number;
}

const LIGHT_PALETTE: CanvasPalette = {
  canvasBg: 0xf1f5f9,
  gridMinor: 0xcbd5e1,
  gridMajor: 0x94a3b8,
  gridAxis: 0x64748b,
  bodyStroke: 0x334155,
  bodyFillDefault: 0xdbeafe,
  fbdGravity: 0xf43f5e,
  fbdNormal: 0x10b981,
  fbdFriction: 0xf59e0b,
  fbdSpring: 0xa78bfa,
  fbdOther: 0x64748b,
  vectorVelocity: 0x3b82f6,
};

const DARK_PALETTE: CanvasPalette = {
  canvasBg: 0x0f172a,
  gridMinor: 0x1e293b,
  gridMajor: 0x334155,
  gridAxis: 0x475569,
  bodyStroke: 0x94a3b8,
  bodyFillDefault: 0x1e3a5f,
  fbdGravity: 0xfb7185,
  fbdNormal: 0x34d399,
  fbdFriction: 0xfbbf24,
  fbdSpring: 0xc4b5fd,
  fbdOther: 0x94a3b8,
  vectorVelocity: 0x60a5fa,
};

/** Vrátí canvas paletu pro daný motiv. */
export function getCanvasPalette(mode: ThemeMode): CanvasPalette {
  return mode === 'dark' ? DARK_PALETTE : LIGHT_PALETTE;
}

/** Zjistí preferovaný motiv ze systémového nastavení. */
function systemPreference(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Načte uložený motiv z localStorage; pokud není uložen, použije systémové nastavení.
 */
export function loadStoredTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem('fyzlab-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // localStorage není dostupný (incognito / SSR)
  }
  return systemPreference();
}

/**
 * Aplikuje motiv: přepne třídu `dark` na `<html>` a uloží volbu do localStorage.
 */
export function applyTheme(mode: ThemeMode): void {
  const html = document.documentElement;
  if (mode === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
  try {
    localStorage.setItem('fyzlab-theme', mode);
  } catch {
    // noop
  }
}
