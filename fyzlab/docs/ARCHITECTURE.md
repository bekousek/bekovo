# FyzLab — technická reference

Kanonický popis architektury. Při změně protokolu, kontraktu modulů nebo
pořadí ticku **aktualizuj tento soubor v témže commitu**.

## Vlákna

- **Main thread**: React chrome, PointerManager + nástroje, DocumentStore
  (editor), Pixi rendering s interpolací. Nikdy nepočítá fyziku.
- **Sim worker** (`src/worker/sim.worker.ts`): headless `Engine` se všemi
  moduly, fixní krok `1/120 s` (FixedStepAccumulator, catch-up clamp 4 ticky →
  flag `slowMotion`). Komunikace transferable ArrayBuffery s recyklačním
  poolem; bez SharedArrayBuffer (statický hosting bez COOP/COEP).

## Headless pravidlo

`src/engine/` neimportuje DOM, Pixi ani React — stejný kód běží ve workeru
i ve vitestu (Node). Závislosti směřují jen `app → editor → render → engine`
(`share` smí jen na `engine`; editor implementuje typy z `render/layers/
overlayTypes.ts`, aby render nezávisel na editoru).

## Kontrakt modulů a pořadí ticku (ZÁVAZNÉ)

```ts
interface SimModule {
  name; build(doc); applyPatch?(ops); tick(ctx); writeSnapshot(w);
  readState(); dispose();
}
```

Pořadí v ticku = mechanismus mezioborových interakcí:

1. *(později)* circuits — MNA solve (čte senzory, píše aktuátory)
2. rigid — síly (drag joint, momenty motorů, **explicitní pružiny**, vzduch)
3. rigid — `world.step()` (Rapier)
4. *(fáze 4)* fluid — PBF substepy + obousměrná vazba
5. *(fáze 3)* optics — trace paprsků, zápis toků do SignalBusu
6. instruments — fotobrány (sub-tick eventy z čerstvých póz), recorder

## Recorder (`src/engine/instruments/Recorder.ts`)

Vzorkuje veličiny jednoho tělesa ~10 Hz (`RECORD_EVERY = 12` tiků při 120 Hz).
Headless — žádný DOM/React. `targetBodyId: string | null` nastavuje
`engine.setRecordBodyId(id)` přes zprávu workeru `setRecordBodyId`. Tiká
v `InstrumentsModule.tick()` (po fotobrány, po rigidu). Každý vzorek:
`{ t: simTime + dt, x, y, speed }` (t = čas fyzikálního stavu tělesa po ticku).
`drainSamples()` → worker posílá `plotChunk`; uiStore drží `plotBuffer`.
Při `engine.load()` / `build()` se buffer i targetBodyId vynulují.

## Přístroje (`src/engine/instruments/InstrumentsModule.ts`)

Fotobrána = úsečka podél lokální osy y (entita `instrument`, typ
`photogate`). Per (brána × těleso) se sleduje laterální odstup g nejbližší
hrany tvaru od přímky paprsku; hrana stavu `blocked` (g < 0 ∧ v podélném
rozsahu) generuje event `enter`/`exit` se **sub-tick časem** (lineární
interpolace g; podélné opuštění — např. vypadnutí pod bránu — se bere na
konci ticku). Eventy jedou workerem (`{type:'events'}`) do uiStore →
GatePanel (vstup/výstup/zákryt/počet). Stopky = `simTime` ze snapshotu
(RenderStats). Pózy čte modul z RigidModule přes `poseOf` — proto tiká
až po `world.step()`.

**SignalBus**: `(entityId, port) → number`. Zpoždění 1 tick (8 ms) je
fyzikálně zanedbatelné a drží graf acyklický. Osa už dnes publikuje
`axle.omega` a čte `motor.targetVelocity`.

## Dva zdroje pravdy: dokument vs. živý stav (fáze 1)

- **SceneDoc** je jediný serializovatelný zdroj pravdy; engine je projekce.
- Každá editace = `Command {label, do: DocOp[], undo: DocOp[]}` →
  `DocumentStore.apply` → tentýž čistý reducer `applyOpsToDoc` v editoru
  i enginu (worker dostává `patch`). **Undo/redo funguje i za běhu.**
- `applyTransient(ops)` = živé gesto bez undo záznamu; na pointer-up se
  commitne jeden Command s undo hodnotou z počátku gesta.
- `EditorController` orchestruje dvoje hodiny: Play si zapamatuje
  `playBaseline`; pauza/krok → worker pošle `stateSync` → fold do docu jako
  undoable „Simulace" (apply se `{send:false}`); Reset = pauza + fold +
  `cmdReplaceDoc(playBaseline)` (undoable). Worker žádný vlastní reset nemá.
- Sémantika `replaceEntity` za běhu zachovává runtime kinematiku (výměna
  materiálu nesmí teleportovat); `setKinematics` nastavuje vždy explicitně.

## Worker protokol (`src/worker/protocol.ts`)

Main→Worker: `init/loadScene(doc)` · `patch(DocOp[])` ·
`control(play|pause|step)` · `setSpeed` · `pointer(dragStart/Move/End)`
(koalescováno ≤1/frame) · `requestStateSync` · `returnBuffer` ·
`setRecordBodyId(id|null)` (F2-C).

Worker→Main: `ready/error` · `idTable` (jen při změně množiny TĚLES; klouby
topologii nemění!) · `snapshot` (≤60 Hz, latest-wins; v pauze po každém
patchi) · `status {running, speed}` · `stateSync` (automaticky po
pauze/kroku) · `plotChunk {samples}` (F2-C, ~10 Hz, drainováno po každé
smyčce).

## Snapshot layout (`src/engine/snapshot/layout.ts`)

Float32, `BODY_STRIDE = 6`: x, y, angle, vx, vy, omega. Pořadí záznamů =
pořadí v idTable. Fáze 3/4 přidají buffery `rays` a `particles`.

## Dokument scény (`src/engine/scene/`)

Zod, `format: 'fyzlab-scene'`, `version: 1` — každá změna tvaru po vydání =
nová verze + krok v `migrate.ts` + **zmrazená fixtura** v `tests/fixtures/`
(testuje se navždy). SI jednotky, y-up, hustota plošná (kg/m²). Entity =
diskriminovaná unie `body | joint`:

- `body`: compound shapes (circle/box/polygon/plane), materiál, vzhled.
  `plane` = nekonečná podlaha (kvádr 4000×200 m, konstanta sdílená
  RigidModule ↔ bodiesLayer ↔ overlay).
- `joint`: `axle` (revolute + volitelný motor) / `spring` / `fixed`.
  `bodyA: null` = kotva ke světu (anchorA je pak ve světových souřadnicích);
  `anchorB` vždy lokálně k tělesu B. Geometrii kotev sdílí
  `scene/jointGeom.ts` (editor hit-test + render).
- `materials.ts`: presety (dřevo, ocel, led, guma, sklo, kámen, polystyren,
  zlato, helium) s reálnými hustotami a doporučenou barvou.
- `mass.ts`: odhad hmotnosti z dokumentu (výchozí tuhost pružiny v editoru).

## Rigid (`src/engine/rigid/RigidModule.ts`)

- **Motor osy**: vlastní regulátor `τ = clamp((Δω/0,5)·τmax, ±τmax)`,
  reakční moment na druhé těleso (akce a reakce). Rapier JS limit momentu
  neexponuje.
- **Pružina = explicitní symplektická síla** v ticku (impulz v kotvách,
  akce i reakce), NE Rapier joint — implicitní pružina Rapieru disipuje
  (SHM by ztratil ~20 % amplitudy za 3 s). Tuhost se klamruje na mez
  stability `ω·dt ≤ 0,5` (k ≤ 0,25·μ/dt²), tlumení na kritické. Kontakty
  mezi spojenými tělesy zůstávají (osa/svár je vypínají).
- **Spánek vypnut** u dynamických těles: pomalé kyvadlo (5° → max 0,27 m/s)
  je celý kyv pod Rapierovým prahem a usnulo by v krajní poloze. CCD
  zapnuto (rychlá tělesa).
- **Vzduch** (`rigid/air.ts`, fáze 2): vztlak F = −ρ·A·g v těžišti +
  kvadratický odpor F = ½·ρ·C_d·d·v² (d = průměr kruhu o stejné ploše,
  C_d = 0,47; odpor klamrován, aby neobrátil rychlost za tick). Žák si
  terminální rychlost spočítá ručně — `terminalVelocity()` je i v testech.
- **Známá mez (kanárek `tests/accuracy/energy.test.ts`)**: restituce
  TGS-soft vrací ~100,4 % dopadové rychlosti → dokonale pružný odraz
  ZÍSKÁVÁ ~0,4 % výšky na odraz (+2,6 %/10 s), nezávisle na tickHz; všechny
  laditelné parametry to zhoršují. Náprava: vlastní restituce přes contact
  eventy (kandidát fáze 2) nebo upstream oprava Rapieru.

## Determinismus

- Rapier build `@dimforge/rapier2d-deterministic-compat`, pinned verze.
- Žádný `Math.random` v enginu (jen seedovaný `Rng`), žádná iterace
  Map/Set tam, kde záleží na pořadí.
- Rapier (TGS-soft) integruje gravitaci po `numSolverIterations` (default 4)
  substepech — `tests/accuracy/freefall.test.ts` je kanárek.
- f32: porovnávat s tolerancí; bit-exact jen dva běhy téhož kódu.

## Editor (`src/editor/`)

- Nástroje (`tools/`): `SelectTool` (tap/​marquee/​move/​rotate/​scale úchopy;
  klouby mají při ťuknutí přednost — kreslí se navrch), tvary
  (box/kruh/rovina/polygon od ruky s Douglas-Peucker + konvexní
  dekompozicí), klouby (`AxleTool`/`FixTool` = tap, `SpringTool` = tah;
  commit na pointer-up, pinch gesto ruší). Výchozí tuhost pružiny podle
  hmotnosti tělesa: prověšení ~15 % délky, tlumení ~15 % kritického.
- `SnapService`: mřížka = minor krok gridu (sleduje zoom), úhly 15°.
- `clipboard.ts` (copy/paste/zrcadlení), `quickActions.ts` (duplikace,
  zmrazit/uvolnit), `hitTest.ts` (top těleso / celý zásobník / kloub dle
  kotvy).
- PointerManager: 2 prsty pinch (ruší gesto nástroje), kolečko zoom,
  prostřední pan, long-press 450 ms (jen dotyk/pero, jen v pauze) i pravé
  tlačítko → `onContextAction` (radiální menu).

## Render (`src/render/`)

- `Interpolator`: poslední 2 snapshoty, alpha z času příchodu.
- `BodiesLayer`: 1 Graphics/těleso, geometrie v `DRAW_SCALE = 100`
  (tesselace), per-frame jen transformy; `poseOf(id)` pro vrstvu kloubů.
- `JointsLayer`: čep ⊙ (+ oblouk = zapnutý motor), zigzag pružina, svorka;
  kreslí se per frame z póz BodiesLayer; seznam kloubů obnovuje editor přes
  `setDocLayers(doc)` po každé změně docu (klouby nejsou v idTable).
- `VectorsLayer`: šipky rychlosti (globální přepínač + per-body
  `showVelocity`), délka = dráha za 0,15 s.
- `OverlayLayer`: náhledy nástrojů, marquee, obrysy výběru, úchopy,
  zvýraznění vybraných kloubů; překresluje se jen při změně verze/zoomu.
- Pozor na Pixi `arc()`: bez `moveTo` na start oblouku dokreslí spojnici
  od posledního bodu cesty.

## Sdílení (`src/share/`)

- `.fyzlab` soubor = čitelný JSON (`fileIO.ts`: download/open/drag-drop).
- Odkaz `#s=` = JSON → deflate-raw → base64url (`urlCodec.ts`); boot z
  hashe v `bootstrap.ts`; varování nad 8 kB. Kamera se při uložení/sdílení
  bere ze skutečného pohledu (`docForSave`).

## Uchopení (drag joint, `src/engine/rigid/dragJoint.ts`)

Kriticky tlumená pružina (ω=20 rad/s, ζ=1), síla omezená 40·m·g. Pohltí
1–2 framy latence worker round-tripu (dotykové tabule). Drag není command —
do docu se promítne až stateSync při pauze.

## Ladění

Dev build: `window.__fyzlab = { camera, renderer, hitTest, hitTestAll,
client, controller, store, state, tools, snap, pointer, loadScene,
docForSave, getDoc }`. Stats badge vpravo nahoře: fps, tick ms, počet těles,
„zpomaleno".
