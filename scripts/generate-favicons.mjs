/**
 * Generates favicons and a dark-theme logo variant from the master logo PNG.
 *
 * Source: TGD - Logo (Black on White).png  (3998 x 1329, black artwork on white)
 *
 * Outputs:
 *   public/logo.png                 — full logo on transparent background (dark mark)
 *   public/logo-light.png           — full logo inverted to white for dark site chrome
 *   public/favicon-16.png           — favicon (16x16)
 *   public/favicon-32.png           — favicon (32x32)
 *   public/favicon-48.png           — favicon (48x48)
 *   public/apple-touch-icon.png     — iOS home-screen icon (180x180)
 *   public/icon-192.png             — PWA-sized icon
 *   public/icon-512.png             — PWA-sized icon
 *
 * The favicon is cropped from the square "TG" logomark on the left of the
 * master file so the favicon reads at small sizes.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SRC = resolve(ROOT, "TGD - Logo (Black on White).png");
const OUT = resolve(ROOT, "public");

await mkdir(OUT, { recursive: true });

// --- Full logo, transparent background (for light surfaces) ---
const makeTransparent = (input) =>
  sharp(input)
    .ensureAlpha()
    .recomb([
      // Leave RGB untouched; alpha handled below via threshold.
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ])
    // Treat near-white as fully transparent so the logo can sit on any color.
    .removeAlpha()
    .toColourspace("srgb")
    .ensureAlpha();

const master = sharp(SRC).ensureAlpha();
const { width, height } = await master.metadata();
if (!width || !height) throw new Error("Could not read logo dimensions");

// Knock out white background → transparent.
// We multiply each channel by its own value and use a threshold on luminance.
const transparentBuffer = await sharp(SRC)
  .ensureAlpha()
  // Convert white pixels to transparent by using the inverted grayscale as alpha.
  .raw()
  .toBuffer({ resolveWithObject: true })
  .then(({ data, info }) => {
    const out = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Luminance: 1 = white, 0 = black. Alpha = 1 - luminance.
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      const alpha = Math.round((1 - lum) * 255);
      out[i] = 0; // r
      out[i + 1] = 0; // g
      out[i + 2] = 0; // b  (dark mark)
      out[i + 3] = alpha;
    }
    return sharp(out, { raw: info }).png().toBuffer();
  });

await sharp(transparentBuffer).toFile(resolve(OUT, "logo.png"));

// White variant: same alpha, white fill.
const lightBuffer = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })
  .then(({ data, info }) => {
    const out = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      const alpha = Math.round((1 - lum) * 255);
      out[i] = 255;
      out[i + 1] = 255;
      out[i + 2] = 255;
      out[i + 3] = alpha;
    }
    return sharp(out, { raw: info }).png().toBuffer();
  });

await sharp(lightBuffer).toFile(resolve(OUT, "logo-light.png"));

// --- Favicon: crop the square TG logomark from the left side ---
// The logomark occupies roughly the left third of the source; height drives the square.
const markSize = Math.min(height, Math.floor(width / 3));
const markBuffer = await sharp(transparentBuffer)
  .extract({ left: 0, top: 0, width: markSize, height: markSize })
  .toBuffer();

const faviconSizes = [
  ["favicon-16.png", 16],
  ["favicon-32.png", 32],
  ["favicon-48.png", 48],
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
];

for (const [name, size] of faviconSizes) {
  await sharp(markBuffer)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(resolve(OUT, name));
}

console.log("Generated logos + favicons into /public.");
