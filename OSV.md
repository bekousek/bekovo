# OSV — Osobnostní a sociální výchova

Sekce `bekovo.cz/osv`: banka aktivit, plánů hodin a námětů pro OSV a třídnické
hodiny. Je oddělená od fyzikální části webu (jiné kolekce, jiné routy) a
rutina `/nightly-fill` se jí **nedotýká**.

## Ukotvení v RVP

Revidovaný RVP ZV (schválen 2025; dobrovolná implementace od září 2025 v 1. a
6. ročníku, povinně od 2027/28) mění postavení OSV zásadně: **OSV už není
průřezové téma, ale plnohodnotný vzdělávací obor** ve vzdělávací oblasti
**Člověk, jeho osobnost a svět práce** (vedle oboru Polytechnická výchova a
praktické činnosti). Má povinné očekávané výsledky učení na úrovni 5. a
9. ročníku a v synergii s ním působí průřezové téma **Péče o sebe**.

Obsah oboru je rozdělen do **tří tematických okruhů** — a ty jsou 1:1 první tři
kategorie této sekce:

| Okruh RVP | Kategorie na webu | Čím se zabývá |
|---|---|---|
| Osobnostní rozvoj | `osobnostni-rozvoj` | sebepojetí, sebepoznávání, zvládání stresu a náročných situací, efektivní strategie učení, sebeorganizace a plánování vlastního rozvoje |
| Sociální a etický rozvoj | `socialni-eticky-rozvoj` | sociálně-emocionální dovednosti, vnímání druhých lidí, komunikace a sociální interakce, mezilidské vztahy, prosociální a etické chování |
| Kariérový rozvoj | `karierovy-rozvoj` | objevování, rozhodování a plánování ve vlastním kariérovém směřování, hodnoty a příležitosti spojené se světem práce |

Čtvrtá kategorie **Rozvoj třídního kolektivu** (`tridni-kolektiv`) **není okruh
RVP**. Je to provozní vrstva třídnických hodin — obsahově stojí na okruhu
Sociální a etický rozvoj a na průřezovém tématu Péče o sebe.

Zdroje: [Revize RVP — OSV](https://prohlednout.rvp.cz/zakladni-vzdelavani/vzdelavaci-oblasti/csp/osv) ·
[Člověk, jeho osobnost a svět práce](https://prohlednout.rvp.cz/zakladni-vzdelavani/vzdelavaci-oblasti/csp) ·
[NPI: OSV na 2. stupni ZŠ v novém RVP (PDF)](https://revize.rvp.cz/files/osobnostni-a-socialni-vychova.pdf)

## Pravidlo pro rozřazování

1. Je hlavním tématem **žák sám** (jeho emoce, učení, odolnost, sebepoznání)?
   → **Osobnostní rozvoj**
2. Je to o **budoucnosti, silných stránkách ve vztahu k práci, volbě cesty**?
   → **Kariérový rozvoj**
3. Pracuje to s **touto konkrétní třídou** — jejími pravidly, rolemi, konflikty,
   klimatem, společnými zážitky? → **Rozvoj třídního kolektivu**
4. Všechno ostatní sociální a etické → **Sociální a etický rozvoj**

**Při pochybnostech mezi „sociální" a „třídní" vyhrává vždy Sociální a etický
rozvoj.** Do Třídního kolektivu jde jen to, co je bez konkrétní třídy
nepoužitelné.

## Jak přidat položku

Jeden JSON soubor do `src/content/osv-items/`. Pojmenování:
`<prefix>-<slug>.json`, kde prefix je `osobnostni` / `socialni` / `karierovy` /
`kolektiv`, a pole `id` se rovná názvu souboru bez přípony.

```json
{
  "id": "kolektiv-pavucina-pravidel",
  "categoryId": "tridni-kolektiv",
  "title": "Pavučina pravidel",
  "description": "Stručný popis, 1–3 věty. Zobrazí se na kartě.",
  "keywords": ["pravidla", "začátek roku", "dohoda"],
  "type": "aktivita",
  "duration": "45 min",
  "grades": [6],
  "goal": "Co si žáci odnesou.",
  "materials": ["Klubko provázku"],
  "procedure": "Odstavce oddělené prázdným řádkem.\n\nDruhý krok…",
  "reflection": ["Otázka do reflexe?"],
  "rvpAreas": ["Pravidla a dohody ve třídě"],
  "source": { "label": "Odkud to je", "url": "https://…", "note": "nepovinná poznámka" },
  "files": [
    { "label": "Pracovní list", "href": "/osv-soubory/pravidla.pdf", "type": "pdf" }
  ],
  "status": "namet",
  "notes": "Moje poznámka po odučení.",
  "added": "2026-08-22"
}
```

Povinná jsou jen `id`, `categoryId`, `title`, `description`, `type`. Všechno
ostatní je nepovinné — karta se přizpůsobí tomu, co je vyplněné.

| Pole | Hodnoty |
|---|---|
| `type` | `aktivita`, `hra`, `plan-hodiny`, `metodika`, `pracovni-list`, `video`, `clanek`, `dotaznik`, `namet`, `jine` |
| `status` | `namet` (výchozí), `pripraveno`, `odzkouseno` |
| `files[].type` | `pdf`, `doc`, `slides`, `sheet`, `image`, `audio`, `video`, `other` |
| `files[].href` | absolutní `https://…` (Drive) **nebo** cesta `/osv-soubory/…` |
| `rvpAreas` | jen hodnoty z číselníku `rvpAreas` mateřské kategorie |

Kanonické schéma je vždy v [`src/content.config.ts`](src/content.config.ts) —
před zápisem ho načti, Zod build shodí na každou odchylku.

## Soubory

Vlastní PDF/obrázky patří do `public/osv-soubory/` a odkazují se cestou
`/osv-soubory/nazev.pdf`. Adresář **není** gitignorovaný, takže se soubory
nasadí spolu s webem — nepatří sem nic neveřejného. Pro velké soubory je lepší
odkaz na Google Drive.

## Struktura kódu

| Cesta | Co to je |
|---|---|
| `src/content/osv-categories/*.json` | 4 kategorie — název, popis, ukotvení v RVP, číselník podoblastí |
| `src/content/osv-items/*.json` | jednotlivé karty |
| `src/lib/osv.ts` | popisky, barevné akcenty, normalizace pro hledání, načítání kolekcí |
| `src/components/osv/OsvItemCard.astro` | karta v přehledu |
| `src/components/osv/OsvFilterBar.astro` | hledání + filtry (bez frameworku, vanilla JS) |
| `src/pages/osv/index.astro` | rozcestník + hledání napříč kategoriemi |
| `src/pages/osv/[category]/index.astro` | přehled kategorie |
| `src/pages/osv/[category]/[item].astro` | detail položky |

Hledání běží v prohlížeči nad `data-search` atributem, který se plní při buildu
(`searchIndex()` v `src/lib/osv.ts`). Text je bez diakritiky a malými písmeny,
takže „socialni" najde „sociální". **Když se změní `normalize()` v `osv.ts`,
musí se stejně změnit i kopie uvnitř `OsvFilterBar.astro`.**

## Ukázkové karty

Čtyři položky s `notes` začínající „Ukázková karta" jsou jen demo, aby nebyly
kategorie prázdné. Klidně je smaž.

## Odyssea — jak vznikly karty aktivit

Metodiky Projektu Odyssea (39 PDF z `odyssea.cz/metodiky/lekce-a-kurzy/`) mají
uvnitř zásobníky konkrétních aktivit. Karty z nich nejsou psané ručně — text se
vytahuje přímo z PDF, aby na kartě nebylo nic vymyšleného.

Skripty jsou pracovní, žijí mimo repozitář (`/tmp/split.mjs` parser,
`/tmp/gen2.mjs` generátor). Když je bude potřeba spustit znovu, musí se PDF
nejdřív stáhnout a převést na text (pdfjs-dist, značky `===== STRANA N =====`).

**Co parser musí zvládnout**, protože sazba se mezi metodikami liší:

| Rozdíl | Varianty v korpusu |
|---|---|
| nadpis aktivity | `A1 Název`, `A 1 Název`, `A.1 Název`, `2.4 NÁZEV`, holý `NÁZEV` verzálkami |
| název pole | `Postup`, `Postup:`, `Postup: hodnota`, `Věk 10 +` (bez dvojtečky) |
| název postupu | `Postup`, `Popis postupu`, `Popis`, `Průběh` |
| víceřádkový nadpis | verzálky zalomené přes dva řádky se spojují |

Režim se pozná z dokumentu: pole bez dvojtečky se povolí, teprve když se
v textu najdou aspoň tři jednoznačné výskyty (`Čas 45 min`, `Věk 10 +`).

**Co se z karet vyřazuje:**

- aktivita bez rozepsaného postupu (pod 120 znaků) — v metodice je jen odkaz
  na cizí knihu, karta by nebyla k ničemu (např. 11.7 „Krokodýlí řeka“);
- aktivita, jejíž pole `Věk` končí pod 6. ročníkem. Lekce 1.2 a 11.3 značí věk
  **vzdělávacími obdobími** (1. = 1.–3. roč., 2. = 4.–5. roč., 3. = 6.–9. roč.),
  ne ročníky — bere se jen to, co má „3. období“;
- organizační bloky kurzů (zarámování dne, evaluační dotazník, práce
  s hodnotícími archy);
- duplicity — kurzy přebírají aktivity z lekcí, drží se první výskyt.

**Odkaz vede přímo na stránku aktivity** (`…pdf#page=N`). Tištěné číslo strany
je v celé řadě o jedna nižší než stránka PDF; popisek zdroje uvádí tištěné,
odkaz stránku PDF.

**Kde se dělit nedá** (a proč zůstává jen karta celé metodiky):

- 2.1 a 3.3 — popisy aktivit jsou v PDF obrázky, textová vrstva má jen nadpis
  a `Zdroj`; totéž platí pro většinu aktivit v 2.2;
- 4.4, 8.4, 8.5, 8.10 — nemají zásobník aktivit, obsah je souvislý
  „Doporučený postup“ k celému tématu;
- 11.2 a 3.2 — koncepty lekce, jen „Tipy na aktivity“ v bodech;
- Čítanka, Úvodní kapitoly, Zdravotnický kurz — teorie;
- materiály pro 1. stupeň a mateřské školy.
