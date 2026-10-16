const fs = require('fs');
const path = require('path');

console.log('Applying batch 3 lingerie adjustments...');

// 1. Load and update processed-lingerie-catalog.json
const catalogPath = path.join(__dirname, 'processed-lingerie-catalog.json');
let catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const batch3Updates = {
  'lattice-gown': {
    price: 22000,
    priceStr: '₦22,000',
    sizes: ['S', 'M', 'L', 'XL']
  },
  'teal-mini': {
    price: 14000,
    priceStr: '₦14,000',
    sizes: ['One Size']
  },
  'maroon-babydoll': {
    price: 21000,
    priceStr: '₦21,000',
    sizes: ['S', 'M', 'L', 'XL']
  },
  'kiss-chemise': {
    price: 19000,
    priceStr: '₦19,000',
    sizes: ['S', 'M', 'L', 'XL']
  },
  'floral-corset': {
    id: 'floral-slip',
    title: 'Floral Slip',
    badge: 'FLORAL LACE',
    desc: 'Alluring black sheer mesh slip dress featuring vibrant hot pink floral lace underwire demi cups, a delicate center accent, adjustable satin straps, and scalloped pink lace hem.',
    price: 18000,
    priceStr: '₦18,000',
    sizes: ['S', 'M', 'L', 'XL']
  },
  'noir-chemise': {
    price: 17000,
    priceStr: '₦17,000',
    sizes: ['S', 'M', 'L', 'XL']
  },
  'cutout-mini': {
    unavailable: true,
    badge: 'UNAVAILABLE'
  }
};

catalog = catalog.map(prod => {
  const upd = batch3Updates[prod.id];
  if (upd) {
    return { ...prod, ...upd };
  }
  return prod;
});

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log('Updated processed-lingerie-catalog.json');

// 2. Update products.html
const productsHtmlPath = path.join(__dirname, '../products.html');
let html = fs.readFileSync(productsHtmlPath, 'utf8');

// Update Lattice Gown: ₦22,000
html = html.replace(
  /(<article class="product-card"[^>]*data-id="lattice-gown"[\s\S]*?<span class="product-sku">LINGERIE · 25<\/span>\s*<span class="product-price">)₦(<\/span>[\s\S]*?data-id="lattice-gown"[^>]*data-price=")[^"]*(" data-pricestr=")₦(")/,
  `$1₦22,000$222000$3₦22,000$4`
);

// Update Teal Mini: One Size, ₦14,000
html = html.replace(
  /(<!-- Lingerie 26: Teal Mini -->\s*<article class="product-card"[^>]*data-id="teal-mini"[^>]*data-keywords="[^"]*)S M L XL("[\s\S]*?<span class="product-sku">LINGERIE · 26<\/span>\s*<span class="product-price">)₦(<\/span>[\s\S]*?<div class="size-row"[^>]*>)[\s\S]*?(<\/div>\s*<button class="btn btn-black btn-block btn-add-cart"\s*data-id="teal-mini"[^>]*data-price=")[^"]*(" data-pricestr=")₦(")/,
  `$1One Size$2₦14,000$3\n                <button type="button" class="size-pill active" data-size="One Size">One Size</button>\n              $414000$5₦14,000$6`
);

// Update Maroon Babydoll: ₦21,000
html = html.replace(
  /(<article class="product-card"[^>]*data-id="maroon-babydoll"[\s\S]*?<span class="product-sku">LINGERIE · 27<\/span>\s*<span class="product-price">)₦(<\/span>[\s\S]*?data-id="maroon-babydoll"[^>]*data-price=")[^"]*(" data-pricestr=")₦(")/,
  `$1₦21,000$221000$3₦21,000$4`
);

// Update Kiss Chemise: ₦19,000
html = html.replace(
  /(<article class="product-card"[^>]*data-id="kiss-chemise"[\s\S]*?<span class="product-sku">LINGERIE · 28<\/span>\s*<span class="product-price">)₦(<\/span>[\s\S]*?data-id="kiss-chemise"[^>]*data-price=")[^"]*(" data-pricestr=")₦(")/,
  `$1₦19,000$219000$3₦19,000$4`
);

// Update Floral Corset -> Floral Slip (S M L XL, ₦18,000)
html = html.replace(
  /<!-- Lingerie 29: Floral Corset -->[\s\S]*?<\/article>/,
  `<!-- Lingerie 29: Floral Slip -->
          <article class="product-card" data-category="lingerie" data-id="floral-slip" data-keywords="floral slip sheer slip lace slip floral lace lingerie boudoir lace sheer teddy chemise gown slip babydoll S M L XL">
            <div class="product-img-wrap">
              <span class="product-badge ruby-badge">FLORAL LACE</span>
              <img src="/assets/lingerie-catalog/floral-corset-hero.webp" alt="Floral Slip" class="product-img" loading="lazy" decoding="async" />
              <div class="product-overlay">
                <button class="btn-quick-view" data-product="floral-slip">Quick Look</button>
              </div>
            </div>
            <div class="product-body">
              <div class="product-top">
                <span class="product-sku">LINGERIE · 29</span>
                <span class="product-price">₦18,000</span>
              </div>
              <h3 class="product-name">Floral Slip</h3>
              <div class="size-row" style="display: flex; gap: 6px; margin: 8px 0; flex-wrap: wrap;">
                <button type="button" class="size-pill active" data-size="S">S</button>
                <button type="button" class="size-pill" data-size="M">M</button>
                <button type="button" class="size-pill" data-size="L">L</button>
                <button type="button" class="size-pill" data-size="XL">XL</button>
              </div>
              <button class="btn btn-black btn-block btn-add-cart"
                data-id="floral-slip" data-title="Floral Slip"
                data-price="18000" data-pricestr="₦18,000" data-img="/assets/lingerie-catalog/floral-corset-hero.webp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add to Bag
              </button>
            </div>
          </article>`
);

// Update Noir Chemise: ₦17,000
html = html.replace(
  /(<article class="product-card"[^>]*data-id="noir-chemise"[\s\S]*?<span class="product-sku">LINGERIE · 32<\/span>\s*<span class="product-price">)₦(<\/span>[\s\S]*?data-id="noir-chemise"[^>]*data-price=")[^"]*(" data-pricestr=")₦(")/,
  `$1₦17,000$217000$3₦17,000$4`
);

// Update Cutout Mini: UNAVAILABLE
html = html.replace(
  /(<!-- Lingerie 34: Cutout Mini -->\s*<article class="product-card"[^>]*data-id="cutout-mini"[^>]*data-keywords="[^"]*)("[\s\S]*?<span class="product-badge ruby-badge">)[^<]*(<\/span>[\s\S]*?<div class="size-row"[^>]*>[\s\S]*?<\/div>\s*)<button class="btn btn-black btn-block btn-add-cart"[^>]*>[\s\S]*?<\/button>/,
  `$1 unavailable$2UNAVAILABLE$3<button class="btn btn-black btn-block btn-add-cart btn-unavailable" disabled>Unavailable</button>`
);

fs.writeFileSync(productsHtmlPath, html, 'utf8');
console.log('Successfully written products.html!');

// 3. Update src/main.js PRODUCT_DATABASE
const mainJsPath = path.join(__dirname, '../src/main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

const lingerieDbEntries = catalog.map(prod => {
  const sizes = prod.sizes || ['S', 'M', 'L', 'XL'];
  const price = prod.price || 0;
  const priceStr = prod.priceStr || '₦';
  const inStock = prod.unavailable ? false : true;

  const variants = sizes.map(s => ({
    name: s,
    price: price,
    priceStr: priceStr,
    img: prod.heroWebp
  }));

  const media = (prod.finalMedia || []).map(m => ({
    type: m.type,
    src: m.src,
    label: m.label
  }));

  const specs = [
    { label: 'Silhouette', value: 'Hourglass Contour & Boudoir Cut' },
    { label: 'Sizing', value: `${sizes.join(' · ')} (Standard Boudoir Fit)` },
    { label: 'Care', value: 'Hand Wash Cold, Lay Flat to Dry' },
    { label: 'Packaging', value: '100% Plain Discreet Courier Bag' }
  ];

  return `  '${prod.id}': {
    id: '${prod.id}',
    title: '${prod.title.replace(/'/g, "\\'")}',
    badge: '${prod.badge}',
    sku: '${prod.sku}',
    price: ${price},
    priceStr: '${priceStr}',
    img: '${prod.heroWebp}',
    desc: "${prod.desc.replace(/"/g, '\\"')}",
    specs: ${JSON.stringify(specs, null, 6)},
    material: 'Premium Boudoir Lace & Sheer Microfiber',
    acoustics: 'Whisper Soft Intimate Comfort',
    freq: 0,
    pattern: 'luxe',
    media: ${JSON.stringify(media, null, 6)},
    inStock: ${inStock},
    variants: ${JSON.stringify(variants, null, 8)}
  }`;
}).join(',\n\n');

// Replace the entire lingerie database section in src/main.js
const startIndex = mainJs.indexOf("  'boudoir-pasties': {");
const endIndex = mainJs.indexOf("  'rose-blossom': {");

if (startIndex !== -1 && endIndex !== -1) {
  mainJs = mainJs.slice(0, startIndex) + lingerieDbEntries + ',\n\n  // Alias for backward compatibility\n  \'floral-corset\': null,\n\n  ' + mainJs.slice(endIndex);
}

// Add the alias hook if not present
if (!mainJs.includes("PRODUCT_DATABASE['floral-corset'] =")) {
  mainJs = mainJs.replace(
    "export { PRODUCT_DATABASE };",
    "if (typeof PRODUCT_DATABASE !== 'undefined' && PRODUCT_DATABASE['floral-slip']) {\n  PRODUCT_DATABASE['floral-corset'] = PRODUCT_DATABASE['floral-slip'];\n}\nexport { PRODUCT_DATABASE };"
  );
}

fs.writeFileSync(mainJsPath, mainJs, 'utf8');
console.log('Successfully updated src/main.js PRODUCT_DATABASE!');

// 4. Update seed-all-products.sql
const seedSqlPath = path.join(__dirname, '../seed-all-products.sql');
let seedSql = fs.readFileSync(seedSqlPath, 'utf8');

const originalRowsEnd = seedSql.indexOf("  ('full-torso-doll'");
if (originalRowsEnd !== -1) {
  const endOfDoll = seedSql.indexOf(')', originalRowsEnd);
  let baseRows = seedSql.slice(seedSql.indexOf("('rose-blossom'"), endOfDoll + 1);

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
  category = EXCLUDED.category,
  tagline = EXCLUDED.tagline,
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

console.log('All Batch 3 adjustments finished successfully!');
