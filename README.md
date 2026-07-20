# bekovo.cz

Vzdělávací web fyziky pro 6.–9. třídu ZŠ. Astro 6 + Cloudflare Pages. Obsah je
~1000 JSON souborů v `src/content/` (zápisy, pokusy, aktivity, materiály,
úkoly), validovaný Zod schématy v `src/content.config.ts`.

Monorepo obsahuje ještě jednu, zcela nezávislou aplikaci:

- **[fyzlab/](fyzlab/README.md)** — FyzLab, webový 2D fyzikální sandbox
  (náhrada Algodoo). Vlastní `package.json`, CI a Cloudflare projekt
  (`fyzlab.bekovo.cz`); vyvíjí se odděleně od hlavního webu.

## Vývoj

```bash
npm install
npm run dev              # http://localhost:4321
npm run build             # → dist/
npm run validate-formulas # ověří převodní faktory v src/content/formulas/
```

FyzLab má vlastní `npm install`/`npm run dev` uvnitř `fyzlab/` — viz
[fyzlab/README.md](fyzlab/README.md).

## Obsahová automatizace

Hlavní web se noc co noc doplňuje automaticky (cloud rutina najde a zpracuje
zdroje → uloží manifest do Google Drive → lokální naplánovaná úloha ho
zapracuje do `main`). Kompletní popis pipeline, schémat a konvencí je v
**[AGENTS.md](AGENTS.md)** — tam se dívej, pokud potřebuješ pochopit strukturu
obsahu nebo jak funguje noční workflow.

## Struktura

```
src/pages/          statické routy: index, [topic]/, [topic]/[subtopic]/{zapis,priprava,
                     generator,pokusy,aktivity,materialy,ukoly,testy}
src/content/         JSON kolekce (experiments, activities, materials, homework,
                     subtopics, topics, formulas, scenarios) + src/content.config.ts
src/components/      Astro komponenty + React ostrovy (NotebookExport, ExerciseGenerator)
public/              fonty, applety, notebook-svgs/pdfs (generované CI), sborniky/ (PDF, gitignored)
scripts/             viz scripts/README.md
fyzlab/               samostatná aplikace — viz fyzlab/README.md
_process_manifests.cjs + _queue/ + .routine/   noční obsahová pipeline (viz AGENTS.md)
```
