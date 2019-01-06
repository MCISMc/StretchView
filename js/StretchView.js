StretchView.prototype.classCheck = function() {
    //    console.log(this.scale, this.fullscreen);
    switch(this.mode) {
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


function StretchView()  {
    this.scale = undefined;
    this.fullscreen = false;
    this.mode = 0;

    this.setScale = function() {
        //get users screen dimensions
        var width = screen.width;
        var height = screen.height;

        //get aspet ratio
        var aspect = width/height;

        //16:9 = 1.77

        if(aspect >= 1.88) {
            var scale = aspect / 1.77;
            this.scale = Math.round(scale * 100) / 100;

        }else if(this.mode == 1 || this.mode == 2) {
            this.scale = 1.39;
        }else {
            this.scale = 1;
        } 

		

    };

    this.fullscreenSet = function(cb) {
        setTimeout((function() {
            if (document.webkitCurrentFullScreenElement != null) {
                this.fullscreen = true;
            }else{
                this.fullscreen = false;
            }   
            this.classCheck();
        }).bind(this), 100);
    };

    this.createCSS = function() {
        $('#extraClass').remove();

        var sheet = document.createElement('style')
        sheet.setAttribute("id", "extraClass");
        sheet.innerHTML = 
            ".extraClassAspect {" +
            "-webkit-transform: scaleX("+this.scale+")!important;" +
            //                "object-fit: fill!important;" +
            "}" +
            ".extraClassCrop {" +
            "-webkit-transform: scale(1.0,1.33"+")!important;" +
            //                "object-fit: cover!important;" +
            "}";
        document.body.appendChild(sheet);  
    };

    this.setMode = function(mode) {
        this.mode = mode;
        return mode;
    };


};

var StretchView = new StretchView();

$(document).ready(function() {

    chrome.storage.local.get("extensionMode",function (status){
        StretchView.setMode(status.extensionMode);
        StretchView.setScale();
        StretchView.fullscreenSet();
        StretchView.createCSS();

        initEvents(StretchView);
    });


});

var initEvents = function(StretchView) {

    $( window ).resize(function() {
        StretchView.setScale();
        StretchView.fullscreenSet();
        StretchView.createCSS();
    });

    $(document).on('keydown', null, 'g',function(event) {
        var state = 0;
        if(StretchView.mode < 2) {
            state = StretchView.setMode(StretchView.mode+1);
        }else{
            state = StretchView.setMode(0);
        }

        chrome.storage.local.set({"extensionMode":state},function (){
        });


    });

    chrome.storage.onChanged.addListener(function(changes){
        StretchView.setMode(changes.extensionMode.newValue);
        StretchView.setScale();
        StretchView.createCSS();
        StretchView.classCheck();
    });
};
