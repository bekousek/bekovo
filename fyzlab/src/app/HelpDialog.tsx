/**
 * Modální nápověda FyzLab — klávesové zkratky, tipy k nástrojům, fyzikální témata.
 * Otevírá se tlačítkem ? v horní liště.
 */

const KBD = ({ children }: { children: string }) => (
  <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-slate-300 bg-slate-100 px-1 font-mono text-[10px] font-semibold text-slate-700 shadow-sm">
    {children}
  </kbd>
);

const Row = ({ keys, label }: { keys: string[]; label: string }) => (
  <tr className="border-b border-slate-100 last:border-0">
    <td className="py-1.5 pr-3">
      <span className="flex gap-1">
        {keys.map((k) => (
          <KBD key={k}>{k}</KBD>
        ))}
      </span>
    </td>
    <td className="py-1.5 text-sm text-slate-600">{label}</td>
  </tr>
);

const SectionHeader = ({ children }: { children: string }) => (
  <h3 className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 first:mt-0">
    {children}
  </h3>
);

export function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hlavička */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-800">Nápověda — FyzLab</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zavřít"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Obsah se scrollem */}
        <div className="max-h-[75vh] overflow-y-auto px-5 pb-6">
          {/* Simulace */}
          <SectionHeader>Ovládání simulace</SectionHeader>
          <table className="w-full">
            <tbody>
              <Row keys={['Mezerník']} label="Spustit / Pauza" />
              <Row keys={['Ctrl', 'Z']} label="Zpět" />
              <Row keys={['Ctrl', 'Y']} label="Znovu" />
              <Row keys={['Del']} label="Smazat vybraný objekt" />
              <Row keys={['G']} label="Přichytávání k mřížce (zapnout/vypnout)" />
            </tbody>
          </table>

          {/* Nástroje — tvary */}
          <SectionHeader>Nástroje — tvary</SectionHeader>
          <table className="w-full">
            <tbody>
              <Row keys={['V']} label="Ruka — pohyb a výběr těles" />
              <Row keys={['B']} label="Obdélník — táhni úhlopříčku" />
              <Row keys={['K']} label="Kruh — táhni od středu k okraji" />
              <Row keys={['P']} label="Tužka — nakresli polygon jedním tahem" />
              <Row keys={['R']} label="Rovina — ťukni pro vodorovnou podlahu; tahem urč sklon" />
            </tbody>
          </table>

          {/* Nástroje — spoje */}
          <SectionHeader>Nástroje — spoje</SectionHeader>
          <table className="w-full">
            <tbody>
              <Row keys={['O']} label="Osa / čep — otočný kloub" />
              <Row keys={['S']} label="Pružina — táhni mezi dvěma tělesy" />
              <Row keys={['F']} label="Fixace — pevný spoj (zachová polohu i úhel)" />
              <Row keys={['U']} label="Tryska — tahová síla v lokálních souřadnicích" />
            </tbody>
          </table>

          {/* Přístroje */}
          <SectionHeader>Přístroje a speciální nástroje</SectionHeader>
          <table className="w-full">
            <tbody>
              <Row keys={['T']} label="Fotobrána — měří časy průchodů těles" />
              <Row keys={['L']} label="Laser — paprsek světla, odraz a lom" />
              <Row keys={['W']} label="Kapalina — táhni obdélník pro PBF tekutinu" />
            </tbody>
          </table>

          {/* Navigace */}
          <SectionHeader>Navigace v prostoru</SectionHeader>
          <table className="w-full">
            <tbody>
              <tr className="border-b border-slate-100 last:border-0">
                <td className="py-1.5 pr-3 text-sm font-medium text-slate-500">Zoom</td>
                <td className="py-1.5 text-sm text-slate-600">Kolečko myši · gesto dvěma prsty</td>
              </tr>
              <tr className="border-b border-slate-100 last:border-0">
                <td className="py-1.5 pr-3 text-sm font-medium text-slate-500">Posun pohledu</td>
                <td className="py-1.5 text-sm text-slate-600">Táhni prázdné místo (nástroj Ruka) · dva prsty</td>
              </tr>
              <tr className="border-b border-slate-100 last:border-0">
                <td className="py-1.5 pr-3 text-sm font-medium text-slate-500">Výběr</td>
                <td className="py-1.5 text-sm text-slate-600">Ťukni na těleso · táhni laso přes více těles</td>
              </tr>
            </tbody>
          </table>

          {/* Fyzikální témata */}
          <SectionHeader>Dostupná fyzikální témata</SectionHeader>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '⬇️', label: 'Volný pád', grade: '6. r.' },
              { icon: '🎯', label: 'Šikmý vrh', grade: '7. r.' },
              { icon: '⚖️', label: 'Páka', grade: '7. r.' },
              { icon: '⛷️', label: 'Přeměna energie', grade: '8. r.' },
              { icon: '🎱', label: 'Pružná srážka', grade: '9. r.' },
              { icon: '💥', label: 'Nepružná srážka', grade: '9. r.' },
              { icon: '🔵', label: 'Newtonova kolébka', grade: '9. r.' },
              { icon: '🁢', label: 'Domino efekt', grade: '9. r.' },
              { icon: '🔵', label: 'Kyvadlo', grade: 'demo' },
              { icon: '🌀', label: 'Pružina + závaží', grade: 'demo' },
              { icon: '⟶', label: 'Optika a laser', grade: 'optika' },
              { icon: '💧', label: 'PBF kapalina', grade: 'fyzika' },
            ].map(({ icon, label, grade }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
              >
                <span className="text-lg leading-none">{icon}</span>
                <div>
                  <p className="text-sm font-medium text-slate-700">{label}</p>
                  <p className="text-[10px] text-slate-400">{grade}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tip */}
          <p className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-800">
            <strong>Tip:</strong> V předpřipravených scénách s lekcí (ročník + téma) se zobrazí{' '}
            <em>predikční overlay</em> — odhadni výsledek ještě před spuštěním simulace.
            Fotobrána, graf pohybu a silový diagram pomohou ověřit tvůj odhad přesněji.
          </p>
        </div>
      </div>
    </div>
  );
}
