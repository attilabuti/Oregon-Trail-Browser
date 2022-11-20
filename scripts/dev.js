const http = require("http");
const static = require("node-static");

const mri = require("mri");

const render = require("./utils").render;
const spPath = require("./utils").spPath;
const assets = require("./assets");

const args = mri(process.argv.slice(2));

const host = (args.hasOwnProperty("host")) ? args.host : "";
const port = (args.hasOwnProperty("port")) ? args.port : 8080;

const fileServer = new static.Server(".");

http.createServer((req, res) => {
    let filePath = spPath(req.url, assets.dev);

    if (req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(render(assets.html, assets.css, assets.js));
        res.end();
    } else if (filePath.length !== 0) {
        fileServer.serveFile(filePath, 200, {}, req, res);
    } else {
        req.addListener("end", () => {
            fileServer.serve(req, res);
        }).resume();
    }
}).listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});