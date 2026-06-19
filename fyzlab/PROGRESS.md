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
- **F2-C, 2. půlka** — uPlot panel + CSV export:
  závislost `uplot`, `PlotPanel.tsx` s grafem x(t)/y(t)/v(t) a přepínačem
  série, tlačítko „Stáhnout CSV", tlačítko „Sledovat v grafu" v panelu
  vlastností tělesa (dynamická tělesa), drátování výběru tělesa → worker
  recorder + uiStore.plotBodyId, panel se zobrazí vpravo dole při plotBodyId ≠ null.

Stav: **65 testů zelených**, `tsc` čistý.

## Další na řadě
**F2-D — FBD režim (uvolněné těleso, šipky sil v N) + tracer**
- Přidat vrstvu `fbd` do `overlayLayer.ts` nebo novou `fbdLayer.ts`.
- Engine musí reportovat síly na těleso (gravitace, kontaktní, kloubové) —
  nové pole ve WorkerToMain nebo rozšíření SnapshotMsg.
- UI: přepínač „FBD” v TopBar nebo Toolbar, šipky kreslí PixiJS nad tělesy.
- Tracer: tenká stopa pohybu tělesa (z posledních N poloh interpolátoru).

## Kde jsem skončil / poznámky pro další běh
- **F2-C plně dokončena a mergnuta.** Celá datová cesta + UI grafu funguje:
  tlačítko „Sledovat v grafu” v panelu vlastností (jen dynamická tělesa)
  spustí záznam; PlotPanel vpravo dole zobrazuje x(t)/y(t)/v(t) + CSV export.
- Stav kódu: `fyzlab/src/app/PlotPanel.tsx` (nový), `PropertiesPanel.tsx`
  (přidán import useUiStore + BodySection dostává runtime + tracking button),
  `App.tsx` (PlotPanel wired), `i18n/cs.ts` (6 nových klíčů plotPanelTitle…).
- Další běh začíná **F2-D**: FBD + tracer. Viz „Další na řadě”.

## Backlog Fáze 2 (pořadí půlmilníků)
1. ~~F2-C grafy + CSV (recorder → uPlot → CSV)~~ ✓ hotovo
2. F2-D FBD režim (uvolněné těleso, šipky sil v N) + tracer
3. F2-E režim Predikce (lesson schéma + overlay)
4. F2-F hloubka mechaniky: nůž/CSG, lano/řetěz, thruster, ozubení,
   vzájemná gravitace těles, kolizní vrstvy A–J
5. F2-G ~10 kurikulárních scén + LibraryDialog (meta.curriculum)

Po Fázi 2: Fáze 3 (optika), 4 (kapaliny), 5 (release) — viz `docs/PLAN.md`.
