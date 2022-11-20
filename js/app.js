var app = {
    termEl: document.getElementById(options.terminal.id),
    fontFaceObserver: new FontFaceObserver(options.terminal.xterm.fontFamily),
    addon: {
        fit: new FitAddon.FitAddon(),
        webgl: new WebglAddon.WebglAddon(),
    },
    wasm: new Wasm(options.wasm),
    keyboard: null,
    loaded: {
        audio: false,
        term: false,
        keyboard: {
            css: false,
            js: false,
        },
    }
};

window.oncontextmenu = () => {
    return false;
};

app.wasm.load();

loadAudio(options.bell, () => {
    app.loaded.audio = true;
});

let termLoaded = setInterval(() => {
    if (app.loaded.term) {
        clearInterval(termLoaded);

        term.writeln(`${getDateTime()} MECC01`);
        term.writeln("CDC TIME-SHARING SYSTEM NOS\nFAMILY: SYS1\n");

        term.writeln("TYPE THE FOLLOWING COMMAND TO RUN THE OREGON TRAIL: RUN OREGON");
        term.writeln(`TYPE "HELP" FOR A LIST OF COMMANDS.\n`);

        term.writeln("READY.\n");

        term.prompt();
    }
}, 25);