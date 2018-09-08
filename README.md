# Service Worker

A service worker that provides a lightweight and focused caching strategy for web apps.

This service worker has, so far, been designed for the sole purpose of providing a clear caching strategy that is understandable for the developer and lightweight for the end user. Other Service Worker features have not been implemented, such as Push Notifications.

## Getting Started

Copy the `service-worker.js` file into the root of the publicly accessible directory that you want to allow the service worker access to.

You should tweak aspects of the `service-worker.js` per you project specifics.

Once the service worker is in place, you need to tell the browser to initiate the installation of the service worker, if the browser supports service workers. To do this copy the content from `app.js` and place into a javascript file that you are using in your project. Again certain aspects of the this file may need tweaked based on yours project specifics.

## Acknowledgments

Service worker built on a combination of resources from:

* https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
* https://www.kollegorna.se/en/2017/06/service-worker-gotchas/
* https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle
