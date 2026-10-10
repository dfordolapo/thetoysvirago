const fs = require('fs');
const path = require('path');

// 1. Verify products.html cards
const html = fs.readFileSync(path.join(__dirname, '../products.html'), 'utf8');
const cardMatches = html.split('<article class="product-card"');
console.log('Total product cards in products.html:', cardMatches.length - 1);

// Category breakdown in products.html
const cats = { toys: 0, bdsm: 0, games: 0, lubes: 0 };
cardMatches.slice(1).forEach(c => {
  for (const cat of Object.keys(cats)) {
    if (c.includes(`data-category="${cat}"`)) {
      cats[cat]++;
    }
  }
});
console.log('Category breakdown in products.html:', cats);

// 2. Verify PRODUCT_DATABASE in src/main.js
const mainJs = fs.readFileSync(path.join(__dirname, '../src/main.js'), 'utf8');
const dbStart = mainJs.indexOf('const PRODUCT_DATABASE = {');
const dbEnd = mainJs.indexOf('function showShareToast');
const dbContent = mainJs.slice(dbStart, dbEnd);
const idMatches = dbContent.match(/\bid\s*:\s*['"][^'"]+['"]/gi) || [];
console.log('Total products in PRODUCT_DATABASE in src/main.js:', idMatches.length);

// 3. Verify seed-all-products.sql
const sql = fs.readFileSync(path.join(__dirname, '../seed-all-products.sql'), 'utf8');
const sqlRows = sql.split("('").length - 1;
console.log('Total products in seed-all-products.sql:', sqlRows);
