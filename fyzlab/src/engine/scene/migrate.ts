/**
 * Migrace dokumentů scény: čistý řetěz v(n) → v(n+1).
 *
 * Pravidla (viz hlavička schema.ts): po prvním vydání každá změna tvaru
 * dokumentu = nová verze + krok zde + zmrazená fixtura staré verze
 * v tests/fixtures/, testovaná v CI navždy. Sdílený odkaz z roku 2026
 * musí jít otevřít i v roce 2030.
 */
import { parseSceneDoc, type SceneDoc } from './schema';

export const CURRENT_VERSION = 1;

type RawDoc = Record<string, unknown>;

/** Index 0 = migrace v1→v2, index 1 = v2→v3, … (zatím žádné). */
const MIGRATIONS: ReadonlyArray<(doc: RawDoc) => RawDoc> = [];

/** Zmigruje surový JSON na aktuální verzi a zvaliduje schématem. */
export function migrateSceneDoc(raw: unknown): SceneDoc {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Neplatná scéna: očekávám JSON objekt.');
  }
  let doc = raw as RawDoc;
  const v = doc.version;
  if (typeof v !== 'number' || !Number.isInteger(v) || v < 1) {
    throw new Error('Neplatná scéna: chybí celočíselná verze.');
  }
  if (v > CURRENT_VERSION) {
    throw new Error(`Scéna je z novější verze FyzLabu (v${v}, umím v${CURRENT_VERSION}).`);
  }
  for (let from = v; from < CURRENT_VERSION; from++) {
    const step = MIGRATIONS[from - 1];
    if (!step) throw new Error(`Chybí migrační krok v${from} → v${from + 1}.`);
    doc = step(doc);
  }
  return parseSceneDoc(doc);
}
