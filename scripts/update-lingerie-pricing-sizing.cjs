const fs = require('fs');
const path = require('path');

const updates = {
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
  'royal-slip': { price: 23000, priceStr: '₦23,000', sizes: ['L', 'XL'] }
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
  } else {
    // Default: price blank with only ₦
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
              <div class="size-row" style="display: flex; gap: 6px; margin: 8px 0; flex-wrap: wrap;">
                ${sizePillsHtml}
              </div>
              ${buttonHtml}
            </div>
          </article>\n\n`;
});
cardsHtml += '          <!-- === LINGERIE CATALOG END === -->';

const lingerieBlockRegex = /<!-- === LINGERIE CATALOG START === -->[\s\S]*?<!-- === LINGERIE CATALOG END === -->/;
productsHtml = productsHtml.replace(lingerieBlockRegex, cardsHtml);
fs.writeFileSync(productsHtmlPath, productsHtml, 'utf8');
console.log('Updated products.html with updated prices and sizing!');

// 3. Update src/main.js
const mainJsPath = path.join(__dirname, '../src/main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

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
fs.writeFileSync(mainJsPath, mainJs, 'utf8');
console.log('Updated src/main.js PRODUCT_DATABASE with new prices and sizing!');

// 4. Update seed-all-products.sql
const seedSqlPath = path.join(__dirname, '../seed-all-products.sql');
let seedSql = fs.readFileSync(seedSqlPath, 'utf8');

const originalRowsEnd = seedSql.indexOf("  ('full-torso-doll'");
if (originalRowsEnd !== -1) {
  const endOfDoll = seedSql.indexOf(')', originalRowsEnd);
  const baseRows = seedSql.slice(seedSql.indexOf("('rose-blossom'"), endOfDoll + 1);

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
  console.log('Updated seed-all-products.sql!');
}

console.log('All pricing and sizing updates successfully finished!');
