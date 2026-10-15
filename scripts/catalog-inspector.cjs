const fs = require('fs');
const path = require('path');

const groups = JSON.parse(fs.readFileSync('scripts/lingerie-final-groups.json'));

groups.forEach((g, idx) => {
  const imgs = g.files.filter(f => f.endsWith('.jpg'));
  const vids = g.files.filter(f => f.endsWith('.mp4'));
  console.log(`Product ${idx + 1}: ${imgs.length} photos, ${vids.length} videos | Sample: ${imgs[0]}`);
});
