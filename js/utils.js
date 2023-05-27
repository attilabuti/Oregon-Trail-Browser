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
            hasTouchScreen = true; // deprecated, but good fallback
        } else {
            // Only as a last resort, fall back to user agent sniffing
            const UA = navigator.userAgent;
            hasTouchScreen = /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) || /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA);
        }
    }

    return hasTouchScreen;
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

function requestFullScreen() {
    let el = document;
    let requestMethod = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullScreen;

    if (requestMethod) {
        requestMethod.call(el);
    }

    return false;
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