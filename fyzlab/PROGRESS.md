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

Stav: **99 testů zelených**, `tsc` čistý.

## Další na řadě
**F2-G — kurikulární scény + LibraryDialog (1. půlka)**
- Přidat `meta.curriculum` pole do `SceneDocSchema` (volitelný objekt: `subject`, `grade`,
  `topic`; zpětně kompatibilní) — headless, v `schema.ts`.
- `LibraryDialog.tsx`: modální seznam presetů (tlačítko „Scény" v TopBar),
  zobrazí `rocketScene()` a `demoScene()` jako dlaždicový výběr.
- Alternativně (stejný rozsah): kolizní vrstvy A–J (maskování kontaktů mezi skupinami
  těles v Rapier).

## Kde jsem skončil / poznámky pro další běh
- **F2-F 2. půlka hotová** (99 testů zelených, tsc čistý).
- `JointsLayer` nově kreslí trysku: oranžový plamen (střed + 2 boční jazyky) ve výfukovém
  směru, délka proportionální magnitudě (0,05 m / 10 N, max 0,4 m). Při disabled → šedý kruh.
- `rocketScene()` v `defaults.ts`: foam raketa 3 kg, tíha 29,4 N, fy=20 N default (nestoupá).
  Žák nastaví fy > 30 N pro vzlet. Scéna je připravena pro F2-G LibraryDialog.
- Cloudflare deploy a test na tabletu jsou RUČNÍ kroky uživatele.
- Kolizní vrstvy A–J jsou backlog — doporučuji začít F2-G (Library + curriculum meta).

## Backlog Fáze 2 (pořadí půlmilníků)
1. ~~F2-C grafy + CSV (recorder → uPlot → CSV)~~ ✓ hotovo
2. ~~F2-D Tracer (stopa pohybu)~~ ✓ hotovo
3. ~~F2-D FBD režim (šipky sil v N)~~ ✓ hotovo
3. ~~F2-E 1. půlka — lesson schéma + fixture~~ ✓ hotovo
4. ~~F2-E 2. půlka — overlay + vyhodnocení predikce~~ ✓ hotovo
5. ~~F2-F 1. půlka — ThrusterJoint~~ ✓ hotovo
5. ~~F2-F 2. půlka — vizuální render trysky + rocketScene preset~~ ✓ hotovo
5. F2-F hloubka mechaniky (zbývá): nůž/CSG, lano/řetěz, ozubení,
   vzájemná gravitace těles, kolizní vrstvy A–J
5. F2-G ~10 kurikulárních scén + LibraryDialog (meta.curriculum)

Po Fázi 2: Fáze 3 (optika), 4 (kapaliny), 5 (release) — viz `docs/PLAN.md`.
