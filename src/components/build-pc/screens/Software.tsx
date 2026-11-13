import { useMemo, useState } from 'react';
import { useGame } from '../state';
import { ScreenHead } from '../ui';
import { ArtSvg, Icon } from '../pixel/Sprite';
import { ICONS } from '../pixel/sprites';
import { PART_BY_ID, type Os } from '../data/parts';
import { activeParts } from '../assembly/steps';
import { BUNDLE_ID, SCAREWARE_ID, tasksFor, type Result, type SwTask } from '../data/software';
import { sfx } from '../sfx';

type Page =
  | { kind: 'home' }
  | { kind: 'serp'; task: SwTask }
  | { kind: 'site'; task: SwTask; result: Result }
  | { kind: 'installer'; task: SwTask; viaPortal: boolean };

export default function Software() {
  const { s, update, go, toast } = useGame();
  const os = s.os.osId ? (PART_BY_ID[s.os.osId] as Os) : null;
  const { gpu } = activeParts(s);
  const brand = gpu ? (gpu.name.includes('Radeon') ? 'amd' : gpu.name.includes('Intel') ? 'intel' : 'nvidia') : null;
  const tasks = useMemo(() => tasksFor(s.goal ?? 'school', os?.kind ?? 'windows', brand), [s.goal, os?.kind, brand]);
  const [page, setPage] = useState<Page>({ kind: 'home' });
  const [bundle, setBundle] = useState(true);
  const [popup, setPopup] = useState(false);
  const allDone = tasks.every((t) => s.sw.done.includes(t.id));

  const fell = (id: string, text: string) => {
    sfx('bad');
    update((d) => { if (!d.sw.fell.includes(id)) d.sw.fell.push(id); });
    toast('bad', text);
  };
  const dodged = (id: string) => update((d) => { if (!d.sw.dodged.includes(id) && !d.sw.fell.includes(id)) d.sw.dodged.push(id); });

  const openResult = (task: SwTask, r: Result) => {
    sfx('click');
    if (r.kind !== 'official') {
      fell(`${task.id}:${r.kind}`, task.trapText[r.kind]);
    } else {
      dodged(`${task.id}:ad`);
      dodged(`${task.id}:portal`);
    }
    setPage({ kind: 'site', task, result: r });
  };

  const install = (task: SwTask, viaPortal: boolean) => {
    if (viaPortal && bundle) fell(BUNDLE_ID, 'Spolu s programem se nainstalovala lišta SuperSearch a změnila ti domovskou stránku. Zaškrtnuté „doporučené“ doplňky vždycky odškrtni.');
    else if (viaPortal) dodged(BUNDLE_ID);
    sfx('ok');
    const doneBefore = s.sw.done.length;
    update((d) => { if (!d.sw.done.includes(task.id)) d.sw.done.push(task.id); });
    setPage({ kind: 'home' });
    setBundle(true);
    toast('ok', `${task.program} je nainstalovaný.`);
    if (doneBefore === 1 && !s.sw.fell.includes(SCAREWARE_ID) && !s.sw.dodged.includes(SCAREWARE_ID)) {
      window.setTimeout(() => setPopup(true), 600);
    }
  };

  const url = page.kind === 'home' ? 'nova-zalozka' : page.kind === 'serp' ? `hledat: ${page.task.query}` : page.kind === 'site' ? page.result.url : page.task.program;

  return (
    <>
      <ScreenHead
        title="Programy"
        lead="Systém běží. Nainstaluj základní programy, ale bezpečně: jen z oficiálních zdrojů."
        back="workshop"
      />
      <div className="sw-layout">
        <aside className="sw-tasks px-frame" aria-label="Úkoly">
          <h2 className="t-20">Co nainstalovat</h2>
          {tasks.map((t) => {
            const done = s.sw.done.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                className="sw-task"
                style={{ appearance: 'none', border: 0, background: 'transparent', color: 'inherit', textAlign: 'left', cursor: done ? 'default' : 'pointer', padding: '6px 0' }}
                disabled={done}
                onClick={() => { sfx('click'); setPage({ kind: 'serp', task: t }); }}
              >
                <ArtSvg art={ICONS[done ? 'check' : 'arrow']} scale={2} tint={done ? 'lime' : 'silver'} />
                <span>
                  <b style={{ fontWeight: 600 }}>{t.title}</b>
                  <br /><span className="t-muted t-16">{done ? 'Hotovo' : t.why}</span>
                </span>
              </button>
            );
          })}
          <p className="t-muted t-16" style={{ marginTop: 8 }}>Pasti, do kterých jsi spadl: {s.sw.fell.length}</p>
          {allDone ? (
            <button type="button" className="px-btn px-btn--block" onClick={() => go('finish')}>
              <Icon name="star" /> Výsledek
            </button>
          ) : null}
        </aside>

        <div className="monitor" style={{ justifyItems: 'stretch' }}>
          <div className="monitor__bezel px-frame" style={{ width: '100%' }}>
            <div className="monitor__screen" style={{ aspectRatio: 'auto', minHeight: 520 }}>
              <div className="br">
                <div className="br__tabs"><span className="br__tab br__tab--on">{page.kind === 'home' ? 'Nová záložka' : url}</span></div>
                <div className="br__bar">
                  <button type="button" className="px-btn px-btn--small px-btn--dark" onClick={() => setPage({ kind: 'home' })} aria-label="Domů">
                    <Icon name="home" />
                  </button>
                  <div className="br__url" title={url}>
                    {page.kind === 'site' ? <><Icon name={page.result.kind === 'official' ? 'check' : 'warn'} /> <b>{page.result.url}</b></> : url}
                  </div>
                </div>
                <div className="br__page" style={{ position: 'relative' }}>
                  {page.kind === 'home' ? (
                    <div style={{ display: 'grid', gap: 12 }}>
                      <h2>{allDone ? 'Všechno nainstalováno' : 'Vyber vlevo program'}</h2>
                      <p>{allDone ? 'Počítač je připravený. Podívej se na výsledek.' : 'Klikni na úkol vlevo. Otevře se vyhledávač a ty vybereš, odkud program stáhneš.'}</p>
                    </div>
                  ) : null}
                  {page.kind === 'serp' ? (
                    <div className="serp">
                      <p style={{ fontSize: 15 }}>Výsledky hledání: <b>{page.task.query}</b></p>
                      {page.task.results.map((r) => (
                        <div key={r.url + r.title} className="serp__item">
                          {r.kind === 'ad' ? <span className="serp__ad">Reklama</span> : null}
                          <span className="serp__url">{r.url}</span>
                          <button type="button" className="serp__title" onClick={() => openResult(page.task, r)}>{r.title}</button>
                          <span className="serp__desc">{r.desc}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {page.kind === 'site' ? (
                    page.result.kind === 'official' ? (
                      <div className="dl-page">
                        <h2>{page.task.program}</h2>
                        <p>Oficiální stránka. Stáhneš instalátor přímo od autora.</p>
                        <div><button type="button" className="px-btn px-btn--ok" onClick={() => setPage({ kind: 'installer', task: page.task, viaPortal: false })}>Stáhnout {page.task.program}</button></div>
                      </div>
                    ) : page.result.kind === 'portal' ? (
                      <div className="dl-page">
                        <h2>{page.result.title}</h2>
                        <p>Tohle není web autora programu. Instalátor portálu může přibalit další programy.</p>
                        <div className="dl-fake">
                          <button type="button" className="px-btn" onClick={() => setPage({ kind: 'installer', task: page.task, viaPortal: true })}>Přesto stáhnout</button>
                          <button type="button" className="px-btn px-btn--dark" onClick={() => setPage({ kind: 'serp', task: page.task })}>Zpět na výsledky</button>
                        </div>
                      </div>
                    ) : (
                      <div className="dl-page">
                        <h2>{page.result.title}</h2>
                        <p>Stránka plná reklam. Kde je oficiální odkaz? Nikde.</p>
                        <div className="dl-fake">
                          <button type="button" className="px-btn px-btn--ok" disabled>STÁHNOUT</button>
                          <button type="button" className="px-btn px-btn--ok" disabled>DOWNLOAD</button>
                          <button type="button" className="px-btn px-btn--dark" onClick={() => setPage({ kind: 'serp', task: page.task })}>Zpět na výsledky</button>
                        </div>
                      </div>
                    )
                  ) : null}
                  {page.kind === 'installer' ? (
                    <div className="dl-page" style={{ maxWidth: 520 }}>
                      <h2>Instalace: {page.task.program}</h2>
                      <label className="inst-check"><input type="checkbox" defaultChecked /> <span>Vytvořit zástupce na ploše</span></label>
                      {page.viaPortal ? (
                        <label className="inst-check">
                          <input type="checkbox" checked={bundle} onChange={(e) => setBundle(e.target.checked)} />
                          <span><b>Doporučeno:</b> nainstalovat také lištu SuperSearch a nastavit ji jako domovskou stránku</span>
                        </label>
                      ) : null}
                      <div><button type="button" className="px-btn px-btn--ok" onClick={() => install(page.task, page.viaPortal)}>Instalovat</button></div>
                    </div>
                  ) : null}

                  {popup ? (
                    <div className="popup" role="alertdialog" aria-label="Varování">
                      <div className="popup__box">
                        <p className="popup__title">VÁŠ POČÍTAČ JE ZAVIROVANÝ!</p>
                        <p>Nalezeny 3 viry! Okamžitě klikněte na Vyčistit a kupte PC Cleaner Pro jen za 499 Kč.</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
                          <button type="button" className="px-btn px-btn--bad" onClick={() => { setPopup(false); fell(SCAREWARE_ID, 'Tohle byl scareware: falešné varování, které straší a chce peníze. Windows má vestavěný Defender a žádná webová stránka tvůj disk prohledat neumí.'); }}>
                            VYČISTIT HNED
                          </button>
                          <button type="button" className="px-btn px-btn--dark px-btn--small" onClick={() => { setPopup(false); dodged(SCAREWARE_ID); sfx('ok'); toast('ok', 'Správně. Falešná varování jen zavři. Webová stránka tvůj počítač prohledat neumí.'); }}>
                            Zavřít okno
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
