const Utils = (() => {
    function isMobile() {
        let hasTouchScreen = false;

        if ("maxTouchPoints" in navigator) {
            hasTouchScreen = navigator.maxTouchPoints > 0;
        } else if ("msMaxTouchPoints" in navigator) {
            hasTouchScreen = navigator.msMaxTouchPoints > 0;
        } else {
            const mQ = matchMedia?.("(pointer:coarse)");

            if (mQ?.media === "(pointer:coarse)") {
                hasTouchScreen = !!mQ.matches;
            } else if ("orientation" in window) {
                hasTouchScreen = true; // Deprecated, but good fallback.
            } else {
                // Only as a last resort, fall back to user agent sniffing.
                const UA = navigator.userAgent;
                hasTouchScreen = /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) || /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA);
            }
        }

        return hasTouchScreen;
    }

    // Canvas Blocker & Firefox privacy.resistFingerprinting Detector.
    // (c) 2018 // JOHN OZBAY // CRYPT.EE
    // MIT License
    //
    // https://github.com/johnozbay/canvas-block-detector
    function isCanvasBlocked() {
        // Create a 1px image data.
        let blocked = false;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Some blockers just return an undefined ctx. So let's check that first.
        if (ctx) {
            const imageData = ctx.createImageData(1, 1);
            let originalImageData = imageData.data;

            // Set pixels to RGB 128
            originalImageData[0] = 128;
            originalImageData[1] = 128;
            originalImageData[2] = 128;
            originalImageData[3] = 255;

            // Set this to canvas.
            ctx.putImageData(imageData, 1, 1);

            try {
                // Now get the data back from canvas.
                const checkData = ctx.getImageData(1, 1, 1, 1).data;

                // If this is firefox, and privacy.resistFingerprinting is enabled,
                // OR a browser extension blocking the canvas,
                // This will return RGB all white (255,255,255) instead of the (128,128,128) we put.

                // So let's check the R and G to see if they're 255 or 128 (matching what we've initially set).
                if (originalImageData[0] !== checkData[0] && originalImageData[1] !== checkData[1]) {
                    blocked = true;
                }
            } catch (err) {
                // Some extensions will return getImageData null. this is to account for that.
                blocked = true;
            }
        } else {
            blocked = true;
        }

        return blocked;
    }

    function detectWebGLContext() {
        // Create canvas element. The canvas is not added to the
        // document itself, so it is never displayed in the
        // browser window.
        const canvas = document.createElement("canvas");

        // Get WebGLRenderingContext from canvas element.
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

        return gl instanceof WebGLRenderingContext ? true : false;
    }

    function requestFullScreen() {
        const el = document;
        const requestMethod = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen;

        if (requestMethod) {
            requestMethod.call(el);
        }

        return false;
    }

    function debounce(cb, wait) {
        let timeoutID = null;

        return (...args) => {
            window.clearTimeout(timeoutID);
            timeoutID = window.setTimeout(() => {
                cb.apply(null, args);
            }, wait);
        };
    }

    function sleep(ms) {
        return new Promise(res => setTimeout(res, ms));
    }

    function getDateTime() {
        let d = new Date();

        let yy = d.getFullYear().toString().substring(2, 4);
        let mm = (d.getMonth() < 10) ? `0${d.getMonth()}` : d.getMonth();
        let dd = (d.getDate() < 10) ? `0${d.getDate()}` : d.getDate();

        let hh = (d.getHours() < 10) ? `0${d.getHours()}` : d.getHours();
        let mn = (d.getMinutes() < 10) ? `0${d.getMinutes()}` : d.getMinutes();
        let ss = (d.getSeconds() < 10) ? `0${d.getSeconds()}` : d.getSeconds();

        return `${yy}/${mm}/${dd}. ${hh}.${mn}.${ss}`;
    }

    function loadCSS(url, cb) {
        let css = document.createElement("link");

        css.rel = "stylesheet";
        css.type = "text/css";
        css.href = url;
        css.media = "all";

        if (cb) {
            css.onload = cb;
            css.onreadystatechange = cb;
        }

        document.getElementsByTagName("head")[0].appendChild(css);
    }

    function loadJS(url, cb) {
        let js = document.createElement("script");

        js.src = url;

        if (cb) {
            js.onload = cb;
            js.onreadystatechange = cb;
        }

        document.body.appendChild(js);
    }

    function loadAudio(url, cb) {
        let audio = new Audio();

        audio.preload = "auto";
        audio.src = url;

        if (cb) {
            audio.oncanplaythrough = cb;
        }

        audio.load();
    }

    function fetchFile(url, cb) {
        fetch(url).then(response => {
            if (response.ok) {
                return response.text();
            }

            throw new Error(`Failed to fetch file: ${url}`);
        }).then(data => {
            cb(data);
        }).catch(err => {
            console.error(err);
        });
    }

    function mode(numbers) {
        let modes = [], count = [], i, number, maxIndex = 0;

        for (i = 0; i < numbers.length; i += 1) {
            number = numbers[i];
            count[number] = (count[number] || 0) + 1;
            if (count[number] > maxIndex) {
                maxIndex = count[number];
            }
        }

        for (i in count) {
            if (count.hasOwnProperty(i)) {
                if (count[i] === maxIndex) {
                    modes.push(Number(i));
                }
            }
        }

        return modes;
    }

    async function getTimeoutDelay() {
        let start, results = [];

        for (let i = 0; i < 25; i++) {
            start = performance.timeOrigin + performance.now();
            await sleep(1);
            results.push(Math.round(performance.timeOrigin + performance.now() - start));
        }

        let delay = mode(results.filter(n => 0 != n));

        return delay.length > 0 ? delay[0] : 0;
    }

    return {
        isMobile,
        detectWebGLContext,
        requestFullScreen,
        debounce,
        sleep,
        getDateTime,
        isCanvasBlocked,
        fetchFile,
        getTimeoutDelay,
        load: {
            css: loadCSS,
            js: loadJS,
            audio: loadAudio,
        },
    };
})();