import type { APIRoute } from 'astro';
import { assertJsonSize, getLibrary, toTextJson } from '../../lib/library/data';

/** Plné texty (popis, kroky postupu, soubory) — /test2 je dotahuje až po prvním vykreslení. */
export const GET: APIRoute = async () => {
  const body = assertJsonSize('library-text.json', JSON.stringify(toTextJson(await getLibrary())));
  return new Response(body, { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
