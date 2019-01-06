$(document).ready(function () {
    var isOn = -1;
    chrome.storage.local.get("extensionMode", function (results) {
        var mode = results.extensionMode;
        switch (mode) {
            // 0: off; 1: stretch; 2: fix-aspect-ratio;
            case 0:
                $("#off").prop("checked", true);
                break;
            case 1:
                $("#forceStretch").prop("checked", true);
                break;
            case 2:
                $("#forceAspect").prop("checked", true);
                break;
        }
    });
    $("#off").click(function () {
        $("#forceStretch").prop("checked", false);
        $("#forceAspect").prop("checked", false);
        chrome.storage.local.set({ "extensionMode": 0 }, function () {
        });
    });

    $("#forceStretch").click(function () {
        $("#off").prop("checked", false);
        $("#forceAspect").prop("checked", false);
        chrome.storage.local.set({ "extensionMode": 1 }, function () {
        });
    });
    $("#forceAspect").click(function () {
        $("#off").prop("checked", false);
        $("#forceStretch").prop("checked", false);
        chrome.storage.local.set({ "extensionMode": 2 }, function () {
        });
    });

});

function getBase64FromImageUrl(url) {
    var img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(this, 0, 0);
        // var dataURL = canvas.toDataURL("image/png");
        var dataURL = canvas.toDataURL();
        // alert(dataURL.replace(/^data:image\/(png|jpg);base64,/, ""));
        // alert(dataURL);
        return dataURL;
    };
    img.src = url;
}

function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
}

