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
    style: document.createElement("style"),
    loaded: {
        audio: false,
        term: false,
        keyboard: {
            css: false,
            js: false,
        },
    }
};

document.head.appendChild(app.style);
app.style.sheet.insertRule(`.xterm-cursor-block { outline: 0px !important; outline-offset: 0px !important; background-color: ${options.terminal.xterm.theme.cursor}; }`, 0);

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