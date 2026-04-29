#!/usr/bin/env node
/**
 * Kompiluje LaTeX zdroje z notebookEntry.latex polí v subtopic JSON souborech
 * a ukládá výsledné SVG do public/notebook-svgs/{id}.svg.
 *
 * Použití:
 *   npm run compile-latex
 *   npm run compile-latex -- --id=mereni--teplota   (jen jeden zápis)
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { mkdtempSync, rmSync } from 'fs';
import { join, resolve, basename, dirname } from 'path';
import { execSync, spawnSync } from 'child_process';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const subtopicsDir = join(projectRoot, 'src', 'content', 'subtopics');
const outputDir    = join(projectRoot, 'public', 'notebook-svgs');
const preambleFile = join(__dirname, 'latex-preamble.tex');

// Volitelný filtr: --id=<subtopicId>
const filterArg = process.argv.find(a => a.startsWith('--id='));
const filterid  = filterArg ? filterArg.split('=')[1] : null;

// ─── Diagnostika dostupných nástrojů ───────────────────────────────────────
console.log('=== Dostupné nástroje ===');
for (const tool of ['pdflatex', 'dvisvgm', 'pdf2svg', 'pdftocairo']) {
  const r = spawnSync('which', [tool], { encoding: 'utf8' });
  console.log(`  ${tool}: ${r.stdout?.trim() || '✗ nenalezen'}`);
}
console.log('=========================\n');

mkdirSync(outputDir, { recursive: true });

const preamble = readFileSync(preambleFile, 'utf8');
if (!preamble.includes('% BODY')) {
  console.error('Chyba: latex-preamble.tex neobsahuje řádek "% BODY"');
  process.exit(1);
}

const jsonFiles = readdirSync(subtopicsDir)
  .filter(f => f.endsWith('.json'))
  .filter(f => !filterid || basename(f, '.json') === filterid)
  .map(f => join(subtopicsDir, f));

if (jsonFiles.length === 0) {
  console.error(filterid ? `Nenalezen subtopic: ${filterid}` : 'Žádné JSON soubory nenalezeny');
  process.exit(1);
}

// Zjisti, kolik souborů má latex pole
const latexFiles = jsonFiles.filter(f => {
  try { return !!JSON.parse(readFileSync(f, 'utf8')).notebookEntry?.latex; } catch { return false; }
});
console.log(`Nalezeno ${latexFiles.length} zápisů k přeložení (z ${jsonFiles.length} subtopics)\n`);

let compiled = 0, skipped = 0, failed = 0;

for (const jsonFile of jsonFiles) {
  let data;
  try {
    data = JSON.parse(readFileSync(jsonFile, 'utf8'));
  } catch (e) {
    console.error(`Chyba parsování ${jsonFile}: ${e.message}`);
    failed++;
    continue;
  }

  if (!data.notebookEntry?.latex) {
    skipped++;
    continue;
  }

  const id     = basename(jsonFile, '.json');
  const svgOut = join(outputDir, `${id}.svg`);

  console.log(`Kompiluji: ${id}`);

  const tmpDir = mkdtempSync(join(tmpdir(), 'bekovo-latex-'));

  try {
    // --- 1. Zapsat .tex soubor ---
    const isFullDocument = data.notebookEntry.latex.includes('\\documentclass');
    const texContent = isFullDocument
      ? data.notebookEntry.latex
      : preamble.replace('% BODY', data.notebookEntry.latex);

    // Normalizuj konce řádků na LF (pro případ CRLF z Windows gitu)
    writeFileSync(join(tmpDir, 'document.tex'), texContent.replace(/\r\n/g, '\n'), 'utf8');

    // --- 2. pdflatex (dvakrát pro správné reference) ---
    for (let pass = 1; pass <= 2; pass++) {
      const r = spawnSync('pdflatex', ['-interaction=nonstopmode', 'document.tex'], {
        cwd: tmpDir,
        timeout: 90_000,
        encoding: 'utf8',
      });
      if (r.status !== 0) {
        const logPath = join(tmpDir, 'document.log');
        const log = existsSync(logPath) ? readFileSync(logPath, 'utf8') : '';
        const errors = log.split('\n').filter(l => l.startsWith('!') || l.match(/^l\.\d/)).slice(0, 15);
        throw new Error(
          `pdflatex pass ${pass} selhala (exit ${r.status})\n` +
          (r.stderr ? `stderr: ${r.stderr.slice(0, 800)}\n` : '') +
          (errors.length ? `LaTeX chyby:\n  ${errors.join('\n  ')}` : '')
        );
      }
    }

    // --- 3. PDF → SVG ---
    const svgGenerated = tryDvisvgm(tmpDir) || tryPdftocairo(tmpDir) || tryPdf2svg(tmpDir);
    if (!svgGenerated) {
      throw new Error(
        'PDF→SVG konverze selhala.\n' +
        'Potřebuješ: dvisvgm + Ghostscript, nebo pdftocairo (poppler-utils), nebo pdf2svg.'
      );
    }

    // --- 4. Post-processing: odstraň fixní width/height, ponech viewBox ---
    let svg = readFileSync(join(tmpDir, 'output.svg'), 'utf8');
    svg = makeSvgResponsive(svg);

    writeFileSync(svgOut, svg, 'utf8');
    console.log(`  ✓  ${id}.svg\n`);
    compiled++;

  } catch (err) {
    console.error(`  ✗  ${err.message}\n`);
    failed++;
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

console.log(`Hotovo: ${compiled} zkompilováno, ${skipped} přeskočeno, ${failed} chyb`);
if (failed > 0) process.exit(1);

// ─── helpers ────────────────────────────────────────────────────────────────

function tryDvisvgm(cwd) {
  const r = spawnSync('dvisvgm', ['--pdf', '--no-fonts', '--page=1', '-o', 'output.svg', 'document.pdf'], {
    cwd, timeout: 30_000, encoding: 'utf8',
  });
  if (r.status === 0 && existsSync(join(cwd, 'output.svg'))) return true;
  if (r.stderr) console.log(`    dvisvgm: ${r.stderr.slice(0, 200)}`);
  return false;
}

function tryPdftocairo(cwd) {
  const r = spawnSync('pdftocairo', ['-svg', '-f', '1', '-l', '1', 'document.pdf', 'output.svg'], {
    cwd, timeout: 30_000, encoding: 'utf8',
  });
  if (r.status === 0 && existsSync(join(cwd, 'output.svg'))) return true;
  if (r.stderr) console.log(`    pdftocairo: ${r.stderr.slice(0, 200)}`);
  return false;
}

function tryPdf2svg(cwd) {
  const r = spawnSync('pdf2svg', ['document.pdf', 'output.svg', '1'], {
    cwd, timeout: 30_000, encoding: 'utf8',
  });
  if (r.status === 0 && existsSync(join(cwd, 'output.svg'))) return true;
  if (r.stderr) console.log(`    pdf2svg: ${r.stderr.slice(0, 200)}`);
  return false;
}

/** Odstraní pevné width/height ze <svg> kořenového elementu, zachová viewBox. */
function makeSvgResponsive(svg) {
  return svg.replace(/<svg([^>]*)>/, (_, attrs) => {
    const cleaned = attrs
      .replace(/\s+width='[^']*'/, '')
      .replace(/\s+height='[^']*'/, '')
      .replace(/\s+width="[^"]*"/, '')
      .replace(/\s+height="[^"]*"/, '');
    return `<svg${cleaned}>`;
  });
}
