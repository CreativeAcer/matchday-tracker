// Bouwt de map www/ voor Capacitor uit de gewone PWA-bestanden in de repo-root.
//  - kopieert index.html, manifest en iconen (sw.js bewust NIET: de app-schil heeft geen service worker nodig)
//  - bundelt de lettertypes (Oswald, Work Sans) in de app, want zonder service worker zijn er geen
//    Google Fonts offline; de 3 <link>-regels naar Google Fonts worden vervangen door lokale @font-face
// Draai vanuit android-shell/:  node scripts/prepare-www.js
const fs = require("fs");
const path = require("path");

const shell = path.resolve(__dirname, "..");
const root = path.resolve(shell, "..");
const www = path.join(shell, "www");

function fail(msg) { console.error("prepare-www: " + msg); process.exit(1); }

if (!fs.existsSync(path.join(root, "index.html"))) fail("index.html niet gevonden in " + root);

fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(path.join(www, "fonts"), { recursive: true });

// 1. losse bestanden
["manifest.json", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "apple-touch-icon.png"].forEach(function (f) {
  var src = path.join(root, f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(www, f));
  else console.warn("prepare-www: waarschuwing, ontbreekt: " + f);
});

// 2. lettertypes
var LATIN = "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
var LATIN_EXT = "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF";
var FONTS = [
  { family: "Oswald", pkg: "oswald", weights: [500, 600, 700] },
  { family: "Work Sans", pkg: "work-sans", weights: [400, 500, 600, 700] }
];
var css = "<style id=\"bundled-fonts\">\n";
FONTS.forEach(function (f) {
  f.weights.forEach(function (w) {
    [["latin", LATIN], ["latin-ext", LATIN_EXT]].forEach(function (s) {
      var name = f.pkg + "-" + s[0] + "-" + w + "-normal.woff2";
      var src = path.join(shell, "node_modules", "@fontsource", f.pkg, "files", name);
      if (!fs.existsSync(src)) fail("lettertype ontbreekt (npm ci gedaan?): " + src);
      fs.copyFileSync(src, path.join(www, "fonts", name));
      css += "@font-face{font-family:'" + f.family + "';font-style:normal;font-weight:" + w +
        ";font-display:swap;src:url(fonts/" + name + ") format('woff2');unicode-range:" + s[1] + ";}\n";
    });
  });
});
css += "</style>\n";

// 3. index.html aanpassen
var html = fs.readFileSync(path.join(root, "index.html"), "utf8");
var before = html.length;
html = html.replace(/<link[^>]*fonts\.(googleapis|gstatic)\.com[^>]*>\s*/g, "");
if (html.length === before) fail("geen Google Fonts-regels gevonden om te vervangen; is index.html veranderd?");
if (/fonts\.(googleapis|gstatic)\.com/.test(html.replace(/<style id="bundled-fonts">[\s\S]*?<\/style>/, ""))) {
  // ook verwijzingen buiten <link> (bv. in CSS @import) zouden offline stilletjes falen
  fail("er staat nog een verwijzing naar Google Fonts in index.html");
}
if (html.indexOf("</head>") === -1) fail("</head> niet gevonden");
html = html.replace("</head>", css + "</head>");
fs.writeFileSync(path.join(www, "index.html"), html);

console.log("prepare-www: klaar (" + fs.readdirSync(path.join(www, "fonts")).length + " lettertype-bestanden, index.html " + Math.round(html.length / 1024) + " KB)");
