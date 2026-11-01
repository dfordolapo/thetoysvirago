const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

// 1. Upgrade bundle images to WebP
html = html.replace(/\/assets\/bundle-solo-kit\.jpg/g, '/assets/bundle-solo-kit.webp');
html = html.replace(/\/assets\/bundle-couples-kit\.jpg/g, '/assets/bundle-couples-kit.webp');
html = html.replace(/\/assets\/bundle-seduction-kit\.jpg/g, '/assets/bundle-seduction-kit.webp');

// 2. Upgrade other images to WebP
html = html.replace(/\/assets\/gift-single-friend\.jpg/g, '/assets/gift-single-friend.webp');
html = html.replace(/\/assets\/10pc-bdsm-1\.jpg/g, '/assets/10pc-bdsm-1.webp');
html = html.replace(/\/assets\/product-wand\.jpg/g, '/assets/product-wand.webp');

// 3. Upgrade blog preview images to WebP
html = html.replace(/\/assets\/blog\/article-discreet-delivery\.jpg/g, '/assets/blog/article-discreet-delivery.webp');
html = html.replace(/\/assets\/blog\/article-first-timer\.jpg/g, '/assets/blog/article-first-timer.webp');
html = html.replace(/\/assets\/blog\/article-wellness-lube\.jpg/g, '/assets/blog/article-wellness-lube.webp');

// 4. Clean attribute injection for <img> tags
html = html.replace(/<img\s+([^>]+?)(\/?)>/gi, (match, attrs, selfClose) => {
  let a = attrs.trim();
  // Ensure decoding="async"
  if (!/decoding\s*=/i.test(a)) {
    a += ' decoding="async"';
  }
  // If not eager, ensure loading="lazy"
  if (!/loading\s*=/i.test(a)) {
    a += ' loading="lazy"';
  }
  return `<img ${a} />`;
});

// 5. Optimize Hero Image for instant LCP (fetchpriority high, width & height to eliminate CLS)
html = html.replace(/<img\s+src="\/assets\/hero-collection\.webp"[^>]*\/>/i,
  '<img src="/assets/hero-collection.webp" alt="Premium intimate devices and wellness collection" class="hero-img" id="hero-img" fetchpriority="high" loading="eager" decoding="async" width="600" height="400" />');

// 6. Preload LCP hero image in <head> for blazing speed
if (!html.includes('rel="preload" as="image" href="/assets/hero-collection.webp"')) {
  html = html.replace('<!-- Open Graph / Social Sharing',
    '<link rel="preload" as="image" href="/assets/hero-collection.webp" type="image/webp" fetchpriority="high" />\n  <!-- Open Graph / Social Sharing');
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('Successfully optimized index.html images!');
