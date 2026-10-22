/* SINGAAR service worker: lets the site install like an app and keep working with a weak signal.
   Strategy: network first (people always get the latest version when online), cached copy as a fallback. */
var CACHE='singaar-v1';
self.addEventListener('install',function(){self.skipWaiting()});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  var r=e.request;
  if(r.method!=='GET')return;
  var u=new URL(r.url);
  if(u.origin!==self.location.origin)return;
  e.respondWith(
    fetch(r).then(function(res){
      if(res&&res.ok){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(r,copy)})}
      return res;
    }).catch(function(){
      return caches.match(r).then(function(m){return m||caches.match('index.html')});
    })
  );
});
