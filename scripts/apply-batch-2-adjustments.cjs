const fs = require('fs');
const path = require('path');

console.log('Applying batch 2 lingerie and Kailin lube adjustments...');

const updates = {
  // Batch 1 (preserved)
  'boudoir-pasties': { price: 4500, priceStr: '₦4,500', sizes: ['One Size'] },
  'chain-teddy': { price: 15000, priceStr: '₦15,000', sizes: ['M', 'L', 'XL'] },
  'leopard-bodysuit': { price: 17000, priceStr: '₦17,000', sizes: ['S', 'M', 'L', 'XL'] },
  'lace-romper': { price: 18000, priceStr: '₦18,000', sizes: ['M', 'L', 'XL'] },
  'mermaid-set': { price: 18000, priceStr: '₦18,000', sizes: ['One Size'] },
  'nurse-set': { price: 22000, priceStr: '₦22,000', sizes: ['S', 'M', 'L', 'XL'] },
  'lilac-bodystocking': { price: 12000, priceStr: '₦12,000', sizes: ['One Size'] },
  'cyan-coord': { price: 12000, priceStr: '₦12,000', sizes: ['One Size'] },
  'heart-teddy': { price: 21000, priceStr: '₦21,000', sizes: ['S', 'M', 'L'] },
  'noir-slip': { price: 23000, priceStr: '₦23,000', sizes: ['S', 'M', 'L'] },
  'scarlet-corset': { price: 21000, priceStr: '₦21,000', sizes: ['S', 'M', 'L'] },
  'heart-mini': { unavailable: true, badge: 'UNAVAILABLE' },
  'royal-slip': { price: 23000, priceStr: '₦23,000', sizes: ['L', 'XL'] },

  // Batch 2 (new additions)
  'thigh-stockings': { price: 6500, priceStr: '₦6,500', sizes: ['One Size'] },
  'ruby-corset': { price: 22000, priceStr: '₦22,000', sizes: ['S', 'M', 'L', 'XL'] },
  'white-bodystocking': { price: 12000, priceStr: '₦12,000', sizes: ['One Size'] },
  'schoolgirl-set': { unavailable: true, badge: 'UNAVAILABLE' },
  'floral-gown': { sizes: ['M', 'L', 'XL', 'XXL'], colorNote: 'Blue Only' },
  'scarlet-gown': { price: 23000, priceStr: '₦23,000', sizes: ['S', 'M', 'L', 'XL'] },
  'crochet-set': { price: 12000, priceStr: '₦12,000', sizes: ['One Size'] },
  'feather-teddy': { price: 22000, priceStr: '₦22,000', sizes: ['S', 'M', 'L'] },
  'corset-babydoll': { unavailable: true, badge: 'UNAVAILABLE' },
  'ombre-mini': { price: 11000, priceStr: '₦11,000', sizes: ['One Size'] },
  'pearl-mini': { price: 11000, priceStr: '₦11,000', sizes: ['One Size'] },
  'ruby-net': { price: 11000, priceStr: '₦11,000', sizes: ['One Size'] },
  'heart-romper': { price: 15000, priceStr: '₦15,000', sizes: ['One Size'] },
  'blush-halter': { price: 12000, priceStr: '₦12,000', sizes: ['One Size'] },
  'ribbon-teddy': { price: 15000, priceStr: '₦15,000', sizes: ['One Size'] }
};

// 1. Update processed-lingerie-catalog.json
const catalogPath = path.join(__dirname, 'processed-lingerie-catalog.json');
let catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

catalog.forEach(prod => {
  if (updates[prod.id]) {
    const u = updates[prod.id];
    if (u.price !== undefined) prod.price = u.price;
    if (u.priceStr !== undefined) prod.priceStr = u.priceStr;
    if (u.sizes !== undefined) prod.sizes = u.sizes;
    if (u.unavailable !== undefined) prod.unavailable = u.unavailable;
    if (u.badge !== undefined) prod.badge = u.badge;
    if (u.colorNote !== undefined) prod.colorNote = u.colorNote;
  } else {
    if (!prod.priceStr || prod.priceStr === 'Price on Request') {
      prod.priceStr = '₦';
      prod.price = 0;
    }
    if (!prod.sizes) {
      prod.sizes = ['S', 'M', 'L', 'XL'];
    }
  }
});

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log('Updated processed-lingerie-catalog.json');

// 2. Update products.html
const productsHtmlPath = path.join(__dirname, '../products.html');
let productsHtml = fs.readFileSync(productsHtmlPath, 'utf8');

// Build lingerie cards
let cardsHtml = '<!-- === LINGERIE CATALOG START === -->\n';
catalog.forEach((prod, idx) => {
  const sizes = prod.sizes || ['S', 'M', 'L', 'XL'];
  const sizePillsHtml = sizes.map((s, i) =>
    `<button type="button" class="size-pill${i === 0 ? ' active' : ''}" data-size="${s}">${s}</button>`
  ).join('\n                ');

  const priceDisplay = prod.priceStr || '₦';
  const priceAttr = prod.price ? prod.price : '';
  const priceStrAttr = prod.priceStr || '₦';
  const badge = prod.badge;
  const isUnavailable = prod.unavailable === true;

  const colorRowHtml = prod.colorNote
    ? `<div class="color-row" style="margin-bottom: 6px;">
                 <button class="color-dot active" style="background: #4b8ec8;" data-color="Blue" title="Blue"></button>
                 <span class="color-name">${prod.colorNote}</span>
               </div>\n              `
    : '';

  const buttonHtml = isUnavailable
    ? `<button class="btn btn-black btn-block btn-add-cart btn-unavailable" disabled>Unavailable</button>`
    : `<button class="btn btn-black btn-block btn-add-cart"
                data-id="${prod.id}" data-title="${prod.title}"
                data-price="${priceAttr}" data-pricestr="${priceStrAttr}" data-img="${prod.heroWebp}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add to Bag
              </button>`;

  const keywords = `${prod.title.toLowerCase()} ${badge.toLowerCase()} lingerie boudoir lace sheer teddy chemise gown slip babydoll corset ${sizes.join(' ')}`;

  cardsHtml += `          <!-- Lingerie ${idx + 1}: ${prod.title} -->
          <article class="product-card" data-category="lingerie" data-id="${prod.id}" data-keywords="${keywords}">
            <div class="product-img-wrap">
              <span class="product-badge ruby-badge">${badge}</span>
              <img src="${prod.heroWebp}" alt="${prod.title}" class="product-img" loading="lazy" decoding="async" />
              <div class="product-overlay">
                <button class="btn-quick-view" data-product="${prod.id}">Quick Look</button>
              </div>
            </div>
            <div class="product-body">
              <div class="product-top">
                <span class="product-sku">${prod.sku}</span>
                <span class="product-price">${priceDisplay}</span>
              </div>
              <h3 class="product-name">${prod.title}</h3>
              ${colorRowHtml}<div class="size-row" style="display: flex; gap: 6px; margin: 8px 0; flex-wrap: wrap;">
                ${sizePillsHtml}
              </div>
              ${buttonHtml}
            </div>
          </article>\n\n`;
});
cardsHtml += '          <!-- === LINGERIE CATALOG END === -->';

const lingerieBlockRegex = /<!-- === LINGERIE CATALOG START === -->[\s\S]*?<!-- === LINGERIE CATALOG END === -->/;
productsHtml = productsHtml.replace(lingerieBlockRegex, cardsHtml);

// Also update Kailin Water Lube in products.html: ABUJA EXCLUSIVE and Unavailable button
const kailinCardRegex = /(<article class="product-card" data-category="lubes" data-id="kailin-water-lube"[\s\S]*?<span class="product-badge ruby-badge">)[^<]*(<\/span>[\s\S]*?<div class="product-body">[\s\S]*?)(<button class="btn btn-black btn-block btn-add-cart"[\s\S]*?<\/button>)(\s*<\/div>\s*<\/article>)/;
if (kailinCardRegex.test(productsHtml)) {
  productsHtml = productsHtml.replace(
    kailinCardRegex,
    `$1ABUJA EXCLUSIVE$2<button class="btn btn-black btn-block btn-add-cart btn-unavailable" disabled>Unavailable</button>$4`
  );
  console.log('Updated Kailin Pure Lube to ABUJA EXCLUSIVE & Unavailable in products.html!');
} else {
  console.warn('Could not match kailin-water-lube card in products.html');
}

fs.writeFileSync(productsHtmlPath, productsHtml, 'utf8');
console.log('Successfully written products.html!');

// 3. Update src/main.js
const mainJsPath = path.join(__dirname, '../src/main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

// Build lingerie PRODUCT_DATABASE entries
let dbEntries = '';
catalog.forEach((prod) => {
  const sizes = prod.sizes || ['S', 'M', 'L', 'XL'];
  const price = prod.price || 0;
  const priceStr = prod.priceStr || '₦';
  const mediaJson = JSON.stringify(prod.finalMedia, null, 8);
  const variantsJson = JSON.stringify(sizes.map(s => ({
    name: s,
    price: price,
    priceStr: priceStr,
    img: prod.heroWebp
  })), null, 8);

  const escapedDesc = prod.desc.replace(/"/g, '\\"');
  const inStock = prod.unavailable ? false : true;

  dbEntries += `  '${prod.id}': {
    id: '${prod.id}',
    title: '${prod.title}',
    badge: '${prod.badge}',
    sku: '${prod.sku}',
    price: ${price},
    priceStr: '${priceStr}',
    img: '${prod.heroWebp}',
    desc: "${escapedDesc}",
    specs: [
      { label: 'Silhouette', value: 'Hourglass Contour & Boudoir Cut' },
      { label: 'Sizing', value: '${sizes.join(' · ')} (Standard Boudoir Fit)' },
      { label: 'Care', value: 'Hand Wash Cold, Lay Flat to Dry' },
      { label: 'Packaging', value: '100% Plain Discreet Courier Bag' }
    ],
    material: 'Luxe Stretch Mesh & Delicate Floral Lace',
    acoustics: 'Whisper-Soft on Bare Skin',
    freq: 0,
    pattern: 'lingerie',
    inStock: ${inStock},
    variants: ${variantsJson},
    media: ${mediaJson}
  },\n`;
});

const dbLingerieRegex = /  'boudoir-pasties': \{[\s\S]*?(?=\s*'rose-blossom': \{)/;
mainJs = mainJs.replace(dbLingerieRegex, dbEntries);

// Also update kailin-water-lube in main.js
mainJs = mainJs.replace(
  /'kailin-water-lube':\s*\{\s*id:\s*'kailin-water-lube'[\s\S]*?badge:\s*'[^']*'/,
  `'kailin-water-lube': {\n    id: 'kailin-water-lube',\n    title: 'Kailin Pure Lube',\n    badge: 'ABUJA EXCLUSIVE'`
);
mainJs = mainJs.replace(
  /('kailin-water-lube':\s*\{[\s\S]*?inStock:\s*)(true|false)/,
  `$1false`
);

fs.writeFileSync(mainJsPath, mainJs, 'utf8');
console.log('Successfully updated src/main.js PRODUCT_DATABASE!');

// 4. Update seed-all-products.sql
const seedSqlPath = path.join(__dirname, '../seed-all-products.sql');
let seedSql = fs.readFileSync(seedSqlPath, 'utf8');

const originalRowsEnd = seedSql.indexOf("  ('full-torso-doll'");
if (originalRowsEnd !== -1) {
  const endOfDoll = seedSql.indexOf(')', originalRowsEnd);
  let baseRows = seedSql.slice(seedSql.indexOf("('rose-blossom'"), endOfDoll + 1);

  // Update kailin-water-lube in baseRows: ABUJA EXCLUSIVE and in_stock false
  baseRows = baseRows.replace(
    /\('kailin-water-lube',\s*'Kailin Pure Lube',\s*'lubes',\s*'[^']*',\s*(\d+),\s*'[^']*'/,
    `('kailin-water-lube', 'Kailin Pure Lube', 'lubes', 'ABUJA EXCLUSIVE', $1, 'ABUJA EXCLUSIVE'`
  );
  baseRows = baseRows.replace(
    /(\('kailin-water-lube'[\s\S]*?'::jsonb,\s*)(true|false)\)/,
    `$1false)`
  );

  const lingerieSqlRows = catalog.map(prod => {
    const escTitle = prod.title.replace(/'/g, "''");
    const escDesc = prod.desc.replace(/'/g, "''");
    const sizes = prod.sizes || ['S', 'M', 'L', 'XL'];
    const price = prod.price || 0;
    const priceStr = prod.priceStr || '₦';
    const inStock = prod.unavailable ? false : true;

    const variants = JSON.stringify(sizes.map(s => ({
      name: s,
      price: price,
      priceStr: priceStr,
      img: prod.heroWebp
    }))).replace(/'/g, "''");

    return `  ('${prod.id}', '${escTitle}', 'lingerie', '${prod.badge}', ${price}, '${prod.badge}', '${prod.heroWebp}', '${escDesc}', ARRAY['Silhouette: Hourglass Contour & Boudoir Cut', 'Sizing: ${sizes.join(' · ')} (Standard Boudoir Fit)', 'Care: Hand Wash Cold, Lay Flat to Dry', 'Packaging: 100% Plain Discreet Courier Bag']::text[], '${variants}'::jsonb, ${inStock})`;
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
  variants = EXCLUDED.variants,
  in_stock = EXCLUDED.in_stock;
`;

  fs.writeFileSync(seedSqlPath, fullCleanSql, 'utf8');
  console.log('Successfully updated seed-all-products.sql!');
}

console.log('All Batch 2 adjustments finished successfully!');
