# Audit projektu bekovo.cz + FyzLab

**Datum:** 2. 7. 2026
**Rozsah:** hlavní web bekovo.cz (Astro, kořen repa) a aplikace FyzLab (`fyzlab/`)
**Metodika:** statická analýza kódu, `npm audit` + `npm outdated` obou aplikací, kontrola git historie na secrets (vzory klíčů, přidané `.env`/`credentials` soubory, posledních 200 revizí), měření lokálního build výstupu (`dist/` obou aplikací), kontrola CI workflow.
**Limitace:** živý web vrací automatizovaným nástrojům HTTP 403 (Cloudflare bot ochrana), takže produkční HTTP hlavičky a skutečný obsah produkce nešlo ověřit — viz Otevřené otázky.

---

## 1. Prozkoumání

### 1.1 Struktura repozitáře

Monorepo se dvěma nezávislými aplikacemi + obsahový/automatizační aparát:

```
/                      Astro 6 web bekovo.cz (package.json, astro.config.mjs, wrangler.jsonc)
├─ src/pages/          statické routy: index, [topic]/, [topic]/[subtopic]/{zapis,priprava,
│                      generator,pokusy,aktivity,materialy,ukoly,testy}
├─ src/content/        1000+ JSON souborů v 8 kolekcích, validace Zod (src/content.config.ts)
├─ src/components/     Astro komponenty + 2 React ostrovy (NotebookExport, ExerciseGenerator)
├─ public/             fonty, applety (vanilla JS), notebook-svgs/pdfs (generované CI),
│                      sborniky/ (PDF mimo git, kopírované skriptem), lesson-prep SVG
├─ scripts/            compile-latex.mjs, coverage.mjs, ai-pipeline/ + ~25 jednorázových skriptů
├─ fyzlab/             samostatná aplikace (vlastní package.json, CI, Cloudflare projekt)
│  ├─ src/engine/      headless fyzikální jádro (Rapier2D, běží ve workeru)
│  ├─ src/{worker,render,editor,app,share}/   PixiJS render, nástroje, React chrome
│  └─ tests/           27 testovacích souborů (accuracy, determinismus, schéma, perf)
├─ .github/workflows/  compile-latex.yml (LaTeX→SVG/PDF, push do main), fyzlab-ci.yml
├─ _process_manifests.cjs + _queue/ + .routine/   noční obsahová pipeline
└─ AGENTS.md           dokumentace pipeline pro AI rutiny
```

### 1.2 Tech stack

| | **bekovo.cz** | **FyzLab** |
|---|---|---|
| Framework | Astro 6.1.2 (100% statický výstup) | Vite 7 + React 19 (SPA/PWA) |
| Jazyk | TypeScript (strict), .astro | TypeScript (strict) |
| Styly | Tailwind CSS 4 | Tailwind CSS 4 |
| Klíčové knihovny | React 19 (ostrovy), KaTeX, jspdf, pdf-lib, html-to-image | Rapier2D (deterministic), PixiJS 8, zod 4, zustand, uPlot |
| Obsah | JSON kolekce + Zod schémata | scény `.fyzlab` (JSON + Zod) / URL `#s=` |
| Testy | žádné | Vitest, 27 souborů, běží v CI |
| Hosting | Cloudflare (statické assety z `dist/`, `wrangler.jsonc`) | Cloudflare, druhý projekt, doména fyzlab.bekovo.cz |
| Build výstup | 503 MB / 1 079 souborů (z toho 422 MB sborníky PDF) | 10 MB (z toho ~6 MB source mapy) |

### 1.3 Nasazení a CI/CD

- **bekovo.cz**: Cloudflare buildí z GitHub repa (`bekousek/bekovo`, **veřejné**); `wrangler.jsonc` deklaruje čistě statické assety z `./dist`. Žádný GitHub Actions build/test gate na PR — jediné workflow pro hlavní web je `compile-latex.yml` (kompiluje LaTeX zápisy → SVG/PDF a **pushuje přímo do main** jako bot).
- **FyzLab**: `fyzlab-ci.yml` na PR/push (path-filtr `fyzlab/**`): typecheck → vitest → build. Deploy přes Cloudflare (root directory `fyzlab`, build watch paths).
- **Noční obsahová pipeline** (jen hlavní web): cloud rutina ve 4:00 uloží JSON manifest do Google Drive folderu → lokální `/process-queue` (`_process_manifests.cjs`) stáhne manifesty rclonem, vytvoří větev, zapíše soubory, **lokálně** spustí `npm run build` jako validaci, pushne, otevře PR a **automaticky ho squash-merguje do main** bez lidské kontroly a bez CI na straně GitHubu.

### 1.4 README a konfigurace

- Kořenový [README.md](README.md) je **nezměněný Astro starter** — neodpovídá projektu (skutečná dokumentace je v AGENTS.md). [fyzlab/README.md](fyzlab/README.md) je naopak vzorný (vývoj, nasazení, architektura, pravidlo závislostí vrstev).
- `tsconfig.json` extends `astro/tsconfigs/strict` ✓; fyzlab `tsconfig` strict ✓.
- `.gitignore` správně kryje `.env`, `dist/`, velké PDF. Žádný `.env` v repu ani v historii.

---

## 2. Nálezy podle oblastí

Formát: **[ID] Nález — závažnost — doporučení.** Závažnosti: 🔴 kritická / 🟠 vysoká / 🟡 střední / ⚪ nízká.

### 2.1 Bezpečnost

**[B1] 🟠 Zranitelné závislosti hlavního webu (`npm audit`).** Astro 6.1.2 má 5 známých advisories, z toho 2 high: *Reflected XSS via unescaped slot name* (< 6.3.3) a *Host header SSRF in prerendered error page fetch* (< 6.4.6); dále transitivní **defu** (prototype pollution, high) a `@babel/core` (low). Reálná exploitovatelnost je u čistě statického buildu výrazně nižší (SSRF/slot XSS cílí na SSR runtime), ale oprava je triviální minor bump.
→ `npm update astro` (na ≥ 6.4.8) + `npm audit fix` v kořeni. FyzLab má jediný low nález (esbuild, jen dev server) — `npm audit fix` ve `fyzlab/`.

**[B2] 🟠 Důvěryhodnostní řetěz noční pipeline: Drive → lokální exekuce → auto-merge do produkce.** [_process_manifests.cjs](_process_manifests.cjs) interpoluje pole z manifestů stažených z Google Drive přímo do shellových příkazů: `manifest.branch` bez jakékoli validace (řádky 120–121, 205), `manifest.commit`/`prTitle` jen s naivním escapováním uvozovek `replace(/"/g, '\\"')` (řádky 203, 228), které na Windows (cmd.exe přes `execSync`) není spolehlivé — metaznaky `&`, `|`, `%` zůstávají aktivní. Integrity gate (řádky 92–113) validuje pouze `files[].path` a obsah, **ne** `branch`/`commit`/`prTitle`. Protože repo je veřejné a AGENTS.md zveřejňuje ID Drive folderu, závisí bezpečnost celé smyčky (vč. spouštění příkazů na tvém PC a auto-merge do produkčního webu) čistě na ACL toho Drive folderu.
→ (a) Ověř, že folder `bekovo-nightly-queue` je sdílený jen pro tvůj účet (žádné „anyone with the link can edit"). (b) Validuj `branch` regexem `^routine\/nightly-[a-z0-9-]+$` a délku/znakovou sadu `commit`/`prTitle`. (c) Nahraď interpolaci `execSync(...)` za `execFileSync('git', ['checkout','-b', branch])` (argumenty polem = žádný shell). Totéž pro `gh` (title lze předat souborem jako u body).

**[B3] 🟡 AI obsah se merguje do produkce bez lidské kontroly.** Auto-squash-merge je vědomé rozhodnutí (AGENTS.md), jediná brána je lokální `npm run build` (Zod schémata). Schémata ale nekontrolují věcnou správnost ani URL cíle — do webu pro děti se tak mohou dostat chybné či nevhodné odkazy.
→ Minimálně: CI link-checker nových URL v PR + namátková kontrola. Ideálně vypnout auto-merge a nechat PR den otevřené (stačí ranní klik).

**[B4] 🟡 Chybí bezpečnostní HTTP hlavičky.** V `public/` není `_headers`; web tedy poběží jen s výchozími hlavičkami Cloudflare (produkci nebylo možné ověřit kvůli 403 pro fetchery). Chybí CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. Pro statický web bez formulářů je dopad omezený, ale CSP je levná obrana do hloubky (obzvlášť když stránky vkládají Google Docs iframy a CDN CSS).
→ Přidat `public/_headers` (obě aplikace): `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, CSP nejdřív v Report-Only režimu.

**[B5] ⚪ XSS povrch je malý a pod kontrolou.** `set:html` se používá jen pro vlastní build-time obsah ([zapis.astro:49–53](src/pages/[topic]/[subtopic]/zapis.astro), [priprava.astro:50](src/pages/[topic]/[subtopic]/priprava.astro)) — LaTeX SVG z vlastního CI a ručně psané přípravy; noční rutina do těchto polí zapisovat nesmí (do-not-touch list) a její výstupy se renderují escapované. KaTeX se volá s `throwOnError:false` nad vlastním obsahem. FyzLab nemá jediný `innerHTML`/`dangerouslySetInnerHTML`. Bez akce; jen udržet trust boundary (nikdy nepovolit rutině zápis do `subtopics/**`).

**[B6] ⚪ KaTeX CSS z CDN bez SRI.** `cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css` na 3 stránkách bez `integrity` atributu — kompromitace CDN by mohla injektovat CSS. Řeší se self-hostingem (viz V2).

**[B7] ⚪ Secrets: čisto.** Žádné klíče v kódu, ve skriptech ani v git historii (kontrola vzorů `sk-ant-`, `AIza…`, `ghp_…`, `xox…`; žádný `.env` nikdy commitnutý). GH token si `_process_manifests.cjs` bere za běhu z `git credential fill` a neloguje ho ✓.

**[B8] ⚪ Veřejné repo obsahuje lokální metadata.** `.claude/settings.local.json` (typicky lokální soubor) je trackovaný a veřejně ukazuje lokální cesty (`C:\Users\bekon\…`), používané nástroje a Drive folder ID (to je i v AGENTS.md). Nejsou to credentials, ale zbytečná expozice.
→ `git rm --cached .claude/settings.local.json` + do `.gitignore`; zvážit, zda AGENTS.md musí obsahovat folder ID (stačí název).

**[B9] 🟡 FyzLab: dekodér sdílených scén bez limitů (dekompresní bomba).** [urlCodec.ts](fyzlab/src/share/urlCodec.ts) dekomprimuje `#s=` payload bez stropu na výstupní velikost; malý odkaz může nafouknout stovky MB JSON → zamrznutí/OOM tabu oběti, která klikne na nepřátelský odkaz. Zod schéma následně validuje, ale `entities` a `polygon.points` nemají horní limit ([schema.ts:47,311](fyzlab/src/engine/scene/schema.ts)) → i validní scéna s 10⁶ entitami položí worker.
→ V `pump()` limitovat načtené bajty (např. 5 MB) a do schématu přidat `.max()` (`entities` ≤ ~2000, `points` ≤ ~256). Jde o client-side DoS, ne únik dat — proto jen 🟡.

### 2.2 Výkon

**[V1] 🟠 `dist/` má 503 MB, z toho 422 MB (84 %) jsou PDF sborníků třetích stran.** Změřeno: `dist/sborniky` 422 MB (35 souborů), `notebook-svgs` 31 MB, `notebook-pdfs` 8 MB, `_astro` (JS+CSS) 2 MB, zbytek HTML. Největší soubor `vnuf-2015.pdf` má **23 MB — těsně pod limitem Cloudflare 25 MB/soubor**; první větší sborník deploy shodí. Sborníky se do `public/sborniky/` kopírují lokálním skriptem z gitignorované složky „Externí materiály" — protože zdroj **není v gitu**, Cloudflare CI build je mít nemůže: buď se nasazuje lokálně (a produkce nese 422 MB cizích PDF), nebo na produkci všechny odkazy `SourceBadge` typu `/sborniky/*.pdf` vracejí 404. Ověření z auditu selhalo na 403 (bot ochrana). Viz i právní stránku v [D4]. Počet souborů (1 079) je hluboko pod limitem 20 000 ✓.
→ Ověřit produkci (`https://bekovo.cz/sborniky/dilny-heureky-2011.pdf` z běžného prohlížeče). Rozhodnout: (a) PDF nedistribuovat a `source.pdf` odkazy vést na oficiální zdroje (`vnuf.cz` má sborníky online), nebo (b) vědomě hostovat a přidat `robots.txt` disallow + ověřit licence + hlídat 25MB limit.

**[V2] 🟡 KaTeX CSS z CDN + nesoulad verzí.** Stránky zápis/generátor/příprava linkují `katex@0.16.11` CSS z jsdelivr, zatímco bundlovaný KaTeX JS je `0.16.44` — riziko drobných rozdílů metrik fontů a hlavně: render-blocking request na třetí stranu, který na filtrované školní síti nemusí projít (matematika se pak rozpadne, viz [E3]).
→ `import 'katex/dist/katex.min.css'` v ostrovech, resp. lokální kopie CSS + fontů (KaTeX je už v node_modules). Zruší CDN závislost, srovná verze, zrychlí první render.

**[V3] 🟡 Zápisové stránky vkládají celé LaTeX SVG inline do HTML — nejtěžší mají jednotky MB.** [zapis.astro:47–51](src/pages/[topic]/[subtopic]/zapis.astro) renderuje `latexSvg` (výstup dvisvgm s vloženými fonty) přímo do dokumentu. Změřeno: `astronomie/vznik-a-zanik-hvezd/zapis` **3,1 MB**, `mikrosvet/atom-a-jeho-modely` 1,9 MB, `astronomie/vesmir` 1,4 MB, `astronomie/dalsi-vesmirna-telesa` 1,3 MB (další už ≤ 0,85 MB, většina webu je malá). Brotli přenos zmenší, ale parse 3MB HTML na školním tabletu znát je.
→ U stránek nad ~500 kB servírovat SVG jako `<img src="/notebook-svgs/{topic}--{subtopic}.svg">` — soubory už v `dist/notebook-svgs/` jsou, jen se na ně odkázat místo inline vkládání; prohlížeč je cachuje mezi návštěvami.

**[V4] ⚪ JS bundly hlavního webu jsou zdravé.** Těžké knihovny se importují dynamicky až při akci (pdf-lib 158 kB, jspdf 386 kB, html-to-image) a React ostrovy jen na stránkách, kde jsou (`client:visible`). Největší chunky: `index…js` 527 kB, `jspdf` 386 kB, `katex` 259 kB, `html2canvas` 201 kB (mrtvý — viz [Z2]), `client` (React) 186 kB. Běžná obsahová stránka nese jen HTML+CSS. Bez zásahu; volitelně prověřit, co tvoří 527kB chunk (`npx vite-bundle-visualizer` nad Astro buildem).

**[V5] ⚪ Roboto TTF 2×515 kB pro PDF export.** Fetch až při exportu ✓; subset (latin-ext) by srazil na ~100 kB. Nízká priorita.

**[V6] ⚪ FyzLab: `plotBuffer` roste bez limitu.** [uiStore.ts:153](fyzlab/src/app/store/uiStore.ts) — `[...s.plotBuffer, ...samples]` při dlouhém záznamu (desítky minut při 120 Hz) alokuje kvadraticky a žere paměť.
→ Kruhový buffer / strop (např. 50k vzorků) s dropem nejstarších.

**[V7] ⚪ FyzLab service worker nikdy nepromazává staré assety.** [sw.js](fyzlab/public/sw.js) cache-first + `c.put` každé odpovědi do `fyzlab-v1`; obsahově hashované soubory ze starých deployů se hromadí do bump verze cache.
→ Při `activate` promazat položky, které nejsou v aktuálním asset manifestu, nebo prostě zvedat verzi cache při release.

**[V8] ⚪ FyzLab build: 10 MB, z toho ~6 MB source mapy nasazované na produkci.** `sourcemap: true` ve [vite.config.ts](fyzlab/vite.config.ts) → `index.js.map` 3,3 MB + `sim.worker.js.map` 2,4 MB jdou do deploye. U veřejného repa nejde o únik, jen o váhu (mapy se stahují až při otevření DevTools). `sim.worker.js` má 1,8 MB kvůli WASM Rapieru inlinovanému jako base64 (varianta `-compat`) — jednorázová cena, SW ji cachuje; hlavní bundle 692 kB, renderer chunky (WebGL/WebGPU/Canvas) správně oddělené ✓.
→ Volitelně `sourcemap: 'hidden'` (mapy se negenerují do odkazů) nebo ponechat — vědomá volba.

### 2.3 Kvalita kódu a architektura

**[K1] 🔴 Chybné převodní faktory jednotek v datech generátoru příkladů.** Kód počítá `zobrazená hodnota = hodnota_v_SI / factor` ([problemGenerator.ts:127](src/components/generator/engine/problemGenerator.ts)), tj. `factor` = „kolik základních jednotek je 1 alternativní jednotka". Tomu odpovídá 90 % dat (km=1000, cm=0,01, min=60, h=3600, kWh=3 600 000 …), ale:
- [rychlost.json](src/content/formulas/rychlost.json): `km/h factor 3.6` — **obráceně** (správně 0,2778 jako v [draha.json](src/content/formulas/draha.json) a [kineticka-energie.json](src/content/formulas/kineticka-energie.json)). Důsledek: rychlost 20 m/s se v zadání vypíše jako „5,56 km/h" místo 72 km/h — chyba 12,96×.
- [hustota.json](src/content/formulas/hustota.json): `g/cm³ factor 0.001` — **obráceně** (správně 1000). Důsledek: 800 kg/m³ se vypíše jako „800 000 g/cm³" — chyba 10⁶.
Učitel/žák, který převede správně, dostane jiný výsledek než zobrazené „Řešení"; zadání jsou fyzikálně nesmyslná. To je jádro hodnoty webu → kritické.
→ Opravit oba faktory (0.2778, resp. 1000) a přidat automatickou kontrolu (viz [T2]).

**[K2] 🟠 Zaokrouhlení převedené hodnoty rozbíjí konzistenci zadání ↔ řešení.** [problemGenerator.ts:127](src/components/generator/engine/problemGenerator.ts): `displayValue = roundNice(value / factor)` — u nedekadických faktorů (min=60, h=3600) po zaokrouhlení neplatí `display × factor = value`. Př.: t = 847 s → „14,1 min"; žák počítá s 846 s, řešení je ale spočtené z 847 s. U dekadických faktorů se to neprojeví, u času běžně ano.
→ Generovat hodnotu tak, aby byla „hezká" v **zobrazené** jednotce (napřed vylosovat alt jednotku a hezkou hodnotu v ní, pak přepočítat do SI pro výpočet), nebo po zaokrouhlení zpětně přepočítat `value = display × factor`.

**[K3] 🟡 `computeUnknown` odvozuje tvar vzorce heuristikou nad LaTeX řetězcem.** [problemGenerator.ts:25–76](src/components/generator/engine/problemGenerator.ts): přítomnost `\cdot`/`\frac` + **pevné pořadí proměnných** (`vars[0] = vars[1] * vars[2]`) rozhoduje o výpočtu; nepodporovaný tvar tiše vrátí 0. Přidání vzorce s jiným zápisem (např. součet, mocnina jinde než v poli `power`) vyrobí tichou nulu v řešení.
→ Do schématu formulas přidat explicitní `kind: 'product' | 'quotient'` (+ role proměnných) a heuristiku nechat jen jako fallback s hlasitou chybou; doplnit unit testy.

**[K4] 🟡 Repozitář je zaplevelený jednorázovými skripty a obsahovým balastem.** ~19 `scripts/_batch-*.mjs`, `scripts/ai-pipeline/*` one-offs, `_queue/` (zpracované manifesty), `banka_zdroju_fyzika.md`, `Contacts/ OneDrive/ Searches/` (gitignorované Windows složky přímo v kořeni pracovní kopie). Zvyšuje kognitivní zátěž a riziko omylem spuštěného skriptu.
→ Přesunout jednorázové skripty do `scripts/archive/` (nebo smazat — jsou v historii), `_queue/` po zpracování mazat (processed.json stačí), README v `scripts/` s popisem co je živé.

**[K5] ⚪ Duplicitní `getStaticPaths` logika.** `lib/paths.ts` existuje, ale [index.astro](src/pages/[topic]/[subtopic]/index.astro), [pokusy.astro](src/pages/[topic]/[subtopic]/pokusy.astro), [materialy.astro](src/pages/[topic]/[subtopic]/materialy.astro), aktivity, ukoly a generator si tu samou dvojitou smyčku píší znovu (liší se jen přibalenou kolekcí).
→ Rozšířit `getSubtopicPaths(extra?: (topic, subtopic) => props)` a sjednotit.

**[K6] ⚪ Duplicitní inline CSS `.notebook-entry`.** ~60 řádků stylů se opakuje v [zapis.astro](src/pages/[topic]/[subtopic]/zapis.astro) a [priprava.astro](src/pages/[topic]/[subtopic]/priprava.astro) (drobně rozjeté — příležitost k rozjezdu vizuálu).
→ Vytáhnout do `src/styles/notebook.css` a importovat na obou místech.

**[K7] ⚪ Křehká vazba dynamických Tailwind tříd.** [index.astro:29](src/pages/index.astro) skládá `bg-grade-${grade}` template literalem — třída se do CSS dostane jen proto, že [TopicCard.astro:12–17](src/components/TopicCard.astro) obsahuje literály. Smazání/úprava TopicCard by tiše rozbila tečky na hlavní stránce.
→ Použít stejný literálový mapping i v index.astro (3 řádky).

**[K8] ⚪ Kořenový README je Astro starter.** Nováček (nebo ty za rok) se o skutečné struktuře dozví jen z AGENTS.md.
→ Přepsat README: co je projekt, jak spustit obě aplikace, odkaz na AGENTS.md a fyzlab/README.

**[K9] ⚪ FyzLab architektura: vzorná.** Vrstvení `app → editor → render → engine` bez porušení (engine bez DOM importů — ověřeno absencí `document`/`window` referencí v grepu), deterministický engine testovaný proti analytickým řešením, čisté migrace scén s verzováním, undo/redo přes reducer `applyOpsToDoc`. Žádná akce — jen pochvala a držet kurz.

**[K10] 🟡 Naplánovaná rutina `/process-queue` stashuje cizí rozpracované soubory.** Skript při pre-flightu dělá `git stash push -u`, který smete **jakoukoli** untracked rozdělanou práci v repu — během tohoto auditu tak v 09:19 zmizel čerstvě napsaný `AUDIT.md` do stashe `process-queue-auto-20260702T071913Z` (ověřeno: `git ls-tree stash@{0}^3` obsahuje právě `AUDIT.md`). Stashe se navíc hromadí (v seznamu jsou i z 8. 6. a 18. 6.) a nikdo je nepopuje — pop by teď navíc konfliktoval s obnovenými soubory. Riziko: tichá „ztráta" rozdělané práce, zmatení uživatele i agentů.
→ Stashovat jen s pathspecem na soubory, které rutina skutečně potřebuje čisté (jednou už to tak v historii oprávnění bylo: `git stash push -m … -- _process_manifests.cjs`), ideálně běžet v odděleném worktree; staré `process-queue-auto-*` stashe projít a smazat (`git stash drop`), aktuální stash@{0} lze po obnově AUDIT.md zahodit.

### 2.4 Error handling

**[E1] 🟡 Selhání PDF exportu je pro uživatele neviditelné.** [NotebookExport.tsx:307–312](src/components/NotebookExport.tsx): `catch → console.error`, overlay zmizí a nic se nestane — učitel na projektoru neví, co se stalo.
→ `alert()`/inline hláška „Export selhal, zkuste to znovu" (stav `error` už komponenta umí zobrazit u `exporting`).

**[E2] 🟡 Export příkladů nemá catch vůbec + fetch fontů nekontroluje status.** [ExerciseGenerator.tsx:268–386](src/components/generator/ExerciseGenerator.tsx): `handleExportPdf` má jen `finally`; když selže fetch `/fonts/Roboto-*.ttf` (`loadFontBase64` nekontroluje `res.ok` — 404 by vrátilo HTML místo fontu), vznikne unhandled rejection a rozbité PDF bez vysvětlení.
→ Obalit try/catch s uživatelskou hláškou; v `loadFontBase64` kontrolovat `res.ok`.

**[E3] 🟡 Výpadek CDN = rozbitá matematika.** Když jsdelivr neprojde (offline, školní filtr), KaTeX JS (bundlovaný) vyrenderuje HTML, ale bez CSS se zobrazí rozsypaný text. Řeší self-hosting [V2].

**[E4] ⚪ Chybí vlastní 404 stránka.** V `src/pages/` není `404.astro` — Cloudflare vrátí generickou chybu bez navigace zpět.
→ Přidat jednoduchou `404.astro` s odkazem na přehled témat.

**[E5] ⚪ FyzLab: chyba dekódování scény z URL jen do konzole.** [bootstrap.ts:59–65](fyzlab/src/app/bootstrap.ts) při nevalidním `#s=` tiše načte demo — příjemce rozbitého odkazu neví, že o scénu přišel (toast mechanismus přitom existuje — používá ho drag&drop, řádek 265–268).
→ `useUiStore.getState().setToast(t('toastLoadError'))` i ve větvi URL.

**[E6] ⚪ FyzLab: chyby workeru jen do konzole.** [bootstrap.ts:131–133](fyzlab/src/app/bootstrap.ts) `client.onError → console.error`. Pokud simulace spadne, UI mlčí.
→ Toast + zastavit běh.

**[E7] ⚪ Build-time chování je správně přísné.** Nevalidní obsahový JSON shodí `astro build` (Zod) — chyby se nedostanou na web; noční pipeline build gate má ✓.

### 2.5 Přístupnost (a11y)

**[A1] 🟡 Nedostatečný kontrast pomocných textů.** `text-gray-400` (#9ca3af na bílé ≈ 2,5:1) pro datum přípravy ([priprava.astro:77–81](src/pages/[topic]/[subtopic]/priprava.astro)); FyzLab `text-slate-400` pro nápovědu nástroje na `bg-slate-100` ≈ 2,5:1 ([App.tsx:37](fyzlab/src/app/App.tsx)) — pod AA (4,5:1).
→ Posunout na gray-500/slate-600 (gray-500 na bílé ≈ 4,8:1 vyhoví).

**[A2] 🟡 Zápisy jako SVG obrázky nemají textovou alternativu.** LaTeX zápisy se renderují jako SVG křivky (dvisvgm) — pro čtečky obrazovky je hlavní studijní obsah webu neviditelný (a mimochodem ani neindexovatelný, viz [S3]). Krátkodobě je k dispozici LaTeX zdroj (tlačítko kopírovat).
→ Krátkodobě: `role="img"` + `aria-label` s názvem podkapitoly na kontejner. Dlouhodobě: paralelní HTML/MathML render (KaTeX umí MathML výstup) — velká práce, viz plán L.

**[A3] ⚪ Dekorativní emoji bez `aria-hidden`.** [TopicCard.astro:31](src/components/TopicCard.astro), sekce v [index.astro](src/pages/[topic]/[subtopic]/index.astro), [EmptyState.astro:11](src/components/EmptyState.astro) — čtečky čtou „zkumavka", „atom symbol"… ([SourceBadge.astro](src/components/SourceBadge.astro) to má správně.)
→ `<span aria-hidden="true">` na čistě dekorativní emoji.

**[A4] ⚪ Aktivní záložka navigace bez `aria-current`.** [SubtopicNav.astro:28–40](src/components/SubtopicNav.astro) odlišuje aktivní sekci jen vizuálně.
→ `aria-current={currentSection === section.id ? 'page' : undefined}`.

**[A5] 🟡 FyzLab blokuje zoom.** [index.html:5–8](fyzlab/index.html): `maximum-scale=1, user-scalable=no` — WCAG 1.4.4; slabozraký žák si nepřiblíží UI (iOS to zčásti ignoruje, Android ne). U canvas aplikace je to obhajitelné kvůli gestům, ale panely/dialogy tím trpí.
→ Zvážit odstranění `user-scalable=no` — pinch-zoom plátna už řeší PointerManager přes `touch-action: none` na canvas hostu, takže blokace na úrovni viewportu je pravděpodobně zbytečná; otestovat na tabletu.

**[A6] ⚪ FyzLab toolbar je vzorný** (aria-label, aria-pressed, 48px cíle, klávesové zkratky). Dialogy (Help/Library) — neověřen focus trap a Escape (otevřená otázka).

**[A7] ⚪ Struktura nadpisů a landmarks na hlavním webu jsou v pořádku** (h1→h2→h3, `<nav aria-label="Breadcrumb">`, `<main>`); iframe má `title` ✓. Chybí skip-link — při krátké hlavičce nízká priorita.

### 2.6 SEO

**[S1] 🟡 Chybí `sitemap.xml` i `robots.txt`** (ověřeno v dist i public obou aplikací). Při ~800 vygenerovaných stránkách zbytečná ztráta.
→ `npx astro add sitemap` + nastavit `site: 'https://bekovo.cz'` v [astro.config.mjs](astro.config.mjs); ruční `public/robots.txt` s odkazem na sitemapu (a případný disallow `/sborniky/`).

**[S2] 🟡 Meta description je všude stejná a chybí canonical/OG.** [BaseLayout.astro:9,16](src/layouts/BaseLayout.astro) — default „Fyzika pro ZŠ - učební materiály" na všech ~800 stránkách (stránky předávají jen `title`); žádný `<link rel="canonical">`, žádné OG/Twitter tagy (FyzLab je má kompletní ✓).
→ Předávat `description` z pages (např. název podkapitoly + sekce), do BaseLayout doplnit canonical z `Astro.url` a základní OG.

**[S3] 🟡 Hlavní obsah (zápisy) není indexovatelný text** — viz [A2]; vyhledávače vidí jen název podkapitoly, ne látku. MathML/HTML alternativa by pomohla i zde.

**[S4] 🟠 Cloudflare bot ochrana vrací 403 — ověřit, že neblokuje vyhledávače.** Audit fetch dostal 403 na všech URL. Pokud je zapnutý agresivní režim (Bot Fight Mode může omezovat i legitimní crawlery), web nemusí být indexovaný vůbec.
→ Zkontrolovat Google Search Console (pokrytí/poslední crawl) a Cloudflare Security nastavení; verified bots povolit.

**[S5] ⚪ FyzLab og:image je SVG** ([index.html:30](fyzlab/index.html)) — většina platforem (FB, X, Slack…) SVG u OG nepodporuje → náhled se nezobrazí.
→ Vyrenderovat `og.png` 1200×630.

### 2.7 Testy

**[T1] 🟠 Hlavní web nemá žádné testy ani CI gate na build.** Jediná pojistka je build v noční pipeline (lokálně) a Zod schémata. PR (i ruční) může rozbít web bez varování; auto-merge běží bez CI.
→ Minimální workflow: na PR `npm ci && npm run build` (10 min práce, viz plán, krok 11). Postupně vitest na generator engine.

**[T2] 🟠 Chybí validace fyzikální konzistence dat** — přesně tam, kde audit našel chyby ([K1]).
→ Build-time skript / test: pro každou `altUnit` known-good tabulka převodů (km=1000 m, km/h=0,2778 m/s, g/cm³=1000 kg/m³, …) + round-trip kontrola `roundNice(value/factor)*factor ≈ value` v rozsahu `range`. Odhalí obě nalezené chyby i budoucí překlepy.

**[T3] ⚪ FyzLab testy: silné.** 27 souborů — accuracy proti analytickým řešením (volný pád, kyvadlo, SHM, vrhy, optika, kapaliny…), determinismus, schéma/migrace/fixtury, perf smoke test; běží v CI na každý PR. Chybí jen testy React chrome (nízká hodnota) — bez akce.

### 2.8 Závislosti

**[Z1] 🟠 Zastaralé s bezpečnostním dopadem:** astro 6.1.2 → 6.4.8 (viz [B1]). Ostatní patch/minor: tailwind 4.3.2, react 19.2.7, katex 0.16.47 — bezpečné bumpnout.

**[Z2] ⚪ Mrtvá závislost `html2canvas`** — v kódu se nikde nepoužívá (nahrazena `html-to-image`), přesto se kvůli dynamickému importu uvnitř jspdf emituje 201kB chunk do každého deploye.
→ `npm rm html2canvas`.

**[Z3] ⚪ Dev nástroje v `dependencies`:** `pdfjs-dist` (používá jen `scripts/ai-pipeline/extract-pdf.ts`), `tsx`, `@types/react`, `@types/react-dom` patří do `devDependencies`. U statického buildu jen hygiena.

**[Z4] ⚪ Major verze k naplánování:** Astro 7, KaTeX 0.17, pdfjs-dist 6, @astrojs/react 6; FyzLab: vite 8, typescript 6. Nespěchá; dělat po jedné s buildem/testy.

**[Z5] ⚪ FyzLab: závislosti minimální a čerstvé**; `@dimforge/rapier2d-deterministic-compat` pinnutý exaktně (0.19.3) kvůli determinismu — správně (bumpnout jen vědomě s re-baseline accuracy testů).

### 2.9 Responzivita a kompatibilita

**[R1] ⚪ Hlavní web:** mobile-first Tailwind grid, korektní viewport, LaTeX SVG škáluje na 100 % šířky (záměr popsaný v komentáři [zapis.astro:69–77](src/pages/[topic]/[subtopic]/zapis.astro)) ✓. Riziko: široké tabulky v `.notebook-entry` nemají `overflow-x` wrapper → na mobilu můžou roztáhnout stránku. → Otestovat na úzkém displeji; případně `.notebook-entry table { display:block; overflow-x:auto }`.

**[R2] ⚪ Google Docs iframe má pevnou výšku 800 px** ([GoogleDocEmbed.astro:27](src/components/GoogleDocEmbed.astro)) — na mobilu dvojité scrollování; funkční, ne pěkné. Odkaz „Otevřít v novém okně" to zachraňuje.

**[R3] 🟡 FyzLab cílí na moderní prohlížeče — zdokumentovat minimum.** `build.target: es2022`, `CompressionStream` (Safari ≥ 16.4, Chrome ≥ 80, FF ≥ 113), ES module workers (FF ≥ 114). Starší školní iPady/Chromebooky aplikaci nespustí bez jasné hlášky.
→ Doplnit do README minimální verze; zvážit runtime detekci (`'CompressionStream' in window`) s čitelnou hláškou místo bílé obrazovky.

**[R4] ⚪ FyzLab dotykové ovládání je prvotřídní záměr i provedení** (PointerManager gesta, long-press radiální menu, 48px cíle, `viewport-fit=cover`, SW offline režim pro školní wifi). Manifest PWA má jen SVG ikonu — iOS vyžaduje `apple-touch-icon` PNG pro instalaci na plochu (⚪ → přidat 180×180 PNG).

### 2.10 Data a soukromí

**[D1] ⚪ Hlavní web nesbírá nic.** Žádné analytics, cookies, formuláře, localStorage. Jediné third-party odchody: CSS+fonty z jsdelivr (IP + UA návštěvníka, vč. žáků) a vložené Google Docs iframy. Odkazy ven mají `rel="noopener noreferrer"` ✓.

**[D2] 🟡 Google Docs iframy = přenos dat žáků Googlu bez souhlasu.** Stránky `priprava`/`testy` načítají `docs.google.com` iframe automaticky (Google vidí IP/UA/referer každého návštěvníka, může nastavit cookies). Pro školní publikum v EU je čistší click-to-load.
→ Placeholder „Načíst dokument z Google Docs" + načtení iframe až po kliknutí (pár řádek; `loading="lazy"` už je, nestačí — iframe v viewportu se načte).

**[D3] ⚪ FyzLab je vzorový:** nula third-party requestů, scéna žije jen v URL hashi (hash se neposílá na server — správně okomentováno v [urlCodec.ts](fyzlab/src/share/urlCodec.ts)), SW cache jen same-origin GET.

**[D4] 🟠 Právní: hostování PDF sborníků třetích stran.** Pokud jsou `/sborniky/*.pdf` na produkci (viz [V1]), web veřejně redistribuuje kompletní publikace (Dílny Heuréky, VNUF, Elixír, „Paper Science") — autorská práva držitelů nejsou v repu nijak doložena. Riziko: takedown/konflikt s komunitou, ze které web čerpá.
→ Preferovat odkazy na oficiální zdroje (`vnuf.cz/sbornik`, elixir…); hostovat jen s výslovným souhlasem.

**[D5] ⚪ `driveFileUrl` odkazy:** materiály odkazují na soubory na tvém Google Drive — kdokoli s odkazem je vidí (záměr). Jen připomínka: nedávat do těchto souborů nic osobního (jsou de facto veřejné, odkazy jsou ve veřejném repu).

---

## 3. Prioritizace

### 🔴 Kritické

| # | Nález | Reálné riziko |
|---|---|---|
| K1 | Obrácené převodní faktory `rychlost.json` (km/h) a `hustota.json` (g/cm³) | Generátor tiskne fyzikálně nesmyslná zadání („5,56 km/h" místo 72 km/h; „800 000 g/cm³"). Učitel je rozdá žákům, řešení nesedí s korektním postupem — web učí děti špatnou fyziku a ztrácí důvěryhodnost. |

### 🟠 Vysoké

| # | Nález | Reálné riziko |
|---|---|---|
| V1+D4 | Sborníky: 422 MB z 503 MB deploye, mimo git, největší 23 MB (limit CF 25 MB) | Buď stovky mrtvých odkazů `/sborniky/*.pdf` na produkci (rozbité zdroje u pokusů), nebo veřejná redistribuce cizích publikací bez doložené licence → takedown/konflikt s autory; první sborník > 25 MB navíc shodí deploy. |
| B1/Z1 | Astro 6.1.2 s high advisories (XSS/SSRF), defu prototype pollution | U statického webu je exploit nepravděpodobný, ale jde o jednořádkový bump; ignorování zvyšuje dluh a rozšiřuje okno pro budoucí SSR/island funkce. |
| B2 | Nevalidovaná pole manifestů (`branch`, `commit`, `prTitle`) → `execSync`; veřejně známé Drive folder ID | Pokud by Drive folder neměl přísné ACL (nebo cloud rutina začala halucinovat), útočník/vadný manifest může spustit příkazy na tvém PC a auto-mergem měnit produkční web. Dnes chráněno jen ACL folderu. |
| K2 | Zaokrouhlovací drift u převodů času (min/h) | Občasná zadání, kde správně počítající žák dostane jiný výsledek než „Řešení" — frustrace, reklamace u učitele. |
| T1+T2 | Žádný CI gate + žádná validace fyzikální konzistence dat | Chyby typu K1 vznikají a přežívají nepozorovaně; rozbití buildu se pozná až po merge. |
| S4 | Neověřený dopad Cloudflare bot ochrany na crawlery | Pokud 403 dostávají i vyhledávače, web je neviditelný ve vyhledávání — pro veřejný vzdělávací web zásadní. |

### 🟡 Střední

B3 (auto-merge bez review), B4 (chybějící security hlavičky), B9 (FyzLab dekompresní bomba/limity scén), V2+E3 (KaTeX CDN: výkon, offline, verze, SRI), V3 (3,1MB zápisové HTML — inline SVG), K3 (heuristika computeUnknown), K10 (rutina stashuje cizí rozpracované soubory), E1+E2 (neviditelné chyby exportů), A1 (kontrast), A2+S3 (zápisy nečitelné pro čtečky/vyhledávače), A5 (blokovaný zoom FyzLab), S1+S2 (sitemap/robots/canonical/descriptions), D2 (Google iframy bez souhlasu), R3 (nezdokumentované minimum prohlížečů), K4 (balast v repu).

### ⚪ Nízké

Z2 (html2canvas), Z3 (dev deps v dependencies), Z4 (major upgrady), V8 (source mapy v deployi FyzLabu), E4 (404), E5+E6 (FyzLab toasty), A3 (emoji aria-hidden), A4 (aria-current), A6 (focus trap dialogů — ověřit), K5–K8 (DRY, README, Tailwind literály), V5–V7 (fonty subset, plotBuffer, SW cache), R1+R2 (tabulky/iframe na mobilu), R4 (apple-touch-icon), S5 (og.png), B6 (SRI), B8 (settings.local.json v repu), D5 (hygiena Drive odkazů).

---

## 4. Plán vylepšení

Náročnost: **S** < 1 h · **M** = hodiny · **L** = dny.

### 4.1 Rychlé opravy (do 1 h každá)

| Krok | Náročnost | Proč |
|---|---|---|
| 1. Opravit `rychlost.json` km/h → `0.2778` a `hustota.json` g/cm³ → `1000`; přegenerovat pár příkladů pro kontrolu | **S** | 🔴 K1 — web aktivně generuje špatnou fyziku; oprava = 2 čísla. |
| 2. `npm update astro && npm audit fix` (kořen) + `npm audit fix` (fyzlab) | **S** | 🟠 B1 — zavře všechny aktuální advisories minor bumpem. |
| 3. Ověřit produkci: existuje `bekovo.cz/sborniky/….pdf`? + zkontrolovat Search Console / Cloudflare bot nastavení | **S** | 🟠 V1/D4/S4 — rozhodne o dalším postupu (krok 10) a odhalí případnou neviditelnost pro Google. |
| 4. Ověřit ACL Drive folderu `bekovo-nightly-queue` (sdílení jen vlastník) | **S** | 🟠 B2 — dnes jediná obrana celé pipeline. |
| 5. Self-host KaTeX CSS (`import 'katex/dist/katex.min.css'` místo CDN linku na 3 stránkách) | **S** | 🟡 V2/E3/B6 — srovná verze, funguje offline/za filtrem, ruší CDN tracking i SRI otázku. |
| 6. `npm rm html2canvas`; přesunout `tsx`, `pdfjs-dist`, `@types/*` do devDependencies | **S** | ⚪ Z2/Z3 — menší deploy, čistší závislosti. |
| 7. `npx astro add sitemap` + `site` v config + `public/robots.txt` | **S** | 🟡 S1 — základ indexace ~800 stránek. |
| 8. Try/catch + uživatelská hláška u obou PDF exportů; `res.ok` check u fontů | **S** | 🟡 E1/E2 — chyby přestanou být neviditelné. |
| 9. Drobné a11y: `aria-hidden` na emoji, `aria-current` v SubtopicNav, gray-400→gray-500, FyzLab hint slate-400→slate-600, toast při chybě `#s=` | **S** | 🟡/⚪ A1/A3/A4/E5 — levné, plošné zlepšení. |

### 4.2 Střednědobé (hodiny)

| Krok | Náročnost | Proč |
|---|---|---|
| 10. Vyřešit sborníky dle výsledku kroku 3: odkazy na oficiální online zdroje (preferováno) nebo doložit souhlasy + robots disallow + hlídat 25MB limit | **M** | 🟠 V1/D4 — právní čistota a konzistence zdrojových odkazů. |
| 11. CI workflow pro hlavní web: na PR `npm ci && npm run build`; volitelně link-check nových URL z manifestů | **M** | 🟠 T1/B3 — gate před auto-merge; zachytí rozbití webu i mrtvé odkazy. |
| 12. Zpevnit `_process_manifests.cjs`: `execFileSync` s poli argumentů, regex validace `branch`/`commit`/`prTitle`; stash jen s pathspecem (nebo běh ve worktree) | **M** | 🟠 B2 + 🟡 K10 — odstraní injection povrch i polykání cizí práce. |
| 13. Validace dat generátoru: build-time test převodních faktorů (known-good tabulka + round-trip) + unit testy `roundNice`/`computeUnknown`/konverzí | **M** | 🟠 T2/K1/K2 — aby se K1 nemohlo opakovat. |
| 14. Oprava driftu převodů (generovat hezkou hodnotu v zobrazené jednotce) | **M** | 🟠 K2 — zadání ↔ řešení vždy konzistentní. |
| 15. `public/_headers` pro obě aplikace (nosniff, Referrer-Policy, Permissions-Policy, CSP report-only → enforce) | **M** | 🟡 B4 — obrana do hloubky za pár řádek konfigurace. |
| 16. Google Docs click-to-load placeholder | **M** | 🟡 D2 — soukromí žáků, méně third-party požadavků. |
| 17. FyzLab: limit dekomprese (např. 5 MB) + `.max()` na `entities`/`points`; hláška pro nepodporované prohlížeče | **M** | 🟡 B9/R3 — robustnost proti hostilním odkazům a starým zařízením. |
| 18. Per-page meta description + canonical + OG na hlavním webu; FyzLab `og.png` + `apple-touch-icon` | **M** | 🟡 S2/S5/R4 — kompletní meta vrstva. |
| 19. Zápisy nad ~500 kB přepnout z inline SVG na `<img src="/notebook-svgs/…">` (nejtěžší: vznik-a-zanik-hvezd 3,1 MB, atom-a-jeho-modely 1,9 MB, vesmir 1,4 MB, dalsi-vesmirna-telesa 1,3 MB) | **M** | 🟡 V3 — rychlejší načítání nejtěžších stránek, cache SVG mezi návštěvami. |
| 20. Konsolidace: `getSubtopicPaths` pro všechny sekce, sdílený `notebook.css`, literálové grade mapy v index.astro, `404.astro`, přepsat README, úklid `scripts/` + `_queue/` + starých `process-queue-auto-*` stashů, untrack `.claude/settings.local.json` | **M** | ⚪ K4–K8/K10/E4/B8 — údržbovost; jednotlivosti jsou S, dohromady M. |

### 4.3 Dlouhodobý refaktoring (dny)

| Krok | Náročnost | Proč |
|---|---|---|
| 21. Deklarativní model vzorců (`kind: product/quotient`, role proměnných) místo LaTeX heuristiky; heuristika jen jako fallback s chybou | **L** | 🟡 K3 — umožní bezpečně přidávat vzorce (součty, mocniny) bez tichých nul. |
| 22. Přístupná/indexovatelná verze zápisů: KaTeX MathML/HTML render vedle SVG (nebo generovat z LaTeXu strukturovaný HTML) | **L** | 🟡 A2/S3 — hlavní obsah webu čitelný pro čtečky i vyhledávače. |
| 23. Vlna major upgradů: Astro 7, KaTeX 0.17, @astrojs/react 6, pdfjs 6; FyzLab vite 8/TS 6 (po jednom, s buildem/testy) | **L** | ⚪ Z4 — držet krok, dokud jsou migrace malé. |
| 24. Zvážit review krok v noční pipeline (PR otevřený do ranního schválení) nebo aspoň obsahový lint (URL whitelist domén z banky zdrojů) | **L** | 🟡 B3 — kvalita a bezpečnost obsahu pro děti bez ztráty automatizace. |
| 25. FyzLab dle vlastního plánu (fáze 2+); přidat focus trap/Escape audit dialogů, SW cache pruning, plotBuffer strop | **L** | ⚪ K9/A6/V6/V7 — pokračování dobře rozjetého projektu. |

---

## 5. Otevřené otázky (nešly ověřit z kódu)

1. **Jsou `/sborniky/*.pdf` na produkci?** Fetch vrací 403 (bot ochrana) — ověřit z prohlížeče. Rozhoduje mezi „mrtvé odkazy" a „autorskoprávní riziko" (krok 3/10).
2. **Blokuje Cloudflare ochrana i vyhledávače?** 403 pro automatizované klienty; zkontrolovat Search Console a seznam verified bots.
3. **Jak přesně probíhá produkční deploy hlavního webu** — Cloudflare Workers Builds z gitu, nebo občas lokální `npx wrangler deploy`? (Lokální deploy by vysvětlil přítomnost sborníků na produkci; v allowlistu oprávnění je `npx wrangler:*`.)
4. **ACL Drive folderu `bekovo-nightly-queue`** — kdo může zapisovat? (Jediná dnešní obrana pipeline, viz B2.)
5. **FyzLab dialogy: focus trap a Escape** — neověřeno čtením (HelpDialog/LibraryDialog); otestovat klávesnicí.
6. **Minimální podporovaná zařízení ve škole** (verze iPadOS/Chrome na žákovských zařízeních) — určuje, jak urgentní je R3.
7. **Licence obsahu přebíraného nočními manifesty** — popisy jsou parafráze se zdrojovými odkazy (v pořádku), ale stojí za rozhodnutí, zda uvádět licenci webu samotného.
