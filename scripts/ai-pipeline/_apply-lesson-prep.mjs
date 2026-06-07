#!/usr/bin/env node
/**
 * Aplikuje lessonPrep.lessons do subtopic JSON z datových modulů
 *   scripts/ai-pipeline/lesson-prep-data/<subtopicId>.mjs
 * (každý default-exportuje pole hodin {title, sourceLessonNo?, date?, content}).
 * Zachová ostatní pole (notebookEntry…); 2-mezerový JSON + koncový \n.
 *
 * Spuštění:
 *   node scripts/ai-pipeline/_apply-lesson-prep.mjs            (všechny datové moduly)
 *   node scripts/ai-pipeline/_apply-lesson-prep.mjs mereni--cas mereni--teplota
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SUBTOPICS = join(__dirname, '../../src/content/subtopics');
const DATA = join(__dirname, 'lesson-prep-data');

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
  const lessons = mod.default;
  if (!Array.isArray(lessons) || lessons.length === 0) { console.warn(`! ${id}: prázdné, přeskočeno`); continue; }
  const data = JSON.parse(readFileSync(jsonFile, 'utf8'));
  data.lessonPrep = { ...(data.lessonPrep ?? {}), lessons };
  writeFileSync(jsonFile, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`✓ ${id}: ${lessons.length} hodin`);
  changed++;
}
console.log(`Hotovo: ${changed} podtémat aktualizováno${errors ? `, ${errors} chyb` : ''}.`);
if (errors) process.exit(1);
