/* Murdle Chart service worker.
   Shell is cached so the home-screen app works offline. A new build installs into a
   fresh cache and then *waits* — the page shows an "Update" toast and posts
   SKIP_WAITING when the user taps it. */
var CACHE = "murdle-chart-v3";
var ASSETS = ["./", "./index.html", "./icon-512.png"];

self.addEventListener("install", function(e){
  // no skipWaiting(): the new worker waits until the user accepts the update
  e.waitUntil(caches.open(CACHE).then(function(c){
    return c.addAll(ASSETS.map(function(u){ return new Request(u, {cache:"reload"}); }));
  }));
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return k === CACHE ? null : caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("message", function(e){
  if(e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if(req.method !== "GET") return;

  // Navigations go network-first so a deploy is picked up even if the SW update lags.
  if(req.mode === "navigate"){
    e.respondWith(
      fetch(req).then(function(res){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put("./index.html", copy); }).catch(function(){});
        return res;
      }).catch(function(){
        return caches.match("./index.html").then(function(hit){ return hit || caches.match("./"); });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function(hit){
      if(hit) return hit;
      return fetch(req).then(function(res){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(req, copy); }).catch(function(){});
        return res;
      }).catch(function(){
        return caches.match("./index.html");
      });
    })
  );
});
