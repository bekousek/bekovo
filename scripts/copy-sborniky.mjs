/**
 * Zkopíruje PDF sborníky z lokální složky `Externí materiály` (mimo git, kvůli velikosti)
 * do `public/sborniky/` s URL-friendly názvy, aby se daly otevřít na webu v nové kartě.
 *
 * Spuštění (z kořene repa): node scripts/copy-sborniky.mjs
 *
 * Mapování názvů PDF v `Externí materiály/` na URL-friendly slug používaný v kódu:
 *   "Dílny Heuréky 2022.pdf"            → "dilny-heureky-2022.pdf"
 *   "VNUF 2024.pdf"                      → "vnuf-2024.pdf"
 *   "Elixír nápadů 1.pdf"               → "elixir-napadu-1.pdf"
 *   "Sborník dílen Elixíru 2017.pdf"    → "sbornik-dilen-elixiru-2017.pdf"
 *   "Paper Science.pdf"                  → "paper-science.pdf"
 */
import { readdir, mkdir, copyFile, stat } from 'fs/promises';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
// Externí materiály je o úroveň výš (v ../bekovo/Externí materiály),
// případně lze přepsat proměnnou prostředí EXT_DIR.
const DEFAULT_EXT_DIR = resolve(root, '..', 'Externí materiály');
const EXT_DIR = process.env.EXT_DIR ? resolve(process.env.EXT_DIR) : DEFAULT_EXT_DIR;
const OUT_DIR = join(root, 'public', 'sborniky');

const STRIP_DIACRITICS = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '');

const slugify = (filename) => {
  // Oddělit příponu
  const dot = filename.lastIndexOf('.');
  const base = dot > -1 ? filename.slice(0, dot) : filename;
  const ext = dot > -1 ? filename.slice(dot) : '';
  const slug = STRIP_DIACRITICS(base)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug + ext.toLowerCase();
};

async function main() {
  let entries;
  try {
    entries = await readdir(EXT_DIR);
  } catch (err) {
    console.error(`Nepodařilo se otevřít složku: ${EXT_DIR}`);
    console.error('Nastav proměnnou EXT_DIR nebo umísti složku "Externí materiály" do nadřazeného adresáře.');
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  let copied = 0;
  let skipped = 0;
  for (const name of entries) {
    if (!name.toLowerCase().endsWith('.pdf')) continue;
    const src = join(EXT_DIR, name);
    const slug = slugify(name);
    const dest = join(OUT_DIR, slug);

    try {
      const [srcStat, destStat] = await Promise.all([
        stat(src),
        stat(dest).catch(() => null),
      ]);
      if (destStat && destStat.size === srcStat.size && destStat.mtimeMs >= srcStat.mtimeMs) {
        skipped++;
        continue;
      }
      await copyFile(src, dest);
      console.log(`✓ ${name} → public/sborniky/${slug}`);
      copied++;
    } catch (err) {
      console.error(`✗ ${name}: ${err.message}`);
    }
  }

  console.log(`\nZkopírováno ${copied} souboru, přeskočeno ${skipped} (již aktuální).`);
}

main();
