const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const width = 1200;
const height = 630;

const svgOverlay = Buffer.from(`
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Dark Vignette and Gradient Overlay for contrast -->
    <linearGradient id="giftDarkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#07060a" stop-opacity="0.97"/>
      <stop offset="48%" stop-color="#0a080d" stop-opacity="0.92"/>
      <stop offset="70%" stop-color="#0d0a12" stop-opacity="0.65"/>
      <stop offset="100%" stop-color="#0d0a12" stop-opacity="0.25"/>
    </linearGradient>
    <radialGradient id="giftRubyGlow" cx="20%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#e11d48" stop-opacity="0.30"/>
      <stop offset="100%" stop-color="#9f1239" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Dark & Ruby Tinted Gradient -->
  <rect width="100%" height="100%" fill="url(#giftDarkGrad)"/>
  <rect width="100%" height="100%" fill="url(#giftRubyGlow)"/>

  <!-- Left Content Area -->
  <g transform="translate(85, 120)">
    <!-- Cheeky Pill Tag -->
    <g transform="translate(0, 0)">
      <rect x="0" y="0" width="185" height="34" rx="17" fill="rgba(225, 29, 72, 0.2)" stroke="rgba(225, 29, 72, 0.45)" stroke-width="1"/>
      <text x="92" y="22" fill="#fda4af" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" letter-spacing="1.5" text-anchor="middle">BESTIE GIFT GUIDE</text>
    </g>

    <!-- Clever Copy Header (Playful & Direct) -->
    <text x="0" y="85" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-size="52" font-weight="700" letter-spacing="-0.5">
      Because Single Friends
    </text>
    <text x="0" y="145" fill="#fda4af" font-family="Georgia, 'Times New Roman', serif" font-size="52" font-weight="700" letter-spacing="-0.5">
      Deserve Better Orgasms.
    </text>

    <!-- Subtitle Copy -->
    <text x="0" y="210" fill="#e2e8f0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="400">
      Pick a favorite. Add an anonymous note. Delivered 100% quietly.
    </text>

    <!-- Clean CTA Button (8px radius) & URL Brand -->
    <g transform="translate(0, 275)">
      <rect x="0" y="0" width="240" height="52" rx="8" fill="#e11d48"/>
      <text x="120" y="32" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" letter-spacing="1" text-anchor="middle">SEND AS A GIFT &#8594;</text>
      <text x="275" y="33" fill="#9ca3af" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500">thetoysvirago.shop/gift</text>
    </g>
  </g>
</svg>
`);

async function generateGiftCover() {
  // 1. Prepare blurred background of friends gifting
  const blurredBg = await sharp('public/assets/gift-single-friend.webp')
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .blur(14)
    .modulate({ brightness: 0.85, saturation: 1.1 })
    .toBuffer();

  // 2. Composite with typographic SVG layout
  await sharp(blurredBg)
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .webp({ quality: 92 })
    .toFile('public/assets/gift-og-cover.webp');

  await sharp('public/assets/gift-og-cover.webp')
    .jpeg({ quality: 90 })
    .toFile('public/assets/gift-og-cover.jpg');

  console.log('Gift section social preview created: gift-og-cover.webp & gift-og-cover.jpg');
}

generateGiftCover().catch(console.error);
