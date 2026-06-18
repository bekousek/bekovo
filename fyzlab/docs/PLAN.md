# FyzLab — webový fyzikální sandbox pro bekovo.cz (náhrada Algodoo)

## Kontext

Ondřej učí fyziku na ZŠ (bekovo.cz: Astro 6 + Tailwind 4 + React 19, Cloudflare Pages, 19 témat × 88 podtémat pro ročníky 6–9, applety jako statické ostrůvky v `public/applety/` registrované v `src/lib/applets.ts`). Algodoo, které používal, je pro něj už nepoužitelné. Cíl: **FyzLab** na `fyzlab.bekovo.cz` — webové simulační hřiště, kde si kdokoliv hraje s mechanikou, kapalinami, optikou a později elektřinou, a **všechny prvky spolu interagují**. Primární mise je učit fyziku → fyzikální přesnost, vizualizace veličin, podněcování zvědavosti (konstrukcionismus, metodika Create→Predict→Interact→Evaluate).

**Rozhodnutí uživatele:** v1 = mechanika + optika + kapaliny (obvody v další fázi) · desktop + dotyk (tablety, interaktivní tabule) prvotřídně od začátku · sdílení souborem + URL (bez backendu) · název FyzLab.

## Rešerše — souhrn

### Algodoo (vzor k překonání)
- **Fyzika:** SPOOK constraint solver + SPH voda (nestlačitelná). Materiály: hustota, tření, restituce, index lomu, přitažlivost; presety (dřevo, ocel, led, guma, zlato, helium).
- **Nástroje:** drag, rovina, kruh, box, polygon od ruky, štětec, sketch, řetěz/lano, pružina, osa+motor, ozubené kolo, fixace, nůž (řezání těles), thruster, laser, tracer, CSG, kolizní vrstvy A–J, snap-to-grid, menu přesných rychlostí.
- **Optika:** lasery — odraz, lom (Snell), disperze (duha), absorpce.
- **Výuková vrstva (klíč):** vektory rychlosti/hybnosti/sil, energie (kinetická/potenciální/celková), grafy čehokoliv v čase i proti sobě + CSV export.
- **Skriptování:** Thyme (onCollide, onKey, postStep…). **Komunita:** Algobox 200k+ scén; 60+ lekcí dle věku.
- **Stav:** živoří (2.2.4, 07/2025), desktop-only, zastaralé UI, žádný web → mezera.

### Konkurence / inspirace
| Projekt | Co si vzít | Slabina |
|---|---|---|
| **Simulo** (web/Steam, open-source alfa) | důkaz poptávky po webovém Algodoo | hra, ne výuka |
| **Principia** (open-source BSD-3) | 200+ objektů vč. elektroniky, Lua | hra/puzzle, ne přesnost |
| **SimPhy** (desktop) | FBD, pole E/M/grav., DC/AC obvody | desktop, těžkopádné |
| **Physics Lab** (mobil) | obvody s přesnými čísly, siločáry | 3D, ne sandbox „vše spolu" |
| **Ray Optics Simulation** (phydemo, **Apache 2.0**, modulární JS) | kompletní 2D optika — algoritmy lze převzít s atribucí | jen optika |
| **CircuitJS1** (Falstad, GPLv2) | MNA solver — jen koncepty, ne kód | jen obvody |
| **PhET** | pedagogika: okamžitá zpětná vazba, více reprezentací | jednoúčelové |

**Mezera na trhu:** žádný webový sandbox nekombinuje mechaniku + kapaliny + optiku + obvody vzájemně interagující s výukovou vrstvou. To je pozice FyzLabu.

### Technologie (ověřeno, stav 06/2026)
- **Tělesa:** `@dimforge/rapier2d` — oficiální JS/WASM bindingy, aktivní; **deterministická varianta** (compat build) → reprodukovatelné běhy, CI testy, replaye. Box2D v3 WASM existuje, ale Rapier má lepší ekosystém.
- **Kapaliny:** salva2d nemá JS bindingy; LiquidFun-wasm mrtvý (2021) → **vlastní 2D PBF solver v TS** (typed arrays, spatial hash, worker, 5–15k částic CPU), rozhraní připravené na pozdější WebGPU compute backend (v prohlížeči prokázáno 100k+ částic).
- **Optika:** vlastní ray tracer v TS (algoritmy dle ray-optics, Apache 2.0).
- **Obvody (později):** vlastní MNA solver v TS (koncepty Falstad, čistá implementace kvůli GPL).
- **Rendering:** PixiJS v8 (WebGL default, WebGPU opt-in). **UI:** React 19 + Tailwind 4 (konvence repa). **Validace:** zod (už v repu).

## Vize produktu — pilíře

1. **Sandbox bez návodu** — prázdné plátno, hravé nástroje, okamžitá fyzika; vše jde nakreslit, chytit, roztočit, rozříznout — i za běhu simulace (live-edit jako Algodoo).
2. **Vše interaguje se vším** (hlavní diferenciátor; architektonický princip „SignalBus", ne afterthought). Cílový obrázek po fázi Obvody: žárovka v obvodu svítí *skutečnými paprsky* → fotočlánek z nich vyrábí proud → točí motorem → ten navíjí lano se závažím → závaží se ponoří do vody → hladina stoupne a sepne plovákový spínač.
3. **Fyzikálně přesné:** SI jednotky všude, reálné hodnoty v panelech, fixní timestep 120 Hz, determinismus, CCD, **automatizovaná sada přesnostních testů v CI** (volný pád, vrh, kyvadlo, nakloněná rovina, SHM, Archimedes, Snell/TIR, čočka, drift energie…).
4. **Výuková vrstva:** vektory sil/rychlostí, **FBD režim** (uvolněné těleso s popisky sil v N), grafy + CSV, **virtuální přístroje** (stopky, fotobrány!, siloměr, pravítko, úhloměr, fotočlánek, váhy), **režim Predikce** (zamčená scéna + otázka → tip žáka → spuštění → vyhodnocení), **knihovna scén mapovaná na 88 podtémat** bekovo.cz (`meta.curriculum: {grade, topicId, subtopicId}`).
5. **Sdílení bez serveru:** scéna = malý JSON; `.fyzlab` soubor + odkaz `#s=` (komprese CompressionStream→base64url); determinismus později umožní i sdílení záznamů běhu.

**Odvážné nápady v zásobníku (pozdější fáze):** energetický audit („kam se poděla energie" — tření→teplo), gravitační přitažlivost těles → oběžné dráhy (astronomie 9. r.), magnety (dipólová aproximace + siločáry, 6. r.), zvukový modul (kmitání→průběh vlny→frekvence, akustika 8. r.), teplo (vedení, skupenství 8. r.), jednoduché skriptování/ovladače (klávesy→síly, výrazy), galerie scén (Algobox-like, Worker+KV), WebGPU kapaliny, kolaborativní režim, AI asistent stavby scén.

## Architektura

### Umístění a deploy
- **Stejný repozitář, nová top-level složka `fyzlab/`** — samostatný Vite projekt s vlastním `package.json`, `tsconfig.json`, `wrangler.jsonc` (bez npm workspaces, žádná vazba na Astro build). Důvod: kurikulární vazby (topicId/subtopicId) v jednom atomickém commitu; jeden checkout pro solo vývoj s Claudem.
- **Druhý Cloudflare projekt** `fyzlab` napojený na týž GitHub repo: root directory `fyzlab`, build `npm ci && npm run build`, assets `./dist`, doména `fyzlab.bekovo.cz`, build watch paths `fyzlab/**` (hlavní web nedotčen). Subdoména izoluje případné budoucí COOP/COEP hlavičky (SharedArrayBuffer) od hlavního webu.
- **CI:** `.github/workflows/fyzlab-ci.yml` path-filtrované na `fyzlab/**`: `tsc --noEmit` + `vitest run` (headless engine běží v Node bez prohlížeče).
- **Ochrana před noční rutinou:** přidat `fyzlab/**` do do-not-touch v `AGENTS.md`.
- Odkazy z hlavního webu: záznamy v `src/content/materials/` (type `applet`/`link`) u příslušných podtémat; případně později vlastní tab.

### Vlákna a smyčka
- **Main thread:** React chrome, PointerManager, nástroje, DocumentStore, Pixi rendering s interpolací (ring 2 snapshotů, render čas = poslední − 1 interval).
- **Sim worker:** celý headless `Engine` (všechny moduly), fixní krok `1/120 s`, accumulator, catch-up clamp (max 4 ticky, pak flag `slowMotion` → UI „zpomaleno"). Komunikace transferable ArrayBuffery (ping-pong pool), bez SharedArrayBuffer v v1.
- **Rate divisory per modul** (součást doc → determinismus): rigid 120 Hz, fluid 60 Hz (2 substepy), optika 60–120 Hz.

### Kontrakt modulů a pořadí ticku (= mechanismus mezioborových interakcí)
```ts
interface SimModule {
  name: 'rigid'|'fluid'|'optics'|'instruments'|/*později*/'circuits'|'magnets';
  build(doc, host); applyPatch(ops); tick(ctx); writeSnapshot(w);
  readState(): EntityStatePatch[]; dispose();
}
```
Pořadí v ticku: **1)** instruments latch senzorů z minulého ticku → **2)** *(později)* circuits MNA solve → **3)** rigid applyForces (vztlak/odpor vzduchu, thrustery, drag joint, momenty motorů **ze SignalBusu**) → **4)** rigid step (zachytává síly pro FBD) → **5)** fluid PBF + obousměrná vazba → **6)** optics trace (zapíše tok do fotočlánků na bus) → **7)** instruments tick (fotobrány se sub-tick interpolací, recorder).
**SignalBus** = typovaná mapa `(entityId, port) → number` + event list; žárovka→`opticalSource.intensity`, fotočlánek→`fluxW`, kontaktní spínač→`closed`. Zpoždění 1 tick (8 ms) je fyzikálně zanedbatelné a drží řešení acyklické.

### Dokument scény vs. živý stav
- **SceneDoc (zod, verzované JSON, SI jednotky, y-up)** je jediný serializovatelný zdroj pravdy; engine je jeho projekce.
- Každá akce editoru = `Command {patch, inversePatch}` → DocumentStore → `patch` do workeru. **Undo/redo funguje i za běhu.** Při pauze/uložení `requestStateSync` slije pozice/rychlosti zpět do docu (jeden implicitní undoable krok „simulace proběhla"). Play z editace si drží `resetDoc` → Reset obnoví přesný výchozí stav (základ režimu Predikce).
- Schéma entit (diskriminovaná unie `kind`): `body` (compound shapes: circle/box/polygon/plane; material vč. `optics {mode: mirror|glass|absorb, refractiveIndex, cauchyB, reflectivity}`; collision layers A–J; tracer), `joint` (axle+motor / spring / fixed / rope), `fluid` (region→částice, hustota/viskozita), `opticalSource` (laser/beam/point, vlnová délka, intensityW, `parentId` — připevnitelný na těleso), `instrument` (stopwatch/photogate/forceMeter/ruler/protractor/photocell/plot), `annotation`. Volitelné `lesson {mode, instructions, prediction, lockedTools}`.
- **Migrace:** povinná `version`, čistý řetěz `v(n)→v(n+1)`, zmrazené fixtury všech verzí testované v CI navždy (sdílené URL z 2026 musí jít otevřít v 2030).

### Nástroje a vstup (myš + dotyk rovnocenně)
- `PointerManager`: PointerEvents + `setPointerCapture` + `getCoalescedEvents`, `touch-action: none`; emituje normalizované eventy ve **světových souřadnicích** (nástroje nikdy nevidí pixely).
- Gesta před nástrojem: 2 prsty = pinch-pan-zoom (běžící gesto nástroje dostane `cancel` — kritické pro tabuli), long-press 450 ms = radiální menu (= pravé tlačítko), tap vs. drag na 8 px/200 ms.
- `Tool` lifecycle (activate/pointer*/renderPreview), commit Commandu až na pointer-up (náhled jen v overlay vrstvě → zrušení zdarma, undo uniformní). Výchozí nástroj **Drag/Select**: za běhu pružinový drag joint, v pauze move/rotate/scale úchopy, prázdno = marquee.
- **Radiální menu** (React overlay, sektory ≥48 px): Smazat, Vlastnosti, Materiál, Rychlosti, Graf, Geometrie (CSG/zrcadlení), Vrstvy.

### Rendering
PixiJS v8, vrstvy: grid (metrová mřížka) → bodies (Graphics, geometrie překreslena jen při změně, transformy z interpolovaného snapshotu) → fluid (částice→render texture→threshold/metaball filtr) → rays (additivní blend) → vectors/FBD → overlay (náhledy nástrojů, úchopy, tracery). Grafy: uPlot + CSV export.

### Struktura složek (zkráceně)
```
fyzlab/
  wrangler.jsonc, vite.config.ts, index.html, docs/ARCHITECTURE.md
  content/scenes/            # kurikulární scény <topicId>--<subtopicId>--<slug>.json + manifest
  src/
    app/                     # React chrome: Toolbar, SimControls, PropertiesPanel, RadialMenu,
                             #   PlotPanel, LibraryDialog, PredictionOverlay, store/, i18n/ (cs)
    editor/                  # framework-free: DocumentStore, commands/, tools/, pointer/,
                             #   camera, selection, hitTest, snap
    engine/                  # HEADLESS (bez DOM/Pixi/React) — běží ve workeru i ve vitestu
      core/                  # math, ids, timing, SimModule, SignalBus
      scene/                 # schema (zod v1), migrate, defaults, materials (presety)
      rigid/                 # rapier.ts (jediný import bod), RigidModule, dragJoint,
                             #   ambientForces (vztlak+odpor vzduchu), geometry (simplify, decomp, CSG)
      fluid/                 # FluidModule, pbf.ts (SoA), grid.ts (counting sort → determinismus), coupling
      optics/                # OpticsModule, tracer (Snell/TIR/Cauchy RGB), surfaces (segment/oblouk/ideální čočka)
      instruments/           # InstrumentsModule (fotobrány sub-tick), Recorder
      snapshot/layout.ts     # binární snapshot writer/reader
    worker/                  # protocol.ts (jediný zdroj pravdy zpráv), sim.worker.ts, SimWorkerClient.ts
    render/                  # Renderer, Interpolator, layers/*
    share/                   # urlCodec (#s=, deflate-raw), fileIO (.fyzlab)
  tests/                     # accuracy/*, determinism, schema + fixtures/
```
Pravidlo závislostí: `app → editor → render/share → engine`, nikdy obráceně.

### Worker protokol (jádro)
Main→Worker: `init/loadScene(doc)`, `patch(DocOp[])`, `control(play|pause|step|reset|setSpeed)`, `pointer(dragStart/Move/End)` (koalescováno ≤1/frame), `setLiveProp` (slidery bez undo), `requestStateSync`, `returnBuffer`.
Worker→Main: `ready/error`, `idTable` (jen při změně členství), `snapshot` (seq, simTime, transferable buffery: bodies N×7, particles M×3, rays K×6, signals; latest-wins ≤60 Hz), `events` (kolize, fotobrány se sub-tick časem), `plotChunk` (~10 Hz), `stateSync`.

## Roadmapa

### Fáze 0 — Chodící kostra (~2–3 víkendy)
Cíl: protnout všechny architektonické švy (Vite+WASM+worker+Pixi+interpolace+dotyk+CI+deploy) na „míč padá na zem".
Úkoly: scaffold (0.1) → engine core: math/ids/timing/SimModule/SignalBus stub (0.2) → minimální zod schéma + demo doc (0.3) → RigidModule na `rapier2d-deterministic` compat + dragJoint (0.4) → snapshot layout + headless Engine (0.5) → worker protokol + smyčka + buffer pool (0.6) → Renderer + Interpolator + bodies/grid vrstvy (0.7) → camera + PointerManager + gesta + DragTool + hitTest (0.8) → React chrome: Spustit/Pauza/Krok/Reset, i18n cs (0.9) → testy freefall + determinismus (0.10) → CI workflow + ARCHITECTURE.md + AGENTS.md fence (0.11) → Cloudflare projekt + doména (0.12, manuálně v dashboardu).
**DoD:** míče padají a vrší se plynule (i s 4× CPU throttle — důkaz interpolace); míč jde chytit za běhu myší **i prstem na reálném tabletu**, pinch nezaloží drag; Reset = identický state hash (determinismus); vitest zeleně lokálně i v CI; `fyzlab.bekovo.cz` servíruje aplikaci a hlavní web zůstal zelený.

### Fáze 1 — Jádro editoru + perzistence (~4–6 víkendů)
- **M1.1 Commandy + tvary + výběr:** DocumentStore + undo/redo (i za běhu), box/kruh/rovina, polygon od ruky (Douglas-Peucker → konvexní dekompozice), výběr/marquee/úchopy move-rotate-scale (dotykové velikosti), Toolbar.
- **M1.2 Vlastnosti + materiály + svět:** presety materiálů, PropertiesPanel (SI jednotky, přesné rychlosti), RadialMenu, gravitace/odpor vzduchu/rychlost simulace 0.1–4×/grid+snap.
- **M1.3 Klouby:** osa s motorem (první pár producent/konzument na SignalBusu), pružina, fixace; kopírovat/vložit, zrcadlit, mazat multi-select.
- **M1.4 Perzistence + sdílení + overlay:** .fyzlab soubor (download/open/drag-drop), URL `#s=` round-trip, migrate skeleton + první fixtura, vektory rychlosti; rozšíření accuracy testů (vrh, kyvadlo, nakloněná rovina, SHM, drift energie).
**DoD:** na tabletu postavím houpačku (prkno+osa+2 kvádry) z prázdné scény pod 2 minuty bez klávesnice; vše undoable; save→load = identický doc hash; URL scéna ~20 entit se otevře v anonymním okně; motor drží cílové rad/s ±2 %; accuracy CI v tolerancích (vrh ≤0.5 %, kyvadlo ≤1 %, SHM ≤1 %, drift energie <2 %/10 s).

### Fáze 2 — Výuková vrstva + hloubka mechaniky
Přístroje (stopky, **fotobrány** se sub-tick časováním, siloměr, pravítko, úhloměr), Recorder + PlotPanel + **CSV export**, **FBD režim**, tracer, **režim Predikce** (lesson schéma + overlay), vzduch: kvadratický odpor + vztlak (heliový balónek!), kolizní vrstvy A–J, **nůž + CSG**, lano/řetěz, thruster, ozubení (vazba převodového poměru), gravitační přitažlivost těles (oběžné dráhy), prvních ~10 kurikulárních scén. Accuracy: terminální rychlost balónku, fotobrána vs. analytika.

### Fáze 3 — Optika
Zdroje (laser/svazek/bodový), materiály mirror/glass/absorb, Snell + totální odraz + Cauchy disperze (RGB→duha), analytické průsečíky (úsečka/oblouk → reálné čočky a hranoly), ideální tenká čočka + kulové zrcadlo jako primitivy, fotočlánek → SignalBus → graf, vrstva paprsků. Accuracy: Snellovy úhly ≤1e-6 rad, kritický úhel, zobrazovací rovnice ≤1 %. ~10 scén (zrcadla, čočky, lom, duha — optika 7. r.).

### Fáze 4 — Kapaliny
PBF 5–15k částic (SoA, counting-sort grid → determinismus), obousměrná vazba s tělesy (clamp impulzů), metaball rendering, nástroj oblast kapaliny + kohoutek/výpusť. Nejdřív one-way, pak two-way; **za experimentálním přepínačem, dokud neprojde Archimedes CI** (hloubka ponoru ≤5 %). Scény: vztlak, hustoty, spojené nádoby (kapaliny 7. r., hustota 6. r.).

### Fáze 5 — Zpevnění + obsah + vydání v1
30+ kurikulárních scén s LibraryDialog napojeným na taxonomii webu, nápověda/landing česky, odkazy z `src/content/materials/`, výkonnostní průchod proti budgetům, doladění dotyku na reálné tabuli, stats overlay (F3), PWA manifest + offline cache (školní wifi), OG/favicon. **Release v1.**

### Pozdější fáze (hrubě)
**Obvody** (MNA modul; komponenty jako fyzická tělesa s porty; SignalBus uzavře smyčku: žárovka→světlo, fotočlánek→zdroj, kontakt→spínač, motor↔osa s back-EMF modelem; vodiče jako řezatelná lana; vizualizace proudu) → **magnety** (dipóly + siločáry) → **teplo** (skalár na těleso, vedení, energetický audit) → **zvuk** (kmity→vlnění→frekvence) → **skriptování/ovladače** (výrazový DSL, klávesy) → **galerie** (PR-based nebo 1 Worker+KV) → **WebGPU fluids** (výměna za úzkým rozhraním FluidModule) → kolaborace/AI asistent (vize).

## Rizika a mitigace
| Riziko | Mitigace |
|---|---|
| Stabilita vazby kapalina–těleso (největší technické riziko) | fluids až ve fázi 4 + „experimentální" přepínač; clamp impulzů; substepy; one-way → two-way; Archimedes test jako brána |
| Latence dotyku přes worker (pomalé tabule) | pružinový drag joint pohltí 1–2 framy; koalescence pointer zpráv; test na reálném tabletu už v DoD fáze 0 |
| Determinismus vs. rychlost | default deterministic build (CI + replaye + třída > SIMD pro ≤500 těles); swap = 1 řádek v `rigid/rapier.ts` |
| Evoluce schématu rozbije staré URL | povinná verze + čistý migrační řetěz + zmrazené fixtury v CI navždy |
| Scope creep (Algodoo = 15 člověkoroků) | fázové brány se shippable konci; kurikulární scény definují „dost" pro fázi; parking lot pozdějších fází |
| WASM/worker/Vite třenice | `-compat` balíček (embedded wasm, funguje i ve vitest/Node); fáze 0 spaluje riziko první |
| Noční AI rutina zabloudí do fyzlab/ | do-not-touch v AGENTS.md |
| Limity délky URL | hash fragment, soft-warning ~8 kB → „použij soubor" |

## Verifikace
- **Accuracy suite (CI, vitest, headless):** volný pád ±0.5 % · dostřel vrhu ±0.5 % · perioda kyvadla (5°) ±1 % · práh smyku na nakloněné rovině ±2 % · SHM ±1 % · drift energie <2 %/10 s · balónek ±5 % · Snell ≤1e-6 rad + kritický úhel · tenká čočka ±1 % · Archimedes ±5 % · determinismus (2 běhy → identický hash) · schémové fixtury všech verzí.
- **Výkonnostní budgety (střední laptop, vestavěný stats overlay + commitnuté benchmark scény):** 500 těles → tick ≤3 ms @120 Hz · 10k částic → ≤12 ms @60 Hz · 200 paprsků×64 odrazů ≤2 ms · main thread ≤8 ms/frame · cold load ≤3 s (wasm+js ≤4 MB gzip).
- **Manuální smoke (~10 min/release):** houpačka na tabletu · chytit a hodit míč · rozříznout padající box · laser→sklo→fotočlánek→graf reaguje · loď + voda až se potopí · balónek stoupá · dvojice fotobran změří vozík shodně s grafem · URL share → otevřít na mobilu · predikční lekce projde celým cyklem · 20× undo do prázdné scény. Zařízení: Windows+Chrome, Android tablet, školní interaktivní tabule.

## Klíčové soubory (nové)
- `fyzlab/src/engine/Engine.ts` — headless host modulů (worker, testy a budoucí backendy sdílí jednu pravdu)
- `fyzlab/src/worker/protocol.ts` — kontrakt Main↔Worker
- `fyzlab/src/engine/scene/schema.ts` — zod SceneDoc v1 (visí na něm perzistence, sdílení, undo, migrace)
- `fyzlab/src/engine/rigid/RigidModule.ts` — referenční implementace SimModule kontraktu
- `fyzlab/src/editor/DocumentStore.ts` — command pattern + sync do workeru (sémantika pause-edit/live-edit)
- Úpravy v repu: `AGENTS.md` (fence), `.github/workflows/fyzlab-ci.yml`, později `src/content/materials/*` (odkazy na scény)

## Zdroje (výběr)
[Algodoo](https://en.wikipedia.org/wiki/Algodoo) · [algodoo.com](https://www.algodoo.com/) · [Thyme wiki](https://algodoo.fandom.com/wiki/Thyme) · [Ray Optics Simulation](https://phydemo.app/ray-optics/) ([GitHub, Apache 2.0](https://github.com/ricktu288/ray-optics)) · [CircuitJS1](https://github.com/sharpie7/circuitjs1) · [Principia](https://github.com/Bithack/principia) · [Simulo](https://store.steampowered.com/app/3291520/Simulo/) · [Rapier JS](https://rapier.rs/docs/user_guides/javascript/getting_started_js/) ([npm deterministic](https://www.npmjs.com/package/@dimforge/rapier2d-deterministic)) · [salva](https://github.com/dimforge/salva) · [box2d3-wasm](https://github.com/Birch-san/box2d3-wasm) · [PixiJS v8](https://pixijs.com/8.x/guides/components/renderers) · [WebGPU fluids](https://github.com/jeantimex/fluid) · [Algodoo lekce](https://www.algodoo.com/learn-it/)
