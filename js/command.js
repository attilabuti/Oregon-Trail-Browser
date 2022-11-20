var command = (() => {
    function restore() {
        if (window.innerWidth < options.mobileBreakpoint) {
            setFontSize(options.fontSize.mobile, false);
        } else {
            setFontSize(options.fontSize.default, false);
        }

        setColor("white", false);
    }

    function setFontSize(fs, store) {
        let fontSize = parseInt(fs.toString().replace("set fontsize", "").replace(/\s+$/, "").replace(/[^\d]/g, ""), 10);

        if (isNaN(fontSize)) {
            term.writeln(" ERROR: INVALID FONT SIZE");
        } else if (fontSize < 6 || fontSize > 80) {
            term.writeln(" ERROR: INVALID FONT SIZE");
        } else {
            term.options.fontSize = fontSize;

            if (store) {
                localStorage.setItem("fontSize", fontSize);
            } else {
                localStorage.removeItem("fontSize");
            }

            app.addon.fit.fit();
        }
    }

    function setColor(c, store) {
        c = c.replace("set color", "").replace(/\s/, "");

        let color = "";
        switch (c) {
            case "amber": color = "#FFB000"; break;
            case "green": color = "#66FF66"; break;
            case "white": color = "#F3FFFF"; break;
        }

        if (color.length > 0) {
            term.options.theme = {
                foreground: color,
                background: "#0d0d0d",
                cursor: color,
                cursorAccent: color,
            };

            if (store) {
                localStorage.setItem("color", color);
            } else {
                localStorage.removeItem("color");
            }
        } else {
            term.writeln(" ERROR: UNKNOWN COLOR");
        }
    }

    function version() {
        term.writeln(` ${options.version}`);
    }

    function help() {
        term.writeln(" COMMANDS");

        term.writeln("  RUN OREGON\n    RUN THE OREGON TRAIL GAME");
        if (isMobile()) {
            term.writeln("  EXIT\n    EXIT FROM THE GAME");
        }

        term.writeln("  CLEAR\n    CLEAR THE TERMINAL SCREEN");
        term.writeln("  SET COLOR <VALUE>\n    SETS THE FOREGROUND COLOR\n    <WHITE, AMBER, GREEN>");
        term.writeln("  SET FONTSIZE <VALUE>\n    SETS THE FONT SIZE");
        term.writeln("  RESTORE\n    RESTORE DEFAULT SETTINGS");
        term.writeln("  HELP\n    PRINT THIS HELP TEXT");
        term.writeln("  VERSION\n    PRINT PROGRAM VERSION");

        let key = "CTRL";
        if (navigator.platform.indexOf("Mac") > -1) {
            key = "CMD";
        }

        if (!isMobile()) {
            term.writeln("\n KEY BINDINGS");
            term.writeln(`  ${key}+C\n    STOP RUNNING PROGRAM`);
            term.writeln(`  ${key}+L\n    CLEAR THE TERMINAL SCREEN`);
            term.writeln("  F11\n    TOGGLE FULLSCREEN MODE");
            term.writeln("  UP ARROW / PAGE UP\n    SCROLL UP");
            term.writeln("  DOWN ARROW / PAGE DOWN\n    SCROLL DOWN");
        }
    }

    return {
        run: cmd => {
            cmd = cmd.toLowerCase().trim().replace(/\s+/g, " ");

            if (cmd == "run oregon") {
                app.wasm.run();
                return;
            } else if (cmd == "restore") {
                restore();
            } else if (cmd.includes("set fontsize")) {
                setFontSize(cmd, true);
            } else if (cmd.includes("set color")) {
                setColor(cmd, true);
            } else if (cmd == "clear") {
                term.clearScreen();
            } else if (cmd == "version") {
                version();
            } else if (cmd == "help") {
                help();
            } else {
                if (cmd.length != 0) {
                    term.writeln(" ERROR: UNKNOWN COMMAND");
                }
            }

            term.prompt();
        },
    };
})();