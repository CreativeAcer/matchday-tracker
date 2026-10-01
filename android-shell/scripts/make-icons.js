// Maakt de Android-iconen en splash-afbeeldingen uit de web-iconen in de repo-root:
//   icon-512.png            -> oude launchers (vierkant met ronde hoeken / rond) en splash
//   icon-maskable-512.png   -> adaptief icoon (voorgrondlaag), met veilige marge voor elk maskervorm
// Een nieuw logo in de repo-root komt zo bij de volgende build vanzelf in de APK.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..", "..");
const BRAND = { r: 0x16, g: 0x36, b: 0x2A };       // #16362A, achtergrond van de splash
const ANY = path.join(root, "icon-512.png");
const MASKABLE = path.join(root, "icon-maskable-512.png");

const DENSITY = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
const SPLASH_PORT = { mdpi: [320, 480], hdpi: [480, 800], xhdpi: [720, 1280], xxhdpi: [960, 1600], xxxhdpi: [1280, 1920] };
const SPLASH_LAND = { mdpi: [480, 320], hdpi: [800, 480], xhdpi: [1280, 720], xxhdpi: [1600, 960], xxxhdpi: [1920, 1280] };
// Op een 108dp-canvas ziet Android door het masker 72dp (cirkel: 66,7%). Een maskable-afbeelding houdt
// haar inhoud binnen een cirkel van 80% doorsnede; bij schaal 0.82 past die precies binnen het zichtbare deel.
const FOREGROUND_SCALE = 0.82;

function mask(size, kind) {
  var shape = kind === "circle"
    ? '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + size / 2 + '"/>'
    : '<rect width="' + size + '" height="' + size + '" rx="' + Math.round(size * 0.22) + '"/>';
  return Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '">' + shape + "</svg>");
}
function shaped(size, kind) {
  return sharp(ANY).resize(size, size, { fit: "cover" })
    .composite([{ input: mask(size, kind), blend: "dest-in" }]).png().toBuffer();
}
function hex(n) { return ("0" + n.toString(16)).slice(-2); }

async function borderColor() {                       // gemiddelde kleur van de rand van de maskable-afbeelding
  var im = await sharp(MASKABLE).resize(64, 64).removeAlpha().raw().toBuffer();
  var r = 0, g = 0, b = 0, n = 0;
  for (var y = 0; y < 64; y++) for (var x = 0; x < 64; x++) {
    if (x > 2 && x < 61 && y > 2 && y < 61) continue;
    var i = (y * 64 + x) * 3; r += im[i]; g += im[i + 1]; b += im[i + 2]; n++;
  }
  return "#" + hex(Math.round(r / n)) + hex(Math.round(g / n)) + hex(Math.round(b / n));
}

async function makeIcons(resDir) {
  [ANY, MASKABLE].forEach(function (f) {
    if (!fs.existsSync(f)) throw new Error("make-icons: " + path.basename(f) + " ontbreekt in de repo-root");
  });
  function out(rel) { var p = path.join(resDir, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); return p; }

  for (var d in DENSITY) {
    var legacy = Math.round(48 * DENSITY[d]);
    fs.writeFileSync(out("mipmap-" + d + "/ic_launcher.png"), await shaped(legacy, "rounded"));
    fs.writeFileSync(out("mipmap-" + d + "/ic_launcher_round.png"), await shaped(legacy, "circle"));
    var canvas = Math.round(108 * DENSITY[d]), art = Math.round(canvas * FOREGROUND_SCALE);
    var inner = await sharp(MASKABLE).resize(art, art, { fit: "cover" }).png().toBuffer();
    fs.writeFileSync(out("mipmap-" + d + "/ic_launcher_foreground.png"),
      await sharp({ create: { width: canvas, height: canvas, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite([{ input: inner, gravity: "centre" }]).png().toBuffer());
  }

  var bg = await borderColor();
  fs.writeFileSync(out("values/ic_launcher_background.xml"),
    '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">' + bg + "</color>\n</resources>\n");

  async function splash(w, h) {
    var side = Math.round(Math.min(w, h) * 0.30);
    return sharp({ create: { width: w, height: h, channels: 3, background: BRAND } })
      .composite([{ input: await shaped(side, "rounded"), gravity: "centre" }]).removeAlpha().png().toBuffer();
  }
  fs.writeFileSync(out("drawable/splash.png"), await splash(480, 320));
  for (var k in SPLASH_PORT) fs.writeFileSync(out("drawable-port-" + k + "/splash.png"), await splash(SPLASH_PORT[k][0], SPLASH_PORT[k][1]));
  for (var k2 in SPLASH_LAND) fs.writeFileSync(out("drawable-land-" + k2 + "/splash.png"), await splash(SPLASH_LAND[k2][0], SPLASH_LAND[k2][1]));
  return bg;
}

module.exports = makeIcons;
if (require.main === module) {
  var target = process.argv[2];
  if (!target) { console.error("gebruik: node scripts/make-icons.js <res-map>"); process.exit(1); }
  makeIcons(path.resolve(target)).then(function (bg) { console.log("make-icons: klaar, achtergrond " + bg); })
    .catch(function (e) { console.error(e.message || e); process.exit(1); });
}
