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

Stav: **59 testů zelených**, `tsc` čistý (k poslednímu lokálnímu běhu).

## Další na řadě
**F2-C, 1. půlka — Recorder + datová cesta pro grafy (BEZ UI grafu).**
- Engine: lehký recorder, který za běhu vzorkuje veličiny vybraného tělesa
  (poloha, rychlost, příp. energie) s decimací ~10 Hz (nezávisle na 120 Hz
  ticku). Žije headless v `src/engine/` (např. `instruments/Recorder.ts` nebo
  `core/`), determinismus zachován.
- Worker: přírůstková zpráva `plotChunk` v protokolu; `SimWorkerClient` ji
  předá callbackem; uiStore drží buffer vzorků. Reset/load scény buffer mažou.
- Test: vzorky volného pádu / SHM sedí na analytiku (tolerance jako u
  accuracy testů). **Zatím žádný uPlot, žádné UI** — jen datová cesta + test.
- Checkpoint, zelené, merge. Do „Kde jsem skončil“ napiš stav datové cesty.

**F2-C, 2. půlka** (až bude datová cesta hotová) = uPlot panel + CSV export.

## Kde jsem skončil / poznámky pro další běh
- (zatím nic — první naplánovaný běh začíná F2-C 1. půlkou)

## Backlog Fáze 2 (pořadí půlmilníků)
1. F2-C grafy + CSV (recorder → uPlot → CSV)
2. F2-D FBD režim (uvolněné těleso, šipky sil v N) + tracer
3. F2-E režim Predikce (lesson schéma + overlay)
4. F2-F hloubka mechaniky: nůž/CSG, lano/řetěz, thruster, ozubení,
   vzájemná gravitace těles, kolizní vrstvy A–J
5. F2-G ~10 kurikulárních scén + LibraryDialog (meta.curriculum)

Po Fázi 2: Fáze 3 (optika), 4 (kapaliny), 5 (release) — viz `docs/PLAN.md`.
