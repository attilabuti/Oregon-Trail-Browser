var command = (() => {
    function restore() {
        if (window.innerWidth < options.mobileBreakpoint) {
            setFontSize(options.fontSize.mobile, false);
        } else {
            setFontSize(options.fontSize.default, false);
        }

        setColor("white", false);

        app.termEl.classList.add('crt');
        localStorage.setItem("crt", 1);
    }

    async function setFontSize(fs, store) {
        let fontSize = parseInt(fs.toString().replace("set fontsize", "").replace(/\s+$/, "").replace(/[^\d]/g, ""), 10);

        if (isNaN(fontSize)) {
            await term.writelns(" ERROR: INVALID FONT SIZE");
        } else if (fontSize < 6 || fontSize > 80) {
            await term.writelns(" ERROR: INVALID FONT SIZE");
        } else {
            term.options.fontSize = fontSize;

            if (store) {
                localStorage.setItem("fontSize", fontSize);
            } else {
                localStorage.removeItem("fontSize");
            }

            term.fit();
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
            term.options.theme = {
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
        } else {
            await term.writelns(" ERROR: UNKNOWN COLOR");
        }
    }

    function toggleCRT() {
        if (localStorage.getItem("crt") !== null) {
            if (localStorage.getItem("crt") == 1) {
                localStorage.setItem("crt", 0);
                app.termEl.classList.remove('crt');
            } else {
                localStorage.setItem("crt", 1);
                app.termEl.classList.add('crt');
            }
        } else {
            localStorage.setItem("crt", 0);
            app.termEl.classList.remove('crt');
        }
    }

    async function version() {
        await term.writelns(`OREGON TRAIL - ${options.version}\n`);
        await term.writelns("A FAITHFUL RECREATION OF THE ORIGINAL OREGON TRAIL GAME.\n");
        await term.writelns("SOURCE CODE");
        await term.writelns(" ORIGINAL: HTTPS://OREGONTRAIL.RUN/S/ORIGINAL");
        await term.writelns(" GO:       HTTPS://OREGONTRAIL.RUN/S/GO");
        await term.writelns(" BROWSER:  HTTPS://OREGONTRAIL.RUN/S/BROWSER");
    }

    async function about() {
        await term.writelns("THE OREGON TRAIL\n\nIN 1971, DON RAWITSCH AND BILL HEINEMANN WERE PARTICIPATING TOGETHER IN A PRACTICE TEACHING PROGRAM AS STUDENTS AT CARLETON COLLEGE, NORTHFIELD, MINNESOTA. DON WAS TEACHING A CLASS ON THE HISTORY OF THE AMERICAN WEST AND PROVIDED THE PRELIMINARY INFORMATION WHICH BILL, A MATH TEACHER, USED TO CONSTRUCT THE OREGON PROGRAM. THE PROGRAM WAS FIRST IMPLEMENTED ON THE MINNEAPOLIS SCHOOLS TIMESHARING SYSTEM. ON THE COMPLETION OF THE PRACTICE TEACHING PROGRAM, THE PROGRAM WAS REMOVED FROM THE MINNEAPOLIS SYSTEM AND REMAINED ONLY AS A CURLED UP LISTING UNTIL DON JOINED THE MECC STAFF IN 1974 AND LOADED IT ONTO THE MECC SYSTEM. DON THEN PROCEEDED TO DO FURTHER RESEARCH ON THE OREGON TRAIL AND MODIFIED THE PROGRAM FOR HISTORICAL ACCURACY TO PRODUCE THE PRESENT VERSION. THE PROGRAM HAS BEEN IMPLEMENTED ON HEWLETT-PACKARD, UNIVAC, AND CONTROL DATA SYSTEMS.\n\nFURTHER READING: HTTPS://OREGONTRAIL.RUN/REFERENCES");
    }

    async function help() {
        await term.writelns(" COMMANDS");

        await term.writelns("  RUN OREGON\n    RUN THE OREGON TRAIL GAME");
        if (isMobile()) {
            await term.writelns("  EXIT\n    EXIT FROM THE GAME");
        }

        await term.writelns("  CLEAR\n    CLEAR THE TERMINAL SCREEN");
        await term.writelns("  SET COLOR <VALUE>\n    SETS THE FOREGROUND COLOR\n    <WHITE, AMBER, GREEN>");
        await term.writelns("  SET FONTSIZE <VALUE>\n    SETS THE FONT SIZE");
        await term.writelns("  CRT\n    ENABLE / DISABLE CRT EFFECT");
        await term.writelns("  RESTORE\n    RESTORE DEFAULT SETTINGS");
        await term.writelns("  ABOUT\n    INFORMATION ABOUT THE GAME");
        await term.writelns("  HELP\n    PRINT THIS HELP TEXT");
        await term.writelns("  VERSION\n    PRINT PROGRAM VERSION");

        let key = "CTRL";
        if (navigator.platform.indexOf("Mac") > -1) {
            key = "CMD";
        }

        if (!isMobile()) {
            await term.writelns("\n KEY BINDINGS");
            await term.writelns(`  ${key}+C\n    STOP RUNNING PROGRAM`);
            await term.writelns(`  ${key}+L\n    CLEAR THE TERMINAL SCREEN`);
            await term.writelns("  F11\n    TOGGLE FULLSCREEN MODE");
            await term.writelns("  UP ARROW / PAGE UP\n    SCROLL UP");
            await term.writelns("  DOWN ARROW / PAGE DOWN\n    SCROLL DOWN");
        }
    }

    return {
        run: async cmd => {
            cmd = cmd.toLowerCase().trim().replace(/\s+/g, " ");

            app.stopped = false;
            app.cmdrun = true;

            if (cmd == "run oregon") {
                app.cmdrun = false;
                app.wasm.run();
                return;
            } else if (cmd == "restore") {
                restore();
            } else if (cmd.includes("set fontsize")) {
                await setFontSize(cmd, true);
            } else if (cmd.includes("set color")) {
                await setColor(cmd, true);
            } else if (cmd == "crt") {
                toggleCRT();
            } else if (cmd == "about") {
                await about();
            } else if (cmd == "clear") {
                term.clearScreen();
            } else if (cmd == "version") {
                await version();
            } else if (cmd == "help") {
                await help();
            } else {
                if (cmd.length != 0) {
                    await term.writelns(" ERROR: UNKNOWN COMMAND");
                }
            }

            app.cmdrun = false;

            term.prompt();
        },
    };
})();