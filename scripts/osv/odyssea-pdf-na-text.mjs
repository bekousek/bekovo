/**
 * Stáhne metodiky Projektu Odyssea a převede je na text pro odyssea-karty.mjs.
 *
 *   ODY=/nekam/ody node scripts/osv/odyssea-pdf-na-text.mjs
 *
 * Očekává `pdfjs-dist` (npm i pdfjs-dist). Do adresáře uloží ke každému PDF
 * i `.txt` se značkami `===== STRANA N =====`, podle kterých parser počítá
 * čísla stránek pro odkazy `#page=N`.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';

const DIR = process.env.ODY || `${process.env.S}/ody`;
mkdirSync(DIR, { recursive: true });

const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');

for (const file of readdirSync(DIR).filter((f) => f.endsWith('.pdf'))) {
  const out = `${DIR}/${file.replace(/\.pdf$/, '.txt')}`;
  if (existsSync(out)) continue;
  const doc = await getDocument({ data: new Uint8Array(readFileSync(`${DIR}/${file}`)) }).promise;
  const parts = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const c = await (await doc.getPage(p)).getTextContent();
    // Položky se skládají po řádcích podle svislé souřadnice.
    let y = null, line = [], lines = [];
    for (const it of c.items) {
      if (!('str' in it)) continue;
      const ny = Math.round(it.transform[5]);
      if (y !== null && Math.abs(ny - y) > 2) { lines.push(line.join('')); line = []; }
      y = ny;
      line.push(it.str);
    }
    if (line.length) lines.push(line.join(''));
    parts.push(`===== STRANA ${p} =====\n${lines.join('\n')}\n`);
  }
  writeFileSync(out, parts.join(''));
  console.log(`${file} → ${doc.numPages} stran`);
}
