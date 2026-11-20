const CACHE='brainquest-v0.3.0';
const CORE=[
 './','./index.html','./manifest.json','./css/styles.css','./js/app.js',
 './js/core/game-engine.js','./js/core/game-registry.js','./js/data/islands.js','./js/data/translations.js',
 './js/services/i18n.js','./js/services/scoring.js','./js/services/adaptive-difficulty.js','./js/services/achievements.js','./js/services/achievement-manager.js','./js/storage/database.js','./js/storage/repositories.js',
 './js/algorithms/pathfinding.js','./js/games/memory-game.js','./js/games/number-game.js',
 './js/games/logic-game.js','./js/games/pattern-game.js'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('brainquest-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin)return;
 event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
  if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy))}return response;
 }).catch(()=>caches.match('./index.html'))));
});
