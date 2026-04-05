/**
 * Fix moved files: convert experiment schema to activity schema
 * - Change type from qualitative/measurement to game/method/group-work/other
 * - Remove materials, procedure fields
 * - Keep id, subtopicId, topicId, title, description
 */
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const ACTIVITIES_DIR = join(process.cwd(), 'src', 'content', 'activities');

const movedFiles: Record<string, { type: 'game' | 'method' | 'group-work' | 'other' }> = {
  'optika-periskop': { type: 'other' },        // výroba
  'akustika-kalimba': { type: 'other' },        // výroba
  'akustika-pistalky': { type: 'other' },       // výroba
  'akustika-zvucne-hracky': { type: 'other' },  // výroba
  'astronomie-slunecni-hodiny': { type: 'other' }, // výroba
  'astronomie-stellarium': { type: 'method' },  // práce se softwarem
  'elektrina-elektromotor': { type: 'other' },  // stavba
  'eo-vanocni-obvody': { type: 'other' },       // výroba
  'eo-vodiva-paska': { type: 'method' },        // metoda zapojování
  'eo-simulace-obvodu': { type: 'method' },     // práce se softwarem
  'mechanika-jednoduche-stroje-leonardo': { type: 'group-work' }, // stavba ve skupinách
  'mikrosvet-atomy': { type: 'method' },        // modelování
  'kapaliny-lodky': { type: 'game' },           // soutěž ve stavbě
  'sila-padajici-hracky': { type: 'other' },    // konstrukce
  'optika-rgb-michacka': { type: 'other' },     // výroba
  'optika-svetelny-tunel': { type: 'other' },   // výroba
};

async function main() {
  for (const [id, config] of Object.entries(movedFiles)) {
    const filePath = join(ACTIVITIES_DIR, `${id}.json`);
    const raw = await readFile(filePath, 'utf-8');
    const data = JSON.parse(raw);

    // Convert to activity schema
    const activity = {
      id: data.id,
      subtopicId: data.subtopicId,
      topicId: data.topicId,
      title: data.title,
      type: config.type,
      description: data.description,
    };

    await writeFile(filePath, JSON.stringify(activity, null, 2) + '\n', 'utf-8');
    console.log(`Fixed: ${id} → type: ${config.type}`);
  }
}

main();
