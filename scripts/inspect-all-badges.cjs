const fs = require('fs');

function checkBadges(filePath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const regex = /<span[^>]*class="[^"]*badge[^"]*"[^>]*>([\s\S]*?)<\/span>/gi;
  let m;
  const badges = [];
  while ((m = regex.exec(html)) !== null) {
    badges.push({ full: m[0], text: m[1].trim() });
  }
  return badges;
}

console.log('--- products.html badges ---');
const pBadges = checkBadges('products.html');
const uniqueP = [...new Set(pBadges.map(b => b.text))];
uniqueP.forEach(b => console.log(b));

console.log('\n--- index.html badges ---');
const iBadges = checkBadges('index.html');
const uniqueI = [...new Set(iBadges.map(b => b.text))];
uniqueI.forEach(b => console.log(b));
