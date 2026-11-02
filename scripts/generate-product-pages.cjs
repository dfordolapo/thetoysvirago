const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distProductsPath = path.join(rootDir, 'dist', 'products.html');
const rawProductsPath = path.join(rootDir, 'products.html');

async function generateProductPages() {
  const sourcePath = fs.existsSync(distProductsPath) ? distProductsPath : rawProductsPath;
  const baseHtml = fs.readFileSync(sourcePath, 'utf8');

  // Load product catalog from scripts/products-db.json
  const db = require(path.join(rootDir, 'scripts', 'products-db.json'));

  // Also merge all products from Supabase so admin uploads get static pages
  try {
    const { createClient } = require('@supabase/supabase-js');
    let url = process.env.VITE_SUPABASE_URL;
    let key = process.env.VITE_SUPABASE_ANON_KEY;
    const envPath = path.join(rootDir, '.env');
    if ((!url || !key) && fs.existsSync(envPath)) {
      const env = fs.readFileSync(envPath, 'utf8');
      url = url || env.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
      key = key || env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();
    }
    // Hardcoded production fallbacks so Vercel serverless builds never fail to generate product pages
    url = url || 'https://icopgheozdrauqevcbat.supabase.co';
    key = key || 'sb_publishable_859wsyvaLXUwaQlU3IuqsQ_x2yv3epp';

    if (url && key) {
      const sb = createClient(url, key);
      const { data: remoteData } = await sb.from('products').select('*');
        if (remoteData && Array.isArray(remoteData)) {
          remoteData.forEach(rp => {
            if (rp && rp.id && !db[rp.id]) {
              db[rp.id] = {
                id: rp.id,
                title: rp.title,
                price: rp.price,
                priceStr: '₦' + Number(rp.price).toLocaleString(),
                img: rp.image || '/assets/category-lingerie.webp',
                desc: rp.description || rp.tagline || ''
              };
            }
          });
        }
    }
  } catch (err) {
    console.warn('Notice: Could not load remote Supabase products for static pages:', err.message);
  }

  const distProductsDir = path.join(rootDir, 'dist', 'products');
  if (!fs.existsSync(distProductsDir)) {
    fs.mkdirSync(distProductsDir, { recursive: true });
  }

  const BASE_URL = 'https://www.thetoysvirago.shop';
  let generatedCount = 0;

  for (const [id, prod] of Object.entries(db)) {
    if (!prod || !prod.title || !prod.img) continue;

    const pageUrl = `${BASE_URL}/products/${id}`;
    let imgPath = prod.img;
    if (prod.img && prod.img.startsWith('data:image/')) {
      // Social crawlers like WhatsApp and Facebook cannot render data: URI images in Open Graph previews.
      // Save it as a real static file:
      try {
        const uploadsDir = path.join(rootDir, 'public', 'assets', 'uploads');
        const distUploadsDir = path.join(rootDir, 'dist', 'assets', 'uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        if (!fs.existsSync(distUploadsDir)) fs.mkdirSync(distUploadsDir, { recursive: true });
        const base64Data = prod.img.replace(/^data:image\/\w+;base64,/, '');
        const imgBuffer = Buffer.from(base64Data, 'base64');
        const fileName = `${id}.webp`;
        fs.writeFileSync(path.join(uploadsDir, fileName), imgBuffer);
        fs.writeFileSync(path.join(distUploadsDir, fileName), imgBuffer);
        imgPath = `/assets/uploads/${fileName}`;
      } catch (err) {
        console.warn('Error saving data uri image for', id, err);
      }
    }
    const cleanImg = imgPath.startsWith('http') ? imgPath : `${BASE_URL}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
    const cleanTitle = prod.title.replace(/[\u2018\u2019]/g, "'").replace(/"/g, '&quot;');
    const pageTitle = `${cleanTitle} · Discreet Delivery Nigeria | TheToysVirago`;
    const rawDesc = prod.desc || `Shop ${cleanTitle} at TheToysVirago Nigeria. 100% plain packaging & discreet delivery across Lagos and nationwide.`;
    const cleanDesc = rawDesc.replace(/[\u2018\u2019]/g, "'").replace(/"/g, '&quot;');
    const priceStr = prod.priceStr || (prod.price ? `₦${Number(prod.price).toLocaleString()}` : '');

    let html = baseHtml;

    // 1. Replace Title & Meta Description & Canonical
    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${pageTitle}</title>`);
    html = html.replace(
      /<meta name="description" content="[\s\S]*?" \/>/,
      `<meta name="description" content="${cleanDesc}" />`
    );
    html = html.replace(
      /<link rel="canonical" href="[\s\S]*?" \/>/,
      `<link rel="canonical" href="${pageUrl}" />`
    );

    // 2. Replace Open Graph tags
    html = html.replace(
      /<meta property="og:type" content="[\s\S]*?" \/>/,
      `<meta property="og:type" content="product" />`
    );
    html = html.replace(
      /<meta property="og:url" content="[\s\S]*?" \/>/,
      `<meta property="og:url" content="${pageUrl}" />`
    );
    html = html.replace(
      /<meta property="og:title" content="[\s\S]*?" \/>/,
      `<meta property="og:title" content="${cleanTitle} ${priceStr ? `(${priceStr})` : ''} | TheToysVirago" />`
    );
    html = html.replace(
      /<meta property="og:description" content="[\s\S]*?" \/>/,
      `<meta property="og:description" content="${cleanDesc}" />`
    );
    // Remove any leftover og:image:secure_url that pointed to og-cover
    html = html.replace(/<meta property="og:image:secure_url"[\s\S]*?\/>\s*/g, '');
    html = html.replace(
      /<meta property="og:image" content="[\s\S]*?" \/>/,
      `<meta property="og:image" content="${cleanImg}" />\n  <meta property="og:image:secure_url" content="${cleanImg}" />\n  <meta property="og:image:alt" content="${cleanTitle}" />\n  <meta property="og:image:width" content="1200" />\n  <meta property="og:image:height" content="1200" />`
    );

    // 3. Replace Twitter Card metadata
    html = html.replace(
      /<meta name="twitter:title" content="[\s\S]*?" \/>/,
      `<meta name="twitter:title" content="${cleanTitle} ${priceStr ? `(${priceStr})` : ''} | TheToysVirago" />`
    );
    html = html.replace(
      /<meta name="twitter:description" content="[\s\S]*?" \/>/,
      `<meta name="twitter:description" content="${cleanDesc}" />`
    );
    html = html.replace(
      /<meta name="twitter:image" content="[\s\S]*?" \/>/,
      `<meta name="twitter:image" content="${cleanImg}" />`
    );

    // Write file to dist/products/[id].html
    const outPath = path.join(distProductsDir, `${id}.html`);
    fs.writeFileSync(outPath, html, 'utf8');
    generatedCount++;
  }

  console.log(`Generated ${generatedCount} static product HTML pages in dist/products/ with rich OG product image tags!`);
}

generateProductPages().catch(console.error);
