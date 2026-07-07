import { readFileSync } from "node:fs";

const requiredFiles = [
  "index.html",
  "styles.css",
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
for (const file of ["./index.html", "./styles.css", "./game.js", "./manifest.webmanifest"]) {
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

console.log("Static validation passed.");
