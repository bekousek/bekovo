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
- **F2-E, 2. půlka** — overlay + vyhodnocení predikce:
  `PredictionTracker.ts` (headless, 120 Hz; landing-x/y, max-height, max-speed,
  sub-tick interpolace, timeout 60 s); worker protokol `setPredictionTarget` /
  `predictionResult`; `InstrumentsModule` + `Engine` + `sim.worker` + `SimWorkerClient`
  drátování; `uiStore` rozšířen o `lesson`, `predictionState`, `predictionInput`,
  `predictionChosenId`, `predictionActual`; `bootstrap` wire-up + lekce při replaceDoc;
  `PredictionOverlay.tsx` (formulář tipu, lišta při running, výsledek + diff, Zkusit znovu);
  11 nových testů trackeru.
- **F2-F, 1. půlka** — ThrusterJoint (tryska):
  `joint.type === 'thruster'` v `JointSchema` (nové pole `thruster: {enabled, fx, fy}`);
  `Thruster` type export; `FbdForceKind` rozšířen o `'thruster'`; `RigidModule.addJoint`
  ukládá trysky do `jointData` (bez Rapier jointu); `RigidModule.tick` rotuje lokální sílu
  do světových os a aplikuje `applyImpulse(F·dt)` + FBD vzorek; `FbdLayer`/`FbdPanel`
  zelená barva + legenda; `ThrusterTool` (zkratka U, ťuknutí na těleso); `PropertiesPanel`
  sekce s enabled/fx/fy; i18n cs.ts; 3 nové accuracy testy (A: force/m*t ±1 %,
  B: rotace síly s tělesem, C: disabled = klid).

Stav: **99 testů zelených**, `tsc` čistý.

## Další na řadě
**F2-F — hloubka mechaniky (2. půlka): vizuální render trysky + raketa preset scéna**
- Nakreslit šipku/plamen trysky v `JointsLayer` (nebo nová `ThrusterLayer`) z polohy tělesa
  ve směru tahové síly; dynamická délka dle magnitudy.
- Preset scéna „Raketa": box lehký (foam), tryska fy=30 N, gravity=9,81; žák dostane za úkol
  nastavit sílu trysky pro stoupání a srovnání s tíhou.
- Alternativně (stejný rozsah): `F2-F 2. půlka` = kolizní vrstvy A–J (maskování kontaktů
  mezi skupinami těles) — záleží na prioritě.

## Kde jsem skončil / poznámky pro další běh
- **F2-F 1. půlka hotová** (99 testů zelených, tsc čistý).
- `ThrusterTool` (zkratka U): ťuknutí na dynamické těleso přidá trysku s `fy=20 N`.
- `PropertiesPanel` sekce `Tryska`: checkbox Aktivní, pole Síla X/Y v N.
- `FbdPanel`/`FbdLayer`: zelená šipka pro druh 'thruster'.
- Accuracy testy A/B/C: ověřena rotace síly s tělesem (natočení 90°) a disabled stav.
- Cloudflare deploy a test na tabletu jsou RUČNÍ kroky uživatele.
- **Chybí vizuální render trysky** v Pixi (JointsLayer nebo nová vrstva) — to je doporučená
  2. půlka F2-F: šipka/plamen ve směru tahové síly. Alternativa: preset scéna „Raketa" nebo
  kolizní vrstvy.

## Backlog Fáze 2 (pořadí půlmilníků)
1. ~~F2-C grafy + CSV (recorder → uPlot → CSV)~~ ✓ hotovo
2. ~~F2-D Tracer (stopa pohybu)~~ ✓ hotovo
3. ~~F2-D FBD režim (šipky sil v N)~~ ✓ hotovo
3. ~~F2-E 1. půlka — lesson schéma + fixture~~ ✓ hotovo
4. ~~F2-E 2. půlka — overlay + vyhodnocení predikce~~ ✓ hotovo
5. ~~F2-F 1. půlka — ThrusterJoint~~ ✓ hotovo
5. F2-F 2. půlka: vizuální render trysky + preset/kolizní vrstvy
5. F2-F hloubka mechaniky (zbývá): nůž/CSG, lano/řetěz, ozubení,
   vzájemná gravitace těles, kolizní vrstvy A–J
5. F2-G ~10 kurikulárních scén + LibraryDialog (meta.curriculum)

Po Fázi 2: Fáze 3 (optika), 4 (kapaliny), 5 (release) — viz `docs/PLAN.md`.
