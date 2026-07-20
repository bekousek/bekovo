/**
 * FyzLab service worker — offline cache pro školní wifi.
 *
 * Strategie:
 *  - navigace (HTML): network-first → cache → offline fallback
 *  - assety (JS/CSS/WASM/fonts): cache-first, aktualizace na pozadí
 *
 * Cache verze musí být zvednuta ručně při breaking změnách (jinak
 * browsery drží starý SW); Vite assety mají content-hash v názvu
 * a tak jsou přirozeně verzované.
 */

const CACHE = 'fyzlab-v1';
const OFFLINE_URL = '/';
// Strop na počet položek v cache — bez něj se content-hashované assety ze
// starých deployů hromadí donekonečna v rámci jedné verze cache.
const MAX_ENTRIES = 200;

async function trimCache(cache, maxEntries) {
  const keys = await cache.keys();
  const excess = keys.length - maxEntries;
  for (let i = 0; i < excess; i++) {
    await cache.delete(keys[i]);
  }
}

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.add(OFFLINE_URL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Jen same-origin a GET.
  if (url.origin !== self.location.origin || request.method !== 'GET') return;

  // Navigace (HTML) — network-first.
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone).then(() => trimCache(c, MAX_ENTRIES)));
          return res;
        })
        .catch(() => caches.match(OFFLINE_URL).then((r) => r ?? Response.error()))
    );
    return;
  }

  // Assety — cache-first, aktualizace na pozadí.
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      const cached = await c.match(request);
      const fetchPromise = fetch(request).then((res) => {
        if (res.ok) c.put(request, res.clone()).then(() => trimCache(c, MAX_ENTRIES));
        return res;
      });
      return cached ?? fetchPromise;
    })
  );
});
