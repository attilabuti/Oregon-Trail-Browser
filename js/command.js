const Command = (() => {
    function reset() {
        if (window.innerWidth < Options.mobileBreakpoint) {
            setFontSize(Options.fontSize.mobile, false);
        } else {
            setFontSize(Options.fontSize.default, false);
        }

        setColor("white", false);
        changeReceiveSpeed(19200, false);

        document.body.classList.add("crt");
        localStorage.setItem("crt", 1);
    }

    async function setFontSize(fs, store) {
        let fontSize = parseInt(fs.toString().replace("set fontsize", "").replace(/\s+$/, "").replace(/[^\d]/g, ""), 10);

        if (isNaN(fontSize)) {
            await Term.writelns(" ERROR: INVALID FONT SIZE");
        } else if (fontSize < 6 || fontSize > 80) {
            await Term.writelns(" ERROR: INVALID FONT SIZE");
        } else {
            Term.options.fontSize = fontSize;

            if (store) {
                localStorage.setItem("fontSize", fontSize);
            } else {
                localStorage.removeItem("fontSize");
            }

            Term.fit();
        }
    }

    async function setColor(c, store) {
        c = c.replace("set color", "").replace(/\s/, "");

        let color = "";
        switch (c) {
            case "amber": color = "#FFB000"; break;
            case "green": color = "#3F3"; break;
            case "white": color = "#CCE"; break;
        }

        if (color.length > 0) {
            Term.options.theme = {
                foreground: color,
                background: "#141414",
                cursor: color,
                cursorAccent: color,
            };

            if (store) {
                localStorage.setItem("color", color);
            } else {
                localStorage.removeItem("color");
            }

            App.style.sheet.deleteRule(0);
            App.style.sheet.insertRule(`.xterm-cursor-block { outline: 0px !important; outline-offset: 0px !important; background-color: ${color}; }`, 0);
        } else {
            await Term.writelns(" ERROR: UNKNOWN COLOR");
        }
    }

    function toggleSettings(key) {
        if (localStorage.getItem(key) !== null && localStorage.getItem(key) == 0) {
            localStorage.setItem(key, 1);
            return true;
        }

        localStorage.setItem(key, 0);
        return false;
    }

    function toggleCRT() {
        if (toggleSettings("crt")) {
            document.body.classList.add("crt");
        } else {
            document.body.classList.remove("crt");
        }
    }

    async function changeReceiveSpeed(rs, store) {
        let receiveSpeed = parseInt(rs.toString().replace("receive", "").replace(/\s+$/, "").replace(/[^\d]/g, ""), 10);
        if ([0, 75, 150, 300, 600, 1200, 2400, 4800, 9600, 19200].includes(receiveSpeed)) {
            Options.receive = receiveSpeed;

            if (store) {
                localStorage.setItem("receive", receiveSpeed);
            } else {
                localStorage.removeItem("receive");
            }
        } else {
            await Term.writelns(" ERROR: INVALID RECEIVE SPEED");
        }
    }

    async function version() {
        await Term.writelns(`OREGON TRAIL - ${App.version}\n`);
        await Term.writelns("A FAITHFUL RECREATION OF THE ORIGINAL OREGON TRAIL GAME.\n");
        await Term.writelns("SOURCE CODE");
        await Term.writelns(" ORIGINAL: HTTPS://OREGONTRAIL.RUN/S/ORIGINAL");
        await Term.writelns(" GO:       HTTPS://OREGONTRAIL.RUN/S/GO");
        await Term.writelns(" BROWSER:  HTTPS://OREGONTRAIL.RUN/S/BROWSER");
    }

    async function about() {
        if (App.about.length > 0) {
            if (Term.cols >= 80 && App.banner.length > 0) {
                await Term.writelns(App.banner + "\n");
            } else {
                await Term.writelns("THE OREGON TRAIL\n");
            }

            await Term.writelns(App.about);
        }
    }

    async function help() {
        const commands = {
            "RUN OREGON": "RUN THE OREGON TRAIL GAME",
            "EXIT": "EXIT FROM THE GAME",
            "CLEAR": "CLEAR THE TERMINAL SCREEN",
            "CRT": "ENABLE / DISABLE CRT EFFECT",
            "SET FONTSIZE <VALUE>": "SETS THE FONT SIZE",
            "SET COLOR <VALUE>": "SETS THE FOREGROUND COLOR",
            "-value-sc": "<WHITE, AMBER, GREEN>",
            "RECEIVE <VALUE>": "RECEIVE SPEED",
            "-value-tm": "<0, 75, 150, 300, 600, 1200,",
            "-value-tm2": "2400, 4800, 9600, 19200>",
            "RESET": "RESTORE DEFAULT SETTINGS",
            "ABOUT": "INFORMATION ABOUT THE GAME",
            "HELP": "PRINT THIS HELP TEXT",
            "VERSION": "PRINT PROGRAM VERSION",
        };

        const keyBindings = {
            "{key}+C": "STOP RUNNING PROGRAM",
            "{key}+L": "CLEAR THE TERMINAL SCREEN",
            "F11": "TOGGLE FULLSCREEN MODE",
            "UP ARROW / PGUP": "SCROLL UP",
            "DOWN ARROW / PGDN": "SCROLL DOWN",
        };

        let cLen = 0, dLen = 0;
        let tmp = Object.assign({}, commands, keyBindings);
        for (let k in tmp) {
            if (k.length > cLen) cLen = k.length;
            if (tmp[k].length > dLen) dLen = tmp[k].length;
        }

        const padLen = cLen + 3;
        const maxLen = padLen + dLen;

        await Term.writelns(" COMMANDS");
        for (let cmd in commands) {
            if (cmd == "EXIT" && !Utils.isMobile()) {
                continue;
            }

            let cmdPrint = cmd;
            if (cmd.includes("-value")) {
                cmdPrint = "";
            }

            if (Term.cols >= maxLen) {
                await Term.writelns(`  ${cmdPrint.padEnd(padLen, " ")}${commands[cmd]}`);
            } else {
                if (cmdPrint.length > 0) {
                    await Term.writelns(`  ${cmdPrint}\n   ${commands[cmd]}`);
                } else {
                    await Term.writelns(`   ${commands[cmd]}`);
                }
            }
        }

        if (!Utils.isMobile()) {
            const key = ((navigator?.userAgentData?.platform || navigator?.platform).indexOf("Mac") > -1) ? "CMD" : "CTRL";

            await Term.writelns("\n KEY BINDINGS");
            for (let keys in keyBindings) {
                if (Term.cols >= maxLen) {
                    await Term.writelns(`  ${keys.replace("{key}", key).padEnd(padLen, " ")}${keyBindings[keys]}`);
                } else {
                    await Term.writelns(`  ${keys.replace("{key}", key)}\n   ${keyBindings[keys]}`);
                }
            }
        }
    }

    async function run(cmd) {
        Term.ready = false;
        App.stopped = false;
        App.cmdrun = true;

        cmd = cmd.toLowerCase().trim().replace(/\s+/g, " ");

        if (cmd == "run oregon") {
            App.cmdrun = false;
            App.wasm.run();
            return;
        } else if (cmd == "reset") {
            reset();
        }
        else if (cmd.includes("set fontsize")) {
            await setFontSize(cmd, true);
        } else if (cmd.includes("set color")) {
            await setColor(cmd, true);
        } else if (cmd == "crt") {
            toggleCRT();
        } else if (cmd.includes("receive")) {
            await changeReceiveSpeed(cmd, true);
        } else if (cmd == "about") {
            await about();
        } else if (cmd == "clear") {
            Term.clearScreen();
        } else if (cmd == "version") {
            await version();
        } else if (cmd == "help") {
            await help();
        } else {
            if (cmd.length != 0) {
                await Term.writelns(" ERROR: UNKNOWN COMMAND");
            }
        }

        App.cmdrun = false;

        Term.prompt();
    }

    return { run };
})();