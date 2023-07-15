const Options = {
    wasm: "wasm/oregon78.wasm",
    bell: "audio/bell.mp3",
    fontSize: {
        default: 18,
        mobile: 14,
    },
    crt: true,
    receive: 19200,
    timeoutDelay: 0,
    mobileBreakpoint: 500,
    terminal: {
        id: "terminal",
        xterm: {
            allowProposedApi: true,
            allowTransparency: true,
            altClickMovesCursor: false,
            bellStyle: "sound",
            convertEol: true,
            cols: 80,
            cursorBlink: false,
            cursorStyle: "block",
            fontFamily: "ModeSeven",
            macOptionClickForcesSelection: false,
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
                    underline: false,
                },
            },
        },
    },
    keyboard: {
        files: {
            css: "css/lib/simple-keyboard.min.css",
            js: "js/lib/simple-keyboard.min.js",
        },
        selector: ".simple-keyboard",
        simpleKeyboard: {
            onKeyPress: button => Term.onKeyMobile(button),
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
    Options.terminal.xterm.fontSize = localStorage.getItem("fontSize");
} else {
    if (window.innerWidth < Options.mobileBreakpoint) {
        Options.terminal.xterm.fontSize = Options.fontSize.mobile;
    } else {
        Options.terminal.xterm.fontSize = Options.fontSize.default;
    }
}

if (localStorage.getItem("color") !== null) {
    let color = localStorage.getItem("color");

    Options.terminal.xterm.theme.foreground = color;
    Options.terminal.xterm.theme.cursor = color;
    Options.terminal.xterm.theme.cursorAccent = color;
}

if (localStorage.getItem("crt") !== null) {
    if (localStorage.getItem("crt") == 1) {
        Options.crt = true;
    } else {
        Options.crt = false;
    }
}

if (localStorage.getItem("receive") !== null) {
    Options.receive = localStorage.getItem("receive");
}