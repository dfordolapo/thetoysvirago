const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const productsFile = path.join(rootDir, 'public', 'new-products-data.json');
const sitemapFile = path.join(rootDir, 'public', 'sitemap.xml');

let products = [];
try {
  products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
} catch (e) {
  console.warn('Could not read products file for sitemap:', e.message);
}

const today = new Date().toISOString().split('T')[0];
const BASE_URL = 'https://www.thetoysvirago.shop';

let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n\n';

// 1. Homepage
xml += '  <url>\n';
xml += `    <loc>${BASE_URL}/</loc>\n`;
xml += `    <lastmod>${today}</lastmod>\n`;
xml += '    <changefreq>daily</changefreq>\n';
xml += '    <priority>1.0</priority>\n';
xml += '  </url>\n\n';

// 2. All Products Catalog
xml += '  <url>\n';
xml += `    <loc>${BASE_URL}/products</loc>\n`;
xml += `    <lastmod>${today}</lastmod>\n`;
xml += '    <changefreq>daily</changefreq>\n';
xml += '    <priority>0.95</priority>\n';
xml += '  </url>\n\n';

// 3. Category pages
const categories = [
  { slug: 'toys', title: 'Luxury Adult Toys & Vibrators' },
  { slug: 'lingerie', title: 'Sensual Lingerie & Robes' },
  { slug: 'wellness', title: 'Intimate Wellness & Personal Care' },
  { slug: 'bdsm', title: 'BDSM & Bondage Essentials' },
  { slug: 'couples', title: 'Couples Games & Dual Pleasure' }
];

categories.forEach(cat => {
  xml += '  <url>\n';
  xml += `    <loc>${BASE_URL}/products?cat=${cat.slug}</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += '    <changefreq>weekly</changefreq>\n';
  xml += '    <priority>0.85</priority>\n';
  xml += '  </url>\n\n';
});

// 4. Individual Product Deep Links
if (Array.isArray(products)) {
  products.forEach(p => {
    if (!p || !p.id) return;
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/products?product=${encodeURIComponent(p.id)}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.80</priority>\n';
    if (p.img) {
      const imgUrl = p.img.startsWith('http')
        ? p.img
        : `${BASE_URL}${p.img.startsWith('/') ? '' : '/'}${p.img}`;
      xml += '    <image:image>\n';
      xml += `      <image:loc>${imgUrl}</image:loc>\n`;
      if (p.title) {
        xml += `      <image:title><![CDATA[${p.title}]]></image:title>\n`;
      }
      xml += '    </image:image>\n';
    }
    xml += '  </url>\n\n';
  });
}

xml += '</urlset>\n';

fs.writeFileSync(sitemapFile, xml, 'utf8');
console.log(`Generated ${sitemapFile} with ${2 + categories.length + products.length} URLs!`);
