#!/usr/bin/env node
/**
 * Kompiluje LaTeX zdroje z notebookEntry.latex polí v subtopic JSON souborech
 * a ukládá výsledné SVG do public/notebook-svgs/{id}.svg.
 *
 * Požadavky:
 *   - pdflatex (TeX Live nebo MiKTeX)
 *   - dvisvgm >= 2.11 s podporou --pdf (vyžaduje Ghostscript/libgs)
 *     NEBO pdf2svg jako fallback
 *   - LaTeX balíčky: tikz, pgfplots, siunitx, lmodern, amsmath, booktabs, array, microtype
 *
 * Použití:
 *   npm run compile-latex
 *   npm run compile-latex -- --id=mereni--teplota   (jen jeden zápis)
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import { mkdtempSync, rmSync } from 'fs';
import { join, resolve, basename, dirname } from 'path';
import { execSync } from 'child_process';
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

let compiled = 0, skipped = 0, failed = 0;

for (const jsonFile of jsonFiles) {
  const data = JSON.parse(readFileSync(jsonFile, 'utf8'));

  if (!data.notebookEntry?.latex) {
    skipped++;
    continue;
  }

  const id     = basename(jsonFile, '.json');
  const svgOut = join(outputDir, `${id}.svg`);

  console.log(`\nKompiluji: ${id}`);

  const tmpDir = mkdtempSync(join(tmpdir(), 'bekovo-latex-'));

  try {
    // --- 1. Zapsat .tex soubor ---
    // Pokud latex obsahuje \documentclass, jde o celý dokument — použij ho přímo.
    // Jinak obal preamble (body-only režim).
    const isFullDocument = data.notebookEntry.latex.includes('\\documentclass');
    const texContent = isFullDocument
      ? data.notebookEntry.latex
      : preamble.replace('% BODY', data.notebookEntry.latex);
    writeFileSync(join(tmpDir, 'document.tex'), texContent, 'utf8');

    // --- 2. pdflatex ---
    execSync('pdflatex -interaction=nonstopmode document.tex', {
      cwd: tmpDir,
      timeout: 90_000,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    // --- 3. PDF → SVG (dvisvgm nebo pdf2svg) ---
    const svgGenerated = tryDvisvgm(tmpDir) || tryPdf2svg(tmpDir);
    if (!svgGenerated) {
      throw new Error(
        'Nepodařilo se konvertovat PDF na SVG.\n' +
        'Nainstaluj dvisvgm (součást TeX Live / MiKTeX) + Ghostscript nebo pdf2svg.'
      );
    }

    // --- 4. Post-processing: odstraň fixní width/height, ponech viewBox ---
    let svg = readFileSync(join(tmpDir, 'output.svg'), 'utf8');
    svg = makeSvgResponsive(svg);

    writeFileSync(svgOut, svg, 'utf8');
    console.log(`  ✓  ${id}.svg`);
    compiled++;

  } catch (err) {
    console.error(`  ✗  Chyba: ${err.message}`);
    const logPath = join(tmpDir, 'document.log');
    if (existsSync(logPath)) {
      const errors = readFileSync(logPath, 'utf8')
        .split('\n')
        .filter(l => l.startsWith('!') || l.startsWith('l.'))
        .slice(0, 10);
      if (errors.length) {
        console.error('  LaTeX log:');
        errors.forEach(l => console.error(`    ${l}`));
      }
    }
    failed++;
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

console.log(`\nHotovo: ${compiled} zkompilováno, ${skipped} přeskočeno, ${failed} chyb`);
if (failed > 0) process.exit(1);

// ─── helpers ────────────────────────────────────────────────────────────────

function tryDvisvgm(cwd) {
  try {
    execSync(
      'dvisvgm --pdf --no-fonts --page=1 -o output.svg document.pdf',
      { cwd, timeout: 30_000, stdio: ['ignore', 'pipe', 'pipe'] }
    );
    return existsSync(join(cwd, 'output.svg'));
  } catch {
    return false;
  }
}

function tryPdf2svg(cwd) {
  try {
    execSync(
      'pdf2svg document.pdf output.svg 1',
      { cwd, timeout: 30_000, stdio: ['ignore', 'pipe', 'pipe'] }
    );
    return existsSync(join(cwd, 'output.svg'));
  } catch {
    return false;
  }
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
