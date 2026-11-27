const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const productsPath = path.join(rootDir, 'dist', 'products.html');
const files = [productsPath, path.join(rootDir, 'dist', 'index.html')];

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function addProductCardLinks(html) {
  return html.replace(
    /(<article[^>]*data-id="([^"]+)"[\s\S]*?<h3 class="product-name">)([^<]*)(<\/h3>)/g,
    (match, open, id, title, close) => {
      if (match.includes('<a ')) return match;
      return `${open}<a href="/products/${encodeURIComponent(id)}">${title}</a>${close}`;
    }
  );
}

async function loadProductTitles() {
  const titles = new Map();

  try {
    const published = require('../public/new-products-data.json');
    (Array.isArray(published) ? published : []).forEach(product => {
      if (product && product.id) titles.set(String(product.id), String(product.title || product.id));
    });
  } catch (err) {
    console.warn('Notice: Could not read public/new-products-data.json:', err.message);
  }

  try {
    const db = require('../scripts/products-db.json');
    Object.entries(db && typeof db === 'object' ? db : {}).forEach(([key, product]) => {
      if (product && product.title) titles.set(String(product.id || key), String(product.title));
    });
  } catch (err) {
    console.warn('Notice: Could not read scripts/products-db.json:', err.message);
  }

  try {
    const { fetchAllSupabaseProducts } = await import('../src/productApi.js');
    const rows = await fetchAllSupabaseProducts();
    (Array.isArray(rows) ? rows : []).forEach(row => {
      if (row && row.id) titles.set(String(row.id), String(row.title || row.id));
    });
  } catch (err) {
    console.warn('Notice: Could not load Supabase product titles:', err.message);
  }

  return titles;
}

function addProductIndexNav(html, titles) {
  const ids = new Set();
  html.replace(/data-id="([^"]+)"/g, (match, id) => {
    if (id) ids.add(String(id));
    return match;
  });
  titles.forEach((title, id) => ids.add(id));

  const links = Array.from(ids)
    .sort()
    .map(id => `    <a href="/products/${encodeURIComponent(id)}">${escapeHtml(titles.get(id) || id)}</a>`)
    .join('\n');
  const nav = `<nav class="sitemap-product-links" aria-label="All product pages">\n${links}\n  </nav>`;

  if (html.includes('class="sitemap-product-links"')) {
    return html.replace(/<nav class="sitemap-product-links"[\s\S]*?<\/nav>/, nav);
  }
  return html.replace('</body>', `${nav}\n</body>`);
}

async function main() {
  let changed = 0;

  files.forEach(file => {
    if (!fs.existsSync(file)) return;
    const html = fs.readFileSync(file, 'utf8');
    const updated = addProductCardLinks(html);
    if (updated !== html) {
      fs.writeFileSync(file, updated, 'utf8');
      changed++;
    }
  });

  console.log(`Added crawlable product detail links to ${changed} dist page(s).`);
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
