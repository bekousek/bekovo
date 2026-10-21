/**
 * Drobné pomocníky pro skripty prototypů v prohlížeči: úložiště, které přežije
 * soukromý režim, „Hodina" (výběr položek) a dialogy zavíratelné tlačítkem Zpět.
 */

const memory = new Map<string, string>();

export function storeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

export function storeSet(key: string, value: string) {
  memory.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {
    /* soukromý režim / zakázané úložiště — zůstane v paměti */
  }
}

// ---------------------------------------------------------------------------
// Hodina = seznam klíčů položek („e.id", „m.id"…).

const TRAY_KEY = 'bekovo-proto-hodina';
export const TRAY_EVENT = 'proto:hodina';

export function getTray(): string[] {
  try {
    const parsed = JSON.parse(storeGet(TRAY_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((k) => typeof k === 'string') : [];
  } catch {
    return [];
  }
}

export function setTray(keys: string[]) {
  storeSet(TRAY_KEY, JSON.stringify([...new Set(keys)]));
  window.dispatchEvent(new CustomEvent(TRAY_EVENT));
}

export function toggleTray(key: string): boolean {
  const tray = getTray();
  const has = tray.includes(key);
  setTray(has ? tray.filter((k) => k !== key) : [...tray, key]);
  return !has;
}

export const trayHref = (keys: string[]) => `/test1/hodina${keys.length ? `?h=${keys.join(',')}` : ''}`;

// ---------------------------------------------------------------------------
// <dialog> se záznamem v historii: systémové Zpět (Android, gesto v iOS) ho
// zavře místo opuštění stránky, a zavření křížkem/Esc krok v historii vrátí.

const openStack: HTMLDialogElement[] = [];
let closingFromHistory = false;

window.addEventListener('popstate', () => {
  const top = openStack.at(-1);
  if (top?.open) {
    closingFromHistory = true;
    top.close();
    closingFromHistory = false;
  }
});

export function openDialog(dialog: HTMLDialogElement) {
  if (dialog.open) return;
  dialog.showModal();
  openStack.push(dialog);
  history.pushState({ protoDialog: openStack.length }, '');
  if (!dialog.dataset.historyBound) {
    dialog.dataset.historyBound = '1';
    dialog.addEventListener('close', () => {
      const idx = openStack.lastIndexOf(dialog);
      if (idx >= 0) openStack.splice(idx, 1);
      if (!closingFromHistory && history.state?.protoDialog) history.back();
    });
  }
}

/** Zamyká scroll stránky pod otevřeným dialogem (iOS jinak posouvá pozadí). */
export function lockScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}
