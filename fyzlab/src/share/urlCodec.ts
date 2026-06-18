/**
 * Sdílení scény v URL: JSON → deflate-raw (CompressionStream) → base64url
 * do hash fragmentu `#s=…`. Hash se neposílá na server — scéna zůstává
 * jen v prohlížeči. Funguje i v Node ≥ 18 (vitest).
 */
import { migrateSceneDoc } from '@engine/scene/migrate';
import type { SceneDoc } from '@engine/scene/schema';

/** Nad ~8 kB hrozí potíže s délkou URL (chat aplikace, QR…) — varovat. */
export const URL_WARN_BYTES = 8 * 1024;

async function pump(
  bytes: Uint8Array,
  stream: CompressionStream | DecompressionStream,
): Promise<Uint8Array> {
  const blob = new Blob([bytes as BlobPart]);
  const out = new Response(blob.stream().pipeThrough(stream));
  return new Uint8Array(await out.arrayBuffer());
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  const CHUNK = 0x8000; // String.fromCharCode má limit počtu argumentů
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replaceAll('-', '+').replaceAll('_', '/');
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

/** Zakóduje scénu do hodnoty pro `#s=`. */
export async function encodeSceneParam(doc: SceneDoc): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(doc));
  const packed = await pump(json, new CompressionStream('deflate-raw'));
  return toBase64Url(packed);
}

/** Dekóduje hodnotu `#s=` zpět na scénu (vč. migrace + validace). */
export async function decodeSceneParam(param: string): Promise<SceneDoc> {
  const packed = fromBase64Url(param);
  const json = await pump(packed, new DecompressionStream('deflate-raw'));
  return migrateSceneDoc(JSON.parse(new TextDecoder().decode(json)));
}

/** Vytáhne hodnotu `#s=` z location.hash; null = žádná scéna v URL. */
export function sceneParamFromHash(hash: string): string | null {
  const m = /^#s=([A-Za-z0-9_-]+)$/.exec(hash);
  return m ? m[1]! : null;
}
