import { createRequire } from 'module';
import {
  fetchAllSupabaseProducts,
  SUPABASE_URL,
  SUPABASE_ANON_KEY
} from '../src/productApi.js';

const require = createRequire(import.meta.url);
const SITE_URL = process.env.SITE_URL || 'https://www.thetoysvirago.shop';
const CORE_CATEGORIES = ['toys', 'lingerie', 'wellness', 'bdsm', 'couples'];

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function lastmodFor(row) {
  const raw = row.updated_at || row.updatedAt || row.date || row.datePublished || row.dateModified;
  const date = raw ? new Date(raw) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
  return date.toISOString().split('T')[0];
}

function absoluteUrl(src) {
  if (typeof src !== 'string' || !src.trim()) return '';
  const value = src.trim();
  if (value.startsWith('http')) return value;
  return `${SITE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
}

function categorySlug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function fetchSupabaseArticles() {
  const url = `${SUPABASE_URL}/rest/v1/articles?select=slug,title,hero_img,updated_at,date&order=updated_at.desc&limit=1000`;
  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`
    }
  });
  if (!response.ok) throw new Error(`Supabase article list failed (HTTP ${response.status})`);
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

function loadStaticJson(file, fallback) {
  try {
    return require(file);
  } catch (err) {
    console.warn(`Notice: Could not read ${file} for sitemap:`, err.message);
    return fallback;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method Not Allowed');
  }
  if (req.method === 'HEAD') return res.status(200).end();

  const productsById = new Map();
  const articlesBySlug = new Map();
  const categories = new Set(CORE_CATEGORIES);

  function addProduct(raw) {
    if (!raw || !raw.id) return;
    const id = String(raw.id).trim();
    if (!id || /[\\/]/.test(id)) return;
    productsById.set(id, {
      id,
      title: typeof raw.title === 'string' ? raw.title : '',
      updatedAt: raw.updated_at || raw.updatedAt || '',
      images: raw.images || [`${SITE_URL}/product-image/${encodeURIComponent(id)}`]
    });
    const slug = categorySlug(raw.category);
    if (slug) categories.add(slug);
  }

  function addArticle(raw) {
    if (!raw || !raw.slug) return;
    const slug = String(raw.slug).trim();
    if (!slug || /[\\/]/.test(slug)) return;
    articlesBySlug.set(slug, {
      slug,
      title: typeof raw.title === 'string' ? raw.title : '',
      updatedAt: raw.updated_at || raw.updatedAt || raw.dateModified || raw.datePublished || raw.date || '',
      image: absoluteUrl(raw.hero_img || raw.heroImg || raw.image)
    });
  }

  const published = loadStaticJson('../public/new-products-data.json', []);
  (Array.isArray(published) ? published : []).forEach(addProduct);

  const db = loadStaticJson('../scripts/products-db.json', {});
  Object.entries(db && typeof db === 'object' ? db : {}).forEach(([key, raw]) => {
    if (!raw || !raw.title) return;
    addProduct({ ...raw, id: String(raw.id || key) });
  });

  let builtinArticles = [];
  try {
    const module = await import('../src/data/articles.js');
    builtinArticles = Array.isArray(module.BLOG_ARTICLES) ? module.BLOG_ARTICLES : [];
  } catch (err) {
    console.warn('Notice: Could not load built-in articles for sitemap:', err.message);
  }
  builtinArticles.forEach(addArticle);

  let liveProducts = [];
  try {
    liveProducts = await fetchAllSupabaseProducts();
  } catch (err) {
    console.error('Supabase product sitemap lookup failed:', err);
  }
  liveProducts.forEach(addProduct);

  let cloudArticles = [];
  try {
    cloudArticles = await fetchSupabaseArticles();
  } catch (err) {
    console.warn('Notice: Could not load Supabase articles for sitemap:', err.message);
  }
  cloudArticles.forEach(addArticle);

  const today = new Date().toISOString().split('T')[0];
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n';

  function addUrl(loc, lastmod, changefreq, priority, images = []) {
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${escapeXml(lastmod)}</lastmod>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    images.filter(Boolean).forEach(image => {
      xml += '    <image:image>\n';
      xml += `      <image:loc>${escapeXml(image)}</image:loc>\n`;
      xml += '    </image:image>\n';
    });
    xml += '  </url>\n\n';
  }

  addUrl(`${SITE_URL}/`, today, 'daily', '1.0');
  addUrl(`${SITE_URL}/products`, today, 'daily', '0.95');
  addUrl(`${SITE_URL}/blog`, today, 'weekly', '0.90');

  Array.from(categories).sort().forEach(slug => {
    addUrl(`${SITE_URL}/products?cat=${encodeURIComponent(slug)}`, today, 'weekly', '0.85');
  });

  Array.from(articlesBySlug.values()).forEach(article => {
    addUrl(
      `${SITE_URL}/blog/${encodeURIComponent(article.slug)}`,
      lastmodFor(article),
      'monthly',
      '0.85',
      article.image ? [article.image] : []
    );
  });

  Array.from(productsById.values()).forEach(product => {
    addUrl(
      `${SITE_URL}/products/${encodeURIComponent(product.id)}`,
      lastmodFor(product),
      'weekly',
      '0.80',
      product.images
    );
  });

  xml += '</urlset>\n';

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
  return res.status(200).send(xml);
}
