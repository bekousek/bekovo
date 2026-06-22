/**
 * F2-E Predikce — testy datového schématu lekce.
 *
 * Ověřuje: parsování platných lekcí (numerická + výběr), odmítnutí
 * neplatných vstupů, zpětnou kompatibilitu SceneDoc bez lekce a
 * zmrazenou fixturu lesson-projectile-v1 (NIKDY nepřegenerovat!).
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseLesson } from '@engine/scene/lesson';
import { parseSceneDoc } from '@engine/scene/schema';
import { migrateSceneDoc } from '@engine/scene/migrate';

const fixtureProjectile = (): unknown =>
  JSON.parse(
    readFileSync(
      new URL('./fixtures/lesson-projectile-v1.json', import.meta.url),
      'utf8',
    ),
  );

// ---------------------------------------------------------------------------
// LessonSchema — platné vstupy
// ---------------------------------------------------------------------------

describe('LessonSchema — numerická předpověď', () => {
  it('parsuje minimální platný vstup s výchozími hodnotami', () => {
    const lesson = parseLesson({
      question: 'Kam dopadne míč?',
      prediction: {
        kind: 'numeric',
        targetBodyId: 'ball',
        quantity: 'landing-x',
      },
    });
    expect(lesson.prediction.kind).toBe('numeric');
    if (lesson.prediction.kind === 'numeric') {
      expect(lesson.prediction.tolerance).toBeCloseTo(0.1);
      expect(lesson.prediction.unit).toBe('m');
      expect(lesson.prediction.quantity).toBe('landing-x');
    }
    expect(lesson.hint).toBeUndefined();
    expect(lesson.level).toBeUndefined();
  });

  it('parsuje všechny hodnoty quantity', () => {
    const quantities = ['landing-x', 'landing-y', 'max-speed', 'max-height'] as const;
    for (const quantity of quantities) {
      const lesson = parseLesson({
        question: 'Q?',
        prediction: { kind: 'numeric', targetBodyId: 'b', quantity },
      });
      if (lesson.prediction.kind === 'numeric') {
        expect(lesson.prediction.quantity).toBe(quantity);
      }
    }
  });

  it('parsuje s explicitní tolerancí, jednotkou, nápovědou a obtížností', () => {
    const lesson = parseLesson({
      question: 'Jaká bude maximální výška?',
      prediction: {
        kind: 'numeric',
        targetBodyId: 'ball',
        quantity: 'max-height',
        tolerance: 0.05,
        unit: 'm',
      },
      hint: 'Použij zachování energie.',
      level: 'základní',
    });
    expect(lesson.hint).toBe('Použij zachování energie.');
    expect(lesson.level).toBe('základní');
    if (lesson.prediction.kind === 'numeric') {
      expect(lesson.prediction.tolerance).toBeCloseTo(0.05);
    }
  });
});

describe('LessonSchema — výběr z možností', () => {
  it('parsuje platný vstup se dvěma možnostmi', () => {
    const lesson = parseLesson({
      question: 'Která síla způsobí největší zrychlení?',
      prediction: {
        kind: 'choice',
        choices: [
          { id: 'a', label: 'Tíhová síla' },
          { id: 'b', label: 'Normálová síla' },
        ],
        correctId: 'a',
      },
    });
    expect(lesson.prediction.kind).toBe('choice');
    if (lesson.prediction.kind === 'choice') {
      expect(lesson.prediction.choices).toHaveLength(2);
      expect(lesson.prediction.correctId).toBe('a');
    }
  });

  it('parsuje tři nebo více možností', () => {
    const lesson = parseLesson({
      question: 'Co nastane?',
      prediction: {
        kind: 'choice',
        choices: [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
          { id: 'c', label: 'C' },
        ],
        correctId: 'c',
        level: 'pokročilý',
      },
    });
    if (lesson.prediction.kind === 'choice') {
      expect(lesson.prediction.choices).toHaveLength(3);
    }
  });
});

// ---------------------------------------------------------------------------
// LessonSchema — neplatné vstupy
// ---------------------------------------------------------------------------

describe('LessonSchema — odmítá neplatné vstupy', () => {
  it('odmítá prázdnou otázku', () => {
    expect(() =>
      parseLesson({
        question: '',
        prediction: { kind: 'numeric', targetBodyId: 'b', quantity: 'landing-x' },
      }),
    ).toThrow();
  });

  it('odmítá neznámý typ předpovědi', () => {
    expect(() =>
      parseLesson({
        question: 'Q?',
        prediction: { kind: 'graph', targetBodyId: 'b' },
      }),
    ).toThrow();
  });

  it('odmítá toleranci ≤ 0', () => {
    expect(() =>
      parseLesson({
        question: 'Q?',
        prediction: { kind: 'numeric', targetBodyId: 'b', quantity: 'landing-x', tolerance: 0 },
      }),
    ).toThrow();
  });

  it('odmítá toleranci > 1', () => {
    expect(() =>
      parseLesson({
        question: 'Q?',
        prediction: { kind: 'numeric', targetBodyId: 'b', quantity: 'landing-x', tolerance: 1.5 },
      }),
    ).toThrow();
  });

  it('odmítá výběr s méně než dvěma možnostmi', () => {
    expect(() =>
      parseLesson({
        question: 'Q?',
        prediction: { kind: 'choice', choices: [{ id: 'a', label: 'A' }], correctId: 'a' },
      }),
    ).toThrow();
  });

  it('odmítá neznámou obtížnost', () => {
    expect(() =>
      parseLesson({
        question: 'Q?',
        prediction: { kind: 'numeric', targetBodyId: 'b', quantity: 'landing-x' },
        level: 'expert',
      }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// SceneDoc — zpětná kompatibilita a integrace
// ---------------------------------------------------------------------------

describe('SceneDoc — lekce jako volitelné pole', () => {
  it('parsuje SceneDoc bez lekce (zpětná kompatibilita)', () => {
    const doc = parseSceneDoc({
      format: 'fyzlab-scene',
      version: 1,
      meta: { id: 'test-no-lesson', title: '' },
      world: {},
      camera: { center: { x: 0, y: 0 }, metersPerScreenH: 8 },
      entities: [],
    });
    expect(doc.lesson).toBeUndefined();
  });

  it('parsuje SceneDoc s numerickou lekcí', () => {
    const doc = parseSceneDoc({
      format: 'fyzlab-scene',
      version: 1,
      meta: { id: 'test-with-lesson', title: '' },
      world: {},
      camera: { center: { x: 0, y: 0 }, metersPerScreenH: 8 },
      entities: [],
      lesson: {
        question: 'Otázka?',
        prediction: { kind: 'numeric', targetBodyId: 'b', quantity: 'max-speed' },
      },
    });
    expect(doc.lesson).toBeDefined();
    expect(doc.lesson?.prediction.kind).toBe('numeric');
  });
});

// ---------------------------------------------------------------------------
// Zmrazená fixtura (NIKDY nepřegenerovat!)
// ---------------------------------------------------------------------------

describe('zmrazená fixtura lesson-projectile-v1', () => {
  it('načte se přes migrateSceneDoc a obsahuje numerickou lekci', () => {
    const doc = migrateSceneDoc(fixtureProjectile());
    expect(doc.lesson).toBeDefined();
    const lesson = doc.lesson!;
    expect(lesson.question).toContain('45');
    expect(lesson.level).toBe('střední');
    if (lesson.prediction.kind !== 'numeric') throw new Error('očekávám numeric');
    expect(lesson.prediction.quantity).toBe('landing-x');
    expect(lesson.prediction.targetBodyId).toBe('ball');
    expect(lesson.prediction.tolerance).toBeCloseTo(0.05);
  });

  it('fixtura obsahuje těleso "ball" s nenulovými složkami rychlosti', () => {
    const doc = migrateSceneDoc(fixtureProjectile());
    const ball = doc.entities.find((e) => e.id === 'ball');
    if (!ball || ball.kind !== 'body') throw new Error('ball chybí');
    expect(Math.abs(ball.velocity.vx)).toBeGreaterThan(0);
    expect(Math.abs(ball.velocity.vy)).toBeGreaterThan(0);
  });
});
