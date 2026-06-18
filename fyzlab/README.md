# FyzLab — fyzikální hřiště

Webový 2D fyzikální sandbox pro výuku (náhrada Algodoo). Mechanika + optika +
kapaliny (v1), později elektrické obvody a další — **všechny domény spolu
interagují**. Fyzikálně přesné (SI jednotky, fixní krok 120 Hz, determinismus,
accuracy testy v CI), dotyk prvotřídně (tablety, interaktivní tabule).

Kompletní plán a roadmapa: schválený plán v `~/.claude/plans/` (viz memory),
technická reference: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Vývoj

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest (accuracy + determinismus)
npm run typecheck  # tsc --noEmit
npm run build      # tsc + vite build → dist/
```

V dev buildu je k dispozici ladicí handle `window.__fyzlab` (camera,
renderer, store, state, tools, pointer, loadScene, docForSave, getDoc…).

## Stav

- **Fáze 0** (chodící kostra) i **Fáze 1** (editor + perzistence) hotové:
  kreslení tvarů, výběr/transformace, klouby (osa s motorem, pružina,
  fixace), panel vlastností s presety materiálů, radiální menu (pravé
  tlačítko / long-press), undo/redo i za běhu, uložení `.fyzlab`, sdílení
  odkazem `#s=`, vektory rychlosti, accuracy testy v CI.
- Další na řadě dle plánu: Fáze 2 — výuková vrstva (přístroje, grafy, FBD,
  predikce) a hloubka mechaniky.

## Nasazení (Cloudflare — jednorázové ruční kroky)

FyzLab je **druhý Cloudflare projekt** vedle hlavního webu, napojený na týž
GitHub repozitář:

1. Cloudflare dashboard → Workers & Pages → **Create** → připojit repo
   `bekousek/bekovo`.
2. Project name: `fyzlab` · **Root directory: `fyzlab`** ·
   Build command: `npm ci && npm run build` · konfigurace se čte
   z `fyzlab/wrangler.jsonc` (assets `./dist`).
3. **Build watch paths**: include `fyzlab/**` (commity mimo fyzlab nespouští
   build). U projektu hlavního webu naopak doplnit exclude `fyzlab/**`.
4. Custom domain: `fyzlab.bekovo.cz` (DNS už je na Cloudflare).

CI (typecheck + testy + build) běží v GitHub Actions:
`.github/workflows/fyzlab-ci.yml`, path-filtrované na `fyzlab/**`.

## Struktura

```
src/engine/   HEADLESS jádro (bez DOM) — běží ve workeru i ve vitestu
src/worker/   protokol Main↔Worker, smyčka 120 Hz, klient
src/render/   PixiJS v8, interpolace snapshotů, vrstvy (tělesa/klouby/vektory)
src/editor/   kamera, pointer/gesta (myš+dotyk), nástroje, commandy, hit-test
src/share/    soubory .fyzlab + sdílení odkazem #s= (deflate → base64url)
src/app/      React chrome (lišty, panel vlastností, radiální menu), i18n (cs)
tests/        accuracy testy proti analytickým řešením, determinismus, fixtury
content/      (od fáze 2) kurikulární scény mapované na témata bekovo.cz
```

Pravidlo závislostí: `app → editor → render → engine` — nikdy obráceně.
Engine nesmí importovat DOM/Pixi/React.
