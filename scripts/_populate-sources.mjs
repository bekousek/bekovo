/**
 * Doplní pole `source` k záznamům v src/content/{experiments,activities,homework}
 * podle informací uložených v generačních skriptech (scripts/ai-pipeline/*.ts).
 *
 * Spuštění: node scripts/_populate-sources.mjs
 */
import { readFile, writeFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const CONTENT = join(root, 'src', 'content');

// ---- pomocné: rozpoznat sborník a vrátit { label, pdf? } ------------------
function detectSource(raw) {
  const s = raw.trim();

  // Dílny Heuréky YYYY
  let m = s.match(/D[íi]lny\s+Heur[ée]ky\s+(\d{4})/i);
  if (m) return { label: `Dílny Heuréky ${m[1]}`, pdf: `dilny-heureky-${m[1]}.pdf` };

  // DH YYYY (zkratka v komentářích batch2)
  m = s.match(/^DH\s+(\d{4})/i);
  if (m) return { label: `Dílny Heuréky ${m[1]}`, pdf: `dilny-heureky-${m[1]}.pdf` };

  // Sborník dílen Elixíru YYYY
  m = s.match(/Sborn[íi]k\s+d[íi]len\s+Elix[íi]ru\s+(\d{4})/i);
  if (m) return { label: `Sborník dílen Elixíru ${m[1]}`, pdf: `sbornik-dilen-elixiru-${m[1]}.pdf` };

  // Elixír nápadů N  (1–5)
  m = s.match(/Elix[íi]r\s+n[áa]pad[ůu]\s+(\d)/i);
  if (m) return { label: `Elixír nápadů ${m[1]}`, pdf: `elixir-napadu-${m[1]}.pdf` };

  // Elixír N (zkratka)
  m = s.match(/^Elix[íi]r\s+(\d)\b/i);
  if (m) return { label: `Elixír nápadů ${m[1]}`, pdf: `elixir-napadu-${m[1]}.pdf` };

  // VNUF YYYY
  m = s.match(/VNUF\s+(\d{4})/i);
  if (m) return { label: `VNUF ${m[1]}`, pdf: `vnuf-${m[1]}.pdf` };

  // VNUF (bez roku — nelze určit konkrétní PDF)
  if (/^VNUF\b/i.test(s)) return { label: 'VNUF' };

  // Paper Science
  if (/Paper\s+Science/i.test(s)) return { label: 'Paper Science', pdf: 'paper-science.pdf' };

  return null;
}

// ---- parser: generate-content.ts (má source: '...' field) -----------------
async function parseGenerateContent() {
  const file = await readFile(join(root, 'scripts', 'ai-pipeline', 'generate-content.ts'), 'utf-8');
  const map = new Map();
  // Regex: id: '<id>', ... source: '<...>'
  const blockRe = /\{\s*id:\s*'([^']+)'[\s\S]*?source:\s*'([^']+)'/g;
  let m;
  while ((m = blockRe.exec(file)) !== null) {
    const [, id, source] = m;
    const det = detectSource(source);
    if (det) map.set(id, det);
  }
  return map;
}

// ---- parser: generate-batch2.ts (zdroj v komentáři // === ... === ) -------
async function parseGenerateBatch2() {
  const file = await readFile(join(root, 'scripts', 'ai-pipeline', 'generate-batch2.ts'), 'utf-8');
  const map = new Map();
  const lines = file.split(/\r?\n/);
  let currentSource = null;
  for (const line of lines) {
    const cm = line.match(/^\s*\/\/\s*===\s*(.+?)\s*===/);
    if (cm) { currentSource = cm[1]; continue; }
    const im = line.match(/^\s*id:\s*'([^']+)'/);
    if (im && currentSource) {
      const det = detectSource(currentSource);
      if (det) map.set(im[1], det);
    }
  }
  return map;
}

// ---- aktualizace JSONů ------------------------------------------------------
async function updateJsonsIn(dir, map) {
  let files;
  try { files = await readdir(dir); } catch { return { count: 0, total: 0 }; }
  let count = 0;
  let total = 0;
  for (const name of files) {
    if (!name.endsWith('.json')) continue;
    total++;
    const path = join(dir, name);
    const raw = await readFile(path, 'utf-8');
    const data = JSON.parse(raw);
    if (data.source) continue; // už má — neměnit
    const src = map.get(data.id);
    if (!src) continue;
    data.source = src;
    await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    count++;
  }
  return { count, total };
}

async function main() {
  const a = await parseGenerateContent();
  const b = await parseGenerateBatch2();
  const merged = new Map([...a, ...b]);

  console.log(`Mapování zdrojů: ${merged.size} záznamů (${a.size} z generate-content, ${b.size} z generate-batch2)`);

  const dirs = [
    join(CONTENT, 'experiments'),
    join(CONTENT, 'activities'),
    join(CONTENT, 'homework'),
  ];

  for (const dir of dirs) {
    const { count, total } = await updateJsonsIn(dir, merged);
    console.log(`${dir.replace(root + '\\', '').replace(root + '/', '')}: doplněno ${count} / ${total}`);
  }
}

main();
