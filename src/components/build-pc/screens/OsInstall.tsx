import { useEffect, useState, type ReactNode } from 'react';
import { addNote, useGame } from '../state';
import { Icon } from '../pixel/Sprite';
import { PART_BY_ID, type Os, type Storage } from '../data/parts';
import { activeParts } from '../assembly/steps';
import { sfx } from '../sfx';

const TIPS = [
  'Systém se kopíruje z flash disku na SSD. Z SSD pak bude startovat za pár sekund.',
  'Ovladače jsou programy, díky kterým systém umí používat grafiku, zvuk nebo Wi-Fi.',
  'Aktualizace opravují bezpečnostní chyby. Nech je zapnuté.',
  'Licence říká, jak smíš program používat. Windows na 1 počítač, Linux Mint zdarma kdekoliv.',
];

export function passwordScore(p: string): { score: 0 | 1 | 2; label: string } {
  const len = p.length;
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(p)).length;
  if (len >= 14 || (len >= 11 && kinds >= 2)) return { score: 2, label: 'Silné' };
  if (len >= 8) return { score: 1, label: 'Střední: ještě ho prodluž' };
  return { score: 0, label: 'Slabé' };
}

export default function OsInstall() {
  const { s, update, go } = useGame();
  const oses = s.owned.map((id) => PART_BY_ID[id]).filter((p): p is Os => p?.cat === 'os');
  const os = s.os.osId ? (PART_BY_ID[s.os.osId] as Os) : null;
  const isWin = os?.kind === 'windows';
  const step = s.os.step;
  const [warn, setWarn] = useState<string | null>(null);
  const [eula, setEula] = useState(false);
  const [keyIn, setKeyIn] = useState(false);
  const { storage } = activeParts(s);

  const next = (patch?: (d: typeof s) => void) => {
    sfx('click');
    setWarn(null);
    update((d) => { patch?.(d); d.os.step += 1; });
  };
  const wrong = (text: string, note?: string) => {
    sfx('bad');
    setWarn(text);
    if (note) update((d) => addNote(d, 'mistake', note));
  };

  const steps = ['Start', 'Klávesnice', 'Licence', 'Disk', 'Účet', isWin ? 'Soukromí' : 'Aktualizace', 'Instalace'];

  let body: ReactNode = null;
  let foot: ReactNode = null;

  if (step === 0) {
    body = (
      <>
        <h2>Odkud spustit počítač?</h2>
        <p>Při startu jsi zmáčkl F12 a otevřela se nabídka zařízení. Systém zatím nikde není, je jen na instalačním flash disku.</p>
        <div className="inst-opts" role="radiogroup" aria-label="Zařízení pro start">
          {storage.map((d) => (
            <Opt key={d.id} label={`${d.short}`} note={d.kind === 'hdd' ? 'Pevný disk, prázdný' : 'SSD, prázdné'} checked={false}
              onClick={() => wrong('Disk je zatím prázdný, systém na něm ještě není. Proto se startuje z flash disku.')} />
          ))}
          {oses.map((o) => (
            <Opt key={o.id} label={`USB: instalace ${o.short}`} note="Flash disk 32 GB" checked={false}
              onClick={() => next((d) => { d.os.osId = o.id; })} />
          ))}
          <Opt label="Síť (PXE)" note="Start ze sítě, používá se ve firmách" checked={false}
            onClick={() => wrong('Start ze sítě potřebuje server ve firmě nebo ve škole. Ty máš systém na flash disku.')} />
        </div>
      </>
    );
  } else if (step === 1) {
    body = (
      <>
        <h2>Jazyk a klávesnice</h2>
        <p>Jazyk: <b>čeština</b>. Teď vyber rozložení klávesnice. Podívej se na svou klávesnici: jaké písmeno je vpravo vedle T?</p>
        <div className="inst-opts" role="radiogroup" aria-label="Rozložení klávesnice">
          <Opt label="Česká (QWERTZ)" note="Vedle T je Z, nahoře jsou ě š č ř ž ý á í é" checked={s.os.keyboard === 'cz'} onClick={() => { setWarn(null); update((d) => { d.os.keyboard = 'cz'; }); }} />
          <Opt label="Anglická (QWERTY)" note="Vedle T je Y" checked={s.os.keyboard === 'us'} onClick={() => wrong('Česká klávesnice má vedle T písmeno Z. S anglickým rozložením by se ti prohazovalo Z a Y a nenapsal bys háčky.')} />
        </div>
      </>
    );
    foot = <Next disabled={s.os.keyboard !== 'cz'} onClick={() => next()} />;
  } else if (step === 2) {
    body = isWin ? (
      <>
        <h2>Licence Windows</h2>
        <p>Licence je smlouva, která říká, jak smíš systém používat. Tahle (OEM) platí pro jeden počítač. Kód licence (Product Key) ti poslal obchod e-mailem.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="inst-input" readOnly value={keyIn ? 'HRA26-BEKOV-UKAZK-OVYKL-IC000' : ''} placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" aria-label="Kód licence" />
          <button type="button" className="px-btn px-btn--brand px-btn--small" onClick={() => setKeyIn(true)}>Vložit kód z e-mailu</button>
        </div>
        <label className="inst-check">
          <input type="checkbox" checked={eula} onChange={(e) => setEula(e.target.checked)} />
          <span>Přečetl jsem si licenční podmínky a souhlasím s nimi.</span>
        </label>
        <p className="t-16" style={{ color: 'var(--c-slate)' }}>Kód ve hře je ukázkový. Skutečný kód nikdy nesdílej, je to jako klíč od systému.</p>
      </>
    ) : (
      <>
        <h2>Licence Linux Mint</h2>
        <p>Linux Mint je svobodný software. Jeho licence (GNU GPL) dovoluje systém zdarma používat, kopírovat na libovolný počet počítačů i upravovat.</p>
        <label className="inst-check">
          <input type="checkbox" checked={eula} onChange={(e) => setEula(e.target.checked)} />
          <span>Rozumím, že svobodný software smím používat i sdílet.</span>
        </label>
      </>
    );
    foot = <Next disabled={!eula || (isWin && !keyIn)} onClick={() => next()} />;
  } else if (step === 3) {
    const sys = storage.find((d) => d.kind === 'nvme') ?? storage[0];
    body = (
      <>
        <h2>Kam systém nainstalovat?</h2>
        <p>Vyber disk. Všechno, co na něm je, se smaže.</p>
        <div className="inst-opts" role="radiogroup" aria-label="Cílový disk">
          {storage.map((d, i) => (
            <Opt key={d.id} label={`Disk ${i}: ${d.short}`} note={`${sizeOf(d)} · prázdné místo`} checked={s.os.disk === 'ssd' && d.id === sys.id}
              onClick={() => {
                if (d.id !== sys.id) { wrong('Na pevný disk by systém startoval pomalu. Systém patří na SSD, pevný disk se hodí na data.'); return; }
                setWarn(null);
                update((x) => { x.os.disk = 'ssd'; });
              }} />
          ))}
          <Opt label={`Disk ${storage.length}: USB flash disk`} note="32 GB · instalační médium" checked={false}
            onClick={() => wrong('Tohle je flash disk, ze kterého instaluješ. Smazal bys instalátor uprostřed instalace.', 'Při instalaci systému jsi vybral instalační flash disk místo SSD.')} />
        </div>
      </>
    );
    foot = <Next disabled={s.os.disk !== 'ssd'} onClick={() => next((d) => { if (!d.os.user.trim()) d.os.user = d.name; })} />;
  } else if (step === 4) {
    const sc = passwordScore(s.os.pass);
    const colors = ['var(--c-red)', 'var(--c-orange)', 'var(--c-green)'];
    body = (
      <>
        <h2>Uživatelský účet</h2>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Jméno účtu</span>
          <input className="inst-input" value={s.os.user} maxLength={20} onChange={(e) => update((d) => { d.os.user = e.target.value; })} />
        </label>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Heslo</span>
          <input className="inst-input" type="text" autoComplete="off" spellCheck={false} value={s.os.pass} maxLength={40}
            onChange={(e) => update((d) => { d.os.pass = e.target.value; })} placeholder="Vymysli heslo jen pro hru" />
        </label>
        <div className="inst-meter" aria-live="polite">
          <div className="inst-meter__track"><div className="inst-meter__fill" style={{ width: `${((sc.score + 1) / 3) * 100}%`, background: colors[sc.score] }} /></div>
          <span className="t-16">Síla hesla: <b>{sc.label}</b></span>
        </div>
        <p className="t-16">Nejlepší je dlouhé heslo z několika slov, třeba „ZelenáKoloběžka7Plave“. Nepiš sem své skutečné heslo, tohle je jen hra.</p>
      </>
    );
    foot = <Next disabled={s.os.user.trim().length < 2 || sc.score < 2} onClick={() => next()} label={sc.score < 2 ? 'Heslo je slabé' : 'Další'} />;
  } else if (step === 5) {
    body = isWin ? (
      <>
        <h2>Nastavení soukromí</h2>
        <p>Systém se ptá, co o tobě smí posílat. Nic z toho není nutné. Rozhodni se sám.</p>
        <Toggle label="Poloha" note="Aplikace uvidí, kde jsi. Hodí se pro mapy, jinde ne." on={s.os.privacy.location} onChange={(v) => update((d) => { d.os.privacy.location = v; })} />
        <Toggle label="Reklamní ID" note="Reklamy se přizpůsobí tomu, co děláš. Vypnutím dostaneš stejně reklam, jen méně cílených." on={s.os.privacy.ads} onChange={(v) => update((d) => { d.os.privacy.ads = v; })} />
        <Toggle label="Volitelná diagnostická data" note="Podrobné údaje o používání posílané výrobci." on={s.os.privacy.diag} onChange={(v) => update((d) => { d.os.privacy.diag = v; })} />
      </>
    ) : (
      <>
        <h2>Aktualizace a zálohy</h2>
        <p>Linux Mint nabízí po instalaci dvě užitečné věci.</p>
        <Toggle label="Automatické aktualizace" note="Bezpečnostní opravy se nainstalují samy." on={!s.os.privacy.diag} onChange={(v) => update((d) => { d.os.privacy.diag = !v; })} />
        <Toggle label="Zálohy systému (Timeshift)" note="Když se něco pokazí, vrátíš systém do funkčního stavu." on={!s.os.privacy.ads} onChange={(v) => update((d) => { d.os.privacy.ads = !v; })} />
      </>
    );
    foot = <Next onClick={() => next()} label="Instalovat" />;
  } else {
    body = <Installing onDone={() => update((d) => { d.os.done = true; })} done={s.os.done} />;
    foot = s.os.done
      ? <button type="button" className="px-btn px-btn--brand" onClick={() => go('software')}>Spustit systém <Icon name="arrow" /></button>
      : null;
  }

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <header className="bpc-screenhead">
        <div className="bpc-screenhead__text">
          <h1 className="t-32">Instalace systému</h1>
          <p className="t-muted">{os ? `Instaluješ ${os.name}.` : 'Počítač startuje. Vyber, odkud se má spustit.'}</p>
        </div>
      </header>
      <div className="monitor">
        <div className="monitor__bezel px-frame">
          <div className="monitor__screen">
            <div className={`inst ${isWin ? 'inst--win' : 'inst--linux'}`}>
              <div className="inst__bar">
                <span>{os ? `Instalace: ${os.short}` : 'Nabídka spuštění (F12)'}</span>
                <span>{s.name}</span>
              </div>
              <div className="inst__body">
                {body}
                {warn ? <div className="inst-warn" role="alert"><Icon name="warn" /><p>{warn}</p></div> : null}
              </div>
              <div className="inst__foot">
                <span className="inst__steps">{steps.map((x, i) => (i === step ? `[${x}]` : x)).join(' · ')}</span>
                {foot}
              </div>
            </div>
          </div>
        </div>
        <div className="monitor__stand" />
        <div className="monitor__foot" />
      </div>
    </div>
  );
}

function sizeOf(d: Storage) {
  return d.sizeGB >= 1000 ? `${d.sizeGB / 1000} TB` : `${d.sizeGB} GB`;
}

function Opt({ label, note, checked, onClick }: { label: string; note?: string; checked: boolean; onClick: () => void }) {
  return (
    <button type="button" role="radio" aria-checked={checked} className="inst-opt" onClick={onClick}>
      <span className="inst-opt__radio" aria-hidden="true" />
      <span style={{ display: 'grid' }}><span>{label}</span>{note ? <small>{note}</small> : null}</span>
      <span />
    </button>
  );
}

function Toggle({ label, note, on, onChange }: { label: string; note: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inst-check">
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} />
      <span><b>{label}</b><br /><span className="t-16" style={{ color: 'var(--c-slate)' }}>{note}</span></span>
    </label>
  );
}

function Next({ onClick, disabled, label = 'Další' }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button type="button" className="px-btn px-btn--brand" disabled={disabled} onClick={onClick}>
      {label} <Icon name="arrow" />
    </button>
  );
}

function Installing({ onDone, done }: { onDone: () => void; done: boolean }) {
  const [pct, setPct] = useState(done ? 100 : 0);
  useEffect(() => {
    if (done) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setPct(100); onDone(); return; }
    const t = window.setInterval(() => {
      setPct((p) => {
        const n = Math.min(100, p + 4);
        if (n >= 100) { window.clearInterval(t); window.setTimeout(onDone, 200); sfx('ok'); }
        return n;
      });
    }, 220);
    return () => window.clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const tip = TIPS[Math.min(TIPS.length - 1, Math.floor(pct / 26))];
  return (
    <>
      <h2>{pct < 100 ? 'Instaluji systém…' : 'Hotovo!'}</h2>
      <div className="inst-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="inst-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="t-num">{pct} %</p>
      <p>{pct < 100 ? tip : 'Systém je na SSD. Flash disk můžeš vytáhnout. Teď přijdou na řadu programy.'}</p>
    </>
  );
}
