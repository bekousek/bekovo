import { useState } from 'react';
import type { Formula, Problem, GeneratorSettings } from './engine/types';
import { generateProblems } from './engine/problemGenerator';
import katex from 'katex';

interface Props {
  formulas: Formula[];
}

function KaTex({ tex, display = false }: { tex: string; display?: boolean }) {
  try {
    const html = katex.renderToString(tex, { throwOnError: false, displayMode: display });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    return <span>{tex}</span>;
  }
}

/** Format number: use comma as decimal separator, group thousands with thin space */
function formatValue(val: number): string {
  const str = val.toString();
  const [intPart, decPart] = str.split('.');
  // Add thin spaces every 3 digits from the right in the integer part
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
  return decPart !== undefined ? `${grouped},${decPart}` : grouped;
}

/**
 * Czech accusative (4. pád) — applied word-by-word.
 *
 * Adjective endings:   -á  → -ou   (tíhová → tíhovou, elektrická → elektrickou)
 *                       -ý/-é/-í stay the same (masc. inanimate / neuter)
 * Noun endings:         -ce → -ci   (práce → práci, frekvence → frekvenci)
 *                       -ie → -ii   (energie → energii)
 *                       -a  → -u    (síla → sílu, dráha → dráhu, hustota → hustotu)
 * Everything else stays the same (hmotnost, objem, tlak, teplo, napětí …)
 */
function toAccusative(name: string): string {
  return name
    .split(' ')
    .map((w) => {
      if (w.endsWith('á')) return w.slice(0, -1) + 'ou';
      if (w.endsWith('ce')) return w.slice(0, -1) + 'i';
      if (w.endsWith('ie')) return w.slice(0, -1) + 'i';
      if (w.endsWith('a')) return w.slice(0, -1) + 'u';
      return w;
    })
    .join(' ');
}

/** Build a Czech sentence describing the problem */
function buildSentence(problem: Problem): string {
  const knowns = problem.knowns.filter((k) => !k.isConstant);
  const parts = knowns.map((k) => {
    const conv = k.needsConversion ? ' (převeď!)' : '';
    return `${k.name} je ${formatValue(k.value)} ${k.unit}${conv}`;
  });

  // Capitalize first part
  if (parts.length > 0) {
    parts[0] = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  }

  let sentence: string;
  if (parts.length === 1) {
    sentence = parts[0];
  } else if (parts.length === 2) {
    sentence = `${parts[0]} a ${parts[1]}`;
  } else {
    sentence = parts.slice(0, -1).join(', ') + ' a ' + parts[parts.length - 1];
  }

  const unknownAcc = toAccusative(problem.unknown.name);
  return `${sentence}. Vypočítej ${unknownAcc}.`;
}

/** Build a plain-text solution line (uses symbol, not name) */
function buildSolutionText(problem: Problem): string {
  // Strip LaTeX commands for plain-text: \rho → ρ, \eta → η, etc.
  const sym = problem.unknown.symbol
    .replace(/\\rho/g, 'ρ')
    .replace(/\\eta/g, 'η')
    .replace(/\\varphi/g, 'φ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\Delta\s*/g, 'Δ')
    .replace(/\\frac\{1\}\{2\}/g, '½')
    .replace(/[_{}\\]/g, '');
  return `${sym} = ${formatValue(problem.unknown.value)} ${problem.unknown.unit}`;
}

interface SlotConfig {
  id: number;
  formulaId: string;
  solveFor: string;
  withConversion: boolean;
  problem: Problem | null;
}

const MAX_SLOTS = 10;

export default function ExerciseGenerator({ formulas }: Props) {
  const [slots, setSlots] = useState<SlotConfig[]>([
    {
      id: 1,
      formulaId: formulas[0]?.id ?? '',
      solveFor: '',
      withConversion: false,
      problem: null,
    },
  ]);
  const [showSolutions, setShowSolutions] = useState(false);
  const [nextId, setNextId] = useState(2);
  const [exporting, setExporting] = useState(false);

  function getFormula(formulaId: string) {
    return formulas.find((f) => f.id === formulaId);
  }

  function getSolvableVars(formulaId: string) {
    const formula = getFormula(formulaId);
    return formula?.variables.filter((v) => v.constant === undefined) ?? [];
  }

  function getEffectiveSolveFor(slot: SlotConfig) {
    const vars = getSolvableVars(slot.formulaId);
    if (slot.solveFor && vars.some((v) => v.symbol === slot.solveFor)) {
      return slot.solveFor;
    }
    return vars[0]?.symbol ?? '';
  }

  function updateSlot(slotId: number, updates: Partial<SlotConfig>) {
    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, ...updates } : s)));
  }

  function handleGenerate(slotId: number) {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) return;
    const formula = getFormula(slot.formulaId);
    if (!formula) return;

    const settings: GeneratorSettings = {
      formulaId: slot.formulaId,
      count: 1,
      solveFor: getEffectiveSolveFor(slot),
      withConversion: slot.withConversion,
    };
    const [problem] = generateProblems(formula, settings);
    updateSlot(slotId, { problem });
  }

  function handleAdd() {
    if (slots.length >= MAX_SLOTS) return;
    const last = slots[slots.length - 1];
    setSlots((prev) => [
      ...prev,
      {
        id: nextId,
        formulaId: last.formulaId,
        solveFor: last.solveFor,
        withConversion: last.withConversion,
        problem: null,
      },
    ]);
    setNextId((n) => n + 1);
  }

  function handleRemove(slotId: number) {
    if (slots.length <= 1) return;
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
  }

  function handleGenerateAll() {
    setSlots((prev) =>
      prev.map((slot) => {
        const formula = getFormula(slot.formulaId);
        if (!formula) return slot;
        const settings: GeneratorSettings = {
          formulaId: slot.formulaId,
          count: 1,
          solveFor: getEffectiveSolveFor(slot),
          withConversion: slot.withConversion,
        };
        const [problem] = generateProblems(formula, settings);
        return { ...slot, problem };
      }),
    );
    setShowSolutions(false);
  }

  const generatedProblems = slots.filter((s) => s.problem !== null);

  /* ── Helper: load font file as base64 string for jsPDF ── */
  async function loadFontBase64(url: string): Promise<string> {
    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  /* ── PDF export with embedded Roboto font (full Czech diacritics) ── */
  async function handleExportPdf() {
    if (generatedProblems.length === 0) return;
    setExporting(true);

    try {
      const { jsPDF } = await import('jspdf');

      // Load Roboto fonts (cached by browser after first download)
      const [regularB64, boldB64] = await Promise.all([
        loadFontBase64('/fonts/Roboto-Regular.ttf'),
        loadFontBase64('/fonts/Roboto-Bold.ttf'),
      ]);

      const doc = new jsPDF('p', 'mm', 'a4');

      // Register fonts
      doc.addFileToVFS('Roboto-Regular.ttf', regularB64);
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
      doc.addFileToVFS('Roboto-Bold.ttf', boldB64);
      doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');

      const margin = 20;
      const maxW = doc.internal.pageSize.getWidth() - margin * 2;
      const pageH = doc.internal.pageSize.getHeight();
      let y = 25;

      // ── Title ──
      doc.setFont('Roboto', 'bold');
      doc.setFontSize(22);
      doc.text('Příklady', margin, y);
      y += 4;

      // Decorative line under title
      doc.setDrawColor(59, 130, 246); // blue-500
      doc.setLineWidth(0.6);
      doc.line(margin, y, margin + 40, y);
      y += 12;

      // ── Problems ──
      doc.setFont('Roboto', 'normal');
      doc.setFontSize(12);

      generatedProblems.forEach((slot, idx) => {
        const sentence = buildSentence(slot.problem!);
        const fullText = `${idx + 1}.  ${sentence}`;
        const lines: string[] = doc.splitTextToSize(fullText, maxW);

        // Page break if needed
        if (y + lines.length * 7 > pageH - 20) {
          doc.addPage();
          y = 25;
        }

        // Problem number in bold
        doc.setFont('Roboto', 'bold');
        doc.text(`${idx + 1}.`, margin, y);

        // Sentence text
        doc.setFont('Roboto', 'normal');
        const numWidth = doc.getTextWidth(`${idx + 1}.  `);
        const sentenceLines: string[] = doc.splitTextToSize(sentence, maxW - numWidth);
        sentenceLines.forEach((line: string, li: number) => {
          doc.text(line, margin + numWidth, y + li * 7);
        });

        y += sentenceLines.length * 7 + 5;
      });

      // ── Solutions ──
      if (showSolutions) {
        // New page for solutions
        doc.addPage();
        y = 25;

        doc.setFont('Roboto', 'bold');
        doc.setFontSize(18);
        doc.text('Řešení', margin, y);
        y += 4;
        doc.setDrawColor(34, 197, 94); // green-500
        doc.setLineWidth(0.6);
        doc.line(margin, y, margin + 30, y);
        y += 12;

        doc.setFontSize(12);

        generatedProblems.forEach((slot, idx) => {
          if (y > pageH - 20) {
            doc.addPage();
            y = 25;
          }

          doc.setFont('Roboto', 'bold');
          doc.text(`${idx + 1}.`, margin, y);

          doc.setFont('Roboto', 'normal');
          const numW = doc.getTextWidth(`${idx + 1}.  `);
          doc.text(buildSolutionText(slot.problem!), margin + numW, y);

          y += 8;
        });
      }

      // ── Footer ──
      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFont('Roboto', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text('bekovo.cz', margin, pageH - 10);
        doc.text(`${p} / ${totalPages}`, doc.internal.pageSize.getWidth() - margin, pageH - 10, { align: 'right' });
        doc.setTextColor(0);
      }

      doc.save('priklady.pdf');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Slot cards */}
      {slots.map((slot, idx) => {
        const formula = getFormula(slot.formulaId);
        const solvableVars = getSolvableVars(slot.formulaId);
        const effectiveSolveFor = getEffectiveSolveFor(slot);

        return (
          <div key={slot.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </span>
                <span className="text-sm font-medium text-gray-500">Příklad</span>
              </span>
              {slots.length > 1 && (
                <button
                  onClick={() => handleRemove(slot.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Odebrat příklad"
                >
                  ×
                </button>
              )}
            </div>

            {/* Settings row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Vzorec</label>
                <select
                  value={slot.formulaId}
                  onChange={(e) => updateSlot(slot.id, { formulaId: e.target.value, solveFor: '', problem: null })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {formulas.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Vypočítat</label>
                <select
                  value={effectiveSolveFor}
                  onChange={(e) => updateSlot(slot.id, { solveFor: e.target.value, problem: null })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {solvableVars.map((v) => (
                    <option key={v.symbol} value={v.symbol}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slot.withConversion}
                    onChange={(e) => updateSlot(slot.id, { withConversion: e.target.checked, problem: null })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Převod jednotek</span>
                </label>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => handleGenerate(slot.id)}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  {slot.problem ? 'Přegenerovat' : 'Vygenerovat'}
                </button>
              </div>
            </div>

            {/* Formula preview */}
            {formula && (
              <div className="mt-3 p-2 bg-blue-50 rounded-lg text-center">
                <KaTex tex={formula.formula} display />
              </div>
            )}

            {/* Generated problem sentence */}
            {slot.problem && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-gray-800 leading-relaxed">
                  {buildSentence(slot.problem)}
                </p>

                {showSolutions && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm font-medium text-green-700">
                      <KaTex tex={`${slot.problem.unknown.symbol} = ${formatValue(slot.problem.unknown.value)} \\, \\text{${slot.problem.unknown.unit}}`} />
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Add button */}
      {slots.length < MAX_SLOTS && (
        <button
          onClick={handleAdd}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <span className="text-xl leading-none">+</span>
          <span className="text-sm">Přidat příklad ({slots.length}/{MAX_SLOTS})</span>
        </button>
      )}

      {/* Bottom toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <button
          onClick={handleGenerateAll}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
        >
          Vygenerovat vše
        </button>

        <div className="flex gap-2">
          {generatedProblems.length > 0 && (
            <>
              <button
                onClick={() => setShowSolutions(!showSolutions)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {showSolutions ? 'Skrýt řešení' : 'Zobrazit řešení'}
              </button>
              <button
                onClick={handleExportPdf}
                disabled={exporting}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {exporting ? 'Exportuji…' : 'Export PDF'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
