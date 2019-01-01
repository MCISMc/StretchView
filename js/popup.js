$(document).ready(function() {
    var isOn = -1;
    chrome.storage.local.get("extensionMode",function (results){
        var mode = results.extensionMode;
        switch(mode) {
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
    $("#off").click(function() {
        $("#forceStretch").prop("checked", false);
        $("#forceAspect").prop("checked", false);
        chrome.storage.local.set({"extensionMode":0},function (){
        });
    });

    $("#forceStretch").click(function() {
        $("#off").prop("checked", false);
        $("#forceAspect").prop("checked", false);
        chrome.storage.local.set({"extensionMode":1},function (){
        });
    });
    $("#forceAspect").click(function() {
        $("#off").prop("checked", false);
        $("#forceStretch").prop("checked", false);
        chrome.storage.local.set({"extensionMode":2},function (){
        });
    });
});



