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
- **F2-E, 1. půlka** — schéma lekce + fixtura:
  `engine/scene/lesson.ts` (Zod schéma `LessonSchema` se dvěma typy předpovědi:
  `numeric` s `targetBodyId`/`quantity`/`tolerance`/`unit` a `choice` s
  `choices[]`/`correctId`; volitelné `hint` + `level`),
  `schema.ts` rozšíren o volitelné `lesson?` v `SceneDoc` (zpětně kompatibilní),
  `tests/lesson.test.ts` (15 testů), zmrazená fixtura `lesson-projectile-v1.json`
  (šikmý vrh 45 °, 10 m/s, `landing-x` numerická předpověď).

Stav: **85 testů zelených**, `tsc` čistý, `npm run build` projde.

## Další na řadě
**F2-E, 2. půlka — overlay + vyhodnocení predikce**
- React komponenta `PredictionOverlay.tsx`: zobrazí se při načtení scény s lekcí
  (pokud `doc.lesson !== undefined`) a simulace je v pauze na začátku.
- Numerická predikce: textové pole pro zadání čísla + jednotka; tlačítko Potvrdit.
- Choice predikce: tlačítka s možnostmi.
- Po potvrzení se scéna spustí; engine sleduje veličinu `quantity` na tělesu
  `targetBodyId` (přes Recorder nebo nový mini-modul) a po splnění podmínky
  (těleso dosáhne podlahy / klidu) vyhodnotí výsledek.
- Zpětná vazba: toast/panel „Správně / Zkus znovu” s rozdílem od správné hodnoty.
- Stav overlay v `uiStore` (predictionState: 'waiting' | 'running' | 'done').
- Vyhni se novým worker zprávám, pokud to půjde — Recorder + Fotobrána už dost pokrývá.

## Kde jsem skončil / poznámky pro další běh
- **F2-E 1. půlka hotová a pushnutá na main** (commit `bef7ed3`, 85 testů zelených).
- Datové schéma lekce je v `src/engine/scene/lesson.ts` (headless, jen Zod).
  `SceneDoc.lesson?` je zpětně kompatibilní — staré scény bez pole se načtou bez chyb.
- Dva typy předpovědi: `numeric` (pro měřitelné veličiny) a `choice` (multiple-choice).
  `quantity` enum: `landing-x | landing-y | max-speed | max-height` — pokryje typické
  úlohy vrhu, kyvadla, nakloněné roviny.
- Fixtura `lesson-projectile-v1.json`: šikmý vrh 45 °, v₀ = 10 m/s, míč ID `ball`,
  `landing-x` s tolerancí 5 %. Analyticky: R = v²·sin(2α)/g ≈ 10,19 m (z výšky 0,2 m).
- Další běh = **F2-E 2. půlka (overlay)**. Začni od `src/app/` — přidej
  `predictionState` do `uiStore`, pak `PredictionOverlay.tsx`. Worker tracker
  (vyhodnocení) implementuj jako mini extension nad Recorderem — nový worker protokol
  `setPredictionTarget` + zpráva `predictionResult` (headless v InstrumentsModule).
- Poznámka: při commitu narazil bot na divergovaný main + lokální `_process_manifests.cjs`
  modifikaci; push vyřešen přes `git merge origin/main` (ne rebase). Pro příště:
  fyzlab-bot by měl na začátku ran vždy zjistit stav VŠECH souborů, ne jen staged.

## Backlog Fáze 2 (pořadí půlmilníků)
1. ~~F2-C grafy + CSV (recorder → uPlot → CSV)~~ ✓ hotovo
2. ~~F2-D Tracer (stopa pohybu)~~ ✓ hotovo
3. ~~F2-D FBD režim (šipky sil v N)~~ ✓ hotovo
3. ~~F2-E 1. půlka — lesson schéma + fixture~~ ✓ hotovo
4. F2-E 2. půlka — overlay + vyhodnocení predikce
4. F2-F hloubka mechaniky: nůž/CSG, lano/řetěz, thruster, ozubení,
   vzájemná gravitace těles, kolizní vrstvy A–J
5. F2-G ~10 kurikulárních scén + LibraryDialog (meta.curriculum)

Po Fázi 2: Fáze 3 (optika), 4 (kapaliny), 5 (release) — viz `docs/PLAN.md`.
