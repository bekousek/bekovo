/**
 * coverage.mjs — analyzátor pokrytí podkapitol pro noční rutinu (v2).
 *
 * Použití:
 *   node scripts/coverage.mjs --report           # markdown tabulka pokrytí všech podkapitol
 *   node scripts/coverage.mjs --pick             # vrátí jeden subtopicId k práci dnes
 *   node scripts/coverage.mjs --force <id>       # vrátí konkrétní subtopicId (pro testování)
 *
 * Picker v2 (date-rotation):
 *   1. Den-index (UTC midnight / 86400000) určí dnešní téma: topics[dayIdx % 19].
 *   2. V tomto tématu vyber podkapitolu s nejnižším celkovým počtem položek.
 *   3. Vyloučit:
 *       - podkapitoly v ledger.history za posledních 7 dní (ať nepicke v týdnu 2× to samé)
 *       - podkapitoly v ledger.skipUntil > dnes
 *       - podkapitoly s otevřenými routine větvemi na originu
 *         (git ls-remote origin "refs/heads/routine/*")
 *   4. Pokud dnešní téma nemá žádnou volnou podkapitolu, posuň se na další téma
 *      v rotaci (offset+1, offset+2, ...).
 *   5. Fallback: pokud všech 19 témat selže, ber globálně nejnižší (ignorovat rotaci).
 *
 * Tím je zajištěno: i když uživatel den nezmerguje PR, příští den dostane
 * jiné téma → jiná podkapitola.
 */
import { readFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execFileP = promisify(execFile);

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

function todayUtcMidnightMs() {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

function todayIso() {
  return new Date(todayUtcMidnightMs()).toISOString().slice(0, 10);
}

function isoNDaysAgo(n) {
  return new Date(todayUtcMidnightMs() - n * 86400000).toISOString().slice(0, 10);
}

function isSkipped(key, ledger) {
  const until = ledger.skipUntil?.[key];
  if (!until) return false;
  return until > todayIso();
}

async function loadOpenRoutineBranchSubtopics() {
  // Volá `git ls-remote origin "refs/heads/routine/*"` a vrátí množinu klíčů
  // <topicId>--<subtopicId> z názvů větví. Bezpečně se vrátí prázdné, kdyby
  // remote nebyl dostupný (offline, žádný origin, atd.).
  try {
    const { stdout } = await execFileP('git', ['ls-remote', 'origin', 'refs/heads/routine/*'], {
      cwd: root,
      timeout: 15000,
    });
    const lines = stdout.trim().split(/\r?\n/).filter(Boolean);
    const set = new Set();
    for (const line of lines) {
      const ref = line.split(/\s+/)[1] ?? '';
      const branch = ref.replace(/^refs\/heads\//, '');
      const m = branch.match(/^routine\/nightly-\d{4}-\d{2}-\d{2}-([a-z0-9-]+)--([a-z0-9-]+)$/i);
      if (m) set.add(`${m[1]}--${m[2]}`);
    }
    return set;
  } catch {
    return new Set();
  }
}

function score({ experiments, activities, materials, homework }) {
  // Diagnostické skóre — nepoužívá se k pickování (to dělá total + date rotation),
  // ale ukazuje se v --report aby bylo vidět "zde úplně chybí úkoly atd".
  let s = 0;
  if (homework < 1) s += 4;
  if (materials < 2) s += 2;
  if (experiments < 2) s += 1;
  if (activities < 2) s += 1;
  return s;
}

function totalCount(c) {
  return c.experiments + c.activities + c.materials + c.homework;
}

async function buildCoverageMap() {
  const subtopics = await loadJsonFiles(join(CONTENT, 'subtopics'));
  const items = {};
  for (const c of COLLECTIONS) items[c] = await loadJsonFiles(join(CONTENT, c));

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
    map.set(key, {
      key,
      topicId: st.topicId,
      subtopicId: st.id,
      name: st.name,
      order: st.order,
      counts,
      total: totalCount(counts),
      score: score(counts),
    });
  }
  return map;
}

async function cmdReport() {
  const map = await buildCoverageMap();
  const ledger = await loadLedger();
  const openBranches = await loadOpenRoutineBranchSubtopics();
  const rows = [...map.values()].sort((a, b) => a.total - b.total || a.key.localeCompare(b.key));

  const dayIdx = Math.floor(todayUtcMidnightMs() / 86400000);
  const topics = [...new Set([...map.values()].map(s => s.topicId))].sort();
  const todayTopic = topics[dayIdx % topics.length];

  console.log('# Pokrytí podkapitol');
  console.log('');
  console.log(`Generováno: ${todayIso()}`);
  console.log(`Den-index: ${dayIdx}, dnešní téma v rotaci: **${todayTopic}**`);
  console.log(`Otevřené routine větve na originu: ${openBranches.size}`);
  console.log('');
  console.log('| Total | Pokusy | Aktivity | Materiály | Úkoly | Score | Skip-until | Open PR | Topic--Subtopic |');
  console.log('|---:|---:|---:|---:|---:|---:|---|---|---|');
  for (const r of rows) {
    const skip = ledger.skipUntil?.[r.key] ?? '';
    const open = openBranches.has(r.key) ? '🟡' : '';
    console.log(
      `| ${r.total} | ${r.counts.experiments} | ${r.counts.activities} | ${r.counts.materials} | ${r.counts.homework} | ${r.score} | ${skip} | ${open} | ${r.key} |`
    );
  }
  console.log('');

  const totals = rows.reduce(
    (acc, r) => ({
      experiments: acc.experiments + r.counts.experiments,
      activities: acc.activities + r.counts.activities,
      materials: acc.materials + r.counts.materials,
      homework: acc.homework + r.counts.homework,
    }),
    { experiments: 0, activities: 0, materials: 0, homework: 0 }
  );

  console.log('## Celkové součty');
  console.log('');
  console.log(`- pokusy: ${totals.experiments}`);
  console.log(`- aktivity: ${totals.activities}`);
  console.log(`- materiály: ${totals.materials}`);
  console.log(`- úkoly: ${totals.homework}`);
}

async function cmdPick() {
  const map = await buildCoverageMap();
  const ledger = await loadLedger();
  const subtopics = [...map.values()];
  const topics = [...new Set(subtopics.map(s => s.topicId))].sort();
  const dayIdx = Math.floor(todayUtcMidnightMs() / 86400000);

  // Sloučit vyloučené: poslední 7 dní z ledgeru + open routine větve na originu + skipUntil
  const recentlyPicked = new Set(
    (ledger.history || []).filter(h => h.date >= isoNDaysAgo(7)).map(h => h.subtopic)
  );
  const openBranches = await loadOpenRoutineBranchSubtopics();
  const excluded = new Set([...recentlyPicked, ...openBranches]);

  for (let offset = 0; offset < topics.length; offset++) {
    const topicId = topics[(dayIdx + offset) % topics.length];
    const candidates = subtopics
      .filter(s => s.topicId === topicId)
      .filter(s => !excluded.has(s.key))
      .filter(s => !isSkipped(s.key, ledger))
      .sort((a, b) => a.total - b.total || a.key.localeCompare(b.key));
    if (candidates.length > 0) {
      console.log(candidates[0].key);
      return;
    }
  }

  // Fallback: ignoruj rotaci, ber globálně nejnižší (stále respektuj exclude+skipUntil)
  const fallback = subtopics
    .filter(s => !excluded.has(s.key))
    .filter(s => !isSkipped(s.key, ledger))
    .sort((a, b) => a.total - b.total || a.key.localeCompare(b.key));
  if (fallback.length > 0) {
    console.error('! všechna témata mají recent pick / open PR — fallback na globální');
    console.log(fallback[0].key);
    return;
  }

  console.error('! žádný kandidát — všechny podkapitoly jsou vyloučené');
  process.exit(2);
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
