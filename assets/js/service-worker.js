const CACHE='ops-core-cache-v5'; // Updated cache name due to significant asset list changes
const ASSETS=[
  '/index.html',                        // Main landing page (newly created root index.html)
  '/contact_us/contact.html',
  '/join_us/join.html',
  '/full_page_chatbot/index.html',      // Full page chatbot (now a secondary page)

  '/assets/css/global.css',
  // '/assets/css/small-screens.css',   // Path for small-screens.css if it exists
  '/chatbot_files/css/chatbot_panel.css', // Panel chatbot CSS
  '/full_page_chatbot/css/style.css',   // CSS for full page chatbot
  '/contact_us/css/contact.css',        // CSS for contact page
  '/join_us/css/join.css',              // CSS for join page

  '/assets/js/main.js',
  '/chatbot_files/js/chatbot_panel.js',   // Panel chatbot JS
  '/full_page_chatbot/js/script.js',    // JS for full page chatbot
  '/contact_us/js/contact-handler.js',
  '/join_us/js/join-handler.js',        // JS for join page

  '/assets/images/hero-image.jpg',      // Image used in new root index.html
  '/assets/favicon.ico',                // Favicon
  '/assets/i18n/en.json',               // Language file
  '/assets/i18n/es.json',               // Language file

  // Other pages from root index.html nav that might be good to cache if they exist:
  // '/business-operations.html',
  // '/contact-center.html',
  // '/it-support.html',
  // '/professionals.html',
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
