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

// 3. The Pleasure Journal (Blog)
xml += '  <url>\n';
xml += `    <loc>${BASE_URL}/blog</loc>\n`;
xml += `    <lastmod>${today}</lastmod>\n`;
xml += '    <changefreq>weekly</changefreq>\n';
xml += '    <priority>0.90</priority>\n';
xml += '  </url>\n\n';

// 4. Blog Articles
const blogArticles = [
  { slug: 'first-time-using-toys-couples-interview', title: '“I Picked Up The Rose While He Was Inside Me”: A Real Couple on Toys, Kinks, and Intimacy' },
  { slug: 'confessions-good-christian-girl-first-toy-at-27', title: 'Confessions of a Good Christian Girl Who Bought Her First Toy at 27' },
  { slug: 'sexual-health-myths-nigerian-culture-retire', title: 'Sexual Health Myths Nigerian Culture Needs to Retire' },
  { slug: 'how-discreet-delivery-works-nigeria', title: 'Nobody Go Find Out: What Actually Happens to Your Package in Transit' },
  { slug: 'first-vibrator-buyers-guide-nigeria', title: 'Overwhelmed by Choice? The Honest First-Timer Guide to Pleasure Pieces' },
  { slug: 'water-based-lube-guide-nigeria', title: 'Stop Using Coconut Oil and Vaseline: Why Water-Based Lube Is Non-Negotiable' },
  { slug: 'couples-toys-communication-guide', title: 'Bringing Toys into the Bedroom Without Hurting Anyones Ego' }
];

blogArticles.forEach(post => {
  xml += '  <url>\n';
  xml += `    <loc>${BASE_URL}/blog/${encodeURIComponent(post.slug)}</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += '    <changefreq>monthly</changefreq>\n';
  xml += '    <priority>0.85</priority>\n';
  xml += '  </url>\n\n';
});

// 5. Category pages
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

// 4. Individual Product Pages (real crawlable URLs + image sitemap entries)
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

if (Array.isArray(products)) {
  products.forEach(p => {
    if (!p || !p.id) return;
    const encodedId = encodeURIComponent(p.id);
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/products/${encodedId}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.80</priority>\n';

    imageSources(p).forEach((src, index) => {
      const imgUrl = src.startsWith('data:image/')
        ? `${BASE_URL}/product-image/${encodedId}${index > 0 ? `?i=${index}` : ''}`
        : src.startsWith('http')
          ? src
          : `${BASE_URL}${src.startsWith('/') ? '' : '/'}${src}`;
      xml += '    <image:image>\n';
      xml += `      <image:loc>${imgUrl}</image:loc>\n`;
      if (p.title) {
        xml += `      <image:title><![CDATA[${p.title}]]></image:title>\n`;
      }
      xml += '    </image:image>\n';
    });

    xml += '  </url>\n\n';
  });
}

xml += '</urlset>\n';

fs.writeFileSync(sitemapFile, xml, 'utf8');
console.log(`Generated ${sitemapFile} with ${3 + blogArticles.length + categories.length + products.length} URLs!`);
