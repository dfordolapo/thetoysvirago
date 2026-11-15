import { buildImageList } from './productMedia.js';
import { resolveColorHex, isLightColor, formatColorName } from './modules/colorResolver.js';

const CATEGORY_LABELS = {
  toys: 'Luxury Adult Toys & Vibrators',
  lingerie: 'Sensual Lingerie & Robes',
  wellness: 'Intimate Wellness & Personal Care',
  bdsm: 'BDSM & Bondage Essentials',
  couples: 'Couples Games & Dual Pleasure',
  lubes: 'Intimate Lubricants & Glides',
  games: 'Couples Games & Intimacy Decks'
};

function inferCategory(product = {}) {
  const explicit = String(product.category || '').toLowerCase().trim();
  if (explicit) return explicit;

  const haystack = [
    product.sku,
    product.id,
    product.title,
    product.description,
    product.desc
  ].filter(Boolean).join(' ').toLowerCase();

  if (/(lingerie|bra\b|panty|panties|teddy|robe|pasties|garter|bodysuit|corset|chemise|babydoll|stocking|thong)/.test(haystack)) return 'lingerie';
  if (/(lube|glide|lubricant|massage oil|intimate oil)/.test(haystack)) return 'lubes';
  if (/(bdsm|bondage|cuff|restraint|collar|leash|rope|blindfold|paddle|flogger|harness)/.test(haystack)) return 'bdsm';
  if (/(game|card|deck|dare|confession)/.test(haystack)) return 'games';
  if (/(couple|duo|partner)/.test(haystack)) return 'couples';
  if (/(clean|wash|wellness|hygiene)/.test(haystack)) return 'wellness';
  return 'toys';
}

function stripEmDash(value = '') {
  return String(value).replace(/\u2014/g, ' - ');
}

function escapeHtml(value = '') {
  return stripEmDash(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parsePrice(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const digits = String(value || '').replace(/[^0-9.]/g, '');
  const amount = Number(digits);
  return Number.isFinite(amount) ? amount : 0;
}

function formatNaira(amount) {
  return `\u20a6${Number(amount || 0).toLocaleString('en-NG')}`;
}

function normalizeSpecs(specs) {
  if (!specs) return [];
  if (typeof specs === 'string') {
    const text = specs.trim();
    if (!text) return [];
    if (text.startsWith('{') || text.startsWith('[')) {
      try {
        return normalizeSpecs(JSON.parse(text));
      } catch (err) {
        // fall through to plain-text parsing
      }
    }
    return text
      .split(/[;\n]/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((value) => ({ label: '', value }));
  }
  if (Array.isArray(specs)) {
    return specs
      .map((item) => {
        if (!item) return null;
        if (typeof item === 'string') return { label: '', value: item };
        return {
          label: item.label || item.name || item.key || '',
          value: item.value || item.detail || item.text || ''
        };
      })
      .filter((item) => item && item.value);
  }
  if (typeof specs === 'object') {
    return Object.entries(specs)
      .map(([label, value]) => ({ label, value: value == null ? '' : String(value) }))
      .filter((item) => item.value);
  }
  return [{ label: 'Details', value: String(specs) }];
}

function normalizeSizes(sizes) {
  if (!sizes) return [];
  if (Array.isArray(sizes)) return sizes.map(String).filter(Boolean);
  if (typeof sizes === 'object') return Object.keys(sizes).filter(Boolean);
  const text = String(sizes).trim();
  if (!text) return [];
  if (text.startsWith('[') || text.startsWith('{')) {
    try {
      return normalizeSizes(JSON.parse(text));
    } catch (err) {
      // fall through
    }
  }
  return text.split(',').map((part) => part.trim()).filter(Boolean);
}

function dedupeSpecs(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${(item.label || '').toLowerCase()}|${String(item.value).toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function toAbsolute(url, siteUrl) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

function jsonForScript(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}

export function renderProductPage(product = {}, options = {}) {
  const siteUrl = String(options.siteUrl || 'https://www.thetoysvirago.shop').replace(/\/+$/, '');
  const id = String(product.id || options.id || '').trim();
  const title = stripEmDash(String(product.title || 'TheToysVirago Product').trim());
  const pageUrl = options.pageUrl || `${siteUrl}/products/${encodeURIComponent(id)}`;

  const price = parsePrice(product.price);
  const priceStr = price > 0 ? formatNaira(price) : (product.priceStr || '');
  const originalPrice = parsePrice(product.original_price || product.originalPrice);
  const category = inferCategory(product);
  const categoryLabel = CATEGORY_LABELS[category] || 'Intimate Essentials';
  const badge = stripEmDash(String(product.badge || '').trim());
  const tagline = stripEmDash(String(product.tagline || '').trim());
  const inStockRaw = product.in_stock !== undefined ? product.in_stock : product.inStock;
  const inStock = !(inStockRaw === false || inStockRaw === 'false' || inStockRaw === 0);

  const rawDescription = stripEmDash(String(product.description || product.desc || '').trim());
  const description = rawDescription ||
    `Shop ${title} at TheToysVirago Nigeria. 100% plain packaging and discreet nationwide delivery.`;
  const descriptionPlain = description.replace(/\s+/g, ' ').trim();
  const metaDescription = descriptionPlain.length > 160
    ? `${descriptionPlain.slice(0, 157).trim()}...`
    : descriptionPlain;
  const descriptionParagraphs = description
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  const specs = dedupeSpecs([
    ...(product.material ? [{ label: 'Material', value: String(product.material) }] : []),
    ...(product.acoustics ? [{ label: 'Sensation', value: String(product.acoustics) }] : []),
    ...normalizeSpecs(product.specs)
  ]);
  const sizes = normalizeSizes(product.sizes);

  const providedImages = Array.isArray(options.imageUrls) ? options.imageUrls.filter(Boolean) : [];
  const imageUrls = providedImages.length
    ? providedImages
    : buildImageList(product).map((src) => toAbsolute(src, siteUrl));
  const galleryImages = imageUrls.length ? imageUrls : [`${siteUrl}/assets/og-cover.jpg`];
  const primaryImage = galleryImages[0];
  const altBase = `${title} - ${categoryLabel} | TheToysVirago Nigeria`;
  const orderHref = `/products?product=${encodeURIComponent(id)}`;
  const sku = String(product.sku || id);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    image: galleryImages,
    description: descriptionPlain,
    sku,
    category: categoryLabel,
    brand: { '@type': 'Brand', name: 'TheToysVirago' },
    offers: {
      '@type': 'Offer',
      url: pageUrl,
      priceCurrency: 'NGN',
      price: price > 0 ? price : undefined,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'TheToysVirago' }
    }
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${siteUrl}/products` },
      { '@type': 'ListItem', position: 3, name: title, item: pageUrl }
    ]
  };

  const thumbnails = galleryImages.map((src, index) => `
        <button type="button" class="thumb${index === 0 ? ' is-active' : ''}" data-gallery-src="${escapeHtml(src)}" aria-label="View image ${index + 1} of ${galleryImages.length}">
          <img src="${escapeHtml(src)}" alt="${escapeHtml(index === 0 ? altBase : `${altBase} - view ${index + 1}`)}" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async" />
        </button>`).join('');

  const specsHtml = specs.length ? `
      <section class="spec-block" aria-label="Product details">
        <h2>Details</h2>
        <dl>
          ${specs.map((spec) => `<div class="spec-row"><dt>${escapeHtml(spec.label || 'Detail')}</dt><dd>${escapeHtml(spec.value)}</dd></div>`).join('')}
        </dl>
      </section>` : '';

  const rawVariants = Array.isArray(product.variants) ? product.variants : [];
  const variants = rawVariants.filter((v) => v && v.name).map((v) => ({
    name: formatColorName(v.name),
    color: resolveColorHex(v.color, v.name),
    img: v.img || ''
  }));

  const variantsHtml = variants.length ? `
      <section class="spec-block" aria-label="Available colors">
        <h2>Available Colors</h2>
        <div class="color-row" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          ${variants.map((v, i) => {
            const hex = resolveColorHex(v.color, v.name);
            const border = isLightColor(hex) ? 'border: 1px solid #cbd5e1;' : 'border: 1px solid rgba(255,255,255,0.2);';
            return `<span class="color-dot${i === 0 ? ' active' : ''}" data-color="${escapeHtml(v.name)}" title="${escapeHtml(v.name)}" style="background: ${hex}; ${border} width: 18px; height: 18px; border-radius: 50%; display: inline-block;"></span>`;
          }).join('')}
          <span class="color-name" style="font-size: 13px; color: var(--muted); margin-left: 4px;">${escapeHtml(variants[0]?.name || '')}</span>
        </div>
      </section>` : '';

  const sizesHtml = sizes.length ? `
      <section class="spec-block" aria-label="Available sizes">
        <h2>Available sizes</h2>
        <ul class="sizes">${sizes.map((size) => `<li>${escapeHtml(size)}</li>`).join('')}</ul>
      </section>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}${priceStr ? ` (${escapeHtml(priceStr)})` : ''} | TheToysVirago Nigeria</title>
  <meta name="description" content="${escapeHtml(metaDescription)}" />
  <meta name="robots" content="index, follow, max-image-preview:large" />
  <link rel="canonical" href="${escapeHtml(pageUrl)}" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
  <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
  <link rel="icon" type="image/png" sizes="512x512" href="/favicon-512x512.png" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="shortcut icon" href="/favicon.ico" />

  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="TheToysVirago" />
  <meta property="og:title" content="${escapeHtml(`${title}${priceStr ? ` (${priceStr})` : ''} | TheToysVirago`)}" />
  <meta property="og:description" content="${escapeHtml(metaDescription)}" />
  <meta property="og:url" content="${escapeHtml(pageUrl)}" />
  <meta property="og:image" content="${escapeHtml(primaryImage)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(primaryImage)}" />
  <meta property="og:image:alt" content="${escapeHtml(altBase)}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(`${title} | TheToysVirago`)}" />
  <meta name="twitter:description" content="${escapeHtml(metaDescription)}" />
  <meta name="twitter:image" content="${escapeHtml(primaryImage)}" />
  <meta name="twitter:image:alt" content="${escapeHtml(altBase)}" />

  <script type="application/ld+json">${jsonForScript(productJsonLd)}</script>
  <script type="application/ld+json">${jsonForScript(breadcrumbJsonLd)}</script>

  <style>
    :root {
      --bg: #0b0b0d;
      --panel: #141417;
      --panel-2: #1b1b1f;
      --ink: #f6f1ea;
      --muted: #a9a29b;
      --accent: #e11d48;
      --gold: #c9a86a;
      --line: rgba(255, 255, 255, 0.1);
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      background: radial-gradient(1200px 600px at 80% -10%, rgba(225, 29, 72, 0.16), transparent 60%), var(--bg);
      color: var(--ink);
      font-family: "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    a { color: inherit; text-decoration: none; }
    img { max-width: 100%; display: block; }
    .site-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 18px 24px;
      border-bottom: 1px solid var(--line);
      position: sticky;
      top: 0;
      background: rgba(11, 11, 13, 0.9);
      backdrop-filter: blur(12px);
      z-index: 10;
    }
    .brand { display: flex; flex-direction: column; line-height: 1.15; }
    .brand strong {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 20px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .brand span { font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: var(--muted); }
    .back { font-size: 13px; color: var(--muted); border: 1px solid var(--line); padding: 8px 14px; border-radius: 999px; }
    .back:hover { color: var(--ink); border-color: var(--gold); }
    .page { max-width: 1120px; margin: 0 auto; padding: 34px 24px 64px; }
    .breadcrumbs { font-size: 12px; color: var(--muted); margin-bottom: 18px; }
    .breadcrumbs a:hover { color: var(--gold); }
    .layout { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr); gap: 40px; align-items: start; }
    .gallery { position: sticky; top: 92px; }
    .main-image {
      border: 1px solid var(--line);
      border-radius: 18px;
      overflow: hidden;
      background: var(--panel);
      aspect-ratio: 1 / 1;
    }
    .main-image img { width: 100%; height: 100%; object-fit: cover; }
    .thumbs { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
    .thumb {
      padding: 0;
      border: 1px solid var(--line);
      border-radius: 10px;
      overflow: hidden;
      background: var(--panel);
      cursor: pointer;
      aspect-ratio: 1 / 1;
      opacity: 0.72;
      transition: opacity 0.15s ease, border-color 0.15s ease;
    }
    .thumb:hover, .thumb.is-active { opacity: 1; border-color: var(--gold); }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .details { min-width: 0; }
    .badge {
      display: inline-block;
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--gold);
      border: 1px solid rgba(201, 168, 106, 0.45);
      border-radius: 999px;
      padding: 5px 12px;
      margin-bottom: 16px;
    }
    h1 {
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(30px, 4.2vw, 46px);
      line-height: 1.08;
      font-weight: 500;
      margin: 0 0 12px;
    }
    .tagline { color: var(--muted); font-size: 16px; margin: 0 0 18px; }
    .price-row { display: flex; align-items: baseline; gap: 12px; margin: 0 0 10px; }
    .price { font-size: 30px; font-weight: 700; color: var(--ink); }
    .was { color: var(--muted); text-decoration: line-through; font-size: 16px; }
    .stock { font-size: 13px; letter-spacing: 0.04em; margin: 0 0 22px; }
    .stock.in { color: #4ade80; }
    .stock.out { color: #f87171; }
    .cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      max-width: 360px;
      padding: 16px 22px;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--accent), #a3123a);
      color: #fff;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-size: 13px;
      box-shadow: 0 14px 30px rgba(225, 29, 72, 0.24);
    }
    .cta:hover { filter: brightness(1.08); }
    .cta-note { font-size: 12px; color: var(--muted); margin: 10px 0 0; }
    .description { margin: 26px 0 0; color: #e6dfd6; }
    .description p { margin: 0 0 14px; }
    .spec-block { margin-top: 28px; border-top: 1px solid var(--line); padding-top: 20px; }
    .spec-block h2 {
      font-size: 11px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--muted);
      margin: 0 0 14px;
      font-weight: 600;
    }
    .spec-block dl { margin: 0; display: grid; gap: 10px; }
    .spec-row { display: grid; grid-template-columns: 130px minmax(0, 1fr); gap: 14px; font-size: 14px; }
    .spec-row dt { color: var(--muted); }
    .spec-row dd { margin: 0; }
    .sizes { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; padding: 0; margin: 0; }
    .sizes li { border: 1px solid var(--line); border-radius: 8px; padding: 6px 12px; font-size: 13px; }
    .trust {
      margin-top: 30px;
      padding: 14px 16px;
      background: #161217;
      border: none;
      border-radius: 12px;
      font-size: 12px;
      color: var(--muted);
      letter-spacing: 0.02em;
    }
    .site-footer {
      border-top: 1px solid var(--line);
      padding: 28px 24px 40px;
      text-align: center;
      color: var(--muted);
      font-size: 12px;
    }
    .site-footer a:hover { color: var(--gold); }
    .site-footer p { margin: 10px 0 0; }
    @media (max-width: 860px) {
      .layout { grid-template-columns: 1fr; gap: 26px; }
      .gallery { position: static; }
      .spec-row { grid-template-columns: 110px minmax(0, 1fr); }
    }
    @media (max-width: 520px) {
      .page { padding: 22px 16px 48px; }
      .site-header { padding: 14px 16px; }
      .thumbs { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .spec-row { grid-template-columns: 1fr; gap: 2px; }
      .spec-row dt { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; }
    }
  </style>
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/" aria-label="TheToysVirago home">
      <strong>TheToysVirago</strong>
      <span>Discreet Intimacy Boutique</span>
    </a>
    <a class="back" href="/products">&larr; Back to shop</a>
  </header>

  <main class="page">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Home</a> &nbsp;/&nbsp; <a href="/products">Products</a> &nbsp;/&nbsp; <span>${escapeHtml(title)}</span>
    </nav>

    <div class="layout">
      <div class="gallery">
        <div class="main-image">
          <img id="main-image" src="${escapeHtml(primaryImage)}" alt="${escapeHtml(altBase)}" fetchpriority="high" decoding="async" />
        </div>
        ${galleryImages.length > 1 ? `<div class="thumbs" role="list">${thumbnails}</div>` : ''}
      </div>

      <div class="details">
        ${badge ? `<span class="badge">${escapeHtml(badge)}</span>` : ''}
        <h1>${escapeHtml(title)}</h1>
        ${tagline ? `<p class="tagline">${escapeHtml(tagline)}</p>` : ''}
        <div class="price-row">
          <span class="price">${escapeHtml(priceStr || 'Price on request')}</span>
          ${originalPrice > price && price > 0 ? `<span class="was">${escapeHtml(formatNaira(originalPrice))}</span>` : ''}
        </div>
          <p class="stock ${inStock ? 'in' : 'out'}">${inStock ? 'In stock - ready for discreet dispatch' : 'Currently unavailable'}</p>
        <a class="cta" href="${orderHref}">Order in shop</a>
        <p class="cta-note">Opens the quick-view checkout on our shop page.</p>

        <div class="description">
          ${descriptionParagraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
        </div>

        ${variantsHtml}
        ${sizesHtml}
        ${specsHtml}

        <div class="trust">100% plain packaging &middot; Discreet delivery across Lagos &amp; nationwide</div>
      </div>
    </div>
  </main>

  <footer class="site-footer">
    <a href="/products">Shop all products</a> &nbsp;&middot;&nbsp; <a href="/blog">Pleasure Journal</a> &nbsp;&middot;&nbsp; <a href="/">Home</a>
    <p>&copy; ${new Date().getFullYear()} TheToysVirago. 18+ only. Discreet delivery nationwide.</p>
  </footer>

  <script>
    document.querySelectorAll('[data-gallery-src]').forEach(function (button) {
      button.addEventListener('click', function () {
        var main = document.getElementById('main-image');
        if (main) main.src = button.getAttribute('data-gallery-src');
        document.querySelectorAll('[data-gallery-src]').forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
      });
    });
  </script>
</body>
</html>`;
}

export function renderProductNotFoundPage(siteUrl = 'https://www.thetoysvirago.shop') {
  const base = String(siteUrl).replace(/\/+$/, '');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, follow" />
  <title>Product not found | TheToysVirago</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0b0b0d; color: #f6f1ea; font-family: "Segoe UI", system-ui, sans-serif; text-align: center; padding: 24px; }
    h1 { font-family: Georgia, serif; font-weight: 500; font-size: 34px; margin: 0 0 10px; }
    p { color: #a9a29b; margin: 0 0 22px; }
    a { display: inline-block; padding: 13px 22px; border-radius: 999px; background: #e11d48; color: #fff; text-decoration: none; font-weight: 700; font-size: 13px; letter-spacing: 0.04em; text-transform: uppercase; }
  </style>
</head>
<body>
  <main>
    <h1>Product not found</h1>
    <p>This product may have been removed or renamed.</p>
    <a href="${base}/products">Browse all products</a>
  </main>
</body>
</html>`;
}
