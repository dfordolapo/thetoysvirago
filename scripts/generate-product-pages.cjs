const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const BASE_URL = 'https://www.thetoysvirago.shop';

function materializeDataImage(id, src, index) {
  const match = String(src).match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/s);
  if (!match) return '';
  const mime = match[1];
  const ext = mime.includes('png') ? 'png' : (mime.includes('jpeg') || mime.includes('jpg')) ? 'jpg' : 'webp';
  const fileName = `${id}-${index}.${ext}`;
  const distUploadsDir = path.join(rootDir, 'dist', 'assets', 'uploads');
  fs.mkdirSync(distUploadsDir, { recursive: true });
  fs.writeFileSync(path.join(distUploadsDir, fileName), Buffer.from(match[2], 'base64'));
  return `/assets/uploads/${fileName}`;
}

async function loadProducts() {
  const db = require(path.join(rootDir, 'scripts', 'products-db.json'));

  // Live catalogue products are rendered on demand by api/product-page.js so
  // admin edits appear immediately. We only need their IDs here so the build
  // never writes a stale static page that would shadow the function.
  const liveIds = new Set();
  let liveIdsFromSupabase = false;

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
    url = url || 'https://icopgheozdrauqevcbat.supabase.co';
    key = key || 'sb_publishable_859wsyvaLXUwaQlU3IuqsQ_x2yv3epp';

    if (url && key) {
      const sb = createClient(url, key);
      const { data: idRows } = await sb.from('products').select('id');
      if (Array.isArray(idRows)) {
        idRows.forEach((row) => {
          if (row && row.id) liveIds.add(String(row.id));
        });
        liveIdsFromSupabase = true;
      }
    }
  } catch (err) {
    console.warn('Notice: Could not load remote Supabase product IDs:', err.message);
  }

  // If Supabase was unreachable, fall back to the published catalogue so live
  // products still stay on the dynamic route instead of getting stale pages.
  if (!liveIdsFromSupabase) {
    try {
      const published = require(path.join(rootDir, 'public', 'new-products-data.json'));
      (Array.isArray(published) ? published : []).forEach((product) => {
        if (product && product.id) liveIds.add(String(product.id));
      });
    } catch (err) {
      console.warn('Notice: Could not read public/new-products-data.json:', err.message);
    }
  }

  return { db, liveIds };
}

async function generateProductPages() {
  const { renderProductPage } = await import('../src/productPageTemplate.js');
  const { buildImageList } = await import('../src/productMedia.js');

  const { db, liveIds } = await loadProducts();
  const distProductsDir = path.join(rootDir, 'dist', 'products');
  fs.mkdirSync(distProductsDir, { recursive: true });

  let generatedCount = 0;
  let dynamicCount = 0;

  for (const [key, rawProduct] of Object.entries(db)) {
    if (!rawProduct || !rawProduct.title) continue;

    const id = String(rawProduct.id || key);
    if (!id || /[\\/]/.test(id)) continue;

    // Supabase-backed products win at request time (Vercel filesystem
    // precedence means a static file here would permanently shadow the API).
    if (liveIds.has(id)) {
      dynamicCount++;
      continue;
    }

    const product = { ...rawProduct, id };
    const localImages = [];

    buildImageList(product).forEach((src, index) => {
      if (typeof src !== 'string' || !src.trim()) return;
      if (src.startsWith('data:image/')) {
        const localPath = materializeDataImage(id, src, index);
        if (localPath) localImages.push(localPath);
        return;
      }
      localImages.push(src.trim());
    });

    const absoluteImages = localImages.map((src) =>
      src.startsWith('http') ? src : `${BASE_URL}${src.startsWith('/') ? '' : '/'}${src}`
    );

    const html = renderProductPage(product, {
      siteUrl: BASE_URL,
      pageUrl: `${BASE_URL}/products/${encodeURIComponent(id)}`,
      imageUrls: absoluteImages
    });

    fs.writeFileSync(path.join(distProductsDir, `${id}.html`), html, 'utf8');
    generatedCount++;
  }

  console.log(
    `Generated ${generatedCount} static product pages in dist/products/ with Product schema + image tags. ` +
    `${dynamicCount} live Supabase products are rendered on demand by api/product-page.js.`
  );
}

generateProductPages().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
