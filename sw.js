
const CACHE='ng-static-v1';
const ASSETS=['/','/index.html','/style.css','/main.js','/manifest.webmanifest','/favicon.ico'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate',()=>self.clients.claim());

self.addEventListener('fetch',e=>{
  const {request}=e;
  if(request.method!=='GET')return;
  e.respondWith(
    caches.match(request).then(cached=>cached||fetch(request))
  );
});
