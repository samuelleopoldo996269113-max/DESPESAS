const CACHE = "minhas-despesas-v5";
const FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

/* Tenta a internet primeiro (para pegar atualizações) e usa o cache se estiver sem rede. */
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  /* Pedidos para outros sites (como o leitor de notas) passam direto, sem cópia guardada. */
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(found => found || caches.match("./index.html")))
  );
});
