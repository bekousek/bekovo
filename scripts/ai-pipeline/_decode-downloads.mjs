#!/usr/bin/env node
/**
 * Dekóduje stažené Drive soubory z tool-results JSONů na PDF.
 * download_file_content ukládá velké výsledky do
 *   <claude-project>/tool-results/*download_file_content*.txt  (JSON {content:base64,title,…})
 * Tento skript je projde, dekóduje base64 a uloží PDF do scripts/ai-pipeline/handwritten/,
 * pojmenované podle `title` (slug). base64 se nikdy nedostane do kontextu modelu.
 *
 * Spuštění:
 *   node scripts/ai-pipeline/_decode-downloads.mjs "<cesta k tool-results>"
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'handwritten');
mkdirSync(OUT, { recursive: true });

const TR = process.argv[2];
if (!TR || !existsSync(TR)) { console.error('Zadej platnou cestu k tool-results složce.'); process.exit(1); }

const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();

const files = readdirSync(TR).filter((f) => f.includes('download_file_content') && f.endsWith('.txt'));
let n = 0;
for (const f of files) {
  try {
    const j = JSON.parse(readFileSync(join(TR, f), 'utf8'));
    if (!j.content) continue;
    let b64 = j.content;
    const i = b64.indexOf('base64,');
    if (i >= 0) b64 = b64.slice(i + 7);
    const name = slug(j.title || j.id) + '.pdf';
    const out = join(OUT, name);
    if (existsSync(out)) { continue; } // už dekódováno
    const buf = Buffer.from(b64, 'base64');
    writeFileSync(out, buf);
    console.log(`${name}  (${(buf.length / 1024) | 0} KB)`);
    n++;
  } catch (e) { console.error('skip', f, e.message); }
}
console.log(`Dekódováno: ${n} nových PDF.`);
