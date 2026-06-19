# FyzLab — průběžný stav (handoff mezi naplánovanými běhy)

Tento soubor je **živá pravda o postupu**. Každý naplánovaný polední běh ho na
**začátku** přečte (zjistí, co je hotové a co je další na řadě) a na **konci**
aktualizuje (co dokončil, kde přesně skončil, co je další půlmilník, nové
poznatky). Kompletní plán: [`docs/PLAN.md`](docs/PLAN.md); architektura a
gotchas: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Pravidla jednoho běhu
- **Rozsah = ~půl milníku.** Radši udělej míň a čistě předej štafetu, než
  abys narazil na limit uprostřed rozdělané práce.
- **Headless pravidlo:** `src/engine/` neimportuje DOM/Pixi/React (běží ve
  workeru i ve vitestu). Závislosti jen `app → editor → render → engine`.
- **Hotovo = zelené:** `npm run typecheck` i `npm test` musí projít. Bez
  zeleného stavu se NEMERGUJE do main.
- **Na konci běhu:** aktualizuj tento soubor (přesuň hotové do „Hotovo“,
  napiš další půlmilník a „Kde jsem skončil“), uprav `docs/ARCHITECTURE.md`
  při změně kontraktu, a hotový zelený kus mergeuj do `main`.
- **Mimo rozsah:** nesahej na noční obsahovou rutinu ani mimo `fyzlab/**`
  (viz `AGENTS.md` v kořeni). Cloudflare projekt a test na tabletu jsou
  ruční kroky uživatele — jen je připomeň, nedělej je.

## Hotovo
- **Fáze 0** — chodící kostra (engine + worker + render + drag + CI).
- **Fáze 1 (A–I)** — editor + perzistence: tvary, výběr/transformace, klouby
  (osa s motorem, pružina, fixace), panel vlastností + presety materiálů,
  radiální menu, `.fyzlab` soubor + URL `#s=`, vektory rychlosti, accuracy
  testy (vrh, kyvadlo, nakloněná rovina, SHM, energie, motor).
- **Fáze 2A** — vzduch: vztlak + kvadratický odpor (`src/engine/rigid/air.ts`),
  terminální rychlost ±5 % vč. heliového balónku.
- **Fáze 2B** — přístroje: fotobrána se sub-tick eventy, stopky, GatePanel.
- **F2-C, 1. půlka** — Recorder + datová cesta (BEZ UI grafu):
  `Recorder.ts` (headless, ~10 Hz), `RigidModule.stateOf()`, integrován do
  `InstrumentsModule`, protokol `setRecordBodyId` / `plotChunk`, worker drainuje
  po každé smyčce, `SimWorkerClient.onPlotChunk`, `uiStore.plotBuffer`,
  bootstrap wiring; 6 nových accuracy testů (count, off, freefall y, freefall v,
  SHM vmax, reset).

Stav: **65 testů zelených**, `tsc` čistý.

## Další na řadě
**F2-C, 2. půlka — uPlot panel + CSV export.**
- Přidat závislost `uplot` do `package.json`.
- Nová komponenta `PlotPanel.tsx` (`src/app/`) s uPlot grafem; čte
  `uiStore.plotBuffer`. Linie: x(t), y(t), speed(t) — přepínač.
- Tlačítko „CSV” exportuje aktuální buffer jako `.csv` (stahování).
- Panel se zobrazí, když `uiStore.plotBodyId !== null`; schová se tlačítkem.
- Drátování: klik na těleso (SelectTool nebo Properties panel) →
  `client.setRecordBodyId(id)` + `uiStore.setPlotBodyId(id)`.
- Checkpoint, zelené, merge.

## Kde jsem skončil / poznámky pro další běh
- **F2-C 1. půlka dokončena a mergnuta.** Datová cesta je plně funkční:
  engine vzorkuje vybrané těleso ~10 Hz, worker posílá `plotChunk`, uiStore
  drží `plotBuffer`. Žádné UI grafu zatím neexistuje.
- Další běh začíná **F2-C 2. půlka**: přidat `uplot`, `PlotPanel.tsx`,
  CSV export a drátování výběru tělesa → recorder. Viz „Další na řadě".

## Backlog Fáze 2 (pořadí půlmilníků)
1. F2-C grafy + CSV (recorder → uPlot → CSV)
2. F2-D FBD režim (uvolněné těleso, šipky sil v N) + tracer
3. F2-E režim Predikce (lesson schéma + overlay)
4. F2-F hloubka mechaniky: nůž/CSG, lano/řetěz, thruster, ozubení,
   vzájemná gravitace těles, kolizní vrstvy A–J
5. F2-G ~10 kurikulárních scén + LibraryDialog (meta.curriculum)

Po Fázi 2: Fáze 3 (optika), 4 (kapaliny), 5 (release) — viz `docs/PLAN.md`.
