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
    chrome.commands.onCommand.addListener(function (command) {
        console.log('Command:', command);
        if (command == "toggle-feature-foo") {
            //  it is for pip
            chrome.storage.local.set({ "togglePiP": true }, function () { });
            const code = `(async () => {
            var video_elements_list = document.getElementsByTagName("video");
            if(video_elements_list) {
              for (var i = 0; i < video_elements_list.length; i++) {
                if(!video_elements_list[i].paused) {
                    try {
                      if (video_elements_list[i] !== document.pictureInPictureElement) {
                        await video_elements_list[i].requestPictureInPicture();
                      } else { await document.exitPictureInPicture(); }
                    }
                    catch(error) { console.log(error); }
                    finally { btntogglePiP.disabled = false;}
                }
              }
            } 
        })()`;
            chrome.tabs.executeScript({ code, allFrames: true });
        }
    });
});


