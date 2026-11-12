// Builds the source images @capacitor/assets needs (icon and splash) from the brand files in ../assets.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const brand = join(here, '..', '..', 'assets');
const out = join(here, '..', 'assets');
mkdirSync(out, { recursive: true });

const icon = join(brand, 'icon-512.webp');
const logo = join(brand, 'logo.webp');
const crimson = { r: 90, g: 7, b: 12, alpha: 1 };
const velvet = { r: 46, g: 3, b: 6, alpha: 1 };

// legacy icon: the full rounded-square brand icon
await sharp(icon).resize(1024, 1024).png().toFile(join(out, 'icon-only.png'));
// adaptive icon: crown in the safe zone over the brand crimson
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: await sharp(icon).extract({ left: 70, top: 70, width: 372, height: 372 }).resize(560, 560).png().toBuffer(), gravity: 'center' }])
  .png().toFile(join(out, 'icon-foreground.png'));
await sharp({ create: { width: 1024, height: 1024, channels: 4, background: crimson } }).png().toFile(join(out, 'icon-background.png'));
// splash: the full logo on velvet
const logoBuf = await sharp(logo).resize(1500).png().toBuffer();
for (const name of ['splash.png', 'splash-dark.png']) {
  await sharp({ create: { width: 2732, height: 2732, channels: 4, background: velvet } })
    .composite([{ input: logoBuf, gravity: 'center' }]).png().toFile(join(out, name));
}
console.log('SINGAAR app images ready in mobile/assets');
