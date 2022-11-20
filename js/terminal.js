app.termEl.style.display = "block";

const term = new Terminal(options.terminal.xterm);

term.ready = false;
term.input = "";

term.loadAddon(app.addon.fit);

app.addon.webgl.onContextLoss(e => {
    app.addon.webgl.dispose();
});

term.clearScreen = () => {
    // \033[3J - Clear terminal screen and delete everything in the scrollback buffer. Specific to xterm-like terminals
    // \033[H  - Move cursor to top left corner
    // \033[2J - Clear terminal screen
    term.write("\033[3J\033[H\033[2J");
};

term.prompt = () => {
    term.ready = true;
    term.write("\u001B[?25h");
    term.write(">");
};

function wasmPrompt() {
    term.ready = true;
    term.write("\u001B[?25h");

    return new Promise(resolve => {
        app.wasm.inputResolve = resolve;
    });
}

term.hidePrompt = () => {
    term.ready = false;
    term.write("\u001B[?25l");
};

term.windowResize = () => {
    let margin = 25;
    if (window.innerWidth < options.mobileBreakpoint) {
        margin = 5;
    }

    let height = window.innerHeight - (margin * 2);
    if (isMobile()) {
        height = height - document.querySelector(options.keyboard.selector).offsetHeight;
    }

    if (localStorage.getItem("fontSize") === null) {
        if (window.innerWidth < options.mobileBreakpoint) {
            term.options.fontSize = options.fontSize.mobile;
        } else {
            term.options.fontSize = options.fontSize.default;
        }
    }

    app.termEl.style.margin = margin + "px";
    app.termEl.style.height = height + "px";
    app.termEl.style.width = window.innerWidth - (margin * 2) + "px";

    app.addon.fit.fit();
};

window.addEventListener("resize", () => {
    term.windowResize();
}, true);

term.bell = {
    counter: 0,
    wait: 0,
};

term.onBell(() => {
    term.bell.counter++;

    term.bellWait().then(() => {
        let audio = new Audio(options.bell);
        audio.play();

        term.bell.counter--;
        if (term.bell.counter == 0) {
            term.bell.wait = 0;
        }
    });

    return true;
});

term.bellWait = () => {
    let ms = term.bell.wait;
    term.bell.wait += 150;

    return new Promise(resolve => setTimeout(resolve, ms));
};

app.fontFaceObserver.load(null, 2000).then(() => {
    term.run();
}, () => {
    term.options.fontFamily = "monospace";
    term.run();

    app.fontFaceObserver.load(null, 10000).then(() => {
        term.options.fontFamily = options.terminal.xterm.fontFamily;
        app.addon.fit.fit();
    });
});

term.run = () => {
    term.open(app.termEl);

    term._core._selectionService.disable();
    term.loadAddon(app.addon.webgl);

    if (isMobile()) {
        document.querySelector(".xterm-helper-textarea").style.display = "none";
    }

    document.querySelector(".terminal.xterm").classList.add("focus");
    term._core._showCursor();
    Object.defineProperty(term._core._coreBrowserService, "isFocused", {
        get: () => {
            return true;
        },
    });

    term.write("\u001B[?25h");
    term.focus();
    term.windowResize();

    app.loaded.term = true;
};