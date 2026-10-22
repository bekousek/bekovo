import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { START_SAVINGS } from './data/questions';
import type { GoalId } from './logic/bench';

export type Screen =
  | 'start' | 'town' | 'jobs' | 'library' | 'shop' | 'workshop' | 'post' | 'os' | 'software' | 'finish';

export type RamSlot = 'A1' | 'A2' | 'B1' | 'B2';
export type Rot = 0 | 90 | 180 | 270;

export interface Asm {
  /** Deska položená na antistatické podložce. */
  mb: string | null;
  cpu: { id: string; seated: boolean; lever: boolean } | null;
  /** Natočení procesoru v ruce (zlatý trojúhelník musí sedět s paticí). */
  cpuRot: Rot;
  paste: boolean;
  /** id chladiče, nebo 'box' pro chladič z krabice procesoru. */
  cooler: { id: string; fan: boolean } | null;
  ram: Partial<Record<RamSlot, string>>;
  m2: { id: string; screwed: boolean } | null;
  caseId: string | null;
  psu: string | null;
  gpu: string | null;
  hdd: string | null;
  cables: { atx: boolean; eps: boolean; pcie: boolean; sata: boolean };
  panel: boolean;
  monitor: 'gpu' | 'mb' | null;
  /** Díly, u kterých žák zjistil, že nepasují. */
  blocked: string[];
}

export interface QuizRun {
  cat: string;
  ids: string[];
  /** Zamíchané pořadí možností (indexy do options; 0 = správná). */
  orders: number[][];
  i: number;
  picks: (number | null)[];
  done: boolean;
}

export interface OsState {
  step: number;
  osId: string | null;
  keyboard: 'cz' | 'us' | null;
  disk: 'ssd' | 'usb' | null;
  user: string;
  pass: string;
  privacy: { location: boolean; ads: boolean; diag: boolean };
  done: boolean;
}

export interface SwState {
  done: string[];
  /** Pasti, do kterých žák spadl (id). */
  fell: string[];
  /** Pasti, kterým se vyhnul. */
  dodged: string[];
}

export interface Note {
  kind: 'mistake' | 'tip';
  text: string;
  /** Chyba vznikla už v obchodě (koupený nekompatibilní díl). */
  compat?: boolean;
}

export interface GameState {
  v: 1;
  name: string;
  avatar: number;
  goal: GoalId | null;
  money: number;
  screen: Screen;
  startedAt: number;
  finishedAt: number | null;
  /** Kde ve městečku stojí postavička (id budovy nebo 'park'). */
  at: string;
  /** Úvodní příběh už žák viděl. */
  intro: boolean;

  asked: string[];
  answered: number;
  correct: number;
  jobsDone: number;
  earned: number;
  quiz: QuizRun | null;

  owned: string[];
  cart: string[];
  spent: number;
  returns: number;
  checks: number;

  asm: Asm;
  notes: Note[];
  postTries: number;

  os: OsState;
  sw: SwState;
  sound: boolean;
}

export const SAVE_KEY = 'bekovo-build-pc-v1';

export function emptyAsm(): Asm {
  return {
    mb: null,
    cpu: null,
    cpuRot: ([90, 180, 270] as Rot[])[Math.floor(Math.random() * 3)],
    paste: false,
    cooler: null,
    ram: {},
    m2: null,
    caseId: null,
    psu: null,
    gpu: null,
    hdd: null,
    cables: { atx: false, eps: false, pcie: false, sata: false },
    panel: false,
    monitor: null,
    blocked: [],
  };
}

export function newGame(): GameState {
  return {
    v: 1,
    name: '',
    avatar: 0,
    goal: null,
    money: START_SAVINGS,
    screen: 'start',
    startedAt: Date.now(),
    finishedAt: null,
    at: 'park',
    intro: false,
    asked: [],
    answered: 0,
    correct: 0,
    jobsDone: 0,
    earned: 0,
    quiz: null,
    owned: [],
    cart: [],
    spent: 0,
    returns: 0,
    checks: 0,
    asm: emptyAsm(),
    notes: [],
    postTries: 0,
    os: {
      step: 0, osId: null, keyboard: null, disk: null, user: '', pass: '',
      privacy: { location: true, ads: true, diag: true }, done: false,
    },
    sw: { done: [], fell: [], dodged: [] },
    sound: false,
  };
}

export function loadSave(): GameState | null {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as GameState;
    if (s?.v !== 1 || typeof s.money !== 'number') return null;
    return { ...newGame(), ...s, asm: { ...emptyAsm(), ...s.asm }, os: { ...newGame().os, ...s.os }, sw: { ...newGame().sw, ...s.sw } };
  } catch {
    return null;
  }
}

function persist(s: GameState) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  } catch {
    /* soukromé okno nebo plné úložiště: hra jede dál bez ukládání */
  }
}

export function clearSave() {
  try {
    window.localStorage.removeItem(SAVE_KEY);
  } catch {
    /* nic */
  }
}

export interface Toast {
  id: number;
  kind: 'ok' | 'bad' | 'info';
  text: string;
}

interface Ctx {
  s: GameState;
  /** Úprava stavu přes kopii (draft se smí měnit). */
  update: (fn: (d: GameState) => void) => void;
  /** Nahradí celý stav (když je potřeba výsledek výpočtu hned, např. v dílně). */
  commit: (next: GameState) => void;
  go: (screen: Screen) => void;
  toast: (kind: Toast['kind'], text: string) => void;
  toasts: Toast[];
  dismiss: (id: number) => void;
  /** Parametry z adresy (?demo, ?hitbox). */
  flags: { demo: boolean; hitbox: boolean };
  hasSave: boolean;
  reset: () => void;
}

const GameCtx = createContext<Ctx | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const flags = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    return { demo: p.has('demo'), hitbox: p.has('hitbox') };
  }, []);
  const initialSave = useMemo(() => loadSave(), []);
  const [s, setS] = useState<GameState>(() => {
    const base = newGame();
    if (initialSave) base.name = initialSave.name;
    return base;
  });
  const [hasSave, setHasSave] = useState(!!initialSave);
  const savedRef = useRef(initialSave);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  useEffect(() => {
    if (s.screen !== 'start') persist(s);
  }, [s]);

  const update = useCallback((fn: (d: GameState) => void) => {
    setS((prev) => {
      const d = structuredClone(prev);
      fn(d);
      return d;
    });
  }, []);

  const go = useCallback((screen: Screen) => {
    update((d) => { d.screen = screen; });
    window.scrollTo({ top: 0 });
  }, [update]);

  const toast = useCallback((kind: Toast['kind'], text: string) => {
    const id = nextId.current++;
    setToasts([{ id, kind, text }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'bad' ? 9000 : 6000);
  }, []);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const reset = useCallback(() => {
    clearSave();
    savedRef.current = null;
    setHasSave(false);
    setS(newGame());
  }, []);

  const commit = useCallback((next: GameState) => setS(next), []);

  const value: Ctx = { s, update, commit, go, toast, toasts, dismiss, flags, hasSave, reset };
  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}

export function useGame(): Ctx {
  const c = useContext(GameCtx);
  if (!c) throw new Error('useGame mimo GameProvider');
  return c;
}

export function resumeSave(update: Ctx['update']) {
  const saved = loadSave();
  if (!saved) return false;
  update((d) => {
    Object.assign(d, saved);
    if (d.screen === 'start') d.screen = 'town';
  });
  return true;
}

export function addNote(d: GameState, kind: Note['kind'], text: string, compat = false) {
  if (!d.notes.some((n) => n.text === text)) d.notes.push({ kind, text, compat });
}
