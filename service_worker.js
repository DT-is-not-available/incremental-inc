// Cached core static resources 
self.addEventListener("install",e=>{
	e.waitUntil(
		caches.open("static").then(cache=>{
			caches.keys().then(function(names) {
			    for (let name of names)
			        caches.delete(name);
			});
		})
	);
});

// Fatch resources
self.addEventListener("fetch",e=>{
	e.respondWith(
		caches.match(e.request).then(response=>{
			return response||fetch(e.request);
		})
	);
});

console.log("Service Worker Running!")