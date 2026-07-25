/**
 * Modální nápověda FyzLab — klávesové zkratky, tipy k nástrojům, fyzikální témata.
 * Otevírá se tlačítkem ? v horní liště.
 */
import { Dialog, Kbd, Section } from './ui';

const Row = ({ keys, label }: { keys: string[]; label: string }) => (
  <tr className="border-b border-[var(--border)] last:border-0">
    <td className="py-1.5 pr-3">
      <span className="flex gap-1">
        {keys.map((k) => (
          <Kbd key={k}>{k}</Kbd>
        ))}
      </span>
    </td>
    <td className="py-1.5 text-sm [color:var(--text-secondary)]">{label}</td>
  </tr>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <tr className="border-b border-[var(--border)] last:border-0">
    <td className="py-1.5 pr-3 text-sm font-medium [color:var(--text-muted)]">{label}</td>
    <td className="py-1.5 text-sm [color:var(--text-secondary)]">{value}</td>
  </tr>
);

const TOPICS = [
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
];

export function HelpDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog title="Nápověda — FyzLab" onClose={onClose} maxWidth="max-w-lg">
      <div className="space-y-5 px-5 pb-6 pt-4">
        <Section title="Ovládání simulace">
          <table className="w-full">
            <tbody>
              <Row keys={['Mezerník']} label="Spustit / Pauza" />
              <Row keys={['Ctrl', 'Z']} label="Zpět" />
              <Row keys={['Ctrl', 'Y']} label="Znovu" />
              <Row keys={['Del']} label="Smazat vybraný objekt" />
              <Row keys={['G']} label="Přichytávání k mřížce (zapnout/vypnout)" />
            </tbody>
          </table>
        </Section>

        <Section title="Nástroje — tvary">
          <table className="w-full">
            <tbody>
              <Row keys={['V']} label="Ruka — pohyb a výběr těles" />
              <Row keys={['B']} label="Obdélník — táhni úhlopříčku" />
              <Row keys={['K']} label="Kruh — táhni od středu k okraji" />
              <Row keys={['P']} label="Tužka — nakresli polygon jedním tahem" />
              <Row keys={['R']} label="Rovina — ťukni pro vodorovnou podlahu; tahem urč sklon" />
            </tbody>
          </table>
        </Section>

        <Section title="Nástroje — spoje">
          <table className="w-full">
            <tbody>
              <Row keys={['O']} label="Osa / čep — otočný kloub" />
              <Row keys={['S']} label="Pružina — táhni mezi dvěma tělesy" />
              <Row keys={['F']} label="Fixace — pevný spoj (zachová polohu i úhel)" />
              <Row keys={['U']} label="Tryska — tahová síla v lokálních souřadnicích" />
            </tbody>
          </table>
        </Section>

        <Section title="Přístroje a speciální nástroje">
          <table className="w-full">
            <tbody>
              <Row keys={['T']} label="Fotobrána — měří časy průchodů těles" />
              <Row keys={['L']} label="Laser — paprsek světla, odraz a lom" />
              <Row keys={['W']} label="Kapalina — táhni obdélník pro PBF tekutinu" />
            </tbody>
          </table>
        </Section>

        <Section title="Navigace v prostoru">
          <table className="w-full">
            <tbody>
              <InfoRow label="Zoom" value="Kolečko myši · gesto dvěma prsty" />
              <InfoRow label="Posun pohledu" value="Táhni prázdné místo (nástroj Ruka) · dva prsty" />
              <InfoRow label="Výběr" value="Ťukni na těleso · táhni laso přes více těles" />
            </tbody>
          </table>
        </Section>

        <Section title="Dostupná fyzikální témata">
          <div className="grid grid-cols-2 gap-2">
            {TOPICS.map(({ icon, label, grade }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
              >
                <span className="text-lg leading-none">{icon}</span>
                <div>
                  <p className="text-sm font-medium [color:var(--text-primary)]">{label}</p>
                  <p className="text-[10px] [color:var(--text-muted)]">{grade}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Tip */}
        <p className="rounded-[var(--radius-lg)] bg-indigo-50 px-4 py-3 text-xs leading-relaxed [color:var(--accent)] dark:bg-indigo-950/40">
          <strong>Tip:</strong> V předpřipravených scénách s lekcí (ročník + téma) se zobrazí{' '}
          <em>predikční overlay</em> — odhadni výsledek ještě před spuštěním simulace.
          Fotobrána, graf pohybu a silový diagram pomohou ověřit tvůj odhad přesněji.
        </p>
      </div>
    </Dialog>
  );
}
