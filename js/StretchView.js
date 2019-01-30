StretchView.prototype.classCheck = function () {
    //    console.log(this.scale, this.fullscreen);
    switch (this.mode) {
        // 0: off; 1: aspect; 2: zoom;
        case 0:
            $("video").removeClass("extraClassAspect");
            $("video").removeClass("extraClassCrop");
            break;
        case 1:
            $("video").removeClass("extraClassAspect");
            $("video").addClass("extraClassCrop");
            break;
        case 2:
            $("video").addClass("extraClassAspect");
            $("video").removeClass("extraClassCrop");
            break;
    }   

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
        $('#extraClass').remove();

        var sheet = document.createElement('style')
        sheet.setAttribute("id", "extraClass");
        sheet.innerHTML =
            ".extraClassAspect {" +
            "-webkit-transform: scaleX(" + this.scaleX + ")!important;" +
            //                "object-fit: fill!important;" +
            "}" +
            ".extraClassCrop {" +
            "-webkit-transform: scale(1.0," + this.scale + ")!important;" +
            //                "object-fit: cover!important;" +
            "}";
        document.body.appendChild(sheet);
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
        StretchView.fullscreenSet();
        StretchView.createCSS();
        initEvents(StretchView);
    });
    setVideoAdjustments();
    setVideopipEventHandler();
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


function setVideopipEventHandler() {
    var video_elements_list = document.getElementsByTagName("video");
    if(video_elements_list) {
      for (var i = 0; i < video_elements_list.length; i++) {
        video_elements_list[i].addEventListener('enterpictureinpicture', function(event) {
            const pipWindow = event.pictureInPictureWindow;
            chrome.storage.local.set({ "togglePiP": true }, function () {
                $("#btnPiP").prop("checked", true);
            });        
        });

        video_elements_list[i].addEventListener('leavepictureinpicture', function(event) {
            chrome.storage.local.set({ "togglePiP": false }, function () {
                $("#btnPiP").prop("checked", false);
            });
        });
      }
    }    
} 

var initEvents = function (StretchView) {

    $(window).resize(function () {
        StretchView.setScale();
        StretchView.fullscreenSet();
        StretchView.createCSS();
    });

    $(document).on('keydown', null, 'g', function (event) {
        var state = StretchView.mode;

        if (state < 2) {
            if (this.fullscreen == true && state == 1) {
                state = StretchView.setMode(0);
            } else {
                state = StretchView.setMode(StretchView.mode + 1);
            }

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

    chrome.storage.onChanged.addListener(function (changes) {
        if ("extensionMode" in changes) {
            StretchView.setMode(changes.extensionMode.newValue);
        }
        StretchView.setScale();
        StretchView.createCSS();
        StretchView.classCheck();
        setVideoAdjustments();
    });
};
