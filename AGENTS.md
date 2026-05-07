# AGENTS.md — kontext pro AI rutiny

Tento soubor čte rutina `/nightly-fill` na začátku každého nočního běhu, aby si nemusela odvozovat strukturu projektu znovu.

## Co je tento projekt

**bekovo.cz** — vzdělávací web fyziky pro 6.–9. třídu ZŠ. Astro 6 + Cloudflare Pages. Obsah jsou JSON soubory v `src/content/`, validované Zod schématy v `src/content.config.ts`.

Struktura: 19 témat × 87 podkapitol. Každá podkapitola má sekce:
- **zápis** (LaTeX → SVG/PDF, automaticky kompilováno) — **NESAHAT**
- **pokusy** (`src/content/experiments/`)
- **aktivity** (`src/content/activities/`)
- **materiály** (`src/content/materials/`)
- **úkoly** (`src/content/homework/`)

## Schémata (zkrácený výtah z `src/content.config.ts`)

```ts
// experiments
{ id, subtopicId, topicId, title, type: 'qualitative'|'measurement',
  description, materials?: string[], procedure?, driveFileUrl?: url, source? }

// activities
{ id, subtopicId, topicId, title, type: 'game'|'method'|'group-work'|'other',
  description, driveFileUrl?: url, source? }

// materials
{ id, subtopicId, topicId, title, url, type: 'worksheet'|'video'|'applet'|'link'|'other',
  description? }

// homework
{ id, subtopicId, topicId, title, description, driveFileUrl?: url, source? }

// source (společný)
{ label: string, url?: url, pdf?: string }
```

**Kanonickou definici vždy znovu načti z `src/content.config.ts` před zápisem** — schéma se může vyvíjet.

## Naming conventions

| Co | Vzor | Příklad |
|---|---|---|
| Subtopic ID (uvnitř JSON `id` pole) | `bare-slug` | `elektromagnet` |
| `topicId` v JSON | `topic-slug` | `elektricke-obvody` |
| Subtopic file | `<topicId>--<subtopicId>.json` | `elektricke-obvody--elektromagnet.json` |
| Item file (pokus/aktivita/materiál/úkol) | `<topicId>-<descriptive>.json` (nebo zkrácený topic prefix) | `elektrina-citronovy-clanek.json` |
| Item `id` pole | `<topicId>-<descriptive>` | `elektrina-citronovy-clanek` |

**Před zápisem nového souboru se vždy podívej na 3–5 existujících peerů** v cílové kolekci pro stejné téma, aby naming i styl seděl.

## Source-label konvence (kanonická tabulka)

Když je zdroj český sborník, **použij přesně tento label**, ať se časem dají agregovat. Tabulka pochází z [scripts/_populate-sources.mjs](scripts/_populate-sources.mjs):

| Vzor v textu zdroje | `label` | `pdf` (pokud znáš) |
|---|---|---|
| `Dílny Heuréky YYYY` | `Dílny Heuréky YYYY` | `dilny-heureky-YYYY.pdf` |
| `Sborník dílen Elixíru YYYY` | `Sborník dílen Elixíru YYYY` | `sbornik-dilen-elixiru-YYYY.pdf` |
| `Elixír nápadů N` (1–5) | `Elixír nápadů N` | `elixir-napadu-N.pdf` |
| `VNUF YYYY` | `VNUF YYYY` | `vnuf-YYYY.pdf` |
| `VNUF` (bez roku) | `VNUF` | (vynechat) |
| `Paper Science` | `Paper Science` | `paper-science.pdf` |

PDF soubory sborníků žijí v `public/sborniky/` (gitignored — nesází se do git, ale jsou na deployu). Nikdy neimportuj nové PDF — používej jen existující labely výše, **nebo** uveď online zdroj přes `source.url`.

## Preferované české vzdělávací zdroje (priorita pro web research)

1. **heureka.fjfi.cvut.cz** — Heuréka projekt MFF UK (sborníky Dílny Heuréky)
2. **dilnyheureky.cz** — workshopy a materiály
3. **fyzweb.cz** — interaktivní fyzika
4. **fyzikalniulohy.cz** — sbírka úloh
5. **phet.colorado.edu/cs/** — interaktivní simulace (česká lokalizace)
6. **edu.ceskatelevize.cz** — videa ČT EDU
7. **cs.khanacademy.org** — Khan Academy česky
8. **npmk.cz** — Pedagogická knihovna
9. YouTube: Vědátor, Štefan, Matematika s panem H — **jen konkrétní video URL**, nikdy obecný kanál

Anglické zdroje jen jako fallback pro applety: phet.colorado.edu, oPhysics, GeoGebra.

## Do-not-touch list

Tyto cesty rutina **nikdy nemodifikuje**:

- `src/content/subtopics/**` (LaTeX zápisy + metadata podkapitol)
- `src/content/topics/**` (struktura témat)
- `src/content/formulas/**`, `src/content/scenarios/**` (generátor příkladů)
- `public/notebook-svgs/**`, `public/notebook-pdfs/**` (auto-generated)
- `public/sborniky/**` (PDF sborníků)
- `scripts/latex-preamble.tex`, `scripts/compile-latex.mjs`
- `.github/workflows/**`
- `wrangler.jsonc`, `astro.config.mjs`, `package.json`, `tsconfig.json`

Jediné, co rutina edituje, jsou JSON soubory v: `src/content/experiments/`, `src/content/activities/`, `src/content/materials/`, `src/content/homework/`. A vlastní artefakty: `.routine/ledger.json`.

## Slash command

Plná logika běhu: [.claude/commands/nightly-fill.md](.claude/commands/nightly-fill.md).

## Validace

Před commitem **vždy spusť `npm run build`** — Astro/Zod ověří všechny nové JSON. Build musí projít. Pokud selže, lokalizuj soubor (chybová hláška uvádí cestu), oprav nebo smaž, znovu build. Nikdy nekomituj rozbitý stav.
