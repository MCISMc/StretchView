

$(document).ready(function () {
    // Image Link and its key name
    var images_to_fetch = {
        "primevideo": "https://images.justwatch.com/icon/52449861/s100/amazon-prime-video",
        "netflix": "https://images.justwatch.com/icon/430997/s100/netflix",
        "youtube": "https://images.justwatch.com/icon/59562423/s100/youtube",
        "jio_cinema": "https://images.justwatch.com/icon/85114140/s100/jio-cinema",
        "altbalaji": "https://upload.wikimedia.org/wikipedia/en/3/3f/ALT_Balaji_Logo.png",
        "hotstar": "https://images.justwatch.com/icon/4233120/s100/hotstar",
        "sonyliv": "https://images.justwatch.com/icon/99832956/s100/sony-liv",
        "zee5": "https://images.justwatch.com/icon/93795879/s100/zee5",
        "voot": "https://images.justwatch.com/icon/4233119/s100/voot",
        "erosnow": "https://images.justwatch.com/icon/82869265/s100/eros-now",
    }

    // IMAGES CHROME STORAGE START

    var NumberOfImagesCached = localStorage.getItem('NumberOfImagesCached');

    if (NumberOfImagesCached > 0) {
        loadImages(images_to_fetch);
    } else {
        document.getElementById("loader").style.display = "block";
        fetchImages(images_to_fetch);
    }

    // IMAGES CHROME STORAGE END


    var isOn = -1;
    chrome.storage.local.get("extensionMode", function (results) {
        var mode = results.extensionMode;
        switch (mode) {
            // 0: off; 1: stretch; 2: fix-aspect-ratio;
            case 1:
                $("#forceStretch").prop("checked", true);
                break;
            case 2:
                $("#forceAspect").prop("checked", true);
                break;
            case 0:
            default:
                $("#off").prop("checked", true);
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

function loadImages(images_to_fetch) {
    recursiveLoad(images_to_fetch, 0);
}

function fetchImages(images_to_fetch) {
    Object.keys(images_to_fetch).forEach(ele => {
        chrome.storage.local.set({ ele: "" }, function () {
            console.log('Blank Set for :' + ele);
        });
    });
    recursiveFetch(images_to_fetch, 0);
}

function recursiveLoad(images_to_fetch, index) {
    var size = Object.keys(images_to_fetch).length;
    if (index < size) {
        var key = Object.keys(images_to_fetch)[index];
        var link = images_to_fetch[key];

        var base64 = "";

        var base64 = localStorage.getItem(key);

        console.log(base64);
        var img_html_base64 = '<a href="http://www.' + key + '.com" target="_blank"><img class="brand_logo" width="50" height="50" src="' + base64 + '"/></a>'
    
        var brand_logos_dynamic = document.getElementById('brand_logos_dynamic');
        brand_logos_dynamic.insertAdjacentHTML("beforeend", img_html_base64);

        index = index + 1;
        recursiveLoad(images_to_fetch, index);

    } else {
        document.getElementById("loader").style.display = "none";
        return;
    }
}

function recursiveFetch(images_to_fetch, index) {
    var size = Object.keys(images_to_fetch).length;
    if (index < size) {

        // Fetchig Process
        var key = Object.keys(images_to_fetch)[index];
        var img_url = images_to_fetch[key];
        data = {
            http_remote_url: img_url,
            http_remote_file: "(binary)",
            http_reverse_code: "",
            http_compressimage: "1",
            TF_nonce: "0f4a9e1824",
            _wp_http_referer: "/online-tools/base64-image-converter/",
            aatoolstoken: "3e4ft9f",
            aatoolstoken_ip: "3qj3jb7"

        }

        var XHR = new XMLHttpRequest();
        var urlEncodedData = "";
        var urlEncodedDataPairs = [];
        var name;

        // Turn the data object into an array of URL-encoded key/value pairs.
        for (name in data) {
            urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
        }

        // Combine the pairs into a single string and replace all %-encoded spaces to 
        // the '+' character; matches the behaviour of browser form submissions.
        urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

        // Define what happens on successful data submission
        XHR.addEventListener('load', function (event) {

            var e = document.getElementById("temp_div");
            e.innerHTML = XHR.response;
            // var img_html_value = document.getElementById("ta_html").value;
            var img_html_value = document.getElementById("ta_raw").value;

            // alert(img_html_value);

            localStorage.setItem(key, img_html_value);
            localStorage.setItem('NumberOfImagesCached', (index + 1));

            // Clearing the div for better performance as it is now not needed
            e.innerHTML = "";

            recursiveFetch(images_to_fetch, index + 1);

        });

        // Define what happens in case of error
        XHR.addEventListener('error', function (event) {
            alert('Oops! Something goes wrong.');
        });

        // Set up our request
        var theUrl = "https://www.askapache.com/online-tools/base64-image-converter/";
        var final_url = "https://cors-escape.herokuapp.com/" + theUrl;
        XHR.open('POST', final_url);

        // Add the required HTTP header for form data POST requests
        XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        // Finally, send our data.
        XHR.send(urlEncodedData);

        // Fetching process end
    } else {
        loadImages(images_to_fetch);
    }
}


