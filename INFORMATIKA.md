# Informatika

Sekce `bekovo.cz/informatika`: banka hotových výukových bloků, aktivit a odkazů
pro informatiku. Na rozdíl od fyziky se nečlení podle ročníků, ale podle
**oblastí** (Bezpečnost, Robotika, …); větší oblasti mají **podoblasti**.
Rutina `/nightly-fill` se jí **nedotýká**.

- `/informatika` — rozcestník oblastí + hledání a filtry napříč vším
- `/informatika/<oblast>` — karty seskupené podle podoblastí, s hledáním

**Zásada: na web patří jen hotové hodiny a aktivity — konkrétní zadání, co
s dětmi dělat.** Samotná platforma (Scratch, Tinkercad, E-Bezpečí…) kartu
nedostane; kartu dostane až konkrétní aktivita na ní. Stránka, na které se
rovnou dá postavit celá hodina (hra, test, simulace), kartu dostat může.
Sbírky s mnoha aktivitami (UmímeInformatiku, Hour of Code, archiv Bobříka…)
se rozpadají na jednotlivé karty. Učebnice taky: **karta = jedna hodina**
(dvouhodinová kapitola = dvě karty), pracovní listy k té hodině jdou do
`files` té karty. Když stejnou aktivitu nabízí zahraniční sbírka i česká
úprava, kartu dostane česká úprava (Blátov ze Základů informatiky místo
Muddy City z CS Unplugged). Placené zdroje (e-magazín ITčko) se na web
nenahrávají — postup se převypráví vlastními slovy a do `source` jde číslo
a strana; pracovní listy jen tehdy, když jsou volně ke stažení jinde
(DigiKoalice, AI dětem, CodeWeek).

**Jen technika, kterou škola má: micro:bity, VEX, iPady, počítače, 3D tiskárna
a VR brýle z kartonu.** Aktivity, které potřebují jiné roboty nebo robotické
stavebnice (mBot, Ozobot, Cutebot, LEGO Spike/EV3, Arduino…), Minecraft
Education nebo přídavné součástky k micro:bitu (LED pásky, Grove, diody,
bzučáky, serva), na web nepatří. Obyčejné kostky Lego bez elektroniky
a online hry a emulátory, které robota nepotřebují, jsou v pořádku. Materiály v němčině se nepřidávají.

- `/informatika/<oblast>/<položka>` — detail; vzniká **jen** u položek, které
  mají `goal`, `procedure`, `materials`, `files` nebo `notes`. Ostatní karty
  vedou rovnou na `url`.
- `/informatika/serie/<série>` — stránka série (viz níže).

## Série

Když má jeden zdroj víc hodin (pořad s lekcemi — Datová Lhota), nedělá se
karta na každý díl ani jedna souhrnná karta. **Karta = lekce**, každá ve své
oblasti, a všechny nesou `"series": { "id": "datova-lhota", "part": 3 }`
(`part` = doporučené pořadí). Série je jeden JSON v `src/content/info-series/`
a dostane vlastní stránku: úvod, karty v pořadí, **průvodce videi**
(`videoGroups` — všechny díly s odkazem a jednou větou o čem jsou) a soubory
ke všem lekcím najednou (úvod pro učitele, technické popisy).

Průvodce sám dopočítá, ke které lekci video patří: stačí, aby karta měla to
video ve `files` se **stejným `href`** jako v `videoGroups` (typ `video`,
do `note` časy úseků k zastavování). Díly, které žádná lekce nepouští, se
přidají do `files` nejbližší lekce s popiskem „Navíc: …“, ať nic nevisí.
Karty série mají štítek s odkazem na stránku série a na detailu listování
předchozí/další; rozcestník `/informatika` ukáže série pod oblastmi.

## Oblasti

Jeden JSON v `src/content/info-categories/`. Pořadí na rozcestníku = `order`.
Podoblasti jsou pole `subcategories` — jejich pořadí je pořadí na stránce.
`accent` je jedna z barev Tailwindu (viz `ACCENTS` v `src/lib/informatika.ts`).

## Jak přidat položku

Jeden JSON do `src/content/info-items/`, název souboru = `id`.

Nejkratší možná karta (aktivita přímo na webu):

```json
{
  "id": "programovani-raketomise",
  "categoryId": "programovani",
  "subcategoryId": "algoritmizace",
  "title": "Raketomise",
  "url": "https://raketomise.cz/index.php",
  "type": "aktivita"
}
```

Hotový výukový blok — přidej, co dává smysl:

```json
{
  "description": "Jedna věta na kartu.",
  "type": "blok",
  "equipment": ["bez-pocitace"],
  "grades": [6, 7],
  "duration": "45 min",
  "keywords": ["binární", "unplugged"],
  "language": "cs",
  "goal": "Co si žáci odnesou.",
  "materials": ["Kartičky"],
  "procedure": "Odstavce oddělené prázdným řádkem.\n\nDruhý krok…",
  "files": [{ "label": "Pracovní list", "href": "https://drive.google.com/…", "type": "pdf" }],
  "source": { "label": "CS Unplugged", "url": "https://…" },
  "notes": "Moje poznámka po odučení.",
  "added": "2026-09-27"
}
```

**Typy** (`type`): `blok` (hotový výukový blok), `aktivita`, `projekt`, `hra`,
`pracovni-list`, `video`, `kurz`, `metodika`.

**Soubory k tisku** patří do `public/informatika-soubory/` (odkaz
`/informatika-soubory/…`), nebo na Google Drive.

**Potřeba** (`equipment`): `bez-pocitace`, `pocitac`, `tablet`, `mobil`,
`robot`, `microbit`, `3d-tiskarna`, `vr`.

Filtry na stránce se ukážou jen tehdy, když v datech opravdu rozlišují.
