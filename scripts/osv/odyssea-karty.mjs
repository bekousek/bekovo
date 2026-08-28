/**
 * Generátor karet aktivit z metodik Projektu Odyssea.
 *
 *   node scripts/osv/odyssea-pdf-na-text.mjs   # PDF → text (jednorázově)
 *   ODY=<adresář s texty> node scripts/osv/odyssea-karty.mjs
 *
 * Spouští se z kořene repozitáře. Smaže všechny existující karty s id
 * `*-ody*` a vygeneruje je znovu, takže je bezpečné ho pouštět opakovaně.
 * Podrobnosti o parsování a o tom, co se vyřazuje, jsou v OSV.md.
 */
import { writeFileSync, readdirSync, unlinkSync } from 'node:fs';
import { parse } from './odyssea-split.mjs';

const DIR = process.env.ODY || `${process.env.S}/ody`;
const B = 'https://odyssea.cz/wp-content/uploads/2023/07/';
const O = 'src/content/osv-items';

const OS = 'osobnostni-rozvoj', SO = 'socialni-eticky-rozvoj', TK = 'tridni-kolektiv';

/* Lekce Odyssey — zásobník aktivit ve 4. kapitole. */
const LEKCE = [
  ['Lekce-1-1-Umime-se-soustredit', '1.1', OS,
    ['soustředění', 'pozornost', 'koncentrace'],
    ['Efektivní strategie učení', 'Emoce a jejich zvládání', 'Odolnost a psychohygiena']],
  ['Lekce-1-2-Bystrime-sve-smysly', '1.2', OS,
    ['smysly', 'vnímání', 'pozornost'],
    ['Sebepoznávání a sebepojetí', 'Odolnost a psychohygiena']],
  ['Lekce-1-3-Ucime-se-ucit-se', '1.3', OS,
    ['učení', 'paměť', 'studijní technika'],
    ['Efektivní strategie učení']],
  ['Lekce-2-2-Poznavame-svuj-vztah-k-lidem', '2.2', OS,
    ['vztahy', 'sebepoznání', 'druzí lidé'],
    ['Sebepoznávání a sebepojetí', 'Poznávání a vnímání druhých lidí']],
  ['Lekce-2-3-Ucime-se-v-byt-v-pohode-kazdy-sam-se-sebou', '2.3', OS,
    ['sebepřijetí', 'sebevědomí', 'pohoda'],
    ['Sebepoznávání a sebepojetí', 'Odolnost a psychohygiena']],
  ['Lekce-3-6-Rozvijime-vuli-pohybem', '3.6', OS,
    ['vůle', 'pohyb', 'vytrvalost'],
    ['Sebeorganizace a plánování vlastního rozvoje', 'Odolnost a psychohygiena']],
  ['Lekce-4-2-Ucime-se-uvolnit-a-obnovit-sve-sily', '4.2', OS,
    ['relaxace', 'psychohygiena', 'nálada'],
    ['Odolnost a psychohygiena', 'Emoce a jejich zvládání', 'Zvládání stresu a náročných situací']],
  ['Lekce-5-1-Tvorive-resime-prakticke-situace', '5.1', OS,
    ['tvořivost', 'řešení problémů', 'nápady'],
    ['Kreativita a hledání vlastních řešení']],
  ['Lekce-5-2-Tvorive-resime-mezilidske-situace', '5.2', SO,
    ['tvořivost', 'mezilidské situace', 'řešení'],
    ['Zvládání konfliktů', 'Sociálně-emocionální dovednosti']],
  ['Lekce-7-2-Pecujeme-o-dobre-vztahy', '7.2', SO,
    ['mezilidské vztahy', 'slušné chování'],
    ['Mezilidské vztahy', 'Prosociální chování a pomoc druhým']],
  ['Lekce-8-3-Ucime-se-otevrene-uplatnovat-sve-nazory-potreby-a-prava-Asertivita', '8.3', SO,
    ['asertivita', 'odmítání', 'kritika'],
    ['Komunikace a sociální interakce', 'Zvládání konfliktů']],
  ['Lekce-9-4-Ovladame-umeni-soutezit', '9.4', SO,
    ['soutěž', 'výhra a prohra', 'fair play'],
    ['Spolupráce a kooperace', 'Emoce a jejich zvládání']],
  ['Lekce-10-1-Resime-problemy-a-prijimame-vyzvy', '10.1', SO,
    ['řešení problémů', 'výzva', 'spolupráce', 'důvěra'],
    ['Zvládání konfliktů', 'Spolupráce a kooperace']],
  ['Lekce-11-1-Premyslime-o-hodnotach', '11.1', SO,
    ['hodnoty', 'postoje', 'diskuse'],
    ['Hodnoty, postoje a praktická etika', 'Poznávání a vnímání druhých lidí']],
  ['Lekce-11-3-Pecujeme-o-sebe-i-o-druhe', '11.3', SO,
    ['péče', 'zodpovědnost', 'pomoc'],
    ['Prosociální chování a pomoc druhým', 'Hodnoty, postoje a praktická etika']],
  ['Lekce-11-6-Naplnujeme-vlastni-idealy', '11.6', SO,
    ['ideály', 'angažovanost', 'hodnoty'],
    ['Hodnoty, postoje a praktická etika', 'Prosociální chování a pomoc druhým']],
  ['Lekce-11-7-Rozhodujeme-se-zodpovedne-a-jedname-eticky', '11.7', SO,
    ['etika', 'rozhodování', 'zodpovědnost'],
    ['Hodnoty, postoje a praktická etika', 'Zvládání konfliktů']],
  ['Lekce-6-1-Poznavame-sve-spoluzaky', '6.1', TK,
    ['spolužáci', 'seznamování', 'poznávání'],
    ['Seznamování a adaptace', 'Klima a bezpečí ve třídě']],
  ['Lekce-7-1-Poznavame-urcujeme-a-dodrzujeme-zakladni-pravidla-chovani-ve-tride-a-ve-skole', '7.1', TK,
    ['pravidla', 'třídní dohody', 'chování'],
    ['Pravidla a dohody ve třídě', 'Klima a bezpečí ve třídě']],
];

/* Kurzy Odyssey — programové bloky. */
const KURZY = [
  ['Jak-se-ucit-efektivne.-2.-stupen-ZS', 'Jak se učit efektivně', 'uceni', OS,
    ['učení', 'paměť', 'čtení s porozuměním'],
    ['Efektivní strategie učení', 'Sebeorganizace a plánování vlastního rozvoje'],
    { numbered: true, whole: true }],
  ['Jak-si-zdravym-zpusobem-zlepsit-naladu-a-byt-svezi.-2.-stupen-ZS', 'Jak si zdravým způsobem zlepšit náladu a být svěží', 'nalada', OS,
    ['nálada', 'relaxace', 'svěžest'],
    ['Odolnost a psychohygiena', 'Emoce a jejich zvládání', 'Zvládání stresu a náročných situací'],
    { caps: true, whole: true }],
  ['Jak-se-branit-drogam-a-predchazet-zavislostem.-2.-stupen-ZS', 'Jak se bránit drogám a předcházet závislostem', 'drogy', OS,
    ['závislosti', 'odmítání', 'prevence'],
    ['Odolnost a psychohygiena', 'Zvládání stresu a náročných situací', 'Prevence šikany a rizikového chování'],
    { caps: true, whole: true }],
  ['Jak-zlepsit-vztahy-v-nasi-tride.-2.-stupen-ZS-kurz-prevence-sikany', 'Jak zlepšit vztahy v naší třídě', 'vztahy', TK,
    ['šikana', 'vztahy ve třídě', 'prevence'],
    ['Prevence šikany a rizikového chování', 'Klima a bezpečí ve třídě', 'Role a dynamika skupiny'],
    { caps: true, whole: true }],
];

const PREFIX = { [OS]: 'osobnostni', [SO]: 'socialni', [TK]: 'kolektiv' };

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 46);

/** Organizační bloky kurzu, které nejsou aktivitou do hodiny. */
const NEAKTIVITA = /^(zarámování|uvedení práce|uzavření práce|závěrečn(ý|é) evaluač|nastartování druhého dne|metody práce a pravidla|pravidla$|aktivity na ukončení|shrnutí a nid|poznámka k realizaci|ukončení \d)/i;

/**
 * Z pole „Věk“ odvodí ročníky 2. stupně. Vrací null, když aktivita nesedí.
 * `obdobi` = dokument značí věk vzdělávacími obdobími (1. = 1.–3. roč.,
 * 2. = 4.–5. roč., 3. = 6.–9. roč.), ne ročníky.
 */
function grades(vek, obdobi) {
  if (!vek) return [6, 7, 8, 9];
  const v = vek.replace(/\s+/g, ' ').trim();

  if (/starší školní věk|všechny věkové|bez omezení|není omezen/i.test(v)) return [6, 7, 8, 9];
  if (/mladší školní věk/i.test(v) && !/střední|starší/i.test(v)) return null;
  if (/střední školní věk/i.test(v)) return [6, 7, 8, 9];

  const roky = v.match(/(?:od\s*)?(\d{1,2})\s*\+|od\s*(\d{1,2})\s*(?:let|rok)/i);
  if (roky) {
    const a = Number(roky[1] || roky[2]);
    const gm = a <= 12 ? 6 : Math.min(9, a - 6);
    return [6, 7, 8, 9].filter((g) => g >= gm);
  }

  const nums = [...v.matchAll(/(\d)\s*\./g)].map((m) => Number(m[1]));
  if (!nums.length) return [6, 7, 8, 9];        // slovní údaj → věk zůstává v poznámce

  if (obdobi || /období/i.test(v)) {            // vzdělávací období, ne ročníky
    return nums.includes(3) ? [6, 7, 8, 9] : null;
  }
  const max = Math.max(...nums), min = Math.min(...nums);
  if (max < 6) return null;                     // horní hranice pod šestkou → vynech
  if (/^\s*od\b/i.test(v)) return [6, 7, 8, 9]; // „od 4. třídy“ → pro nás celý 2. stupeň
  return [6, 7, 8, 9].filter((g) => g >= min && g <= Math.max(max, 9));
}

/** Odstraní artefakty po převodu PDF (odrážky ve Wingdings, matematické minus). */
const clean = (s) => s
  .replace(/[\u00be\u0081\u0083\uf0b7]/g, '\u2022')
  .replace(/\u2212/g, '\u2013')
  .replace(/[ \t]+$/gm, '');
const oneLine = (s) => clean(s).replace(/\s+/g, ' ').trim();

/**
 * Text vytažený z PDF má konec řádku po každém řádku sazby. Řádky, které jsou
 * skoro na plnou šířku sloupce, spojíme zpátky do odstavce; kratší řádek nebo
 * začátek odrážky či číslovaného kroku znamená skutečné zalomení.
 */
function reflow(txt) {
  const raw = clean(txt).split('\n');
  const width = Math.max(40, ...raw.map((l) => l.trim().length));
  const out = [];
  for (const line of raw) {
    const l = line.trim();
    if (!l) { if (out.length && out[out.length - 1] !== '') out.push(''); continue; }
    const prev = out.length ? out[out.length - 1] : '';
    const novyBlok = /^([\u2022*]|[-\u2013\u2014]\s|\d{1,2}[.)]\s|[a-z]\)\s)/.test(l);
    if (prev && !novyBlok && prev.length >= width * 0.72) {
      out[out.length - 1] = prev + ' ' + l;
    } else out.push(l);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
const firstSentences = (txt, n = 2) => {
  const s = oneLine(txt).split(/(?<=[.!?])\s+/).slice(0, n).join(' ');
  return s.length > 330 ? s.slice(0, 327).replace(/\s\S*$/, '') + '…' : s;
};
// Zkratky a římské číslice, které v názvu psaném verzálkami musí zůstat velké.
const ZKRATKY = new Set(['SMS', 'FFUK', 'SWAN', 'HU', 'NASA', 'NID', 'OSV', 'CD', 'DVD',
  'TV', 'PC', 'ZŠ', 'SŠ', 'I', 'II', 'III', 'IV', 'VI', 'VII', 'VIII', 'IX', 'X']);

/** Název psaný verzálkami převede na normální psaní; zkratky nechá být. */
const titleCase = (s) => {
  if (/[a-záčďéěíňóřšťúůýž]/.test(s)) return s;
  const out = s.split(/(\s+)/).map((w) => (ZKRATKY.has(w.replace(/[^\p{Lu}]/gu, '')) &&
    w.replace(/[^\p{Lu}]/gu, '').length >= 1 && ZKRATKY.has(w.replace(/\W/g, ''))
    ? w : w.toLowerCase())).join('');
  return out.replace(/\p{Ll}/u, (c) => c.toUpperCase());
};

// Staré karty aktivit smažeme, generujeme je celé znovu.
for (const f of readdirSync(O)) if (/-ody(\d|k)/.test(f)) unlinkSync(`${O}/${f}`);

const seen = new Map();
const report = [];
let total = 0;

function emit(list, meta) {
  const { cat, kw, rvp, id, label, url, file } = meta;
  let made = 0, dupl = 0, vekOut = 0, orgOut = 0;
  const obdobi = list.some((a) => /období/i.test(a.vek || ''));

  for (const a of list) {
    const nazev = titleCase(oneLine(a.nazev).replace(/\.\.\.$/, '…'))
      .replace(/[,:;\s]+$/, '').replace(/(?<!…)\.$/, '');
    if (NEAKTIVITA.test(nazev)) { orgOut++; continue; }
    const key = slug(nazev);
    if (seen.has(key)) { dupl++; continue; }
    const g = grades(a.vek, obdobi);
    if (!g) { vekOut++; continue; }
    seen.set(key, id);

    const card = {
      id: `${PREFIX[cat]}-${id}-${key}`,
      categoryId: cat,
      title: nazev,
      description: a.cil ? firstSentences(a.cil, 3) : firstSentences(a.postup),
      keywords: [...new Set([...kw, ...nazev.toLowerCase()
        .split(/[\s,–—-]+/).filter((w) => w.length > 4)])].slice(0, 8),
      type: /\bhra\b|hry|soutěž|pexeso|honičk/i.test(nazev) ? 'hra'
        : /dotazník|formulář/i.test(nazev) ? 'dotaznik'
        : /pracovní list/i.test(nazev) ? 'pracovni-list' : 'aktivita',
      grades: g,
      rvpAreas: rvp,
      files: [],
      status: 'namet',
      added: '2026-08-28',
    };
    if (a.cas) card.duration = oneLine(a.cas).slice(0, 80);
    if (a.pom && !/^(žádné|žádná|nejsou)\.?$/i.test(a.pom.trim())) {
      card.materials = reflow(a.pom).split('\n').map((x) => x.trim()).filter(Boolean).slice(0, 6);
    }
    let postup = reflow(a.postup);
    if (postup.length > 5000) postup = postup.slice(0, 5000).replace(/\s\S*$/, '') +
      '\n\n… (pokračování v PDF na uvedené straně)';
    card.procedure = postup + (a.varianta ? `\n\nVarianta: ${oneLine(a.varianta)}` : '');
    if (a.reflexe) {
      card.reflection = reflow(a.reflexe).split('\n')
        .map((x) => x.trim()).filter((x) => x.length > 2).slice(0, 8);
      if (!card.reflection.length) delete card.reflection;
    }
    card.source = { label: label(a), url: `${url}#page=${a.s || 1}` };
    if (a.zdroj) {
      const z = oneLine(a.zdroj)
        .split(/\s(?=ISBN)/)[0]
        .split(/\s(?=[A-ZÁ-Ž]{4,}\s[A-ZÁ-Ž]{3,})/)[0]      // název na přebalu knihy
        .slice(0, 240).replace(/\s+\S*$/, '').replace(/[,\s]+$/, '');
      if (z.length > 8) card.source.note = `Zdroj aktivity uvedený v metodice: ${z}`;
    }
    const pozn = [];
    if (a.vek) pozn.push(`Věk uvedený v metodice: ${oneLine(a.vek)}.`);
    if (a.pozn) pozn.push(oneLine(a.pozn));
    if (pozn.length) card.notes = pozn.join(' ').slice(0, 600);

    writeFileSync(`${O}/${card.id}.json`, JSON.stringify(card, null, 2) + '\n');
    made++; total++;
  }
  report.push({ file, made, dupl, vekOut, orgOut, all: list.length });
}

for (const [file, cislo, cat, kw, rvp] of LEKCE) {
  const list = parse(`${DIR}/${file}.txt`);
  emit(list, {
    cat, kw, rvp, file, id: `ody${cislo.replace('.', '')}`,
    url: `${B}${file}.pdf`,
    label: (a) => `Odyssea — Lekce ${cislo}, aktivita ${a.k} (s. ${a.s - 1})`,
  });
}
for (const [file, nazev, zkratka, cat, kw, rvp, opts] of KURZY) {
  const list = parse(`${DIR}/${file}.txt`, opts);
  emit(list, {
    cat, kw, rvp, file, id: `odyk-${zkratka}`,
    url: `${B}${file}.pdf`,
    label: (a) => `Odyssea — kurz ${nazev} (s. ${a.s - 1})`,
  });
}

for (const r of report) {
  console.log(`${r.made.toString().padStart(3)} karet  (z ${r.all}: −${r.orgOut} organizační, −${r.vekOut} věk, −${r.dupl} duplicita)  ${r.file}`);
}
console.log(`\ncelkem ${total} karet aktivit`);
