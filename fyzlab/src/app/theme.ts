/**
 * Theming — design tokeny pro canvas (PixiJS) a přepínání světlého/tmavého motivu.
 *
 * UI barvy jsou definovány jako CSS proměnné v styles.css.
 * Canvas (PixiJS) potřebuje numerické hex hodnoty — ty jsou zde, odvozené
 * 1:1 od stejných tokenů (canvasBg = --surface-0, accent = --accent, …).
 */

export type ThemeMode = 'light' | 'dark';

/** Paleta pro PixiJS renderer — numerické 0xRRGGBB hodnoty. */
export interface CanvasPalette {
  /** Pozadí plátna — stejné jako --surface-0. */
  canvasBg: number;
  gridMinor: number;
  gridMajor: number;
  gridAxis: number;
  /** Obrys těles. */
  bodyStroke: number;
  /** Neutrální „konstrukční" barva — klouby, koncovky přístrojů. */
  structureColor: number;
  /** Akcent výběru/náhledů na plátně — stejný jako --accent. */
  accent: number;
  /** Vektory rychlosti. */
  vectorVelocity: number;
  /** Násobitel jasu optických paprsků (1 = beze změny; <1 ztmavuje pro kontrast na světlém pozadí). */
  raySpectrumFactor: number;
}

const LIGHT_PALETTE: CanvasPalette = {
  canvasBg: 0xf1f5f9,
  gridMinor: 0xe2e8f0,
  gridMajor: 0xcbd5e1,
  gridAxis: 0x94a3b8,
  bodyStroke: 0x0f172a,
  structureColor: 0x334155,
  accent: 0x4f46e5,
  vectorVelocity: 0x3b82f6,
  raySpectrumFactor: 0.82,
};

const DARK_PALETTE: CanvasPalette = {
  canvasBg: 0x0f172a,
  gridMinor: 0x1e293b,
  gridMajor: 0x334155,
  gridAxis: 0x475569,
  bodyStroke: 0x94a3b8,
  structureColor: 0x94a3b8,
  accent: 0x818cf8,
  vectorVelocity: 0x60a5fa,
  raySpectrumFactor: 1,
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
