import { buildImageList } from './productMedia.js';
import { resolveColorHex, isLightColor, formatColorName, isRecognizedColorName } from './modules/colorResolver.js';

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

const EM_DASH_REGEX = new RegExp('\\u2014|&' + 'mdash;|&#' + '8212;', 'g');

function stripEmDash(value = '') {
  return String(value).replace(EM_DASH_REGEX, ' - ');
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

function withWidth(url, width) {
  if (!url || !/\/product-image\//.test(url)) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}w=${width}`;
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
  const orderHref = `/products.html?product=${encodeURIComponent(id)}`;
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
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${siteUrl}/products.html` },
      { '@type': 'ListItem', position: 3, name: title, item: pageUrl }
    ]
  };

  const thumbnails = galleryImages.map((src, index) => `
        <button type="button" class="thumb-btn${index === 0 ? ' is-active' : ''}" data-gallery-src="${escapeHtml(src)}" aria-label="View photo ${index + 1} of ${galleryImages.length}">
          <img src="${escapeHtml(withWidth(src, 240))}" alt="${escapeHtml(index === 0 ? altBase : `${altBase} - view ${index + 1}`)}" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async" width="240" height="240" />
        </button>`).join('');

  const specsHtml = specs.length ? `
      <section class="spec-table-wrap" aria-label="Product specifications and details">
        <h2 class="section-subheading">Specifications &amp; Details</h2>
        <dl class="spec-dl">
          ${specs.map((spec) => `<div class="spec-row"><dt>${escapeHtml(spec.label || 'Feature')}</dt><dd>${escapeHtml(spec.value)}</dd></div>`).join('')}
        </dl>
      </section>` : '';

  const rawVariants = Array.isArray(product.variants) ? product.variants : [];
  const hasExplicitPrice = (v) => Boolean(
    v && (v.hasCustomPrice || v.priceStr) && Number(v.price) > 0
  );
  const isOptionVariants = rawVariants.some((v) => v && (hasExplicitPrice(v) || !isRecognizedColorName(v.name)));

  const variants = rawVariants.filter((v) => v && v.name).map((v, i) => {
    const explicit = (v.img && !/^data:/i.test(String(v.img))) ? String(v.img) : '';
    const index = Number.isInteger(v.imgIndex) ? v.imgIndex : i;
    const mapped = explicit || galleryImages[index] || galleryImages[0] || '';
    const vPrice = hasExplicitPrice(v) ? Number(v.price) : 0;
    const vPriceStr = hasExplicitPrice(v) ? (v.priceStr || `₦${vPrice.toLocaleString()}`) : '';
    return {
      name: formatColorName(v.name),
      price: vPrice,
      priceStr: vPriceStr,
      color: resolveColorHex(v.color, v.name),
      image: mapped ? toAbsolute(mapped, siteUrl) : ''
    };
  });

  const variantsHtml = variants.length ? (
    isOptionVariants ? `
      <div class="variant-block" aria-label="Available editions and options">
        <div class="variant-label-title">Edition</div>
        <div class="variant-pills-row">
          ${variants.map((v, i) => {
            const priceTag = v.priceStr ? ` · ${v.priceStr}` : '';
            const explicitAttr = v.price ? ` data-price="${v.price}" data-pricestr="${v.priceStr}"` : '';
            const imgAttr = v.image ? ` data-img="${escapeHtml(v.image)}"` : '';
            return `<button type="button" class="variant-option-pill${i === 0 ? ' is-active' : ''}" data-name="${escapeHtml(v.name)}"${explicitAttr}${imgAttr}>${escapeHtml(v.name + priceTag)}</button>`;
          }).join('')}
        </div>
      </div>` : `
      <div class="variant-block" aria-label="Available colors">
        <div class="variant-label-title">Color: <span id="active-color-name">${escapeHtml(variants[0]?.name || '')}</span></div>
        <div class="color-swatches-row">
          ${variants.map((v, i) => {
            const hex = resolveColorHex(v.color, v.name);
            const border = isLightColor(hex) ? 'border: 1px solid #cbd5e1;' : 'border: 1px solid rgba(0,0,0,0.15);';
            return `<button type="button" class="color-swatch-btn${i === 0 ? ' is-active' : ''}" data-color="${escapeHtml(v.name)}"${v.image ? ` data-img="${escapeHtml(v.image)}"` : ''} title="${escapeHtml(v.name)}" aria-label="Select ${escapeHtml(v.name)}" style="background: ${hex}; ${border}"></button>`;
          }).join('')}
        </div>
      </div>`
  ) : '';

  const sizesHtml = sizes.length ? `
        <div class="variant-block" aria-label="Available sizes">
        <div class="variant-label-title">Size</div>
        <div class="sizes-pills-row">
          ${sizes.map((size) => `<span class="size-static-pill">${escapeHtml(size)}</span>`).join('')}
        </div>
      </div>` : '';

  const whatsappMessage = encodeURIComponent(
    `Hello TheToysVirago Concierge,\n\nI would like to order "${title}" (${priceStr || ''}).\nSKU: ${sku}\nProduct: ${pageUrl}`
  );

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

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

  <script type="application/ld+json">${jsonForScript(productJsonLd)}</script>
  <script type="application/ld+json">${jsonForScript(breadcrumbJsonLd)}</script>

  <style>
    :root {
      --bg: #ffffff;
      --bg-alt: #fafafa;
      --card-bg: #ffffff;
      --ink: #0c0c0e;
      --ink-2: #27272a;
      --muted: #71717a;
      --border: #e4e4e7;
      --border-light: #f4f4f5;
      --ruby: #9f1239;
      --ruby-light: #fff1f2;
      --black: #121214;
      --radius-btn: 8px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      background-color: var(--bg);
      color: var(--ink-2);
      font-family: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      padding-top: 104px;
    }
    a { color: inherit; text-decoration: none; }
    img { max-width: 100%; display: block; }

    /* ── TOP NAV BAR (MATCHES THE SITE'S FLOATING PILL) ── */
    .main-header {
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      background: #111116;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 999px;
      max-width: 1240px;
      width: calc(100% - 32px);
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.18);
      transition: transform 0.3s ease, opacity 0.25s ease;
    }
    .header-inner {
      padding: 6px 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .logo {
      display: flex;
      align-items: center;
    }
    .brand-logo-img {
      height: 42px;
      width: auto;
      object-fit: contain;
      display: block;
      transform: scale(1.55);
      transform-origin: left center;
      border-radius: 8px;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .stealth-pill {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #ffffff;
      font-size: 11.5px;
      font-weight: 600;
      padding: 5px 12px;
      border-radius: 8px !important;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
      flex-shrink: 0;
      font-family: inherit;
    }
    .stealth-pill:hover {
      background: var(--ruby);
      border-color: var(--ruby);
    }
    .stealth-esc-hint {
      background: rgba(0, 0, 0, 0.45);
      padding: 1px 5px;
      border-radius: 3px;
      font-family: monospace;
      font-size: 10px;
      display: inline-block;
    }
    .mobile-nav-cart-btn {
      display: inline-flex;
      position: relative;
      background: none;
      border: none;
      cursor: pointer;
      color: #ffffff;
      padding: 6px;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s, transform 0.2s;
      line-height: 1;
    }
    .mobile-nav-cart-btn:hover { opacity: 0.85; }
    .mobile-cart-badge {
      position: absolute;
      top: -2px;
      right: -3px;
      background: var(--ruby);
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      min-width: 17px;
      height: 17px;
      line-height: 17px;
      border-radius: 999px;
      text-align: center;
      padding: 0 4px;
      box-sizing: border-box;
    }
    .btn-mobile-toggle {
      display: flex;
      background: none;
      border: none;
      cursor: pointer;
      flex-direction: column;
      gap: 5px;
      padding: 5px;
    }
    .btn-mobile-toggle .bar {
      width: 20px;
      height: 2px;
      background: #ffffff;
      transition: all 0.2s ease;
    }
    .nav-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      left: 0;
      right: 0;
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.09);
      border-radius: 14px;
      overflow: hidden;
      display: none;
      flex-direction: column;
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.16);
      transform-origin: top;
      z-index: 1050;
    }
    .nav-dropdown:not([hidden]) {
      display: flex;
      animation: dropDown .22s ease forwards;
    }
    @keyframes dropDown {
      from { opacity: 0; transform: scaleY(0.96); }
      to { opacity: 1; transform: scaleY(1); }
    }
    .dropdown-link {
      padding: 15px 22px;
      font-size: 13px;
      font-weight: 600;
      color: #111116;
      background: transparent;
      border: none;
      border-bottom: 1px solid #f0f0f4;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      transition: background 0.15s, color 0.15s;
      text-align: left;
    }
    .dropdown-link:hover {
      background: #f8fafc;
      color: var(--ruby);
    }

    /* ── PAGE TOP ACTIONS (ON PAGE BACK TO SHOP & BREADCRUMBS) ── */
    .page-top-bar {
      max-width: 1200px;
      margin: 0 auto;
      padding: 12px 24px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .btn-back-shop {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #27272a;
      background: #f4f4f5;
      border: 1px solid var(--border);
      border-radius: 8px !important;
      padding: 8px 16px;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-back-shop:hover {
      background: #121214;
      color: #ffffff;
      border-color: #121214;
      transform: translateX(-2px);
    }
    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12.5px;
      color: var(--muted);
      flex-wrap: wrap;
    }
    .breadcrumbs a {
      color: #52525b;
      transition: color 0.15s;
    }
    .breadcrumbs a:hover {
      color: var(--ruby);
    }
    .crumb-slash {
      color: #d4d4d8;
      user-select: none;
    }
    .crumb-active {
      color: var(--ink);
      font-weight: 600;
    }

    /* ── PRODUCT MAIN LAYOUT ── */
    .product-page-main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px 72px;
    }
    .product-layout {
      display: grid;
      grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
      gap: 52px;
      align-items: start;
    }

    /* ── GALLERY ── */
    .gallery-col {
      position: sticky;
      top: 96px;
    }
    .main-img-card {
      position: relative;
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      background: #fafafa;
      aspect-ratio: 1 / 1;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    }
    .main-img-card img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 24px;
      transition: opacity 0.25s ease, transform 0.3s ease;
    }
    .product-badge-chip {
      position: absolute;
      top: 14px;
      left: 14px;
      background: var(--ruby-light);
      color: var(--ruby);
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 5px 11px;
      border-radius: 6px;
      z-index: 2;
    }
    .thumbs-strip {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 10px;
      margin-top: 14px;
    }
    .thumb-btn {
      padding: 4px;
      border: 1.5px solid var(--border);
      border-radius: 8px;
      background: #fafafa;
      cursor: pointer;
      aspect-ratio: 1 / 1;
      overflow: hidden;
      transition: all 0.2s ease;
    }
    .thumb-btn.is-active,
    .thumb-btn:hover {
      border-color: var(--ruby);
      box-shadow: 0 0 0 2px rgba(159, 18, 57, 0.15);
      background: #ffffff;
    }
    .thumb-btn img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    /* ── DETAILS COLUMN ── */
    .details-col {
      min-width: 0;
    }
    .product-kicker {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--ruby);
      margin-bottom: 8px;
    }
    .product-title {
      font-family: "Cormorant Garamond", Georgia, serif;
      font-size: clamp(30px, 3.8vw, 44px);
      font-weight: 600;
      line-height: 1.14;
      color: var(--ink);
      margin-bottom: 8px;
    }
    .product-tagline {
      font-size: 15.5px;
      color: #52525b;
      line-height: 1.55;
      margin-bottom: 20px;
    }

    /* ── PRICE & STOCK ── */
    .price-stock-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 14px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border-light);
      margin-bottom: 22px;
    }
    .price-wrap {
      display: flex;
      align-items: baseline;
      gap: 10px;
      flex-wrap: wrap;
    }
    .price-amount {
      font-family: "Cormorant Garamond", Georgia, serif;
      font-size: 34px;
      font-weight: 700;
      color: var(--ink);
      line-height: 1;
    }
    .price-was {
      font-size: 17px;
      color: #a1a1aa;
      text-decoration: line-through;
      font-weight: 500;
    }
    .price-save-badge {
      background: var(--ruby-light);
      color: var(--ruby);
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
    }
    .stock-pill {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      font-size: 12px;
      font-weight: 600;
      padding: 5px 12px;
      border-radius: 6px;
    }
    .stock-pill.in-stock {
      background: #ecfdf5;
      color: #047857;
    }
    .stock-pill.out-stock {
      background: #fef2f2;
      color: #b91c1c;
    }
    .stock-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: currentColor;
    }

    /* ── VARIANTS & SWATCHES ── */
    .variant-block {
      margin-bottom: 24px;
    }
    .variant-label-title {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .variant-pills-row,
    .sizes-pills-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      max-width: 100%;
      box-sizing: border-box;
    }
    .variant-option-pill {
      border-radius: 8px !important;
      border: 1.5px solid var(--border);
      background: #ffffff;
      color: var(--ink);
      font-size: 12.5px;
      font-weight: 600;
      padding: 8px 14px;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .variant-option-pill.is-active {
      background: var(--black);
      color: #ffffff;
      border-color: var(--black);
    }
    .variant-option-pill:hover:not(.is-active) {
      border-color: var(--ruby);
      color: var(--ruby);
    }
    .color-swatches-row {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
      max-width: 100%;
      box-sizing: border-box;
    }
    .color-swatch-btn {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      padding: 0;
      cursor: pointer;
      transition: transform 0.15s ease, outline 0.15s ease;
      display: inline-block;
      flex-shrink: 0;
    }
    .color-swatch-btn.is-active {
      outline: 2px solid var(--ruby);
      outline-offset: 2px;
      transform: scale(1.1);
    }
    .size-static-pill {
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 6px 12px;
      font-size: 12.5px;
      color: var(--ink-2);
      font-weight: 600;
      background: #fafafa;
    }

    /* ── ACTION BUTTONS ── */
    .cta-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 28px;
    }
    .btn-order-primary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      max-width: 440px;
      height: 50px;
      background: var(--black);
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.03em;
      border-radius: 8px !important;
      text-decoration: none;
      border: 1px solid var(--black);
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-order-primary:hover {
      background: var(--ruby);
      border-color: var(--ruby);
      transform: translateY(-1px);
      box-shadow: 0 10px 24px rgba(159, 18, 57, 0.22);
    }
    .btn-order-whatsapp {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      width: 100%;
      max-width: 440px;
      height: 44px;
      background: #ffffff;
      color: var(--ink);
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px !important;
      text-decoration: none;
      border: 1px solid var(--border);
      transition: all 0.2s ease;
    }
    .btn-order-whatsapp:hover {
      background: #f4f4f5;
      border-color: #d4d4d8;
    }

    /* ── DISCREET DELIVERY TRUST CALLOUT (STRICTLY NO OUTSIDE STROKES) ── */
    .trust-strip {
      background: #f8fafc;
      border: none !important;
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 28px;
      display: grid;
      gap: 12px;
    }
    .trust-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-size: 13px;
      color: #3f3f46;
      line-height: 1.5;
    }
    .trust-icon {
      color: var(--ruby);
      flex-shrink: 0;
      margin-top: 2px;
    }
    .trust-item strong {
      color: var(--ink);
    }

    /* ── DESCRIPTION & SPECS ── */
    .product-description-wrap {
      margin-bottom: 28px;
      font-size: 14.5px;
      line-height: 1.75;
      color: var(--ink-2);
    }
    .product-description-wrap p {
      margin-bottom: 14px;
    }
    .spec-table-wrap {
      border-top: 1px solid var(--border-light);
      padding-top: 24px;
    }
    .section-subheading {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 14px;
    }
    .spec-dl {
      display: grid;
      gap: 0;
    }
    .spec-row {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 16px;
      padding: 11px 0;
      border-bottom: 1px solid var(--border-light);
      font-size: 13.5px;
    }
    .spec-row dt {
      color: var(--muted);
      font-weight: 500;
    }
    .spec-row dd {
      margin: 0;
      color: var(--ink);
      font-weight: 600;
    }

    /* ── SITE FOOTER ── */
    .site-footer {
      border-top: 1px solid var(--border);
      background: var(--bg-alt);
      padding: 44px 24px 52px;
      text-align: center;
      color: var(--muted);
      font-size: 13px;
    }
    .footer-links {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 14px;
    }
    .footer-links a:hover {
      color: var(--ruby);
    }
    .footer-legal {
      font-size: 12px;
      color: #a1a1aa;
    }

    @media (max-width: 860px) {
      .product-layout {
        grid-template-columns: 1fr;
        gap: 32px;
      }
      .gallery-col {
        position: static;
      }
      .main-header {
        top: 12px;
        width: calc(100% - 24px);
      }
      body {
        padding-top: 90px;
      }
      .page-top-bar {
        padding: 8px 16px 16px;
      }
      .product-page-main {
        padding: 0 16px 56px;
      }
      .stealth-esc-hint {
        display: none !important;
      }
    }
    @media (max-width: 520px) {
      .thumbs-strip {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      .spec-row {
        grid-template-columns: 110px 1fr;
        gap: 10px;
      }
      .btn-order-primary,
      .btn-order-whatsapp {
        max-width: 100%;
      }
    }

    body {
      background: radial-gradient(circle at 12% 4%, #ffffff 0%, #fbfaf8 48%, #f4f0ea 100%);
      color: #26231f;
    }
    .main-header {
      background: #121216;
      border-color: rgba(255, 255, 255, 0.12);
      box-shadow: 0 18px 48px rgba(24, 20, 16, 0.2);
    }
    .page-top-bar {
      max-width: 1240px;
      padding: 34px 32px 8px;
      gap: 12px;
    }
    .btn-back-shop {
      background: transparent;
      border: none;
      border-radius: 0 !important;
      padding: 0 0 3px;
      color: #2b2723;
      font-size: 13px;
      font-weight: 700;
      border-bottom: 1px solid #cfc8c0;
    }
    .btn-back-shop:hover {
      background: transparent;
      color: var(--ruby);
      border-color: var(--ruby);
      border-bottom-color: var(--ruby);
      transform: translateX(-3px);
    }
    .breadcrumbs {
      font-size: 12px;
      color: #8a827a;
    }
    .breadcrumbs a { color: #5b544d; }
    .crumb-active { color: #2b2723; }
    .product-page-main {
      max-width: 1240px;
      padding-bottom: 84px;
    }
    .product-layout {
      grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
      gap: 68px;
      align-items: start;
    }
    .gallery-col { top: 104px; }
    .main-img-card {
      aspect-ratio: 4 / 5;
      border-radius: 20px;
      border: 1px solid #e9e4de;
      background: linear-gradient(145deg, #f7f4f0 0%, #eee9e3 100%);
      box-shadow: 0 24px 64px rgba(38, 31, 24, 0.1);
    }
    .main-img-card img {
      padding: 34px;
      object-fit: contain;
    }
    .product-badge-chip {
      top: 18px;
      left: 18px;
      background: #ffffff;
      color: var(--ruby);
      border: 1px solid #f0d9de;
      border-radius: 999px;
      letter-spacing: 0.06em;
      box-shadow: 0 6px 20px rgba(38, 31, 24, 0.07);
    }
    .thumbs-strip {
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 10px;
      margin-top: 14px;
    }
    .thumb-btn {
      border-radius: 12px;
      border-color: #e4ded7;
      background: #ffffff;
    }
    .details-col {
      padding: 12px 0 0;
      min-width: 0;
    }
    .product-kicker { display: none !important; }
    .product-title {
      font-size: clamp(38px, 4.6vw, 60px);
      line-height: 1.06;
      letter-spacing: -0.025em;
      margin-bottom: 14px;
    }
    .product-tagline {
      font-size: 16.5px;
      line-height: 1.6;
      color: #5f5851;
      max-width: 46ch;
      margin-bottom: 26px;
    }
    .price-stock-box {
      gap: 18px;
      padding-bottom: 22px;
      margin-bottom: 28px;
      border-bottom-color: #e8e2dc;
    }
    .price-wrap { gap: 12px; }
    .price-amount {
      font-size: 38px;
      letter-spacing: -0.02em;
      color: #171412;
    }
    .price-save-badge {
      background: #fdf0f2;
      border-radius: 999px;
      padding: 5px 10px;
    }
    .stock-pill {
      border-radius: 999px;
      padding: 6px 13px;
      font-size: 11.5px;
    }
    .stock-pill.in-stock {
      background: #edf6f0;
      color: #256b49;
    }
    .stock-pill.out-stock {
      background: #fdf0f1;
      color: #9f1239;
    }
    .variant-block { margin-bottom: 28px; }
    .variant-label-title,
    .section-subheading {
      text-transform: none !important;
      letter-spacing: 0 !important;
      font-size: 13px !important;
      font-weight: 700 !important;
      color: #2b2723 !important;
      margin-bottom: 12px !important;
    }
    .variant-pills-row,
    .sizes-pills-row,
    .color-swatches-row {
      gap: 9px;
      width: 100%;
      min-width: 0;
      overflow: hidden;
    }
    .variant-option-pill,
    .size-static-pill {
      border-radius: 999px !important;
      padding: 9px 17px;
      font-size: 13px;
      border-color: #ddd7d0;
      background: #ffffff;
      min-width: 0;
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .variant-option-pill.is-active {
      background: var(--ruby);
      border-color: var(--ruby);
      color: #ffffff;
    }
    .color-swatch-btn {
      width: 30px;
      height: 30px;
    }
    .cta-group {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
      gap: 12px;
      margin-bottom: 32px;
    }
    .btn-order-primary,
    .btn-order-whatsapp {
      width: 100%;
      max-width: none;
      height: 54px;
      border-radius: 999px !important;
      font-size: 13px;
      padding: 0 18px;
    }
    .btn-order-primary {
      background: var(--ruby);
      border-color: var(--ruby);
      box-shadow: 0 12px 28px rgba(159, 18, 57, 0.2);
    }
    .btn-order-primary:hover {
      background: #121214;
      border-color: #121214;
      box-shadow: 0 14px 32px rgba(18, 18, 20, 0.22);
    }
    .btn-order-whatsapp {
      background: #ffffff;
      border-color: #ded8d1;
      color: #2b2723;
    }
    .btn-order-whatsapp:hover {
      background: #f6f2ee;
      border-color: #cfc8c0;
    }
    .trust-strip {
      background: #ffffff;
      border: 1px solid #eae5df;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 32px;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 18px;
      box-shadow: 0 10px 30px rgba(38, 31, 24, 0.04);
    }
    .trust-item {
      flex-direction: column;
      gap: 8px;
      font-size: 12.5px;
      line-height: 1.55;
      color: #5b544d;
      min-width: 0;
    }
    .trust-item + .trust-item {
      border-left: 1px solid #eee9e3;
      padding-left: 18px;
    }
    .trust-item strong {
      font-size: 13px;
      color: #2b2723;
    }
    .product-description-wrap {
      font-size: 15.5px;
      line-height: 1.85;
      color: #4b453f;
      max-width: 64ch;
      margin-bottom: 34px;
    }
    .spec-table-wrap {
      border-top-color: #e8e2dc;
      padding-top: 26px;
    }
    .spec-row {
      grid-template-columns: 150px minmax(0, 1fr);
      gap: 20px;
      padding: 14px 0;
      border-bottom-color: #eee9e3;
      font-size: 13.5px;
    }
    .spec-row dt { color: #8a827a; }
    .spec-row dd { color: #2b2723; font-weight: 600; }
    .site-footer {
      background: #ffffff;
      border-top-color: #eae5df;
    }

    @media (max-width: 860px) {
      .page-top-bar { padding: 24px 16px 8px; }
      .product-layout { gap: 36px; }
      .main-img-card { aspect-ratio: 1 / 1; }
      .main-img-card img { padding: 22px; }
      .cta-group { grid-template-columns: 1fr; }
      .trust-strip { grid-template-columns: 1fr; }
      .trust-item + .trust-item {
        border-left: none;
        border-top: 1px solid #eee9e3;
        padding-left: 0;
        padding-top: 16px;
      }
    }
    @media (max-width: 520px) {
      .product-title { font-size: 38px; }
      .price-amount { font-size: 34px; }
      .main-img-card img { padding: 16px; }
      .thumbs-strip { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .spec-row { grid-template-columns: 120px minmax(0, 1fr); gap: 12px; }
    }
  </style>
</head>
<body>

  <!-- TOP NAV BAR (MATCHES THE SITE) -->
  <header class="main-header" id="main-header">
    <div class="header-inner">
      <a href="/" class="logo" aria-label="The Toys Virago - Home">
        <img src="/assets/logo.webp" alt="The Toys Virago" class="brand-logo-img" />
      </a>
      <div class="header-actions">
        <button id="btn-stealth-nav" class="stealth-pill" title="Stealth mode (Esc)" type="button">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span>Stealth</span>
          <kbd class="stealth-esc-hint">Esc</kbd>
        </button>
        <a href="/products.html?cart=open" id="btn-cart-nav" class="btn-icon-nav mobile-nav-cart-btn" aria-label="Cart" title="Cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <span class="mobile-cart-badge" id="mobile-cart-badge" style="display: none;">0</span>
        </a>
        <button id="btn-mobile-menu" class="btn-mobile-toggle" aria-label="Menu" type="button">
          <span class="bar"></span><span class="bar"></span>
        </button>
      </div>
    </div>

    <!-- Dropdown Menu -->
    <div id="nav-dropdown" class="nav-dropdown" hidden style="display: none;">
      <a href="/" class="dropdown-link nav-closer">Home</a>
      <a href="/products.html" class="dropdown-link nav-closer">Shop All Pieces</a>
      <a href="/blog.html" class="dropdown-link nav-closer">The Pleasure Journal (Blog)</a>
      <a href="/index.html#faq" class="dropdown-link nav-closer">FAQ</a>
      <a href="/products.html#abuja" class="dropdown-link nav-closer">📍 Abuja Exclusives</a>
    </div>
  </header>

  <!-- ON-PAGE TOP BAR: BACK TO SHOP BUTTON & BREADCRUMBS -->
  <div class="page-top-bar">
    <a href="/products.html" class="btn-back-shop">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      <span>Back to Shop</span>
    </a>
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Home</a>
      <span class="crumb-slash">/</span>
      <a href="/products.html">Shop</a>
      <span class="crumb-slash">/</span>
      <a href="/products.html?cat=${encodeURIComponent(category)}">${escapeHtml(categoryLabel)}</a>
      <span class="crumb-slash">/</span>
      <span class="crumb-active">${escapeHtml(title)}</span>
    </nav>
  </div>

  <!-- MAIN PRODUCT SECTION -->
  <main class="product-page-main">
    <div class="product-layout">

      <!-- Gallery Column -->
      <div class="gallery-col">
        <div class="main-img-card">
          ${badge ? `<span class="product-badge-chip">${escapeHtml(badge)}</span>` : ''}
          <img id="main-image" src="${escapeHtml(primaryImage)}" alt="${escapeHtml(altBase)}" fetchpriority="high" decoding="async" />
        </div>
        ${galleryImages.length > 1 ? `<div class="thumbs-strip" role="list">${thumbnails}</div>` : ''}
      </div>

      <!-- Details Column -->
        <div class="details-col">
        <h1 class="product-title">${escapeHtml(title)}</h1>
        ${tagline ? `<p class="product-tagline">${escapeHtml(tagline)}</p>` : ''}

        <div class="price-stock-box">
          <div class="price-wrap">
            <span class="price-amount" id="product-price-val">${escapeHtml(priceStr || 'Price on request')}</span>
            ${originalPrice > price && price > 0 ? `<span class="price-was">${escapeHtml(formatNaira(originalPrice))}</span><span class="price-save-badge">Save ${Math.round((1 - price/originalPrice)*100)}%</span>` : ''}
          </div>
          <div class="stock-pill ${inStock ? 'in-stock' : 'out-stock'}">
            <span class="stock-dot"></span>
            <span>${inStock ? 'In stock · Ready for discreet dispatch' : 'Currently unavailable'}</span>
          </div>
        </div>

        ${variantsHtml}
        ${sizesHtml}

        <div class="cta-group">
          <a class="btn-order-primary" id="btn-order-primary" href="${orderHref}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span id="btn-primary-text">Add to Bag · ${escapeHtml(priceStr || 'Order')}</span>
          </a>
          <a class="btn-order-whatsapp" href="https://wa.me/2348036514814?text=${whatsappMessage}" target="_blank" rel="noopener">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.477-.15-.678.15-.2.301-.778.978-.954 1.179-.176.2-.352.226-.653.075-1.398-.702-2.316-1.25-3.23-2.828-.244-.42.244-.39.7-.1.301-.4.402-.678.603-.979.2-.301.1-.564-.05-.865-.15-.301-.678-1.631-.93-2.233-.245-.586-.494-.506-.678-.515-.176-.008-.377-.01-.578-.01-.2 0-.528.075-.804.376-.276.301-1.055 1.03-1.055 2.511s1.08 2.912 1.231 3.113c.15.2 2.126 3.247 5.15 4.555.719.311 1.281.497 1.719.636.723.23 1.381.198 1.901.12.579-.087 1.78-.727 2.031-1.43.251-.703.251-1.305.176-1.43-.075-.125-.276-.201-.577-.351z"/>
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.892.525 3.662 1.438 5.176L2 22l4.966-1.394A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.17a8.136 8.136 0 0 1-4.148-1.134l-.297-.176-3.085.866.866-3.008-.193-.312A8.14 8.14 0 0 1 3.83 12c0-4.505 3.665-8.17 8.17-8.17 4.505 0 8.17 3.665 8.17 8.17 0 4.505-3.665 8.17-8.17 8.17z"/>
            </svg>
            <span>Order via WhatsApp Concierge</span>
          </a>
        </div>

        <div class="trust-strip">
          <div class="trust-item">
            <svg class="trust-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            <div><strong>100% Plain Packaging</strong> - Sealed in completely opaque courier bags. Zero product logos, zero descriptions, zero clues on the exterior.</div>
          </div>
          <div class="trust-item">
            <svg class="trust-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            <div><strong>Discreet Nationwide Delivery</strong> - Same-day / next-day delivery across Lagos; rapid discreet courier to Abuja and all Nigerian states.</div>
          </div>
          <div class="trust-item">
            <svg class="trust-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <div><strong>Zero-Drama Confidentiality</strong> - Delivery riders only see your drop-off address and phone number. Your pleasure stays strictly your business.</div>
          </div>
        </div>

        <div class="product-description-wrap">
          ${descriptionParagraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
        </div>

        ${specsHtml}
      </div>
    </div>
  </main>

  <!-- SITE FOOTER -->
  <footer class="site-footer">
    <div class="footer-links">
      <a href="/products.html">Shop All Products</a>
      <span>·</span>
      <a href="/blog.html">The Pleasure Journal</a>
      <span>·</span>
      <a href="/index.html#discretion">How Discreet?</a>
      <span>·</span>
      <a href="/index.html#faq">FAQ</a>
      <span>·</span>
      <a href="/">Home</a>
    </div>
    <p class="footer-legal">&copy; ${new Date().getFullYear()} TheToysVirago. 18+ only. 100% plain packaging &amp; discreet delivery across Nigeria.</p>
  </footer>

  <script>
    (function () {
      // 1. Gallery switching
      var mainImg = document.getElementById('main-image');
      var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-gallery-src]'));
      var dots = Array.prototype.slice.call(document.querySelectorAll('.color-swatch-btn'));
      var optionPills = Array.prototype.slice.call(document.querySelectorAll('.variant-option-pill'));
      var priceVal = document.getElementById('product-price-val');
      var btnText = document.getElementById('btn-primary-text');
      var activeColorLabel = document.getElementById('active-color-name');

      function showImage(src) {
        if (!src || !mainImg) return;
        mainImg.src = src;
        thumbs.forEach(function (t) {
          t.classList.toggle('is-active', t.getAttribute('data-gallery-src') === src);
        });
      }

      thumbs.forEach(function (thumb) {
        thumb.addEventListener('click', function () {
          showImage(thumb.getAttribute('data-gallery-src'));
        });
      });

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          dots.forEach(function (d) { d.classList.remove('is-active'); });
          dot.classList.add('is-active');
          var colorName = dot.getAttribute('data-color') || '';
          if (activeColorLabel) activeColorLabel.textContent = colorName;
          var img = dot.getAttribute('data-img');
          if (img) showImage(img);
        });
      });

      optionPills.forEach(function (pill) {
        pill.addEventListener('click', function () {
          optionPills.forEach(function (p) { p.classList.remove('is-active'); });
          pill.classList.add('is-active');
          var priceStr = pill.getAttribute('data-pricestr');
          if (priceStr && priceVal) {
            priceVal.textContent = priceStr;
            if (btnText) btnText.textContent = 'Add to Bag · ' + priceStr;
          }
          var img = pill.getAttribute('data-img');
          if (img) showImage(img);
        });
      });

      // 2. Top Nav Mobile Menu Toggle
      var menuBtn = document.getElementById('btn-mobile-menu');
      var dropdown = document.getElementById('nav-dropdown');
      if (menuBtn && dropdown) {
        menuBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          var isHidden = dropdown.hasAttribute('hidden') || dropdown.style.display === 'none';
          if (isHidden) {
            dropdown.removeAttribute('hidden');
            dropdown.style.display = 'flex';
          } else {
            dropdown.setAttribute('hidden', '');
            dropdown.style.display = 'none';
          }
        });
        document.addEventListener('click', function (e) {
          if (!dropdown.contains(e.target) && !menuBtn.contains(e.target)) {
            dropdown.setAttribute('hidden', '');
            dropdown.style.display = 'none';
          }
        });
      }

      // 3. Stealth Pill & Esc Trigger
      var stealthBtn = document.getElementById('btn-stealth-nav');
      function triggerStealth() {
        window.location.replace('https://www.google.com');
      }
      if (stealthBtn) {
        stealthBtn.addEventListener('click', triggerStealth);
      }
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') triggerStealth();
      });

      // 4. Cart badge count from localStorage
      try {
        var cartData = JSON.parse(localStorage.getItem('rouge_noir_cart') || '[]');
        var count = 0;
        if (Array.isArray(cartData)) {
          cartData.forEach(function (item) { count += (item.qty || 1); });
        }
        var badge = document.getElementById('mobile-cart-badge');
        if (badge && count > 0) {
          badge.textContent = count;
          badge.style.display = 'inline-block';
        }
      } catch (err) {}
    })();
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
  <title>Product Not Found | TheToysVirago</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Plus+Jakarta+Sans:wght@400;600&display=swap" rel="stylesheet" />
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #ffffff;
      color: #0c0c0e;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      text-align: center;
      padding: 24px;
    }
    h1 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 36px;
      font-weight: 600;
      margin: 0 0 12px;
    }
    p {
      color: #71717a;
      margin: 0 0 24px;
      font-size: 15px;
    }
    a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 8px !important;
      background: #121214;
      color: #ffffff;
      text-decoration: none;
      font-weight: 600;
      font-size: 13px;
      letter-spacing: 0.04em;
      transition: background 0.2s;
    }
    a:hover {
      background: #9f1239;
    }
  </style>
</head>
<body>
  <main>
    <h1>Product Not Found</h1>
    <p>This pleasure piece may have been moved or is temporarily unavailable.</p>
    <a href="${base}/products.html">&larr; Return to Shop</a>
  </main>
</body>
</html>`;
}
