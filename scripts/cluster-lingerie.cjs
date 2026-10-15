const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../public/assets/Lingerie');
const files = fs.readdirSync(dir);

function parseTime(filename) {
  const m = filename.match(/(?:PHOTO|VIDEO)-(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const [_, y, mo, d, h, mi, s] = m;
  return new Date(y, parseInt(mo, 10) - 1, d, h, mi, s).getTime();
}

const parsed = files
  .map(f => ({ name: f, time: parseTime(f) }))
  .filter(x => x.time !== null);

parsed.sort((a, b) => a.time - b.time || a.name.localeCompare(b.name));

// We cluster photos into distinct products:
// An item photoshoot typically consists of mannequin shots (front/back), detail shots, model shots (front/back), and optional video.
// If the time difference between consecutive media files is <= 150 seconds, they belong to the same session.
const clusters = [];
let current = [];

for (let i = 0; i < parsed.length; i++) {
  if (current.length === 0) {
    current.push(parsed[i]);
  } else {
    const prev = current[current.length - 1];
    const diffSec = (parsed[i].time - prev.time) / 1000;
    if (diffSec <= 150) {
      current.push(parsed[i]);
    } else {
      clusters.push(current);
      current = [parsed[i]];
    }
  }
}
if (current.length > 0) clusters.push(current);

// Merge video-only clusters
for (let i = 0; i < clusters.length; i++) {
  const imgs = clusters[i].filter(x => x.name.endsWith('.jpg'));
  if (imgs.length === 0) {
    let target = null;
    if (i > 0) target = clusters[i - 1];
    else if (i < clusters.length - 1) target = clusters[i + 1];
    if (target) {
      target.push(...clusters[i]);
      target.sort((a, b) => a.time - b.time);
      clusters.splice(i, 1);
      i--;
    }
  }
}

console.log('Total identified lingerie products:', clusters.length);
const summary = clusters.map((c, idx) => {
  const imgs = c.filter(x => x.name.endsWith('.jpg')).map(x => x.name);
  const vids = c.filter(x => x.name.endsWith('.mp4')).map(x => x.name);
  return {
    index: idx + 1,
    photoCount: imgs.length,
    videoCount: vids.length,
    files: c.map(x => x.name)
  };
});

fs.writeFileSync('scripts/lingerie-clusters.json', JSON.stringify(summary, null, 2));
console.log('Saved to scripts/lingerie-clusters.json');
