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
  série, tlačítko „Stáhnout CSV”, tlačítko „Sledovat v grafu” v panelu
  vlastností tělesa (dynamická tělesa), drátování výběru tělesa → worker
  recorder + uiStore.plotBodyId, panel se zobrazí vpravo dole při plotBodyId ≠ null.
- **F2-D, 1. půlka** — Tracer (stopa pohybu):
  `TracerLayer.ts` (kruhový buffer 300 poloh/těleso, 3 pásma průhlednosti),
  integrován do `Renderer.ts` (vrstva nad přístroji, pod vektory),
  `uiStore.tracerEnabled`, přepínač 〰 v TopBar, maže se při načtení scény.
- **F2-D, 2. půlka** — FBD silový diagram:
  `engine/rigid/fbd.ts` (typy `FbdForce`/`FbdSample`, `FBD_EVERY`),
  RigidModule sbírá síly (gravitace m·g, vztlak, odpor, pružina) ~10 Hz,
  worker protokol `setFbdBodyId` / `fbdSample`, `FbdLayer.ts` (šipky z těžiště,
  normované délky), `FbdPanel.tsx` (legenda magnitud v N), tlačítko „Diagram sil”
  v panelu vlastností (dynamická tělesa); 5 nových accuracy testů.

Stav: **70 testů zelených**, `tsc` čistý, `npm run build` projde.

## Další na řadě
**F2-E — režim Predikce (lesson schéma + overlay)**
- Schéma „lekce” v dokumentu scény (nové pole `lesson?` v SceneDoc, Zod +
  migrace + fixtura) NEBO oddělené `.fyzlabled` schéma — rozhodnout.
- Overlay s otázkou + možnostmi (kam dopadne / jaká rychlost / nakresli graf),
  vyhodnocení proti simulaci, zpětná vazba.
- Začít MALÝM krokem: jen datové schéma lekce + jeho parsování a 1 fixtura,
  bez UI. Druhá půlka = overlay + vyhodnocení.

## Kde jsem skončil / poznámky pro další běh
- **Celá F2-D hotová a mergnutá** (tracer + FBD). FBD: tlačítko „Diagram sil”
  v panelu vlastností dynamického tělesa zapne silové šipky (kreslené z těžiště)
  + legendu vpravo dole s magnitudami. Síly: tíhová, vztlak, odpor vzduchu,
  pružina. KONTAKTNÍ/NORMÁLOVÁ síla zatím NENÍ (vyžaduje Rapier contact eventy —
  kandidát na pozdější vylepšení; pro vrh/kyvadlo/SHM/volný pád je ale diagram
  úplný).
- Architektura FBD zdokumentována v `docs/ARCHITECTURE.md` (sekce „FBD”).
- Další běh = **F2-E Predikce**. Doporučení: nejdřív jen schéma lekce + parser +
  fixtura (malý zelený krok), UI overlay až druhá půlka.

## Backlog Fáze 2 (pořadí půlmilníků)
1. ~~F2-C grafy + CSV (recorder → uPlot → CSV)~~ ✓ hotovo
2. ~~F2-D Tracer (stopa pohybu)~~ ✓ hotovo
3. ~~F2-D FBD režim (šipky sil v N)~~ ✓ hotovo
3. F2-E režim Predikce (lesson schéma + overlay)
4. F2-F hloubka mechaniky: nůž/CSG, lano/řetěz, thruster, ozubení,
   vzájemná gravitace těles, kolizní vrstvy A–J
5. F2-G ~10 kurikulárních scén + LibraryDialog (meta.curriculum)

Po Fázi 2: Fáze 3 (optika), 4 (kapaliny), 5 (release) — viz `docs/PLAN.md`.
