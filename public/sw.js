/**
 * FructoSahel Service Worker
 * Provides offline support for farmers with intermittent connectivity
 * Handles:
 * - Static asset caching
 * - API response caching
 * - Background sync for queued mutations
 * - Push notifications
 */

const CACHE_VERSION = "v1";
const STATIC_CACHE_NAME = `fructosahel-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `fructosahel-dynamic-${CACHE_VERSION}`;
const API_CACHE_NAME = `fructosahel-api-${CACHE_VERSION}`;

// Static assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/favicon.ico",
];

// API endpoints to cache for offline access
const CACHEABLE_API_ROUTES = [
  "/api/farms",
  "/api/fields",
  "/api/crops",
  "/api/tasks",
  "/api/transactions",
  "/api/sales",
  "/api/users",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log("[SW] Caching static assets");
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  // Activate immediately without waiting for old SW to stop
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return (
              cacheName.startsWith("fructosahel-") &&
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== API_CACHE_NAME
            );
          })
          .map((cacheName) => {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }),
      );
    }),
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - handle requests with caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (mutations are handled separately)
  if (request.method !== "GET") {
    return;
  }

  // Skip requests to different origins
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets (JS, CSS, images)
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Handle navigation requests (HTML pages)
  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Default: network first, fallback to cache
  event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
});

// Handle API requests with network-first, cache-fallback strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const isCacheableRoute = CACHEABLE_API_ROUTES.some((route) =>
    url.pathname.startsWith(route),
  );

  if (!isCacheableRoute) {
    // Non-cacheable API routes - network only
    try {
      return await fetch(request);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Network unavailable", offline: true }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  try {
    // Try network first
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(API_CACHE_NAME);
      const responseToCache = networkResponse.clone();

      // Add timestamp to cached response
      const headers = new Headers(responseToCache.headers);
      headers.set("sw-cached-at", Date.now().toString());

      const body = await responseToCache.blob();
      const cachedResponse = new Response(body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers,
      });

      cache.put(request, cachedResponse);
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      // Return cached response with offline indicator
      const data = await cachedResponse.clone().json();
      return new Response(
        JSON.stringify({
          ...data,
          _offline: true,
          _cachedAt: cachedResponse.headers.get("sw-cached-at"),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // No cached data available
    return new Response(
      JSON.stringify({ error: "No cached data available", offline: true }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Return cached version immediately
    // Optionally update cache in background
    fetch(request)
      .then((response) => {
        if (response.ok) {
          caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(request, response);
          });
        }
      })
      .catch(() => {
        // Silently fail background update
      });

    return cachedResponse;
  }

  // Not in cache, fetch from network
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Return a fallback or error
    return new Response("Asset not available offline", { status: 503 });
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const response = await fetch(request);

    if (response.ok) {
      // Cache successful navigation responses
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Try to return the root page as fallback for SPA navigation
    const rootCache = await caches.match("/");
    if (rootCache) {
      return rootCache;
    }

    // Return offline page
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>FructoSahel - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #f5f5f5;
              color: #333;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            h1 { color: #16a34a; }
            p { color: #666; margin: 1rem 0; }
            button {
              background: #16a34a;
              color: white;
              border: none;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              cursor: pointer;
              font-size: 1rem;
            }
            button:hover { background: #15803d; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>You're Offline</h1>
            <p>FructoSahel requires an internet connection for this page.</p>
            <p>Your cached data is still available.</p>
            <button onclick="location.reload()">Try Again</button>
          </div>
        </body>
      </html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html" },
      },
    );
  }
}

// Network first strategy with cache fallback
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Check if URL is a static asset
function isStaticAsset(pathname) {
  const staticExtensions = [
    ".js",
    ".css",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
  ];
  return (
    staticExtensions.some((ext) => pathname.endsWith(ext)) ||
    pathname.startsWith("/_next/static/")
  );
}

// Background sync for queued mutations
self.addEventListener("sync", (event) => {
  console.log("[SW] Sync event:", event.tag);

  if (event.tag === "sync-mutations") {
    event.waitUntil(syncQueuedMutations());
  }
});

// Sync queued mutations from IndexedDB
async function syncQueuedMutations() {
  try {
    // Open IndexedDB and get queued mutations
    const db = await openDatabase();
    const mutations = await getAllMutations(db);

    console.log("[SW] Syncing", mutations.length, "queued mutations");

    for (const mutation of mutations) {
      try {
        const response = await fetch(mutation.url, {
          method: mutation.method,
          headers: {
            "Content-Type": "application/json",
          },
          body: mutation.body ? JSON.stringify(mutation.body) : undefined,
        });

        if (response.ok) {
          // Remove from queue after successful sync
          await deleteMutation(db, mutation.id);
          console.log("[SW] Successfully synced mutation:", mutation.id);

          // Notify clients about successful sync
          const clients = await self.clients.matchAll();
          clients.forEach((client) => {
            client.postMessage({
              type: "MUTATION_SYNCED",
              payload: { id: mutation.id, success: true },
            });
          });
        } else {
          console.error(
            "[SW] Failed to sync mutation:",
            mutation.id,
            response.status,
          );

          // Handle conflict (409) - server data wins (last-write-wins)
          if (response.status === 409) {
            await deleteMutation(db, mutation.id);
            const clients = await self.clients.matchAll();
            clients.forEach((client) => {
              client.postMessage({
                type: "MUTATION_CONFLICT",
                payload: { id: mutation.id },
              });
            });
          }
        }
      } catch (error) {
        console.error("[SW] Error syncing mutation:", mutation.id, error);
        // Keep in queue for next sync attempt
      }
    }
  } catch (error) {
    console.error("[SW] Error during sync:", error);
  }
}

// IndexedDB helpers
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("fructosahel-offline", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create stores if they don't exist
      if (!db.objectStoreNames.contains("mutations")) {
        db.createObjectStore("mutations", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("cache")) {
        const cacheStore = db.createObjectStore("cache", { keyPath: "key" });
        cacheStore.createIndex("type", "type", { unique: false });
        cacheStore.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };
  });
}

function getAllMutations(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["mutations"], "readonly");
    const store = transaction.objectStore("mutations");
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deleteMutation(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["mutations"], "readwrite");
    const store = transaction.objectStore("mutations");
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Push notifications
self.addEventListener("push", (event) => {
  console.log("[SW] Push received");

  let notificationData = {
    title: "FructoSahel",
    body: "You have a new notification",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "default",
    data: {},
    requireInteraction: false,
    actions: [],
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        ...notificationData,
        ...payload,
      };
    } catch (e) {
      console.error("[SW] Error parsing push data:", e);
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data,
    requireInteraction: notificationData.requireInteraction,
    actions: notificationData.actions,
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options),
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification click received");

  const notification = event.notification;
  const action = event.action;
  const data = notification.data || {};

  notification.close();

  let targetUrl = "/dashboard/tasks";

  if (action === "view" && data.url) {
    targetUrl = data.url;
  } else if (action === "complete" && data.taskId) {
    targetUrl = `/dashboard/tasks?complete=${data.taskId}`;
  } else if (action === "acknowledge" || action === "dismiss") {
    return;
  } else if (data.url) {
    targetUrl = data.url;
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    }),
  );
});

// Notification close event
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed", event.notification.tag);
});

// Message handler for communication with the app
self.addEventListener("message", (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;

    case "GET_CACHE_STATUS":
      getCacheStatus().then((status) => {
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage(status);
        }
      });
      break;

    case "CLEAR_CACHE":
      clearAllCaches().then(() => {
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      });
      break;

    case "FORCE_SYNC":
      syncQueuedMutations().then(() => {
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      });
      break;
  }
});

// Get cache status
async function getCacheStatus() {
  const cacheNames = await caches.keys();
  const status = {};

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    status[name] = keys.length;
  }

  // Get pending mutations count
  try {
    const db = await openDatabase();
    const mutations = await getAllMutations(db);
    status.pendingMutations = mutations.length;
  } catch (error) {
    status.pendingMutations = 0;
  }

  return status;
}

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((name) => name.startsWith("fructosahel-"))
      .map((name) => caches.delete(name)),
  );
}

console.log("[SW] Service worker loaded");
