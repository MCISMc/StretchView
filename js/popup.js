$(document).ready(function () {
    // Remove the nested document.ready and keep just one link handler
    $('body').on('click', 'a', function () {
        chrome.tabs.create({ url: $(this).attr('href') });
        return false;
    });

    // Define supported sites
    const supported_sites = {
        "primevideo": "Prime Video",
        "netflix": "Netflix",
        "youtube": "YouTube",
        "jiocinema": "Jio Cinema",
        "altbalaji": "Alt Balaji",
        "hotstar": "Hotstar",
        "sonyliv": "Sony Liv",
        "zee5": "Zee5",
        "voot": "Voot",
        "airtelxstream": "Airtel Xstream"
    };

    // Load site names immediately
    loadSiteNames(supported_sites);

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

    chrome.storage.local.get("togglePiP", function (results) {
        if (results.togglePiP) {
            $("#btnPiP").addClass('active');
        }
    });

    $("#off").click(function () {
        $("#forceStretch").prop("checked", false);
        $("#forceAspect").prop("checked", false);
        chrome.storage.local.set({ "extensionMode": 0 }, function () { });

        $("#btnPiP").removeClass('active');
        chrome.storage.local.set({ "togglePiP": false }, function () { });
        
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0]) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: togglePiP,
                    args: [false]
                });
            }
        });
    });

    $("#forceStretch").click(function () {
        $("#off").prop("checked", false);
        $("#forceAspect").prop("checked", false);
        chrome.storage.local.set({ "extensionMode": 1 }, function () { });
    });
    $("#forceAspect").click(function () {
        $("#off").prop("checked", false);
        $("#forceStretch").prop("checked", false);
        chrome.storage.local.set({ "extensionMode": 2 }, function () { });
    });

    $("#btnPiP").click(function () {
        const isActive = $(this).hasClass('active');
        
        $(this).toggleClass('active');
        
        chrome.storage.local.set({ "togglePiP": !isActive }, function () { });

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0]) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: togglePiP,
                    args: [!isActive]
                });
            }
        });
    });

    function togglePiP(enterPiP) {
        (async () => {
            try {
                const videos = document.getElementsByTagName("video");
                if (!videos.length) return;

                const video = Array.from(videos).find(v => !v.paused) || videos[0];

                if (enterPiP) {
                    if (document.pictureInPictureElement !== video) {
                        await video.requestPictureInPicture();
                    }
                } else {
                    if (document.pictureInPictureElement) {
                        await document.exitPictureInPicture();
                    }
                }
            } catch (error) {
                console.log('PiP error:', error);
            }
        })();
    }

    $(".video_adjust_title").click(function () {
        $header = $(this);
        $content = $(".video_adjust_content");
        $content.slideToggle(200, function () { });

    });

    $("#video_adjustments_reset").click(function () {
        chrome.storage.local.set({ "contrast": 100 }, function () { });
        chrome.storage.local.set({ "brightness": 100 }, function () { });
        chrome.storage.local.set({ "saturation": 100 }, function () { });

        $("#brightness_slider").val(100);
        $("#contrast_slider").val(100);
        $("#saturation_slider").val(100);

        $('#brightness_slider_output').html($('#brightness_slider').val());
        $('#contrast_slider_output').html($('#contrast_slider').val());
        $('#saturation_slider_output').html($('#saturation_slider').val());

    });

    // Video Adjustment Slider Controller STARTS
    chrome.storage.local.get(["brightness", "contrast", "saturation"], function (results) {
        //console.log(results);

        $("#brightness_slider").val(results.brightness);
        $("#contrast_slider").val(results.contrast);
        $("#saturation_slider").val(results.saturation);

        $('#brightness_slider_output').html($('#brightness_slider').val());
        $('#contrast_slider_output').html($('#contrast_slider').val());
        $('#saturation_slider_output').html($('#saturation_slider').val());

        // Update the current slider value (each time you drag the slider handle)
        $("#contrast_slider").on("change mousemove", function () {
            $('#contrast_slider_output').html($('#contrast_slider').val());
            chrome.storage.local.set({ "contrast": $("#contrast_slider").val() }, function () { });
        });

        $("#brightness_slider").on("change mousemove", function () {
            $('#brightness_slider_output').html($('#brightness_slider').val());
            chrome.storage.local.set({ "brightness": $("#brightness_slider").val() }, function () { });
        });

        $("#saturation_slider").on("change mousemove", function () {
            $('#saturation_slider_output').html($('#saturation_slider').val());
            chrome.storage.local.set({ "saturation": $("#saturation_slider").val() }, function () { });
        });

    });

});

function loadSiteNames(supported_sites) {
    const brands_dynamic = document.getElementById('brands_dynamic');
    
    // Clear existing content
    brands_dynamic.innerHTML = '';
    
    // Create a container for the site names
    const sitesContainer = document.createElement('div');
    sitesContainer.className = 'sites-container';
    
    // Add each site name
    Object.entries(supported_sites).forEach(([site, displayName]) => {
        const siteLink = document.createElement('a');
        siteLink.href = `http://www.${site}.com`;
        siteLink.className = 'site-link';
        siteLink.target = '_blank';
        siteLink.textContent = displayName;
        
        sitesContainer.appendChild(siteLink);
    });
    
    brands_dynamic.appendChild(sitesContainer);
}