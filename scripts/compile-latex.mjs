#!/usr/bin/env node
/**
 * Kompiluje LaTeX zdroje z notebookEntry.latex polí v subtopic JSON souborech
 * a ukládá výsledné SVG do public/notebook-svgs/{id}.svg.
 *
 * Vícestrán kové dokumenty (s \newpage): každá strana → samostatné SVG,
 * výsledek uložen jako pole SVG řetězců v notebookEntry.latexSvg[].
 *
 * Použití:
 *   npm run compile-latex
 *   npm run compile-latex -- --id=mereni--teplota   (jen jeden zápis)
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, copyFileSync } from 'fs';
import { mkdtempSync, rmSync } from 'fs';
import { join, resolve, basename, dirname } from 'path';
import { spawnSync } from 'child_process';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const subtopicsDir = join(projectRoot, 'src', 'content', 'subtopics');
const outputDir    = join(projectRoot, 'public', 'notebook-svgs');
const pdfOutputDir = join(projectRoot, 'public', 'notebook-pdfs');
const preambleFile = join(__dirname, 'latex-preamble.tex');

// Volitelný filtr: --id=<subtopicId>
const filterArg = process.argv.find(a => a.startsWith('--id='));
const filterid  = filterArg ? filterArg.split('=')[1] : null;

// ─── Diagnostika dostupných nástrojů ───────────────────────────────────────
console.log('=== Dostupné nástroje ===');
for (const tool of ['pdflatex', 'pdfinfo', 'dvisvgm', 'pdf2svg', 'pdftocairo']) {
  const r = spawnSync('which', [tool], { encoding: 'utf8' });
  console.log(`  ${tool}: ${r.stdout?.trim() || '✗ nenalezen'}`);
}
console.log('=========================\n');

mkdirSync(outputDir, { recursive: true });
mkdirSync(pdfOutputDir, { recursive: true });

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

    // --- 3. Zjistit počet stran a rozměry ---
    const pdfMeta = getPdfMeta(tmpDir);
    const pageCount = pdfMeta.pageCount;
    console.log(`  Stran: ${pageCount}, rozměry: ${pdfMeta.widthPt}×${pdfMeta.heightPt} pt`);

    // --- 4. PDF → SVG (každá strana zvlášť) ---
    const pageSvgs = [];
    for (let page = 1; page <= pageCount; page++) {
      const outFile = `page-${page}.svg`;
      const ok = tryDvisvgm(tmpDir, page, outFile)
               || tryPdftocairo(tmpDir, page, outFile)
               || tryPdf2svg(tmpDir, page, outFile);
      if (!ok) {
        throw new Error(
          `PDF→SVG konverze selhala (strana ${page}).\n` +
          'Potřebuješ: dvisvgm + Ghostscript, nebo pdftocairo (poppler-utils), nebo pdf2svg.'
        );
      }
      let svg = readFileSync(join(tmpDir, outFile), 'utf8');
      svg = makeSvgResponsive(svg);
      svg = svg.replace(/^\s*<\?xml[^?]*\?>\s*/i, '');
      // Unikátní prefix ID — zabraňuje kolizi při vložení více SVG na jednu HTML stránku
      svg = namespaceSvgIds(svg, `${id}-p${page}`);
      pageSvgs.push(svg);
    }

    // --- 5. Uložit do public/notebook-svgs/ (stránky odděleny prázdným řádkem) ---
    writeFileSync(svgOut, pageSvgs.join('\n'), 'utf8');

    // --- 5b. Zkopírovat PDF do public/notebook-pdfs/ (pro embed na stránce) ---
    const pdfOut = join(pdfOutputDir, `${id}.pdf`);
    copyFileSync(join(tmpDir, 'document.pdf'), pdfOut);

    // --- 6. Uložit inline do JSON ---
    // Pole SVG řetězců — jedno na stránku. Jedno-stranné dokumenty → pole délky 1.
    data.notebookEntry.latexSvg = pageSvgs;
    // Metadata o PDF souboru — soubor sám je v /notebook-pdfs/{id}.pdf.
    // aspectRatio = výška / šířka jedné strany (pro CSS aspect-ratio).
    data.notebookEntry.latexPdf = {
      pageCount,
      aspectRatio: +(pdfMeta.heightPt / pdfMeta.widthPt).toFixed(4),
    };
    writeFileSync(jsonFile, JSON.stringify(data, null, 2) + '\n', 'utf8');

    console.log(`  ✓  ${id}.svg (${pageCount} ${pageCount === 1 ? 'strana' : pageCount < 5 ? 'strany' : 'stran'})\n`);
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

/**
 * Zjistí metadata PDF přes pdfinfo (poppler-utils): počet stran a rozměry
 * první strany v bodech (pt). Fallback: A5 portrait (1 strana, 420×595 pt).
 */
function getPdfMeta(cwd) {
  const r = spawnSync('pdfinfo', ['document.pdf'], { cwd, encoding: 'utf8', timeout: 10_000 });
  if (r.status === 0) {
    const pagesMatch = r.stdout.match(/^Pages:\s+(\d+)/m);
    const sizeMatch  = r.stdout.match(/^Page size:\s+([\d.]+)\s+x\s+([\d.]+)\s*pts/m);
    if (pagesMatch && sizeMatch) {
      return {
        pageCount: parseInt(pagesMatch[1], 10),
        widthPt:   parseFloat(sizeMatch[1]),
        heightPt:  parseFloat(sizeMatch[2]),
      };
    }
  }
  // A5 portrait je default v latex-preamble.tex
  return { pageCount: 1, widthPt: 419.53, heightPt: 595.28 };
}

function tryDvisvgm(cwd, page, outFile) {
  const r = spawnSync('dvisvgm', ['--pdf', '--no-fonts', `--page=${page}`, '-o', outFile, 'document.pdf'], {
    cwd, timeout: 30_000, encoding: 'utf8',
  });
  if (r.status === 0 && existsSync(join(cwd, outFile))) return true;
  if (r.stderr) console.log(`    dvisvgm p${page}: ${r.stderr.slice(0, 200)}`);
  return false;
}

function tryPdftocairo(cwd, page, outFile) {
  const r = spawnSync('pdftocairo', ['-svg', '-f', String(page), '-l', String(page), 'document.pdf', outFile], {
    cwd, timeout: 30_000, encoding: 'utf8',
  });
  if (r.status === 0 && existsSync(join(cwd, outFile))) return true;
  if (r.stderr) console.log(`    pdftocairo p${page}: ${r.stderr.slice(0, 200)}`);
  return false;
}

function tryPdf2svg(cwd, page, outFile) {
  const r = spawnSync('pdf2svg', ['document.pdf', outFile, String(page)], {
    cwd, timeout: 30_000, encoding: 'utf8',
  });
  if (r.status === 0 && existsSync(join(cwd, outFile))) return true;
  if (r.stderr) console.log(`    pdf2svg p${page}: ${r.stderr.slice(0, 200)}`);
  return false;
}

/**
 * Přidá unikátní prefix ke všem ID a interním referencím v SVG.
 * Zabraňuje kolizi ID při vložení více SVG souborů do jedné HTML stránky.
 * Pokrývá: id="...", href="#...", xlink:href="#...", url(#...).
 */
function namespaceSvgIds(svg, prefix) {
  svg = svg.replace(/\bid="([^"]+)"/g,                (_, id) => `id="${prefix}-${id}"`);
  // xlink:href napřed (specifičtější), pak holé href (lookbehind aby se nezachytilo xlink:href znovu)
  svg = svg.replace(/\bxlink:href="#([^"]+)"/g,       (_, id) => `xlink:href="#${prefix}-${id}"`);
  svg = svg.replace(/(?<!:)\bhref="#([^"]+)"/g,        (_, id) => `href="#${prefix}-${id}"`);
  // url(#...) v atributech jako fill, stroke, mask, clip-path, filter, marker-*
  svg = svg.replace(/url\(#([^)]+)\)/g,                (_, id) => `url(#${prefix}-${id})`);
  return svg;
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
