// spielplan without signal: keeps the page and its data, so the app also starts with no connection at all.
// With signal the newest copy is fetched (and kept); on a slow or missing connection the kept one is used.
// Hall plans and box covers are kept by the app itself (IndexedDB), so they are not stored twice here.
const CACHE = "spielplan-1";
const SHELL = ["./", "./index.html", "./data.json", "./maps.json"];
const LIBS = /^https:\/\/(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com)\//; // the ceiling matcher and the PDF maker

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const keep = (req, res) => { if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
self.addEventListener("fetch", e => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== "GET") return;
  if (LIBS.test(req.url)) { // libraries never change at a given version: the kept copy first
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => keep(req, res))));
    return;
  }
  if (u.origin !== location.origin || /\.(webp|png|jpg)$/.test(u.pathname)) return;
  // the page and its data: the network, unless it takes longer than 4 s or fails; then the kept copy
  const net = fetch(req).then(res => keep(req, res));
  const kept = () => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === "navigate" ? caches.match("./index.html") : undefined));
  e.respondWith(new Promise(resolve => {
    let done = false;
    const fallback = () => kept().then(r => { if (r && !done) { done = true; resolve(r); } });
    const t = setTimeout(fallback, 4000);
    net.then(res => { clearTimeout(t); if (!done) { done = true; resolve(res); } })
       .catch(() => { clearTimeout(t); kept().then(r => { if (!done) { done = true; resolve(r || Response.error()); } }); });
  }));
});
