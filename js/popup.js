$(document).ready(function () {
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

    // Update initial states
    chrome.storage.local.get(["extensionMode", "togglePiP", "extensionEnabled"], function (results) {
        // Set initial states based on storage
        switch (results.extensionMode) {
            case 1:
                $("#forceStretch").addClass("active");
                break;
            case 2:
                $("#forceAspect").addClass("active");
                break;
        }

        if (results.togglePiP) {
            $("#btnPiP").addClass('active');
        }

        if (results.extensionEnabled) {
            $("#toggleExtension").addClass('active').text('Disable');
        } else {
            $("#toggleExtension").text('Enable');
        }
    });

    function togglePiP(enterPiP) {
        chrome.storage.local.get("extensionEnabled", function (result) {
            if (!result.extensionEnabled) return;

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
        });
    }

    function toggleExtension() {
        chrome.storage.local.get("extensionEnabled", function (result) {
            const isEnabled = result.extensionEnabled;
            const newStatus = !isEnabled;

            chrome.storage.local.set({ "extensionEnabled": newStatus }, function () {
                // if (newStatus) {
                //     $("#toggleExtension").addClass('active').html('<i class="fas fa-toggle-on"></i> Disable');
                //     // Add your code to enable the extension functionality here
                // } else {
                //     $("#toggleExtension").removeClass('active').html('<i class="fas fa-toggle-off"></i> Enable');
                //     // Add your code to disable the extension functionality here
                // }

                if (newStatus) {
                    $("#toggleExtension").addClass('active').text('Disable');
                } else {
                    $("#toggleExtension").text('Enable');
                }
            });
        });
    }

    $(".video_adjust_title").click(function () {
        chrome.storage.local.get("extensionEnabled", function (result) {
            if (!result.extensionEnabled) return;

            $header = $(this);
            $content = $(".video_adjust_content");
            $content.slideToggle(200, function () { });
        });
    });

    $("#video_adjustments_reset").click(function () {
        chrome.storage.local.get("extensionEnabled", function (result) {
            if (!result.extensionEnabled) return;

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
    });

    // Video Adjustment Slider Controller STARTS
    chrome.storage.local.get(["brightness", "contrast", "saturation"], function (results) {
        $("#brightness_slider").val(results.brightness);
        $("#contrast_slider").val(results.contrast);
        $("#saturation_slider").val(results.saturation);

        $('#brightness_slider_output').html($('#brightness_slider').val());
        $('#contrast_slider_output').html($('#contrast_slider').val());
        $('#saturation_slider_output').html($('#saturation_slider').val());

        // Update the current slider value (each time you drag the slider handle)
        $("#contrast_slider").on("change mousemove", function () {
            chrome.storage.local.get("extensionEnabled", function (result) {
                if (!result.extensionEnabled) return;

                $('#contrast_slider_output').html($('#contrast_slider').val());
                chrome.storage.local.set({ "contrast": $("#contrast_slider").val() }, function () { });
            });
        });

        $("#brightness_slider").on("change mousemove", function () {
            chrome.storage.local.get("extensionEnabled", function (result) {
                if (!result.extensionEnabled) return;

                $('#brightness_slider_output').html($('#brightness_slider').val());
                chrome.storage.local.set({ "brightness": $("#brightness_slider").val() }, function () { });
            });
        });

        $("#saturation_slider").on("change mousemove", function () {
            chrome.storage.local.get("extensionEnabled", function (result) {
                if (!result.extensionEnabled) return;

                $('#saturation_slider_output').html($('#saturation_slider').val());
                chrome.storage.local.set({ "saturation": $("#saturation_slider").val() }, function () { });
            });
        });
    });

    // FullView button handler
    $("#forceStretch").click(function (e) {
        e.preventDefault();
        chrome.storage.local.get("extensionEnabled", function (result) {
            if (!result.extensionEnabled) return;

            const isActive = $("#forceStretch").hasClass('active');

            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (!tabs[0]) return;

                const newMode = isActive ? 0 : 1;

                chrome.storage.local.set({ "extensionMode": newMode }, function () {
                    if (newMode === 1) {
                        $("#forceStretch").addClass('active');
                        $("#forceAspect").removeClass('active');
                    } else {
                        $("#forceStretch").removeClass('active');
                    }

                    // Execute content script update
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        function: (mode) => {
                            // Trigger a custom event that the content script listens for
                            window.dispatchEvent(new CustomEvent('stretchview-mode-change', {
                                detail: { mode: mode }
                            }));
                        },
                        args: [newMode]
                    });
                });
            });
        });
    });

    // StretchView button handler
    $("#forceAspect").click(function (e) {
        e.preventDefault();
        chrome.storage.local.get("extensionEnabled", function (result) {
            if (!result.extensionEnabled) return;

            const isActive = $("#forceAspect").hasClass('active');

            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (!tabs[0]) return;

                const newMode = isActive ? 0 : 2;

                chrome.storage.local.set({ "extensionMode": newMode }, function () {
                    if (newMode === 2) {
                        $("#forceAspect").addClass('active');
                        $("#forceStretch").removeClass('active');
                    } else {
                        $("#forceAspect").removeClass('active');
                    }

                    // Execute content script update
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        function: (mode) => {
                            // Trigger a custom event that the content script listens for
                            window.dispatchEvent(new CustomEvent('stretchview-mode-change', {
                                detail: { mode: mode }
                            }));
                        },
                        args: [newMode]
                    });
                });
            });
        });
    });

    // PIP button handler
    $("#btnPiP").click(function () {
        chrome.storage.local.get("extensionEnabled", function (result) {
            if (!result.extensionEnabled) return;

            const isActive = $("#btnPiP").hasClass('active');

            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (!tabs[0]) return;

                // First update storage
                chrome.storage.local.set({ "togglePiP": !isActive }, function () {
                    // Then execute PiP functionality
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        function: togglePiP,
                        args: [!isActive]
                    });
                });
            });
        });
    });

    // Enable/Disable button handler
    $("#toggleExtension").click(function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (!tabs[0]) return;

            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: toggleExtension
            });
        });
    });

    // Update storage listener to be more specific
    chrome.storage.onChanged.addListener(function (changes) {
        if ("togglePiP" in changes) {
            const isPiPEnabled = changes.togglePiP.newValue;
            $("#btnPiP").toggleClass('active', isPiPEnabled);
        }

        if ("extensionEnabled" in changes) {
            const isEnabled = changes.extensionEnabled.newValue;
            $("#toggleExtension").toggleClass('active', isEnabled).text(isEnabled ? 'Disable' : 'Enable');
        }
    });

    // Handle all link clicks
    $(document).on('click', 'a', function (e) {
        e.preventDefault();
        chrome.storage.local.get("extensionEnabled", function (result) {
            if (!result.extensionEnabled) return;

            const url = $(this).data('url') || $(this).attr('href');
            if (url) {
                chrome.tabs.create({ url: url });
            }
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
        siteLink.className = 'site-link';
        siteLink.dataset.url = `https://www.${site}.com`;  // Store URL in data attribute
        siteLink.textContent = displayName;

        sitesContainer.appendChild(siteLink);
    });

    brands_dynamic.appendChild(sitesContainer);
}