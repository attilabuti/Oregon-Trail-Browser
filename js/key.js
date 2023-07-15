Term.ctrlDown = false;

Term.attachCustomKeyEventHandler(e => {
    Term.ctrlDown = (e.ctrlKey || e.metaKey) ? true : false;

    if ([33, 34, 37, 38, 39, 40, 122].includes(e.keyCode) || ["Cancel"].includes(e.key)) {
        if (e.type !== "keydown") {
            return false;
        }

        if ([33, 34, 37, 38, 39, 40].includes(e.keyCode)) {
            switch (e.keyCode) {
                case 38:
                    Term.scrollLines(-1); // ArrowUp
                    break;
                case 40:
                    Term.scrollLines(1); // ArrowDown
                    break;
                case 33:
                    Term.scrollPages(-1); // PageUp
                    break;
                case 34:
                    Term.scrollPages(1); // PageDown
                    break;
                case 37: // ArrowLeft
                case 39: // ArrowRight
                    break;
            }
        } else if (e.keyCode === 122) { // F11
            Utils.requestFullScreen();
        } else if (e.key === "Cancel") {
            if (App.wasm.isRunning) {
                App.wasm.stop();
                App.stopped = true;
            }
        }

        return false;
    } else if (Term.ctrlDown && [67, 76].includes(e.keyCode)) {
        if (e.type !== "keydown") {
            return false;
        }

        if (e.keyCode === 67) { // Ctrl+C / Cmd+C
            if (App.wasm.isRunning) {
                App.wasm.stop();
                App.stopped = true;
            }
        } else if (e.keyCode === 76) { // Ctrl+L / Cmd+L
            if (!App.wasm.isRunning && !App.wasm.isLoading && !App.cmdrun) {
                Term.clearScreen();
                Term.prompt();
            }

            return true;
        }

        return false;
    }
});

Term.onKey(ev => {
    if (!Term.ready) {
        return;
    }

    const e = ev.domEvent;

    if (e.keyCode === 13) { // Enter
        Term.handleEnter();
    } else if (e.keyCode === 8) { // Backspace
        Term.handleBackspace();
    } else if (!e.altKey && !e.ctrlKey && !e.metaKey && e.keyCode !== 9) { // Printable
        Term.handlePrintable(ev.key);
    }
});

Term.onKeyMobile = key => {
    if (key === "{numbers}" || key === "{abc}") {
        App.keyboard.setOptions({
            layoutName: App.keyboard.options.layoutName !== "numbers" ? "numbers" : "default",
        });
    } else {
        if (!Term.ready) {
            return;
        }

        Term.scrollToBottom();

        if (key === "{ent}") {
            Term.handleEnter();
        } else if (key === "{backspace}") {
            Term.handleBackspace();
        } else {
            if (key === "{space}") {
                key = " ";
            }

            Term.handlePrintable(key);
        }
    }
};

Term.handleEnter = () => {
    Term.write("\n");

    Term.input = Term.input.replace(/(?:\\[rn])+/g, "");

    if (App.wasm.isRunning) {
        if (Utils.isMobile() && Term.input.toLowerCase() === "exit") {
            App.stopped = true;
            App.wasm.stop();
            return;
        }

        App.wasm.inputResolve(Term.input);
    } else {
        Command.run(Term.input);
    }
};

Term.handleBackspace = () => {
    if (Term.input.length > 0) {
        Term.write("\b \b");
        Term.input = Term.input.slice(0, Term.input.length - 1);
    }
};

Term.handlePrintable = key => {
    Term.input += key;
    Term.write(key.toUpperCase());
};