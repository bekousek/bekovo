// Extract an inline-downloaded Drive PDF (base64) from a session JSONL transcript.
// Used when download_file_content returns the file inline (small files) instead of
// saving to a tool-results .txt, so _decode-downloads.mjs can't find it.
// The base64 is read by Node directly from the transcript — it never enters model context.
//
// Usage: node scripts/ai-pipeline/_extract-inline-pdf.mjs <jsonlPath> <fileId> <outPath>
import fs from 'node:fs';
import readline from 'node:readline';

const [, , jsonlPath, fileId, outPath] = process.argv;
if (!jsonlPath || !fileId || !outPath) {
  console.error('Usage: node _extract-inline-pdf.mjs <jsonlPath> <fileId> <outPath>');
  process.exit(2);
}

function findContent(obj) {
  if (obj == null) return null;
  if (typeof obj === 'string') {
    if (obj.includes(fileId) && obj.includes('"content"')) {
      try {
        return findContent(JSON.parse(obj));
      } catch {
        return null;
      }
    }
    return null;
  }
  if (Array.isArray(obj)) {
    for (const x of obj) {
      const r = findContent(x);
      if (r) return r;
    }
    return null;
  }
  if (typeof obj === 'object') {
    if (obj.id === fileId && typeof obj.content === 'string') return obj.content;
    for (const k of Object.keys(obj)) {
      const r = findContent(obj[k]);
      if (r) return r;
    }
    return null;
  }
  return null;
}

const rl = readline.createInterface({
  input: fs.createReadStream(jsonlPath),
  crlfDelay: Infinity,
});

let found = null;
rl.on('line', (line) => {
  if (found || !line.includes(fileId)) return;
  try {
    const c = findContent(JSON.parse(line));
    if (c) found = c;
  } catch {
    /* skip malformed line */
  }
});
rl.on('close', () => {
  if (!found) {
    console.error('NOT FOUND: no inline content for', fileId);
    process.exit(1);
  }
  fs.writeFileSync(outPath, Buffer.from(found, 'base64'));
  console.log('WROTE', outPath, '(', fs.statSync(outPath).size, 'bytes )');
});
