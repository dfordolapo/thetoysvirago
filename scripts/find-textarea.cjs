const sharp = require('sharp');

async function analyzeTextarea() {
  const img = sharp('public/assets/confession-modal-bg.jpg');
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;

  // Center note is light cream (~235-245 RGB)
  // Textarea background is slightly grey (~225-235 RGB) or surrounded by border (~190-215 RGB)
  // Let's scan along vertical line x = 512
  console.log('Vertical line at x=512 from y=280 to y=670:');
  for (let y = 300; y < 670; y += 10) {
    const idx = (y * width + 512) * 3;
    const r = data[idx], g = data[idx+1], b = data[idx+2];
    console.log(`y=${y}: rgb(${r},${g},${b})`);
  }
}

analyzeTextarea();
