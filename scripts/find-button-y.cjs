const sharp = require('sharp');

async function analyzeRows() {
  const img = sharp('public/assets/confession-modal-bg.jpg');
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;

  // Let's count red pixels per row between Y = 550 and Y = 750 in the center X: 350-650
  console.log('Row scan for red button in center:');
  let btnStart = -1, btnEnd = -1;
  for (let y = 550; y < 760; y++) {
    let redCount = 0;
    for (let x = 350; x < 650; x++) {
      const idx = (y * width + x) * 3;
      if (data[idx] > 150 && data[idx+1] < 40 && data[idx+2] < 40) {
        redCount++;
      }
    }
    if (redCount > 150) {
      if (btnStart === -1) btnStart = y;
      btnEnd = y;
    }
  }
  console.log('Pin My Confession Button Y:', btnStart, 'to', btnEnd, 'height:', btnEnd - btnStart);
  console.log('Top %:', (btnStart / height * 100).toFixed(1) + '%', 'Height %:', ((btnEnd - btnStart) / height * 100).toFixed(1) + '%');
}

analyzeRows();
