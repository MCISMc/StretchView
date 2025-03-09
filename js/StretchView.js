StretchView.prototype.classCheck = function () {
    const videos = document.getElementsByTagName("video");
    if (!videos.length) return;

    Array.from(videos).forEach(video => {
        switch (this.mode) {
            case 0:
                video.classList.remove("extraClassAspect", "extraClassCrop");
                break;
            case 1:
                video.classList.remove("extraClassAspect");
                video.classList.add("extraClassCrop");
                break;
            case 2:
                video.classList.add("extraClassAspect");
                video.classList.remove("extraClassCrop");
                break;
        }
    });
};


function StretchView() {
    this.scale = undefined;
    this.scaleX = undefined;
    this.fullscreen = false;
    this.mode = 0;

    this.setScale = function () {
        //get users screen dimensions
        var width = screen.width;
        var height = screen.height;

        //get aspet ratio
        var aspect = width / height;
        this.fullscreenSet();
        //16:9 = 1.77


        if (aspect >= 1.88) {
            this.scaleX = 1.39;
            var scale = aspect / 1.77;
            this.scale = Math.round(scale * 100) / 100;

        } else if (this.mode == 1 || this.mode == 2) {
            if (this.fullscreen == true) {
                this.scaleX = 1;
                // 1.87 Fullscreen scale correction for => 1280*1024
                if (width <= 1280 && height <= 1024) {
                    this.scale = 1.87;
                } else {
                    this.scale = 1.33;
                }
            } else {
                this.scaleX = 1.39;
                this.scale = 1.33;
            }

        } else {
            this.scaleX = 1.39;
            this.scale = 1;
        }

    };

    //Check if url is AirtelXstream
    this.fixScale = function () {
        if (window.location.href.indexOf("www.airtelxstream.in") > 0) {
            this.scaleX = 1.343;
            this.scale = 1.33;
        }
    };






    this.fullscreenSet = function (cb) {
        setTimeout((function () {
            if (document.webkitCurrentFullScreenElement != null) {
                this.fullscreen = true;
            } else {
                this.fullscreen = false;
            }
            this.classCheck();
        }).bind(this), 100);
    };

    this.createCSS = function () {
        const existingStyle = document.getElementById("extraClass");
        if (existingStyle) {
            existingStyle.remove();
        }

        const sheet = document.createElement('style');
        sheet.id = "extraClass";
        sheet.textContent = `
            .extraClassAspect {
                -webkit-transform: scaleX(${this.scaleX})!important;
                transform: scaleX(${this.scaleX})!important;
            }
            .extraClassCrop {
                -webkit-transform: scale(1.0,${this.scale})!important;
                transform: scale(1.0,${this.scale})!important;
            }
        `;
        document.head.appendChild(sheet);
    };

    this.setMode = function (mode) {
        this.mode = mode;
        return mode;
    };

};

var StretchView = new StretchView();

$(document).ready(function () {
    chrome.storage.local.get("extensionMode", function (status) {
        StretchView.setMode(status.extensionMode);
        StretchView.setScale();
        StretchView.fixScale();
        StretchView.fullscreenSet();
        StretchView.createCSS();
        initEvents(StretchView);
    });
    setVideoAdjustments();
    setVideopEventHandler();
});

function setVideoAdjustments() {
    chrome.storage.local.get(["brightness", "contrast", "saturation"], function (results) {
        // console.log(results)
        var brightness = results.brightness / 100.00;
        var contrast = results.contrast / 100.00;
        var saturation = results.saturation / 100.00;

        var video_elements_list = document.getElementsByTagName("video");
        for (var i = 0; i < video_elements_list.length; i++) {
            video_elements_list[i].style.filter = 'brightness(' + brightness + ') saturate(' + saturation + ') contrast(' + contrast + ')';
        }

    });
}


function setVideopEventHandler() {
    var video_elements_list = document.getElementsByTagName("video");
    if (!video_elements_list) return;

    for (var i = 0; i < video_elements_list.length; i++) {
        video_elements_list[i].addEventListener('enterpictureinpicture', function (event) {
            try {
                chrome.storage.local.set({ "togglePiP": true });
            } catch (error) {
                console.log('PiP enter error:', error);
            }
        });

        video_elements_list[i].addEventListener('leavepictureinpicture', function (event) {
            try {
                chrome.storage.local.set({ "togglePiP": false });
            } catch (error) {
                console.log('PiP leave error:', error);
            }
        });
    }
}



var initEvents = function (StretchView) {

    $(window).resize(function () {
        StretchView.setScale();
        StretchView.fixScale();
        StretchView.fullscreenSet();
        StretchView.createCSS();
    });

    $(document).on('keydown', null, 'g', function (event) {
        var state = StretchView.mode;

        if (state < 2) {
            state = StretchView.setMode(StretchView.mode + 1);
        } else {
            state = StretchView.setMode(0);
        }

        chrome.storage.local.set({ "extensionMode": state }, function () {
        });

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

    });

    $(document).on('keydown', null, 'shift+g', function (event) {
        chrome.storage.local.set({ "togglePiP": $(this).prop('checked') }, function () { });
        var video_elements_list = document.getElementsByTagName("video");
        if (video_elements_list) {
            for (var i = 0; i < video_elements_list.length; i++) {
                if (!video_elements_list[i].paused) {
                    try {
                        if (video_elements_list[i] !== document.pictureInPictureElement) {
                            video_elements_list[i].requestPictureInPicture();
                        } else { document.exitPictureInPicture(); }
                    }
                    catch (error) { console.log(error); }
                    finally { }
                }
            }
        }
    });



    chrome.storage.onChanged.addListener(function (changes) {
        if ("extensionMode" in changes) {
            const newMode = changes.extensionMode.newValue;
            
            // Apply changes immediately without delay
            StretchView.setMode(newMode);
            StretchView.setScale();
            StretchView.fixScale();
            StretchView.createCSS();
            StretchView.classCheck();
        }
        setVideoAdjustments();
    });
};

window.addEventListener('stretchview-mode-change', function(e) {
    const newMode = e.detail.mode;
    StretchView.setMode(newMode);
    StretchView.setScale();
    StretchView.fixScale();
    StretchView.createCSS();
    StretchView.classCheck();
});
