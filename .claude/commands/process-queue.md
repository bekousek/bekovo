---
description: Načte manifesty z Google Drive folderu bekovo-nightly-queue, pro každý vytvoří větev + push + PR + auto-squash-merge. Žádná uživatelská práce.
---

Jsi lokální assistant v repu `C:\Users\bekon\bekovo`. Tvá úloha: dokončit workflow noční rutiny **bez práce uživatele**. Stáhneš manifesty z Google Drive, vytvoříš PRs, auto-squash-mergne do main.

## 0. Setup

- Pokud `.routine/processed.json` neexistuje, vytvoř ho jako:
  ```json
  {"processedIds": [], "history": []}
  ```

## 1. Pre-flight (s auto-stash rozdělané práce)

Tahle úloha běží automaticky jako naplánovaná úloha — uživatel klidně může mít v repu rozdělanou necommitnutou práci. **Neabortuj na špinavý tree; bezpečně ho odlož a na konci vrať.**

```bash
git status --short
```

Spočítej „blokující změny" = cokoli MIMO tyto povolené cesty: `.claude/settings.local.json`, `.claude/worktrees/`, `.routine/processed.json`, `.routine/ledger.json`.

- Pokud blokující změny **existují** → odlož je:
  ```bash
  git stash push -u -m "process-queue-auto-<ISO-timestamp>"
  ```
  Zapamatuj si `STASHED=1`. (`-u` vezme i untracked; gitignored soubory jako `.claude/worktrees/` zůstanou.)
- Pokud žádné nejsou → `STASHED=0`.

```bash
git fetch origin && git checkout main && git pull --ff-only origin main
```

Routine větve teď vzniknou z čistého `origin/main`, nedotčené uživatelovou rozdělanou prací.

## 2. Load Drive tools

Pomocí ToolSearch nahraj nástroje (vše najednou jedním voláním):
- `mcp__f687609e-ae1f-4db1-939a-7b5aee8f6bad__search_files`
- `mcp__f687609e-ae1f-4db1-939a-7b5aee8f6bad__download_file_content` ← **pro čtení manifestů (base64, byte-přesné)**
- `mcp__f687609e-ae1f-4db1-939a-7b5aee8f6bad__get_file_metadata`

⚠️ **NEpoužívej `read_file_content` na manifesty** — vrací „natural language" reprezentaci, která escapuje markdown (`\#`, mojibake u emoji) a výsledek **není validní JSON**. Vždy `download_file_content` → base64 → `Buffer.from(b64,'base64').toString('utf-8')` → `JSON.parse`.

## 3. List manifesty v Drive

Volání:
```
search_files({
  query: "parentId = '1DMJt_qqyhU6NDqZtlaILZLciZCAsd-ym' and title contains 'manifest-'",
  pageSize: 50,
  excludeContentSnippets: true
})
```

Pozn.: Drive search API nepodporuje `trashed = false` v query — folder by neměl obsahovat smazané soubory ale když ano, ručně filtruj v odpovědi.

Folder ID `1DMJt_qqyhU6NDqZtlaILZLciZCAsd-ym` je hardcoded — folder `bekovo-nightly-queue` v Drive uživatele.

Z odpovědi extrahuj seznam `{id, title, modifiedTime}`. Pokud Drive search není dostupný (tool nelze nahrát, nebo error) → vypiš jasnou zprávu uživateli a skonči.

**Dedup duplicitních souborů se stejným manifestId:** Drive může obsahovat víc souborů se stejným `manifestId` (rutina běžela vícekrát, retry, nebo starý + nový běh téhož dne). Seskup soubory podle `manifestId` (z názvu `manifest-<manifestId>.json`) a v každé skupině **ponech jen ten s nejnovějším `modifiedTime`**; starší ignoruj. (Novější = obvykle kvalitnější/úplnější verze.)

Filtruj: pro každý zbylý file extrahuj manifestId. Pokud `manifestId ∈ processed.json.processedIds` → skip (už zpracováno).

Pokud nic nového → vypiš „Žádný nový manifest v Drive folderu." a skonči.

## 4. Stáhni a parsuj manifesty

Pro každý nový file:
- `download_file_content({ fileId: file.id })` → vrací `{ content: <base64> }`. Dekóduj: `Buffer.from(content,'base64').toString('utf-8')` → byte-přesný JSON string.
- `JSON.parse` na dekódovaný string
- Validuj:
  - `version === 1`
  - `manifestId` matches `^\d{4}-\d{2}-\d{2}-[a-z0-9-]+--[a-z0-9-]+$`
  - `branch` starts with `routine/nightly-`
  - `files.length >= 1`
  - každý `files[].path` matches `^src/content/(experiments|activities|materials|homework)/[a-z0-9-]+\.json$`
  - každý `files[].content` parsovatelný jako JSON
- Pokud cokoli selže → varování + skip (ale zaznamenej fileId do processed.json s flagem `invalid` ať to nezkoušíme znovu)

## 5. Process každý manifest

Sekvenčně, pro každý validní:

### 5a. Branch
```bash
git checkout main
git checkout -b "<manifest.branch>"
```
Kolize → skip (`branch-exists-skipped`).

### 5b. Soubory
Pro každý `manifest.files[i]`:
- `mkdir -p` adresář
- Re-parse: `JSON.stringify(JSON.parse(content), null, 2) + '\n'` (normalize)
- Zápis UTF-8

### 5c. Ledger
Update `.routine/ledger.json`: append `manifest.ledgerEntry`, set `lastPicked`. Vytvoř pokud chybí.

### 5d. Build
```bash
npm run build
```
Při selhání → fix nebo smaž problémový soubor, rebuild. Při 2× selhání → smaž větev (`git checkout main && git branch -D <branch>`), pokračuj.

### 5e. Sanity
```bash
git diff --name-only HEAD
```
Modifikované cesty MUSÍ být jen `src/content/{experiments,activities,materials,homework}/` a `.routine/ledger.json`.

### 5f. Commit + push
```bash
git add src/content/experiments src/content/activities src/content/materials src/content/homework
git add -f .routine/ledger.json
git commit -m "<manifest.commit>"
git push -u origin "<manifest.branch>"
```

`gh` cesta: `C:\Program Files\GitHub CLI\gh.exe` pokud není v PATH.
Auth: z `git credential fill protocol=https host=github.com` vytáhni `password`, ulož do env proměnné `GH_TOKEN` jen pro daný gh call (nikam neukládej).

### 5g. PR + auto-squash-merge
```bash
gh pr create --title "<prTitle>" --body-file <temp s prBody> --base main --head "<branch>"
gh pr merge --squash --delete-branch
```

**Ne draft, normální PR.** Po merge se branch smaže.

Pokud merge selže (branch protection apod.) → zalogguj `merge-failed`, ale **označ manifest jako processed** (PR existuje, uživatel zmergne ručně z webu). Ulož PR URL.

### 5h. Mark processed
Append do `processed.json`:
```json
{
  "processedIds": [...existing, "<manifestId>"],
  "history": [
    ...existing,
    {"manifestId": "...", "subtopic": "...", "branch": "...", "prUrl": "...", "merged": <bool>, "processedAt": "<ISO>"}
  ]
}
```

### 5i. Vrátit na main
```bash
git checkout main
git pull --ff-only origin main
```

## 5z. Obnovit odloženou práci (pokud STASHED=1)

Po zpracování všech manifestů, **na čistém main**, vrať uživatelovu rozdělanou práci:

```bash
git stash pop
```

- Když `pop` projde čistě → hotovo, working tree je zpět jak byl.
- Když `pop` narazí na **konflikt** (routine commitla soubor, který měl uživatel rozdělaný — vzácné, routine sahá jen na `src/content/{4}` + ledger) → **nezahazuj stash**. Nech ho být, vyřeš working tree do konzistentního stavu (`git checkout --theirs`/`--ours` dle situace NENÍ automatické — radši stash ponech) a v summary jasně napiš: `⚠️ Rozdělaná práce je bezpečně ve stashi (git stash list) — vyřeš git stash pop ručně.` Nikdy data ze stashe neztrať.

Pokud běh **abortoval v půlce** (chyba), proveď tento restore krok i tak (v failsafe), ať uživatel nezůstane bez své rozdělané práce.

## 6. Summary

```
✅ Process-queue hotov.

Drive folder: bekovo-nightly-queue
Nalezeno: <N> manifest souborů
Po dedupliaci (vs processed.json): <M> nových
Validních: <V>
Skipped (invalid): <I>

Výsledky:
- {N_merged} zmergnuto do main (branche smazané, content nasazen)
- {N_pr_opened} PR otevřeno bez auto-merge (uživatel zmergne ručně)
- {N_skipped} přeskočeno (branch kolize, build-failed, atd.)

Nové PRs:
- <url1> → <subtopic1> ({status})
- <url2> → <subtopic2> ({status})

Cloudflare nasadí merge commits do ~2 min na bekovo.cz.

(Drive manifest soubory ponechány v Drive jako audit trail. Můžeš je tam ručně promazat.)
```

## Failsafe pravidla

- Sekvenčně, ne paralelně
- Při jednom erroru → cleanup té větve, pokračuj na další manifest
- Nikdy `git push --force`, nikdy `git reset --hard` mimo routine větev
- Nikdy nemodifikuj main přímo
- Token z `git credential fill` jen v in-memory env var
- Při kolizi → skip nad force
- **Stash uživatele je posvátný** — pokud jsi v pre-flightu stashoval rozdělanou práci, MUSÍŠ ji na konci (i při abortu) vrátit (`git stash pop`). Při konfliktu stash raději ponech a nahlas, než bys cokoli ztratil.
