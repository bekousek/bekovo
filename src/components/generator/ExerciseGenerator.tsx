import { useState, useRef } from 'react';
import type { Formula, Problem, GeneratorSettings } from './engine/types';
import { generateProblems } from './engine/problemGenerator';
import katex from 'katex';

interface Props {
  formulas: Formula[];
}

function renderKatex(tex: string): string {
  try {
    return katex.renderToString(tex, { throwOnError: false, displayMode: false });
  } catch {
    return tex;
  }
}

function KaTex({ tex, display = false }: { tex: string; display?: boolean }) {
  try {
    const html = katex.renderToString(tex, { throwOnError: false, displayMode: display });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    return <span>{tex}</span>;
  }
}

function formatValue(val: number): string {
  if (Number.isInteger(val)) return val.toString();
  return val.toString().replace('.', ',');
}

export default function ExerciseGenerator({ formulas }: Props) {
  const [settings, setSettings] = useState<GeneratorSettings>({
    formulaId: formulas[0]?.id ?? '',
    count: 5,
    solveFor: '',
    withConversion: false,
  });
  const [problems, setProblems] = useState<Problem[]>([]);
  const [showSolutions, setShowSolutions] = useState(false);
  const problemsRef = useRef<HTMLDivElement>(null);

  const selectedFormula = formulas.find(f => f.id === settings.formulaId);
  const solvableVars = selectedFormula?.variables.filter(v => v.constant === undefined) ?? [];

  // Auto-set solveFor when formula changes
  const effectiveSolveFor = settings.solveFor && solvableVars.some(v => v.symbol === settings.solveFor)
    ? settings.solveFor
    : solvableVars[0]?.symbol ?? '';

  function handleGenerate() {
    if (!selectedFormula) return;
    const actualSettings = { ...settings, solveFor: effectiveSolveFor };
    const generated = generateProblems(selectedFormula, actualSettings);
    setProblems(generated);
    setShowSolutions(false);
  }

  async function handleExportPdf() {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(selectedFormula?.name ?? 'Příklady', margin, y);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    for (const problem of problems) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      const knownParts = problem.knowns
        .filter(k => k.value !== undefined)
        .map(k => `${k.name} = ${formatValue(k.value)} ${k.unit}`)
        .join(', ');

      const unknownPart = `${problem.unknown.name} = ?`;

      doc.text(`${problem.id}. ${knownParts}`, margin, y);
      y += 6;
      doc.text(`    Vypočítej: ${unknownPart}`, margin, y);
      y += 8;
    }

    if (showSolutions) {
      doc.addPage();
      y = 20;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Řešení', margin, y);
      y += 10;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);

      for (const problem of problems) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(
          `${problem.id}. ${problem.unknown.name} = ${formatValue(problem.unknown.value)} ${problem.unknown.unit}`,
          margin, y
        );
        y += 7;
      }
    }

    doc.save(`priklady-${selectedFormula?.id ?? 'export'}.pdf`);
  }

  return (
    <div className="space-y-6">
      {/* Settings Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Nastavení generátoru</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Formula select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vzorec</label>
            <select
              value={settings.formulaId}
              onChange={(e) => setSettings(s => ({ ...s, formulaId: e.target.value, solveFor: '' }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {formulas.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* Solve for */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vypočítat</label>
            <select
              value={effectiveSolveFor}
              onChange={(e) => setSettings(s => ({ ...s, solveFor: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {solvableVars.map(v => (
                <option key={v.symbol} value={v.symbol}>{v.name} ({v.symbol})</option>
              ))}
            </select>
          </div>

          {/* Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Počet příkladů</label>
            <select
              value={settings.count}
              onChange={(e) => setSettings(s => ({ ...s, count: Number(e.target.value) }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {[3, 5, 8, 10, 15, 20].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Conversion toggle */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.withConversion}
                onChange={(e) => setSettings(s => ({ ...s, withConversion: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">S převodem jednotek</span>
            </label>
          </div>
        </div>

        {/* Formula display */}
        {selectedFormula && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
            <KaTex tex={selectedFormula.formula} display />
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <button
            onClick={handleGenerate}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Vygenerovat příklady
          </button>
        </div>
      </div>

      {/* Problems display */}
      {problems.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6" ref={problemsRef}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Příklady ({problems.length})</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSolutions(!showSolutions)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {showSolutions ? 'Skrýt řešení' : 'Zobrazit řešení'}
              </button>
              <button
                onClick={handleExportPdf}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Export PDF
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {problems.map((problem) => (
              <div key={problem.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {problem.id}
                  </span>
                  <div className="flex-1">
                    <div className="text-sm text-gray-800">
                      {problem.knowns
                        .filter(k => k.value !== undefined)
                        .map((k, idx) => (
                          <span key={k.symbol}>
                            {idx > 0 && <span className="text-gray-400 mx-1">,</span>}
                            <KaTex tex={`${k.symbol} = ${formatValue(k.value)} \\, \\text{${k.unit}}`} />
                            {k.needsConversion && (
                              <span className="ml-1 text-xs text-amber-600 font-medium">(převod!)</span>
                            )}
                          </span>
                        ))}
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      Vypočítej: <KaTex tex={`${problem.unknown.symbol} = \\, ?`} />
                    </div>

                    {showSolutions && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-sm font-medium text-green-700">
                          <KaTex tex={`${problem.unknown.symbol} = ${formatValue(problem.unknown.value)} \\, \\text{${problem.unknown.unit}}`} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
