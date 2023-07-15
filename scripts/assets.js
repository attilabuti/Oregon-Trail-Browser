const BUILD = "./build/";

module.exports = {
    dir: {
        build: BUILD,
        css: `${BUILD}css/`,
        font: `${BUILD}font/`,
        js: `${BUILD}js/`,
        wasm: `${BUILD}wasm/`,
    },

    out: {
        css: "app.css",
        html: "index.html",
        js: "app.js",
    },

    html: "./views/index.html",

    css: [
        "./node_modules/normalize.css/normalize.css",
        "./node_modules/xterm/css/xterm.css",
        "./css/app.css",
    ],

    js: [
        "./node_modules/xterm/lib/xterm.js",
        "./js/xterm-addon-fit/xterm-addon-fit.js",
        "./node_modules/xterm-addon-webgl/lib/xterm-addon-webgl.js",
        "./js/xterm-addon-web-links/xterm-addon-web-links.js",
        "./node_modules/fontfaceobserver/fontfaceobserver.standalone.js",
        "./js/utils.js",
        "./js/options.js",
        "./js/wasm_exec.js",
        "./js/wasm.js",
        "./js/app.js",
        "./js/terminal.js",
        "./js/simpleKeyboard.js",
        "./js/command.js",
        "./js/key.js",
    ],

    copy: {
        "./audio/": `${BUILD}audio/`,
        "./font/": `${BUILD}font/`,
        "./wasm/": `${BUILD}wasm/`,
        "./img/": `${BUILD}img/`,
        "./other/": `${BUILD}other/`,
        "./node_modules/fastestsmallesttextencoderdecoder/EncoderDecoderTogether.min.js": `${BUILD}js/lib/EncoderDecoderTogether.min.js`,
        "./node_modules/simple-keyboard/build/index.js": `${BUILD}js/lib/simple-keyboard.min.js`,
        "./node_modules/simple-keyboard/build/css/index.css": `${BUILD}css/lib/simple-keyboard.min.css`,
    },

    dev: {
        "js/lib/EncoderDecoderTogether.min.js": "./node_modules/fastestsmallesttextencoderdecoder/EncoderDecoderTogether.min.js",
        "js/lib/simple-keyboard.min.js": "./node_modules/simple-keyboard/build/index.js",
        "css/lib/simple-keyboard.min.css": "./node_modules/simple-keyboard/build/css/index.css",

        // Favicon
        "android-chrome-192x192.png": "./img/favicon/android-chrome-192x192.png",
        "android-chrome-512x512.png": "./img/favicon/android-chrome-512x512.png",
        "apple-touch-icon.png": "./img/favicon/apple-touch-icon.png",
        "browserconfig.xml": "./img/favicon/browserconfig.xml",
        "favicon-16x16.png": "./img/favicon/favicon-16x16.png",
        "favicon-32x32.png": "./img/favicon/favicon-32x32.png",
        "favicon.ico": "./img/favicon/favicon.ico",
        "mstile-150x150.png": "./img/favicon/mstile-150x150.png",
        "safari-pinned-tab.svg": "./img/favicon/safari-pinned-tab.svg",
        "site.webmanifest": "./img/favicon/site.webmanifest",
    },
};