import { useState } from 'react';
import { toPng } from 'html-to-image';

interface Props {
  contentId: string;
}

type Layout = 1 | 2 | 4;

export default function NotebookExport({ contentId }: Props) {
  const [layout, setLayout] = useState<Layout>(1);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const element = document.getElementById(contentId);
      if (!element) return;

      const { jsPDF } = await import('jspdf');

      // Use html-to-image which handles modern CSS (oklch etc.) natively
      const imgData = await toPng(element, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      // Get image dimensions by loading into an Image
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imgData;
      });

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;

      const availWidth = pageWidth - 2 * margin;
      const availHeight = pageHeight - 2 * margin;

      if (layout === 1) {
        const imgWidth = availWidth;
        const imgHeight = (img.height * imgWidth) / img.width;

        if (imgHeight <= availHeight) {
          doc.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
        } else {
          const scale = availHeight / imgHeight;
          const scaledWidth = imgWidth * scale;
          const scaledHeight = imgHeight * scale;
          doc.addImage(imgData, 'PNG', margin + (availWidth - scaledWidth) / 2, margin, scaledWidth, scaledHeight);
        }
      } else if (layout === 2) {
        const halfHeight = (availHeight - 5) / 2;
        const imgWidth = availWidth;
        const imgHeight = Math.min((img.height * imgWidth) / img.width, halfHeight);

        doc.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);

        doc.setDrawColor(200);
        doc.setLineDashPattern([3, 3], 0);
        const midY = margin + halfHeight + 2.5;
        doc.line(margin, midY, pageWidth - margin, midY);

        doc.addImage(imgData, 'PNG', margin, midY + 2.5, imgWidth, imgHeight);
      } else {
        const cellWidth = (availWidth - 5) / 2;
        const cellHeight = (availHeight - 5) / 2;
        const imgWidth = cellWidth;
        const imgHeight = Math.min((img.height * imgWidth) / img.width, cellHeight);

        const positions = [
          [margin, margin],
          [margin + cellWidth + 5, margin],
          [margin, margin + cellHeight + 5],
          [margin + cellWidth + 5, margin + cellHeight + 5],
        ];

        doc.setDrawColor(200);
        doc.setLineDashPattern([3, 3], 0);
        const midX = margin + cellWidth + 2.5;
        const midY = margin + cellHeight + 2.5;
        doc.line(midX, margin, midX, pageHeight - margin);
        doc.line(margin, midY, pageWidth - margin, midY);

        for (const [x, y] of positions) {
          doc.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        }
      }

      doc.save(`zapis-${layout}x.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
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
