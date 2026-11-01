const fs = require('fs');
const sharp = require('sharp');

async function main() {
  const src = 'public/assets/logo.jpg';

  // 1. Generate Favicon sizes
  await sharp(src).resize(48, 48).toFile('public/favicon-48x48.png');
  await sharp(src).resize(96, 96).toFile('public/favicon-96x96.png');
  await sharp(src).resize(192, 192).toFile('public/favicon-192x192.png');
  await sharp(src).resize(512, 512).toFile('public/favicon-512x512.png');
  await sharp(src).resize(180, 180).toFile('public/apple-touch-icon.png');

  // 2. Generate valid root favicon.ico (48x48 PNG inside ICO wrapper)
  const png48 = await sharp(src).resize(48, 48).toFormat('png').toBuffer();
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

  // 3. Generate favicon.svg embedding the genuine logo
  const b64 = fs.readFileSync(src).toString('base64');
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
