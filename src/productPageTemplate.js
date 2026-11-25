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

  const isColorVariant = (v) => {
    if (!v || !v.name) return false;
    const name = String(v.name).trim();
    if (/\(.*\)|\bpack\b|\bpiece\b|\bsize\b|\bthrust|\brotat/i.test(name)) return false;
    return isRecognizedColorName(name);
  };

  const allVariantsAreColors = rawVariants.length > 0 && rawVariants.every(isColorVariant);
  const variantPrices = rawVariants.map((v) => Number(v.price) || 0).filter((p) => p > 0);
  const hasDiffVariantPrices = new Set(variantPrices).size > 1;

  const isOptionVariants = !allVariantsAreColors && rawVariants.some((v) => !isColorVariant(v));

  const variants = rawVariants.filter((v) => v && v.name).map((v, i) => {
    const explicit = (v.img && !/^data:/i.test(String(v.img))) ? String(v.img) : '';
    const index = Number.isInteger(v.imgIndex) ? v.imgIndex : i;
    const mapped = explicit || galleryImages[index] || galleryImages[0] || '';
    const isCol = isColorVariant(v);
    const hasSpecificPrice = !isCol && Number(v.price) > 0;
    const vPrice = hasSpecificPrice ? Number(v.price) : 0;
    const vPriceStr = hasSpecificPrice ? (v.priceStr || `₦${vPrice.toLocaleString()}`) : '';
    return {
      name: formatColorName(v.name),
      isColor: isCol,
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
          ${variants.map((v) => {
            const explicitAttr = v.price ? ` data-price="${v.price}" data-pricestr="${v.priceStr}"` : '';
            const imgAttr = v.image ? ` data-img="${escapeHtml(v.image)}"` : '';
            return `<button type="button" class="variant-option-pill" data-name="${escapeHtml(v.name)}"${explicitAttr}${imgAttr}>${escapeHtml(v.name)}</button>`;
          }).join('')}
        </div>
      </div>` : `
      <div class="variant-block" aria-label="Available colors">
        <div class="variant-label-title">Color: <span id="active-color-name"></span></div>
        <div class="color-swatches-row">
          ${variants.map((v) => {
            const hex = resolveColorHex(v.color, v.name);
            const border = isLightColor(hex) ? 'border: 1px solid #cbd5e1;' : 'border: 1px solid rgba(0,0,0,0.15);';
            return `<button type="button" class="color-swatch-btn" data-color="${escapeHtml(v.name)}"${v.image ? ` data-img="${escapeHtml(v.image)}"` : ''} title="${escapeHtml(v.name)}" aria-label="Select ${escapeHtml(v.name)}" style="background: ${hex}; ${border}"></button>`;
          }).join('')}
        </div>
      </div>`
  ) : '';

  const sizesHtml = sizes.length ? `
        <div class="variant-block" aria-label="Available sizes">
        <div class="variant-label-title">Size</div>
        <div class="sizes-pills-row">
          ${sizes.map((size, i) => `<button type="button" class="size-static-pill${i === 0 ? ' is-active' : ''}" data-size="${escapeHtml(size)}" aria-pressed="${i === 0 ? 'true' : 'false'}">${escapeHtml(size)}</button>`).join('')}
        </div>
      </div>` : '';

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
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

  <script type="application/ld+json">${jsonForScript(productJsonLd)}</script>
  <script type="application/ld+json">${jsonForScript(breadcrumbJsonLd)}</script>

  <style>
    :root {
      --bg: #ffffff;
      --bg-alt: #fafafa;
      --card-bg: #ffffff;
      --ink: #0a0a10;
      --ink-2: #38383e;
      --ink-3: #78787e;
      --ink-4: #b8b8c0;
      --muted: #78787e;
      --border: #e5e5ea;
      --border-d: #c8c8d2;
      --border-light: #f4f4f6;
      --ruby: #c0112f;
      --ruby-light: rgba(192, 17, 47, 0.08);
      --black: #0a0a10;
      --white: #ffffff;
      --off: #fafafa;
      --mist: #f4f4f6;
      --ruby-b: rgba(192, 17, 47, 0.2);
      --ruby-l: rgba(192, 17, 47, 0.08);
      --sans: 'Plus Jakarta Sans', -apple-system, sans-serif;
      --r-sm: 6px;
      --r-pill: 9999px;
      --ease: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      --sh-md: 0 4px 16px rgba(0, 0, 0, 0.1), 0 12px 40px rgba(0, 0, 0, 0.08);
      --radius-btn: 8px;
      --serif: 'Cormorant Garamond', Georgia, serif;
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
    h1, h2, h3, h4, h5 { font-family: var(--serif); font-weight: 700; line-height: 1.1; }
    a { color: inherit; text-decoration: none; }
    img { max-width: 100%; display: block; }

    /* ── TOP NAV BAR (MATCHES THE REST OF THE SITE) ── */
    .main-header {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      background: var(--ink);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 9999px;
      max-width: 1240px;
      width: calc(100% - 40px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease, background 0.2s ease;
    }
    .header-inner {
      padding: 6px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    .logo {
      display: flex;
      align-items: center;
    }
    .brand-logo-img {
      height: 44px;
      width: auto;
      object-fit: contain;
      display: block;
      transform: scale(1.6);
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
      padding: 4px 12px;
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
      display: inline-flex !important;
      position: relative;
      background: none;
      border: none;
      cursor: pointer;
      color: #ffffff;
      padding: 6px;
      margin-right: 2px;
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
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
      pointer-events: none;
    }
    [hidden] { display: none !important; }
    html.cart-open,
    body.cart-open {
      overflow: hidden !important;
      overscroll-behavior: none !important;
      touch-action: none !important;
      height: 100% !important;
    }
    .drawer-overlay,
    .cart-drawer {
      overscroll-behavior: contain !important;
      -webkit-overflow-scrolling: touch;
      overflow-x: hidden !important;
    }
    .cart-drawer {
      touch-action: pan-y !important;
      overscroll-behavior: contain !important;
    }
    .cart-drawer .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-family: var(--sans);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 12px 22px;
      border-radius: 8px !important;
      border: 1.5px solid transparent;
      cursor: pointer;
      transition: var(--ease);
      text-decoration: none;
    }
    .cart-drawer .btn-lg { padding: 14px 26px; font-size: 13px; }
    .cart-drawer .btn-block { width: 100%; }
    .cart-drawer .btn svg { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    .cart-drawer .btn:hover svg { transform: translateX(3px); }
    .cart-drawer .btn-black { background: var(--ink); color: #fff; border-color: var(--ink); }
    .cart-drawer .btn-black:hover { background: var(--ruby); border-color: var(--ruby); color: #fff; transform: translateY(-1px); box-shadow: var(--sh-md); }

    .drawer-overlay {
      position: fixed; inset: 0; z-index: 2000;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex; justify-content: flex-end; align-items: center;
      padding: 20px;
    }
    .cart-drawer {
      width: 100%; max-width: 440px;
      background: var(--white);
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 24px;
      height: calc(100vh - 40px);
      max-height: 920px;
      display: flex; flex-direction: column;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.28), 0 4px 16px rgba(0, 0, 0, 0.08);
      animation: slideInRight 0.32s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
    }
    @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    .drawer-header {
      padding: 22px 24px; display: flex;
      justify-content: space-between; align-items: center;
      border-bottom: 1px solid var(--border);
    }
    .drawer-title {
      font-family: var(--serif);
      font-size: 26px;
      font-weight: 700;
      line-height: 1.1;
      color: var(--ink);
      display: inline;
    }
    .drawer-count {
      font-family: var(--sans);
      font-size: 13px;
      color: var(--ink-3);
      margin-left: 6px;
    }
    .btn-close-drawer { background: none; border: none; color: var(--ink-3); font-size: 18px; cursor: pointer; padding: 4px; transition: var(--ease); }
    .btn-close-drawer:hover { color: var(--ink); }

    .empty-cart-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 48px 24px 32px;
      margin: auto;
      width: 100%;
    }
    .empty-glow-orbit { margin-bottom: 22px; }
    .empty-icon-halo {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background: #ffe4e6;
      border: none !important;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ruby);
      animation: gentleBuzz 1.5s ease-in-out infinite;
      transform-origin: center center;
    }
    @keyframes gentleBuzz {
      0% { transform: scale(1) rotate(0deg); }
      8% { transform: scale(1.05) rotate(-3.5deg); }
      16% { transform: scale(1.07) rotate(3.5deg); }
      24% { transform: scale(1.05) rotate(-2.5deg); }
      32% { transform: scale(1.06) rotate(2.5deg); }
      40% { transform: scale(1.02) rotate(-1deg); }
      48% { transform: scale(1) rotate(0deg); }
      100% { transform: scale(1) rotate(0deg); }
    }
    .empty-state-title {
      font-family: var(--serif);
      font-size: 30px;
      font-weight: 700;
      color: var(--ink);
      letter-spacing: -0.02em;
      margin-bottom: 10px;
      line-height: 1.15;
    }
    .empty-state-sub {
      font-family: var(--sans);
      font-size: 14.5px;
      line-height: 1.55;
      color: var(--ink-3);
      max-width: 300px;
      margin-bottom: 28px;
    }
    .empty-shop-cta {
      min-width: 220px;
      padding: 13px 32px;
      font-family: var(--sans);
      font-size: 13px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      font-weight: 700;
      border-radius: 8px !important;
      background: var(--ink);
      color: #ffffff;
      transition: all 0.25s ease;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .empty-shop-cta:hover {
      background: var(--ruby);
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(159, 18, 57, 0.25);
    }

    .cart-item {
      display: flex; gap: 14px; background: var(--mist);
      border: 1px solid var(--border); border-radius: var(--r-sm); padding: 12px;
    }
    .cart-item-img { width: 68px; height: 68px; border-radius: 4px; object-fit: cover; background: var(--border); flex-shrink: 0; }
    .cart-item-details { flex: 1; display: flex; flex-direction: column; }
    .cart-item-name {
      font-family: var(--serif);
      font-size: 13.5px;
      font-weight: 700;
      line-height: 1.25;
      color: var(--ink);
      margin-bottom: 2px;
    }
    .cart-item-variant-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(159, 18, 57, 0.08);
      border: 1px solid rgba(159, 18, 57, 0.2);
      color: var(--ruby);
      font-family: var(--sans);
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: var(--r-pill);
      width: fit-content;
      margin-bottom: 5px;
      letter-spacing: 0.02em;
    }
    .cart-item-variant-pill .variant-pill-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--ruby);
      flex-shrink: 0;
    }
    .cart-item-price {
      font-family: var(--sans);
      font-size: 13px;
      color: var(--ruby);
      font-weight: 700;
      margin-bottom: 8px;
    }
    .cart-item-ctrls { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
    .qty-stepper { display: flex; align-items: center; border: 1px solid var(--border); border-radius: 5px; overflow: hidden; }
    .qty-btn {
      background: transparent;
      border: none;
      color: var(--ink);
      width: 26px;
      height: 26px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-family: var(--sans);
      transition: var(--ease);
    }
    .qty-btn:hover { background: var(--mist); }
    .qty-val {
      font-family: var(--sans);
      font-size: 12px;
      font-weight: 700;
      padding: 0 8px;
      color: var(--ink);
    }
    .btn-remove-item {
      background: none;
      border: none;
      color: var(--ink-4);
      font-size: 11px;
      cursor: pointer;
      text-decoration: underline;
      font-family: var(--sans);
      transition: var(--ease);
    }
    .btn-remove-item:hover { color: var(--ruby); }

    .drawer-items {
      flex: 1 1 auto;
      overflow-y: auto;
      min-height: 0;
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      -webkit-overflow-scrolling: touch;
    }

    .drawer-foot {
      flex-shrink: 0;
      padding: 14px 20px 18px 20px;
      border-top: 1px solid var(--border);
      background: var(--white);
      max-height: 72vh;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    .promo-row { display: flex; gap: 8px; margin-bottom: 12px; }
    .input-field {
      width: 100%; background: var(--white); border: 1px solid var(--border);
      color: var(--ink); padding: 10px 14px; border-radius: var(--r-sm);
      font-size: 13px; outline: none; transition: var(--ease); font-family: var(--sans);
    }
    .input-field:focus { border-color: var(--ruby); box-shadow: 0 0 0 3px var(--ruby-l); }
    .btn-promo { background: var(--mist); border: 1px solid var(--border-d); color: var(--ink); padding: 0 14px; border-radius: var(--r-sm); font-size: 12px; font-weight: 700; cursor: pointer; transition: var(--ease); font-family: var(--sans); }
    .btn-promo:hover { background: var(--ruby); color: #fff; border-color: var(--ruby); }
    .promo-msg { font-size: 12px; color: #16a34a; margin-bottom: 10px; font-family: var(--sans); }

    .cart-collapse-toggle {
      width: 100%;
      background: var(--mist);
      border: 1px solid var(--border);
      border-radius: var(--r-sm);
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.2s ease, border-color 0.2s ease;
      margin-bottom: 12px;
      text-align: left;
    }
    .cart-collapse-toggle:hover { background: #f0f0f4; border-color: rgba(0, 0, 0, 0.18); }
    .collapse-toggle-left { display: flex; flex-direction: column; gap: 2px; }
    .collapse-toggle-title { font-family: var(--sans); font-size: 12.5px; font-weight: 700; color: var(--ink); letter-spacing: -0.01em; }
    .collapse-toggle-hint { font-family: var(--sans); font-size: 10px; font-weight: 600; color: var(--ink-3); text-transform: uppercase; letter-spacing: 0.05em; }
    .collapse-toggle-right { display: flex; align-items: center; gap: 8px; }
    .collapse-total-peek { font-size: 15px; font-weight: 800; color: var(--ruby); font-family: var(--serif); }
    .collapse-chevron { color: var(--ink-2); transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1); flex-shrink: 0; }
    .cart-collapse-toggle[aria-expanded="true"] .collapse-chevron { transform: rotate(180deg); }
    .cart-collapsible-details {
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-height 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
      margin-bottom: 0;
    }
    .cart-collapsible-details.is-expanded { max-height: 600px; opacity: 1; margin-bottom: 12px; }
    .cart-lines { display: flex; flex-direction: column; gap: 7px; margin-bottom: 14px; }
    .cart-line { display: flex; justify-content: space-between; font-family: var(--sans); font-size: 13.5px; color: var(--ink-3); }
    .total-line { font-family: var(--sans); font-size: 17px; color: var(--ink); font-weight: 700; border-top: 1px solid var(--border); padding-top: 12px; margin-top: 6px; }
    .green-txt { color: #16a34a; font-weight: 700; font-family: var(--sans); }
    .ruby-txt { color: var(--ruby); font-weight: 700; font-family: var(--serif); font-size: 22px; }
    .delivery-timeline-card {
      background: var(--mist);
      border: 1px solid var(--border);
      border-radius: var(--r-sm);
      padding: 11px 14px;
      display: flex;
      flex-direction: column;
      gap: 7px;
    }
    .delivery-timeline-card.in-drawer { margin-bottom: 14px; }
    .deliv-line { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-family: var(--sans); font-size: 12px; }
    .deliv-line-left { display: inline-flex; align-items: center; gap: 7px; color: var(--ink); font-weight: 600; white-space: nowrap; font-family: var(--sans); }
    .deliv-dot { width: 6px; height: 6px; border-radius: 50%; background: #16a34a; flex-shrink: 0; }
    .deliv-dot-amber { background: #d97706; }
    .deliv-line-val { color: var(--ink-2); font-weight: 500; text-align: right; font-size: 11.5px; font-family: var(--sans); }
    .deliv-discreet-footer { display: flex; align-items: center; gap: 6px; padding-top: 6px; border-top: 1px solid var(--border); font-size: 11px; color: var(--ink-3); line-height: 1.35; font-family: var(--sans); }
    .deliv-discreet-footer svg { color: var(--ruby); flex-shrink: 0; }

    .cart-gift-note-wrap {
      margin: 10px 0 14px;
      background: rgba(159, 18, 57, 0.04);
      border: 1px dashed rgba(159, 18, 57, 0.25);
      border-radius: 8px !important;
      overflow: hidden;
      transition: all 0.2s ease;
    }
    .btn-toggle-gift-note {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: transparent;
      border: none;
      cursor: pointer;
      color: #0c0c0e;
      font-family: var(--sans);
      font-size: 12px;
      font-weight: 600;
      text-align: left;
    }
    .gift-toggle-left { display: flex; align-items: center; gap: 8px; color: #0c0c0e; font-family: var(--sans); }
    .gift-toggle-left svg { color: var(--ruby); flex-shrink: 0; }
    .gift-toggle-action { font-size: 11px; font-weight: 700; color: var(--ruby); font-family: var(--sans); }
    .cart-gift-note-input-wrap { padding: 0 14px 12px; }
    .cart-gift-note-input-wrap textarea {
      width: 100%;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 12px;
      font-family: var(--sans);
      color: #0c0c0e;
      background: #ffffff;
      resize: vertical;
      min-height: 60px;
      outline: none;
      transition: border-color 0.2s ease;
      box-sizing: border-box;
    }
    .cart-gift-note-input-wrap textarea:focus { border-color: var(--ruby); }
    .gift-note-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; font-size: 10.5px; color: #64748b; font-family: var(--sans); }

    @media (max-width: 768px) {
      .drawer-overlay { align-items: flex-end; justify-content: center; padding: 12px 12px 16px 12px; }
      .cart-drawer {
        max-width: 100%;
        width: 100%;
        height: 90vh;
        max-height: 90vh;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 26px !important;
        animation: slideUp 0.32s cubic-bezier(0.16, 1, 0.3, 1);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .drawer-foot { max-height: 65vh; overflow-y: auto; padding: 12px 16px 18px 16px; }
    }
    .btn-mobile-toggle {
      display: flex;
      background: none;
      border: none;
      cursor: pointer;
      flex-direction: column;
      gap: 5px;
      padding: 4px;
      margin-left: 4px;
    }
    .btn-mobile-toggle .bar {
      width: 22px;
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
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      cursor: pointer;
      text-decoration: none;
      font-family: inherit;
    }
    .dropdown-link:hover {
      background: var(--bg-alt);
      color: var(--ruby);
    }

    /* ── BREADCRUMBS ── */
    .product-breadcrumbs, .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      color: var(--muted);
      flex-wrap: wrap;
    }
    .product-breadcrumbs a, .breadcrumbs a {
      color: #52525b;
      transition: color 0.15s;
    }
    .product-breadcrumbs a:hover, .breadcrumbs a:hover {
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
      box-shadow: 0 0 0 2px rgba(192, 17, 47, 0.15);
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
      color: var(--ink-4);
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
      background: var(--bg-alt);
      color: var(--ink);
    }
    .stock-pill.out-stock {
      background: var(--ruby-light);
      color: var(--ruby);
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
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      max-width: 440px;
      min-height: 46px;
      padding: 12px 22px;
      background: var(--ruby);
      color: #ffffff;
      font-family: inherit;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      border: 1.5px solid var(--ruby);
      border-radius: 8px !important;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
      box-sizing: border-box;
    }
    .btn-order-primary:hover {
      background: var(--black);
      border-color: var(--black);
      transform: translateY(-1px);
      box-shadow: 0 10px 24px rgba(10, 10, 16, 0.22);
    }
    .btn-order-primary svg {
      flex-shrink: 0;
    }

    /* ── DISCREET DELIVERY TRUST CALLOUT (STRICTLY NO OUTSIDE STROKES) ── */
    .trust-strip {
      background: var(--bg-alt);
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
      color: var(--ink-4);
    }

    body {
      background: var(--bg);
      color: var(--ink);
      padding-top: 96px;
      overflow-x: hidden;
    }
    .main-header {
      background: var(--ink);
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 18px 48px rgba(10, 10, 16, 0.2);
    }
    /* ── FLOATING BACK TO SHOP BUTTON (STANDALONE PILL) ── */
    .floating-back-shop {
      position: fixed;
      bottom: 22px;
      right: 20px;
      z-index: 950;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--ink);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px !important;
      padding: 9px 15px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.02em;
      box-shadow: 0 6px 22px rgba(0, 0, 0, 0.32);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background 0.15s ease, box-shadow 0.2s ease;
      text-decoration: none;
      cursor: pointer;
    }
    .floating-back-shop:hover {
      background: var(--ruby);
      border-color: var(--ruby);
      transform: translateY(-2px);
      box-shadow: 0 10px 28px rgba(192, 17, 47, 0.35);
    }

    /* ── PRODUCT BREADCRUMBS (STANDALONE ROW ABOVE PRODUCT LAYOUT) ── */
    .product-breadcrumbs {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
      font-size: 12.5px;
      color: var(--muted);
      margin: 0 0 20px 0;
      padding: 4px 0;
      min-width: 0;
    }
    .product-breadcrumbs a {
      color: var(--ink-2);
      text-decoration: none;
      transition: color 0.15s ease;
    }
    .product-breadcrumbs a:hover {
      color: var(--ruby);
    }
    .crumb-slash {
      color: var(--border-d);
      user-select: none;
    }
    .crumb-active {
      color: var(--ink);
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 420px;
    }
    .product-page-main {
      max-width: 1240px;
      margin: 0 auto;
      padding: 0 32px 84px;
      box-sizing: border-box;
      width: 100%;
    }
    .product-layout {
      display: grid;
      grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
      gap: 60px;
      align-items: start;
      width: 100%;
      box-sizing: border-box;
    }
    .gallery-col {
      position: sticky;
      top: 104px;
      min-width: 0;
      width: 100%;
    }
    .main-img-card {
      position: relative;
      width: 100%;
      aspect-ratio: 4 / 5;
      border-radius: 16px;
      border: none !important;
      background: var(--bg-alt);
      box-shadow: 0 20px 50px rgba(10, 10, 16, 0.08);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .main-img-card img {
      width: 100%;
      height: 100%;
      padding: 32px;
      object-fit: contain;
      box-sizing: border-box;
    }
    .product-badge-chip {
      position: absolute;
      top: 16px;
      left: 16px;
      background: #ffffff;
      color: var(--ruby);
      border: none !important;
      border-radius: 8px !important;
      padding: 5px 12px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      box-shadow: 0 4px 14px rgba(10, 10, 16, 0.08);
      z-index: 2;
    }
    .thumbs-strip {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 10px;
      margin-top: 14px;
      width: 100%;
      box-sizing: border-box;
    }
    .thumb-btn {
      aspect-ratio: 1 / 1;
      border-radius: 8px !important;
      border: 1.5px solid var(--border);
      background: #ffffff;
      padding: 4px;
      cursor: pointer;
      overflow: hidden;
      transition: all 0.2s ease;
    }
    .thumb-btn.is-active,
    .thumb-btn:hover {
      border-color: var(--ruby);
      transform: translateY(-2px);
    }
    .thumb-btn img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .details-col {
      padding: 8px 0 0;
      min-width: 0;
      width: 100%;
      box-sizing: border-box;
    }
    .product-kicker { display: none !important; }
    .product-title {
      font-family: var(--serif, 'Cormorant Garamond', Georgia, serif);
      font-size: clamp(34px, 4.2vw, 54px);
      font-weight: 700;
      line-height: 1.08;
      letter-spacing: -0.02em;
      color: var(--ink);
      margin-bottom: 12px;
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    .product-tagline {
      font-size: 16px;
      line-height: 1.6;
      color: var(--ink-2);
      max-width: 52ch;
      margin-bottom: 24px;
    }
    .price-stock-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding-bottom: 20px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
      width: 100%;
      box-sizing: border-box;
    }
    .price-wrap {
      display: flex;
      align-items: baseline;
      gap: 12px;
      flex-wrap: wrap;
    }
    .price-amount {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--ink);
    }
    .price-was {
      font-size: 18px;
      color: var(--muted);
      text-decoration: line-through;
    }
    .price-save-badge {
      background: var(--ruby-light);
      color: var(--ruby);
      font-size: 11px;
      font-weight: 800;
      border-radius: 8px !important;
      padding: 4px 10px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .stock-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border-radius: 8px !important;
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 600;
    }
    .stock-pill.in-stock {
      background: var(--bg-alt);
      color: var(--ink);
    }
    .stock-pill.out-stock {
      background: var(--ruby-light);
      color: var(--ruby);
    }
    .stock-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }
    .variant-block {
      margin-bottom: 24px;
      width: 100%;
      box-sizing: border-box;
    }
    .variant-label-title,
    .section-subheading {
      text-transform: none !important;
      letter-spacing: 0 !important;
      font-size: 13.5px !important;
      font-weight: 700 !important;
      color: var(--ink) !important;
      margin-bottom: 10px !important;
      display: block;
    }
    .variant-pills-row,
    .sizes-pills-row,
    .color-swatches-row {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
      width: 100%;
      box-sizing: border-box;
      min-width: 0;
    }
    .variant-option-pill,
    .size-static-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px !important;
      padding: 9px 16px;
      font-size: 13px;
      font-weight: 600;
      border: 1px solid var(--border);
      background: #ffffff;
      color: var(--ink);
      font-family: inherit;
      cursor: pointer;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }
    .variant-option-pill:hover,
    .size-static-pill:hover {
      border-color: var(--black);
      background: var(--bg-alt);
    }
    .variant-option-pill.is-active,
    .size-static-pill.is-active {
      background: var(--black) !important;
      border-color: var(--black) !important;
      color: #ffffff !important;
    }
    .color-swatch-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px !important;
      border: 2px solid transparent;
      outline: 1px solid rgba(0, 0, 0, 0.12);
      cursor: pointer;
      transition: transform 0.15s ease, outline-color 0.15s ease;
      padding: 0;
      flex-shrink: 0;
    }
    .color-swatch-btn.is-active,
    .color-swatch-btn:hover {
      transform: scale(1.12);
      outline: 2px solid var(--ruby);
      outline-offset: 2px;
    }
    .cta-group {
      display: flex;
      width: 100%;
      max-width: 440px;
      margin-bottom: 28px;
      box-sizing: border-box;
    }
    .btn-order-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      min-height: 48px;
      padding: 12px 24px;
      background: var(--ruby);
      color: #ffffff;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      border: none;
      border-radius: 8px !important;
      box-shadow: 0 10px 24px rgba(192, 17, 47, 0.22);
      transition: all 0.2s ease;
      cursor: pointer;
      box-sizing: border-box;
      text-decoration: none;
    }
    .btn-order-primary:hover {
      background: var(--black);
      box-shadow: 0 12px 28px rgba(10, 10, 16, 0.25);
      transform: translateY(-1px);
    }
    .trust-strip {
      background: var(--bg-alt) !important;
      border: none !important;
      border-radius: 12px !important;
      padding: 18px 20px;
      margin-top: 28px;
      margin-bottom: 8px;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      width: 100%;
      box-sizing: border-box;
    }
    .trust-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 12.5px;
      line-height: 1.5;
      color: var(--ink-2);
      min-width: 0;
      box-sizing: border-box;
    }
    .trust-item + .trust-item {
      border-left: 1px solid rgba(0, 0, 0, 0.06);
      padding-left: 16px;
    }
    .trust-item strong {
      font-size: 13px;
      color: var(--ink);
    }
    .trust-icon {
      color: var(--ruby);
      flex-shrink: 0;
    }
    .product-description-wrap {
      font-size: 15.5px;
      line-height: 1.85;
      color: var(--ink-2);
      max-width: 64ch;
      margin-bottom: 30px;
      width: 100%;
      box-sizing: border-box;
    }
    .product-description-wrap p {
      margin-bottom: 16px;
    }
    .spec-table-wrap {
      border-top: 1px solid var(--border);
      padding-top: 24px;
      width: 100%;
      box-sizing: border-box;
    }
    .spec-row {
      display: grid;
      grid-template-columns: 140px minmax(0, 1fr);
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid var(--border);
      font-size: 13px;
    }
    .spec-row dt { color: var(--muted); }
    .spec-row dd { color: var(--ink); font-weight: 600; }
    /* ── LUXURY SQUIGGLY DIVIDER ── */
    .luxe-divider-wrap {
      width: 100%;
      overflow: hidden;
      line-height: 0;
    }
    .squiggly-svg {
      width: 100%;
      height: 38px;
      display: block;
    }
    .squiggly-echo {
      stroke: rgba(192, 17, 47, 0.14);
      stroke-width: 3px;
    }
    .squiggly-main {
      stroke: var(--ruby);
      stroke-width: 2px;
    }

    /* ── MAIN SITE FOOTER ── */
    .footer {
      background: #ffffff !important;
      padding: 64px 0 36px;
      color: var(--ink) !important;
      border-top: none;
      overflow: hidden;
      width: 100%;
    }
    .section-inner {
      max-width: 1240px;
      margin: 0 auto;
      padding: 0 32px;
      box-sizing: border-box;
      width: 100%;
    }
    .footer-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 56px;
      flex-wrap: wrap;
      gap: 36px;
    }
    .footer-left {
      max-width: 360px;
      width: 100%;
    }
    .footer-right h5, .footer-left h5 {
      font-family: var(--serif, 'Cormorant Garamond', Georgia, serif);
      font-size: 19px;
      margin-bottom: 14px;
      color: var(--ink);
      letter-spacing: -0.01em;
      font-weight: 700;
    }
    .footer-bio {
      font-size: 13.5px;
      color: var(--muted);
      line-height: 1.6;
      margin-bottom: 14px;
      max-width: 320px;
    }
    .footer-stealth-hint {
      font-size: 12px;
      color: var(--muted);
    }
    .footer-stealth-hint kbd {
      background: var(--border-light);
      color: var(--ink);
      border: 1px solid var(--border);
      padding: 2px 7px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
    }
    .footer-right ul {
      display: flex;
      flex-direction: column;
      gap: 10px;
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .footer-right ul a {
      font-size: 13.5px;
      color: var(--muted);
      font-weight: 500;
      text-decoration: none;
      transition: color 0.15s ease;
    }
    .footer-right ul a:hover {
      color: var(--ruby);
    }
    .footer-massive-logo {
      font-family: var(--serif, 'Cormorant Garamond', Georgia, serif);
      font-size: 10.5vw;
      font-weight: 700;
      line-height: 1;
      letter-spacing: -0.04em;
      color: var(--ink);
      text-align: center;
      margin-bottom: 32px;
      width: 100%;
      white-space: nowrap;
    }
    .color-illus-wrap {
      position: absolute;
      z-index: 0;
      pointer-events: none;
      mix-blend-mode: multiply;
      opacity: 0.8;
    }
    .color-illus-wrap img {
      width: 100%;
      height: auto;
      display: block;
      mix-blend-mode: multiply;
    }
    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--border);
      padding-top: 24px;
      font-size: 13px;
      color: var(--muted);
      flex-wrap: wrap;
      gap: 14px;
    }
    .footer-legal {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .policy-legal-link {
      background: none;
      border: none;
      padding: 0;
      font-family: inherit;
      font-size: 13px;
      color: var(--muted);
      font-weight: 500;
      cursor: pointer;
      transition: color 0.15s ease;
    }
    .policy-legal-link:hover {
      color: var(--ruby);
    }
    .legal-dot {
      color: #cbd5e1;
      font-size: 11px;
      user-select: none;
    }
    .age-pill {
      display: inline-block;
      background: var(--ruby-light);
      border: 1px solid #fda4af;
      color: var(--ruby);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .12em;
      padding: 4px 10px;
      border-radius: 8px !important;
    }

    /* ── STORE POLICIES MODAL ── */
    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 2000;
      background: rgba(10, 10, 16, 0.75);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
    }
    .policy-modal-card {
      background: #ffffff;
      border-radius: 8px !important;
      max-width: 660px;
      width: 100%;
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.22);
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-sizing: border-box;
    }
    .policy-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #f1f5f9;
    }
    .policy-modal-eyebrow {
      display: block;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--ruby);
      font-weight: 700;
      margin-bottom: 2px;
    }
    .policy-modal-title {
      font-family: var(--serif, 'Cormorant Garamond', Georgia, serif);
      font-size: 24px;
      color: var(--ink);
      margin: 0;
      font-weight: 700;
    }
    .btn-close-policy {
      background: var(--border-light);
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 8px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--muted);
      font-size: 16px;
      transition: all 0.15s ease;
    }
    .btn-close-policy:hover {
      background: var(--border);
      color: var(--ink);
    }
    .policy-tabs {
      display: flex;
      border-bottom: 1px solid #f1f5f9;
      background: #fafafa;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .policy-tab {
      padding: 12px 18px;
      border: none;
      background: none;
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      color: var(--muted);
      cursor: pointer;
      white-space: nowrap;
      border-bottom: 2px solid transparent;
      transition: all 0.15s ease;
    }
    .policy-tab.active {
      color: var(--ruby);
      border-bottom-color: var(--ruby);
      background: #ffffff;
    }
    .policy-content-body {
      padding: 24px;
      overflow-y: auto;
      max-height: calc(88vh - 140px);
      font-size: 13.5px;
      line-height: 1.65;
      color: #3f3f46;
    }
    .policy-panel {
      display: none;
    }
    .policy-panel.active {
      display: block;
    }
    .policy-panel h4 {
      font-family: var(--serif, 'Cormorant Garamond', Georgia, serif);
      font-size: 20px;
      color: var(--ink);
      margin-bottom: 10px;
    }
    .policy-intro {
      margin-bottom: 18px;
      color: #52525b;
    }
    .policy-item {
      margin-bottom: 18px;
    }
    .policy-item h5 {
      font-size: 13.5px;
      font-weight: 700;
      color: var(--ink);
      margin-bottom: 4px;
    }
    .policy-item p {
      color: #52525b;
      margin: 0;
    }
    .policy-modal-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: #fafafa;
      border-top: 1px solid #f1f5f9;
      font-size: 13px;
      color: var(--muted);
    }
    .policy-modal-footer .btn-modal-wa {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--black);
      color: #ffffff;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 8px !important;
      text-decoration: none;
      transition: background 0.15s ease;
    }
    .policy-modal-footer .btn-modal-wa:hover {
      background: var(--ruby);
    }

    /* ── MOBILE RESPONSIVE ALIGNMENT FIXES (TABLET & PHONE) ── */
    @media (max-width: 860px) {
      body {
        padding-top: 96px !important;
      }
      .stealth-esc-hint {
        display: none !important;
      }
      .floating-back-shop {
        bottom: 18px !important;
        right: 14px !important;
        left: auto !important;
        padding: 7px 13px !important;
        font-size: 11px !important;
      }

      /* Separate Breadcrumbs on Mobile (Spaced Comfortably Above Product) */
      .product-breadcrumbs {
        margin: 6px 0 16px !important;
        padding: 0 !important;
        font-size: 11.5px !important;
        line-height: 1.5 !important;
        gap: 4px 6px !important;
      }
      .crumb-active {
        max-width: 100% !important;
        white-space: normal !important;
        word-break: break-word !important;
      }
      .product-page-main {
        padding: 0 16px 48px !important;
        width: 100% !important;
      }
      .product-layout {
        display: flex !important;
        flex-direction: column !important;
        gap: 20px !important;
        width: 100% !important;
      }
      .gallery-col {
        position: static !important;
        width: 100% !important;
        max-width: 100% !important;
      }
      .main-img-card {
        aspect-ratio: 1 / 1 !important;
        border-radius: 14px !important;
        width: 100% !important;
        box-shadow: 0 10px 30px rgba(10, 10, 16, 0.06) !important;
      }
      .main-img-card img {
        padding: 18px !important;
      }
      .thumbs-strip {
        display: flex !important;
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch !important;
        gap: 8px !important;
        margin-top: 10px !important;
        padding-bottom: 4px !important;
        scrollbar-width: none !important;
        width: 100% !important;
      }
      .thumbs-strip::-webkit-scrollbar {
        display: none !important;
      }
      .thumb-btn {
        flex: 0 0 60px !important;
        width: 60px !important;
        height: 60px !important;
      }
      .details-col {
        padding-top: 0 !important;
        width: 100% !important;
      }
      .product-title {
        font-size: clamp(26px, 6.8vw, 36px) !important;
        line-height: 1.15 !important;
        margin-bottom: 8px !important;
      }
      .product-tagline {
        font-size: 14.5px !important;
        line-height: 1.55 !important;
        margin-bottom: 18px !important;
      }
      .price-stock-box {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 8px !important;
        padding-bottom: 16px !important;
        margin-bottom: 20px !important;
      }
      .price-amount {
        font-size: 30px !important;
      }
      .cta-group {
        max-width: 100% !important;
        margin-bottom: 22px !important;
      }
      .btn-order-primary {
        width: 100% !important;
        min-height: 48px !important;
        font-size: 13px !important;
      }
      .trust-strip {
        display: flex !important;
        flex-direction: column !important;
        gap: 12px !important;
        padding: 14px 16px !important;
        margin-top: 24px !important;
        margin-bottom: 8px !important;
      }
      .trust-item {
        flex-direction: row !important;
        align-items: flex-start !important;
        gap: 10px !important;
      }
      .trust-item + .trust-item {
        border-left: none !important;
        border-top: 1px solid rgba(0, 0, 0, 0.06) !important;
        padding-left: 0 !important;
        padding-top: 12px !important;
      }
      .product-description-wrap {
        font-size: 14px !important;
        line-height: 1.7 !important;
        margin-bottom: 22px !important;
      }
      .spec-table-wrap {
        padding-top: 18px !important;
      }
      .spec-row {
        grid-template-columns: 110px minmax(0, 1fr) !important;
        gap: 10px !important;
        padding: 9px 0 !important;
        font-size: 12px !important;
      }
    }

    @media (max-width: 480px) {
      .product-title {
        font-size: 26px !important;
      }
      .price-amount {
        font-size: 26px !important;
      }
      .main-img-card img {
        padding: 14px !important;
      }
      .btn-order-primary {
        min-height: 46px !important;
        padding: 11px 16px !important;
        font-size: 12px !important;
      }
      .spec-row {
        grid-template-columns: 95px minmax(0, 1fr) !important;
      }
    }

    @media (max-width: 640px) {
      .footer {
        padding: 44px 0 28px !important;
      }
      .footer-top {
        flex-direction: column !important;
        gap: 28px !important;
        margin-bottom: 36px !important;
      }
      .footer-right h5, .footer-left h5 {
        font-size: 17px !important;
        margin-bottom: 10px !important;
      }
      .footer-right ul {
        gap: 9px !important;
      }
      .footer-right ul a {
        font-size: 13px !important;
      }
      .footer-bottom {
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 12px !important;
        padding-top: 20px !important;
      }
      .footer-legal {
        gap: 8px 10px !important;
      }
      .policy-modal-card {
        max-height: 92vh !important;
        width: 100% !important;
      }
      .policy-modal-header {
        padding: 16px 18px !important;
      }
      .policy-content-body {
        padding: 18px !important;
      }
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
        <button type="button" id="btn-cart-nav" class="btn-icon-nav mobile-nav-cart-btn" aria-label="Cart" title="Cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <span class="mobile-cart-badge" id="mobile-cart-badge" style="display: none;">0</span>
        </button>
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
      <button id="btn-install-dropdown" class="dropdown-link btn-install-trigger nav-closer">
        <span>Install App</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </button>
    </div>
  </header>

  <!-- FLOATING BACK TO SHOP BUTTON (STANDALONE PILL) -->
  <a href="/products.html" class="floating-back-shop" aria-label="Back to Shop">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
    <span>Back to Shop</span>
  </a>

  <!-- MAIN PRODUCT SECTION -->
  <main class="product-page-main">
    <!-- PRODUCT BREADCRUMBS (SEPARATE FROM BACK-TO-SHOP) -->
    <nav class="breadcrumbs product-breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Home</a>
      <span class="crumb-slash">/</span>
      <a href="/products.html">Shop</a>
      <span class="crumb-slash">/</span>
      <a href="/products.html?cat=${encodeURIComponent(category)}">${escapeHtml(categoryLabel)}</a>
      <span class="crumb-slash">/</span>
      <span class="crumb-active">${escapeHtml(title)}</span>
    </nav>

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
          ${!inStock ? `<div class="stock-pill out-stock">
            <span class="stock-dot"></span>
            <span>Currently unavailable</span>
          </div>` : ''}
        </div>

        ${variantsHtml}
        ${sizesHtml}

        <div class="cta-group">
          <button type="button" class="btn-order-primary" id="btn-order-primary"
            data-id="${escapeHtml(id)}"
            data-base-id="${escapeHtml(id)}"
            data-title="${escapeHtml(title)}"
            data-price="${price}"
            data-img="${escapeHtml(primaryImage)}"
            data-category="${escapeHtml(categoryLabel)}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span id="btn-primary-text">Add to Bag</span>
          </button>
        </div>

        <div class="product-description-wrap">
          ${descriptionParagraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
        </div>

        ${specsHtml}

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
      </div>
    </div>
  </main>

  <!-- ===== SQUIGGLY DIVIDER ===== -->
  <div class="luxe-divider-wrap" aria-hidden="true" style="margin-top: 48px; margin-bottom: -1px;">
    <svg class="squiggly-svg" viewBox="0 0 1440 72" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path class="squiggly-echo" d="M 0 36 C 26.7 48.8, 76.1 23.2, 102.9 36 C 129.6 50.4, 179.0 21.6, 205.7 36 C 232.5 51.8, 281.8 20.2, 308.6 36 C 335.3 53.1, 384.7 18.9, 411.4 36 C 438.2 54.1, 487.5 17.9, 514.3 36 C 541.0 54.8, 590.4 17.2, 617.1 36 C 643.9 55.2, 693.3 16.8, 720.0 36 C 746.7 55.2, 796.1 16.8, 822.9 36 C 849.6 54.8, 899.0 17.2, 925.7 36 C 952.5 54.1, 1001.8 17.9, 1028.6 36 C 1055.3 53.1, 1104.7 18.9, 1131.4 36 C 1158.2 51.8, 1207.5 20.2, 1234.3 36 C 1261.0 50.4, 1310.4 21.6, 1337.1 36 C 1363.9 48.8, 1413.3 23.2, 1440.0 36" />
      <path class="squiggly-main" d="M 0 36 C 28.8 16.8, 74.1 55.2, 102.9 36 C 131.7 14.4, 176.9 57.6, 205.7 36 C 234.5 12.3, 279.8 59.7, 308.6 36 C 337.4 10.4, 382.6 61.6, 411.4 36 C 440.2 8.9, 485.5 63.1, 514.3 36 C 543.1 7.8, 588.3 64.2, 617.1 36 C 645.9 7.3, 691.2 64.7, 720.0 36 C 748.8 7.3, 794.1 64.7, 822.9 36 C 851.7 7.8, 896.9 64.2, 925.7 36 C 954.5 8.9, 999.8 63.1, 1028.6 36 C 1057.4 10.4, 1102.6 61.6, 1131.4 36 C 1160.2 12.3, 1205.5 59.7, 1234.3 36 C 1263.1 14.4, 1308.3 57.6, 1337.1 36 C 1365.9 16.8, 1411.2 55.2, 1440.0 36" />
    </svg>
  </div>

  <!-- ===== MAIN SITE FOOTER ===== -->
  <footer class="footer" style="background: #ffffff !important; color: var(--ink) !important;">
    <div class="section-inner">
      <div class="footer-top">
        <div class="footer-left">
          <h5>TheToysVirago</h5>
          <p class="footer-bio">Curated intimate wellness pieces for unfiltered pleasure.</p>
          <div class="footer-stealth-hint">
            Privacy shield: <kbd id="footer-stealth-trigger">Esc</kbd> or <kbd id="footer-stealth-trigger-tap">double-tap</kbd>
          </div>
        </div>

        <div class="footer-right">
          <h5>Holla At Us</h5>
          <ul>
            <li><a href="https://wa.me/2348036514814" target="_blank" rel="noopener">WhatsApp (08036514814)</a></li>
            <li><a href="https://x.com/thetoysvirago" target="_blank" rel="noopener">X (@thetoysvirago)</a></li>
            <li><a href="/products.html">Shop All Products</a></li>
            <li><a href="/blog.html">The Pleasure Journal</a></li>
            <li><a href="/index.html#faq">FAQ</a></li>
            <li><a href="/admin.html" style="color: rgba(12, 12, 14, 0.45); font-size: 13px;">Admin Vault</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-massive-logo" style="position: relative;">
        <div class="color-illus-wrap" style="width: 17vw; left: 8%; top: -75%; transform: rotate(-35deg);"><img src="/assets/illus-1.webp" alt="Wand vibrator" loading="lazy" decoding="async" /></div>
        <div class="color-illus-wrap" style="width: 15vw; left: 32%; top: -95%; transform: rotate(15deg) scaleX(-1);"><img src="/assets/illus-2.webp" alt="Rabbit vibrator" loading="lazy" decoding="async" /></div>
        <div class="color-illus-wrap" style="width: 16vw; left: 56%; top: -75%; transform: rotate(-15deg);"><img src="/assets/illus-3.webp" alt="Rose suction toy" loading="lazy" decoding="async" /></div>
        <div class="color-illus-wrap" style="width: 17vw; right: 8%; top: -70%; transform: rotate(35deg);"><img src="/assets/illus-4.webp" alt="Arc vibrator" loading="lazy" decoding="async" /></div>
        <span style="position: relative; z-index: 1;">THETOYSVIRAGO.</span>
      </div>

      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} TheToysVirago.</p>
        <div class="footer-legal">
          <button type="button" class="policy-legal-link" data-policy="terms">Terms</button>
          <span class="legal-dot">&bull;</span>
          <button type="button" class="policy-legal-link" data-policy="shipping">Shipping</button>
          <span class="legal-dot">&bull;</span>
          <button type="button" class="policy-legal-link" data-policy="returns">Returns</button>
          <span class="legal-dot">&bull;</span>
          <button type="button" class="policy-legal-link" data-policy="refunds">Refunds</button>
          <span class="age-pill">18+ Only</span>
        </div>
      </div>
    </div>
  </footer>

  <div id="cart-drawer-overlay" class="drawer-overlay" hidden>
    <aside class="cart-drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-label="Cart">
      <div class="drawer-header">
        <div>
          <h3 class="drawer-title">Your Bag</h3>
          <span class="drawer-count" id="drawer-items-count">(0 items)</span>
        </div>
        <button id="btn-close-cart" class="btn-close-drawer">✕</button>
      </div>
      <div class="drawer-items" id="drawer-items">
        <div class="empty-cart-state">
          <div class="empty-glow-orbit">
            <div class="empty-icon-halo">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 12C5.2 15 5.2 21 7 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4" />
                <path d="M10 9C7.8 13 7.8 23 10 27" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.85" />
                <path d="M26 9C28.2 13 28.2 23 26 27" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.85" />
                <path d="M29 12C30.8 15 30.8 21 29 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4" />
                <path d="M18 4.5C15.5 4.5 13.5 6.8 13.5 10V23C13.5 26.5 15.5 29.5 18 29.5C20.5 29.5 22.5 26.5 22.5 23V10C22.5 6.8 20.5 4.5 18 4.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                <path d="M14.5 11C16.5 9.5 19.5 9.5 21.5 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.6" />
                <circle cx="18" cy="19.5" r="1.8" fill="currentColor" />
                <line x1="15.5" y1="25.5" x2="20.5" y2="25.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.6" />
              </svg>
            </div>
          </div>

          <h3 class="empty-state-title">Nothing to buzz about.</h3>
          <p class="empty-state-sub">Let's give your bag some good vibrations.</p>

          <a href="/products.html" class="btn btn-black btn-lg empty-shop-cta" onclick="window.closeCartDrawer();">
            <span>Find Your Buzz &rarr;</span>
          </a>
        </div>
      </div>

      <div class="drawer-foot" id="drawer-footer" style="display: none;">
        <div class="promo-row">
          <input type="text" id="promo-input" placeholder="Promo code (inactive)" class="input-field" disabled style="opacity: 0.55; cursor: not-allowed; background: #f8fafc;" />
          <button id="btn-apply-promo" class="btn-promo" disabled style="opacity: 0.55; cursor: not-allowed; pointer-events: none;">Apply</button>
        </div>
        <div id="promo-feedback" class="promo-msg" hidden></div>

        <button type="button" id="btn-toggle-cart-details" class="cart-collapse-toggle" aria-expanded="false" aria-controls="cart-collapsible-details">
          <div class="collapse-toggle-left">
            <span class="collapse-toggle-title">Subtotal &amp; Delivery Details</span>
            <span class="collapse-toggle-hint">Tap to view</span>
          </div>
          <div class="collapse-toggle-right">
            <span class="collapse-total-peek" id="cart-total-peek">₦0</span>
            <svg class="collapse-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </button>

        <div id="cart-collapsible-details" class="cart-collapsible-details">
          <div class="cart-lines">
            <div class="cart-line"><span>Subtotal</span><span id="cart-subtotal">₦0</span></div>
            <div class="cart-line" id="cart-discount-row" hidden><span>Discount (15%)</span><span id="cart-discount" class="green-txt">-₦0</span></div>
            <div class="cart-line"><span>Delivery</span><span id="cart-shipping" class="green-txt">Calculated at checkout</span></div>
            <div class="cart-line total-line"><span>Total</span><span id="cart-total" class="ruby-txt">₦0</span></div>
          </div>

          <div class="delivery-timeline-card in-drawer">
            <div class="deliv-line">
              <span class="deliv-line-left"><span class="deliv-dot"></span>Within Lagos</span>
              <span class="deliv-line-val">Same or next business day</span>
            </div>
            <div class="deliv-line">
              <span class="deliv-line-left"><span class="deliv-dot deliv-dot-amber"></span>Outside Lagos</span>
              <span class="deliv-line-val">1 - 5 business days</span>
            </div>
            <div class="deliv-discreet-footer">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span>Ships discreetly in a plain courier bag</span>
            </div>
          </div>
        </div>

        <div class="cart-gift-note-wrap" id="cart-gift-note-wrap">
          <button type="button" class="btn-toggle-gift-note" id="btn-toggle-gift-note" aria-expanded="false">
            <span class="gift-toggle-left">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
              <span>Add a free discreet gift note</span>
            </span>
            <span class="gift-toggle-action" id="gift-note-toggle-txt">+ Add</span>
          </button>
          <div class="cart-gift-note-input-wrap" id="cart-gift-note-input-wrap" style="display: none;">
            <textarea id="cart-gift-note-text" placeholder="Write your note here... (leave sender blank for anonymous gifts)" maxlength="250" rows="3"></textarea>
            <div class="gift-note-footer">
              <span class="gift-note-char-count" id="gift-note-chars">0 / 250</span>
              <span class="gift-note-hint-txt">Confidential handwritten card included</span>
            </div>
          </div>
        </div>

        <button id="btn-checkout" class="btn btn-black btn-block btn-lg" style="border-radius: 8px !important;">
          Checkout
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </aside>
  </div>

  <!-- ===== STORE POLICIES MODAL ===== -->
  <div id="policy-modal" class="modal-overlay" hidden style="display: none;">
    <div class="policy-modal-card" role="dialog" aria-modal="true" aria-labelledby="policy-modal-title">
      <div class="policy-modal-header">
        <div>
          <span class="policy-modal-eyebrow">Customer Care</span>
          <h3 id="policy-modal-title" class="policy-modal-title">Store Policies</h3>
        </div>
        <button type="button" id="btn-close-policy" class="btn-close-policy" aria-label="Close policies modal">&times;</button>
      </div>

      <!-- Policy Navigation Tabs -->
      <div class="policy-tabs" role="tablist">
        <button type="button" class="policy-tab active" data-tab="terms" role="tab" aria-selected="true">Terms &amp; Conditions</button>
        <button type="button" class="policy-tab" data-tab="shipping" role="tab" aria-selected="false">Shipping Policy</button>
        <button type="button" class="policy-tab" data-tab="returns" role="tab" aria-selected="false">Returns Policy</button>
        <button type="button" class="policy-tab" data-tab="refunds" role="tab" aria-selected="false">Refund Policy</button>
      </div>

      <!-- Policy Content Panels -->
      <div class="policy-content-body">
        <!-- Panel 1: Terms & Conditions -->
        <div id="policy-panel-terms" class="policy-panel active">
          <h4>Terms &amp; Conditions</h4>
          <p class="policy-intro">By browsing or placing an order on TheToysVirago, you agree to the following straightforward guidelines.</p>
          
          <div class="policy-item">
            <h5>1. Strict 18+ Age Requirement</h5>
            <p>You must be at least 18 years of age to purchase from TheToysVirago or access our collection. By placing an order, you verify under Nigerian law that you are of legal adult age.</p>
          </div>

          <div class="policy-item">
            <h5>2. Discretion &amp; Customer Privacy</h5>
            <p>We treat every client with utmost confidentiality. Your name, delivery address, phone number, and order records are used solely to fulfill your order and confirm payment. We do not sell, rent, or broadcast customer details under any circumstances.</p>
          </div>

          <div class="policy-item">
            <h5>3. Payment &amp; Order Reservation</h5>
            <p>Orders are placed via direct transfer to our verified Moniepoint account or instant online payment. Placed items are temporarily reserved for you for up to 24 hours. If transfer confirmation is not received within this window, the reservation is released so other customers can shop the vault.</p>
          </div>

          <div class="policy-item">
            <h5>4. Product Specifications &amp; Images</h5>
            <p>All items are photographed with care to depict colors and textures accurately. Minor shade variations can happen due to screen calibrations and manufacturing batches, but functional specifications and materials remain strictly as described.</p>
          </div>
        </div>

        <!-- Panel 2: Shipping Policy -->
        <div id="policy-panel-shipping" class="policy-panel">
          <h4>Shipping &amp; Delivery Policy</h4>
          <p class="policy-intro">We take the stress out of adult shopping with rapid dispatch and guaranteed discreet packaging.</p>

          <div class="policy-item">
            <h5>1. 100% Plain, Unmarked Packaging</h5>
            <p>Your package arrives in a thick, completely opaque, tamper-evident courier bag. There are no sex toy mentions, product names, or virago logos visible on the exterior. The courier only sees standard delivery contact details needed to hand you your parcel.</p>
          </div>

          <div class="policy-item">
            <h5>2. Delivery Timeframes</h5>
            <p><strong>Lagos State:</strong> Doorstep delivery on the same day or next business day following payment verification.</p>
            <p><strong>Interstate (Outside Lagos):</strong> 1 to 5 business days depending on transit distance and regional transport schedules.</p>
          </div>

          <div class="policy-item">
            <h5>3. Interstate Delivery Methods</h5>
            <p><strong>Park / Terminal Pickup:</strong> Fixed fee (₦4,000 for Ibadan, ₦5,500 for Northern hubs, ₦4,500 for all other states). You pick up directly from a major transport park or terminal in your city.</p>
            <p><strong>Doorstep Courier:</strong> Direct dispatch to your home or office address through regional express couriers (deposit collected at checkout; balance confirmed via WhatsApp).</p>
          </div>

          <div class="policy-item">
            <h5>4. Color Substitutions</h5>
            <p>If the specific shade you chose is temporarily out of stock when our team packs your order, we may send an alternative shade of the exact same toy so your order is not delayed. If your order requires one specific color only, please let our concierge know on WhatsApp right after placing your order.</p>
          </div>
        </div>

        <!-- Panel 3: Returns Policy -->
        <div id="policy-panel-returns" class="policy-panel">
          <h4>Returns Policy</h4>
          <p class="policy-intro">We want you to be confident in what you receive, while maintaining non-negotiable hygiene standards for intimate products.</p>

          <div class="policy-item">
            <h5>1. 24-Hour Reporting Window</h5>
            <p>If your package arrives damaged in transit or you received an incorrect item, you must lodge a complaint with us within <strong>24 hours of delivery receipt</strong>.</p>
          </div>

          <div class="policy-item">
            <h5>2. Unused &amp; Factory-Sealed Condition</h5>
            <p>Because these are intimate wellness products used on sensitive areas of the body, we can only accept returns for items that are completely unused, unopened, and with all factory seals and hygiene wrapping 100% intact.</p>
          </div>

          <div class="policy-item">
            <h5>3. How to Submit a Return Request</h5>
            <p>Send a direct message to our WhatsApp concierge at <strong>08036514814</strong> with your Order Reference, a short explanation of what went wrong, and clear photos or a short video showing the unopened package and shipping label.</p>
          </div>

          <div class="policy-item">
            <h5>4. Return Inspection</h5>
            <p>Returned parcels are inspected at our hub upon arrival. Items that show signs of opening, broken seals, or missing accessories will not qualify for return or exchange.</p>
          </div>
        </div>

        <!-- Panel 4: Refund Policy -->
        <div id="policy-panel-refunds" class="policy-panel">
          <h4>Refund Policy</h4>
          <p class="policy-intro">Our refund terms are designed to be fair, direct, and protective of personal hygiene.</p>

          <div class="policy-item">
            <h5>1. No Refunds on Used Items</h5>
            <p>Due to intimate hygiene standards and health safety, <strong>any item that has been unsealed, opened, or used cannot be refunded under any circumstances</strong>. Once the protective seal has been broken, the sale is final.</p>
          </div>

          <div class="policy-item">
            <h5>2. When Refunds Are Issued</h5>
            <p>A full refund for the item amount will be issued if:</p>
            <p>&bull; An item you paid for is out of stock before dispatch and you choose not to wait for restock or switch to an alternative.</p>
            <p>&bull; An unused item with intact factory seal is returned within the 24-hour window and approved following inspection.</p>
          </div>

          <div class="policy-item">
            <h5>3. Refund Payout Speed</h5>
            <p>Approved refunds are credited directly to your designated Nigerian bank account within <strong>24 to 48 business hours</strong> after approval.</p>
          </div>

          <div class="policy-item">
            <h5>4. Delivery Fees</h5>
            <p>Delivery charges are paid directly to third-party couriers and transport stations, and are non-refundable once an order has been dispatched from our vault.</p>
          </div>
        </div>
      </div>

      <div class="policy-modal-footer">
        <span>Need help with an order?</span>
        <a href="https://wa.me/2348036514814" target="_blank" rel="noopener" class="btn-modal-wa">Chat on WhatsApp</a>
      </div>
    </div>
  </div>

  <script>
    (function () {
      // 1. Gallery switching
      var mainImg = document.getElementById('main-image');
      var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-gallery-src]'));
      var dots = Array.prototype.slice.call(document.querySelectorAll('.color-swatch-btn'));
      var optionPills = Array.prototype.slice.call(document.querySelectorAll('.variant-option-pill'));
      var priceVal = document.getElementById('product-price-val');
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
          }
          var img = pill.getAttribute('data-img');
          if (img) showImage(img);
        });
      });

      var sizePills = Array.prototype.slice.call(document.querySelectorAll('.size-static-pill'));
      var primaryBtn = document.getElementById('btn-order-primary');
      var primaryBtnText = document.getElementById('btn-primary-text');

      sizePills.forEach(function (pill) {
        pill.addEventListener('click', function () {
          sizePills.forEach(function (p) {
            p.classList.remove('is-active');
            p.setAttribute('aria-pressed', 'false');
          });
          pill.classList.add('is-active');
          pill.setAttribute('aria-pressed', 'true');
        });
      });

      if (primaryBtn) {
        primaryBtn.addEventListener('click', function () {
          var activeSizePill = null;
          var activeOption = null;
          var activeDot = null;
          var i;

          for (i = 0; i < sizePills.length; i += 1) {
            if (sizePills[i].classList.contains('is-active')) {
              activeSizePill = sizePills[i];
              break;
            }
          }
          for (i = 0; i < optionPills.length; i += 1) {
            if (optionPills[i].classList.contains('is-active')) {
              activeOption = optionPills[i];
              break;
            }
          }
          for (i = 0; i < dots.length; i += 1) {
            if (dots[i].classList.contains('is-active')) {
              activeDot = dots[i];
              break;
            }
          }

          var baseId = primaryBtn.getAttribute('data-id') || primaryBtn.getAttribute('data-base-id') || '';
          var baseTitle = primaryBtn.getAttribute('data-title') || '';
          var category = primaryBtn.getAttribute('data-category') || '';
          var defaultPrice = parseFloat(primaryBtn.getAttribute('data-price')) || 0;
          var defaultImg = primaryBtn.getAttribute('data-img') || '';
          var size = activeSizePill ? (activeSizePill.getAttribute('data-size') || activeSizePill.textContent.trim()) : '';
          var color = activeDot ? (activeDot.getAttribute('data-color') || '') : (activeColorLabel ? activeColorLabel.textContent.trim() : '');
          var finishParts = [];

          if (size) finishParts.push(size);
          var variantName = activeOption ? (activeOption.getAttribute('data-name') || '') : '';
          if (variantName && finishParts.indexOf(variantName) === -1) finishParts.push(variantName);
          if (color && finishParts.indexOf(color) === -1) finishParts.push(color);

          var finish = finishParts.join(' · ');
          var price = defaultPrice;
          if (activeOption && activeOption.getAttribute('data-price')) {
            price = parseFloat(activeOption.getAttribute('data-price')) || defaultPrice;
          }
          var img = defaultImg;
          if (activeOption && activeOption.getAttribute('data-img')) {
            img = activeOption.getAttribute('data-img');
          } else if (activeDot && activeDot.getAttribute('data-img')) {
            img = activeDot.getAttribute('data-img');
          }

          var cartId = finish ? baseId + '__' + finish.replace(/\s+/g, '_') : baseId;
          var itemTitle = finish ? baseTitle + ' (' + finish + ')' : baseTitle;
          var cartData = [];
          try {
            var parsedCart = JSON.parse(localStorage.getItem('rouge_noir_cart') || '[]');
            if (Array.isArray(parsedCart)) cartData = parsedCart;
          } catch (err) {}

          var found = false;
          for (i = 0; i < cartData.length; i += 1) {
            if ((cartData[i].cartId || cartData[i].id) === cartId) {
              cartData[i].qty = (cartData[i].qty || 1) + 1;
              found = true;
              break;
            }
          }
          if (!found) {
            cartData.push({
              id: cartId,
              cartId: cartId,
              baseId: baseId,
              title: itemTitle,
              price: price,
              img: img,
              finish: finish,
              size: size,
              color: color,
              category: category,
              qty: 1
            });
          }

          try {
            localStorage.setItem('rouge_noir_cart', JSON.stringify(cartData));
            renderCartDrawer();
            openCartDrawer();
          } catch (err) {}

          if (primaryBtnText) {
            primaryBtnText.textContent = 'Added';
            setTimeout(function () { primaryBtnText.textContent = 'Add to Bag'; }, 1600);
          }
        });
      }

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
      var stealthTriggers = ['btn-stealth-nav', 'footer-stealth-trigger', 'footer-stealth-trigger-tap'];
      function triggerStealth() {
        window.location.replace('https://www.google.com');
      }
      stealthTriggers.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) {
          el.addEventListener('click', function (e) {
            e.preventDefault();
            triggerStealth();
          });
        }
      });

      // Double tap on mobile privacy shield trigger
      var lastTap = 0;
      var tapTrigger = document.getElementById('footer-stealth-trigger-tap');
      if (tapTrigger) {
        tapTrigger.addEventListener('touchend', function (e) {
          var currentTime = new Date().getTime();
          var tapLength = currentTime - lastTap;
          if (tapLength < 500 && tapLength > 0) {
            e.preventDefault();
            triggerStealth();
          }
          lastTap = currentTime;
        });
      }

      // 4. Cart badge count from localStorage
      var cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
      var drawerItemsList = document.getElementById('drawer-items');
      var drawerItemsCount = document.getElementById('drawer-items-count');
      var drawerFooter = document.getElementById('drawer-footer');
      var cartSubtotal = document.getElementById('cart-subtotal');
      var cartTotal = document.getElementById('cart-total');
      var cartTotalPeek = document.getElementById('cart-total-peek');
      var cartDiscountRow = document.getElementById('cart-discount-row');
      var cartDiscount = document.getElementById('cart-discount');
      var cartShipping = document.getElementById('cart-shipping');
      var btnCloseCart = document.getElementById('btn-close-cart');
      var btnCartNav = document.getElementById('btn-cart-nav');
      var btnToggleCartDetails = document.getElementById('btn-toggle-cart-details');
      var cartCollapsibleDetails = document.getElementById('cart-collapsible-details');
      var btnToggleGiftNote = document.getElementById('btn-toggle-gift-note');
      var giftNoteInputWrap = document.getElementById('cart-gift-note-input-wrap');
      var giftNoteToggleTxt = document.getElementById('gift-note-toggle-txt');
      var giftNoteText = document.getElementById('cart-gift-note-text');
      var giftNoteChars = document.getElementById('gift-note-chars');
      var btnCheckout = document.getElementById('btn-checkout');
      var cartItems = [];
      var savedScrollY = 0;
      var isScrollLocked = false;

      function escapeCartHtml(value) {
        return String(value == null ? '' : value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      }

      function readStoredCart() {
        try {
          var parsed = JSON.parse(localStorage.getItem('rouge_noir_cart') || '[]');
          return Array.isArray(parsed) ? parsed : [];
        } catch (err) {
          return [];
        }
      }

      function writeStoredCart(items) {
        try {
          localStorage.setItem('rouge_noir_cart', JSON.stringify(items));
        } catch (err) {}
      }

      function cartMoney(value) {
        return '₦' + Number(value || 0).toLocaleString();
      }

      function cartItemKey(item) {
        return item.cartId || item.id;
      }

      function collapseNavDropdown() {
        var navDrop = document.getElementById('nav-dropdown');
        if (navDrop) {
          navDrop.setAttribute('hidden', '');
          navDrop.hidden = true;
          navDrop.style.display = 'none';
        }
      }

      function updateBodyScrollLock() {
        var modalOverlays = document.querySelectorAll('.modal-overlay, .drawer-overlay');
        var isAnyModalOpen = document.body.classList.contains('cart-open') || document.documentElement.classList.contains('cart-open');
        modalOverlays.forEach(function (el) {
          if (!el.hasAttribute('hidden') && el.style.display !== 'none' && window.getComputedStyle(el).display !== 'none') {
            isAnyModalOpen = true;
          }
        });
        if (isAnyModalOpen) {
          if (!isScrollLocked) {
            savedScrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            isScrollLocked = true;
            document.documentElement.classList.add('modal-open');
            document.body.classList.add('modal-open');
          }
        } else if (isScrollLocked) {
          isScrollLocked = false;
          document.documentElement.classList.remove('modal-open');
          document.body.classList.remove('modal-open');
          window.scrollTo(0, savedScrollY);
        }
      }

      function renderCartDrawer() {
        cartItems = readStoredCart();
        var totalItems = 0;
        cartItems.forEach(function (item) { totalItems += Number(item.qty || 1); });

        document.querySelectorAll('#mobile-cart-badge').forEach(function (el) {
          el.textContent = totalItems;
        });
        document.querySelectorAll('#mobile-cart-badge').forEach(function (el) {
          el.style.display = totalItems > 0 ? 'inline-flex' : 'none';
        });
        if (drawerItemsCount) drawerItemsCount.textContent = '(' + totalItems + ' item' + (totalItems === 1 ? '' : 's') + ')';
        if (!drawerItemsList) return;

        if (!cartItems.length) {
          if (drawerFooter) drawerFooter.style.display = 'none';
          drawerItemsList.innerHTML = '<div class="empty-cart-state">' +
            '<div class="empty-glow-orbit">' +
              '<div class="empty-icon-halo">' +
                '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                  '<path d="M7 12C5.2 15 5.2 21 7 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4" />' +
                  '<path d="M10 9C7.8 13 7.8 23 10 27" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.85" />' +
                  '<path d="M26 9C28.2 13 28.2 23 26 27" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.85" />' +
                  '<path d="M29 12C30.8 15 30.8 21 29 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.4" />' +
                  '<path d="M18 4.5C15.5 4.5 13.5 6.8 13.5 10V23C13.5 26.5 15.5 29.5 18 29.5C20.5 29.5 22.5 26.5 22.5 23V10C22.5 6.8 20.5 4.5 18 4.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />' +
                  '<path d="M14.5 11C16.5 9.5 19.5 9.5 21.5 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.6" />' +
                  '<circle cx="18" cy="19.5" r="1.8" fill="currentColor" />' +
                  '<line x1="15.5" y1="25.5" x2="20.5" y2="25.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity="0.6" />' +
                '</svg>' +
              '</div>' +
            '</div>' +
            '<h3 class="empty-state-title">Nothing to buzz about.</h3>' +
            '<p class="empty-state-sub">Let\\'s give your bag some good vibrations.</p>' +
            '<a href="/products.html" class="btn btn-black btn-lg empty-shop-cta" onclick="window.closeCartDrawer();">' +
              '<span>Find Your Buzz &rarr;</span>' +
            '</a>' +
          '</div>';
          return;
        }

        if (drawerFooter) drawerFooter.style.display = 'block';
        drawerItemsList.innerHTML = cartItems.map(function (item) {
          var key = escapeCartHtml(cartItemKey(item));
          return '<div class="cart-item">' +
            '<img src="' + escapeCartHtml(item.img || '') + '" alt="' + escapeCartHtml(item.title || '') + '" class="cart-item-img" />' +
            '<div class="cart-item-details">' +
              '<h4 class="cart-item-name">' + escapeCartHtml(item.title || '') + '</h4>' +
              '<div class="cart-item-price">' + cartMoney(Number(item.price || 0) * Number(item.qty || 1)) + '</div>' +
              '<div class="cart-item-ctrls">' +
                '<div class="qty-stepper">' +
                  '<button class="qty-btn" onclick="window.cartUpdateQty(\\\'' + key + '\\\', -1)">-</button>' +
                  '<span class="qty-val">' + Number(item.qty || 1) + '</span>' +
                  '<button class="qty-btn" onclick="window.cartUpdateQty(\\\'' + key + '\\\', 1)">+</button>' +
                '</div>' +
                '<button class="btn-remove-item" onclick="window.cartRemove(\\\'' + key + '\\\')">Remove</button>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('');

        var rawSubtotal = cartItems.reduce(function (sum, item) { return sum + Number(item.price || 0) * Number(item.qty || 1); }, 0);
        if (cartSubtotal) cartSubtotal.textContent = cartMoney(rawSubtotal);
        if (cartDiscountRow) cartDiscountRow.hidden = true;
        if (cartDiscount) cartDiscount.textContent = '-₦0';
        if (cartTotal) cartTotal.textContent = cartMoney(rawSubtotal);
        if (cartTotalPeek) cartTotalPeek.textContent = cartMoney(rawSubtotal);
        if (cartShipping) cartShipping.textContent = 'Calculated at checkout';
      }

      function saveCart() {
        writeStoredCart(cartItems);
        renderCartDrawer();
      }

      function updateItemQty(id, delta) {
        var items = readStoredCart();
        for (var i = 0; i < items.length; i += 1) {
          if ((items[i].cartId || items[i].id) === id) {
            items[i].qty = Number(items[i].qty || 1) + delta;
            if (items[i].qty <= 0) items.splice(i, 1);
            break;
          }
        }
        cartItems = items;
        saveCart();
      }

      function removeItem(id) {
        cartItems = readStoredCart().filter(function (item) { return (item.cartId || item.id) !== id; });
        saveCart();
      }

      function openCartDrawer() {
        renderCartDrawer();
        document.body.classList.add('cart-open');
        document.documentElement.classList.add('cart-open');
        var mainHeader = document.getElementById('main-header');
        if (mainHeader) mainHeader.classList.add('nav-collapsed');
        collapseNavDropdown();
        if (cartDrawerOverlay) {
          cartDrawerOverlay.removeAttribute('hidden');
          cartDrawerOverlay.style.display = 'flex';
        }
        updateBodyScrollLock();
      }

      function closeCartDrawer() {
        document.body.classList.remove('cart-open');
        document.documentElement.classList.remove('cart-open');
        var mainHeader = document.getElementById('main-header');
        if (mainHeader) mainHeader.classList.remove('nav-collapsed');
        if (cartDrawerOverlay) {
          cartDrawerOverlay.setAttribute('hidden', '');
          cartDrawerOverlay.style.display = 'none';
        }
        updateBodyScrollLock();
      }

      window.closeCartDrawer = closeCartDrawer;
      window.cartUpdateQty = updateItemQty;
      window.cartRemove = removeItem;

      if (btnCartNav) {
        btnCartNav.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          openCartDrawer();
        });
      }

      if (btnCloseCart) btnCloseCart.addEventListener('click', closeCartDrawer);

      if (cartDrawerOverlay) {
        cartDrawerOverlay.addEventListener('click', function (e) {
          if (e.target === cartDrawerOverlay) closeCartDrawer();
        });
      }

      if (btnToggleCartDetails && cartCollapsibleDetails) {
        btnToggleCartDetails.addEventListener('click', function () {
          var isExpanded = btnToggleCartDetails.getAttribute('aria-expanded') === 'true';
          if (isExpanded) {
            btnToggleCartDetails.setAttribute('aria-expanded', 'false');
            cartCollapsibleDetails.classList.remove('is-expanded');
            var hint = btnToggleCartDetails.querySelector('.collapse-toggle-hint');
            if (hint) hint.textContent = 'Tap to view';
          } else {
            btnToggleCartDetails.setAttribute('aria-expanded', 'true');
            cartCollapsibleDetails.classList.add('is-expanded');
            var hint = btnToggleCartDetails.querySelector('.collapse-toggle-hint');
            if (hint) hint.textContent = 'Tap to hide';
          }
        });
      }

      if (btnToggleGiftNote && giftNoteInputWrap) {
        var savedNote = localStorage.getItem('ttv_gift_note') || '';
        if (savedNote && giftNoteText) {
          giftNoteText.value = savedNote;
          giftNoteInputWrap.style.display = 'block';
          if (giftNoteToggleTxt) giftNoteToggleTxt.textContent = '✓ Added';
          if (giftNoteChars) giftNoteChars.textContent = savedNote.length + ' / 250';
          btnToggleGiftNote.setAttribute('aria-expanded', 'true');
        }

        btnToggleGiftNote.addEventListener('click', function (e) {
          e.preventDefault();
          var isHidden = giftNoteInputWrap.style.display === 'none' || !giftNoteInputWrap.style.display;
          if (isHidden) {
            giftNoteInputWrap.style.display = 'block';
            btnToggleGiftNote.setAttribute('aria-expanded', 'true');
            if (giftNoteText) giftNoteText.focus();
            if (giftNoteToggleTxt) giftNoteToggleTxt.textContent = giftNoteText && giftNoteText.value ? '✓ Added' : '- Close';
          } else {
            giftNoteInputWrap.style.display = 'none';
            btnToggleGiftNote.setAttribute('aria-expanded', 'false');
            if (giftNoteToggleTxt) giftNoteToggleTxt.textContent = giftNoteText && giftNoteText.value ? '✓ Added' : '+ Add';
          }
        });
      }

      if (giftNoteText && giftNoteChars) {
        giftNoteText.addEventListener('input', function () {
          var val = giftNoteText.value;
          try { localStorage.setItem('ttv_gift_note', val); } catch (err) {}
          giftNoteChars.textContent = val.length + ' / 250';
          if (giftNoteToggleTxt) giftNoteToggleTxt.textContent = val.trim() ? '✓ Added' : '+ Add';
        });
      }

      if (btnCheckout) {
        btnCheckout.addEventListener('click', function (e) {
          e.preventDefault();
          window.location.href = '/products.html?checkout=open';
        });
      }

      new MutationObserver(updateBodyScrollLock).observe(document.body, {
        attributes: true,
        subtree: true,
        attributeFilter: ['style', 'hidden', 'class']
      });

      renderCartDrawer();
      updateBodyScrollLock();

      // 5. Store Policies Modal Logic
      var policyModal = document.getElementById('policy-modal');
      var btnClosePolicy = document.getElementById('btn-close-policy');
      var policyTabs = Array.prototype.slice.call(document.querySelectorAll('.policy-tab'));
      var policyPanels = Array.prototype.slice.call(document.querySelectorAll('.policy-panel'));
      var policyTriggers = Array.prototype.slice.call(document.querySelectorAll('.policy-legal-link'));

      function openPolicy(tabKey) {
        if (!policyModal) return;
        var key = tabKey || 'terms';
        policyTabs.forEach(function (tab) {
          var isActive = tab.getAttribute('data-tab') === key;
          tab.classList.toggle('active', isActive);
          tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        policyPanels.forEach(function (panel) {
          panel.classList.toggle('active', panel.id === 'policy-panel-' + key);
        });
        policyModal.removeAttribute('hidden');
        policyModal.style.display = 'flex';
      }

      function closePolicy() {
        if (!policyModal) return;
        policyModal.setAttribute('hidden', '');
        policyModal.style.display = 'none';
      }

      policyTriggers.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var tab = btn.getAttribute('data-policy') || 'terms';
          openPolicy(tab);
        });
      });

      if (btnClosePolicy) {
        btnClosePolicy.addEventListener('click', closePolicy);
      }

      if (policyModal) {
        policyModal.addEventListener('click', function (e) {
          if (e.target === policyModal) closePolicy();
        });
      }

      policyTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          openPolicy(tab.getAttribute('data-tab'));
        });
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          if (cartDrawerOverlay && !cartDrawerOverlay.hasAttribute('hidden') && cartDrawerOverlay.style.display !== 'none') {
            closeCartDrawer();
          } else if (policyModal && !policyModal.hasAttribute('hidden') && policyModal.style.display !== 'none') {
            closePolicy();
          } else {
            triggerStealth();
          }
        }
      });
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
      color: var(--ink);
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
      color: var(--muted);
      margin: 0 0 24px;
      font-size: 15px;
    }
    a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 8px !important;
      background: var(--black);
      color: #ffffff;
      text-decoration: none;
      font-weight: 600;
      font-size: 13px;
      letter-spacing: 0.04em;
      transition: background 0.2s;
    }
    a:hover {
      background: var(--ruby);
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
