// Convert background page to service worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Initialize extension data on install
chrome.runtime.onInstalled.addListener(function (details) {
    // Initialize storage with default values
    chrome.storage.local.set({
        "togglePiP": false,
        "contrast": 100,
        "brightness": 100,
        "saturation": 100,
        "extensionMode": 0
    });
});


