const App = {
    version: "v1.3.0",
    termEl: document.getElementById(Options.terminal.id),
    fontFaceObserver: new FontFaceObserver(Options.terminal.xterm.fontFamily),
    addon: {
        fit: new FitAddon.FitAddon(),
        webgl: new WebglAddon.WebglAddon(),
        webLinks: new WebLinksAddon.WebLinksAddon(),
    },
    wasm: new Wasm(Options.wasm),
    stopped: false,
    cmdrun: false,
    keyboard: null,
    style: document.createElement("style"),
    loaded: {
        term: false,
        audio: false,
        keyboard: {
            css: false,
            js: false,
        },
    },
};

if (!Options.crt) {
    document.body.classList.remove("crt");
}

document.head.appendChild(App.style);
App.style.sheet.insertRule(`.xterm-cursor-block { outline: 0px !important; outline-offset: 0px !important; background-color: ${Options.terminal.xterm.theme.cursor}; }`, 0);

window.oncontextmenu = () => {
    return false;
};

App.wasm.load();

Utils.load.audio(Options.bell, () => {
    App.loaded.audio = true;
});

function loadFiles() {
    Utils.fetchFile("other/banner.txt", text => {
        App.banner = text;
        console.log("\n" + text);
    });

    Utils.fetchFile("other/about.txt", text => {
        App.about = text;
    });
}

let termLoaded = setInterval(async () => {
    if (App.loaded.term) {
        clearInterval(termLoaded);

        Options.timeoutDelay = await Utils.getTimeoutDelay();

        await Term.writelns(`${Utils.getDateTime()} MECC01`);
        await Term.writelns("CDC TIME-SHARING SYSTEM NOS\nFAMILY: SYS1\n");

        await Term.writelns("TYPE THE FOLLOWING COMMAND TO RUN THE OREGON TRAIL: RUN OREGON");
        await Term.writelns(`TYPE "HELP" FOR A LIST OF COMMANDS.\n`);

        await Term.writelns("READY.\n");

        loadFiles();

        Term.prompt();
    }
}, 25);