import { readFileSync } from 'node:fs';

/* ------------------------------------------------------------------ *
 * Parser aktivit z metodik Projektu Odyssea.
 *
 * Vstupem je text vytažený z PDF se značkami `===== STRANA N =====`
 * (viz odyssea-pdf-na-text.mjs). Samostatně:
 *   node scripts/osv/odyssea-split.mjs <soubor.txt>       # přehled
 *   JSON=1 node scripts/osv/odyssea-split.mjs <soubor.txt>
 *   CAPS=1 / NUMBERED=1 / WHOLE=1 přepínají režim nadpisů (viz OSV.md).
 *
 * Metodiky používají dva zápisy polí:
 *   (a) název pole na samostatném řádku, hodnota na dalších řádcích
 *   (b) "Pole: hodnota" na jednom řádku (hodnota může pokračovat níž)
 * a dva typy nadpisů aktivit:
 *   (a) "A1 Název" / "A 1 Název"  — zásobník aktivit v lekcích
 *   (b) "2.4 NÁZEV"              — programové bloky v kurzech
 * ------------------------------------------------------------------ */

const FIELDS = [
  'Čas', 'Trvání', 'Cíle', 'Cíl', 'Cíl hry', 'Cíl aktivity', 'Věk', 'Počet osob',
  'Počet hráčů', 'Prostředí', 'Místo', 'Pomůcky', 'Postup', 'Popis postupu',
  'Průběh', 'Průběh aktivity', 'Instrukce', 'Zadání', 'Zdroj', 'Zdroje',
  'Poznámka', 'Poznámky', 'Varianta', 'Varianty', 'Jiná varianta', 'Obměna',
  'Variace', 'Reflexe', 'Otázky pro reflexi', 'Zhodnocení', 'Evaluace',
  'Doporučení', 'Rizika', 'Bezpečnost', 'Popis', 'Počet', 'Cíl a smysl',
];
const FIELD_RE = new RegExp(
  `^\\s*(${[...FIELDS].sort((a, b) => b.length - a.length)
    .map((f) => f.replace(/ /g, '\\s+')).join('|')})\\s*([::]\\s*(.*))?$`, 'i');

const FIELD_BARE = new RegExp(
  `^\\s*(${[...FIELDS].sort((a, b) => b.length - a.length)
    .map((f) => f.replace(/ /g, '\\s+')).join('|')})\\s+(\\S.*)$`, 'i');

/**
 * Vrátí {label, inline} pro řádek, který je názvem pole, jinak null.
 * `bare` = dokument píše pole bez dvojtečky („Věk 10 +“).
 */
function fieldAt(line, bare) {
  const m = line.match(FIELD_RE);
  if (m && (m[2] || line.trim().length <= m[1].length + 1)) {
    return { label: m[1].replace(/\s+/g, ' ').trim().toLowerCase(), inline: (m[3] || '').trim() };
  }
  if (!bare) return null;
  const b = line.match(FIELD_BARE);
  if (!b) return null;
  return { label: b[1].replace(/\s+/g, ' ').trim().toLowerCase(), inline: b[2].trim() };
}

const HEAD_ACT = /^\s*([A-ZČŘŠŽ])\s*[.]?\s*(\d{1,2})[.)]?\s+(\S.{1,70})$/;
const HEAD_NUM = /^\s*(\d{1,2}\.\d{1,2})\.?\s+(\S.{1,70})$/;
const LOWER = /[a-záčďéěíňóřšťúůýž]/;
const CAPS = /[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/g;
const BACKMATTER = /^\s*(ISBN|Vydalo|Vydání|Tato publikace|Počet stran|©|Fotografie:|www\.|Katusická|Projekt je financován)/i;
const SKIP_CAPS = /^(POZNÁMK|PROGRAM|OBSAH|PŘÍLOH|POUŽIT|LITERATUR|ÚVOD|OBECNĚ|DESIGN|CO NÁS ČEKÁ|EVALUACE|STRUKTURA|SMYSL|TÉMA|CÍLE KURZU|OČEKÁVAN|ZÁVĚR$|ZDROJ|ANOTACE|PŘEHLED|DOPORUČ)/;
const SKIP_NUM = /^(cíle?|praktická teorie|doporučený postup|evaluace|struktura|smysl|téma|úvodní otázky|očekávaný|témata|obsah|použitá|zásobník|literatura|reflexe|teorie)/i;

export function parse(path, opts = {}) {
  const t = readFileSync(path, 'utf8');
  const pages = t.split(/===== STRANA \d+ =====\n/).slice(1);

  // Některé lekce píšou pole bez dvojtečky („Věk 10 +“). Poznáme to podle
  // krátkých jednoznačných polí; teprve pak volnější tvar povolíme.
  const bare = (t.match(/^[ \t]*(Čas|Věk|Trvání)[ \t]+\S/gmi) || []).length >= 3;
  const FA = (line) => fieldAt(line, bare);

  // Začátek zásobníku aktivit. Nadpis kapitoly, ne řádek obsahu (ten je
  // vytečkovaný) — a bereme poslední výskyt, obsah je vždy dřív než kapitola.
  let start = 0;
  if (!opts.whole) {
    const CH = /^\s*\d{0,2}[.)]?\s*(PODROBNÝ POPIS|ZÁSOBNÍK AKTIVIT|PODROBNÉ POPISY)/i;
    for (let i = pages.length - 1; i >= 0; i--) {
      if (pages[i].split('\n').some((l) => CH.test(l) && !/\.{3,}/.test(l))) { start = i; break; }
    }
  }

  // Živá záhlaví a zápatí: krátký řádek u kraje stránky, který se doslova
  // opakuje na čtyřech a více stránkách. Názvy polí nikdy nezahazujeme.
  const freq = new Map();
  const edges = pages.map((p) => {
    const ne = p.split('\n').map((l) => l.trim()).filter(Boolean);
    return new Set([...ne.slice(0, 3), ...ne.slice(-2)]);
  });
  edges.forEach((s) => s.forEach((l) => freq.set(l, (freq.get(l) || 0) + 1)));
  const isChrome = (s, pi) => edges[pi].has(s) && freq.get(s) >= 4 && !FA(s);

  const lines = [];
  pages.slice(start).forEach((p, i) => {
    const pi = start + i;
    for (const l of p.split('\n')) {
      const s = l.trim();
      if (!s) { lines.push({ txt: '', page: pi + 1 }); continue; }
      if (isChrome(s, pi)) continue;
      if (/^\d{1,3}$/.test(s)) continue;              // číslo stránky
      if (/www\.odyssea/.test(s)) continue;
      lines.push({ txt: l, page: pi + 1 });
    }
  });

  const isCaps = (l) => {
    const s = l.trim();
    return s.length >= 2 && s.length <= 70 && !LOWER.test(s) &&
      (s.match(CAPS) || []).length >= 2 && !FA(s);
  };

  /** Nadpis psaný verzálkami (i na více řádcích), po němž následuje název pole. */
  function capsHead(i) {
    if (!isCaps(lines[i].txt)) return null;
    if (i > 0 && isCaps(lines[i - 1].txt)) return null;             // pokračování nadpisu
    const parts = [];
    let j = i;
    while (j < lines.length && isCaps(lines[j].txt)) parts.push(lines[j++].txt.trim());
    for (let k = j, seen = 0; k < lines.length && seen < 4; k++) {
      if (!lines[k].txt.trim()) continue;
      seen++;
      if (!FA(lines[k].txt)) continue;
      // Pole musí být na téže stránce jako nadpis, jinak jsme jen narazili
      // na konec odstavce psaný verzálkami (např. zkratku ve zdroji).
      if (lines[k].page !== lines[j - 1].page) return null;
      const title = parts.join(' ').replace(/\s+/g, ' ').replace(/^[–—-]\s*/, '').trim();
      if (/\.$/.test(title) || SKIP_CAPS.test(title)) return null;
      return { title, next: j };
    }
    return null;
  }

  // Nadpisy aktivit.
  const HEAD = opts.caps ? { test: () => false } : opts.numbered ? HEAD_NUM : HEAD_ACT;
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const s = lines[i].txt;
    if (FA(s)) continue;
    let key, nazev;
    if (opts.caps) {
      const h = capsHead(i);
      if (!h) continue;
      if (blocks.length) blocks[blocks.length - 1].end = i;
      blocks.push({ k: String(blocks.length + 1), nazev: h.title, page: lines[i].page,
        from: h.next, end: lines.length });
      continue;
    }
    const m = s.match(HEAD);
    if (!m) continue;
    key = opts.numbered ? m[1] : m[1] + m[2];
    nazev = (opts.numbered ? m[2] : m[3]).trim();
    // Nadpis psaný verzálkami se v PDF často láme na dva řádky.
    let tail = i;
    if (!LOWER.test(nazev)) {
      while (tail + 1 < lines.length && isCaps(lines[tail + 1].txt)) {
        nazev += ' ' + lines[++tail].txt.trim();
      }
    }
    if (/\.{3,}/.test(nazev)) continue;               // řádek obsahu
    if (opts.numbered && SKIP_NUM.test(nazev)) continue;
    if (blocks.length) blocks[blocks.length - 1].end = i;
    blocks.push({ k: key, nazev, page: lines[i].page, from: tail + 1, end: lines.length });
  }

  /** Hodnota pole uvnitř bloku. */
  function field(block, ...keys) {
    const body = lines.slice(block.from, block.end);
    for (const key of keys) {
      const want = key.toLowerCase();
      for (let i = 0; i < body.length; i++) {
        const f = FA(body[i].txt);
        if (!f || f.label !== want) continue;
        const out = f.inline ? [f.inline] : [];
        for (let j = i + 1; j < body.length; j++) {
          if (FA(body[j].txt)) break;
          if (HEAD.test(body[j].txt)) break;
          if (BACKMATTER.test(body[j].txt)) break;      // tiráž na konci dokumentu
          out.push(body[j].txt);
        }
        const v = out.join('\n').trim().replace(/\n{3,}/g, '\n\n');
        if (v) return v;
      }
    }
    return '';
  }

  /** Text mezi nadpisem a prvním polem — u některých lekcí zastupuje cíl. */
  function intro(block) {
    const out = [];
    for (let i = block.from; i < block.end; i++) {
      if (FA(lines[i].txt) || HEAD.test(lines[i].txt)) break;
      out.push(lines[i].txt);
    }
    return out.join('\n').trim();
  }

  const out = [];
  for (const b of blocks) {
    const o = {
      k: b.k,
      nazev: b.nazev.replace(/[.\s]+$/, '').replace(/\*+$/, '').trim(),
      s: b.page,
      cas: field(b, 'Čas', 'Trvání'),
      cil: field(b, 'Cíle', 'Cíl', 'Cíl aktivity', 'Cíl hry', 'Cíl a smysl') || intro(b),
      vek: field(b, 'Věk'),
      pom: field(b, 'Pomůcky'),
      postup: field(b, 'Postup', 'Popis postupu', 'Popis', 'Průběh', 'Průběh aktivity', 'Instrukce'),
      zdroj: field(b, 'Zdroj', 'Zdroje'),
      varianta: field(b, 'Varianta', 'Varianty', 'Jiná varianta', 'Obměna', 'Variace'),
      pozn: field(b, 'Poznámka', 'Poznámky', 'Doporučení'),
      reflexe: field(b, 'Reflexe', 'Otázky pro reflexi', 'Zhodnocení'),
    };
    if (!o.postup || o.postup.replace(/\s/g, '').length < 120) continue;
    out.push(o);
  }
  return out;
}

if ((process.argv[1] || '').endsWith('odyssea-split.mjs')) {
  const out = parse(process.argv[2], {
    numbered: !!process.env.NUMBERED, whole: !!process.env.WHOLE, caps: !!process.env.CAPS,
  });
  if (process.env.JSON) console.log(JSON.stringify(out));
  else {
    for (const o of out)
      console.log(`[${o.k}] ${o.nazev}  (s.${o.s}) čas:${(o.cas || '—').replace(/\n/g, ' ').slice(0, 22)} věk:${(o.vek || '—').replace(/\n/g, ' ').slice(0, 34)} postup:${o.postup.length}`);
    console.error(`>>> ${out.length} aktivit`);
  }
}
