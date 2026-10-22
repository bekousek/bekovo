import { useEffect, useMemo, useState } from 'react';
import { addNote, useGame } from '../state';
import { Icon } from '../pixel/Sprite';
import { postResult } from '../assembly/steps';
import { sfx } from '../sfx';

export default function Post() {
  const { s, update, go } = useGame();
  const res = useMemo(() => postResult(s), []); // eslint-disable-line react-hooks/exhaustive-deps
  const total = res.log.length + 1;
  const [shown, setShown] = useState(() => (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? total : 0));

  useEffect(() => {
    if (shown >= total) return;
    const t = window.setTimeout(() => setShown((n) => n + 1), 420);
    return () => window.clearTimeout(t);
  }, [shown, total]);

  const finished = shown >= total;
  useEffect(() => {
    if (!finished) return;
    sfx(res.ok ? 'ok' : 'bad');
    if (!res.ok && res.problem) update((d) => addNote(d, 'mistake', `Při zapnutí: ${res.problem}`));
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const backToBench = () => {
    update((d) => { d.asm.panel = false; d.asm.monitor = null; });
    go('workshop');
  };

  // Bez procesoru, paměti nebo grafiky se obraz vůbec neobjeví.
  const black = !res.ok && (res.leds.vga || res.leds.cpu || res.leds.dram);

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <header className="bpc-screenhead">
        <div className="bpc-screenhead__text">
          <h1 className="t-32">První zapnutí</h1>
          <p className="t-muted">Deska po zapnutí sama otestuje díly (POST). Když něco chybí, rozsvítí kontrolku.</p>
        </div>
      </header>

      <div className="post-layout">
      <div className="monitor">
        <div className="monitor__bezel px-frame">
          <div className="monitor__screen">
            {black && finished ? (
              <div className="post" style={{ placeItems: 'center', alignContent: 'center', color: 'var(--c-slate)' }}>
                <p>Žádný signál</p>
              </div>
            ) : (
              <div className="post" aria-live="polite">
                <p className="t-gold">UEFI · test hardwaru</p>
                {res.log.slice(0, shown).map((l, i) => (
                  <p key={i} className="post__line">
                    <span className={l.ok ? 'post__ok' : 'post__bad'}>{l.ok ? 'OK ' : 'CHYBA'}</span>
                    <span>{l.text}</span>
                  </p>
                ))}
                {finished && res.ok ? <p className="post__ok" style={{ marginTop: 12 }}>Start z instalačního USB…</p> : null}
                {!finished ? <p>▌</p> : null}
              </div>
            )}
          </div>
        </div>
        <div className="monitor__stand" />
        <div className="monitor__foot" />
      </div>

      {finished ? (
        <section className="px-frame px-panel post-result" style={{ ['--line' as string]: res.ok ? 'var(--c-green)' : 'var(--c-orange)' }}>
          <div className="leds" aria-label="Kontrolky na desce">
            <Led name="CPU" kind="cpu" on={res.leds.cpu} />
            <Led name="DRAM" kind="dram" on={res.leds.dram} />
            <Led name="VGA" kind="vga" on={res.leds.vga} />
            <Led name="BOOT" kind="boot" on={res.leds.boot} />
          </div>
          {res.ok ? (
            <>
              <h2 className="t-24 t-ok">Počítač naběhl!</h2>
              <p>Všechny díly prošly testem. Teď z flash disku nainstaluješ operační systém.</p>
              <div>
                <button type="button" className="px-btn" onClick={() => go('os')}>Instalovat systém <Icon name="arrow" /></button>
              </div>
            </>
          ) : (
            <>
              <h2 className="t-24 t-bad">Počítač nenaběhl</h2>
              <p>{res.problem}</p>
              <p className="t-muted">Co s tím: {res.fix}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button type="button" className="px-btn" onClick={backToBench}><Icon name="wrench" /> Zpět do dílny</button>
                {res.needShop ? (
                  <button type="button" className="px-btn px-btn--dark" onClick={() => { backToBench(); go('shop'); }}>
                    <Icon name="cart" /> Do PC obchodu
                  </button>
                ) : null}
              </div>
            </>
          )}
        </section>
      ) : null}
      </div>
    </div>
  );
}

function Led({ name, kind, on }: { name: string; kind: string; on: boolean }) {
  return (
    <span className={`led led--${kind}${on ? ' led--on' : ''}`}>
      <span className="led__dot" aria-hidden="true" />
      {name}{on ? <span className="bpc-sr"> svítí</span> : null}
    </span>
  );
}
