/**
 * coverage.mjs — analyzátor pokrytí podkapitol pro noční rutinu.
 *
 * Použití:
 *   node scripts/coverage.mjs --report           # markdown tabulka pokrytí všech podkapitol
 *   node scripts/coverage.mjs --pick             # vrátí jeden subtopicId nejhůř pokryté podkapitoly
 *   node scripts/coverage.mjs --force <id>       # vrátí konkrétní subtopicId (pro testování)
 *
 * Výstup --pick je ve tvaru `<topicId>--<subtopicId>` (oddělovač "--"), aby se daly
 * snadno mapovat soubory v src/content/subtopics/.
 *
 * Skóre per podkapitola:
 *   chybějící_úkol × 4   (homework < 1)
 *   chybějící_materiály × 2  (materials < 2)
 *   chybějící_pokusy × 1  (experiments < 2)
 *   chybějící_aktivity × 1  (activities < 2)
 *
 * Tie-break: lexikografický `topicId--subtopicId`.
 */
import { readFile, readdir, mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const CONTENT = join(root, 'src', 'content');
const LEDGER_PATH = join(root, '.routine', 'ledger.json');

const COLLECTIONS = ['experiments', 'activities', 'materials', 'homework'];

async function loadJsonFiles(dir) {
  if (!existsSync(dir)) return [];
  const files = await readdir(dir);
  const out = [];
  for (const name of files) {
    if (!name.endsWith('.json')) continue;
    const raw = await readFile(join(dir, name), 'utf-8');
    try {
      out.push(JSON.parse(raw));
    } catch (e) {
      console.error(`! nelze parsovat ${join(dir, name)}: ${e.message}`);
    }
  }
  return out;
}

async function loadLedger() {
  if (!existsSync(LEDGER_PATH)) return { lastPicked: null, history: [], skipUntil: {} };
  try {
    const raw = await readFile(LEDGER_PATH, 'utf-8');
    const data = JSON.parse(raw);
    return {
      lastPicked: data.lastPicked ?? null,
      history: Array.isArray(data.history) ? data.history : [],
      skipUntil: typeof data.skipUntil === 'object' && data.skipUntil ? data.skipUntil : {},
    };
  } catch (e) {
    console.error(`! ledger se nedaří načíst (${e.message}), používám prázdný`);
    return { lastPicked: null, history: [], skipUntil: {} };
  }
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function isSkipped(key, ledger) {
  const until = ledger.skipUntil?.[key];
  if (!until) return false;
  return until > todayIso();
}

function score({ experiments, activities, materials, homework }) {
  let s = 0;
  if (homework < 1) s += 4;
  if (materials < 2) s += 2;
  if (experiments < 2) s += 1;
  if (activities < 2) s += 1;
  return s;
}

async function buildCoverageMap() {
  const subtopics = await loadJsonFiles(join(CONTENT, 'subtopics'));
  const items = {};
  for (const c of COLLECTIONS) {
    items[c] = await loadJsonFiles(join(CONTENT, c));
  }

  const map = new Map();
  for (const st of subtopics) {
    if (!st?.id || !st?.topicId) continue;
    const key = `${st.topicId}--${st.id}`;
    const counts = {
      experiments: items.experiments.filter(i => i.subtopicId === st.id && i.topicId === st.topicId).length,
      activities: items.activities.filter(i => i.subtopicId === st.id && i.topicId === st.topicId).length,
      materials: items.materials.filter(i => i.subtopicId === st.id && i.topicId === st.topicId).length,
      homework: items.homework.filter(i => i.subtopicId === st.id && i.topicId === st.topicId).length,
    };
    map.set(key, { key, topicId: st.topicId, subtopicId: st.id, name: st.name, order: st.order, counts, score: score(counts) });
  }
  return map;
}

async function cmdReport() {
  const map = await buildCoverageMap();
  const ledger = await loadLedger();
  const rows = [...map.values()].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.key.localeCompare(b.key);
  });

  console.log('# Pokrytí podkapitol');
  console.log('');
  console.log(`Generováno: ${todayIso()}`);
  console.log(`Celkem podkapitol: ${rows.length}`);
  console.log('');
  console.log('| Score | Skip-until | Topic--Subtopic | Pokusy | Aktivity | Materiály | Úkoly |');
  console.log('|---:|---|---|---:|---:|---:|---:|');
  for (const r of rows) {
    const skip = ledger.skipUntil?.[r.key] ?? '';
    console.log(`| ${r.score} | ${skip} | ${r.key} | ${r.counts.experiments} | ${r.counts.activities} | ${r.counts.materials} | ${r.counts.homework} |`);
  }
  console.log('');

  const totals = rows.reduce((acc, r) => ({
    experiments: acc.experiments + r.counts.experiments,
    activities: acc.activities + r.counts.activities,
    materials: acc.materials + r.counts.materials,
    homework: acc.homework + r.counts.homework,
  }), { experiments: 0, activities: 0, materials: 0, homework: 0 });

  console.log(`## Celkové součty`);
  console.log('');
  console.log(`- pokusy: ${totals.experiments}`);
  console.log(`- aktivity: ${totals.activities}`);
  console.log(`- materiály: ${totals.materials}`);
  console.log(`- úkoly: ${totals.homework}`);
}

async function cmdPick() {
  const map = await buildCoverageMap();
  const ledger = await loadLedger();
  const candidates = [...map.values()]
    .filter(r => !isSkipped(r.key, ledger))
    .filter(r => r.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.key.localeCompare(b.key);
    });

  if (candidates.length === 0) {
    console.error('! žádný kandidát — všechny podkapitoly jsou plné nebo skipnuté');
    process.exit(2);
  }
  console.log(candidates[0].key);
}

async function cmdForce(id) {
  const map = await buildCoverageMap();
  if (!map.has(id)) {
    console.error(`! neznámé id: ${id}`);
    console.error('  formát: <topicId>--<subtopicId>, např. elektrina--elektromagnet');
    process.exit(2);
  }
  console.log(id);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--report')) {
    await cmdReport();
  } else if (args.includes('--pick')) {
    await cmdPick();
  } else if (args[0] === '--force' && args[1]) {
    await cmdForce(args[1]);
  } else {
    console.error('Použití: node scripts/coverage.mjs --report | --pick | --force <topicId--subtopicId>');
    process.exit(1);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
