import { useState } from 'react';

interface Props {
  contentId: string;
  /** LaTeX zdroj — pokud je k dispozici, zobrazí se tlačítko Kopírovat LaTeX. */
  latex?: string;
  /** Cesta ke zkompilovanému PDF (vstup pro vektorový export i tlačítko Otevřít). */
  pdfHref?: string;
  /** Počet stran zdrojového PDF — pro správné rozvržení 1×/2×/4× exportu. */
  pdfPageCount?: number;
}

type Layout = 1 | 2 | 4;

// A4 portrait — milimetry pro layout, body (pt) pro výstup PDF (1 mm = 2.83465 pt).
const MM_TO_PT = 2.83465;
const A4_W_MM = 210;
const A4_H_MM = 297;
const MARGIN = 12; // mm — vnější okraj
const GAP = 4;     // mm — mezera mezi buňkami v 2× / 4× layoutu

/** Rozměry jedné buňky (mm) pro daný layout. */
function cellMM(layout: Layout) {
  if (layout === 1) {
    return { w: A4_W_MM - 2 * MARGIN, h: A4_H_MM - 2 * MARGIN };
  }
  if (layout === 2) {
    return { w: (A4_W_MM - 2 * MARGIN - GAP) / 2, h: A4_H_MM - 2 * MARGIN };
  }
  return {
    w: (A4_W_MM - 2 * MARGIN - GAP) / 2,
    h: (A4_H_MM - 2 * MARGIN - GAP) / 2,
  };
}

/** Pozice levého-horního rohu každé buňky na listu (v mm). */
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

export default function NotebookExport({ contentId, latex, pdfHref, pdfPageCount }: Props) {
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

  function handleOpen() {
    if (!pdfHref) return;
    window.open(pdfHref, '_blank', 'noopener,noreferrer');
  }

  /**
   * Vektorový export — embeduje stránky zdrojového PDF do nového A4 dokumentu
   * v layoutu 1×/2×/4×. Text v exportu zůstává kopírovatelný (žádná rasterizace).
   */
  async function exportFromPdf(srcUrl: string) {
    const { PDFDocument } = await import('pdf-lib');
    const srcBytes = await fetch(srcUrl).then((r) => {
      if (!r.ok) throw new Error(`Fetch PDF failed: ${r.status}`);
      return r.arrayBuffer();
    });
    const srcDoc = await PDFDocument.load(srcBytes);
    const totalPages = srcDoc.getPageCount();

    const outDoc = await PDFDocument.create();
    const embedded = await outDoc.embedPdf(
      srcDoc,
      Array.from({ length: totalPages }, (_, i) => i),
    );

    const cell = cellMM(layout);
    const cellWPt = cell.w * MM_TO_PT;
    const cellHPt = cell.h * MM_TO_PT;
    const a4WPt = A4_W_MM * MM_TO_PT;
    const a4HPt = A4_H_MM * MM_TO_PT;

    const positions = cellPositions(layout);
    const cellsPerSheet = positions.length;
    const isMultiPage = totalPages >= 2;

    // Které stránky zdroje jdou do kterých buněk (napříč všemi listy):
    //  - vícestránkový dokument: 1 stránka zdroje → 1 buňka
    //  - jednostránkový dokument: replikace na všechny buňky 1 listu (worksheet)
    const cellContents: number[] = [];
    if (isMultiPage) {
      for (let i = 0; i < totalPages; i++) cellContents.push(i);
    } else {
      for (let i = 0; i < cellsPerSheet; i++) cellContents.push(0);
    }
    const sheetCount = Math.ceil(cellContents.length / cellsPerSheet);

    for (let sheet = 0; sheet < sheetCount; sheet++) {
      const page = outDoc.addPage([a4WPt, a4HPt]);
      const sheetStart = sheet * cellsPerSheet;
      const sheetEnd = Math.min(sheetStart + cellsPerSheet, cellContents.length);
      const filledCells = sheetEnd - sheetStart;

      for (let c = sheetStart; c < sheetEnd; c++) {
        const emb = embedded[cellContents[c]];
        const [xMm, yMm] = positions[c - sheetStart];

        // Fit-into-cell, zachovat poměr stran zdrojové stránky.
        const srcAspect = emb.height / emb.width;
        const cellAspect = cellHPt / cellWPt;
        let placedWPt: number, placedHPt: number;
        if (srcAspect <= cellAspect) {
          placedWPt = cellWPt;
          placedHPt = cellWPt * srcAspect;
        } else {
          placedHPt = cellHPt;
          placedWPt = cellHPt / srcAspect;
        }

        // Vycentruj v rámci buňky vodorovně, vertikálně zarovnej k hornímu okraji.
        const cellOffsetXPt = (cellWPt - placedWPt) / 2;
        const xPt = xMm * MM_TO_PT + cellOffsetXPt;
        // PDF souřadnice mají počátek vlevo dole; yMm je od horního okraje listu.
        const yPt = a4HPt - yMm * MM_TO_PT - placedHPt;

        page.drawPage(emb, { x: xPt, y: yPt, width: placedWPt, height: placedHPt });
      }

      // Čáry pro stříhání (jen pokud je list dostatečně zaplněný).
      if (layout >= 2 && filledCells >= 2) {
        const midX = (MARGIN + cell.w + GAP / 2) * MM_TO_PT;
        page.drawLine({
          start: { x: midX, y: (MARGIN - 4) * MM_TO_PT },
          end:   { x: midX, y: a4HPt - (MARGIN - 4) * MM_TO_PT },
          thickness: 0.5,
          dashArray: [2, 2],
          opacity: 0.4,
        });
      }
      if (layout === 4 && filledCells >= 3) {
        const midY = a4HPt - (MARGIN + cell.h + GAP / 2) * MM_TO_PT;
        page.drawLine({
          start: { x: (MARGIN - 4) * MM_TO_PT, y: midY },
          end:   { x: a4WPt - (MARGIN - 4) * MM_TO_PT, y: midY },
          thickness: 0.5,
          dashArray: [2, 2],
          opacity: 0.4,
        });
      }
    }

    const bytes = await outDoc.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zapis-${layout}x.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Fallback pro stránky bez zkompilovaného PDF (před prvním CI runem) —
   * rasterizuje obsah .notebook-entry do JPEG a skládá do A4 přes jspdf.
   */
  async function exportFromHtml() {
    const source = document.getElementById(contentId);
    if (!source) return;
    const sourceEntry = source.querySelector('.notebook-entry') as HTMLElement | null;
    if (!sourceEntry) return;

    const latexPages = Array.from(sourceEntry.querySelectorAll(':scope > .latex-page')) as HTMLElement[];
    const directSvgs = Array.from(sourceEntry.children).filter(
      (el) => el.tagName.toLowerCase() === 'svg',
    ) as SVGElement[];
    const pages: string[] =
      latexPages.length >= 2 ? latexPages.map((p) => p.innerHTML)
      : directSvgs.length >= 2 ? directSvgs.map((s) => s.outerHTML)
      : [sourceEntry.innerHTML];

    const cell = cellMM(layout);
    const renderPxPerMM = 3;
    const renderWidthPx = Math.round(cell.w * renderPxPerMM);

    const [{ toJpeg }, { jsPDF }] = await Promise.all([
      import('html-to-image'),
      import('jspdf'),
    ]);

    const images: Array<{ data: string; w: number; h: number }> = [];
    for (let pIdx = 0; pIdx < pages.length; pIdx++) {
      const stage = document.createElement('div');
      stage.className = `notebook-print notebook-print--${layout}x`;
      stage.style.cssText = [
        'position:fixed', 'left:0', 'top:0', `width:${renderWidthPx}px`,
        'background:#ffffff', 'color:#111111', 'z-index:9998',
      ].join(';');
      stage.innerHTML = pages[pIdx];
      document.body.appendChild(stage);
      try {
        if (stage.innerHTML.includes('$$')) {
          const { default: katex } = await import('katex');
          stage.innerHTML = stage.innerHTML.replace(/\$\$(.*?)\$\$/g, (_, tex) => {
            try { return katex.renderToString(tex, { throwOnError: false, displayMode: true }); }
            catch { return tex; }
          });
        }
        if (document.fonts && document.fonts.ready) await document.fonts.ready;
        await new Promise<void>((r) => requestAnimationFrame(() => r()));

        const data = await toJpeg(stage, { pixelRatio: 3, backgroundColor: '#ffffff', quality: 0.92, cacheBust: true });
        const img = new Image();
        await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = data; });
        images.push({ data, w: img.width, h: img.height });
      } finally {
        if (stage.parentNode) stage.parentNode.removeChild(stage);
      }
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const positions = cellPositions(layout);
    const cellsPerSheet = positions.length;
    const cellAspect = cell.h / cell.w;
    const isMultiPage = pages.length >= 2;

    const cellContents: number[] = [];
    if (isMultiPage) for (let i = 0; i < images.length; i++) cellContents.push(i);
    else for (let i = 0; i < cellsPerSheet; i++) cellContents.push(0);

    const sheetCount = Math.ceil(cellContents.length / cellsPerSheet);
    for (let sheet = 0; sheet < sheetCount; sheet++) {
      if (sheet > 0) doc.addPage();
      const sheetStart = sheet * cellsPerSheet;
      const sheetEnd = Math.min(sheetStart + cellsPerSheet, cellContents.length);
      const filledCells = sheetEnd - sheetStart;
      for (let c = sheetStart; c < sheetEnd; c++) {
        const img = images[cellContents[c]];
        const [x, y] = positions[c - sheetStart];
        const imgAspect = img.h / img.w;
        let placedW: number, placedH: number;
        if (imgAspect <= cellAspect) { placedW = cell.w; placedH = cell.w * imgAspect; }
        else { placedH = cell.h; placedW = cell.h / imgAspect; }
        const cellOffsetX = (cell.w - placedW) / 2;
        doc.addImage(img.data, 'JPEG', x + cellOffsetX, y, placedW, placedH);
      }
      if (layout >= 2 && filledCells >= 2) {
        doc.setDrawColor(170);
        doc.setLineDashPattern([2, 2], 0);
        const midX = MARGIN + cell.w + GAP / 2;
        doc.line(midX, MARGIN - 4, midX, A4_H_MM - MARGIN + 4);
      }
      if (layout === 4 && filledCells >= 3) {
        const midY = MARGIN + cell.h + GAP / 2;
        doc.line(MARGIN - 4, midY, A4_W_MM - MARGIN + 4, midY);
      }
    }
    doc.save(`zapis-${layout}x.pdf`);
  }

  async function handleExport() {
    setExporting(true);
    let overlay: HTMLDivElement | null = null;
    try {
      overlay = document.createElement('div');
      overlay.style.cssText = [
        'position:fixed', 'inset:0', 'background:rgba(255,255,255,0.96)',
        'z-index:9999', 'display:flex', 'align-items:center', 'justify-content:center',
        'font:600 16px system-ui,-apple-system,Segoe UI,sans-serif', 'color:#1e40af',
      ].join(';');
      overlay.textContent = 'Exportuji PDF…';
      document.body.appendChild(overlay);

      if (pdfHref) await exportFromPdf(pdfHref);
      else         await exportFromHtml();
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
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
      {pdfHref && (
        <button
          onClick={handleOpen}
          className="px-4 py-1.5 text-sm bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Otevře zdrojové PDF v nové záložce"
        >
          Otevřít v novém okně
        </button>
      )}
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
