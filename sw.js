// Guarda o app no celular para abrir rápido e funcionar sem internet.
var CACHE = 'jarvis-v16';
var ARQUIVOS = ['./', 'index.html', 'manifest.webmanifest', 'data/geo.js', 'vendor/globe.gl.min.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ARQUIVOS); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
// rede primeiro (pega atualizações), cache se estiver offline
self.addEventListener('fetch', function(e){
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then(function(r){
      if (r.ok && new URL(e.request.url).origin === location.origin){
        var copia = r.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copia); });
      }
      return r;
    }).catch(function(){ return caches.match(e.request); })
  );
});
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(function(cs){
    if (cs.length) return cs[0].focus();
    return self.clients.openWindow('./');
  }));
});
