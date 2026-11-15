import { fetchAllSupabaseProducts } from '../src/productApi.js';

const SITE_URL = (typeof process !== 'undefined' && process.env && process.env.SITE_URL) ||
  'https://www.thetoysvirago.shop';

function escapeXml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function lastmodFor(product) {
  const raw = product.updated_at || product.updatedAt;
  const date = raw ? new Date(raw) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
  return date.toISOString().split('T')[0];
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method Not Allowed');
  }

  let products = [];
  let fetchFailed = false;
  try {
    products = await fetchAllSupabaseProducts();
  } catch (error) {
    fetchFailed = true;
    console.error('Product sitemap lookup failed:', error);
  }

  if (fetchFailed) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ error: 'Product sitemap temporarily unavailable' });
  }

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  products.forEach((product) => {
    if (!product || !product.id) return;
    const loc = `${SITE_URL}/products/${encodeURIComponent(product.id)}`;
    xml += '  <url>\n';
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${lastmodFor(product)}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.80</priority>\n';

    // The primary image is enough for image indexing; additional gallery
    // images are discovered from the product page itself.
    const imageUrl = `${SITE_URL}/product-image/${encodeURIComponent(product.id)}`;
    xml += '    <image:image>\n';
    xml += `      <image:loc>${escapeXml(imageUrl)}</image:loc>\n`;
    if (product.title) {
      xml += `      <image:title>${escapeXml(product.title)}</image:title>\n`;
    }
    xml += '    </image:image>\n';

    xml += '  </url>\n';
  });

  xml += '</urlset>\n';

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(xml);
}
