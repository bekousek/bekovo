import { useEffect, useMemo, type ReactNode } from 'react';
import { useGame, type RamSlot } from '../state';
import { ScreenHead } from '../ui';
import { ArtSvg, Icon } from '../pixel/Sprite';
import { ICONS } from '../pixel/sprites';
import { PART_BY_ID, formatKc, type Os } from '../data/parts';
import { activeParts, ramDual } from '../assembly/steps';
import { GOAL_BY_ID, bench, cheapestFit, rigPrice, type Rig } from '../logic/bench';
import { SCAREWARE_ID } from '../data/software';

export default function Finish() {
  const { s, update, go, reset } = useGame();
  useEffect(() => {
    if (!s.finishedAt) update((d) => { d.finishedAt = Date.now(); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const parts = activeParts(s);
  const os = s.os.osId ? (PART_BY_ID[s.os.osId] as Os) : null;
  const goal = GOAL_BY_ID[s.goal ?? 'school'];
  const cheapest = useMemo(() => cheapestFit(goal.id), [goal.id]);

  if (!parts.cpu || !parts.mb || !parts.ram || !parts.psu || !parts.kase || !os || !s.os.done) {
    return (
      <>
        <ScreenHead title="Výsledek" lead="Výsledek uvidíš, až bude počítač složený a systém nainstalovaný." />
        <button type="button" className="px-btn" onClick={() => go('workshop')}><Icon name="wrench" /> Do dílny</button>
      </>
    );
  }

  const slots = Object.entries(s.asm.ram).filter(([, v]) => v).map(([k]) => k as RamSlot);
  const rig: Rig = {
    cpu: parts.cpu, mb: parts.mb, ram: parts.ram, storage: parts.storage, gpu: parts.gpu, psu: parts.psu,
    case: parts.kase, cooler: parts.cooler, os, singleChannel: !ramDual(slots),
  };
  const b = bench(rig, goal.id);
  const price = rigPrice(rig);
  const overpaid = cheapest ? price > cheapest.price * 1.5 : false;
  const works = true;
  const stars = [works, b.fit, b.fit && !overpaid];

  const mistakes = s.notes.filter((n) => n.kind === 'mistake');
  const tips = s.notes.filter((n) => n.kind === 'tip');
  const traps = s.sw.fell.length;
  const safeTasks = s.sw.done.filter((id) => !s.sw.fell.some((f) => f.startsWith(`${id}:`))).length;
  const minutes = Math.max(1, Math.round(((s.finishedAt ?? Date.now()) - s.startedAt) / 60000));
  const accuracy = s.answered ? Math.round((s.correct / s.answered) * 100) : 0;

  const next: string[] = [];
  if (!b.fit) next.push(...b.reasons.filter((r) => !r.startsWith('Obě') && !r.startsWith('Export i') && !r.startsWith('Na úkoly')));
  if (overpaid && cheapest) next.push(`Zakázku by splnila i sestava za ${formatKc(cheapest.price)}. Kde se dalo ušetřit? Porovnej s tvou.`);
  const compatMistake = mistakes.find((m) => m.compat);
  if (compatMistake) next.push(`${compatMistake.text} Příště před placením zmáčkni „Zkontrolovat sestavu“.`);
  else if (mistakes.length) next.push(`${mistakes[0].text} Příště si dobře přečti popisky na desce.`);
  if (traps) next.push('Programy stahuj jen z oficiálních webů a odškrtávej přibalené doplňky.');
  if (tips.length && next.length < 3) next.push(tips[0].text);
  if (next.length === 0) next.push('Všechno sedí. Zkus jinou zakázku a postav ji levněji!');

  return (
    <div className="fin">
      <ScreenHead title={`Hotovo, ${s.name}!`} lead={`Zakázka: ${goal.title}. ${goal.target}`} back={null} />
      <div className="fin-grid">
        <section className="fin-card px-frame" aria-label="Hodnocení">
          <div className="fin-stars" aria-label={`Hodnocení ${stars.filter(Boolean).length} ze 3`}>
            {stars.map((on, i) => <ArtSvg key={i} art={ICONS[on ? 'star' : 'starOff']} scale={5} />)}
          </div>
          <ul className="fin-list">
            <Check ok={works}>Počítač funguje a systém {os.short} je nainstalovaný.</Check>
            <Check ok={b.fit}>{b.fit ? 'Sestava splnila zakázku.' : 'Sestava zakázku nesplnila.'} {b.reasons.join(' ')}</Check>
            <Check ok={!overpaid}>
              Za díly v počítači jsi dal {formatKc(price)}.
              {cheapest ? ` Nejlevnější sestava, která zakázku splní, stojí ${formatKc(cheapest.price)}.` : ''}
              {overpaid ? ' Přeplatil jsi.' : ''}
            </Check>
          </ul>

          <h2 className="t-24">Test výkonu</h2>
          <div className="fin-bench">
            <Bar label="Fortnite, 1080p, vysoké detaily" value={b.fortnite} unit="FPS" max={240} mark={goal.id === 'gaming' ? 100 : undefined} good={b.fortnite >= 100} />
            <Bar label="Forza Horizon 5, 1080p, vysoké" value={b.forza} unit="FPS" max={180} mark={goal.id === 'gaming' ? 60 : undefined} good={b.forza >= 60} />
            <Bar label="Export 10min videa" value={b.exportMin} unit="min" max={14} mark={goal.id === 'video' ? 5 : undefined} good={b.exportMin <= 5} lowerIsBetter />
            <Bar label="Start systému" value={b.bootSec} unit="s" max={60} good={b.bootSec <= 20} lowerIsBetter />
            <p className="bench-row__note">Čísla jsou odhad hry podle parametrů dílů, ne skutečné měření.</p>
          </div>
        </section>

        <section className="fin-card px-frame" aria-label="Statistiky">
          <h2 className="t-24">Co příště</h2>
          <ul className="fin-list">
            {next.slice(0, 3).map((t, i) => <Check key={i} ok={null}>{t}</Check>)}
          </ul>
          <h2 className="t-24">Statistiky</h2>
          <dl className="fin-stats">
            <dt>Brigády</dt><dd>{s.jobsDone}</dd>
            <dt>Správné odpovědi</dt><dd>{s.correct} z {s.answered} ({accuracy} %)</dd>
            <dt>Vyděláno</dt><dd>{formatKc(s.earned)}</dd>
            <dt>Utraceno celkem</dt><dd>{formatKc(s.spent)}</dd>
            <dt>Zbývá na účtu</dt><dd>{formatKc(s.money)}</dd>
            <dt>Vrácené zboží</dt><dd>{s.returns}</dd>
            <dt>Chyby při skládání</dt><dd>{mistakes.length}</dd>
            <dt>Bezpečně stažené programy</dt><dd>{safeTasks} z {s.sw.done.length}</dd>
            <dt>Pasti při stahování</dt><dd>{traps ? `spadl jsi do ${traps}` : 'žádná'}</dd>
            <dt>Falešný „čistič“</dt><dd>{s.sw.fell.includes(SCAREWARE_ID) ? 'naletěl jsi' : s.sw.dodged.includes(SCAREWARE_ID) ? 'zavřel jsi ho' : '—'}</dd>
            <dt>Čas</dt><dd>{minutes} min</dd>
          </dl>
          <div className="fin-actions">
            <button type="button" className="px-btn" onClick={() => window.print()}>Vytisknout výsledek</button>
            <button type="button" className="px-btn px-btn--dark" onClick={() => go('town')}>Do městečka</button>
            <button type="button" className="px-btn px-btn--dark" onClick={() => reset()}>Nová hra</button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Check({ ok, children }: { ok: boolean | null; children: ReactNode }) {
  return (
    <li>
      <ArtSvg art={ICONS[ok === null ? 'arrow' : ok ? 'check' : 'cross']} scale={2} tint={ok === null ? 'gold' : undefined} />
      <span>{children}</span>
    </li>
  );
}

function Bar({ label, value, unit, max, mark, good, lowerIsBetter }: { label: string; value: number; unit: string; max: number; mark?: number; good: boolean; lowerIsBetter?: boolean }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="bench-row">
      <div className="bench-row__head">
        <span>{label}</span>
        <b>{value.toLocaleString('cs-CZ')} {unit}</b>
      </div>
      <div className="bench-track" role="img" aria-label={`${label}: ${value} ${unit}${mark ? `, cíl ${lowerIsBetter ? 'nejvýš' : 'aspoň'} ${mark} ${unit}` : ''}`}>
        <div className={`bench-fill ${mark !== undefined ? (good ? 'bench-fill--ok' : 'bench-fill--bad') : ''}`} style={{ width: `${pct}%` }} />
        {mark !== undefined ? <div className="bench-mark" style={{ left: `${(mark / max) * 100}%` }} /> : null}
      </div>
      {mark !== undefined ? <span className="bench-row__note">Cíl zakázky: {lowerIsBetter ? 'nejvýš' : 'aspoň'} {mark} {unit}</span> : null}
    </div>
  );
}
