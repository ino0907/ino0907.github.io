const C = 'rakugaki-v1';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(['./', './index.html', './manifest.webmanifest', './icon-192.png'])));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))));
  self.clients.claim();
});
// 通信が使えるときは常に最新を取得し、オフラインのときだけ保存分を使う
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.includes('/api/')) return;
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone();
    caches.open(C).then(c => c.put(e.request, copy));
    return r;
  }).catch(() => caches.match(e.request)));
});
