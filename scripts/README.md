# scripts/

Živé skripty (používané buildem, CI, nebo nočním workflow):

- `compile-latex.mjs` — LaTeX zápisy → SVG/PDF. Spouští `.github/workflows/compile-latex.yml` při změně `src/content/subtopics/**`.
- `latex-preamble.tex` — sdílený LaTeX preamble pro `compile-latex.mjs`.
- `copy-sborniky.mjs` — kopíruje PDF sborníky z gitignorované `Externí materiály/` do `public/sborniky/` pro lokální build (`npm run copy-sborniky`).
- `coverage.mjs` — pokrytí obsahu podle podkapitol; `--pick` používá noční rutina `/nightly-fill` (viz AGENTS.md) k výběru dnešní podkapitoly.
- `validate-formulas.mjs` — ověří převodní faktory v `src/content/formulas/*.json` proti známé tabulce (`npm run validate-formulas`; běží v CI, viz AUDIT.md T2).
- `_insert-latex.mjs` — vloží zkompilovaný LaTeX zápis do konkrétní `src/content/subtopics/<id>.json` (ruční nástroj, argumenty: subtopic id + cesta k .tex).
- `_populate-sources.mjs` — zdroj pravdy pro `source.label`/`source.pdf` konvenci dokumentovanou v AGENTS.md.
- `ai-pipeline/` — nástroje pro AI-asistovaný přepis ručně psaných příprav (extrakce PDF apod.).

`archive/` — jednorázové skripty, které bulk-naplnily obsah jednotlivých témat na jaře 2026 (`_batch-<topic>.mjs`). Obsah, který vytvořily, už je commitnutý v `src/content/`; skripty tu zůstávají jen pro referenci/historii, nespouštět znovu beze změn (přepsaly by ručně upravený obsah).
