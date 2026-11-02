const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const width = 1200;
const height = 630;

const svgOverlay = Buffer.from(`
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="darkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#050407" stop-opacity="0.98"/>
      <stop offset="42%" stop-color="#08060a" stop-opacity="0.95"/>
      <stop offset="62%" stop-color="#0d0910" stop-opacity="0.80"/>
      <stop offset="80%" stop-color="#0d0910" stop-opacity="0.40"/>
      <stop offset="100%" stop-color="#0d0910" stop-opacity="0.10"/>
    </linearGradient>
    <radialGradient id="rubyGlow" cx="22%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#e11d48" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#9f1239" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Left Dark Gradient Background to make text pop over the photo -->
  <rect width="100%" height="100%" fill="url(#darkGrad)"/>
  <rect width="100%" height="100%" fill="url(#rubyGlow)"/>

  <!-- Left Content Area (Simple, High-Converting, No Eyebrow, No Ticks) -->
  <g transform="translate(90, 140)">
    <!-- Main Clever Headline (Luxury Serif) -->
    <text x="0" y="60" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-size="58" font-weight="700" letter-spacing="-0.5">
      Pleasure Kept Secret.
    </text>
    <text x="0" y="128" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-size="58" font-weight="700" letter-spacing="-0.5">
      Delivered in Plain Sight.
    </text>

    <!-- Subheadline -->
    <text x="0" y="195" fill="#e5e7eb" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400">
      Nigeria&apos;s discreet boutique for curated body-safe pleasure pieces.
    </text>

    <!-- Clean Call to action button with 8px radius -->
    <g transform="translate(0, 260)">
      <rect x="0" y="0" width="280" height="52" rx="8" fill="#e11d48"/>
      <text x="140" y="32" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="700" letter-spacing="1.2" text-anchor="middle">EXPLORE COLLECTION &#8594;</text>
      <text x="315" y="33" fill="#9ca3af" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500">thetoysvirago.shop</text>
    </g>
  </g>
</svg>
`);

async function makeCover() {
  const bg = await sharp('public/assets/bundle-seduction-kit.jpg')
    .resize(1200, 630, { fit: 'cover', position: 'right top' })
    .toBuffer();

  await sharp(bg)
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .webp({ quality: 92 })
    .toFile('public/assets/og-cover.webp');

  await sharp('public/assets/og-cover.webp')
    .jpeg({ quality: 90 })
    .toFile('public/assets/og-cover.jpg');

  console.log('Clean, simple og-cover.webp and og-cover.jpg generated successfully!');
}

makeCover().catch(console.error);
