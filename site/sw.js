/* Casa Dulce – service worker (cache-first). Schimbă VERSION la fiecare publicare. */
const VERSION = "casa-dulce-v1";
const SHELL = [
  "/", "/index.html", "/confidentialitate.html", "/manifest.webmanifest",
  "/css/themes.css", "/css/style.css",
  "/js/data.js", "/js/shop.js", "/js/events.js", "/js/cozonac.js", "/js/cart.js", "/js/app.js",
  "/fonts/fraunces-600-latin.woff2", "/fonts/fraunces-600-latin-ext.woff2",
  "/fonts/fraunces-400i-latin.woff2", "/fonts/fraunces-400i-latin-ext.woff2",
  "/fonts/dmsans-400-latin.woff2", "/fonts/dmsans-400-latin-ext.woff2",
  "/fonts/dmsans-600-latin.woff2", "/fonts/dmsans-600-latin-ext.woff2", "/fonts/dmsans-700-latin.woff2", "/fonts/dmsans-700-latin-ext.woff2",
  "/img/icons/icon-192.png", "/img/icons/icon-512.png", "/img/icons/favicon.svg",
  "/img/amandine.webp", "/img/savarine.webp", "/img/cremsnit.webp", "/img/cornulete-rahat.webp", "/img/cozonac-nuca.webp",
  "/img/salam-biscuiti.webp", "/img/prajitura-mere.webp", "/img/placinta-branza.webp", "/img/nuca-caramel.webp", "/img/ecler-vanilie.webp",
  "/img/tort-nunta.webp", "/img/tort-botez.webp", "/img/cozonaci.webp", "/img/platou-prajituri.webp", "/img/candy-bar.webp", "/img/cutie-cadou.webp"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;   // POST-urile formularelor merg direct la rețea
  // rutele aplicației (/prajituri, /cos …) primesc index.html din cache
  if (req.mode === "navigate" && !url.pathname.endsWith(".html")) {
    e.respondWith(caches.match("/index.html").then(r => r || fetch(req)));
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(r => r || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  })));
});
