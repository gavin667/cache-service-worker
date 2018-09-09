/* INTRODUCTION =================================================================== */

/*
	This service worker, at this stage, has been designed for caching only.

	An ongoing aim of this service worker is to make the caching strategy really
	clean for the user and as a result easy for the developer to understand. We
	don't want to cache hundreds or thousands of items to provide an offline
	experience, just the essentials.

	It should be easy to manipulate this file if certain features of this worker
	aren't needed, for example the versioned files feature.

	DO NOT FORGET TO REGISTER THE SERVICE WORKER IN THE MAIN
	APPLICATION JAVASCRIPT. SEE app.js ON HOW TO DO THIS.
*/

/* CONFIG =================================================================== */

/*
	IMPROVEMENT: When should the version number be incremented? When a single file changes? Or just on new releases of the web app?
*/

var cacheVersion = 'v1';




/* INSTALL SERVICE WORKER =================================================== */

/*
	Install service worker with initial files to cache
	These files listed should be the files that are absolutely necessary for an MVP offline experience.
*/

self.addEventListener('install', function(event) {
	//The service worker will not resolve as having "installed" until all assets have been cached
	event.waitUntil(
		caches.open(cacheVersion).then(function(cache){
			//The assets listed below are a list of assets that are essential to the apps offline operation and experience
			return cache.addAll([
				//pages
				'/',
				'/examples',
				'/about',
				'/contact',
				'/cv',

				//fonts
				'/fonts/font-awesome/fontawesome-webfont.woff2',
				'/fonts/roboto/roboto-regular-webfont.woff2',
				'/fonts/titillium/titilliumweb-bold-webfont.woff2',
				'/fonts/titillium/titilliumweb-italic-webfont.woff2',
				'/fonts/titillium/titilliumweb-light-webfont.woff2',
				'/fonts/titillium/titilliumweb-regular-webfont.woff2',
				'/fonts/titillium/titilliumweb-semibold-webfont.woff2',

				'/fonts/font-awesome/fontawesome-webfont.woff',
				'/fonts/custom-font/gavin-kemp.woff',
				'/fonts/roboto/roboto-regular-webfont.woff',
				'/fonts/titillium/titilliumweb-bold-webfont.woff',
				'/fonts/titillium/titilliumweb-italic-webfont.woff',
				'/fonts/titillium/titilliumweb-light-webfont.woff',
				'/fonts/titillium/titilliumweb-regular-webfont.woff',
				'/fonts/titillium/titilliumweb-semibold-webfont.woff',

				'/fonts/font-awesome/fontawesome-webfont.ttf',
				'/fonts/custom-font/gavin-kemp.ttf',
				'/fonts/roboto/roboto-regular-webfont.ttf',
				'/fonts/titillium/titilliumweb-bold-webfont.ttf',
				'/fonts/titillium/titilliumweb-italic-webfont.ttf',
				'/fonts/titillium/titilliumweb-light-webfont.ttf',
				'/fonts/titillium/titilliumweb-regular-webfont.ttf',
				'/fonts/titillium/titilliumweb-semibold-webfont.ttf',

				//images
				'/images/brand/gavin-kemp-logo-1x.png',
				'/images/brand/gavin-kemp-logo-2x.png',

				//pdfs
				'/documents/gavin_kemp_web_developer_cv_june_2017.pdf'
			]);
		}).then(function(){
			//Files added into the cache. Now we call our own promise to get versioned/manifest files to cache.
			versionedFiles.then(function(result){
				//Versioned files fetch called and sucessfully retrieved and the current cache version is already in existance.
				//Now it's ok to cache manifest files into the current cache
				caches.open(cacheVersion).then(function(cache){
					return cache.addAll([
						result["/css/app.css"],
						result["/js/app.js"]
					]);
				}).catch(function(err){
					console.log("Could not cache assets from versionFiles function. Error: " + err);
				})
			})
		}).catch(function(err) {
			console.log("Failed to intialise cache with pre-required assets. An asset that was spacified in the cache list may have been moved, removed or is not accessible. No assets have been added to the service worker on this trip.");
		})
	);
});




/* HIJACK REQUESTS ========================================================== */

/*
	Now the service worker is told to listen to all future "fetch" requests and
	to cache the request into the original cache we set the service worker up with.
*/

self.addEventListener('fetch', function(event){
	/*
		Special caching for html pages (page gets cached on each fetch as resources within could have changed).
		The fetch request looks at the event request header type and decides if it is HTML or not.
	*/
	if(event.request.headers.get('Accept').includes('text/html')) {
		event.respondWith(
			fetch(event.request).then(function(response){
				/*
					Only add the HTML page to the cache if it comes from the same origin. Third party responses should
					not be cached as this could quickly build up the cache and cause the browser to reduce the cache or remove it
					if it grows too large.
				*/
				if(location.hostname === event.request.url.split('/')[2]) {
					//Cache the resource and return the response
					return caches.open(cacheVersion).then(function(cache){
						cache.put(event.request, response.clone());
						return response;
					})
				}
				//Return the event.request response without adding it to the cache, since it's not from the same origin
				return response;
			}).catch(function(){
				//Try pulling existing HTML from cache.
				return caches.match(event.request).then(function(response) {
					/*
						If a match is made from the cache for an HTML page return it or if there is no match
						in the cache fall back to the offline page
					*/
					return response || caches.match('/offline');
				}).catch(function(){
					console.warn('There were no cached files found for this resource and the network did not provide the file to cache.');
				})
			})
		)
	}
	//If it's not an html page provide the below method of caching
	else {
		event.respondWith(
			caches.match(event.request).then(function(response){
				if(location.hostname === event.request.url.split('/')[2]) {
					//cache the resource and serve it
					return response || fetch(event.request).then(function(response){
						return caches.open(cacheVersion).then(function(cache){
							cache.put(event.request, response.clone());
							return response;
						})
					})
				}
				return fetch(event.request);
			}).catch(function(){
				console.warn('There were cached files not found and network did not provide the file to cache.');
			})
		);
	}
});




/* ACTIVATE SERVICE WORKER ========================================================== */

/*
	The service worker will only activate after a successful installation.
	If an existing service worker is found but the cache version has changed
	and does not match any of the existing installed service workers the
	version(s) of the service worker that do not match the new cache name will
	be removed.
*/

//Fetch requests will not continue to cache until the activate event has resolved
self.addEventListener('activate', function(event){
	console.log('Service Worker ' + cacheVersion + ' activated.');
	event.waitUntil(
		//Loop through each cache
		caches.keys().then(function(cacheNames){
			return Promise.all(
				//Find each of the current caches and return true to the promise to continue with the map method
				cacheNames.filter(function(cacheName){
					return true;
				}).map(function(cacheName){
					//find each cache version in the array and delete it, only if the cache version does not match the current cache version
					if(cacheName != cacheVersion) {
						return caches.delete(cacheName)
					}
				})
			)
		})
	)
});



/* VERSIONED FILES ========================================================== */

/*
	Find version assets from a manifest file generated in json.
	Manifested files should be cached on setting up the service worker and the initial install as they are core
	to the application working. If they aren't fetched on installation they would be retrieved on the next page refresh or set of fetch requests.
	However take this example, what happens if the user only visits the one page and goes offline? Essential manifest listed files wouldn't be
	avialable and the web app could crash.

	Running a fetch request in this way is not render blocking for the client as
	the service worker does not run on the main thread.

	IMPROVEMENT: When a new versioned JS/CSS is created the old JS/CSS versioned file doesn't get deleted from the cache
	it just gets added to it. There should be functionality inside the promise below to remove the old versioned file of the JS/CSS
	if the version in the cache doesn't match the new versioned file name of the JS/CSS file about to be cached.
*/

//Create a promise to use later
var versionedFiles = new Promise(function(resolve, reject){
	let fetchSettings = {
		headers: {
			'Authorization': 'Basic ' + btoa('username:password')
		}
	}
	fetch('/mix-manifest.json', fetchSettings).then(function(response){
		if(response.status == 200) {
			response.json().then(function(data){
				//resolve the promise with the data retrieved from the manifest file
				resolve(data);
			})
		}
		else {
			//reject the promise with an error if there was a problem in retrieving the manifest file
			reject(Error("Not working."));
		}
	}).catch(function(){
		console.log("Fetch error.");
	})
});

/* USEFUL HELPERS =========================================================== */

// Find how much storage space is available for the service worker to cache files.
if ('storage' in navigator && 'estimate' in navigator.storage) {
	navigator.storage.estimate().then(({usage, quota}) => {
		console.log(`Using ${usage} out of ${quota} bytes.`);
	});
}


/* OTHER IMPROVEMENTS ======================================================= */

/*
	1 --------------------------------------------------------------------------
	Add fetch request to get the page the user has landed on and to add it to the current version of the cache there and then.
	This is instead of waiting for the user to reload the page or navigate elsewhere, when the page would be cached as the service worker
	would have already been installed by this step.
*/
