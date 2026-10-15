const fs = require('fs');
const path = require('path');

console.log('Applying lingerie adjustments: remove pink chemise, combine neon slip into nurse set, and set blank prices with only ₦...');

// 1. Read catalog
const catalogPath = path.join(__dirname, 'processed-lingerie-catalog.json');
let catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Find neon-slip and nurse-set
const neonSlip = catalog.find(p => p.id === 'neon-slip');
const nurseSet = catalog.find(p => p.id === 'nurse-set');

if (neonSlip && nurseSet) {
  // Combine media
  nurseSet.finalMedia = [
    { type: 'image', src: nurseSet.heroWebp, label: 'Nurse Uniform Set' },
    ...neonSlip.finalMedia.map(m => ({
      type: m.type,
      src: m.src,
      label: m.label.includes('View') ? `Boudoir Slip (${m.label})` : m.label
    }))
  ];
  nurseSet.desc = 'Provocative white and red emergency nurse roleplay uniform dress featuring a zippered plunge front, corset waist lattice cutouts, matching nurse headpiece, and coordinating noir boudoir slip with neon lace trim.';
}

// Filter out pink-chemise and neon-slip
catalog = catalog.filter(p => p.id !== 'pink-chemise' && p.id !== 'neon-slip');

// Renumber SKUs and set priceStr = '₦', price = 0
catalog.forEach((prod, idx) => {
  const num = (idx + 1).toString().padStart(2, '0');
  prod.sku = `LINGERIE · ${num}`;
  prod.price = 0;
  prod.priceStr = '₦';
});

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log(`Updated processed-lingerie-catalog.json: ${catalog.length} products remaining.`);

// 2. UPDATE products.html
const productsHtmlPath = path.join(__dirname, '../products.html');
let productsHtml = fs.readFileSync(productsHtmlPath, 'utf8');

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
                <span class="product-price">₦</span>
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
                data-price="" data-pricestr="₦" data-img="${prod.heroWebp}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add to Bag
              </button>
            </div>
          </article>\n\n`;
});
cardsHtml += '          <!-- === LINGERIE CATALOG END === -->';

const lingerieBlockRegex = /<!-- === LINGERIE CATALOG START === -->[\s\S]*?<!-- === LINGERIE CATALOG END === -->/;
if (lingerieBlockRegex.test(productsHtml)) {
  productsHtml = productsHtml.replace(lingerieBlockRegex, cardsHtml);
  fs.writeFileSync(productsHtmlPath, productsHtml, 'utf8');
  console.log('Successfully updated products.html!');
} else {
  console.error('Could not find lingerie block in products.html');
}

// 3. UPDATE src/main.js
const mainJsPath = path.join(__dirname, '../src/main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

// Build new PRODUCT_DATABASE entries for lingerie
let dbEntries = '';
catalog.forEach((prod) => {
  const mediaJson = JSON.stringify(prod.finalMedia, null, 8);
  const variantsJson = JSON.stringify([
    { name: 'S', price: 0, priceStr: '₦', img: prod.heroWebp },
    { name: 'M', price: 0, priceStr: '₦', img: prod.heroWebp },
    { name: 'L', price: 0, priceStr: '₦', img: prod.heroWebp },
    { name: 'XL', price: 0, priceStr: '₦', img: prod.heroWebp }
  ], null, 8);

  const escapedDesc = prod.desc.replace(/"/g, '\\"');

  dbEntries += `  '${prod.id}': {
    id: '${prod.id}',
    title: '${prod.title}',
    badge: '${prod.badge}',
    sku: '${prod.sku}',
    price: 0,
    priceStr: '₦',
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

// Replace all lingerie entries from 'boudoir-pasties' up to 'rose-blossom'
const dbLingerieRegex = /  'boudoir-pasties': \{[\s\S]*?(?=\s*'rose-blossom': \{)/;
if (dbLingerieRegex.test(mainJs)) {
  mainJs = mainJs.replace(dbLingerieRegex, dbEntries);
  fs.writeFileSync(mainJsPath, mainJs, 'utf8');
  console.log('Successfully updated PRODUCT_DATABASE in src/main.js!');
} else {
  console.error('Could not find lingerie entries in src/main.js PRODUCT_DATABASE');
}

// 4. UPDATE seed-all-products.sql
const seedSqlPath = path.join(__dirname, '../seed-all-products.sql');
let seedSql = fs.readFileSync(seedSqlPath, 'utf8');

// The file had a malformed ON CONFLICT placement. Let's rebuild the clean SQL structure.
// First extract all original rows before ON CONFLICT
const valuesStartMatch = seedSql.match(/INSERT INTO public\.products[^\n]*\r?\nVALUES\r?\n/);
if (valuesStartMatch) {
  // Everything before lingerie and before ON CONFLICT
  const originalRowsEnd = seedSql.indexOf("  ('full-torso-doll'");
  let baseRows = '';
  if (originalRowsEnd !== -1) {
    const endOfDoll = seedSql.indexOf(')', originalRowsEnd);
    baseRows = seedSql.slice(seedSql.indexOf("('rose-blossom'"), endOfDoll + 1);
  }

  // Generate 36 lingerie SQL rows
  const lingerieSqlRows = catalog.map(prod => {
    const escTitle = prod.title.replace(/'/g, "''");
    const escDesc = prod.desc.replace(/'/g, "''");
    const variants = JSON.stringify([
      { name: 'S', price: 0, priceStr: '₦', img: prod.heroWebp },
      { name: 'M', price: 0, priceStr: '₦', img: prod.heroWebp },
      { name: 'L', price: 0, priceStr: '₦', img: prod.heroWebp },
      { name: 'XL', price: 0, priceStr: '₦', img: prod.heroWebp }
    ]).replace(/'/g, "''");

    return `  ('${prod.id}', '${escTitle}', 'lingerie', '${prod.badge}', 0, '${prod.badge}', '${prod.heroWebp}', '${escDesc}', ARRAY['Silhouette: Hourglass Contour & Boudoir Cut', 'Sizing: S · M · L · XL (Standard Boudoir Fit)', 'Care: Hand Wash Cold, Lay Flat to Dry', 'Packaging: 100% Plain Discreet Courier Bag']::text[], '${variants}'::jsonb, true)`;
  }).join(',\n');

  const fullCleanSql = `-- Seed ALL Products into Supabase Products Table
INSERT INTO public.products (id, title, category, tagline, price, badge, image, description, specs, variants, in_stock)
VALUES
${baseRows},
${lingerieSqlRows}
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  badge = EXCLUDED.badge,
  image = EXCLUDED.image,
  description = EXCLUDED.description,
  specs = EXCLUDED.specs,
  variants = EXCLUDED.variants;
`;

  fs.writeFileSync(seedSqlPath, fullCleanSql, 'utf8');
  console.log('Successfully reconstructed seed-all-products.sql with valid syntax!');
}

console.log('All adjustments successfully completed!');
