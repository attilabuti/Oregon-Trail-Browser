if (Utils.isMobile()) {
    document.querySelector(Options.keyboard.selector).style.display = "block";

    Utils.load.css(Options.keyboard.files.css, () => {
        App.loaded.keyboard.css = true;
    });

    Utils.load.js(Options.keyboard.files.js, () => {
        App.loaded.keyboard.js = true;
        App.keyboard = new window.SimpleKeyboard.default(Options.keyboard.simpleKeyboard);
    });

    let keyboardLoaded = setInterval(() => {
        if (App.loaded.term && App.loaded.keyboard.css && App.loaded.keyboard.js) {
            clearInterval(keyboardLoaded);
            Term.windowResize();
        }
    }, 25);
}