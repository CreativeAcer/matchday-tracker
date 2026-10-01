// Draai NA "npx cap add android" en VOOR "npx cap sync android".
//  - zet versionName (= APP_VERSION uit index.html) en versionCode (= env VERSION_CODE, anders 1) in build.gradle
//  - kopieert onze iconen en splash (res/) over de standaardbestanden van het Android-project
const fs = require("fs");
const path = require("path");

const shell = path.resolve(__dirname, "..");
const root = path.resolve(shell, "..");
const androidApp = path.join(shell, "android", "app");

function fail(msg) { console.error("patch-android: " + msg); process.exit(1); }

if (!fs.existsSync(androidApp)) fail("android/app bestaat niet; eerst 'npx cap add android' draaien");

var html = fs.readFileSync(path.join(root, "index.html"), "utf8");
var m = html.match(/APP_VERSION\s*=\s*"(\d+)"/);
if (!m) fail("APP_VERSION niet gevonden in index.html");
var versionName = m[1];
var versionCode = parseInt(process.env.VERSION_CODE || "1", 10);
if (!(versionCode >= 1)) fail("ongeldige VERSION_CODE: " + process.env.VERSION_CODE);

var gradlePath = path.join(androidApp, "build.gradle");
var gradle = fs.readFileSync(gradlePath, "utf8");
var g2 = gradle.replace(/versionCode\s+\d+/, "versionCode " + versionCode).replace(/versionName\s+"[^"]*"/, 'versionName "' + versionName + '"');
if (g2.indexOf("versionCode " + versionCode) === -1 || g2.indexOf('versionName "' + versionName + '"') === -1) fail("versionCode/versionName niet gevonden in build.gradle");
fs.writeFileSync(gradlePath, g2);

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from, { withFileTypes: true }).forEach(function (e) {
    var a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b); else fs.copyFileSync(a, b);
  });
}
var resFrom = path.join(shell, "res"), resTo = path.join(androidApp, "src", "main", "res");
if (!fs.existsSync(resFrom)) fail("res/ ontbreekt");
copyDir(resFrom, resTo);

console.log("patch-android: versionName " + versionName + ", versionCode " + versionCode + ", res/ gekopieerd");
