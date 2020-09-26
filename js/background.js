function fetchImages(images_to_fetch) {
    Object.keys(images_to_fetch).forEach(ele => {
        chrome.storage.local.set({ ele: "" }, function () {});
    });
    recursiveFetch(images_to_fetch, 0);
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
        XHR.responseType = 'document';

        // Turn the data object into an array of URL-encoded key/value pairs.
        for (name in data) {
            urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
        }

        // Combine the pairs into a single string and replace all %-encoded spaces to 
        // the '+' character; matches the behaviour of browser form submissions.
        urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

        // Define what happens on successful data submission
        XHR.addEventListener('load', function (event) {
         
            //console.log(XHR.responseXML.getElementById("ta_raw").value);
            var img_html_value = XHR.responseXML.getElementById("ta_raw").value;
  
            localStorage.setItem(key, img_html_value);
            localStorage.setItem('NumberOfImagesCached', (index + 1));

            recursiveFetch(images_to_fetch, index + 1);
        });

        // Define what happens in case of error
        XHR.addEventListener('error', function (event) {
            console.log('Oops! Something goes wrong, FAILED TO LOAD IMAGES.');
        });

        // Set up our request
        var theUrl = "https://www.askapache.com/online-tools/base64-image-converter/";
        XHR.open('POST', theUrl);

        // Add the required HTTP header for form data POST requests
        XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

        // Finally, send our data.
        XHR.send(urlEncodedData);

        // Fetching process end
    }
}

chrome.runtime.onInstalled.addListener(function (details) {

    // Image Link and its key name
    var images_to_fetch = {
        "primevideo": "https://images.justwatch.com/icon/52449861/s100/amazon-prime-video",
        "netflix": "https://images.justwatch.com/icon/430997/s100/netflix",
        "youtube": "https://images.justwatch.com/icon/59562423/s100/youtube",
        "jiocinema": "https://images.justwatch.com/icon/85114140/s100/jio-cinema",
        "altbalaji": "https://upload.wikimedia.org/wikipedia/en/3/3f/ALT_Balaji_Logo.png",
        "hotstar": "https://images.justwatch.com/icon/4233120/s100/hotstar",
        "sonyliv": "https://images.justwatch.com/icon/99832956/s100/sony-liv",
        "zee5": "https://images.justwatch.com/icon/93795879/s100/zee5",
        "voot": "https://images.justwatch.com/icon/4233119/s100/voot",
        "airtelxstream": "https://lh3.googleusercontent.com/GixZgG5tr3hZ9ppKeGmeqqhqw6cJX-OlND8D6U4eT1KW9Ba8ThP_mfyMSo5qGfLvROw=s180-rw",
    }

    chrome.storage.local.set({ "togglePiP": false }, function () {});
    chrome.storage.local.set({ "contrast": 100 }, function () {});
    chrome.storage.local.set({ "brightness": 100 }, function () {});
    chrome.storage.local.set({ "saturation": 100 }, function () {});
    chrome.storage.local.set({ "extensionMode": 0 }, function () {});
    localStorage.setItem('NumberOfImagesCached', 0);
    fetchImages(images_to_fetch); 

});


