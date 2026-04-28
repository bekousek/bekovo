/**
 * Pomocný skript: přidá latex pole do notebookEntry zadaného subtopic JSON.
 * Použití: node scripts/_insert-latex.mjs <id> <latex-file>
 * Např.:   node scripts/_insert-latex.mjs kapaliny-7--vztlakova-sila /tmp/vztlak.tex
 * Nebo:    node scripts/_insert-latex.mjs kapaliny-7--vztlakova-sila - (ze stdin)
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const [,, id, src] = process.argv;
if (!id || !src) {
  console.error('Použití: node scripts/_insert-latex.mjs <subtopic-id> <soubor.tex|-stdin>');
  process.exit(1);
}

const latex = src === '-'
  ? readFileSync('/dev/stdin', 'utf8')
  : readFileSync(src, 'utf8');

const jsonPath = join(projectRoot, 'src', 'content', 'subtopics', `${id}.json`);
const data = JSON.parse(readFileSync(jsonPath, 'utf8'));

if (!data.notebookEntry) data.notebookEntry = {};
data.notebookEntry.latex = latex;

writeFileSync(jsonPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log(`✓ latex pole vloženo do ${id}.json`);
