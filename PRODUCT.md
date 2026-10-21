# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Jediný uživatel: autor webu, učitel fyziky na ZŠ (6.–9. třída). Web používá v podobné míře na telefonu i na PC, ve třech situacích:

- **Příprava hodiny.** Doma nebo v kabinetu vybírá, co v hodině udělá, a chystá pomůcky.
- **Přímo v hodině.** Má telefon v ruce při pokusu, nebo pouští applet či video na projektor.
- **Hledání napříč tématy.** Například „co udělat s balónkem" nebo „všechny PhET applety pro 7. třídu".

Žáci ani kolegové web nepoužívají (potvrzeno 2026-10-20).

## Product Purpose

Osobní banka výukového obsahu z fyziky, uspořádaná podle osnovy: 19 témat a 88 podkapitol. Ke každé podkapitole patří:

- zápis do sešitu (LaTeX → SVG/PDF);
- příprava na hodinu;
- generátor příkladů;
- pokusy, aktivity, materiály (applety, videa, pracovní listy, odkazy) a domácí úkoly.

Úspěch znamená, že učitel na telefonu i na PC rychle najde, vybere a použije to, co v hodině potřebuje.

## Positioning

Obsah kurátoruje jeden učitel pro vlastní výuku. Primárním zdrojem je ručně vybraná banka zdrojů (`banka_zdroju_fyzika.md`). Noční rutina obsah průběžně doplňuje do JSON souborů.

## Operating Context

- Česká ZŠ a RVP.
- Zápisy do sešitu, které žáci vidí, mají vlastní tiskovou paletu: `zfblue #2A6DAB`, `zfred #B54530`, `zfgreen #2A8A4C`, `zfpurple #6A3AA0`.
- Ročníky mají na webu barvy: 6 zelená, 7 modrá, 8 jantarová, 9 červená.

## Capabilities and Constraints

- **Stack:** Astro 6 se statickým výstupem, nasazení přes Cloudflare (static assets), Tailwind v4, React ostrůvky jen tam, kde je to nutné.
- **CSP:** `font-src 'self'`, žádné externí obrázky ani iframy kromě Google Docs (zatím v režimu report-only).
- **Obsah:** 2 414 položek (733 pokusů, 272 aktivit, 1 277 materiálů, 132 úkolů). Položky nemají ročník, délku trvání ani obtížnost; ročník plyne z tématu.
  - Žákovský × demonstrační pokus je jen ve volném textu popisu.
  - Pomůcky jsou volný text.
  - Zdroje typu `source.pdf` (sborníky) nejsou nasazené, takže se nedají otevřít.
- **Co spravuje noční rutina:** JSON v `src/content/{experiments,activities,materials,homework}`. Sekce OSV a Informatika jsou kurátorované ručně. Seznam věcí, na které se nesahá, je v `AGENTS.md`.

## Evidence on Hand

Skutečný obsah v `src/content/`. Žádné reference, zákazníci ani statistiky; nic takového se nesmí vymýšlet.

## Product Principles

- Telefon a PC jsou rovnocenné. Nic důležitého nesmí být jen v jednom z nich.
- Rychlost použití je důležitější než výklad: učitel ví, co hledá.
- Zobrazovat jen pravdu z dat. Co data neříkají, se označí jako „neuvedeno", nehádá se.
- Zápis do sešitu (LaTeX) je samostatný kanál a přehledy na něj nesahají.
