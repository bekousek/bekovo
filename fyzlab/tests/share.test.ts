/**
 * Perzistence a sdílení: migrace + zmrazená fixtura v1, URL kodek
 * round-trip, soubor round-trip. Fixtury starých verzí se NIKDY
 * nepřegenerovávají — testují, že staré soubory/odkazy jdou otevřít.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CURRENT_VERSION, migrateSceneDoc } from '@engine/scene/migrate';
import { demoScene } from '@engine/scene/defaults';
import { readSceneText, sceneFileName, sceneToJson } from '@share/fileIO';
import { decodeSceneParam, encodeSceneParam, sceneParamFromHash } from '@share/urlCodec';

const fixtureV1 = (): unknown =>
  JSON.parse(readFileSync(new URL('./fixtures/scene-v1.json', import.meta.url), 'utf8'));

describe('migrateSceneDoc', () => {
  it('zmrazená fixtura v1 se načte (navždy!)', () => {
    const doc = migrateSceneDoc(fixtureV1());
    expect(doc.version).toBe(CURRENT_VERSION);
    expect(doc.entities).toHaveLength(8);
    const spring = doc.entities.find((e) => e.id === 'j-spring');
    if (!spring || spring.kind !== 'joint') throw new Error('j-spring chybí');
    expect(spring.spring?.stiffness).toBeCloseTo(13868.6, 3);
  });

  it('novější verze a nesmysly odmítá s českou hláškou', () => {
    expect(() => migrateSceneDoc({ version: CURRENT_VERSION + 1 })).toThrow(/novější verze/);
    expect(() => migrateSceneDoc({ format: 'fyzlab-scene' })).toThrow(/verze/);
    expect(() => migrateSceneDoc('text')).toThrow(/JSON objekt/);
    expect(() => migrateSceneDoc(null)).toThrow(/JSON objekt/);
  });
});

describe('urlCodec', () => {
  it('encode → decode je identita (deep equal)', async () => {
    const doc = migrateSceneDoc(fixtureV1());
    const param = await encodeSceneParam(doc);
    expect(param).toMatch(/^[A-Za-z0-9_-]+$/); // base64url bez paddingu
    const back = await decodeSceneParam(param);
    expect(back).toEqual(doc);
  });

  it('komprese se vyplatí a hash parser je striktní', async () => {
    const doc = migrateSceneDoc(fixtureV1());
    const param = await encodeSceneParam(doc);
    expect(param.length).toBeLessThan(sceneToJson(doc).length / 2);

    expect(sceneParamFromHash(`#s=${param}`)).toBe(param);
    expect(sceneParamFromHash('#s=')).toBeNull();
    expect(sceneParamFromHash('#jine')).toBeNull();
    expect(sceneParamFromHash('')).toBeNull();
  });
});

describe('fileIO', () => {
  it('sceneToJson → readSceneText je identita', () => {
    const doc = demoScene();
    expect(readSceneText(sceneToJson(doc))).toEqual(doc);
  });

  it('název souboru: česká diakritika → slug', () => {
    const doc = demoScene();
    doc.meta.title = 'Houpačka s pružinou č. 2';
    expect(sceneFileName(doc)).toBe('houpacka-s-pruzinou-c-2.fyzlab');
  });
});
