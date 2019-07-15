'use strict';
let assets=[]
const CACHE_VERSION = 2.6;
let CURRENT_CACHE = 'offline-v' + CACHE_VERSION
let OLD_CACHE = 'offline-v' + (CACHE_VERSION - 0.1 )
const serviceWorkerFile = 'number-to-words-sw.js'
assets = assets.map(asset=>{
  if(!asset) return "/number-to-words/"
  return asset
})
assets.push("/")


function createCacheBustedRequest(url) {
    console.log('creating cache busting url for ', url)
    let request = new Request(url, {cache: 'reload'});
    console.log('request ', request)
    // See https://fetch.spec.whatwg.org/#concept-request-mode
    // This is not yet supported in Chrome as of M48, so we need to explicitly check to see
    // if the cache: 'reload' option had any effect.
    if ('cache' in request) {
        return request;
    }

    // If {cache: 'reload'} didn't have any effect, append a cache-busting URL parameter instead.
    let bustedUrl = new URL(url, self.location.href);
    console.log({bustedUrl})
    bustedUrl.search += (bustedUrl.search ? '&' : '') + 'cachebust=' + Date.now();
    console.log('bustedUrl ', bustedUrl)
    console.log('request ', Request(bustedUrl))
    return new Request(bustedUrl);
}

function cacheAssets( assets, currentCache, previousCache ) {
  return new Promise( function (resolve, reject) {
    // open cache
    console.log(assets)
    caches.open(previousCache)
    .then(oldCache=>{
      caches.open(currentCache)
      .then(newCache=>{
        if(oldCache){
          for(let req of assets){
            console.log('caching ', req)
            try{
              oldCache.match(req)
              .then(res=>{
                if(res){
                  newCache.put(req, res)
                  oldCache.delete(req)
                }
                else{
                  newCache.add(req)
                }
              })
              .catch(_=>{
                newCache.add(req)
              })
            }
            catch(err){
              console.error(err)
            }
            console.log(req ,' cached')
          }
          resolve()
        }
        else{
          currentCache.addAll(assets)
          .then(()=>{
            resolve()
            console.log('add all succes')
          })
          .catch(err=>{
            console.error(err, assets)
            reject(err)
          })
        }
      })
    })
  })
}

self.addEventListener('install', event => {
    event.waitUntil(
      // We can't use cache.add() here, since we want OFFLINE_URL to be the cache key, but
      // the actual URL we end up requesting might include a cache-busting parameter.
      // fetch(createCacheBustedRequest(OFFLINE_URL)).then(function(response) {
      //   return caches.open(CURRENT_CACHES.offline).then(function(cache) {
      //     return cache.put(OFFLINE_URL, response);
      //   });
      // })
      cacheAssets(assets, CURRENT_CACHE, OLD_CACHE)

    );
  });
  
  self.addEventListener('activate', event => {
    // Delete all caches that aren't named in CURRENT_CACHES.
    // While there is only one cache in this example, the same logic will handle the case where
    // there are multiple versioned caches.
    event.waitUntil(
      caches.delete(OLD_CACHE)
    );
  });

self.addEventListener('push', function (event){
  if (Notification.permission === 'denied') return;
    let payload = {};
    try{
      if (event.data)
        payload = event.data.json();
    }
    catch(err){return}
    const {body, icon, badge, image, data, actions, dir, lang, renotify, requireInteraction, tag, vibrate} = payload
    event.waitUntil(self.registration.showNotification(title, {body, icon, badge, image, data, actions, dir, lang, renotify, requireInteraction, tag, vibrate}));
});



self.addEventListener('notificationclick', function(event) {
  event.waitUntil(
      clients.openWindow(event.notification.data)
  )    
  event.notification.close();
});

self.addEventListener('message', messageEvent=>{
  if(messageEvent.data === 'skipWaiting') return skipWaiting();
})

self.addEventListener('fetch', async event => {
    // We only want to call event.respondWith() if this is a navigation request
    // for an HTML page.
    // request.mode of 'navigate' is unfortunately not supported in Chrome
    // versions older than 49, so we need to include a less precise fallback,
    // which checks for a GET request with an Accept: text/html header.
    // var cachedResponse = await caches.match(event.request).catch(function() {
    //   return fetch(event.request);
    // }).then(function(response) {
    //   return response;
    // }).catch(function() {
    //   return 'hello'
    // });

    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
    // If our if() condition is false, then this fetch handler won't intercept the request.
    // If there are any other fetch handlers registered, they will get a chance to call
    // event.respondWith(). If no fetch handlers call event.respondWith(), the request will be
    // handled by the browser as if there were no service worker involvement.
  });