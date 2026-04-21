/**
 * Generates placeholder imagery for the first-pass build:
 *   - src/assets/films/placeholder-1.jpg … placeholder-4.jpg  (1600x900, dark gradients)
 *
 * Each thumbnail uses a different warm accent so the featured grid doesn't look
 * like a single duplicated tile. Torin will replace these with real stills.
 *
 * Run with:  npm run placeholders
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const OUT = resolve(ROOT, "src/assets/films");
await mkdir(OUT, { recursive: true });

const WIDTH = 1600;
const HEIGHT = 900;

// Four moody palettes — top-left → bottom-right gradient stops.
const palettes = [
  { from: "#1a1410", to: "#3a2818" }, // warm umber
  { from: "#0f1419", to: "#1c2a35" }, // cool steel
  { from: "#14100e", to: "#3a241a" }, // deep ember
  { from: "#0d0d10", to: "#28242e" }, // soft plum
];

for (let i = 0; i < palettes.length; i++) {
  const { from, to } = palettes[i];
  const label = String.fromCharCode(65 + i); // A, B, C, D
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${from}" />
          <stop offset="100%" stop-color="${to}" />
        </linearGradient>
        <radialGradient id="v" cx="50%" cy="50%" r="70%">
          <stop offset="60%" stop-color="rgba(0,0,0,0)" />
          <stop offset="100%" stop-color="rgba(0,0,0,0.6)" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)" />
      <rect width="100%" height="100%" fill="url(#v)" />
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
            font-family="Georgia, serif" font-size="140" fill="rgba(236,231,223,0.12)"
            letter-spacing="0.2em">${label}</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(resolve(OUT, `placeholder-${i + 1}.jpg`));
}

console.log(`Generated ${palettes.length} film placeholders into src/assets/films.`);
