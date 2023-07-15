App.termEl.style.display = "block";

const Term = new Terminal(Options.terminal.xterm);

Term.ready = false;
Term.input = "";
Term.promptText = "";
Term.promptPosition = undefined;
Term.resizeEvent = new CustomEvent("term.resize");
Term.resizeInProgress = false;
Term.isWriting = false;
Term.scrollHeight = 0;

Term.loadAddon(App.addon.fit);
Term.loadAddon(App.addon.webLinks);

App.addon.webgl.onContextLoss(e => {
    App.addon.webgl.dispose();
});

Term.getPromptPosition = () => {
    let pos = 0;

    if (Term.promptPosition !== undefined) {
        pos = Term.promptPosition.line;

        while (pos >= 0) {
            let currentLine = Term.buffer.active.getLine(pos);
            if (!currentLine.isWrapped) {
                break;
            }

            pos--;
        }
    }

    return pos;
};

Term.getPromptText = () => {
    let promptText = "";
    let pos = Term.buffer.active._buffer.y + Term.buffer.active._buffer.ybase;

    while (pos >= 0) {
        let currentLine = Term.buffer.active.getLine(pos);
        promptText = currentLine.translateToString(true) + promptText;

        if (!currentLine.isWrapped) {
            break;
        }

        pos--;
    }

    Term.promptText = promptText;
}

Term.clearScreen = () => {
    // \x1B[3J - Clear terminal screen and delete everything in the scrollback buffer
    // \x1B[H  - Move cursor to top left corner
    // \x1B[2J - Clear terminal screen
    Term.write("\x1B[3J\x1B[H\x1B[2J");
};

Term.prompt = async () => {
    // \x1B[?25h - Make cursor visible
    // \x1b[?45h - Reverse-wraparound Mode
    Term.write("\x1B[?25h\x1b[?45h>", () => {
        Term.getPromptText();
        Term.promptPosition = Term.registerMarker(0);
        Term.input = "";
        Term.ready = true;
    });
};

function wasmPrompt() {
    // \x1B[?25h - Make cursor visible
    // \x1b[?45h - Reverse-wraparound Mode
    Term.write("\x1B[?25h\x1b[?45h", () => {
        Term.getPromptText();
        Term.promptPosition = Term.registerMarker(0);
        Term.input = "";
        Term.ready = true;
    });

    return new Promise(resolve => {
        App.wasm.inputResolve = resolve;
    });
}

Term.reflowPrompt = () => {
    if (!Term.ready) {
        return;
    }

    let start = Term.getPromptPosition() + 1;
    let end = Term.buffer.active.cursorY + 1 + Term.buffer.active._buffer.ybase;
    let cursorY = Term.buffer.active.cursorY;

    while (end >= start) {
        // \x1b[2K - Erase the entire line
        Term.write("\x1b[2K");

        if (end != start) {
            if (cursorY < 1) {
                if (Term.buffer.active._buffer.ybase > 0) {
                    Term.buffer.active._buffer.ybase--;
                    Term.buffer.active._buffer.ydisp = Term.buffer.active._buffer.ybase;
                    Term.scrollToBottom();
                }
            } else {
                // \x1b[y;xH - Moves cursor to line y, column x
                Term.write(`\x1b[${cursorY + 1};0H`);
                cursorY--;
            }
        }

        end--;
    }

    // \x1b[y;xH - Moves cursor to line y, column x
    Term.write(`\x1b[${cursorY + 1};0H${Term.promptText}`, () => {
        Term.promptPosition.dispose();
        Term.promptPosition = Term.registerMarker(0);

        // \x1b[0J - Erase from cursor until end of screen
        Term.write(`${Term.input.toUpperCase()}\x1b[0J`);

        Term.refresh(0, Term.buffer.active.length);
    });
};

Term.writelns = async text => {
    await Term.writes(text + "\n");
};

Term.writes = async text => {
    if (text.length == 0) {
        return;
    }

    Term.isWriting = true;

    // \x1B[?25l - Make cursor invisible
    Term.write("\x1B[?25l");

    if (Options.receive != 0) {
        const chars = Array.from(text);

        let delay = 0, skipChars = 0;
        let writeTime = 1000 / (Options.receive / 10);
        if (writeTime < Options.timeoutDelay) {
            delay = Options.timeoutDelay;
            skipChars = Math.ceil(Options.timeoutDelay / writeTime);
        } else {
            delay = Math.floor(writeTime);
        }

        let timeDifference;
        let originalSkipChars = skipChars;
        let targetTime;
        let printable = "";
        let skipCounter = 0;
        let currentTime;
        let start = performance.timeOrigin + performance.now();
        for (let i = 0; i < chars.length; i++) {
            if (App.stopped) {
                App.stopped = false;
                Term.isWriting = false;
                Term.forceWindowResize();

                return;
            }

            if (skipCounter >= skipChars || i == chars.length - 1) {
                Term.write(printable + chars[i]);
                await Utils.sleep(delay);
                Term.forceWindowResize();

                if (!Term._core.browser.isFirefox) {
                    targetTime = writeTime * i;
                    currentTime = performance.timeOrigin + performance.now() - start;

                    if (targetTime < currentTime) {
                        timeDifference = currentTime - targetTime;
                        if (timeDifference >= delay && skipChars > 0) {
                            skipChars = skipChars * (Math.floor(timeDifference / delay) + 1);
                        } else {
                            skipChars = Math.floor(timeDifference / delay) + 1;
                        }
                    } else {
                        skipCounter = originalSkipChars;
                        timeDifference = targetTime - currentTime;

                        if (timeDifference >= delay) {
                            await Utils.sleep(timeDifference);
                        }
                    }
                }

                printable = "";
                skipCounter = 0;
            } else {
                skipCounter++;
                printable += chars[i];
            }
        }
    } else {
        Term.write(text);
    }

    Term.isWriting = false;
    Term.forceWindowResize();
};

Term.hidePrompt = () => {
    Term.ready = false;

    Term.promptPosition.dispose();
    Term.promptPosition = undefined;

    // \x1b[?45l - No Reverse-wraparound Mode
    // \x1B[?25l - Make cursor invisible
    Term.write("\x1b[?45l\x1B[?25l");
};

Term.forceWindowResize = () => {
    if (Term.resizeInProgress) {
        Term.windowResize(true);
    }
};

Term.windowResize = forced => {
    Term.resizeInProgress = true;

    if ((!forced || forced === undefined) && Term.isWriting) {
        return;
    }

    let margin = 20;
    if (window.innerWidth < Options.mobileBreakpoint) {
        margin = 5;
    }

    let height = window.innerHeight - (margin * 2);
    if (Utils.isMobile()) {
        height = height - document.querySelector(Options.keyboard.selector).offsetHeight;
    }

    Term.scrollHeight = Math.floor(height / Term.rows);

    if (localStorage.getItem("fontSize") === null) {
        if (window.innerWidth < Options.mobileBreakpoint) {
            Term.options.fontSize = Options.fontSize.mobile;
        } else {
            Term.options.fontSize = Options.fontSize.default;
        }
    }

    App.termEl.style.margin = margin + "px";
    App.termEl.style.height = height + "px";
    App.termEl.style.width = window.innerWidth - (margin * 2) + "px";

    Term.fit();

    Term.resizeInProgress = false;
};

Term.onResize(() => {
    window.dispatchEvent(Term.resizeEvent);
});

window.addEventListener("term.resize", Utils.debounce(() => {
    Term.reflowPrompt();
}, 500));

window.addEventListener("resize", () => {
    Term.windowResize();
}, true);

Term.fit = () => {
    App.addon.fit.fit();
};

Term.bell = {
    counter: 0,
    wait: 0,
};

Term.onBell(() => {
    Term.bell.counter++;

    Term.bellWait().then(() => {
        let audio = new Audio(Options.bell);
        audio.play();

        Term.bell.counter--;
        if (Term.bell.counter == 0) {
            Term.bell.wait = 0;
        }
    });

    return true;
});

Term.bellWait = () => {
    let ms = Term.bell.wait;
    Term.bell.wait += 150;

    return new Promise(resolve => setTimeout(resolve, ms));
};

App.fontFaceObserver.load(null, 2000).then(() => {
    Term.run();
}, () => {
    Term.options.fontFamily = "monospace";
    Term.run();

    App.fontFaceObserver.load(null, 10000).then(() => {
        Term.options.fontFamily = Options.terminal.xterm.fontFamily;
        Term.fit();
    });
});

Term.run = () => {
    Term.open(App.termEl);

    Term._core._selectionService.disable();
    Term._core._selectionService.shouldForceSelection = () => {
        return false;
    };

    if (!Utils.isCanvasBlocked() && Utils.detectWebGLContext()) {
        Term.loadAddon(App.addon.webgl);
    }

    if (Term._core.browser.isFirefox) {
        Term.options.lineHeight = 1;
    }

    if (Utils.isMobile()) {
        document.querySelector(".xterm-helper-textarea").style.display = "none";
    }

    document.querySelector(".terminal.xterm").classList.add("focus");
    Term._core._showCursor();
    Object.defineProperty(Term._core._coreBrowserService, "isFocused", {
        get: () => {
            return true;
        },
    });

    // \x1B[?25h - Make cursor visible
    Term.write("\x1B[?25h");
    Term.focus();
    Term.windowResize();

    App.loaded.term = true;
};

if (Utils.isMobile()) {
    Term.touchStartPosY = 0;

    App.termEl.addEventListener("touchmove", e => {
        e.preventDefault();
        e.stopImmediatePropagation();

        const evt = (typeof e.originalEvent === "undefined") ? e : e.originalEvent;
        const touch = evt.touches[0] || evt.changedTouches[0];

        const currentY = Math.round(touch.pageY);
        if (Term.touchStartPosY === currentY) {
            return;
        }

        const move = Term.touchStartPosY - currentY;
        if (Math.abs(move) > Term.scrollHeight) {
            if (move > 0) {
                Term.scrollLines(1);
            } else {
                Term.scrollLines(-1);
            }

            Term.touchStartPosY = currentY;
        }
    }, { passive: false });
}