---
description: Lokální dokončení noční rutiny — z paste-publish manifestu vytvoř větev, soubory, commit, push, otevři draft PR.
---

Jsi lokální assistant v repu C:\Users\bekon\bekovo. Cloud noční rutina (`/nightly-fill`) skončila a uživatel paste-uje její finální manifest do téhle session. Tvoje úloha: **dokončit publish** — větev, commit, push, draft PR. Žádný research, žádné generování obsahu — všechno už je v manifestu.

## 1. Najdi manifest v message kontextu

V uživatelově message je někde `\`\`\`json` blok, který obsahuje manifest s tvarem:

```json
{
  "version": 1,
  "subtopic": "<topicId>--<subtopicId>",
  "topicId": "...",
  "subtopicId": "...",
  "subtopicName": "...",
  "grade": <number>,
  "branch": "routine/nightly-YYYY-MM-DD-...",
  "commit": "Nightly: ... — ...",
  "prTitle": "Nightly: ... (X položek)",
  "prBody": "...markdown...",
  "files": [
    { "path": "src/content/.../*.json", "content": "{...}" },
    ...
  ],
  "ledgerEntry": { "date": "...", "subtopic": "...", "result": "pr-pending", "items": <count> }
}
```

Najdi ten blok, parsuj. Pokud manifest chybí nebo je rozbitý, zastav a vypiš co chybí. Žádné fabrikování dat.

Validační check:
- `version === 1`
- `subtopic` matches `^[a-z0-9-]+--[a-z0-9-]+$`
- `branch` starts with `routine/nightly-`
- `files.length >= 2`
- každý `files[].path` matches `^src/content/(experiments|activities|materials|homework)/[a-z0-9-]+\.json$`
- každý `files[].content` je valid JSON (parse-test)

Pokud cokoli selže → zastav, vypiš co je špatně.

## 2. Pre-flight

```bash
git status --short
```

Pokud working tree není čistý → abortni, vypiš jaké soubory jsou špinavé. Uživatel musí stash/commit/clean nejdřív.

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
```

Ověř že main je clean a aktuální.

## 3. Větev

```bash
git checkout -b <branch>
```

Pokud větev už existuje (lokálně nebo na origin) → abortni. Manifest je z noci, neměla by kolidovat. Pokud kolize → uživatel udělal něco mezitím; bezpečnější neprosadit.

## 4. Soubory

Pro každý objekt v `files[]`:
- Vytvoř adresář pokud chybí (`mkdir -p $(dirname <path>)`)
- Zapiš obsah: `JSON.stringify(JSON.parse(content), null, 2) + '\n'` (re-parse pro validaci + normalize formatting)
- UTF-8

Pokud zápis selže → abortni, smaž větev (`git checkout main && git branch -D <branch>`).

## 5. Append ledger

Načti `.routine/ledger.json` (pokud existuje, jinak začni s `{ lastPicked: null, history: [], skipUntil: {} }`).

Append `manifest.ledgerEntry` do `history[]`. Aktualizuj `lastPicked = ledgerEntry.date`.

Zapiš zpět: `JSON.stringify(ledger, null, 2) + '\n'`.

## 6. Build validation

```bash
npm run build
```

Cloud env build už proběhl, ale lokální Astro může mít drobně jiné podmínky. Pokud selže → abortni, smaž větev, vypiš error.

## 7. Pre-commit sanity

```bash
git status --short
git diff --name-only HEAD
```

Modifikované cesty MUSÍ být jen v:
- `src/content/{experiments,activities,materials,homework}/`
- `.routine/ledger.json`

Cokoli mimo → zastav, abortni.

## 8. Commit

```bash
git add src/content/experiments src/content/activities src/content/materials src/content/homework
git add -f .routine/ledger.json   # gitignored, vynutit
git commit -m "<manifest.commit>"
```

(`.routine/` je v gitignore, ale na routine větvích chceme ledger commitnout — proto `-f`.)

## 9. Push

```bash
git push -u origin <branch>
```

Pokud auth selže → vypiš jasné instrukce: zkontroluj `git credential` a `gh auth status`, případně `gh auth login`. Manuální fallback: dej uživateli URL z output `git push` na vytvoření PR přes web.

## 10. Otevři draft PR

```bash
gh pr create --draft \
  --title "<manifest.prTitle>" \
  --body-file <temp-file s manifest.prBody> \
  --base main \
  --head <branch>
```

Pokud `gh` není v PATH, zkus `C:\Program Files\GitHub CLI\gh.exe`. Pokud `gh auth status` vrací not logged in → vypiš `gh auth login` instrukci pro uživatele a skonči (větev je pushed, PR uživatel otevře přes web URL).

PR body může obsahovat unicode (české znaky, emoji) — `--body-file` to zvládne lépe než `--body` na Windows. Použij Windows path z `cygpath -w` pokud generuješ temp v /tmp.

## 11. Vrať se na main

```bash
git checkout main
```

## 12. Vyplivni shrnutí

```
✅ Publish hotov.

📌 Subtopic: <subtopic>
📊 Položek: <X> v <branch>
🔗 PR: <url>

Otevři PR na mobilu, klikni "Ready for review" → "Squash and merge". Cloudflare nasadí do ~2 min.
```

## Failsafe — když něco selže

- Při jakémkoli erroru: smaž routine větev (`git branch -D <branch>` lokálně, žádný `--force-push` na origin)
- Hlas chybu jasnou hláškou se step kde se to pokazilo
- Nikdy nemodifikuj main přímo
- Nikdy `git push --force`
- Nikdy `git reset --hard` mimo routine větev

## Recap rules

1. Cloud routine **už** vytvořila všechen obsah a validovala build. Tvoje úloha je jen mechanická: parse + write + commit + push + PR.
2. **Žádné** generování nového obsahu, **žádný** web research, **žádné** úpravy textu v manifestu.
3. Pokud manifest je inkompletní/podezřelý → zastav, hlas, neprosaď.
4. Working tree musí být před startem čistý a main aktuální.
