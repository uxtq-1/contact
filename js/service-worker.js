const CACHE='ops-core-cache-v4';
const ASSETS=[
  '/',
  '/index.html',
  '/contact.html',
  '/css/global.css',
  '/css/small-screens.css',
  '/js/main.js',
  '/js/contact-handler.js',
  '/assets/hero.jpg',
  '/assets/favicon.ico'
];

self.addEventListener('install',evt=>{
  evt.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',evt=>{
  evt.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',evt=>{
  evt.respondWith(
    caches.match(evt.request).then(hit=>hit||fetch(evt.request).then(res=>{
      if(!res||res.status!==200||res.type!=='basic')return res;
      const clone=res.clone();
      caches.open(CACHE).then(c=>c.put(evt.request,clone));
      return res;
    }))
  );
});
