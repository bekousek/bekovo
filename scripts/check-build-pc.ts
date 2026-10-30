/**
 * Kontrola dat hry /build-pc. Spuštění: npx tsx scripts/check-build-pc.ts
 * - banka otázek (unikátní id, 4 různé možnosti, vysvětlení, počet na brigádu)
 * - sprity uvnitř plátna
 * - pravidla kompatibility chytají všechny pasti z obchodu
 * - každou zakázku jde splnit za peníze z realistické hodiny
 */
import { QUESTIONS, JOBS, QUESTIONS_PER_JOB, PAY_PER_CORRECT, PERFECT_BONUS, START_SAVINGS } from '../src/components/build-pc/data/questions/index.ts';
import { PARTS, PART_BY_ID } from '../src/components/build-pc/data/parts.ts';
import { SPRITES, ICONS, artInBounds } from '../src/components/build-pc/pixel/sprites.ts';
import { checkBuild, hasErrors } from '../src/components/build-pc/logic/compat.ts';
import { GOALS, cheapestFit } from '../src/components/build-pc/logic/bench.ts';

let failed = 0;
const fail = (msg: string) => { failed++; console.error(`✗ ${msg}`); };
const ok = (msg: string) => console.log(`✓ ${msg}`);

// ——— Otázky ———
const ids = new Set<string>();
for (const q of QUESTIONS) {
  if (ids.has(q.id)) fail(`duplicitní id otázky ${q.id}`);
  ids.add(q.id);
  if (new Set(q.options.map((o) => o.trim().toLowerCase())).size !== 4) fail(`${q.id}: možnosti nejsou 4 různé`);
  if (q.explain.trim().length < 20) fail(`${q.id}: krátké vysvětlení`);
  if (!q.text.trim().endsWith('?') && !q.text.trim().endsWith('…')) fail(`${q.id}: otázka nekončí otazníkem`);
  if (q.img && !(q.img in SPRITES)) fail(`${q.id}: neznámý obrázek ${q.img}`);
}
for (const j of JOBS) {
  const n = QUESTIONS.filter((q) => q.cat === j.id).length;
  if (n < QUESTIONS_PER_JOB * 6) fail(`brigáda ${j.id}: jen ${n} otázek (chce to aspoň ${QUESTIONS_PER_JOB * 6})`);
}
ok(`${QUESTIONS.length} otázek v ${JOBS.length} brigádách`);

// ——— Délka odpovědí nesmí prozradit správnou ———
// Žáci rychle zjistí, že „nejdelší odpověď bývá správně“. Strategie „klikni
// na nejdelší“ smí uspět jen o málo častěji než náhoda (25 %).
let longestHits = 0;
for (const q of QUESTIONS) {
  const lens = q.options.map((o) => o.length);
  const max = Math.max(...lens);
  const ties = lens.filter((l) => l === max).length;
  if (lens[0] === max) longestHits += 1 / ties;
  const longestWrong = Math.max(...lens.slice(1));
  if (lens[0] > longestWrong * 1.25 && lens[0] - longestWrong > 3) {
    fail(`${q.id}: správná odpověď je výrazně delší než všechny špatné (${lens[0]} × ${longestWrong} znaků)`);
  }
}
const longestRate = longestHits / QUESTIONS.length;
if (longestRate > 0.35) fail(`strategie „nejdelší odpověď“ uspěje v ${Math.round(longestRate * 100)} % otázek (max 35 %)`);
for (const j of JOBS) {
  const qs = QUESTIONS.filter((q) => q.cat === j.id);
  const strict = qs.filter((q) => q.options[0].length > Math.max(...q.options.slice(1).map((o) => o.length))).length;
  if (strict / qs.length > 0.4) fail(`brigáda ${j.id}: správná odpověď je nejdelší v ${strict} z ${qs.length} otázek`);
}
ok(`strategie „nejdelší odpověď“ uspěje v ${Math.round(longestRate * 100)} % otázek (náhoda 25 %)`);

// ——— Sprity ———
for (const [k, a] of Object.entries({ ...SPRITES, ...ICONS })) if (!artInBounds(a)) fail(`sprite ${k} přesahuje plátno`);
ok('sprity jsou uvnitř plátna');

// ——— Kompatibilita: pasti musí být chycené ———
const traps: [string, string[]][] = [
  ['Intel CPU do AM5 desky', ['cpu-14400f', 'mb-b650pg']],
  ['DDR4 do DDR5 desky', ['ram-d4-16kit', 'mb-a620m']],
  ['ATX deska do mATX skříně', ['mb-b850', 'case-popmini']],
  ['F procesor bez grafiky', ['cpu-14400f', 'mb-b760d4']],
  ['slabý zdroj na RTX 5070', ['gpu-5070', 'psu-vero-600']],
  ['procesor bez chladiče', ['cpu-9800x3d', 'mb-b650pg']],
  ['Intel chladič na AMD', ['cpu-9700x', 'mb-a620m', 'cool-alpine17']],
];
for (const [name, set] of traps) {
  if (!hasErrors(checkBuild(set))) fail(`kontrola nechytila past: ${name}`);
}
const good = ['cpu-7600', 'mb-b650pg', 'ram-d5-16kit', 'ssd-nv3-1tb', 'gpu-5060', 'psu-vero-600', 'case-ventum', 'os-mint'];
if (hasErrors(checkBuild(good))) fail('dobrá herní sestava hlásí chybu');
ok(`kontrola chytá ${traps.length} pastí a pustí dobrou sestavu`);

// ——— Ekonomika ———
const avgJob = Math.round(QUESTIONS_PER_JOB * 0.7 * PAY_PER_CORRECT + 0.17 * PERFECT_BONUS);
for (const g of GOALS) {
  const c = cheapestFit(g.id);
  if (!c) { fail(`zakázku ${g.id} nejde splnit`); continue; }
  const need = Math.max(0, c.price - START_SAVINGS);
  const jobs = Math.ceil(need / avgJob);
  const parts = Object.values(c.rig).flat().filter((p) => p && typeof p === 'object' && 'id' in p).map((p) => (p as { short: string }).short);
  console.log(`  ${g.title}: nejlevněji ${c.price.toLocaleString('cs-CZ')} Kč → ${jobs} brigád při 70 % (${parts.join(', ')})`);
  if (jobs > 9) fail(`${g.title}: potřeba ${jobs} brigád, to se do hodiny nevejde`);
}
ok(`průměrná brigáda při 70 % správně ≈ ${avgJob} Kč`);

for (const p of PARTS) if (PART_BY_ID[p.id] !== p) fail(`duplicitní id dílu ${p.id}`);

if (failed) { console.error(`\n${failed} chyb`); process.exit(1); }
console.log('\nVšechno v pořádku.');
