---
description: Auto-scrape claude.ai routine page přes Chrome MCP, sebere všechny nové manifesty, vytvoří PR a auto-squash-merge.
---

Jsi lokální assistant v repu `C:\Users\bekon\bekovo`. Tvá úloha: doběhnout celý workflow noční rutiny **bez práce uživatele** — sám si přines manifesty z claude.ai, sám je zprocesuj do PR, sám je squash-mergni do main.

## 0. Setup state

- Pokud `.routine/queue.md` **neexistuje**, vytvoř ho s tímto template obsahem:

```markdown
# Bekovo nightly queue

Tento dokument je fronta pro hromadné zpracování výstupů z noční rutiny bekovo.cz.

## Co dělat

Spusť `/process-queue` v Claude Code v tomto repu. CC automaticky:
1. Přes Chrome MCP scrapne claude.ai routine page a vytáhne všechny nové manifesty
2. (Volitelně) přečte i ručně vložené manifesty níže v sekci Manifesty
3. Pro každý nový manifest vytvoří routine větev, soubory, commit, push, PR a squash-mergne do main
4. Tento soubor po dokončení vyresetuje

## Manifesty (ruční fallback)

<!-- Sem můžeš ručně vložit ```json blok s manifestem, pokud nechceš čekat na Chrome MCP scrape. -->
<!-- /process-queue najde a zpracuje i tyto. -->
```

- Pokud `.routine/processed.json` **neexistuje**, vytvoř ho jako:
  ```json
  {"processedIds": [], "checkedRunIds": [], "history": []}
  ```

## 1. Pre-flight

```bash
git status --short
```

Pokud working tree obsahuje cokoli kromě `.claude/settings.local.json`, `.claude/worktrees/`, `.routine/queue.md`, `.routine/processed.json` → **abortni** a vypiš co je špinavé.

```bash
git fetch origin && git checkout main && git pull --ff-only origin main
```

## 2. Auto-scrape claude.ai přes Chrome MCP

Nahraj nástroje `mcp__Claude_in_Chrome__list_connected_browsers`, `mcp__Claude_in_Chrome__tabs_context_mcp`, `mcp__Claude_in_Chrome__navigate`, `mcp__Claude_in_Chrome__get_page_text`, `mcp__Claude_in_Chrome__read_page`, `mcp__Claude_in_Chrome__browser_batch`, `mcp__Claude_in_Chrome__tabs_create_mcp` přes ToolSearch (najednou).

Zkontroluj `list_connected_browsers`. Pokud žádný browser není připojen:
- Vypiš: „Chrome MCP rozšíření není připojené. Buď ho připoj (chrome.google.com → Claude in Chrome extension), nebo manuálně vlož manifesty do .routine/queue.md a spusť mě znovu."
- Přeskoč na krok 4 (fallback na queue.md).

Pokud je připojen:
- Získej `tabs_context_mcp` (s `createIfEmpty: true`) — dostaneš `tabId`.
- Navigate na `https://claude.ai/code/routines/trig_01TC312RwvG9vVV2XXoLBBGy`.
- Počkej 3–4 sekundy (SPA load), pak `read_page` se `filter: "all"` — najdi všechny `link` elementy v sekci „Runs", které mají href `/code/session_*`.
- Z accessibility tree vyparsuj seznam runs s jejich session ID a statusem (Completed / Failed). **Ignoruj Failed** runs.
- Pro každý **Completed** run, jehož `session_id` NENÍ v `processed.json.checkedRunIds`:
  - Navigate na `https://claude.ai/code/<session_id>?trigger=trig_01TC312RwvG9vVV2XXoLBBGy`
  - Počkej 3–5 s pro SPA load
  - `get_page_text` na tabId
  - Najdi blok mezi `---PASTE-START---` a `---PASTE-END---` (nebo legacy `---PASTE-PUBLISH START---` / `---PASTE-PUBLISH END---`)
  - V tom bloku najdi `\`\`\`json ... \`\`\`` (může chybět — staré v2 runs vyplývaly placeholder bez JSON)
  - Pokud najdeš JSON s validním tvarem manifestu (má `version`, `subtopic`, `files`, atd.), přidej do `scrapedManifests[]`
  - Bez ohledu na výsledek scrape, **přidej `session_id` do `checkedRunIds`** (ať to nezkoumáme znovu)
- Limit: max 20 runs scrapovaných v jednom volání (anti-runaway). Pokud je víc, zpracuj nejstarší a zbytek nech na příště.

Vypiš shrnutí: „Scraped {N_total} runs, {N_with_manifest} mělo validní manifest, {N_no_manifest} byly broken/placeholder, {N_already_checked} přeskočeno (už checked)."

## 3. Načti manifesty z queue.md (ruční fallback)

I když Chrome MCP fungoval, **přečti** `.routine/queue.md` a najdi tam `\`\`\`json` bloky v sekci „Manifesty". Pokud nějaké jsou, parsuj a přidej do `manualManifests[]`.

## 4. Spoj a deduplikuj

`allManifests = [...scrapedManifests, ...manualManifests]`

Pro každý:
- Validuj: `version === 1`, `subtopic` regex, `branch` regex, `files.length >= 1`, každý `files[].path` v povolené cestě, každý `files[].content` parsovatelný JSON
- Pokud nemá `manifestId`, zkonstruuj jako `${ledgerEntry.date}-${subtopic}`
- Pokud `manifestId` už je v `processed.json.processedIds` → **skipni** (už zpracováno dřív)
- Pokud nějakou validaci nesplní → varování + skip

Pokud `toProcess.length === 0`:
- Ulož `processed.json` (s updatovanými checkedRunIds)
- Vyresetuj queue.md na template
- Vypiš: „Žádný nový manifest. Cloud rutina (next run: zítra ~04:00) zatím nic nového nevyrobila, nebo všechno bylo už zpracováno."
- Skonči

## 5. Process každý manifest

Pro každý v `toProcess[]`:

### 5a. Branch
```bash
git checkout main
git checkout -b "<manifest.branch>"
```
Pokud existuje na origin (`git ls-remote --heads origin "<manifest.branch>"`) → skip ten manifest (`branch-exists-skipped`), vrať se na main, pokračuj.

### 5b. Soubory
Pro každý `files[i]`:
- mkdir -p adresář
- Re-parse JSON.parse(content) → JSON.stringify(obj, null, 2) + '\n' zápis
- Při chybě → smaž větev, pokračuj na další manifest

### 5c. Ledger
Update `.routine/ledger.json`: append manifest.ledgerEntry, set lastPicked.

### 5d. Build validation
```bash
npm run build
```
Při selhání → fix (typicky problematické unicode v string) nebo smaž problémový soubor, rebuild. Při 2× selhání → smaž větev, pokračuj.

### 5e. Pre-commit sanity
```bash
git diff --name-only HEAD
```
Modifikované cesty MUSÍ být jen v `src/content/{experiments,activities,materials,homework}/` a `.routine/ledger.json`.

### 5f. Commit + push
```bash
git add src/content/experiments src/content/activities src/content/materials src/content/homework
git add -f .routine/ledger.json
git commit -m "<manifest.commit>"
git push -u origin "<manifest.branch>"
```

Pokud `gh` není na PATH, použij `C:\Program Files\GitHub CLI\gh.exe`. Pro auth vytáhni token z `git credential fill` a předej jako `GH_TOKEN` env proměnnou jen pro daný gh call (nikam neukládat, nevypisovat).

### 5g. PR + auto-squash-merge
```bash
gh pr create --title "<manifest.prTitle>" --body-file <temp s manifest.prBody> --base main --head "<manifest.branch>"
gh pr merge --squash --delete-branch
```

**Důležité: PR NENÍ draft** — chceme přímé mergnutí. Pokud `gh pr merge` selže (např. branch protection), zalogguj `merge-failed` ale **označ manifest jako processed** (PR existuje, uživatel zmergne ručně). PR URL ulož do `history[]`.

### 5h. Zaznamenat jako processed
Append do `processed.json.processedIds`: `manifestId`.
Append do `history[]`:
```json
{"manifestId": "...", "subtopic": "...", "branch": "...", "prUrl": "...", "merged": true/false, "processedAt": "<ISO>"}
```

### 5i. Vrátit na main
```bash
git checkout main
git pull --ff-only origin main  # ať máš zmergnutý obsah lokálně
```

## 6. Reset queue.md + ulož processed.json

Přepiš `.routine/queue.md` na **template obsah** ze sekce 0.
Ulož `.routine/processed.json` se všemi aktualizovanými poli (processedIds, checkedRunIds, history).

## 7. Summary

```
✅ Process-queue hotov.

Scrape z claude.ai: {N_total} runs prohlédnuto, {N_with_manifest} validních manifestů
Ručně vloženo do queue.md: {N_manual}
Po dedupliaci: {N_to_process} ke zpracování

Výsledky:
- {N_merged} manifestů úspěšně zmergnuto do main (PRs uzavřené, branch smazaná)
- {N_pr_opened} PR otevřeno, ale merge selhal (uživatel mergne ručně)
- {N_skipped} přeskočeno (chyby, kolize, build-failed)

Nové PR / merge commits:
- <url1> → <subtopic1> ({status})
- <url2> → <subtopic2> ({status})

Cloudflare Pages nasadí merge commit do ~2 min na bekovo.cz.
```

## Failsafe pravidla

- Jeden manifest zpracovávej v každém okamžiku (sekvenčně, ne paralelně)
- Při erroru u jednoho manifestu → cleanup té větve, pokračuj na další
- Nikdy `git push --force`, nikdy `git reset --hard` mimo routine větev
- Nikdy nemodifikuj main přímo (jen checkout + pull --ff-only + merge přes gh)
- Token z `git credential fill` jen v in-memory env var, nikam neukládat ani neukazovat
- Při kolizi preferuj **skip nad force**
- Chrome MCP fail je OK — slash command pokračuje s manuálním fallbackem (queue.md)
