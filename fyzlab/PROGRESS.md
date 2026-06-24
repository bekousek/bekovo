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
- **F2-F, 2. půlka** — vizuální render trysky + preset „Raketa":
  `JointsLayer` — nový `case 'thruster'`: oranžový kruh trysky na kotvě tělesa B;
  při `enabled=true` a `mag > 0` se kreslí plamen (3 čáry — střední oranžový + 2 boční
  žluté) ve výfukovém směru (opak tahové síly, délka 0,05 m / 10 N, max 0,4 m);
  síla rotována do světového systému pomocí `rotate()` z math.ts.
  `defaults.ts` — nová `rocketScene()`: pěnová raketa (foam 30 kg/m², 0,2 × 0,5 m,
  hmotnost 3 kg, tíha 29,4 N), výchozí tryska fy=20 N (nestoupá); žák nastaví > 30 N.

- **F2-G, 1. půlka** — LibraryDialog + curriculum meta:
  `schema.ts` — `meta.curriculum` (volitelný objekt `{subject?, grade?, topic?}`; zpětně
  kompatibilní); `demoScene()` + `rocketScene()` mají vyplněné curriculum.
  `LibraryDialog.tsx` — modální dialog s dlaždičkovým výběrem 2 presetů (📚 tlačítko
  v TopBar), backdrop-click zavírá, klik na dlaždici načte scénu přes `runtime.loadScene()`.
  `TopBar.tsx` — nový prop `onLibrary`, nové tlačítko 📚 vlevo od 📂.
  `App.tsx` — `showLibrary` state, dialog vykreslen nad vším ostatním (z-50).
  5 nových i18n klíčů (topLibrary, libraryTitle, librarySubtitle, libraryEmpty, libraryLoad).
- **F2-G, 2. půlka** — 5 nových preset scén + prázdná scéna:
  `defaults.ts` — nové funkce `emptyScene()`, `pendulumScene()` (koule na čepu 1,5 m,
  výchylka 15°), `inclineScene()` (kvádr na rovině 30°, μ=0,45), `springMassScene()`
  (závaží 1 kg na pružině k=50 N/m), `heliumBalloonScene()` (He balón, airDensity=1,2).
  `LibraryDialog.tsx` — 3 sloupce, max výška 70 vh + scroll; 7 dlaždic (prázdná + 6 presetů)
  s badgí kurikula; klient/ročník info na dlaždici.

Stav: **99 testů zelených**, `tsc` čistý.

## Další na řadě
**Fáze 3 (optika) — F3-A: paprsková optika, 1. půlka**
- Nový modul `src/engine/optics/` — headless paprsek (Snellův zákon + odraz): typy
  `OpticsBody` (zrcadlo/čočka/hranol), `Ray` s `origin`, `direction`, `wavelength`.
- Alternativně (stejný rozsah): dokončit F2 backlogy (kolizní vrstvy A–J).

## Kde jsem skončil / poznámky pro další běh
- **F2-G hotová** (99 testů zelených, tsc čistý). Fáze 2 je kompletní!
- LibraryDialog: 7 dlaždic ve 3 sloupcích, scroll na malých obrazovkách.
- Scény: kyvadlo, pružina, nakloněná rovina, heliový balón, raketa, demo, prázdná.
- Cloudflare deploy a test na tabletu jsou RUČNÍ kroky uživatele.
- Backlog F2: kolizní vrstvy A–J (Rapier), nůž/CSG, lano — přesunuty do Fáze 2 backlogu.
- Doporučení: začít Fázi 3 (optika) nebo si vybrat z F2 backlogu.

## Backlog Fáze 2 (pořadí půlmilníků)
1. ~~F2-C grafy + CSV (recorder → uPlot → CSV)~~ ✓ hotovo
2. ~~F2-D Tracer (stopa pohybu)~~ ✓ hotovo
3. ~~F2-D FBD režim (šipky sil v N)~~ ✓ hotovo
3. ~~F2-E 1. půlka — lesson schéma + fixture~~ ✓ hotovo
4. ~~F2-E 2. půlka — overlay + vyhodnocení predikce~~ ✓ hotovo
5. ~~F2-F 1. půlka — ThrusterJoint~~ ✓ hotovo
5. ~~F2-F 2. půlka — vizuální render trysky + rocketScene preset~~ ✓ hotovo
5. ~~F2-G 1. půlka — LibraryDialog + curriculum meta~~ ✓ hotovo
5. ~~F2-G 2. půlka — 5 nových preset scén + prázdná scéna~~ ✓ hotovo

**Fáze 2 DOKONČENA.** Backlog F2 (přesunut na později):
- kolizní vrstvy A–J (Rapier), nůž/CSG, lano/řetěz, vzájemná gravitace těles

**Fáze 3** (optika) — viz `docs/PLAN.md`.
