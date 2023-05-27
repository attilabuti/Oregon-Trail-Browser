term.ctrlDown = false;

term.attachCustomKeyEventHandler(e => {
    if (e.ctrlKey || e.metaKey) {
        term.ctrlDown = true;
    } else {
        term.ctrlDown = false;
    }

    if ([33, 34, 37, 38, 39, 40, 122].includes(e.keyCode) || ["Cancel"].includes(e.key)) {
        if (e.type !== "keydown") {
            return false;
        }

        if ([33, 34, 37, 38, 39, 40].includes(e.keyCode)) {
            switch (e.keyCode) {
                case 38:
                    term.scrollLines(-1); // ArrowUp
                    break;
                case 40:
                    term.scrollLines(1); // ArrowDown
                    break;
                case 33:
                    term.scrollPages(-1); // PageUp
                    break;
                case 34:
                    term.scrollPages(1); // PageDown
                    break;
                case 37: // ArrowLeft
                case 39: // ArrowRight
                    break;
            }
        } else if (e.keyCode === 122) { // F11
            requestFullScreen();
        } else if (e.key === "Cancel") {
            if (app.wasm.isRunning) {
                app.stopped = true;
                app.wasm.stop();
            }
        }

        return false;
    } else if (term.ctrlDown && [67, 76].includes(e.keyCode)) {
        if (e.type !== "keydown") {
            return false;
        }

        if (e.keyCode === 67) { // Ctrl+C / Cmd+C
            if (app.wasm.isRunning) {
                app.stopped = true;
                app.wasm.stop();
            }
        } else if (e.keyCode === 76) { // Ctrl+L / Cmd+L
            if (!app.wasm.isRunning && !app.cmdrun) {
                term.clearScreen();
                term.prompt();
            }

            return true;
        }

        return false;
    }
});

term.onKey(ev => {
    const e = ev.domEvent;

    if (term.ready) {
        if (e.keyCode === 13) { // Enter
            term.handleEnter();
        } else if (e.keyCode === 8) { // Backspace
            term.handleBackspace();
        } else if (!e.altKey && !e.ctrlKey && !e.metaKey) { // Printable
            term.handlePrintable(ev.key);
        }
    }
});

term.onKeyMobile = key => {
    if (key === "{numbers}" || key === "{abc}") {
        app.keyboard.setOptions({
            layoutName: app.keyboard.options.layoutName !== "numbers" ? "numbers" : "default",
        });
    } else {
        if (term.ready) {
            if (key === "{ent}") {
                term.handleEnter();
            } else if (key === "{backspace}") {
                term.handleBackspace();
            } else {
                if (key === "{space}") {
                    key = " ";
                }

                term.handlePrintable(key);
            }
        }
    }
};

term.handleEnter = () => {
    term.write("\n");

    term.input = term.input.replace(/(?:\\[rn])+/g, "");

    if (app.wasm.isRunning) {
        if (isMobile() && term.input.toLowerCase() === "exit") {
            app.stopped = true;
            app.wasm.stop();
            return;
        }

        app.wasm.inputResolve(term.input);
    } else {
        command.run(term.input);
    }

    term.input = "";
};

term.handleBackspace = () => {
    if (term.input.length > 0) {
        term.write("\b \b");
        term.input = term.input.slice(0, term.input.length - 1);
    }
};

term.handlePrintable = key => {
    term.input += key;
    term.write(key.toUpperCase());
};