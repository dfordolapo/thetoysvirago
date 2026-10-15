const fs = require('fs');
const path = require('path');

const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, 'processed-lingerie-catalog.json'), 'utf8'));

console.log(`Integrating ${catalog.length} lingerie products into products.html, src/main.js, and seed-all-products.sql...`);

// 1. UPDATE products.html
const productsHtmlPath = path.join(__dirname, '../products.html');
let productsHtml = fs.readFileSync(productsHtmlPath, 'utf8');

// Check if lingerie cards are already present
if (productsHtml.includes('data-category="lingerie"')) {
  console.log('Lingerie cards already detected in products.html. Cleaning old ones first...');
  productsHtml = productsHtml.replace(/<!-- === LINGERIE CATALOG START === -->[\s\S]*?<!-- === LINGERIE CATALOG END === -->\n*/, '');
}

let cardsHtml = '<!-- === LINGERIE CATALOG START === -->\n';
catalog.forEach((prod, idx) => {
  const keywords = `${prod.title.toLowerCase()} ${prod.badge.toLowerCase()} lingerie boudoir lace sheer teddy chemise gown slip babydoll corset S M L XL`;
  
  cardsHtml += `          <!-- Lingerie ${idx + 1}: ${prod.title} -->
          <article class="product-card" data-category="lingerie" data-id="${prod.id}" data-keywords="${keywords}">
            <div class="product-img-wrap">
              <span class="product-badge ruby-badge">${prod.badge}</span>
              <img src="${prod.heroWebp}" alt="${prod.title}" class="product-img" loading="lazy" decoding="async" />
              <div class="product-overlay">
                <button class="btn-quick-view" data-product="${prod.id}">Quick Look</button>
              </div>
            </div>
            <div class="product-body">
              <div class="product-top">
                <span class="product-sku">${prod.sku}</span>
                <span class="product-price">Price on Request</span>
              </div>
              <h3 class="product-name">${prod.title}</h3>
              <div class="size-row" style="display: flex; gap: 6px; margin: 8px 0; flex-wrap: wrap;">
                <button type="button" class="size-pill active" data-size="S">S</button>
                <button type="button" class="size-pill" data-size="M">M</button>
                <button type="button" class="size-pill" data-size="L">L</button>
                <button type="button" class="size-pill" data-size="XL">XL</button>
              </div>
              <button class="btn btn-black btn-block btn-add-cart"
                data-id="${prod.id}" data-title="${prod.title}"
                data-price="0" data-img="${prod.heroWebp}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add to Bag
              </button>
            </div>
          </article>\n\n`;
});
cardsHtml += '          <!-- === LINGERIE CATALOG END === -->\n';

const gridMatch = productsHtml.match(/<div class="products-grid" id="products-grid">\r?\n/);
if (!gridMatch) {
  console.error('Target products-grid div not found in products.html!');
  process.exit(1);
}

const gridTarget = gridMatch[0];
productsHtml = productsHtml.replace(gridTarget, gridTarget + cardsHtml);
fs.writeFileSync(productsHtmlPath, productsHtml, 'utf8');
console.log('Successfully updated products.html with 38 lingerie cards!');

// 2. UPDATE src/main.js
const mainJsPath = path.join(__dirname, '../src/main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

// Build PRODUCT_DATABASE entries
let dbEntries = '';
catalog.forEach((prod) => {
  const mediaJson = JSON.stringify(prod.finalMedia, null, 8);
  const variantsJson = JSON.stringify([
    { name: 'S', price: 0, priceStr: 'Price on Request', img: prod.heroWebp },
    { name: 'M', price: 0, priceStr: 'Price on Request', img: prod.heroWebp },
    { name: 'L', price: 0, priceStr: 'Price on Request', img: prod.heroWebp },
    { name: 'XL', price: 0, priceStr: 'Price on Request', img: prod.heroWebp }
  ], null, 8);

  const escapedDesc = prod.desc.replace(/"/g, '\\"');

  dbEntries += `  '${prod.id}': {
    id: '${prod.id}',
    title: '${prod.title}',
    badge: '${prod.badge}',
    sku: '${prod.sku}',
    price: 0,
    priceStr: 'Price on Request',
    img: '${prod.heroWebp}',
    desc: "${escapedDesc}",
    specs: [
      { label: 'Silhouette', value: 'Hourglass Contour & Boudoir Cut' },
      { label: 'Sizing', value: 'S · M · L · XL (Standard Boudoir Fit)' },
      { label: 'Care', value: 'Hand Wash Cold, Lay Flat to Dry' },
      { label: 'Packaging', value: '100% Plain Discreet Courier Bag' }
    ],
    material: 'Luxe Stretch Mesh & Delicate Floral Lace',
    acoustics: 'Whisper-Soft on Bare Skin',
    freq: 0,
    pattern: 'lingerie',
    variants: ${variantsJson},
    media: ${mediaJson}
  },\n`;
});

// Check if already in main.js
if (mainJs.includes("'boudoir-pasties': {")) {
  console.log('Lingerie already exists in src/main.js. Skipping duplicate insert.');
} else {
  const dbMatch = mainJs.match(/const PRODUCT_DATABASE = \{\r?\n/);
  if (dbMatch) {
    const dbTarget = dbMatch[0];
    mainJs = mainJs.replace(dbTarget, dbTarget + dbEntries);
    fs.writeFileSync(mainJsPath, mainJs, 'utf8');
    console.log('Successfully added lingerie products to PRODUCT_DATABASE in src/main.js!');
  } else {
    console.error('Could not find const PRODUCT_DATABASE in src/main.js');
  }
}

// 3. UPDATE seed-all-products.sql
const seedSqlPath = path.join(__dirname, '../seed-all-products.sql');
let seedSql = fs.readFileSync(seedSqlPath, 'utf8');

if (!seedSql.includes("'boudoir-pasties'")) {
  let sqlRows = [];
  catalog.forEach(prod => {
    const escTitle = prod.title.replace(/'/g, "''");
    const escDesc = prod.desc.replace(/'/g, "''");
    const variants = JSON.stringify([
      { name: 'S', price: 0, priceStr: 'Price on Request', img: prod.heroWebp },
      { name: 'M', price: 0, priceStr: 'Price on Request', img: prod.heroWebp },
      { name: 'L', price: 0, priceStr: 'Price on Request', img: prod.heroWebp },
      { name: 'XL', price: 0, priceStr: 'Price on Request', img: prod.heroWebp }
    ]).replace(/'/g, "''");

    sqlRows.push(`  ('${prod.id}', '${escTitle}', 'lingerie', '${prod.badge}', 0, '${prod.badge}', '${prod.heroWebp}', '${escDesc}', ARRAY['Silhouette: Hourglass Contour & Boudoir Cut', 'Sizing: S · M · L · XL (Standard Boudoir Fit)', 'Care: Hand Wash Cold, Lay Flat to Dry', 'Packaging: 100% Plain Discreet Courier Bag']::text[], '${variants}'::jsonb, true)`);
  });

  // Append with comma before semicolon or insert
  const lastSemiIndex = seedSql.lastIndexOf(';');
  if (lastSemiIndex !== -1) {
    const beforeSemi = seedSql.slice(0, lastSemiIndex).trim();
    const afterSemi = seedSql.slice(lastSemiIndex);
    seedSql = beforeSemi + ',\n' + sqlRows.join(',\n') + afterSemi;
    fs.writeFileSync(seedSqlPath, seedSql, 'utf8');
    console.log('Successfully appended 38 lingerie products to seed-all-products.sql!');
  }
} else {
  console.log('seed-all-products.sql already contains lingerie products.');
}

console.log('All catalog integrations complete!');
