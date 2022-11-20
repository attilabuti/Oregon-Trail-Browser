if (isMobile()) {
    document.querySelector(options.keyboard.selector).style.display = "block";

    loadCSS(options.keyboard.files.css, () => {
        app.loaded.keyboard.css = true;
    });

    loadJS(options.keyboard.files.js, () => {
        app.loaded.keyboard.js = true;
        app.keyboard = new window.SimpleKeyboard.default(options.keyboard.simpleKeyboard);
    });

    let keyboardLoaded = setInterval(() => {
        if (app.loaded.term && app.loaded.keyboard.css && app.loaded.keyboard.js) {
            clearInterval(keyboardLoaded);
            term.windowResize();
        }
    }, 25);
}