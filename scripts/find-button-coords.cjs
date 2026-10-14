const sharp = require('sharp');

async function analyze() {
  const img = sharp('public/assets/confession-modal-bg.jpg');
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;

  // Let's find the red button: where R > 150, G < 40, B < 40 in the lower half
  let minX = width, maxX = 0, minY = height, maxY = 0;
  let count = 0;
  for (let y = Math.floor(height * 0.5); y < Math.floor(height * 0.85); y++) {
    for (let x = Math.floor(width * 0.2); x < Math.floor(width * 0.8); x++) {
      const idx = (y * width + x) * 3;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      // Red button color test: strong red
      if (r > 140 && g < 40 && b < 40) {
        count++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log('Button bounds:', { minX, maxX, minY, maxY, count });
  console.log('Button %:', {
    left: (minX / width * 100).toFixed(2) + '%',
    right: (maxX / width * 100).toFixed(2) + '%',
    width: ((maxX - minX) / width * 100).toFixed(2) + '%',
    top: (minY / height * 100).toFixed(2) + '%',
    bottom: (maxY / height * 100).toFixed(2) + '%',
    height: ((maxY - minY) / height * 100).toFixed(2) + '%'
  });
}

analyze();
