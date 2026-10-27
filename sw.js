/* Only public game files and immutable Firebase SDK code are cached. */
const RELEASE='2026-10-27-v73-portrait-fit';
const PREFIX='kedai-kita-shell-';
const CACHE=PREFIX+RELEASE;
const SDK_CACHE='kedai-kita-public-sdk-v1';
const ROOT=new URL('./',self.location.href);
const CORE=['index.html','style.css','design.css','app.bundle.js','firebase-config.js','developer-config.js','version.json'];
const AUDIO=['scanner-beep.wav','digital-scale.wav','cha-ching.wav','drawer-open.mp3','scale-place.mp3','gameplay-music.mp3','music-2-tomato-farm.mp3','music-3-taiyaki.mp3','music-4-2am.mp3'];
const urlFor=(name,version=RELEASE)=>new URL(name+(name==='index.html'||name==='version.json'?'':'?v='+version),ROOT).href;
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 await cache.addAll(CORE.map(name=>new Request(urlFor(name),{cache:'reload'})));
 await Promise.allSettled(AUDIO.map(name=>cache.add(new Request(new URL(name,ROOT),{cache:'reload'}))));
})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting()});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET')return;
 const sdk=url.origin==='https://www.gstatic.com'&&url.pathname.startsWith('/firebasejs/')&&url.pathname.endsWith('.js');
 if(sdk){event.respondWith((async()=>{const cache=await caches.open(SDK_CACHE),saved=await cache.match(request);if(saved&&request.cache!=='no-store')return saved;const response=await fetch(request);if(response.ok)await cache.put(request,response.clone());return response})());return}
 if(url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;
 const name=url.pathname.slice(ROOT.pathname.length)||'index.html';
 if(request.mode==='navigate'){
  event.respondWith((async()=>{try{const response=await fetch(request);if(response.ok)return response;throw Error('navigation')}catch{return (await caches.open(CACHE)).match(urlFor('index.html'))}})());return;
 }
 if(!CORE.includes(name)&&!AUDIO.includes(name))return;
 event.respondWith((async()=>{
  const version=url.searchParams.get('v')||RELEASE;
  const cache=await caches.open(PREFIX+version);
  const key=AUDIO.includes(name)?new URL(name,ROOT).href:urlFor(name,version);
  const cached=await cache.match(key);
  if(cached&&name!=='version.json')return cached;
  try{const response=await fetch(request);if(response.ok){await cache.put(key,response.clone());return response}if(cached)return cached;return response}
  catch(error){if(cached)return cached;throw error}
 })());
});
