if ('serviceWorker' in navigator) {
    //Register the service worker if it is supported.
    window.addEventListener('load', function() {
        // register a service worker
        navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
          // registration was successful
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
          // registration failed :(
          console.log('ServiceWorker registration failed: ', err);
        });
    });
}
