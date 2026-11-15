const fs = require('fs');
const sharp = require('sharp');

async function main() {
  // Use the exact asset rendered in the top navigation (with a JPEG fallback)
  const src = fs.existsSync('public/assets/logo.webp')
    ? 'public/assets/logo.webp'
    : 'public/assets/logo.jpg';

  // 1. Generate Favicon sizes (Google Search recommends square icons larger than 48x48)
  await sharp(src).resize(48, 48, { fit: 'cover', position: 'centre' }).toFile('public/favicon-48x48.png');
  await sharp(src).resize(96, 96, { fit: 'cover', position: 'centre' }).toFile('public/favicon-96x96.png');
  await sharp(src).resize(192, 192, { fit: 'cover', position: 'centre' }).toFile('public/favicon-192x192.png');
  await sharp(src).resize(512, 512, { fit: 'cover', position: 'centre' }).toFile('public/favicon-512x512.png');
  await sharp(src).resize(180, 180, { fit: 'cover', position: 'centre' }).toFile('public/apple-touch-icon.png');

  // 2. Generate valid root favicon.ico (48x48 PNG inside ICO wrapper)
  const png48 = await sharp(src)
    .resize(48, 48, { fit: 'cover', position: 'centre' })
    .toFormat('png')
    .toBuffer();
  const icoHeader = Buffer.alloc(22);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(1, 4);
  icoHeader.writeUInt8(48, 6);
  icoHeader.writeUInt8(48, 7);
  icoHeader.writeUInt8(0, 8);
  icoHeader.writeUInt8(0, 9);
  icoHeader.writeUInt16LE(1, 10);
  icoHeader.writeUInt16LE(32, 12);
  icoHeader.writeUInt32LE(png48.length, 14);
  icoHeader.writeUInt32LE(22, 18);
  fs.writeFileSync('public/favicon.ico', Buffer.concat([icoHeader, png48]));

  // 3. Generate favicon.svg embedding the genuine nav logo as a JPEG payload
  // (Google Search doesn't support SVG favicons, so the ICO/PNG files above
  // remain the Search-facing icons; this is just a crisp browser fallback).
  const embed = await sharp(src)
    .resize(400, 400, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 92 })
    .toBuffer();
  const b64 = embed.toString('base64');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <rect width="400" height="400" fill="#000000"/>
  <image width="400" height="400" href="data:image/jpeg;base64,${b64}"/>
</svg>`;
  fs.writeFileSync('public/favicon.svg', svg);

  console.log('Successfully generated all Google-optimized logo & favicon assets!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
