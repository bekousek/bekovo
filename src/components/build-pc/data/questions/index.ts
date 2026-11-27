import { HW } from './hw';
import { OS } from './os';
import { NET } from './net';
import { SEC } from './sec';
import { DATA } from './data';
import type { Question, QuestionCategory } from './types';

export type { Question, QuestionCategory } from './types';

export const QUESTIONS: Question[] = [...HW, ...OS, ...NET, ...SEC, ...DATA];

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(QUESTIONS.map((x) => [x.id, x]));

export interface Job {
  id: QuestionCategory;
  title: string;
  place: string;
  /** Jedna věta, co na brigádě děláš. */
  pitch: string;
}

/** Brigády = témata otázek. Každá brigáda je 5 otázek. */
export const JOBS: Job[] = [
  { id: 'hw', title: 'Servis počítačů', place: 'Opravna u nádraží', pitch: 'Zákazníci nosí rozbité počítače. Poradíš jim, který díl za to může?' },
  { id: 'os', title: 'Školní helpdesk', place: 'Kabinet informatiky', pitch: 'Spolužáci a učitelé se ptají na soubory, programy a systém.' },
  { id: 'net', title: 'Wi-Fi v kavárně', place: 'Kavárna Na Rohu', pitch: 'Hostům nejde internet. Zjistíš, kde je chyba?' },
  { id: 'sec', title: 'Kyberhlídka', place: 'Městská knihovna', pitch: 'Lidem chodí podezřelé zprávy. Pomoz jim nenaletět.' },
  { id: 'data', title: 'Datové centrum', place: 'Serverovna za městem', pitch: 'Počítáš s bity, bajty, pixely a tabulkami.' },
];

export const CATEGORY_LABEL: Record<QuestionCategory, string> = {
  hw: 'Hardware',
  os: 'Systém a soubory',
  net: 'Sítě a internet',
  sec: 'Bezpečnost',
  data: 'Data a algoritmy',
};

export const QUESTIONS_PER_JOB = 5;
export const PAY_PER_CORRECT = 800;
export const PERFECT_BONUS = 1000;
export const START_SAVINGS = 10000;
