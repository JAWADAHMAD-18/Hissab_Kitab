const CACHE_VERSION = "hk-v1";

const PRECACHE_URLS = [
  "/offline",
  "/icons/icon-192",
  "/icons/icon-512",
  "/icons/icon-512-maskable",
];

// ─── Install ───────────────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ─── Activate ──────────────────────────────────────────────────────────────

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch ─────────────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  // Never intercept API routes or Next.js data fetching internals
  if (url.pathname.startsWith("/api/")) return;
  if (url.pathname.startsWith("/_next/data")) return;

  // Never intercept RSC requests
  if (request.headers.get("RSC") === "1") return;
  if (request.headers.get("Next-Router-State-Tree")) return;
  if (url.searchParams.has("_rsc")) return;

  // /_next/static — cache-first (hashed, immutable assets)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached ?? fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          return res;
        })
      )
    );
    return;
  }

  // Icons — cache-first
  if (url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached ?? fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          return res;
        })
      )
    );
    return;
  }

  // Navigation requests — network-only; fallback to offline page on failure
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/offline").then((cached) => cached ?? Response.error())
      )
    );
    return;
  }
});
