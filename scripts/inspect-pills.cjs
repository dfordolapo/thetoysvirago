const fs = require('fs');
const html = fs.readFileSync('products.html', 'utf8');

// Check size pills
const sizePills = [];
const regex = /<button[^>]*class="[^"]*size-pill[^"]*"[^>]*>([\s\S]*?)<\/button>/gi;
let m;
while ((m = regex.exec(html)) !== null) {
  sizePills.push({ full: m[0], text: m[1].trim() });
}

console.log('Total size pills:', sizePills.length);
const pillsWithPrices = sizePills.filter(p => /\d|₦|k/i.test(p.text));
console.log('Pills with prices in text:', pillsWithPrices);

// Check badges with prices
const badges = [];
const bRegex = /<span[^>]*class="[^"]*badge[^"]*"[^>]*>([\s\S]*?)<\/span>/gi;
while ((m = bRegex.exec(html)) !== null) {
  badges.push({ full: m[0], text: m[1].trim() });
}
const badgesWithPrices = badges.filter(b => /w\/case|55k|₦/i.test(b.text));
console.log('\nBadges with W/CASE or prices:', badgesWithPrices);

// Check in src/main.js
const mainJs = fs.readFileSync('src/main.js', 'utf8');
const mainPills = [];
const mainRegex = /["']([^"']*(?:55k|w\/case|case\s*55k)[^"']*)["']/gi;
while ((m = mainRegex.exec(mainJs)) !== null) {
  mainPills.push(m[1]);
}
console.log('\nMatches in src/main.js:', mainPills);
