import { useState } from 'react';

interface Props {
  contentId: string;
  /** LaTeX zdroj (volitelný) — pokud je k dispozici, zobrazí se tlačítko Kopírovat LaTeX. */
  latex?: string;
}

type Layout = 1 | 2 | 4;

// A4 portrait dimensions in millimetres.
const A4_W = 210;
const A4_H = 297;
const MARGIN = 12; // outer page margin
const GAP = 4;     // gap between cells in 2× / 4× layouts

/**
 * One-cell dimensions on the page (mm) for each layout.
 *  1× → one cell occupying full printable area
 *  2× → two cells side-by-side (each ≈ A5 portrait)
 *  4× → 2×2 grid of cells (each ≈ quarter A4)
 */
function cellMM(layout: Layout) {
  if (layout === 1) {
    return { w: A4_W - 2 * MARGIN, h: A4_H - 2 * MARGIN };
  }
  if (layout === 2) {
    return { w: (A4_W - 2 * MARGIN - GAP) / 2, h: A4_H - 2 * MARGIN };
  }
  // layout === 4
  return {
    w: (A4_W - 2 * MARGIN - GAP) / 2,
    h: (A4_H - 2 * MARGIN - GAP) / 2,
  };
}

/** Top-left mm coordinates of every cell on the page. */
function cellPositions(layout: Layout): Array<[number, number]> {
  const c = cellMM(layout);
  if (layout === 1) return [[MARGIN, MARGIN]];
  if (layout === 2) {
    return [
      [MARGIN, MARGIN],
      [MARGIN + c.w + GAP, MARGIN],
    ];
  }
  return [
    [MARGIN, MARGIN],
    [MARGIN + c.w + GAP, MARGIN],
    [MARGIN, MARGIN + c.h + GAP],
    [MARGIN + c.w + GAP, MARGIN + c.h + GAP],
  ];
}

/**
 * Vrátí HTML jednotlivých "stránek dokumentu" k vytisknutí.
 * - Pokud `.notebook-entry` obsahuje 2+ wrapperů `.latex-page`
 *   (vícestránkový LaTeX), každý wrapper je samostatná stránka.
 * - Pokud obsahuje 2+ přímých <svg> potomků, totéž.
 * - Jinak je celý obsah jedna stránka (HTML legacy / single-page LaTeX).
 */
function collectDocumentPages(entry: HTMLElement): string[] {
  const latexPages = Array.from(entry.querySelectorAll(':scope > .latex-page')) as HTMLElement[];
  if (latexPages.length >= 2) {
    return latexPages.map((p) => p.innerHTML);
  }
  const directSvgs = Array.from(entry.children).filter(
    (el) => el.tagName.toLowerCase() === 'svg'
  ) as SVGElement[];
  if (directSvgs.length >= 2) {
    return directSvgs.map((svg) => svg.outerHTML);
  }
  return [entry.innerHTML];
}

export default function NotebookExport({ contentId, latex }: Props) {
  const [layout, setLayout] = useState<Layout>(1);
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopyLatex() {
    if (!latex) return;
    try {
      await navigator.clipboard.writeText(latex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Kopírování LaTeXu selhalo:', err);
      // Fallback pro starší browsery
      const ta = document.createElement('textarea');
      ta.value = latex;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } finally {
        document.body.removeChild(ta);
      }
    }
  }

  async function handleExport() {
    setExporting(true);
    let stage: HTMLDivElement | null = null;
    let overlay: HTMLDivElement | null = null;
    try {
      const source = document.getElementById(contentId);
      if (!source) return;
      const sourceEntry = source.querySelector('.notebook-entry') as HTMLElement | null;
      if (!sourceEntry) return;

      // Najdi stránky dokumentu (1 pro single, N pro multi-page LaTeX)
      const pages = collectDocumentPages(sourceEntry);

      const cell = cellMM(layout);
      // Render at ~3 CSS px per millimetre. Combined with pixelRatio=3 below,
      // this gives ~450 DPI inside the cell — well above the 300 DPI print
      // threshold while keeping JPEG file size reasonable.
      const renderPxPerMM = 3;
      const renderWidthPx = Math.round(cell.w * renderPxPerMM);

      // Společný overlay pro celý průběh exportu
      overlay = document.createElement('div');
      overlay.style.cssText = [
        'position:fixed',
        'inset:0',
        'background:rgba(255,255,255,0.96)',
        'z-index:9999',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'font:600 16px system-ui,-apple-system,Segoe UI,sans-serif',
        'color:#1e40af',
      ].join(';');
      overlay.textContent = 'Exportuji PDF…';
      document.body.appendChild(overlay);

      const [{ toJpeg }, { jsPDF }] = await Promise.all([
        import('html-to-image'),
        import('jspdf'),
      ]);

      // Vyrenderuj každou stránku dokumentu zvlášť do JPEG
      const images: Array<{ data: string; w: number; h: number }> = [];
      for (let pIdx = 0; pIdx < pages.length; pIdx++) {
        // Render container with the LaTeX-like print stylesheet
        // (`.notebook-print`), sized to the target CELL width — not the page
        // width.
        //
        // NOTE: html-to-image must capture an element that is FULLY VISIBLE in
        // the viewport with no opacity/visibility hacks. Stage is on-screen
        // but covered by overlay.
        stage = document.createElement('div');
        stage.className = `notebook-print notebook-print--${layout}x`;
        stage.style.cssText = [
          'position:fixed',
          'left:0',
          'top:0',
          `width:${renderWidthPx}px`,
          'background:#ffffff',
          'color:#111111',
          'z-index:9998',
        ].join(';');
        stage.innerHTML = pages[pIdx];
        document.body.appendChild(stage);

        // Pokud KaTeX ještě nedoběhl, vyrenderuj $$...$$ teď ve stage
        if (stage.innerHTML.includes('$$')) {
          const { default: katex } = await import('katex');
          stage.innerHTML = stage.innerHTML.replace(/\$\$(.*?)\$\$/g, (_, tex) => {
            try {
              return katex.renderToString(tex, { throwOnError: false, displayMode: true });
            } catch {
              return tex;
            }
          });
        }

        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
        }
        await new Promise<void>((r) => requestAnimationFrame(() => r()));

        const imgData = await toJpeg(stage, {
          pixelRatio: 3,
          backgroundColor: '#ffffff',
          quality: 0.92,
          cacheBust: true,
        });

        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = imgData;
        });

        images.push({ data: imgData, w: img.width, h: img.height });

        if (stage.parentNode) stage.parentNode.removeChild(stage);
        stage = null;
      }

      const doc = new jsPDF('p', 'mm', 'a4');
      const positions = cellPositions(layout);
      const cellsPerSheet = positions.length;

      const cellAspect = cell.h / cell.w;

      // Pro single-page dokumenty zachovej původní chování:
      // 1× = 1 kopie, 2× = 2 kopie, 4× = 4 kopie (na 1 A4).
      // Pro multi-page (2+ stránek) ber každou stránku jako vlastní obsah.
      const isMultiPage = pages.length >= 2;

      // Sestaví seznam "co umístit do každé buňky", napříč všemi A4 listy
      const cellContents: number[] = [];
      if (isMultiPage) {
        // [0, 1, 2, ..., N-1] → každá doc-page jednou
        for (let i = 0; i < images.length; i++) cellContents.push(i);
      } else {
        // Single-page: replikuj na všechny buňky 1 A4 listu (worksheet style)
        for (let i = 0; i < cellsPerSheet; i++) cellContents.push(0);
      }

      const sheetCount = Math.ceil(cellContents.length / cellsPerSheet);

      for (let sheet = 0; sheet < sheetCount; sheet++) {
        if (sheet > 0) doc.addPage();

        // Kolik buněk má TENTO list
        const sheetStart = sheet * cellsPerSheet;
        const sheetEnd = Math.min(sheetStart + cellsPerSheet, cellContents.length);
        const filledCells = sheetEnd - sheetStart;

        for (let c = sheetStart; c < sheetEnd; c++) {
          const imgIdx = cellContents[c];
          const img = images[imgIdx];
          const [x, y] = positions[c - sheetStart];

          const imgAspect = img.h / img.w;
          let placedW: number, placedH: number;
          if (imgAspect <= cellAspect) {
            placedW = cell.w;
            placedH = cell.w * imgAspect;
          } else {
            placedH = cell.h;
            placedW = cell.h / imgAspect;
          }
          const cellOffsetX = (cell.w - placedW) / 2;
          doc.addImage(img.data, 'JPEG', x + cellOffsetX, y, placedW, placedH);
        }

        // Cut lines mezi buňkami — kreslit jen když má list 2+ vyplněných buněk
        if (layout >= 2 && filledCells >= 2) {
          doc.setDrawColor(170);
          doc.setLineDashPattern([2, 2], 0);
          const midX = MARGIN + cell.w + GAP / 2;
          doc.line(midX, MARGIN - 4, midX, A4_H - MARGIN + 4);
        }
        if (layout === 4 && filledCells >= 3) {
          const midY = MARGIN + cell.h + GAP / 2;
          doc.line(MARGIN - 4, midY, A4_W - MARGIN + 4, midY);
        }
      }

      doc.save(`zapis-${layout}x.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      if (stage && stage.parentNode) {
        stage.parentNode.removeChild(stage);
      }
      setExporting(false);
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm font-medium text-gray-700">Export PDF:</span>
      <div className="flex gap-1">
        {([1, 2, 4] as Layout[]).map((n) => (
          <button
            key={n}
            onClick={() => setLayout(n)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              layout === n
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {n}× na stránku
          </button>
        ))}
      </div>
      <button
        onClick={handleExport}
        disabled={exporting}
        className="px-4 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        {exporting ? 'Exportuji...' : 'Stáhnout PDF'}
      </button>
      {latex && (
        <button
          onClick={handleCopyLatex}
          className="px-4 py-1.5 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
          title="Zkopíruje LaTeX zdrojový kód do schránky"
        >
          {copied ? '✓ Zkopírováno' : 'Kopírovat LaTeX'}
        </button>
      )}
    </div>
  );
}
