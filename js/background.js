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

// Rest of your background.js code with XMLHttpRequest replaced by fetch API
async function fetchImages(images_to_fetch) {
    for (const [key, url] of Object.entries(images_to_fetch)) {
        try {
            const response = await fetch("https://www.askapache.com/online-tools/base64-image-converter/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    http_remote_url: url,
                    http_remote_file: "(binary)",
                    http_compressimage: "1"
                })
            });
            
            const data = await response.text();
            
            // Store image data
            await chrome.storage.local.set({ [key]: data });
            
            // Increment counter
            const result = await chrome.storage.local.get('numberOfImagesCached');
            await chrome.storage.local.set({ 
                'numberOfImagesCached': (result.numberOfImagesCached || 0) + 1 
            });
            
        } catch (error) {
            console.error('Failed to fetch image:', error);
        }
    }
}


