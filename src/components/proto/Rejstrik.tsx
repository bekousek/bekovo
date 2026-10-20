/**
 * Návrh 2 — Rejstřík: globální hledání nad všemi položkami s fazetami,
 * „Mám po ruce" (pokusy podle pomůcek, které učitel má) a filtry v URL.
 * Data: /test/library.json (lehký index) a /test/library-text.json (plné texty,
 * dotahují se po prvním vykreslení).
 */
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import type { IndexItem, IndexJson, TextItem } from '../../lib/library/data';
import {
  AUDIENCE_LABEL,
  EQUIPMENT,
  KINDS,
  KIND_LABEL,
  MATERIAL_ACTION,
  MATERIAL_TYPE_ORDER,
  TYPE_LABEL,
  normalize,
  plural,
  type Kind,
} from '../../lib/library/model';
import { openDialog } from '../../lib/library/browser';

type Facets = {
  r: Set<string>; // ročník
  d: Set<string>; // druh
  a: Set<string>; // kdo provádí
  m: Set<string>; // typ materiálu
  z: Set<string>; // web materiálu
  t: Set<string>; // téma
  p: Set<string>; // pomůcky „mám po ruce"
};
type FacetKey = keyof Facets;
const FACET_KEYS: FacetKey[] = ['r', 'd', 'a', 'm', 'z', 't', 'p'];

type Row = IndexItem & {
  order: number;
  topicName: string;
  subName: string;
  titleN: string;
  baseN: string;
  fullN: string;
};

// Barvy ročníků převzaté ze současného webu (src/styles/global.css) — jediná barva Rejstříku, jen na datech. taste-skill-ignore
const GRADE_COLOR: Record<number, string> = { 6: '#10b981', 7: '#3b82f6', 8: '#f59e0b', 9: '#ef4444' };
const PAGE = 60;

const emptyFacets = (): Facets => ({ r: new Set(), d: new Set(), a: new Set(), m: new Set(), z: new Set(), t: new Set(), p: new Set() });

function readUrl() {
  const p = new URLSearchParams(location.search);
  const f = emptyFacets();
  for (const k of FACET_KEYS) for (const v of (p.get(k) ?? '').split(',').filter(Boolean)) f[k].add(v);
  return { q: p.get('q') ?? '', f, s: p.get('s'), i: p.get('i') };
}

function writeUrl(q: string, f: Facets, s: string | null, i: string | null, push: boolean) {
  const p = new URLSearchParams();
  if (q) p.set('q', q);
  for (const k of FACET_KEYS) if (f[k].size) p.set(k, [...f[k]].join(','));
  if (s) p.set('s', s);
  if (i) p.set('i', i);
  const url = `${location.pathname}${p.size ? `?${p}` : ''}`;
  if (url === `${location.pathname}${location.search}`) return;
  (push ? history.pushState : history.replaceState).call(history, history.state?.protoDialog ? null : history.state, '', url);
}

/** Shoda pomůcek pro „Mám po ruce". */
function equipmentFit(row: Row, have: Set<number>) {
  if (!row.mat?.length || !row.eq) return null;
  let covered = 0;
  const missing: string[] = [];
  row.mat.forEach((m, idx) => {
    const hit = row.eq![idx].some((e) => have.has(e));
    if (hit) covered += 1;
    else if (!row.opt?.includes(idx)) missing.push(m);
  });
  return covered ? { covered, missing } : null;
}

export default function Rejstrik() {
  const [index, setIndex] = useState<IndexJson | null>(null);
  const [texts, setTexts] = useState<Record<string, TextItem> | null>(null);
  const [error, setError] = useState(false);
  const initial = useMemo(readUrl, []);
  const [q, setQ] = useState(initial.q);
  const [facets, setFacets] = useState<Facets>(initial.f);
  const [sub, setSub] = useState<string | null>(initial.s);
  const [openKey, setOpenKey] = useState<string | null>(initial.i);
  const [limit, setLimit] = useState(PAGE);
  const [moreTopics, setMoreTopics] = useState(false);
  const [moreEq, setMoreEq] = useState(false);
  const [narrow, setNarrow] = useState(() => !matchMedia('(min-width: 1100px)').matches);
  const deferredQ = useDeferredValue(q);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const detailDialog = useRef<HTMLDialogElement>(null);
  const filterDialog = useRef<HTMLDialogElement>(null);

  // --- Načtení dat -----------------------------------------------------------
  const load = useCallback(() => {
    setError(false);
    fetch('/test/library.json')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: IndexJson) => {
        setIndex(data);
        return fetch('/test/library-text.json').then((r) => (r.ok ? r.json() : Promise.reject()));
      })
      .then(setTexts)
      .catch(() => setError(true));
  }, []);
  useEffect(load, [load]);

  useEffect(() => {
    const mq = matchMedia('(min-width: 1100px)');
    const on = () => setNarrow(!mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // --- Odvozené řádky ----------------------------------------------------------
  const rows: Row[] = useMemo(() => {
    if (!index) return [];
    const topicName = new Map(index.topics.map((t) => [t.id, t.name]));
    const subName = new Map(index.topics.flatMap((t) => t.subtopics.map((s) => [s.id, s.name])));
    const subOrder = new Map(index.topics.flatMap((t, ti) => t.subtopics.map((s, si) => [s.id, ti * 100 + si])));
    return index.items
      .map((i) => {
        const base = normalize(
          [i.t, (i.mat ?? []).join(' '), TYPE_LABEL[i.type] ?? '', topicName.get(i.topic), subName.get(i.sub), i.host, i.src]
            .filter(Boolean)
            .join(' '),
        );
        const text = texts?.[i.k];
        return {
          ...i,
          order: (subOrder.get(i.sub) ?? 0) * 10 + KINDS.indexOf(i.kind),
          topicName: topicName.get(i.topic) ?? '',
          subName: subName.get(i.sub) ?? '',
          titleN: normalize(i.t),
          baseN: base,
          fullN: text ? `${base} ${normalize(text.d)} ${normalize((text.s ?? []).join(' '))}` : base,
        };
      })
      .sort((a, b) => a.order - b.order);
  }, [index, texts]);

  const words = useMemo(() => normalize(deferredQ.trim()).split(/\s+/).filter(Boolean), [deferredQ]);
  const have = useMemo(() => new Set([...facets.p].map((id) => EQUIPMENT.findIndex((e) => e.id === id)).filter((n) => n >= 0)), [facets.p]);

  const matchOne = useCallback(
    (row: Row, skip?: FacetKey) => {
      if (sub && row.sub !== sub) return false;
      if (!words.every((w) => row.fullN.includes(w))) return false;
      if (skip !== 'r' && facets.r.size && !facets.r.has(String(row.g))) return false;
      if (skip !== 'd' && facets.d.size && !facets.d.has(row.kind)) return false;
      if (skip !== 'a' && facets.a.size && !(row.kind === 'pokus' && facets.a.has(row.aud ?? 'none'))) return false;
      if (skip !== 'm' && facets.m.size && !(row.kind === 'material' && facets.m.has(row.type))) return false;
      if (skip !== 'z' && facets.z.size && !(row.host && facets.z.has(row.host))) return false;
      if (skip !== 't' && facets.t.size && !facets.t.has(row.topic)) return false;
      if (skip !== 'p' && have.size && !equipmentFit(row, have)) return false;
      return true;
    },
    [sub, words, facets, have],
  );

  const results = useMemo(() => {
    const list = rows.filter((r) => matchOne(r));
    if (have.size) {
      const fit = new Map(list.map((r) => [r.k, equipmentFit(r, have)!]));
      return list.sort((a, b) => fit.get(a.k)!.missing.length - fit.get(b.k)!.missing.length || fit.get(b.k)!.covered - fit.get(a.k)!.covered);
    }
    if (words.length) {
      const score = (r: Row) => words.reduce((s, w) => s + (r.titleN.includes(w) ? 10 : r.baseN.includes(w) ? 3 : 1), 0);
      return list.sort((a, b) => score(b) - score(a) || a.order - b.order);
    }
    return list;
  }, [rows, matchOne, words, have]);

  const counts = useMemo(() => {
    const c: Record<FacetKey, Map<string, number>> = { r: new Map(), d: new Map(), a: new Map(), m: new Map(), z: new Map(), t: new Map(), p: new Map() };
    const bump = (k: FacetKey, v: string | undefined) => v && c[k].set(v, (c[k].get(v) ?? 0) + 1);
    for (const row of rows) {
      if (matchOne(row, 'r')) bump('r', String(row.g));
      if (matchOne(row, 'd')) bump('d', row.kind);
      if (row.kind === 'pokus' && matchOne(row, 'a')) bump('a', row.aud ?? 'none');
      if (row.kind === 'material' && matchOne(row, 'm')) bump('m', row.type);
      if (row.host && matchOne(row, 'z')) bump('z', row.host);
      if (matchOne(row, 't')) bump('t', row.topic);
    }
    return c;
  }, [rows, matchOne]);

  const topHosts = useMemo(() => {
    const all = new Map<string, number>();
    for (const r of rows) if (r.host) all.set(r.host, (all.get(r.host) ?? 0) + 1);
    return [...all.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([h]) => h);
  }, [rows]);

  // --- Stav ↔ URL ----------------------------------------------------------------
  const firstWrite = useRef(true);
  useEffect(() => {
    if (firstWrite.current) {
      firstWrite.current = false;
      return;
    }
    writeUrl(q, facets, sub, narrow ? null : openKey, false);
  }, [q, openKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = (next: Facets, nextSub = sub) => {
    setFacets(next);
    setSub(nextSub);
    setLimit(PAGE);
    // Dokud je otevřený panel filtrů, historie se nepřepisuje po každém čipu.
    writeUrl(q, next, nextSub, narrow ? null : openKey, !filterDialog.current?.open);
  };
  const toggle = (k: FacetKey, v: string) => {
    const next = { ...facets, [k]: new Set(facets[k]) };
    next[k].has(v) ? next[k].delete(v) : next[k].add(v);
    commit(next);
  };
  const clearAll = () => {
    setQ('');
    commit(emptyFacets(), null);
  };

  useEffect(() => {
    const onPop = () => {
      const u = readUrl();
      setQ(u.q);
      setFacets(u.f);
      setSub(u.s);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // --- Detail ------------------------------------------------------------------------
  const open = useMemo(() => rows.find((r) => r.k === openKey) ?? null, [rows, openKey]);
  useEffect(() => {
    const dlg = detailDialog.current;
    if (!dlg) return;
    if (open && narrow && !dlg.open) openDialog(dlg);
    if ((!open || !narrow) && dlg.open) dlg.close();
  }, [open, narrow]);

  // --- Klávesnice ---------------------------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
      if (e.key === '/' && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      } else if (e.key === 'Escape' && !narrow && openKey) {
        setOpenKey(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [narrow, openKey]);

  const moveFocus = (from: HTMLElement | null, delta: number) => {
    const buttons = [...(listRef.current?.querySelectorAll<HTMLButtonElement>('.rj-row') ?? [])];
    if (!buttons.length) return;
    const idx = from ? buttons.indexOf(from as HTMLButtonElement) : -1;
    const next = buttons[Math.min(Math.max(idx + delta, 0), buttons.length - 1)];
    next.focus();
    if (!narrow) setOpenKey(next.dataset.k!);
  };

  // --- Vykreslení -----------------------------------------------------------------------
  const activeCount = FACET_KEYS.reduce((n, k) => n + facets[k].size, 0) + (sub ? 1 : 0);
  const subLabel = sub && rows.find((r) => r.sub === sub)?.subName;
  const shown = results.slice(0, limit);

  const groups = useMemo(() => {
    if (words.length || have.size) return [{ id: 'flat', name: '', grade: 0, rows: shown }];
    const out: { id: string; name: string; grade: number; rows: Row[] }[] = [];
    for (const r of shown) {
      const last = out.at(-1);
      if (last && last.id === r.topic) last.rows.push(r);
      else out.push({ id: r.topic, name: r.topicName, grade: r.g, rows: [r] });
    }
    return out;
  }, [shown, words, have]);

  const chip = (k: FacetKey, v: string, label: string, n?: number) => (
    <button
      key={`${k}-${v}`}
      type="button"
      className="rj-chip"
      aria-pressed={facets[k].has(v)}
      onClick={() => toggle(k, v)}
      disabled={n === 0 && !facets[k].has(v)}
    >
      {label}
      {n !== undefined && <span className="num">{n}</span>}
    </button>
  );

  const facetPanel = (
    <div className="rj-facets">
      <section>
        <h2>Ročník</h2>
        <div className="rj-chiprow">{[6, 7, 8, 9].map((g) => chip('r', String(g), `${g}.`, counts.r.get(String(g)) ?? 0))}</div>
      </section>
      <section>
        <h2>Druh</h2>
        <div className="rj-chiprow">{KINDS.map((k) => chip('d', k, KIND_LABEL[k].many, counts.d.get(k) ?? 0))}</div>
      </section>
      <section>
        <h2>Kdo pokus provádí</h2>
        <div className="rj-chiprow">
          {(['zak', 'demo', 'oboje'] as const).map((a) => chip('a', a, AUDIENCE_LABEL[a], counts.a.get(a) ?? 0))}
          {chip('a', 'none', 'Neuvedeno', counts.a.get('none') ?? 0)}
        </div>
      </section>
      <section>
        <h2>Typ materiálu</h2>
        <div className="rj-chiprow">{MATERIAL_TYPE_ORDER.map((t) => chip('m', t, TYPE_LABEL[t], counts.m.get(t) ?? 0))}</div>
      </section>
      <section>
        <h2>Web materiálu</h2>
        <div className="rj-chiprow">{topHosts.map((h) => chip('z', h, h, counts.z.get(h) ?? 0))}</div>
      </section>
      <section>
        <h2>Téma</h2>
        <ul className="rj-topics">
          {(index?.topics ?? [])
            .filter((t, i) => moreTopics || i < 8 || facets.t.has(t.id))
            .map((t) => (
              <li key={t.id}>
                <label>
                  <input type="checkbox" checked={facets.t.has(t.id)} onChange={() => toggle('t', t.id)} />
                  <i style={{ background: GRADE_COLOR[t.grade] }} aria-hidden="true" />
                  <span>{t.name}</span>
                  <span className="num">{counts.t.get(t.id) ?? 0}</span>
                </label>
              </li>
            ))}
        </ul>
        <button type="button" className="rj-linkbtn" onClick={() => setMoreTopics(!moreTopics)}>
          {moreTopics ? 'Méně témat' : `Všech ${index?.topics.length ?? 19} témat`}
        </button>
      </section>
      <section id="rj-eq">
        <h2>Mám po ruce</h2>
        <p className="rj-hint">Zaklikni pomůcky, které máš. Pokusy se seřadí podle toho, kolik jich chybí.</p>
        <div className="rj-chiprow">
          {EQUIPMENT.filter((e, i) => moreEq || i < 18 || facets.p.has(e.id)).map((e) => chip('p', e.id, e.label))}
        </div>
        <button type="button" className="rj-linkbtn" onClick={() => setMoreEq(!moreEq)}>
          {moreEq ? 'Méně pomůcek' : `Všech ${EQUIPMENT.length} pomůcek`}
        </button>
      </section>
    </div>
  );

  const metaOf = (r: Row, grouped: boolean) =>
    [
      narrow ? KIND_LABEL[r.kind].one : null,
      r.kind === 'pokus' ? (r.aud ? AUDIENCE_LABEL[r.aud] : null) : r.kind === 'ukol' ? null : TYPE_LABEL[r.type],
      grouped ? r.subName : `${r.topicName} › ${r.subName}`,
      r.host ?? r.src,
    ].filter(Boolean) as string[];

  const detail = open && (
    <article className="rj-detail-body">
      <h2 className="rj-d-title">{open.t}</h2>
      <p className="rj-d-where">
        <i style={{ background: GRADE_COLOR[open.g] }} aria-hidden="true" />
        {open.g}. třída · {open.topicName} › {open.subName}
      </p>
      <p className="rj-d-tags">
        <span className="rj-pill">{KIND_LABEL[open.kind].one}</span>
        {open.kind !== 'ukol' && <span className="rj-pill">{TYPE_LABEL[open.type]}</span>}
        {open.aud && <span className="rj-pill">{AUDIENCE_LABEL[open.aud]}</span>}
        {open.host && <span className="rj-pill">{open.host}</span>}
      </p>
      <div className="rj-d-actions">
        {open.url && (
          <a className="rj-btn primary" href={open.url} target="_blank" rel="noopener noreferrer">
            {MATERIAL_ACTION[open.type] ?? 'Otevřít'} ↗
          </a>
        )}
        <a className="rj-btn" href={`/test1/${open.topic}/${open.sub}#${open.k}`}>V Přípravně</a>
        <a className="rj-btn" href={`/test3/${open.topic}/${open.sub}#${open.k}`}>V Kabinetu</a>
      </div>
      {texts ? (
        texts[open.k]?.d.split(/\n\s*\n/).map((p, n) => <p key={n} className="rj-d-p">{p}</p>)
      ) : (
        <p className="rj-d-p rj-loading-line" aria-busy="true">Načítám text…</p>
      )}
      {open.mat && open.mat.length > 0 && (
        <section>
          <h3>Pomůcky</h3>
          <ul className="rj-d-mat">
            {open.mat.map((m, n) => {
              const has = have.size > 0 && open.eq?.[n].some((e) => have.has(e));
              return (
                <li key={n} data-has={have.size ? String(Boolean(has)) : undefined}>
                  {have.size > 0 && (
                    <span className="mark" role="img" aria-label={has ? 'máš' : 'chybí'}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                        <path d={has ? 'm5 12.5 4.5 4.5L19 7.5' : 'M6 12h12'} />
                      </svg>
                    </span>
                  )}
                  {m}
                  {open.opt?.includes(n) && !/volitel/i.test(m) && <small> (volitelně)</small>}
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {texts?.[open.k]?.s && (
        <section>
          <h3>Postup</h3>
          <ol className="rj-d-steps">{texts[open.k].s!.map((s, n) => <li key={n}>{s}</li>)}</ol>
        </section>
      )}
      {texts?.[open.k]?.l && (
        <section>
          <h3>Odkazy</h3>
          <ul className="rj-d-mat">
            {texts[open.k].l!.map((l) => (
              <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer">{l.label} ↗</a></li>
            ))}
          </ul>
        </section>
      )}
      {(open.src || texts?.[open.k]?.f) && (
        <footer className="rj-d-foot">
          {texts?.[open.k]?.f && <a href={texts[open.k].f} target="_blank" rel="noopener noreferrer">Soubor ke stažení ↗</a>}
          {open.src && (open.srcUrl ? <span>Zdroj: <a href={open.srcUrl} target="_blank" rel="noopener noreferrer">{open.src} ↗</a></span> : <span>Zdroj: {open.src}</span>)}
        </footer>
      )}
    </article>
  );

  const total = index?.items.length ?? 0;

  return (
    <div className={`rj${open && !narrow ? ' has-detail' : ''}`}>
      <aside className="rj-side" aria-label="Filtry">
        <a className="rj-brand" href="/test2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(-28 12 12)" />
            <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(32 12 12)" opacity="0.45" />
            <circle cx="12" cy="12" r="2.6" fill="currentColor" stroke="none" />
          </svg>
          Bekovo <small>Rejstřík</small>
        </a>
        {facetPanel}
      </aside>

      <main className="rj-main">
        <header className="rj-head">
          <h1>Rejstřík</h1>
          <p className="rj-sub">
            {index
              ? `${total.toLocaleString('cs-CZ')} položek: pokusy, aktivity, materiály a úkoly ze všech ${index.topics.length} témat`
              : 'Načítám rejstřík…'}
          </p>
        </header>

        <div className="rj-searchbar">
          <label className="rj-search">
            <span className="sr-only">Hledat</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-4.2-4.2" />
            </svg>
            <input
              ref={searchRef}
              type="search"
              value={q}
              placeholder="Hledej pokus, pomůcku, applet… (/)"
              autoComplete="off"
              onChange={(e) => {
                setQ(e.target.value);
                setLimit(PAGE);
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  moveFocus(null, 1);
                } else if (e.key === 'Escape') setQ('');
              }}
            />
          </label>
          <button type="button" className="rj-filterbtn" onClick={() => filterDialog.current && openDialog(filterDialog.current)}>
            Filtry{activeCount ? ` (${activeCount})` : ''}
          </button>
        </div>

        <div className="rj-quick" aria-label="Rychlé filtry">
          {chip('d', 'pokus', 'Pokusy')}
          {chip('m', 'applet', 'Applety')}
          {chip('m', 'video', 'Videa')}
          {chip('d', 'aktivita', 'Aktivity')}
          {chip('d', 'ukol', 'Úkoly')}
          <button
            type="button"
            className="rj-chip"
            aria-pressed={facets.p.size > 0}
            onClick={() => {
              if (filterDialog.current) {
                openDialog(filterDialog.current);
                filterDialog.current.querySelector('#rj-eq')?.scrollIntoView();
              }
            }}
          >
            Mám po ruce{facets.p.size ? ` (${facets.p.size})` : '…'}
          </button>
        </div>

        <div className="rj-status" aria-live="polite">
          <span>
            {index
              ? `${results.length.toLocaleString('cs-CZ')} ${plural(results.length, 'výsledek', 'výsledky', 'výsledků')}${
                  have.size ? ' · seřazeno podle chybějících pomůcek' : words.length ? ' · podle shody' : ' · podle osnovy'
                }`
              : ''}
            {words.length > 0 && !texts && index && ' · zatím jen v názvech, texty se načítají'}
          </span>
          {(activeCount > 0 || q) && (
            <button type="button" className="rj-linkbtn" onClick={clearAll}>
              Zrušit vše
            </button>
          )}
        </div>
        {(activeCount > 0) && (
          <div className="rj-active">
            {sub && (
              <button type="button" className="rj-tag" onClick={() => commit(facets, null)}>
                Podkapitola: {subLabel ?? sub} <span aria-hidden="true">×</span>
              </button>
            )}
            {FACET_KEYS.flatMap((k) =>
              [...facets[k]].map((v) => {
                const label =
                  k === 'r' ? `${v}. třída` : k === 'd' ? KIND_LABEL[v as Kind].many : k === 'a' ? (v === 'none' ? 'Neuvedeno' : AUDIENCE_LABEL[v as 'zak']) :
                  k === 'm' ? TYPE_LABEL[v] : k === 't' ? index?.topics.find((t) => t.id === v)?.name ?? v :
                  k === 'p' ? `mám: ${EQUIPMENT.find((e) => e.id === v)?.label}` : v;
                return (
                  <button key={`${k}${v}`} type="button" className="rj-tag" onClick={() => toggle(k, v)}>
                    {label} <span aria-hidden="true">×</span>
                  </button>
                );
              }),
            )}
          </div>
        )}

        {error && (
          <div className="rj-empty">
            Rejstřík se nepodařilo načíst. <button type="button" className="rj-linkbtn" onClick={load}>Zkusit znovu</button>
          </div>
        )}
        {!index && !error && (
          <ol className="rj-list" aria-hidden="true">
            {Array.from({ length: 8 }, (_, n) => (
              <li key={n} className="rj-skel"><i /><span /></li>
            ))}
          </ol>
        )}
        {index && results.length === 0 && (
          <div className="rj-empty">
            Nic neodpovídá{q ? ` hledání „${q}"` : ''}.{' '}
            {have.size > 0 ? 'Zkus zakliknout víc pomůcek.' : 'Zkus kratší slovo nebo zrušit některý filtr.'}{' '}
            <button type="button" className="rj-linkbtn" onClick={clearAll}>Zrušit vše</button>
          </div>
        )}

        <ol className="rj-list" ref={listRef}>
          {groups.map((g) => (
            <li key={g.id} className="rj-group">
              {g.name && (
                <h2 className="rj-group-h">
                  <i style={{ background: GRADE_COLOR[g.grade] }} aria-hidden="true" />
                  {g.name} <span>{g.grade}. třída</span>
                </h2>
              )}
              <ol>
                {g.rows.map((r) => {
                  const fit = have.size ? equipmentFit(r, have) : null;
                  return (
                    <li key={r.k}>
                      <button
                        type="button"
                        className="rj-row"
                        data-k={r.k}
                        aria-current={r.k === openKey ? 'true' : undefined}
                        onClick={() => setOpenKey(r.k)}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                            e.preventDefault();
                            moveFocus(e.currentTarget, e.key === 'ArrowDown' ? 1 : -1);
                          } else if (e.key === 'Escape') searchRef.current?.focus();
                        }}
                      >
                        <i className="rj-g" style={{ background: GRADE_COLOR[r.g] }} aria-hidden="true" />
                        <span className="rj-row-main">
                          <span className="rj-t">{r.t}</span>
                          <span className="rj-m">
                            {fit ? (
                              <span className={fit.missing.length ? 'miss' : 'ok'}>
                                {fit.missing.length
                                  ? `chybí: ${fit.missing.slice(0, 3).join(', ')}${fit.missing.length > 3 ? ` +${fit.missing.length - 3}` : ''}`
                                  : 'máš všechno'}
                              </span>
                            ) : null}
                            {metaOf(r, Boolean(g.name)).map((m, n) => <span key={n}>{m}</span>)}
                          </span>
                        </span>
                        <span className="rj-kind">{KIND_LABEL[r.kind].one}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </li>
          ))}
        </ol>
        {results.length > limit && (
          <button type="button" className="rj-more" onClick={() => setLimit(limit + PAGE * 2)}>
            Zobrazit další ({(results.length - limit).toLocaleString('cs-CZ')})
          </button>
        )}
      </main>

      {!narrow && open && (
        <aside className="rj-detail" aria-label="Detail položky">
          <button type="button" className="rj-close" onClick={() => setOpenKey(null)} aria-label="Zavřít detail">×</button>
          {detail}
        </aside>
      )}

      <dialog className="rj-sheet rj-sheet-full" ref={detailDialog} aria-label="Detail položky" onClose={() => setOpenKey(null)}>
        <div className="rj-sheet-bar">
          <button type="button" className="rj-iconbtn" onClick={() => detailDialog.current?.close()} aria-label="Zpět na výsledky">‹</button>
          <strong>{open ? KIND_LABEL[open.kind].one : ''}</strong>
        </div>
        <div className="rj-sheet-body">{narrow && detail}</div>
      </dialog>

      <dialog className="rj-sheet rj-sheet-bottom" ref={filterDialog} aria-label="Filtry">
        <div className="rj-sheet-bar">
          <button type="button" className="rj-iconbtn" onClick={() => filterDialog.current?.close()} aria-label="Zavřít filtry">×</button>
          <strong>Filtry</strong>
          {activeCount > 0 && (
            <button type="button" className="rj-linkbtn" style={{ marginLeft: 'auto' }} onClick={() => commit(emptyFacets(), null)}>
              Zrušit filtry
            </button>
          )}
        </div>
        <div className="rj-sheet-body">{facetPanel}</div>
        <div className="rj-sheet-foot">
          <button type="button" className="rj-btn primary" onClick={() => filterDialog.current?.close()}>
            Zobrazit {results.length.toLocaleString('cs-CZ')} {plural(results.length, 'výsledek', 'výsledky', 'výsledků')}
          </button>
        </div>
      </dialog>
    </div>
  );
}

