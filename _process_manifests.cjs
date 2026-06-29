'use strict';
// Process the nightly content queue. Reads manifests as BYTE-EXACT local files
// downloaded via rclone into _queue/ (no base64 transcription). For each new
// manifest: branch -> write content files -> ledger -> build -> commit -> push
// -> PR -> squash-merge. Sequential. Integrity-gated. Never touches main directly.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const BASE = 'C:\\Users\\bekon\\bekovo';
const QDIR = path.join(BASE, '_queue');
const GH_PATH = 'C:\\Program Files\\GitHub CLI\\gh.exe';

// New manifests to process, in date order. driveId kept for the audit trail in
// processed.json. file = byte-exact local copy in _queue/ (deduped to newest).
const MANIFESTS = [
  { driveId: '', file: 'manifest-2026-06-23-optika--opticke-pristroje.json' },
  { driveId: '', file: 'manifest-2026-06-24-plyny-7--vztlak-v-plynech.json' },
  { driveId: '', file: 'manifest-2026-06-26-sila--jednoduche-stroje.json' }
];

function run(cmd, opts = {}) {
  return execSync(cmd, {
    cwd: BASE,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 300000,
    ...opts
  }).toString().trim();
}

function getGHToken() {
  try {
    const result = execSync('git credential fill', {
      cwd: BASE,
      input: 'protocol=https\nhost=github.com\n\n',
      encoding: 'utf-8',
      timeout: 10000
    });
    const match = result.match(/password=(.+)/);
    return match ? match[1].trim() : null;
  } catch (e) {
    return null;
  }
}

function readProcessed() {
  const p = path.join(BASE, '.routine', 'processed.json');
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); }
  catch { return { processedIds: [], history: [] }; }
}

function writeProcessed(data) {
  fs.writeFileSync(path.join(BASE, '.routine', 'processed.json'), JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function readLedger() {
  const p = path.join(BASE, '.routine', 'ledger.json');
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); }
  catch { return { history: [], lastPicked: null }; }
}

function writeLedger(data) {
  fs.writeFileSync(path.join(BASE, '.routine', 'ledger.json'), JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

const results = [];

for (const m of MANIFESTS) {
  let manifest;
  try {
    const json = fs.readFileSync(path.join(QDIR, m.file), 'utf-8');
    manifest = JSON.parse(json);
  } catch (e) {
    console.error(`READ/PARSE ERROR for ${m.file}: ${e.message}`);
    results.push({ id: m.file, status: 'parse-error', error: e.message });
    continue;
  }

  const processed = readProcessed();
  if (processed.processedIds.includes(manifest.manifestId)) {
    console.log(`SKIP already processed: ${manifest.manifestId}`);
    results.push({ id: manifest.manifestId, status: 'already-processed' });
    continue;
  }

  // INTEGRITY GATE: a manifest only proceeds if its file count matches the
  // declared item count and every file's content is valid JSON with the
  // required identity fields and an allowed path. On any mismatch we skip —
  // no branch, no commit, no merge.
  const expectedItems = manifest.ledgerEntry && manifest.ledgerEntry.items;
  if (typeof expectedItems !== 'number' || manifest.files.length !== expectedItems) {
    console.error(`INTEGRITY FAIL ${manifest.manifestId}: files=${manifest.files.length} but ledgerEntry.items=${expectedItems}. SKIPPING.`);
    results.push({ id: manifest.manifestId, status: 'integrity-fail', files: manifest.files.length, expected: expectedItems });
    continue;
  }
  let integrityOk = true;
  for (const file of manifest.files) {
    if (!/^src\/content\/(experiments|activities|materials|homework)\/[a-z0-9-]+\.json$/.test(file.path)) {
      console.error(`INTEGRITY FAIL ${manifest.manifestId}: bad path ${file.path}`);
      integrityOk = false; break;
    }
    try {
      const c = JSON.parse(file.content);
      if (!c.id || !c.subtopicId || !c.topicId) { integrityOk = false; break; }
    } catch { integrityOk = false; break; }
  }
  if (!integrityOk) {
    console.error(`INTEGRITY FAIL ${manifest.manifestId}: bad file content/path. SKIPPING.`);
    results.push({ id: manifest.manifestId, status: 'integrity-fail-content' });
    continue;
  }

  console.log(`\n=== Processing: ${manifest.manifestId} (${manifest.files.length} files) ===`);

  // Branch
  try {
    run('git checkout main');
    try { run(`git branch -D "${manifest.branch}" 2>nul`); } catch {}
    run(`git checkout -b "${manifest.branch}"`);
  } catch (e) {
    console.error(`Branch error: ${e.message.substring(0, 200)}`);
    results.push({ id: manifest.manifestId, status: 'branch-error' });
    try { run('git checkout main'); } catch {}
    continue;
  }

  // Write files (normalized JSON)
  let filesWritten = 0, fileError = null;
  try {
    for (const file of manifest.files) {
      const filePath = path.join(BASE, file.path);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      const content = JSON.stringify(JSON.parse(file.content), null, 2) + '\n';
      fs.writeFileSync(filePath, content, 'utf-8');
      filesWritten++;
    }
    console.log(`Wrote ${filesWritten} files`);
  } catch (e) {
    fileError = e;
    console.error(`File write error at file ${filesWritten}: ${e.message}`);
  }
  if (fileError) {
    try { run('git checkout main'); run(`git branch -D "${manifest.branch}"`); } catch {}
    results.push({ id: manifest.manifestId, status: 'file-error', error: fileError.message });
    continue;
  }

  // Ledger
  try {
    const ledger = readLedger();
    if (!ledger.history) ledger.history = [];
    ledger.history.push(manifest.ledgerEntry);
    ledger.lastPicked = manifest.ledgerEntry.date;
    writeLedger(ledger);
    console.log('Ledger updated');
  } catch (e) {
    console.error(`Ledger error: ${e.message}`);
  }

  // Build (2 attempts)
  let buildOk = false;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`Build attempt ${attempt}...`);
      run('npm run build', { timeout: 180000 });
      buildOk = true;
      console.log('Build OK');
      break;
    } catch (e) {
      console.error(`Build attempt ${attempt} failed: ${e.message.substring(0, 300)}`);
    }
  }
  if (!buildOk) {
    console.error('Build failed twice, skipping');
    try { run('git checkout main'); run(`git branch -D "${manifest.branch}"`); } catch {}
    results.push({ id: manifest.manifestId, status: 'build-failed' });
    continue;
  }

  // Sanity: only allowed paths changed
  try {
    const changed = run('git diff --name-only HEAD').split('\n').filter(Boolean);
    // Allowed: routine content dirs, the ledger, and pre-existing benign tracked
    // mods left untouched by the routine (settings.local.json per skill pre-flight).
    const allowedExact = new Set(['.routine/ledger.json', '.routine/processed.json', '.claude/settings.local.json', '_process_manifests.cjs']);
    const bad = changed.filter(p => !/^src\/content\/(experiments|activities|materials|homework)\//.test(p) && !allowedExact.has(p));
    if (bad.length) {
      console.error(`Sanity FAIL: unexpected changed paths: ${bad.join(', ')}`);
      run('git checkout main'); run(`git branch -D "${manifest.branch}"`);
      results.push({ id: manifest.manifestId, status: 'sanity-fail', bad });
      continue;
    }
  } catch (e) {
    console.error(`Sanity check error: ${e.message.substring(0, 200)}`);
  }

  // Commit + push
  try {
    run('git add src/content/experiments src/content/activities src/content/materials src/content/homework');
    run('git add -f .routine/ledger.json');
    const commitMsg = manifest.commit.replace(/"/g, '\\"');
    run(`git commit -m "${commitMsg}"`);
    run(`git push -u origin "${manifest.branch}"`);
    console.log('Pushed branch');
  } catch (e) {
    console.error(`Commit/push error: ${e.message.substring(0, 300)}`);
    try { run('git checkout main'); } catch {}
    results.push({ id: manifest.manifestId, status: 'push-error' });
    continue;
  }

  // PR + squash-merge
  const token = getGHToken();
  if (!token) {
    console.error('Could not get GH token');
    results.push({ id: manifest.manifestId, status: 'no-token', branch: manifest.branch });
    run('git checkout main');
    continue;
  }
  const env = { ...process.env, GH_TOKEN: token };
  const tmpBodyPath = path.join(os.tmpdir(), `pr_body_${Date.now()}.md`);
  fs.writeFileSync(tmpBodyPath, manifest.prBody || '', 'utf-8');

  let prUrl = '';
  try {
    const prTitle = manifest.prTitle.replace(/"/g, '\\"');
    prUrl = execSync(
      `"${GH_PATH}" pr create --title "${prTitle}" --body-file "${tmpBodyPath}" --base main --head "${manifest.branch}"`,
      { cwd: BASE, encoding: 'utf-8', env, timeout: 60000 }
    ).trim();
    console.log(`PR created: ${prUrl}`);
  } catch (e) {
    console.error(`PR create error: ${e.message.substring(0, 300)}`);
    const p2 = readProcessed();
    p2.processedIds.push(manifest.manifestId);
    p2.history.push({ manifestId: manifest.manifestId, subtopic: manifest.subtopic, branch: manifest.branch, prUrl: '', merged: false, processedAt: new Date().toISOString(), driveFileId: m.driveId, note: 'pr-create-failed' });
    writeProcessed(p2);
    results.push({ id: manifest.manifestId, status: 'pr-create-failed', branch: manifest.branch });
    run('git checkout main');
    continue;
  }

  let merged = false;
  try {
    execSync(`"${GH_PATH}" pr merge --squash --delete-branch`, { cwd: BASE, encoding: 'utf-8', env, timeout: 60000 });
    merged = true;
    console.log('PR merged (squash)');
  } catch (e) {
    console.error(`PR merge error: ${e.message.substring(0, 300)}`);
  }

  // Mark processed
  const processed2 = readProcessed();
  processed2.processedIds.push(manifest.manifestId);
  processed2.history.push({
    manifestId: manifest.manifestId,
    subtopic: manifest.subtopic,
    branch: manifest.branch,
    prUrl, merged,
    processedAt: new Date().toISOString(),
    driveFileId: m.driveId
  });
  writeProcessed(processed2);

  // Back to main
  try {
    run('git checkout main');
    run('git pull --ff-only origin main');
  } catch (e) {
    console.error(`Checkout main error: ${e.message.substring(0, 200)}`);
    try { run('git checkout main'); } catch {}
  }

  results.push({ id: manifest.manifestId, status: merged ? 'merged' : 'pr-open', prUrl });
  console.log(`DONE: ${manifest.manifestId} => ${merged ? 'merged' : 'PR open'}`);
}

// Summary
console.log('\n========== SUMMARY ==========');
const merged_n = results.filter(r => r.status === 'merged').length;
const pr_open_n = results.filter(r => r.status === 'pr-open').length;
const skipped_n = results.filter(r => !['merged', 'pr-open', 'already-processed'].includes(r.status)).length;
console.log(`Merged: ${merged_n}, PR open: ${pr_open_n}, Skipped/other: ${skipped_n}`);
for (const r of results) {
  const url = r.prUrl ? ` => ${r.prUrl}` : '';
  console.log(`  ${r.id}: ${r.status}${url}`);
}
console.log('\nDone. Remember: git stash pop  (if STASHED=1)');
