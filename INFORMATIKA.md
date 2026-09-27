# Informatika

Sekce `bekovo.cz/informatika`: banka hotových výukových bloků, aktivit a odkazů
pro informatiku. Na rozdíl od fyziky se nečlení podle ročníků, ale podle
**oblastí** (Bezpečnost, Robotika, …); větší oblasti mají **podoblasti**.
Rutina `/nightly-fill` se jí **nedotýká**.

- `/informatika` — rozcestník oblastí + hledání a filtry napříč vším
- `/informatika/<oblast>` — karty seskupené podle podoblastí, s hledáním
- `/informatika/<oblast>/<položka>` — detail; vzniká **jen** u položek, které
  mají `goal`, `procedure`, `materials`, `files` nebo `notes`. Ostatní karty
  vedou rovnou na `url`.

## Oblasti

Jeden JSON v `src/content/info-categories/`. Pořadí na rozcestníku = `order`.
Podoblasti jsou pole `subcategories` — jejich pořadí je pořadí na stránce.
`accent` je jedna z barev Tailwindu (viz `ACCENTS` v `src/lib/informatika.ts`).

## Jak přidat položku

Jeden JSON do `src/content/info-items/`, název souboru = `id`.

Nejkratší možná karta (jen odkaz):

```json
{
  "id": "programovani-scratch",
  "categoryId": "programovani",
  "subcategoryId": "blokove",
  "title": "Scratch",
  "url": "https://scratch.mit.edu/",
  "type": "aplikace"
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
`pracovni-list`, `aplikace`, `video`, `kurz`, `metodika`, `odkaz`.

**Potřeba** (`equipment`): `bez-pocitace`, `pocitac`, `tablet`, `mobil`,
`robot`, `microbit`, `3d-tiskarna`, `vr`.

Filtry na stránce se ukážou jen tehdy, když v datech opravdu rozlišují.
