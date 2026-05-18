/**
 * Generates favicon and Open Graph assets from source images.
 *
 * Sources:
 *   - favicon_32.jpg / favicon_256.jpg (external design folder)
 *   - public/images/pfp.jpg (portrait for social preview)
 *
 * Outputs:
 *   - public/favicon.ico (static; avoids App Router image pipeline)
 *   - src/app/icon.png, apple-icon.png
 *   - public/images/og.jpg (1200×630)
 *
 * Run: node scripts/generate-brand-assets.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");

const FAVICON_32 =
  process.env.FAVICON_32_SRC ??
  join(process.env.HOME ?? "", "Documents/Work/00 - New portfolio/favicon_32.jpg");
const FAVICON_256 =
  process.env.FAVICON_256_SRC ??
  join(process.env.HOME ?? "", "Documents/Work/00 - New portfolio/favicon_256.jpg");
const PFP = join(ROOT, "public/images/pfp.jpg");
const APP_DIR = join(ROOT, "src/app");
const OG_OUT = join(ROOT, "public/images/og.jpg");

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OG_BG = { r: 9, g: 9, b: 11 }; // zinc-950

/** Pack one or more PNG buffers into a Windows .ico (PNG-embedded entries). */
function packPngIco(entries) {
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + dirEntrySize * entries.length;
  const parts = [];

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  parts.push(header);

  for (const { size, png } of entries) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bit depth (PNG-in-ICO)
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    parts.push(entry);
    parts.push(png);
    offset += png.length;
  }

  return Buffer.concat(parts);
}

async function writeFavicons() {
  await mkdir(APP_DIR, { recursive: true });

  const icon32 = await sharp(FAVICON_32)
    .resize(32, 32, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(join(APP_DIR, "icon.png"), icon32);

  await sharp(FAVICON_256)
    .resize(180, 180, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toFile(join(APP_DIR, "apple-icon.png"));

  const icon16 = await sharp(FAVICON_32)
    .resize(16, 16, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const ico = packPngIco([
    { size: 16, png: icon16 },
    { size: 32, png: icon32 },
  ]);
  await writeFile(join(ROOT, "public/favicon.ico"), ico);
}

async function writeOgImage() {
  const portraitSize = 520;
  const portrait = await sharp(PFP)
    .resize(portraitSize, portraitSize, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      channels: 3,
      background: OG_BG,
    },
  })
    .composite([
      {
        input: portrait,
        left: Math.round((OG_WIDTH - portraitSize) / 2),
        top: Math.round((OG_HEIGHT - portraitSize) / 2),
      },
    ])
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(OG_OUT);
}

async function main() {
  for (const path of [FAVICON_32, FAVICON_256, PFP]) {
    try {
      await sharp(path).metadata();
    } catch {
      throw new Error(`Missing or unreadable source image: ${path}`);
    }
  }

  await writeFavicons();
  await writeOgImage();

  console.log("Brand assets generated:");
  console.log("  public/favicon.ico");
  console.log("  src/app/icon.png");
  console.log("  src/app/apple-icon.png");
  console.log("  public/images/og.jpg");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
