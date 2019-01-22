chrome.runtime.onInstalled.addListener(function (details) {
    var manifest = chrome.runtime.getManifest();
    var version = (manifest.version);
    if (details.reason == "update") {
        chrome.notifications.create(null, {
            type: "basic",
            iconUrl: "images/logo-128.png",
            title: "StretchView Add-On updated",
            message: "Update log: updated to version " + version + " ",
        }, function (updateNotificationId) {
            chrome.notifications.onClicked.addListener(function (notificationId) {
                if (notificationId === updateNotificationId) {
                    var newURL = "https://github.com/MCISMc/StretchView";
                    chrome.tabs.create({ url: newURL });
                    chrome.notifications.clear(updateNotificationId);
                }
            });
        });
    }
    chrome.storage.local.set({ "extensionMode": 0 }, function () {
    });
    chrome.storage.local.set({ "togglePiP": false }, function () {
    });
    chrome.storage.local.set({ "contrast": 100 }, function () {
    });
    chrome.storage.local.set({ "brightness": 100 }, function () {
    });
    chrome.storage.local.set({ "saturation": 100 }, function () {
    });
    localStorage.setItem('NumberOfImagesCached', 0);
});

