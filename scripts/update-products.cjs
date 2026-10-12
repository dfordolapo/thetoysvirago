/**
 * update-products.cjs
 * Applies all product changes from user request to products.html
 * Run from the workspace root: node scripts/update-products.cjs
 */

const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '..', 'products.html');

let html = fs.readFileSync(filePath, 'utf8');
const original = html;

// ===================================================
// HELPERS
// ===================================================

function escRe(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Set price display + data-price on add to cart button
function setPrice(dataId, priceDisplay, priceNum) {
  // Update product-price span (greedy match between data-id and next </span> after product-price)
  html = html.replace(
    new RegExp(`(data-id="${escRe(dataId)}"[\\s\\S]{0,2000}?class="product-price">)[^<]*(</span>)`),
    `$1${priceDisplay}$2`
  );
  // Update data-price in add-to-cart button
  if (priceNum !== null) {
    html = html.replace(
      new RegExp(`(<button[^>]*btn-add-cart[^>]*data-id="${escRe(dataId)}"[^>]*data-price=")[^"]*(")`),
      `$1${priceNum}$2`
    );
    // Also handle reversed attribute order
    html = html.replace(
      new RegExp(`(<button[^>]*data-id="${escRe(dataId)}"[^>]*data-price=")[^"]*(")`),
      `$1${priceNum}$2`
    );
  }
}

// Rename product display name everywhere
function renameProduct(dataId, oldName, newName) {
  html = html.replace(
    new RegExp(`(<h3 class="product-name">)${escRe(oldName)}(</h3>)`, 'g'),
    `$1${newName}$2`
  );
  html = html.replace(
    new RegExp(`(data-title="${escRe(oldName)}")`, 'g'),
    `data-title="${newName}"`
  );
  html = html.replace(
    new RegExp(`(alt="${escRe(oldName)}")`, 'g'),
    `alt="${newName}"`
  );
}

// Mark product unavailable - change btn-add-cart to disabled button
function markUnavailable(dataId) {
  // Match the btn-add-cart button for this product
  html = html.replace(
    new RegExp(
      `<button class="btn btn-black btn-block btn-add-cart"\\s*\\n?\\s*data-id="${escRe(dataId)}"[^>]*>[\\s\\S]*?Add to Bag[\\s\\S]*?<\\/button>`,
      'g'
    ),
    `<button class="btn btn-black btn-block" disabled style="opacity:0.45;cursor:not-allowed;">Currently Unavailable</button>`
  );
}

// Remove entire product article block by data-id
function removeProduct(dataId) {
  // Match comment + article block
  const re = new RegExp(
    `\\s*<!--[^>]*-->\\s*\\n\\s*<article class="product-card"[^>]*data-id="${escRe(dataId)}"[\\s\\S]*?<\\/article>`,
    'g'
  );
  const before = html.length;
  html = html.replace(re, '');
  if (html.length === before) {
    // fallback without comment
    html = html.replace(
      new RegExp(
        `\\s*<article class="product-card"[^>]*data-id="${escRe(dataId)}"[\\s\\S]*?<\\/article>`,
        'g'
      ),
      ''
    );
  }
}

// Change product badge text
function setBadge(dataId, newBadge) {
  html = html.replace(
    new RegExp(
      `(data-id="${escRe(dataId)}"[\\s\\S]{0,500}?<span class="product-badge ruby-badge">)[^<]*(</span>)`
    ),
    `$1${newBadge}$2`
  );
}

// Mark as Abuja exclusive (badge + unavailable button)
function markAbuja(dataId) {
  setBadge(dataId, 'ABUJA EXCLUSIVE');
  markUnavailable(dataId);
}

// ===================================================
// CHANGES
// ===================================================

// --- TOYS ---

// Velvet Brush Vibe ₦25,000
setPrice('stealth-brush-vibe', '₦25,000', 25000);

// Satisfyer Pro 2 ₦40,000; add Pro 2+ size pill ₦45,000
setPrice('satisfyer-pro-suction', '₦40,000', 40000);
setBadge('satisfyer-pro-suction', 'AIR-PULSE · PRO 2 & PRO 2+');
// Add size pills before the add-to-cart button
html = html.replace(
  /(data-id="satisfyer-pro-suction"[\s\S]{0,2000}?<div class="product-body">[\s\S]{0,1500}?)(              <button class="btn btn-black btn-block btn-add-cart"[\s\S]*?data-id="satisfyer-pro-suction")/,
  `$1              <div class="color-row" style="margin-bottom:8px;">
                <button class="size-pill active" data-size="Pro 2" data-price="40000" data-pricestr="₦40,000">Pro 2</button>
                <button class="size-pill" data-size="Pro 2+" data-price="45000" data-pricestr="₦45,000">Pro 2+</button>
              </div>\n              $2`
);

// Empress Magic Wand ₦35,000
setPrice('empress-magic-wand', '₦35,000', 35000);

// Sakura Petal Wand ₦30,000
setPrice('cherry-blossom-wand', '₦30,000', 30000);

// Luxe Pocket Wand ₦18,000
setPrice('chrome-pocket-wand', '₦18,000', 18000);

// Tulip Blossom Vibe ₦35,000
setPrice('tulip-dual-stem-vibe', '₦35,000', 35000);

// Rose Bloom Wand — REMOVE (duplicate of rose blossom)
removeProduct('dual-rose-stem-vibe');

// Fox Smart Egg ₦35,000
setPrice('foxshow-kegel-egg', '₦35,000', 35000);

// Fly Panty Vibe — remote ₦25,000 / app ₦35,000
setPrice('wearable-panty-vibe', 'From ₦25,000', 25000);
setBadge('wearable-panty-vibe', 'REMOTE ₦25K · APP ₦35K');

// C-Shape Panty Vibe ₦35,000
setPrice('c-shape-sucking-vibe', '₦35,000', 35000);

// Palm Sphere Sucker → "Lemon Sucker" ₦30,000
renameProduct('palm-sphere-sucker', 'Palm Sphere Sucker', 'Lemon Sucker');
setPrice('palm-sphere-sucker', '₦30,000', 30000);

// Winged Empress Rabbit ₦50,000
setPrice('winged-rabbit-sucker', '₦50,000', 50000);

// Heated Remote Rabbit — UNAVAILABLE
markUnavailable('triple-threat-remote-rabbit');

// Crystal Beaded Rabbit → "Classy Rabbit" — battery ₦18,000 / USB ₦25,000
renameProduct('crystal-beaded-rabbit', 'Crystal Beaded Rabbit', 'Classy Rabbit');
setPrice('crystal-beaded-rabbit', 'From ₦18,000', 18000);
// Add battery/usb variant pills
html = html.replace(
  /(<article[^>]*data-id="crystal-beaded-rabbit"[\s\S]*?<div class="product-body">[\s\S]*?<h3 class="product-name">Classy Rabbit<\/h3>\s*)(              <button class="btn btn-black btn-block btn-add-cart")/,
  `$1              <div class="color-row" style="margin-bottom:8px;">
                <button class="size-pill active" data-size="Battery" data-price="18000" data-pricestr="₦18,000">Battery</button>
                <button class="size-pill" data-size="USB" data-price="25000" data-pricestr="₦25,000">USB</button>
              </div>\n              $2`
);

// Licking Rabbit Vibe ₦50,000
setPrice('dual-rabbit-tongue-vibe', '₦50,000', 50000);

// Jump-O G-Spot Vibe — UNAVAILABLE
markUnavailable('jump-o-curved-vibe');

// Curved G-Spot Bullet → "Finger Vibrator" ₦25,000
renameProduct('curved-gspot-bullet', 'Curved G-Spot Bullet', 'Finger Vibrator');
setPrice('curved-gspot-bullet', '₦25,000', 25000);

// 4-in-1 Luxury Vault — Abuja only
markAbuja('interchangeable-vault-4in1');

// Peace Thrusting Vibe → "Golden Hand Finger Vibe" — unavailable in Lagos
renameProduct('two-fingers-thrusting-vibe', 'Peace Thrusting Vibe', 'Golden Hand Finger Vibe');
markUnavailable('two-fingers-thrusting-vibe');

// Sweet Hammer Wand — UNAVAILABLE
markUnavailable('sweet-hammer-vibe');

// Sensual Ring Vibe → "Finger Vibe" ₦20,000
renameProduct('finger-vibe-ring', 'Sensual Ring Vibe', 'Finger Vibe');
setPrice('finger-vibe-ring', '₦20,000', 20000);

// Vibrating Harness Kit ₦45,000
setPrice('strap-on-dildo-kit', '₦45,000', 45000);

// Escapade 6-Inch Dong — UNAVAILABLE
markUnavailable('escapade-expert-dildo');

// Wireless Remote Shaft ₦45,000
setPrice('expansion-remote-dildo', '₦45,000', 45000);

// Spiral Swirl Shaft ₦24,000
setPrice('spiral-swirl-dildo', '₦24,000', 24000);

// Double Trouble Shaft ₦20,000 + Crystal Jelly Shaft → REMOVE
setPrice('dual-prong-dildo', '₦20,000', 20000);
removeProduct('crystal-dual-dildo');

// Neon Remote Shaft — unavailable in Lagos
markUnavailable('neon-pink-remote-dildo');

// Dual-Action Rabbit Shaft ₦50,000
setPrice('dual-rabbit-suction-dildo', '₦50,000', 50000);

// Automatic Vacuum Pump ₦50,000
setPrice('martha-pussy-pump', '₦50,000', 50000);

// Motorized Cock Ring — REMOVE (duplicate)
removeProduct('motorized-dual-cock-ring');

// Ribbed Extension Sleeves — UNAVAILABLE
markUnavailable('textured-penis-sleeves');

// Cyclone 360 Stroker → "Gawk Gawk 3000" ₦45,000
renameProduct('cyclone-stroker', 'Cyclone 360 Stroker', 'Gawk Gawk 3000');
setPrice('cyclone-stroker', '₦45,000', 45000);

// Champion Cup Stroker — non-vib ₦18,000 / battery vib ₦25,000
setPrice('champion-suction-stroker', 'From ₦18,000', 18000);
setBadge('champion-suction-stroker', 'NON-VIB ₦18K · VIB ₦25K');
html = html.replace(
  /(<article[^>]*data-id="champion-suction-stroker"[\s\S]*?<div class="product-body">[\s\S]*?<h3 class="product-name">Champion Cup Stroker<\/h3>\s*)(              <button class="btn btn-black btn-block btn-add-cart")/,
  `$1              <div class="color-row" style="margin-bottom:8px;">
                <button class="size-pill active" data-size="Non-Vibrating" data-price="18000" data-pricestr="₦18,000">Non-Vibrating</button>
                <button class="size-pill" data-size="Vibrating" data-price="25000" data-pricestr="₦25,000">Vibrating</button>
              </div>\n              $2`
);

// Stealth Can Stroker → "Beer Cup Stroker" ₦25,000
renameProduct('beer-cup-stroker', 'Stealth Can Stroker', 'Beer Cup Stroker');
setPrice('beer-cup-stroker', '₦25,000', 25000);

// Dual Pocket Stroker — UNAVAILABLE
markUnavailable('dual-ended-pocket-stroker');

// Aphrodite Torso Doll ₦75,000, unavailable in Lagos
setPrice('full-torso-doll', '₦75,000', 75000);
markUnavailable('full-torso-doll');

// Stamina Lips Stroker ₦25,000
setPrice('stamina-lip-stroker', '₦25,000', 25000);

// --- LUBES ---
// Kailin Pure Lube ₦10,000
setPrice('kailin-water-lube', '₦10,000', 10000);

// Fruitastic Lube Set ₦17,000, Abuja only
setPrice('kailin-fruitastic-lube', '₦17,000', 17000);
markAbuja('kailin-fruitastic-lube');

// Sensual Massage Oil — no price update (left empty/as-is)

// Boss Man Elixir — UNAVAILABLE
markUnavailable('boss-man-tonic');

// Rhino VIP Chocolate — UNAVAILABLE
markUnavailable('rhino-choco-vip');

// Silicone Douche Bulb — UNAVAILABLE
markUnavailable('hygiene-anal-douche');

// --- BDSM ---
// Emerald Bondage Trunk — without suitcase ₦40,000 / with suitcase ₦55,000
setPrice('emerald-snakeskin-bdsm-trunk', 'From ₦40,000', 40000);
setBadge('emerald-snakeskin-bdsm-trunk', '10-PIECE · W/CASE ₦55K');
html = html.replace(
  /(<article[^>]*data-id="emerald-snakeskin-bdsm-trunk"[\s\S]*?<div class="product-body">[\s\S]*?<h3 class="product-name">Emerald Bondage Trunk<\/h3>\s*)(              <button class="btn btn-black btn-block btn-add-cart")/,
  `$1              <div class="color-row" style="margin-bottom:8px;">
                <button class="size-pill active" data-size="Without Suitcase" data-price="40000" data-pricestr="₦40,000">Without Case</button>
                <button class="size-pill" data-size="With Suitcase" data-price="55000" data-pricestr="₦55,000">With Case</button>
              </div>\n              $2`
);

// Noir Boudoir Chest — without suitcase ₦40,000 / with suitcase ₦55,000
setPrice('leather-bondage-chest', 'From ₦40,000', 40000);
setBadge('leather-bondage-chest', 'LUXURY VAULT · W/CASE ₦55K');
html = html.replace(
  /(<article[^>]*data-id="leather-bondage-chest"[\s\S]*?<div class="product-body">[\s\S]*?<h3 class="product-name">Noir Boudoir Chest<\/h3>\s*)(              <button class="btn btn-black btn-block btn-add-cart")/,
  `$1              <div class="color-row" style="margin-bottom:8px;">
                <button class="size-pill active" data-size="Without Suitcase" data-price="40000" data-pricestr="₦40,000">Without Case</button>
                <button class="size-pill" data-size="With Suitcase" data-price="55000" data-pricestr="₦55,000">With Case</button>
              </div>\n              $2`
);

// Gamble Intimacy Kit ₦15,000 (3 colors)
setPrice('love-is-a-gamble-kit', '₦15,000', 15000);

// Bunny Tail Plug ₦13,000 — UNAVAILABLE
setPrice('fluffy-bunny-tail-plugs', '₦13,000', 13000);
markUnavailable('fluffy-bunny-tail-plugs');

// Braided Shibari Rope → "BDSM Rope" — small ₦8,500 / large ₦12,000
renameProduct('shibari-bondage-rope', 'Braided Shibari Rope', 'BDSM Rope');
setPrice('shibari-bondage-rope', 'From ₦8,500', 8500);
// Update size pills if exist

// Simpler: just replace the existing pill values
html = html.replace(
  /(<article[^>]*data-id="shibari-bondage-rope"[\s\S]{0,2000}?<button class="size-pill active" data-size="Crimson" data-price=")[^"]*(" data-pricestr=")[^"]*(")/,
  `$1Small: ₦8,500$2₦8,500$3`
);
html = html.replace(
  /(<article[^>]*data-id="shibari-bondage-rope"[\s\S]{0,2000}?<button class="size-pill ." data-size="Midnight" data-price=")[^"]*(" data-pricestr=")[^"]*(")/,
  `$1Large: ₦12,000$2₦12,000$3`
);
// rename pills text
html = html.replace(
  /(<article[^>]*data-id="shibari-bondage-rope"[\s\S]{0,2000}?<button[^>]*data-size="Crimson"[^>]*>)Crimson(<\/button>)/,
  '$1Small$2'
);
html = html.replace(
  /(<article[^>]*data-id="shibari-bondage-rope"[\s\S]{0,2000}?<button[^>]*data-size="Midnight"[^>]*>)Midnight(<\/button>)/,
  '$1Large$2'
);

// Sovereign Leather Cuffs ₦12,000
setPrice('luxury-leather-cuffs', '₦12,000', 12000);

// Boudoir Bed Harness — PRE-ORDER
setBadge('restraint-bed-harness', 'PRE-ORDER');
html = html.replace(
  /<button class="btn btn-black btn-block btn-add-cart"\s*\n?\s*data-id="restraint-bed-harness"[^>]*>[\s\S]*?Add to Bag[\s\S]*?<\/button>/,
  `<button class="btn btn-black btn-block btn-add-cart" data-id="restraint-bed-harness" data-title="Boudoir Bed Harness" data-price="" data-img="/assets/IMG_1496.webp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Pre-Order Now
              </button>`
);

// Leather Harness Briefs → "Harness Briefs" (remove "Leather")
renameProduct('strap-on-harness-briefs', 'Leather Harness Briefs', 'Harness Briefs');

// Vegan Strap-On Harness → "Strap-On Harness" (remove "Vegan")
renameProduct('strap-on-vegan-harness', 'Vegan Strap-On Harness', 'Strap-On Harness');

// Silicone Bone Gag — Abuja only
markAbuja('silicone-bone-gag');

// Hemp Shibari Harness ₦15,000
setPrice('hemp-bondage-harness', '₦15,000', 15000);

// Twist Vacuum Suckers — Abuja only
markAbuja('twist-nipple-suckers');

// Crystal Glass Plugs — Abuja only
markAbuja('crystal-glass-plugs');

// Kraken Tentacle Shaft — Abuja only
markAbuja('fantasy-tentacle-dildo');

// --- GAMES ---
// Naughty Stacking Blocks → "Sex Jenga" — Abuja only
renameProduct('naughty-wooden-blocks', 'Naughty Stacking Blocks', 'Sex Jenga');
markAbuja('naughty-wooden-blocks');

// Boudoir Card Vault — REMOVE
removeProduct('couples-card-vault');

// 52 Position Cards → "A Year of Sex" ₦10,000
renameProduct('sexual-position-cards', '52 Position Cards', 'A Year of Sex');
setPrice('sexual-position-cards', '₦10,000', 10000);

// ===================================================
// ADMIN STAT: remove "(78 base + N uploaded)" sub text
// ===================================================
html = html.replace(
  /Active products in your boutique catalog \([^)]+\)/g,
  'Products in your boutique catalog'
);

// ===================================================
// NAVIGATION: Add "Abuja Exclusives" to hamburger dropdown
// ===================================================
html = html.replace(
  `<a href="/admin.html" class="dropdown-link nav-closer" style="color: #e11d48;">Admin Vault</a>`,
  `<a href="/products.html#abuja" class="dropdown-link nav-closer">📍 Abuja Exclusives</a>\n        <a href="/admin.html" class="dropdown-link nav-closer" style="color: #e11d48;">Admin Vault</a>`
);

// ===================================================
// ABUJA SECTION DIVIDER
// ===================================================
// Insert the Abuja section header just before the Silicone Bone Gag article (first Abuja product in sequence)
const abujaHeader = `
          <!-- ===== ABUJA EXCLUSIVES SECTION ===== -->
          <div class="products-section-divider" id="abuja" style="grid-column:1/-1; margin:40px 0 12px; scroll-margin-top:100px;">
            <div style="display:flex;align-items:center;gap:16px;">
              <div style="flex:1;height:1px;background:linear-gradient(90deg,transparent,#e2e8f0);"></div>
              <div style="text-align:center;">
                <div style="font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:#0f172a;letter-spacing:0.5px;">📍 Abuja Exclusives</div>
                <div style="font-size:12px;color:#64748b;margin-top:4px;">Available for pickup &amp; delivery in Abuja only · <a href="https://wa.me/2348000000000" target="_blank" style="color:#e11d48;font-weight:600;text-decoration:none;">Order on WhatsApp</a></div>
              </div>
              <div style="flex:1;height:1px;background:linear-gradient(90deg,#e2e8f0,transparent);"></div>
            </div>
          </div>

`;

// Insert before the first Abuja-only product card comment (Silicone Bone Gag - #26 BDSM)
html = html.replace(
  /(          <!-- 26\. BDSM: Silicone Bone Gag -->)/,
  abujaHeader + '$1'
);

// ===================================================
// ADMIN: Remove "Admin Studio" badge pill from admin.html
// (admin.html is separate — skip here, done in admin.html directly)
// Remove sparkles from admin files (handled separately)
// ===================================================

// Write output
fs.writeFileSync(filePath, html, 'utf8');

const changed = (html !== original);
console.log(changed ? '✓ products.html updated successfully' : '⚠ No changes detected');
console.log('File size:', html.length.toLocaleString(), 'bytes');
