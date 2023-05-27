var app = {
    termEl: document.getElementById(options.terminal.id),
    fontFaceObserver: new FontFaceObserver(options.terminal.xterm.fontFamily),
    addon: {
        fit: new FitAddon.FitAddon(),
        webgl: new WebglAddon.WebglAddon(),
        webLinks: new WebLinksAddon.WebLinksAddon(),
    },
    wasm: new Wasm(options.wasm),
    stopped: false,
    cmdrun: false,
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

let termLoaded = setInterval(async () => {
    if (app.loaded.term) {
        clearInterval(termLoaded);

        if (!options.crt) {
            app.termEl.classList.remove('crt');
        }

        await term.writelns(`${getDateTime()} MECC01`);
        await term.writelns("CDC TIME-SHARING SYSTEM NOS\nFAMILY: SYS1\n");

        await term.writelns("TYPE THE FOLLOWING COMMAND TO RUN THE OREGON TRAIL: RUN OREGON");
        await term.writelns(`TYPE "HELP" FOR A LIST OF COMMANDS.\n`);

        await term.writelns("READY.\n");

        term.prompt();
    }
}, 25);