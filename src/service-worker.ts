import "ts-polyfill";

declare const self: ServiceWorkerGlobalScope;

const versionInfo = "__SERVICE_WORKER_VERSION_INFO__";  // replaced by webpack using string-replace-loader

import { WorkboxPlugin } from "workbox-core";
import { registerRoute } from "workbox-routing";
import { CacheOnly, NetworkFirst } from "workbox-strategies";
// import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { RangeRequestsPlugin } from "workbox-range-requests";

import serviceWorkerHash from "./webpack-utils/service-worker-hash";

const ignoredGets: RegExp[] = [
  /\/sockjs-node\/info/,                           // webpack-dev-server
  /\.hot-update\./,                                // webpack-dev-server
  /\/firestore\.googleapis\.com\//,                // firebase
  /\/install\.html/,                               // installer
  /\/assets\/install\.*/,                          // installer
  /\/app-manifest\.js/,                            // installer
  /\/offline-manifests\/.*/,                       // built in manifests
  /https:\/\/learn\.(staging\.)?concord\.org\/.*/  // portal apis when launached from the portal
];

/**
   Strip out the __WB_REVISION__ parameter
   Note this also escapes the parameters, so it needs to be applied to both the
   write and read operations
   For example URLs like this one:
     https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap
   get converted to this format when passing through:
     https://fonts.googleapis.com/css2?family=Lato%3Awght%40400%3B700%3B900&display=swap
**/
const stripWbRevision: WorkboxPlugin = {
  cacheKeyWillBeUsed: async ({request, mode, params, event, state}) => {
    const url = new URL(request.url);
    url.searchParams.delete("__WB_REVISION__");
    // We need to create a request with headers because the return value is
    // passed through to future callbacks. If a simple url is returned then
    // Workbox makes a generic Request object with no headers.
    // The headers are important specifically for the Range Plugin which
    // hooks into the cachedResponseWillBeUsed and looks at the headers of
    // the response object passed in.
    return new Request(url.href, {headers: request.headers});
  }
};

// If the service worker is loaded at:
// https://example.com/path/service-worker.js
// Then treat
//   https://example.com/path/
//   https://example.com/path/index.html
//   https://example.com/path/index.html?anyParam=hi&anyOtherParam
// All as the same url from the cache they all will have the cache key of
//   https://example.com/path/index.html
const rootUrl = new URL(".", location.href);
const rootIndexHtmlUrl = new URL("index.html", location.href);
const cleanIndexHtmlParams: WorkboxPlugin = {
  cacheKeyWillBeUsed: async ({request, mode, params, event, state}) => {
    const url = new URL(request.url);
    if (url.origin === location.origin &&
        (url.pathname === rootUrl.pathname ||
         url.pathname === rootIndexHtmlUrl.pathname) ) {
      // To be safe we pass the headers through, just like we do when
      // stripping the __WB_REVISION__
      return new Request(rootIndexHtmlUrl.href, {headers: request.headers});
    } else {
      return request;
    }
  }
};

registerRoute(
  ({ request }) => {
    const isGet = request.method.toUpperCase() === "GET";
    // It is tempting to try to block firestore and portal requests here
    // when we aren't launched from the portal.
    // However, those should only happen if the application code is buggy.
    // Additionally there isn't a good way to implement that, there is just
    // one service worker used by all clients: browser tabs and the PWA.
    // So it is possible there will be one 'client' that is launched from the
    // portal and another client that is not. Because of that we can't
    // consitently block these requests.
    const isIgnored = !!ignoredGets.find(ig => ig.test(request.url));
    return isGet && !isIgnored;
  },
  new CacheOnly({
    cacheName: "cachedGets",
    plugins: [
      // handle range requests
      new RangeRequestsPlugin(),
      // We don't really need to delete the __WB_REVISION__ here
      // but otherwise the cache key will not match the key used during the install
      stripWbRevision,
      cleanIndexHtmlParams
    ],
  }),
);


// These were taken from workbox-routing/Router
// they will likely need to be changed so we can include revisions
// which can force updates from what is cached.
type RequestArgs = string | [string, RequestInit?];
interface CacheURLsMessageData {
  type: string;
  payload: {
    urlsToCache: RequestArgs[];
  };
}

// This was taken from workbox-routing/Router

/**
 * Adds a message event listener for URLs to cache from the window.
 * This is useful to cache resources loaded on the page prior to when the
 * service worker started controlling it.
 *
 * The format of the message data sent from the window should be as follows.
 * Where the `urlsToCache` array may consist of URL strings or an array of
 * URL string + `requestInit` object (the same as you'd pass to `fetch()`).
 *
 * ```
 * {
 *   type: 'CACHE_URLS',
 *   payload: {
 *     urlsToCache: [
 *       './script1.js',
 *       './script2.js',
 *       ['./script3.js', {mode: 'no-cors'}],
 *     ],
 *   },
 * }
 * ```
 */
function addCacheListener() {
  const networkFirst = new NetworkFirst({
    cacheName: "cachedGets",
    // Skip the disk cache when fetching
    // This fixes a problem where a user visiting an online page with some
    // of the offline assets in it will populate the disk cache with those
    // assets. But they might be stored without CORS headers in the response
    // which then breaks the request made here.
    fetchOptions: {cache: "no-store"},
    plugins: [
      stripWbRevision,
      cleanIndexHtmlParams,
      {
        // Don't allow reads from the cache. We only want to populate the cache.
        // If a network request fails we don't want to return the old value
        // from the cache. It might be out of date, and we want the network
        // error to propigate up.
        //
        // TODO: it'd be better if every manifest included urls with hashes in
        // them. The Workbox generated manifests include __WB_REVISION__. If that
        // was present in every entry then we could add that to a header in
        // the response stored in the cache, then we'd access that response
        // and see if the new entry matched, if so we could just return it.
        // if it didn't match then we'd download it from the network
        cachedResponseWillBeUsed: async ({cacheName, request, matchOptions, cachedResponse, event, state}) => {
          return null;
        }
      }
    ]
  });

  // See https://github.com/Microsoft/TypeScript/issues/28357#issuecomment-436484705
  self.addEventListener("message", ((event: ExtendableMessageEvent) => {
    if (event.data && event.data.type === "CACHE_URLS_WITH_PROGRESS") {
      const {payload}: CacheURLsMessageData = event.data;
      const messagePort: MessagePort | undefined = event.ports?.[0];

      console.log(`Caching URLs from the window`, payload.urlsToCache);

      const requestPromises = Promise.allSettled(payload.urlsToCache.map(
          (entry: string | [string, RequestInit?]) => {
        if (typeof entry === "string") {
          entry = [entry];
        }

        const request = new Request(...entry);
        // Use a specific strategy that is not registered as a route
        // this way we get Workbox's strategy features without affecting
        // regular page network requests
        const [responsePromise, donePromise] = networkFirst.handleAll({request, event});

        if (messagePort) {
          let errorOccurred = false;
          responsePromise.then(response => {
            // At this point the response is ready. But this seems to happen
            // when the browser recieves the headers from the get request.
            // The actual caching of the data might take a while longer as
            // there is a seperate body promise that is used to access that.
            // The donePromise resolves when this caching is complete.
          }).catch(error => {
            // Only report an error once. It is possible the donePromise errored
            // first.
            if(!errorOccurred) {
              messagePort.postMessage({type: "URL_CACHE_FAILED", payload: {url: request.url, error}});
              errorOccurred = true;
            }
          });

          donePromise.then(() => {
            // Based on the implementation it is impossible for the responsePromise
            // to thow an error and the donePromise to complete. But based on the
            // api definition this could be possible, so I'm erring on the side
            // of caution. And checking for the error here.
            // We wouldn't want to send both a failed message and a
            // success message for the same url.
            if(!errorOccurred){
              messagePort.postMessage({type: "URL_CACHED", payload: {url: request.url}});
            }
          }).catch(error => {
            // Only report an error once. It is possible the responsePromise errored
            // first.
            if(!errorOccurred) {
              messagePort.postMessage({type: "URL_CACHE_FAILED", payload: {url: request.url, error}});
              errorOccurred = true;
            }
          });
        }

        return donePromise;

      // TODO(philipwalton): TypeScript errors without this typecast for
      // some reason (probably a bug). The real type here should work but
      // doesn't: `Array<Promise<Response> | undefined>`.
      }) as any[]); // TypeScript

      // This is needed to keep the service worker alive while it is fetching
      // otherwise the browser can aggresively stop the worker.
      // This might not actually be needed because the event is being passed
      // to the networkFirst handler too, which ought to call waitUntil itself
      event.waitUntil(requestPromises);

      if (messagePort) {
        requestPromises.then(() => {
          // We are using allSettled so if there is an error the caching will
          // continue
          messagePort.postMessage({type: "CACHING_FINISHED"});
        });
      }
    }
  }) as EventListener);
}

addCacheListener();

addEventListener("message", (event) => {
  if (event.data) {
    switch (event.data.type) {
      case "SKIP_WAITING":
        console.log("Calling skipWaiting() from service worker...");
        self.skipWaiting();
        break;

      case "GET_VERSION_INFO":
        console.log("Got version info request");
        event.ports[0].postMessage(versionInfo + " hash: " + serviceWorkerHash);
        break;
    }
  }
});

console.log("hello from the compiled service-worker!!!!!");
