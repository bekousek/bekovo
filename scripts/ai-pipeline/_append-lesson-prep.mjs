#!/usr/bin/env node
/**
 * PŘIDÁ (nepřepíše) hodiny do lessonPrep.lessons subtopic JSONu z datových modulů
 *   scripts/ai-pipeline/lesson-prep-append/<subtopicId>.mjs
 * Použití, když podtéma už obsahuje hodiny z jiného ročníku a chceme je zachovat
 * a nové jen připojit na konec (chronologicky další školní rok).
 *
 * Idempotentní: hodiny už přítomné (shoda podle sourceUrl) přeskočí.
 * Zachová pořadí stávajících hodin; nové připojí v pořadí z modulu.
 * Zachová ostatní pole (notebookEntry…); 2-mezerový JSON + koncový \n.
 *
 * Spuštění:
 *   node scripts/ai-pipeline/_append-lesson-prep.mjs            (všechny moduly v append/)
 *   node scripts/ai-pipeline/_append-lesson-prep.mjs elektricke-obvody--elektromagnet
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SUBTOPICS = join(__dirname, '../../src/content/subtopics');
const DATA = join(__dirname, 'lesson-prep-append');

const only = process.argv.slice(2);
const files = readdirSync(DATA)
  .filter((f) => f.endsWith('.mjs'))
  .filter((f) => only.length === 0 || only.includes(f.replace(/\.mjs$/, '')));

let changed = 0, errors = 0;
for (const f of files) {
  const id = f.replace(/\.mjs$/, '');
  const jsonFile = join(SUBTOPICS, `${id}.json`);
  if (!existsSync(jsonFile)) { console.error(`✗ ${id}: subtopic JSON neexistuje`); errors++; continue; }
  const mod = await import(pathToFileURL(join(DATA, f)).href);
  const incoming = mod.default;
  if (!Array.isArray(incoming) || incoming.length === 0) { console.warn(`! ${id}: prázdné, přeskočeno`); continue; }
  const data = JSON.parse(readFileSync(jsonFile, 'utf8'));
  const existing = (data.lessonPrep && Array.isArray(data.lessonPrep.lessons)) ? data.lessonPrep.lessons : [];
  const seen = new Set(existing.map((l) => l.sourceUrl).filter(Boolean));
  const toAdd = incoming.filter((l) => !l.sourceUrl || !seen.has(l.sourceUrl));
  const merged = [...existing, ...toAdd];
  data.lessonPrep = { ...(data.lessonPrep ?? {}), lessons: merged };
  writeFileSync(jsonFile, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`✓ ${id}: +${toAdd.length} (celkem ${merged.length}; přeskočeno ${incoming.length - toAdd.length})`);
  changed++;
}
console.log(`Hotovo: ${changed} podtémat aktualizováno${errors ? `, ${errors} chyb` : ''}.`);
if (errors) process.exit(1);
