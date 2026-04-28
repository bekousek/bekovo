import { useState } from 'react';

interface Props {
  contentId: string;
}

type Layout = 1 | 2 | 4;

// A4 portrait dimensions in millimetres.
const A4_W = 210;
const A4_H = 297;
const MARGIN = 12; // outer page margin
const GAP = 4;     // gap between identical copies in 2× / 4× layouts

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

export default function NotebookExport({ contentId }: Props) {
  const [layout, setLayout] = useState<Layout>(1);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    let stage: HTMLDivElement | null = null;
    let overlay: HTMLDivElement | null = null;
    try {
      const source = document.getElementById(contentId);
      if (!source) return;
      const sourceEntry = source.querySelector('.notebook-entry') as HTMLElement | null;
      if (!sourceEntry) return;

      const cell = cellMM(layout);
      // Render at ~3 CSS px per millimetre. Combined with pixelRatio=3 below,
      // this gives ~450 DPI inside the cell — well above the 300 DPI print
      // threshold while keeping JPEG file size reasonable.
      const renderPxPerMM = 3;
      const renderWidthPx = Math.round(cell.w * renderPxPerMM);

      // Render container with the LaTeX-like print stylesheet
      // (`.notebook-print`), sized to the target CELL width — not the page
      // width. The image is then placed once / twice / four times in the PDF.
      //
      // NOTE: html-to-image must capture an element that is FULLY VISIBLE in
      // the viewport with no opacity/visibility hacks — otherwise the cloned
      // foreignObject inherits those properties and renders blank. We keep
      // the stage on-screen and cover the rest of the UI with an opaque
      // progress overlay so the user sees "Exportuji..." instead of the
      // intermediate render.
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
      stage.innerHTML = sourceEntry.innerHTML;
      document.body.appendChild(stage);

      // Opaque progress overlay above the stage so the brief render isn't
      // visually distracting.
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

      // If the user clicked Stáhnout before KaTeX rendered, the source still
      // contains "$$...$$" placeholders. Render them now in the staged copy.
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

      // Wait for fonts to be ready so html-to-image captures the right metrics.
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      // One animation frame so layout/SVG sizes settle.
      await new Promise<void>((r) => requestAnimationFrame(() => r()));

      const [{ toJpeg }, { jsPDF }] = await Promise.all([
        import('html-to-image'),
        import('jspdf'),
      ]);

      // JPEG (quality 0.92) keeps text crisp while compressing 10–20× better
      // than PNG. Combined with pixelRatio=3 → typical PDF size 0.5–2 MB per
      // topic.
      const imgData = await toJpeg(stage, {
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        quality: 0.92,
        cacheBust: true,
      });

      // Read the captured image's natural dimensions to keep aspect ratio
      // when placing it.
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imgData;
      });

      const doc = new jsPDF('p', 'mm', 'a4');

      // ASPECT-PRESERVING ("contain") FIT — never stretches the image.
      //   - If content fits the cell at full width, place at full width
      //     (height shrinks naturally and there's whitespace at the bottom).
      //   - If content is TALLER than the cell aspect, scale so the height
      //     matches cell.h; width shrinks proportionally and the image is
      //     centered horizontally with even side margins.
      const cellAspect = cell.h / cell.w;
      const imgAspect = img.height / img.width;
      let placedW: number, placedH: number;
      if (imgAspect <= cellAspect) {
        placedW = cell.w;
        placedH = cell.w * imgAspect;
      } else {
        placedH = cell.h;
        placedW = cell.h / imgAspect;
      }
      const cellOffsetX = (cell.w - placedW) / 2;

      for (const [x, y] of cellPositions(layout)) {
        doc.addImage(imgData, 'JPEG', x + cellOffsetX, y, placedW, placedH);
      }

      // Cut lines between identical copies (LaTeX 2-up style).
      if (layout >= 2) {
        doc.setDrawColor(170);
        doc.setLineDashPattern([2, 2], 0);
        const midX = MARGIN + cell.w + GAP / 2;
        doc.line(midX, MARGIN - 4, midX, A4_H - MARGIN + 4);
      }
      if (layout === 4) {
        const midY = MARGIN + cell.h + GAP / 2;
        doc.line(MARGIN - 4, midY, A4_W - MARGIN + 4, midY);
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
    </div>
  );
}
