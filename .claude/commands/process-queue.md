---
description: Načte manifesty z Google Drive folderu bekovo-nightly-queue, pro každý vytvoří větev + push + PR + auto-squash-merge. Žádná uživatelská práce.
---

Jsi lokální assistant v repu `C:\Users\bekon\bekovo`. Tvá úloha: dokončit workflow noční rutiny **bez práce uživatele**. Stáhneš manifesty z Google Drive, vytvoříš PRs, auto-squash-mergne do main.

## 0. Setup

- Pokud `.routine/processed.json` neexistuje, vytvoř ho jako:
  ```json
  {"processedIds": [], "history": []}
  ```

## 1. Pre-flight (s cíleným auto-stash)

Tahle úloha běží automaticky jako naplánovaná úloha — uživatel klidně může mít v repu rozdělanou necommitnutou práci KDEKOLI jinde v repu. **Neabortuj na špinavý tree, ale taky ho neber celý: stashuj výhradně pathspecem přes cesty, které tahle rutina sama zapisuje.**

⚠️ **Nikdy nespouštěj `git stash push -u` bez pathspecu.** Bez pathspecu smete i cizí rozdělanou práci kdekoli v repu — přesně tohle jednou spolklo čerstvě napsaný `AUDIT.md` na 10 dní do stashe `process-queue-auto-*` (audit nález K10; zotavení: `git show <stash>^3:AUDIT.md`). Rutina potřebuje čisté jen tři soubory (viz sanity check v kroku 5e) — nikdy ne celý strom.

```bash
git status --short -- _process_manifests.cjs .routine/ledger.json .routine/processed.json
```

- Pokud je něco z těchto **tří cest** změněné/untracked → odlož JEN je:
  ```bash
  git stash push -u -m "process-queue-auto-<ISO-timestamp>" -- _process_manifests.cjs .routine/ledger.json .routine/processed.json
  ```
  Zapamatuj si `STASHED=1`.
- Jinak → `STASHED=0`.

Zbytek working tree (`.claude/settings.local.json`, `.claude/worktrees/`, a hlavně cokoli cizího jako rozepsané `.md`/scratch soubory) se pathspecem nedotkne — není důvod ho vůbec zkoumat nebo klasifikovat jako „blokující".

```bash
git fetch origin && git checkout main && git pull --ff-only origin main
```

Routine větve teď vzniknou z čistého `origin/main`. Pokud `checkout main` odmítne kvůli lokálním změnám mimo ty tři cesty, to je v pořádku — nejsou routine věc, uživatel je zpracuje sám (viz i failsafe pravidla).

## 2. Drive přístup přes rclone (byte-přesné stahování)

⚠️ **NEpřepisuj base64 z MCP `download_file_content` do souborů ani skriptů.** Reprodukce ~9–25 KB base64 v chatu koruptuje multi-byte UTF-8 (české znaky, pomlčky `–`) — neviditelné slipy / posuny délky, které se projeví až při `JSON.parse`. Tenhle přístup opakovaně selhal napříč sessions. (Viz memory [[process-queue-rclone]].)

Místo toho používej **rclone** (remote `gdrive`, read-only scope; token uložen v `%APPDATA%\rclone\rclone.conf`).

Najdi `rclone.exe` (po instalaci přes winget není v PATH v čerstvém shellu):
```powershell
$RC = (Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter rclone.exe -ErrorAction SilentlyContinue | Select-Object -First 1).FullName
```
Pokud `rclone` chybí nebo remote `gdrive` neexistuje → **skonči s jasnou zprávou uživateli** (potřeba jednorázový OAuth, ten nejde unattended):
```powershell
winget install --id Rclone.Rclone -e --accept-package-agreements --accept-source-agreements
& $RC config create gdrive drive scope=drive.readonly   # otevře prohlížeč, uživatel klikne Povolit
```
Ověř před stahováním: `& $RC listremotes` musí obsahovat `gdrive:`.

## 3. Stáhni manifesty z fronty (rclone, byte-přesně)

Folder ID `1DMJt_qqyhU6NDqZtlaILZLciZCAsd-ym` = `bekovo-nightly-queue`.

Stáhni VŠECHNY soubory z folderu byte-přesně do `_queue/`. rclone sám **dedupuje soubory se stejným názvem a nechá nejnovější verzi** (ohlásí „Duplicate object found in source - ignoring"):
```powershell
New-Item -ItemType Directory -Force "C:\Users\bekon\bekovo\_queue" | Out-Null
& $RC copy "gdrive:" "C:\Users\bekon\bekovo\_queue" --drive-root-folder-id 1DMJt_qqyhU6NDqZtlaILZLciZCAsd-ym
```
(Pro audit/kontrolu dedupu lze vytáhnout i seznam s ID a časy: `& $RC lsjson "gdrive:" --drive-root-folder-id 1DMJt_qqyhU6NDqZtlaILZLciZCAsd-ym --files-only`.)

Soubory mají název `manifest-<manifestId>.json`. Pokud `rclone copy` selže → vypiš jasnou zprávu a skonči.

## 4. Parsuj a validuj manifesty

Pro každý `_queue/manifest-*.json`, jehož `manifestId ∉ processed.json.processedIds`:
- Čti soubor **přímo z disku** (`fs.readFileSync`, byte-přesné — žádné base64) → `JSON.parse`
- Validuj:
  - `version === 1`
  - `manifestId` matches `^\d{4}-\d{2}-\d{2}-[a-z0-9-]+--[a-z0-9-]+$`
  - `branch` starts with `routine/nightly-`
  - `files.length >= 1`
  - **integrity gate: `files.length === ledgerEntry.items`** (chytí oříznuté/poškozené manifesty — nesmí projít dál)
  - každý `files[].path` matches `^src/content/(experiments|activities|materials|homework)/[a-z0-9-]+\.json$`
  - každý `files[].content` parsovatelný jako JSON s poli `id`/`subtopicId`/`topicId`
- Pokud cokoli selže → varování + skip (zaznamenej do processed.json s flagem `invalid` ať to nezkoušíme znovu)
- **Field validation (bezpečnostní gate, ne jen integrity):** `branch` musí sedět na `^routine\/nightly-[a-z0-9-]+$`; `commit` a `prTitle` musí být neprázdné, ≤ 500 znaků a bez control znaků. Tahle tři pole (na rozdíl od `files[].content`, který jde jen do JSON souborů) končí jako argv pro `git`/`gh` — validuj je, i když integrity gate výše už prošel.

Repo `package.json` má `"type":"module"` → pomocné skripty musí mít příponu **`.cjs`**. Hotový procesor, který implementuje sekce 4–5 (čte `_queue/`, integrity gate, field validation, build před mergem): `_process_manifests.cjs` v rootu repa — **tenhle soubor je zdroj pravdy pro přesný tvar kódu** (regeneruj z něj, neopisuj jen z prózy výše). Klíčové vlastnosti, které musí přežít každou regeneraci:
- `branch`/`commit`/`prTitle` jdou do `git`/`gh` výhradně přes `execFileSync(cmd, [...args])` (pole argumentů), **nikdy** přes `execSync` se stringem — vyhne se shellu úplně, takže escapování uvozovek/metaznaků není potřeba a není se čeho bát.

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
