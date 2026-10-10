const fs = require('fs');
const path = require('path');

// Read main.js to extract PRODUCT_DATABASE
const mainJs = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');
const startMatch = mainJs.indexOf('const PRODUCT_DATABASE = {');
const endMatch = mainJs.indexOf('};\n\ndocument.querySelectorAll(\'.btn-quick-view\')');

if (startMatch === -1 || endMatch === -1) {
  console.error('Could not find PRODUCT_DATABASE in main.js');
  process.exit(1);
}

const dbCode = mainJs.substring(startMatch + 'const PRODUCT_DATABASE = '.length, endMatch + 1);
const db = eval(`(${dbCode})`);

// Category mapping
const categories = {
  'african-brute': 'lubes',
  'rose-blossom': 'toys',
  'pulsating-rose': 'toys',
  'sceptre-wand': 'toys',
  'siren-app': 'toys',
  'lipstick-vibe': 'toys',
  'sculpted-dildo': 'toys',
  'thrusting-dildo': 'toys',
  'sucking-rabbit': 'toys',
  'non-vibrating-plugs': 'toys',
  'rabbit-cock-ring': 'toys',
  'creature-cock-ring': 'toys',
  'pocket-bullet': 'toys',
  'contour-bullet-6inch': 'toys',
  'sleek-bullet-7inch': 'toys',
  'rose-jump-egg': 'toys'
};

let sql = `-- Seed Existing Products into Supabase Products Table\n`;
sql += `INSERT INTO public.products (id, title, category, tagline, price, badge, image, description, specs, variants, in_stock)\nVALUES\n`;

const rows = Object.values(db).map(p => {
  const cat = categories[p.id] || 'toys';
  const escapeStr = (s) => (s || '').replace(/'/g, "''");
  const title = escapeStr(p.title);
  const badge = escapeStr(p.badge || '');
  const image = escapeStr(p.img);
  const desc = escapeStr(p.desc);
  const specsArr = (p.specs || []).map(s => escapeStr(`${s.label}: ${s.value}`));
  const specsSql = `ARRAY[${specsArr.map(s => `'${s}'`).join(', ')}]::text[]`;
  const variantsJson = escapeStr(JSON.stringify(p.variants || []));

  return `  ('${p.id}', '${title}', '${cat}', '${badge}', ${p.price}, '${badge}', '${image}', '${desc}', ${specsSql}, '${variantsJson}'::jsonb, true)`;
});

sql += rows.join(',\n') + `\nON CONFLICT (id) DO UPDATE SET\n  title = EXCLUDED.title,\n  price = EXCLUDED.price,\n  badge = EXCLUDED.badge,\n  image = EXCLUDED.image,\n  description = EXCLUDED.description,\n  specs = EXCLUDED.specs,\n  variants = EXCLUDED.variants;\n`;

fs.writeFileSync(path.join(__dirname, '..', 'seed-products.sql'), sql, 'utf8');
console.log('Successfully generated seed-products.sql with', Object.keys(db).length, 'products');
