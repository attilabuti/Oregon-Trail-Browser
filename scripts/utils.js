const fs = require("fs");

function replaceCSS(c, f) {
    let css = "";
    f.forEach(e => {
        css += `\t<link href="${e}" rel="stylesheet" />\n`;
    });

    return c.replace("{{css}}", css);
}

function replaceJS(c, f) {
    let js = "";
    f.forEach(e => {
        js += `\t<script src="${e}"></script>\n`;
    });

    return c.replace("{{js}}", js);
}

module.exports.render = (tpl, css, js) => {
    return replaceJS(replaceCSS(fs.readFileSync(tpl, "utf8"), css), js);
};

module.exports.spPath = (url, assets) => {
    url = (url.charAt(0) === "/") ? url.slice(1, url.length) : url;
    if (url.length > 0) {
        if (assets.hasOwnProperty(url)) {
            return assets[url];
        }
    }

    return "";
};