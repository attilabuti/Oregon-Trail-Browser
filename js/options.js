var options = {
    wasm: "wasm/oregon78.wasm",
    bell: "audio/bell.mp3",
    version: "v1.1.0",
    fontSize: {
        default: 18,
        mobile: 14,
    },
    crt: true,
    mobileBreakpoint: 500,
    terminal: {
        id: "terminal",
        delay: 3,
        xterm: {
            allowProposedApi: true,
            allowTransparency: true,
            altClickMovesCursor: false,
            bellStyle: "sound",
            convertEol: true,
            cols: 80,
            cursorBlink: false,
            cursorStyle: "block",
            // fontSize: 18,
            fontFamily: "ModeSeven",
            letterSpacing: 2,
            lineHeight: 1.2,
            logLevel: "off",
            rightClickSelectsWord: false,
            rows: 24,
            scrollback: 2000,
            theme: {
                foreground: "#CCE",
                background: "#141414",
                cursor: "#CCE",
                cursorAccent: "#CCE",
            },
            link: {
                decorations: {
                    underline: false
                }
            }
        },
    },
    keyboard: {
        files: {
            css: "css/lib/simple-keyboard.min.css",
            js: "js/lib/simple-keyboard.min.js",
        },
        selector: ".simple-keyboard",
        simpleKeyboard: {
            onKeyPress: button => term.onKeyMobile(button),
            theme: "hg-theme-default hg-theme-dark",
            mergeDisplay: true,
            autoUseTouchEvents: true,
            layoutName: "default",
            layout: {
                default: [
                    "Q W E R T Y U I O P",
                    "A S D F G H J K L",
                    "Z X C V B N M {backspace}",
                    "{numbers} {space} {ent}",
                ],
                numbers: [
                    "1 2 3 ,",
                    "4 5 6 {space}",
                    "7 8 9 {backspace}",
                    "{abc} 0 . {ent}",
                ],
            },
            display: {
                "{abc}": "ABC",
                "{numbers}": "123",
                "{ent}": "#",
                "{backspace}": "#",
                "{space}": "#",
            },
        },
    },
};

if (localStorage.getItem("fontSize") !== null) {
    options.terminal.xterm.fontSize = localStorage.getItem("fontSize");
} else {
    if (window.innerWidth < options.mobileBreakpoint) {
        options.terminal.xterm.fontSize = options.fontSize.mobile;
    } else {
        options.terminal.xterm.fontSize = options.fontSize.default;
    }
}

if (localStorage.getItem("color") !== null) {
    let color = localStorage.getItem("color");

    options.terminal.xterm.theme.foreground = color;
    options.terminal.xterm.theme.cursor = color;
    options.terminal.xterm.theme.cursorAccent = color;
}

if (localStorage.getItem("crt") !== null) {
    if (localStorage.getItem("crt") == 1) {
        options.crt = true;
    } else {
        options.crt = false;
    }
}