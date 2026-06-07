#!/usr/bin/env node
/**
 * Jednorázový codemod: doplní `sourceUrl` (odkaz na originál na Google Disku)
 * ke každé hodině v lesson-prep-data podle čísla hodiny (sourceLessonNo).
 * Mapa platí pro ročník 6.B (21-22). Pro další ročníky se sourceUrl píše rovnou
 * do datových souborů. Idempotentní (soubory s sourceUrl přeskočí).
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, 'lesson-prep-data');

// sourceLessonNo → Drive file ID (6.B)
const ID = {
  1: '1S-eC0AjwMm5Xt3F05SqUu74qzLEYiKpI', 2: '1S-q9urzB0P44jT0kPu7so3wS-GnvizZ8',
  3: '1S95Rn55W1OYHpC6Q-H62JEmuO9V2FJuQ', 4: '1S95Rn55W1OYHpC6Q-H62JEmuO9V2FJuQ',
  5: '1SCT0prYKEbWu4yxZttTHmmPgyQgcSfAA', 6: '1SJQbFeqhH41fXKYl6qqA60kIdBgbs3-J',
  7: '1SKM7N0DiPs42dg6zU8yLAP9z8g0Hndj5', 8: '1S_3HdFxH2ZvSy1d79lgodRchF7N0eLMj',
  9: '1SaQy8r6ACT3kV2jRuTIUtLwS7-p8InZS',
  13: '1SpX8bT3LSHoTTUUhaZIFagwhBgAOcXhn', 14: '1SqSxL1qLlAAE9MyyWbZVd3zdukHMKbZ3',
  15: '1SuHInF4Fdnu_OysBP37yHj0rfrfm_At_', 16: '1T-29wMnlvYiH_J8APFUkkMe59kZYdCwE',
  17: '1T7DB37IRZFHftztw8l1aQ2VOUd36KRf-',
  19: '1TDSUvXX1XF2TgczCNJ1bCaDTMJ5mO-NK', 20: '1TExDFSMbtxn85eBtU9D5RbpKa07tFev1',
  21: '1THp54e9Awph1NkwJc4F-4Vb11yASGxTz', 22: '1TJ2rob9c7Z2JM829Qs2t7H918j78TcCH',
  23: '1TQ8sCQpfyCDUN8b8UHEqvuZQ7p7M7-eW', 24: '1TQfkWZm76HNn4Oop6xOvCZp2QJw_950k',
  25: '1TT_zT7YfEaDNZG4quAMo9Rap590TNbfy', 26: '1T_3tyGgPa3np-sQDNBWat2s8a725_e2k',
  27: '1TbELDAKNR48t1sl0RDrpQSdSJU46klJU',
  31: '1jlhknmiE221Dr76_ZHII6e4Uj6E3WglE', 32: '1jrI9aDtQiSJ89UCVdm5mnjmHCS1FGqXu',
  33: '1jsjW4LsrY2e8dJGHr8U6Jwu4HFr4xcCz', 34: '1juKl1JEcds33Bjnieu2dngX8FMo-S_7g',
  35: '1jvrfyyzVFjdhRk95jmf2vACx5lt7M0hS', 36: '1k3vcT7xq7CQWDQv2TLu9VVSrRiSYHff9',
  38: '1kBgEuDbuTQqEyOX7597SYeSjP-rpfVsD',
  41: '1kN6QGqFQ9Dak0QSvnGSGSbTvqnC7WCxC', 42: '1kPRvckDy0ssmjieJwl7AZeBF0H-bcjAh',
  43: '1kQ1VnsfhFOJkvVWx8wvShw4709aamLBL', 44: '1kQj5WW1kh7QSo4ZQF2S_xBCGRz8SK9ge',
  45: '1kYqF8tdb1xey2764kLZi8s39SiKXYAwv',
  48: '1kljSiW7Jox1ggKqIx5SdvVhxLyyuCYZk', 49: '1kmV41ID9satCwgsJYQp7yTmLF6IoFVyb',
  50: '1kqdulOd0EbvIu2sIgsCd_mx3wZpLk87Z', 51: '1ks2_Cb1kU9v05uwXkbtw0045R1ELPbnb',
  52: '1kscdtFonR-bKGepof83W7RaWZ8FXHQA-', 53: '1l-C3Wc47omAN4KECCmcflQtMsSg2SRtj',
  55: '1lMcY8qTHw7wtQpMWfC16lVA_ORf8QLYz', 56: '1lNLGL9NgLjDe5UjZaAIOeZlViWYP5aW_',
  58: '1lTnRPwMPRCi4fj6QvRMDvtQwIqQ-BkiN', 59: '1lVaqjJTRKJCrxvq_li6fjmC-w7bwvMnu',
  62: '1ldGxrw-DuzLe1Q5Fsvi5DV47xkAzprn6', 64: '1lpT4-xhjO3Q-LB8_giHIi84DHaeMBRK6',
};
const url = (id) => `https://drive.google.com/file/d/${id}/view`;

let changed = 0;
for (const f of readdirSync(DIR)) {
  if (!f.endsWith('.mjs')) continue;
  let s = readFileSync(join(DIR, f), 'utf8');
  if (s.includes('sourceUrl:')) continue;
  let touched = false;
  s = s.replace(/^(\s*)sourceLessonNo: (\d+),$/gm, (m, indent, n) => {
    const id = ID[n];
    if (!id) return m;
    touched = true;
    return `${m}\n${indent}sourceUrl: '${url(id)}',`;
  });
  if (touched) { writeFileSync(join(DIR, f), s, 'utf8'); console.log('✓', f); changed++; }
}
console.log(`Hotovo: ${changed} souborů doplněno.`);
