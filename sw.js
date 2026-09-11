const CACHE='cefr-trainer-local-v04-shell';
const SHELL=['./','./index.html','./app.css','./js/app.js','./js/levels.js','./js/prompts.js','./workers/llm-worker.js','./workers/whisper-worker.js','./workers/tts-worker.js','./manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return resp;})));
});
