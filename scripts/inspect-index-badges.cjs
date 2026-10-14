const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /<span[^>]*class="[^"]*badge[^"]*"[^>]*>([\s\S]*?)<\/span>/gi;
let m;
const badges = [];
while ((m = regex.exec(html)) !== null) {
  if (/55k|k|₦|\d{2,}/i.test(m[1])) {
    badges.push({ full: m[0], text: m[1].trim() });
  }
}
console.log('Index badges with k, ₦, or numbers:');
badges.forEach(b => console.log(b.text));
