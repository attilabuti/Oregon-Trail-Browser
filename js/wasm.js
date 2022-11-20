if (!WebAssembly.instantiateStreaming) {
    // Polyfill
    WebAssembly.instantiateStreaming = async (resp, importObject) => {
        const source = await (await resp).arrayBuffer();
        return await WebAssembly.instantiate(source, importObject);
    };
}

class Wasm {
    constructor(url) {
        if (typeof url === "string" && url.length > 0) {
            this._wasmUrl = url;
        } else {
            throw new Error("Wasm: URL cannot be empty");
        }

        this._go = new Go(this);
        this._module;
        this._instance;

        this._isLoading = false;
        this._isLoaded = false;
        this._isRunning = false;
        this._hasError = false;

        this._stopLoading = false;
        this._retry = false;

        this._inputResolve;
    }

    get isRunning() {
        return this._isRunning;
    }

    get inputResolve() {
        return this._inputResolve;
    }

    set inputResolve(resolve) {
        this._inputResolve = resolve;
    }

    load() {
        this._isLoading = true;

        WebAssembly.instantiateStreaming(fetch(this._wasmUrl), this._go.importObject).then(result => {
            this._module = result.module;
            this._instance = result.instance;

            this._isLoading = false;
            this._isLoaded = true;
        }).catch(err => {
            console.error(err);

            this._isLoading = false;
            this._hasError = true;
        });
    }

    run() {
        if (this._retry) {
            this.load();
            this._retry = false;
        }

        if (this._hasError) {
            this.error();
            return;
        }

        term.hidePrompt();

        if (this._isLoading) {
            term.writeln(" LOADING, PLEASE WAIT...");

            let status = setInterval(() => {
                if (this._stopLoading) {
                    clearInterval(status);
                    this._stopLoading = false;
                    this.error();
                    return;
                }

                if (this._hasError) {
                    clearInterval(status);
                    this.error();
                } else if (this._isLoaded) {
                    clearInterval(status);
                    this._run();
                }
            }, 500);
        } else if (this._isLoaded) {
            this._run();
        }
    }

    error() {
        term.writeln(" ERROR: FAILED TO DOWNLOAD WASM FILE");
        term.prompt();

        this._isLoading = false;
        this._isLoaded = false;
        this._hasError = false;
        this._retry = true;

        this._inputResolve = null;
    }

    async _run() {
        this._isRunning = true;
        term.clearScreen();

        await this._go.run(this._instance);
        this._instance = await WebAssembly.instantiate(this._module, this._go.importObject); // reset instance
    }

    stop() {
        if (this._isRunning) {
            stopWasm();
        } else if (this._isLoading) {
            this._stopLoading = true;
        }
    }

    stopped(code) {
        if (!this._isRunning) {
            return;
        }

        let msg = "\n RUN COMPLETE.";
        if (code !== 0) {
            msg = "\n\n OPERATOR DROP OR KILL.";
        }

        this._inputResolve = null;
        this._isRunning = false;

        term.input = "";
        term.writeln(msg);
        term.prompt();
    }
}