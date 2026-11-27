const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const sitemapFile = path.join(rootDir, 'public', 'sitemap-static.xml');

const today = new Date().toISOString().split('T')[0];
const BASE_URL = 'https://www.thetoysvirago.shop';

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.warn('Could not read products file for sitemap:', e.message);
    return fallback;
  }
}

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function absoluteImage(src, encodedId, index) {
  if (typeof src !== 'string') return '';
  const value = src.trim();
  if (!value) return '';
  if (value.startsWith('data:image/')) {
    return `${BASE_URL}/product-image/${encodedId}${index > 0 ? `?i=${index}` : ''}`;
  }
  if (value.startsWith('http')) return value;
  return `${BASE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
}

function imageSources(product) {
  const list = [];
  const push = (src) => {
    if (typeof src !== 'string') return;
    const value = src.trim();
    if (value && !list.includes(value)) list.push(value);
  };
  push(product.image);
  push(product.img);
  (Array.isArray(product.media) ? product.media : []).forEach(m => {
    if (m && (!m.type || m.type === 'image')) push(m.src || m.url);
  });
  (Array.isArray(product.variants) ? product.variants : []).forEach(v => {
    if (v) push(v.img || v.image);
  });
  return list;
}

function lastmodFor(product) {
  const raw = product.updatedAt;
  const date = raw ? new Date(raw) : new Date();
  if (Number.isNaN(date.getTime())) return today;
  return date.toISOString().split('T')[0];
}

async function loadProducts() {
  const productsById = new Map();

  function addProduct(raw) {
    if (!raw || !raw.id) return;
    const id = String(raw.id).trim();
    if (!id || /[\\/]/.test(id)) return;
    const encodedId = encodeURIComponent(id);
    const images = imageSources(raw)
      .map((src, index) => absoluteImage(src, encodedId, index))
      .filter(Boolean);
    if (!images.length) images.push(`${BASE_URL}/product-image/${encodedId}`);
    productsById.set(id, {
      id,
      title: typeof raw.title === 'string' ? raw.title : '',
      updatedAt: raw.updated_at || raw.updatedAt || raw.lastmod || '',
      images
    });
  }

  const published = readJson(path.join(rootDir, 'public', 'new-products-data.json'), []);
  (Array.isArray(published) ? published : []).forEach(addProduct);

  const db = readJson(path.join(rootDir, 'scripts', 'products-db.json'), {});
  Object.entries(db && typeof db === 'object' ? db : {}).forEach(([key, raw]) => {
    if (!raw || !raw.title) return;
    const product = { ...raw, id: String(raw.id || key) };
    const id = product.id;
    if (!productsById.has(id) || !productsById.get(id).title) addProduct(product);
  });

  let liveRows = [];
  try {
    const { fetchAllSupabaseProducts } = await import('../src/productApi.js');
    liveRows = await fetchAllSupabaseProducts();
  } catch (err) {
    console.warn('Notice: Could not load live product IDs for sitemap:', err.message);
  }

  liveRows.forEach(row => {
    if (!row || !row.id) return;
    const id = String(row.id);
    const existing = productsById.get(id) || { id, title: '', updatedAt: '', images: [] };
    productsById.set(id, {
      id,
      title: row.title || existing.title,
      updatedAt: row.updated_at || existing.updatedAt,
      images: existing.images.length ? existing.images : [`${BASE_URL}/product-image/${encodeURIComponent(id)}`]
    });
  });

  return Array.from(productsById.values()).sort((a, b) => a.id.localeCompare(b.id));
}

async function main() {
  const products = await loadProducts();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n';

  xml += '  <url>\n';
  xml += `    <loc>${BASE_URL}/</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += '    <changefreq>daily</changefreq>\n';
  xml += '    <priority>1.0</priority>\n';
  xml += '  </url>\n\n';

  xml += '  <url>\n';
  xml += `    <loc>${BASE_URL}/products</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += '    <changefreq>daily</changefreq>\n';
  xml += '    <priority>0.95</priority>\n';
  xml += '  </url>\n\n';

  xml += '  <url>\n';
  xml += `    <loc>${BASE_URL}/blog</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += '    <changefreq>weekly</changefreq>\n';
  xml += '    <priority>0.90</priority>\n';
  xml += '  </url>\n\n';

  const blogArticles = [
    { slug: 'first-time-using-toys-couples-interview' },
    { slug: 'confessions-good-christian-girl-first-toy-at-27' },
    { slug: 'sexual-health-myths-nigerian-culture-retire' },
    { slug: 'how-discreet-delivery-works-nigeria' },
    { slug: 'first-vibrator-buyers-guide-nigeria' },
    { slug: 'water-based-lube-guide-nigeria' },
    { slug: 'couples-toys-communication-guide' }
  ];

  blogArticles.forEach(post => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/blog/${encodeURIComponent(post.slug)}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.85</priority>\n';
    xml += '  </url>\n\n';
  });

  const categories = ['toys', 'lingerie', 'wellness', 'bdsm', 'couples'];

  categories.forEach(slug => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/products?cat=${slug}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.85</priority>\n';
    xml += '  </url>\n\n';
  });

  products.forEach(product => {
    const encodedId = encodeURIComponent(product.id);
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/products/${encodedId}</loc>\n`;
    xml += `    <lastmod>${lastmodFor(product)}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.80</priority>\n';

    product.images.forEach(imgUrl => {
      xml += '    <image:image>\n';
      xml += `      <image:loc>${escapeXml(imgUrl)}</image:loc>\n`;
      if (product.title) {
        xml += `      <image:title>${escapeXml(product.title)}</image:title>\n`;
      }
      xml += '    </image:image>\n';
    });

    xml += '  </url>\n\n';
  });

  xml += '</urlset>\n';

  fs.writeFileSync(sitemapFile, xml, 'utf8');
  const urlCount = 3 + blogArticles.length + categories.length + products.length;
  console.log(`Generated ${sitemapFile} with ${urlCount} URLs!`);
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
