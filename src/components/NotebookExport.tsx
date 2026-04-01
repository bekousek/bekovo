import { useState } from 'react';

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

      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;

      const availWidth = pageWidth - 2 * margin;
      const availHeight = pageHeight - 2 * margin;

      if (layout === 1) {
        // 1 per page — full page
        const imgWidth = availWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (imgHeight <= availHeight) {
          doc.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
        } else {
          // Scale to fit height
          const scale = availHeight / imgHeight;
          const scaledWidth = imgWidth * scale;
          const scaledHeight = imgHeight * scale;
          doc.addImage(imgData, 'PNG', margin + (availWidth - scaledWidth) / 2, margin, scaledWidth, scaledHeight);
        }
      } else if (layout === 2) {
        // 2 per page — top half and bottom half
        const halfHeight = (availHeight - 5) / 2;
        const imgWidth = availWidth;
        const imgHeight = Math.min((canvas.height * imgWidth) / canvas.width, halfHeight);

        doc.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);

        // Dashed line separator
        doc.setDrawColor(200);
        doc.setLineDashPattern([3, 3], 0);
        const midY = margin + halfHeight + 2.5;
        doc.line(margin, midY, pageWidth - margin, midY);

        doc.addImage(imgData, 'PNG', margin, midY + 2.5, imgWidth, imgHeight);
      } else {
        // 4 per page — 2x2 grid
        const cellWidth = (availWidth - 5) / 2;
        const cellHeight = (availHeight - 5) / 2;
        const imgWidth = cellWidth;
        const imgHeight = Math.min((canvas.height * imgWidth) / canvas.width, cellHeight);

        const positions = [
          [margin, margin],
          [margin + cellWidth + 5, margin],
          [margin, margin + cellHeight + 5],
          [margin + cellWidth + 5, margin + cellHeight + 5],
        ];

        // Dashed lines
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
