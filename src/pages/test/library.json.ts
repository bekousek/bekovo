import type { APIRoute } from 'astro';
import { assertJsonSize, getLibrary, toIndexJson } from '../../lib/library/data';

/** Lehký index všech položek pro /test2 (Rejstřík) a /test1/hodina. */
export const GET: APIRoute = async () => {
  const body = assertJsonSize('library.json', JSON.stringify(toIndexJson(await getLibrary())));
  return new Response(body, { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
