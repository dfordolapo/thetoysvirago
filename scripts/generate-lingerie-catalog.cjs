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

// 45s threshold
const clusters = [];
let current = [];

for (let i = 0; i < parsed.length; i++) {
  if (current.length === 0) {
    current.push(parsed[i]);
  } else {
    const prev = current[current.length - 1];
    const diffSec = (parsed[i].time - prev.time) / 1000;
    if (diffSec <= 45) {
      current.push(parsed[i]);
    } else {
      clusters.push(current);
      current = [parsed[i]];
    }
  }
}
if (current.length > 0) clusters.push(current);

// Merge video-only clusters to the nearest cluster
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

// Special known pairs:
// 1. Yellow/pink halter romper: model shots (15-45) and mannequin shots (15-46)
for (let i = 0; i < clusters.length - 1; i++) {
  const f1 = clusters[i][0].name;
  const f2 = clusters[i + 1][0].name;
  if (f1.includes('15-45-36') && f2.includes('15-46-59')) {
    clusters[i].push(...clusters[i + 1]);
    clusters.splice(i + 1, 1);
    break;
  }
}

console.log('Final clean product count:', clusters.length);

let html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Lingerie Sorting Preview</title><style>
body { font-family: sans-serif; background: #111; color: #eee; padding: 20px; }
.prod-block { background: #1a1a24; border: 1px solid #333; border-radius: 12px; margin-bottom: 24px; padding: 16px; }
.prod-title { font-size: 18px; font-weight: bold; color: #ff2d55; margin-bottom: 12px; }
.media-row { display: flex; gap: 12px; flex-wrap: wrap; }
.media-item { display: flex; flex-direction: column; align-items: center; width: 140px; }
.media-item img { width: 140px; height: 190px; object-fit: cover; border-radius: 8px; border: 1px solid #444; }
.media-item video { width: 140px; height: 190px; object-fit: cover; border-radius: 8px; border: 1px solid #444; }
.media-name { font-size: 10px; color: #888; margin-top: 4px; word-break: break-all; text-align: center; }
</style></head><body><h1>Sorted Lingerie Products (${clusters.length} total)</h1>`;

clusters.forEach((c, idx) => {
  html += `<div class="prod-block"><div class="prod-title">Product #${idx + 1} (${c.length} files)</div><div class="media-row">`;
  c.forEach(item => {
    if (item.name.endsWith('.mp4')) {
      html += `<div class="media-item"><video src="/assets/Lingerie/${item.name}" controls muted playsinline></video><span class="media-name">${item.name}</span></div>`;
    } else {
      html += `<div class="media-item"><img src="/assets/Lingerie/${item.name}" loading="lazy"/><span class="media-name">${item.name}</span></div>`;
    }
  });
  html += `</div></div>`;
});

html += `</body></html>`;
fs.writeFileSync('lingerie-preview.html', html);
console.log('Wrote lingerie-preview.html successfully!');
