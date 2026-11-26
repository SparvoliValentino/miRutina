const CACHE_NAME = 'mi-rutina-shell-v4';
const root = self.registration.scope;
const asset = path => new URL(path, root).href;
const localArtwork = new Set([61, 62, 63, 65]);
const files = [
  '', 'index.html', 'styles.css?v=4', 'app.js?v=4', 'manifest.webmanifest',
  'assets/icons/icon-192.png', 'assets/icons/icon-512.png',
  'assets/icons/apple-touch-icon.png',
  ...Array.from({length: 66}, (_, i) => i + 1)
    .filter(i => !localArtwork.has(i))
    .map(i => `assets/exercises/ex-${i}.png`),
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(files.map(asset))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('mi-rutina-shell-') && key !== CACHE_NAME).map(key => caches.delete(key)))),
    self.clients.claim(),
  ]));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(root)) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(asset('index.html'))));
    return;
  }
  if (['app.js', 'styles.css', 'manifest.webmanifest'].some(path => url.pathname === new URL(path, root).pathname)) {
    event.respondWith(caches.open(CACHE_NAME).then(cache => fetch(request)
      .then(response => { if (response.ok) cache.put(request, response.clone()); return response; })
      .catch(() => cache.match(request))));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
});
