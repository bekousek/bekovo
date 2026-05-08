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

## Picker v2 — rotace přes témata podle data

Skript `scripts/coverage.mjs --pick` vrací `<topicId>--<subtopicId>` podle této logiky:

1. **Den-index** = `floor(today_utc_midnight_ms / 86400000)`
2. Dnešní téma = `topics_sorted[dayIdx % 19]`. Tzn. **každý den jiné téma**, cyklus 19 dní.
3. V rámci dnešního tématu = vyber podkapitolu s nejnižším celkovým počtem položek (pokusy + aktivity + materiály + úkoly).
4. **Vyloučit**:
   - podkapitoly v `.routine/ledger.json:history[]` za posledních 7 dní
   - podkapitoly v `skipUntil` > dnes
   - podkapitoly s otevřenými větvemi `routine/nightly-*--<topicId>--<subtopicId>` na originu (`git ls-remote`)
5. Pokud dnešní téma nemá volnou podkapitolu, posun se na další téma v rotaci.
6. Fallback: globálně nejnižší (ignorovat rotaci, stále respektovat exclude/skip).

Tím je zajištěno: **i když nemerguješ PR z včerejška, dnešek dostane jiné téma → jiná podkapitola.**

## Naming conventions

| Co | Vzor | Příklad |
|---|---|---|
| Subtopic ID (uvnitř JSON `id` pole) | `bare-slug` | `elektromagnet` |
| `topicId` v JSON | `topic-slug` | `elektricke-obvody` |
| Subtopic file | `<topicId>--<subtopicId>.json` | `elektricke-obvody--elektromagnet.json` |
| Item file (pokus/aktivita/materiál/úkol) | `<topicId>-<descriptive>.json` (nebo zkrácený topic prefix) | `elektrina-citronovy-clanek.json` |
| Item `id` pole | `<topicId>-<descriptive>` | `elektrina-citronovy-clanek` |

**Před zápisem nového souboru se vždy podívej na 3–5 existujících peerů** v cílové kolekci pro stejné téma, aby naming i styl seděl.

## Banka zdrojů — PRIMÁRNÍ ZDROJ

Soubor [banka_zdroju_fyzika.md](banka_zdroju_fyzika.md) v rootu repa obsahuje **51 ručně kurátorovaných zdrojů** roztříděných do kategorií A–H. **Při každém běhu rutiny ji načti a hledej PRIMÁRNĚ v ní**, protože uživatel má tyto zdroje vyzkoušené a důvěřuje jim.

Postup:
1. Načti `banka_zdroju_fyzika.md`.
2. Identifikuj kategorie relevantní pro aktuální podkapitolu (např. pro „cívky a kondenzátory" jsou klíčové A: sbírky pokusů + B: applety + F: energetika).
3. Z 🎯 označených zdrojů začni — to jsou primární doporučení.
4. Zdroje v bance používej jako site-restricted vyhledávání (`site:vnuf.cz <téma>`, `site:phet.colorado.edu/cs/ <téma>`).
5. Ven z banky jdi jen tehdy, když banka pro toto téma nemá nic. I tak preferuj cs/sk zdroje.

Banka je živá — uživatel ji občas doplňuje. Vždy ji čti znovu, žádné cachování seznamu.

## Quality gate — variabilní počet položek per noc

**Žádné fixní cíle "2 pokusy + 2 aktivity ..."**. Místo toho:

- Pro vybranou podkapitolu projdi banku zdrojů a najdi vše, co se týká tématu.
- Pro každý nalezený kandidát rozhodni: **„Je toto vhodné pro 6.–9. třídu ZŠ?"**
- Kritéria ZŠ-vhodnosti:
  - jazyk česky/slovensky (nebo přeložitelný kontext, např. PhET applet)
  - bezpečné pomůcky (žádný kapalný dusík bez dohledu, žádné vysoké napětí)
  - matematická úroveň přiměřená gradu tématu
  - srozumitelný postup, žák musí pochopit, **co** dělá a **proč**
  - dostupnost pomůcek (nebo levná náhrada)
- Pokud je vhodné → přidej. Pokud ne → skip a hledej dál.
- **Nepřemýšlej kolik to bude celkem.** Některé podkapitoly (optika, energie) přijmou 15+ položek za noc, jiné (astronomie, mikrosvět) sotva 2–3 — to je v pořádku.
- Strop pro anti-runaway: **max 25 položek**, max 15 web search dotazů, max 20 fetchů. Když se těchto stropů dotkneš, zastav synthesis a commit co máš.
- Když po průchodu banky najdeš < 2 vhodné položky, exit clean s ledger entry `no-research-found` a `skipUntil = today + 30d`. Žádný PR.

## Source-label konvence (kanonická tabulka)

Když je zdroj český sborník (PDF v `public/sborniky/`), **použij přesně tento label**, ať se časem dají agregovat. Tabulka pochází z [scripts/_populate-sources.mjs](scripts/_populate-sources.mjs):

| Vzor v textu zdroje | `label` | `pdf` (pokud znáš) |
|---|---|---|
| `Dílny Heuréky YYYY` | `Dílny Heuréky YYYY` | `dilny-heureky-YYYY.pdf` |
| `Sborník dílen Elixíru YYYY` | `Sborník dílen Elixíru YYYY` | `sbornik-dilen-elixiru-YYYY.pdf` |
| `Elixír nápadů N` (1–5) | `Elixír nápadů N` | `elixir-napadu-N.pdf` |
| `VNUF YYYY` | `VNUF YYYY` | `vnuf-YYYY.pdf` |
| `VNUF` (bez roku) | `VNUF` | (vynechat) |
| `Paper Science` | `Paper Science` | `paper-science.pdf` |

PDF soubory sborníků žijí v `public/sborniky/` (gitignored). Nikdy neimportuj nové PDF — používej jen existující labely výše, **nebo** uveď online zdroj přes `source.url`. **Pro každou položku musí být `source.url` NEBO `source.pdf` ověřitelný.** Žádná fabrikace.

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

Jediné, co rutina edituje: JSON soubory v `src/content/{experiments,activities,materials,homework}/` a `.routine/ledger.json`.

## Slash commands

Rutina má dvě fáze:

- **`/nightly-fill`** — běží v cloud routině každou noc. Plní obsah, validuje build, vytvoří lokální commit v cloud workspace, vyplivne **paste-publish manifest** jako svou finální zprávu. Detail: [.claude/commands/nightly-fill.md](.claude/commands/nightly-fill.md).

- **`/nightly-publish`** — uživatel pasteuje manifest do **lokální** Claude Code session (kde je gh + git auth). Slash command vytvoří větev, soubory, commit, push, otevře draft PR. Detail: [.claude/commands/nightly-publish.md](.claude/commands/nightly-publish.md).

**Proč tento split?** Cloud routine env (CCR) nemá write přístup k git remote — nemůže `git push` ani `gh pr create`. Lokální Claude Code v repu má všechno auth. Cloud dělá research + synthesis + validate, lokál dělá publish.

## Validace

Před vytvořením manifestu **vždy spusť `npm run build`** v cloud workspace — Astro/Zod ověří všechny nové JSON. Build musí projít. Pokud selže, lokalizuj soubor (chybová hláška uvádí cestu), oprav nebo smaž, znovu build. Nikdy nevypisuj manifest, který by lokál nemohl bezpečně mergnout.
