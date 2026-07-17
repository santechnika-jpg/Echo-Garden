import { readFileSync } from "node:fs";

const requiredFiles = [
  "index.html",
  "styles.css",
  "mobile-polish.css",
  "no-rings-v8.css",
  "audio-boost.js",
  "game.js",
  "manifest.webmanifest",
  "service-worker.js",
  "project-manifest.yaml",
  "icons/echo-garden-icon.svg",
  "icons/echo-garden-maskable.svg"
];

for (const file of requiredFiles) {
  readFileSync(file, "utf8");
}

const manifest = JSON.parse(readFileSync("manifest.webmanifest", "utf8"));
if (!Array.isArray(manifest.icons) || manifest.icons.length < 2) {
  throw new Error("manifest.webmanifest must declare at least two icons");
}

for (const icon of manifest.icons) {
  if (!icon.src || icon.src.startsWith("data:")) {
    throw new Error("manifest icons must use project-owned icon files");
  }
}

const serviceWorker = readFileSync("service-worker.js", "utf8");
for (const file of ["./index.html", "./styles.css?v=9", "./mobile-polish.css?v=9", "./no-rings-v8.css?v=9", "./audio-boost.js?v=9", "./game.js?v=9", "./manifest.webmanifest"]) {
  if (!serviceWorker.includes(file)) {
    throw new Error(`service-worker.js cache list is missing ${file}`);
  }
}

const html = readFileSync("index.html", "utf8");
for (const id of ["motionToggle", "contrastToggle", "modeClassic", "modeZen", "modeDaily", "modePractice"]) {
  if (!html.includes(`id="${id}"`)) {
    throw new Error(`index.html is missing #${id}`);
  }
}

for (const script of ["game.js", "audio-boost.js"]) {
  const source = readFileSync(script, "utf8");
  if (source.includes("\uFFFD") || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/u.test(source)) {
    throw new Error(`${script} appears to contain invalid text or control characters`);
  }
}

const game = readFileSync("game.js", "utf8");
if (game.includes("masterGaion")) {
  throw new Error("game.js contains unexpected text: masterGaion");
}

if (!html.includes("styles.css?v=9") || !html.includes("mobile-polish.css?v=9") || !html.includes("no-rings-v8.css?v=9") || !html.includes("audio-boost.js?v=9") || !html.includes("game.js?v=9")) {
  throw new Error("index.html must load the v9 app shell assets");
}

if (!serviceWorker.includes("echo-garden-v9")) {
  throw new Error("service-worker.js cache version must be echo-garden-v9");
}

const noRings = readFileSync("no-rings-v8.css", "utf8");
for (const required of [".version-badge", ".ripple", ".trail", "display: none !important", "plantArtworkFlash", ".plant.active .plant-shape"]) {
  if (!noRings.includes(required)) {
    throw new Error(`no-rings-v8.css is missing required hard override: ${required}`);
  }
}

if (!html.includes(">v9<")) {
  throw new Error("index.html must display the current version badge");
}

if (html.indexOf("no-rings-v8.css?v=9") < html.indexOf("mobile-polish.css?v=9")) {
  throw new Error("no-rings-v8.css must load after mobile-polish.css");
}

console.log("Static validation passed.");
