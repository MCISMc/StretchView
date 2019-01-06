$(document).ready(function() {

    //global variables
    var isEnabled = -1;
    var timer = -1;

    //Create class to add webclasses to
    function CssClasses() {
        this.webClasses = [
            { selector: ".video-stream.html5-main-video", className: "youtubeExtraClass" }, // YT
            { selector: ".video-container div video", className: "extraClass" }, // Netflix
            { selector: ".rendererContainer video", className: "extraClass" }, // Amazon Prime Video
			{ selector: "#vid_html5_api", className: "extraClass" }, // Hotstar, HBO GO
            { selector: ".bcPlayer_html5_api video", className: "extraClass" }, // Sony LIV 
			{ selector: ".jw-video jw-reset", className: "extraClass" }, // JioCinema, EROS NOW
            { selector: ".mhp1138_videoWrapper", className: "extraClass" } // Porn Hub

        ];
    }

    //instantiate class
    var classes = new CssClasses();

    //add, add/remove class functionality to Class
    CssClasses.prototype.add = function() {
       classes.webClasses.map((player) => {
           $(player.selector).addClass(player.className);
       })
    };
    CssClasses.prototype.remove = function() {
       classes.webClasses.map((player) => {
           $(player.selector).removeClass(player.className);
       })
    };

    //Check if url is Youtube
    function youtubeCheck() {
        if(window.location.href.indexOf("www.youtube.com") > 0) {
            return true;
        }else{
            return false;
        }
    }

    //Kotkey event functionality
    function initKeyboardEvent() {
        $(document).on('keydown', null, 'g',function(event) {
            console.log(event);
            if(isEnabled === true) {
                chrome.storage.local.set({"extensionIsEnabled":false},function (){
                    isEnabled = false;
                });
            }else if(isEnabled === false){
                chrome.storage.local.set({"extensionIsEnabled":true},function (){
                    isEnabled = true;
                });
            }
        });
    }

    //set or delete youtube timer
    function setYoutubeTimer(isNowEnabled) {
        if(isNowEnabled) {
            timer = setInterval(function(){
                if (document.webkitCurrentFullScreenElement != null) {
                    classes.add();
                }else{
                    classes.remove();
                }
            }, 100);
        }else{
            clearInterval(timer);
            classes.remove();
        }

    }

    //Listen for 'enabled' state change
    function initOnchangeEvent() {
        chrome.storage.onChanged.addListener(function(changes){
            var isNowEnabled = changes.extensionIsEnabled.newValue;
            if(isNowEnabled === true) {
                if(youtubeCheck()) {
                    setYoutubeTimer(isNowEnabled);
                }else{
                    classes.add();
                }
            }else{
                if(youtubeCheck()) {
                    setYoutubeTimer(isNowEnabled);
                }else{
                    classes.remove();
                }
            }
        });
    }

    //Get current 'enabled' state from chrome
    (function initData() {
        chrome.storage.local.get("extensionIsEnabled",function (status){
            isEnabled = status.extensionIsEnabled;
            initKeyboardEvent();
            initOnchangeEvent();
            if(youtubeCheck()) {
                setYoutubeTimer(isEnabled);
            }else{
                if(isEnabled === true) {
                    classes.add();
                }else{
                    classes.remove();
                }
            }
        });
    })();

});
