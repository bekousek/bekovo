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

- **F3-A, 2. půlka** — trasování paprsků + raysLayer:
  `OpticsModule.ts` — plné `tick()`: emise paprsků (laser/beam/point, parentId),
  transformace do lokálního prostoru tělesa, průsečíky (circle/box/polygon/plane),
  aplikace Snell/reflect/absorb, TIR, MAX_BOUNCES=16, MAX_TOTAL_RAYS=512;
  `readRaySegments()` vrací aktuální sadu po každém ticku.
  `Engine.ts` — `getPose` callback předán OpticsModule; `readRaySegments()`;
  `addBody/removeBody/replaceBody` pro inkrementální sync optických těles.
  `protocol.ts` — nová zpráva `raysUpdate { segments }` (worker→main).
  `sim.worker.ts` — drainuje paprsky po každé smyčce a po každém step.
  `SimWorkerClient.ts` — `onRaysUpdate` callback.
  `uiStore.ts` — `raySegments` + `setRaySegments`.
  `render/layers/raysLayer.ts` — Pixi Graphics; λ→RGB (CIE aprox.); additivní blend;
  tloušťka čáry ≥ 1.2 px; `clear()` při nové scéně.
  `Renderer.ts` — RaysLayer za joints, před instruments; `raySegments` getter.
  `bootstrap.ts` — `onRaysUpdate` + `renderer.raySegments` drátování.

- **F3-B** — optické preset scény + accuracy testy trasování:
  `defaults.ts` — `laserScene()` (laser + skleněný blok, λ=550 nm, lom viditelný),
  `prismScene()` (3 lasery 450/550/650 nm + trojúhelníkový hranol, cauchyB=0.01 → disperze).
  `LibraryDialog.tsx` — 2 nové dlaždice (🔦 Lom světla, 🌈 Disperze — hranol).
  `tests/accuracy/optics-trace.test.ts` — 8 testů trasování: normální dopad,
  vodorovnost paprsků, lom pod 30° (≤1e-4 rad), zrcadlo (správný odraz),
  absorber (1 segment), beam 5 paprsků (5 segmentů).

- **F3-A, 1. půlka** — paprsková optika: schéma + math + skeleton modul:
  `schema.ts` — `BodyOpticsSchema` (`mode`, `refractiveIndex`, `cauchyB`, `reflectivity`);
  `optics?: BodyOptics` na `BodySchema`; `OpticalSourceSchema` (laser/beam/point, wavelength,
  power, rayCount, beamWidth, parentId) přidáno jako 4. člen `EntitySchema`; nové exporty
  `BodyOptics`, `OpticalSource`.
  `src/engine/optics/math.ts` — headless ray-math: `reflect()`, `snell()` (TIR = null),
  `cauchyN()`, `intersectSegment()`, `intersectCircle()`; SELF_EPSILON = 1e-9.
  `src/engine/optics/OpticsModule.ts` — skeleton `SimModule` (`build/addSource/removeSource/
  replaceSource/tick/writeSnapshot/readState/dispose`); tick a writeSnapshot = placeholder F3-B.
  `Engine.ts` — `OpticsModule` jako pole; pořadí `[rigid, optics, instruments]`; `applyPatch`
  směruje `opticalSource` ops do `optics.addSource/removeSource/replaceSource`.
  `PropertiesPanel.tsx` — přidána větev `e.kind === 'instrument'` (null pro opticalSource).
  `tests/accuracy/optics.test.ts` — 20 přesnostních testů: reflect (3), snell/lom (4), TIR (3),
  cauchyN (2), intersectSegment (4), intersectCircle (4).

- **F3-C** — LaserTool + PropertiesPanel optika:
  `OpticsTools.ts` — `LaserTool extends TapTool` (zkratka L); ťuknutí umístí `opticalSource`
  (laser, λ=550 nm, angle=0); ťuknutí na těleso → `parentId` = id tělesa.
  `Toolbar.tsx` — nová sekce INSTRUMENT_TOOLS: `laser` (⟶, zkratka L), vedle fotobrány.
  `bootstrap.ts` — `tools.register(new LaserTool(toolCtx), 'l')`.
  `PropertiesPanel.tsx` — `OpticalSourceSection` (type chips laser/beam/point, vlnová délka
  s presety VIS, počet paprsků, šířka svazku, připevnění k tělesu); `BodyOpticsSection`
  (přepínač opticsEnabled, mode chips zrcadlo/sklo/absorber, n, Cauchy B, odrazivost).
  `cs.ts` — 20 nových i18n klíčů (toolLaser, hintLaser, propOpticalSource, propBodyOptics, …).

- **F3-D** — tenká čočka (maticová optika, paraxiální):
  `OpticsModule` — fallback na `body.transform` když getPose vrátí null; mode='lens':
  paprsek center přejde beze změny, periferní paprsky se ohnou dle `θ_out = θ_in − sign(dx)·h/f`.
  4 accuracy testy (zobrazovací rovnice ±1 %, divergentní, průchodový).
  `defaults.ts` — `convergingLensScene()`, `divergingLensScene()`, `periscopeScene()`;
  LibraryDialog — 3 nové dlaždice (Spojná čočka, Rozptylná čočka, Periskop).

- **F4** — Kapaliny: 2D PBF solver + plná integrace:
  `FluidModule.ts` (SoA, spatial hash, density constraint, lambda, XSPH viskozita,
  jednosměrná vazba plane/box/circle); Engine.ts pipeline; worker fluidUpdate zpráva;
  FluidLayer (Pixi, kruhy); FluidTool (zkratka W); PropertiesPanel FluidSection;
  Toolbar W button; defaults.ts `waterInBoxScene`, `twoDensitiesScene`;
  LibraryDialog 💧🫧 dlaždice; 3 accuracy testy (usazení, meze, konvergence).

- **F5-A** — PWA + OG + hint opravy:
  `public/favicon.svg` (modrá fyzika — trajektorie + kulička + vlnka + laser);
  `public/manifest.json` (name/short_name/icons/theme_color/display:standalone);
  `public/sw.js` (offline cache — network-first navigace, cache-first assety);
  `public/og.svg` (1200×630 OG obrázek s fyzikálními prvky);
  `index.html` — PWA manifest link, favicon, OG/Twitter meta, SW registrace;
  `App.tsx` — HINT_BY_TOOL doplněn o thruster/laser/fluid.

Stav: **134 testů zelených**, `tsc` čistý.

- **F5-B, 1. půlka** — 8 nových kurikulárních scén (22 celkem):
  `freeFallScene` (6. r. pohyb, lesson max-speed), `projectile45Scene` (7. r. pohyb, lesson landing-x),
  `leverScene` (7. r. páka, lesson choice), `elasticCollisionScene` (9. r. hybnost, lesson choice),
  `inelasticCollisionScene` (9. r. hybnost, lesson max-speed), `dominoScene` (9. r. hybnost),
  `newtonsCradleScene` (9. r. hybnost), `rollingRampScene` (8. r. energie, lesson max-speed).
  Všechny registrovány v LibraryDialog. TS opravy: unused buildHashXY, XSPH dvx/dvy index,
  setWorld gravity optional, PropertiesPanel unused param.

Stav: **134 testů zelených**, `tsc` čistý.

- **F5-B, 2. půlka** — HelpDialog + výkonnostní průchod:
  `HelpDialog.tsx` — modální nápověda (tlačítko ? v TopBar); sekce: ovládání simulace
  (mezerník/Ctrl+Z/Del/G), nástroje tvary/spoje/přístroje, navigace, přehled 22 fyzikálních témat.
  `TopBar.tsx` — nový prop `onHelp`, tlačítko ? za 📂.
  `App.tsx` — `showHelp` state, `<HelpDialog onClose>` zřetězen vedle LibraryDialog.
  `cs.ts` — nový klíč `topHelp`.
  `tests/perf/tick-perf.test.ts` — FluidModule (4 096 částic): průměr **46.6 ms/tick**;
  OpticsModule (64 paprsků, 8 zrcadel → 184 segmentů): průměr **8.7 ms/tick** (Node, bez JIT warmup).
  Ve web workeru bude výkon cca 2–3× rychlejší.

Stav: **136 testů zelených** (27 souborů), `tsc` čistý.

- **F5-C** — 8 nových kurikulárních scén (30 preset dlaždic celkem):
  `twoFallsScene` (6. r., gravitace — Galilův pokus, lesson choice),
  `pendulumLengthScene` (8. r., kmitání — délka závěsu a perioda, lesson choice),
  `horizontalThrowScene` (7. r., pohyb — vodorovný vrh z výšky 5 m, lesson numeric landing-x),
  `newtonThirdScene` (8. r., silové účinky — akce-reakce stlačená pružina, lesson choice),
  `momentBalanceScene` (9. r., tuhé těleso — rovnovážná páka 2 kg×1 m = 1 kg×2 m, lesson choice),
  `restitutionScene` (7. r., silové účinky — 3 míče e=0,05/0,5/0,9, explorační),
  `circularMotionScene` (8. r., pohyb — motor+rameno+závaží ω=2 rad/s, explorační),
  `airResistanceFallScene` (8. r., silové účinky — těžká vs. lehká koule ve vzduchu, lesson choice).
  Všechny registrovány v LibraryDialog. Všechny scény kompilují a nenarušují stávající testy.

Stav: **138 testů zelených** (27 souborů), `tsc` čistý.

## Další na řadě
**Vydání v1 — RUČNÍ kroky uživatele:**
- `git push origin main`
- Cloudflare Pages: connect repo → build cmd `npm run build` → output dir `dist` → deploy
- Test na reálném tabletu (dotykové ovládání, offline wifi)

## Kde jsem skončil / poznámky pro další běh
- **F3 + F4 + F5-A + F5-B + F5-C kompletní.** Celkem 30 preset scén v LibraryDialog.
- **Holistický review v prohlížeči (2026-06-25)** — celý plán hotový loopem (běžel HEADLESS,
  bez prohlížeče), proto našel review v prohlížeči integrační/render chyby. Opraveno:
  1. **Optika — lom na výstupní stěně skla.** `shapeHits` hlásí index skla pro každou stěnu;
     výstup počítal `snell(1.5,1.5)` = bez lomu (sklo neposunulo svazek, hranol odchýlil jen
     z půlky). Oprava: rozlišit vstup/výstup podle `current.n` (OpticsModule glass case)
     + regresní test „skleněná deska → emergentní paprsek rovnoběžný".
  2. **FBD — chyběla reakce vazeb.** Ležící bedna ukazovala jen tíhu dolů. Přidána složka
     `contact` = REZIDUUM m·a − Σ(známé síly) → diagram uzavírá na m·a (RigidModule, fbd.ts,
     fbdLayer, FbdPanel, cs.ts). Ověřeno: bedna ukáže tíhu i podporu, obě ≈ m·g.
  3. **raysLayer — tloušťka.** Čára kreslená v metrech (dítě world containeru), ale šířka
     dosazená v px → world.scale ji roztáhl na ~1 m → paprsek byl obří klín. Oprava: šířka
     v metrech (`1.5/ppm`). + additivní blend → normální (na světlém pozadí byl neviditelný).
  4. **Stale paprsky/částice po změně scény** — worker posílal raysUpdate jen když neprázdné;
     po přepnutí z optické scény staré paprsky zůstaly. Oprava: edge-trigger prázdný update
     + `Engine.refreshOptics()` po loadScene/patch v pauze (statická optika svítí hned, živá
     editace laseru/skla překresluje bez Spustit).
  5. **Scény optiky — geometrie.** `prismScene` mířil pod hranol (míjel); `periscopeScene`
     měl zrcadla „/" (horní odráželo vzhůru mimo scénu). Opraveno — disperze i periskop fungují.
  6. **Kapaliny — mírné doladění** (4 iterace, EPSILON 60, tlumení 0,99). PBF se u stěn pořád
     „vaří" (vstřik energie z pozičních korekcí) → kapalina nevypadá hutně. ZNÁMÁ MEZ, kandidát
     na soustředěnou práci (jednosměrná vazba, experimentální doména dle plánu).
- Výkon headless (Node): fluid 4k částic ≈ 21 ms/tick, optika 64 paprsků ≈ 2 ms/tick.
- Cloudflare deploy a test na tabletu jsou RUČNÍ kroky uživatele.

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

**Fáze 3 DOKONČENA. Fáze 4 DOKONČENA.** Fáze 5 (vydání v1) — viz `docs/PLAN.md`.
