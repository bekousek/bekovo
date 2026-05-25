---
description: Hromadně zpracuj všechny manifesty z .routine/queue.md — pro každý vytvoř větev, push a draft PR, pak queue.md vyresetuj.
---

Jsi lokální assistant v repu `C:\Users\bekon\bekovo`. Tvá úloha: zpracovat hromadně všechny noční manifesty, které uživatel nakumuloval v `.routine/queue.md`, do GitHub draft PRs.

## 0. Setup

Pokud `.routine/queue.md` **neexistuje**:
- Vytvoř ho s následujícím **template obsahem**:

```markdown
# Bekovo nightly queue

Tento dokument je fronta pro hromadné zpracování výstupů z noční rutiny bekovo.cz.

## Co dělat — instrukce pro Claude Code

Spusť slash command `/process-queue` v tomto repu. CC:
1. Najde všechny manifesty (```json bloky) níže
2. Pro každý vytvoří routine větev, soubory, commit, push a draft PR
3. Pomocí .routine/processed.json se vyhne duplicitě, kdybys spustil opakovaně
4. Po dokončení vyresetuje tento soubor do výchozího stavu (jen tato hlavička)
5. Vrátí seznam URL otevřených PR

(Pokud nemáš slash command po ruce, zkopíruj celý tento dokument do CC chatu — model pochopí z hlavičky.)

## Jak nasypat nové manifesty

Otevři https://claude.ai/code/routines/trig_01TC312RwvG9vVV2XXoLBBGy
Klikni na poslední run, najdi v jeho výstupu blok mezi `--PASTE-PUBLISH START--` a `--PASTE-PUBLISH END--`.
Skopíruj ten ```json blok (jen samotný JSON manifest) a vlož ho do sekce **Manifesty** níže.
Můžeš jich naskládat libovolně mnoho — i z více nocí. /process-queue je všechny zpracuje naráz.

## Manifesty z noční rutiny

<!-- Sem se příchází manifesty z cloud rutiny. Každý je samostatný ```json blok. -->
<!-- Pokud je sekce prázdná, rutina nic nevyrobila NEBO bylo všechno už zpracováno. -->
```

- Pokud `.routine/processed.json` neexistuje, vytvoř ho jako `{"processedIds": [], "history": []}`.

Pak pokračuj. Pokud queue.md vznikl jen teď a je prázdný, vypiš zprávu „Queue je prázdná. Naplň ji manifesty z claude.ai (viz hlavička souboru) a spusť mě znovu." a skonči.

## 1. Pre-flight kontroly

```bash
git status --short
```

Pokud working tree obsahuje cokoli kromě `.claude/settings.local.json` (modifikace povolena), `.claude/worktrees/` (untracked OK), `.routine/queue.md` (modifikace povolena) a `.routine/processed.json` (modifikace povolena) → **abortni** a vypiš co je špinavé. Uživatel musí stash/commit/clean nejdřív.

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
```

Ověř že main je clean a aktuální.

## 2. Parse manifests

Načti `.routine/queue.md`. Najdi všechny `\`\`\`json` bloky uvnitř sekce **Manifesty z noční rutiny** (ne jinde v souboru).

Pro každý blok zkus `JSON.parse`. Pokud parse selže, **vypiš varování s číslem bloku a obsahem** ale pokračuj s ostatními (uživatel může mít rozbitý jeden blok kvůli copy-paste chybě).

Pro každý parsed manifest validuj:
- `version === 1`
- `subtopic` matches `^[a-z0-9-]+--[a-z0-9-]+$`
- `manifestId` existuje (jinak ho zkonstruuj jako `${date}-${subtopic}` z manifest.ledgerEntry.date a manifest.subtopic — pro zpětnou kompatibilitu)
- `branch` starts with `routine/nightly-`
- `files.length >= 1`
- každý `files[].path` matches `^src/content/(experiments|activities|materials|homework)/[a-z0-9-]+\.json$`
- každý `files[].content` parsable JSON

Špatné manifesty preskoč s varováním, ne abort.

## 3. Deduplikace

Načti `.routine/processed.json`. Pro každý manifest:
- Pokud `manifest.manifestId ∈ processed.processedIds` → **přeskoč** (už zpracováno), zalogguj.
- Jinak: zařaď do fronty `toProcess[]`.

Pokud `toProcess.length === 0`:
- Vypiš seznam manifestů které byly skipnuty (s důvodem "už zpracováno")
- Vyresetuj queue.md zpět na template (krok 7) — uživatel paste-uje znovu už zpracované, vyčistíme
- Skonči

## 4. Process každý manifest

Pro každý manifest v `toProcess[]` (pořadí pasted-in):

### 4a. Branch
```bash
git checkout main  # ujisti se že jsi na main
git checkout -b "<manifest.branch>"
```

Pokud větev už existuje lokálně nebo na origin (`git ls-remote --heads origin "<manifest.branch>"`):
- Zalogguj jako konflikt (`branch-exists-skipped`)
- Vrať se na main, pokračuj na další manifest

### 4b. Files
Pro každý `manifest.files[i]`:
- `mkdir -p` adresář
- Re-parse `JSON.parse(content)` → `JSON.stringify(obj, null, 2) + '\n'` zápis (normalize formatting)
- Pokud zápis selže → smaž větev (`git checkout main && git branch -D <branch>`), pokračuj na další manifest

### 4c. Ledger
Načti `.routine/ledger.json` (vytvoř pokud chybí: `{lastPicked: null, history: [], skipUntil: {}}`).
Append `manifest.ledgerEntry` do `history[]`, aktualizuj `lastPicked = ledgerEntry.date`.
Zapiš zpět.

### 4d. Build validation
```bash
npm run build
```

Pokud selže:
- Lokalizuj soubor z chyby
- Pokud možno → oprav (např. trailing whitespace) → rebuild
- Pokud rebuild znovu selže → `git checkout main && git branch -D <branch>`, pokračuj na další manifest (`build-failed`)

### 4e. Pre-commit sanity
```bash
git diff --name-only HEAD
```

Modifikované cesty MUSÍ být jen v:
- `src/content/{experiments,activities,materials,homework}/`
- `.routine/ledger.json`

Cokoli mimo → zruš `git checkout -- <file>` a pokračuj jen s povolenými.

### 4f. Commit + push
```bash
git add src/content/experiments src/content/activities src/content/materials src/content/homework
git add -f .routine/ledger.json
git commit -m "<manifest.commit>"
git push -u origin "<manifest.branch>"
```

Pokud push selže (auth issue) → vypiš jasnou hlášku, **neoznačuj manifest jako processed**, pokračuj na další manifest.

### 4g. Otevři draft PR
```bash
# Použij path "C:\Program Files\GitHub CLI\gh.exe" pokud gh není v PATH
gh pr create --draft \
  --title "<manifest.prTitle>" \
  --body-file <temp-file s manifest.prBody> \
  --base main \
  --head "<manifest.branch>"
```

Sebrat URL PR z stdout.

Pokud `gh auth status` říká not logged in, použij dočasně credential z `git credential fill protocol=https host=github.com` jako `GH_TOKEN` env var pro daný `gh pr create` volání (token nikam neukládej).

Pokud PR creation selže → vypiš `pr-creation-failed` + URL větve na origin pro manuální otevření PR. **Neoznačuj manifest jako processed** (uživatel ho zpracuje znovu po opravě auth).

### 4h. Zaznamenat jako processed
Append do `.routine/processed.json`:
```json
{
  "processedIds": [...existing, "<manifestId>"],
  "history": [
    ...existing,
    {
      "manifestId": "<id>",
      "subtopic": "<subtopic>",
      "branch": "<branch>",
      "prUrl": "<url>",
      "processedAt": "<ISO timestamp>"
    }
  ]
}
```

### 4i. Vrátit se na main
```bash
git checkout main
```

## 5. Reset queue.md

Po zpracování všech manifestů přepíš `.routine/queue.md` zpět na **template obsah** ze sekce 0.

## 6. Summary report

Vypiš shrnutí ve formě:

```
✅ Process-queue hotov.

Zpracováno: <N> nových manifestů
Přeskočeno (už zpracováno): <M>
Přeskočeno (chyby): <K>

Nové PRs:
- <url1>  →  <subtopic1> (<items1> položek)
- <url2>  →  <subtopic2> (<items2> položek)
...

Queue.md vyresetován do výchozího stavu.

➡ Otevři PRs na GitHubu, klikni "Ready for review" + "Squash and merge" u každého. Cloudflare nasadí.
```

## Failsafe pravidla

- Při jakémkoli erroru u jednoho manifestu: cleanup té větve, **pokračuj na další manifest** (nemarní celou frontu kvůli jednomu)
- Nikdy `git push --force`, nikdy `git reset --hard` mimo routine větve
- Nikdy nemodifikuj main přímo (jen `git checkout main` a `git pull --ff-only`)
- Token z `git credential fill` použij jen v in-memory env var pro daný `gh` call, nikam neukládej a nevypisuj
- Při kolizi (branch už existuje, manifestId už processed) preferuj **skip nad force**
