/**
 * PDF Text Extraction Script
 * Extracts text from all PDFs in the "Externí materiály" folder
 * Uses pdfjs-dist for cross-platform compatibility
 */

import { readdir, writeFile, mkdir } from 'fs/promises';
import { join, basename } from 'path';

// pdfjs-dist requires this for Node.js usage
const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

const INPUT_DIR = join(process.cwd(), 'Externí materiály');
const OUTPUT_DIR = join(process.cwd(), 'scripts', 'ai-pipeline', 'extracted');

async function extractTextFromPdf(filePath: string): Promise<string> {
  const doc = await pdfjsLib.getDocument(filePath).promise;
  const numPages = doc.numPages;
  const pages: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => {
        if ('str' in item) return item.str;
        return '';
      })
      .join('');
    pages.push(`\n--- PAGE ${i} ---\n${text}`);
  }

  return pages.join('\n');
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const files = await readdir(INPUT_DIR);
  const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));

  console.log(`Found ${pdfFiles.length} PDF files`);

  // Process just the first file as a test if --test flag is passed
  const testMode = process.argv.includes('--test');
  const filesToProcess = testMode ? [pdfFiles[0]] : pdfFiles;

  for (const file of filesToProcess) {
    const filePath = join(INPUT_DIR, file);
    const outputName = basename(file, '.pdf') + '.txt';
    const outputPath = join(OUTPUT_DIR, outputName);

    console.log(`Extracting: ${file}...`);
    try {
      const text = await extractTextFromPdf(filePath);
      await writeFile(outputPath, text, 'utf-8');
      console.log(`  → ${outputName} (${text.length} chars)`);
    } catch (err) {
      console.error(`  ✗ Error: ${err}`);
    }
  }

  console.log('Done!');
}

main();
