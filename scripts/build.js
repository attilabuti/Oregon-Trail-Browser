const fs = require("fs");
const path = require("path");

const fse = require("fs-extra");
const uglifyJS = require("uglify-js");
const uglifyCSS = require("uglifycss");

const render = require("./utils").render;
const assets = require("./assets");

// Remove build directory
if (fs.existsSync(assets.dir.build)) {
    fs.rmSync(assets.dir.build, {
        recursive: true,
        force: true,
    }, err => {
        if (err) {
            return console.log("error occurred in deleting directory", err);
        }
    });
}

// Create directories
createDir(assets.dir.build);
createDir(assets.dir.js);
createDir(assets.dir.css);

// JS
let jsFiles = {};
assets.js.forEach(e => {
    jsFiles[path.basename(e)] = fs.readFileSync(e, "utf8");
})

fs.writeFileSync(assets.dir.js + assets.out.js, uglifyJS.minify(jsFiles, {
    output: {
        beautify: false,
    },
}).code, "utf8");

// CSS
fs.writeFileSync(assets.dir.css + assets.out.css, uglifyCSS.processFiles(assets.css, {}), "utf8");

// Copy
Object.keys(assets.copy).forEach(key => {
    fse.copySync(key, assets.copy[key]);
});

// HTML
fs.writeFileSync(assets.dir.build + assets.out.html, render(
    assets.html,
    ["css/app.css"],
    ["js/app.js"],
));

function createDir(path) {
    fs.mkdirSync(path, { recursive: true }, err => {
        if (err) {
            console.log(err);
        }
    });
}