const fs = require('fs');
const path = require('path');

const newProdsRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '../new-products-data.json'), 'utf8'));

// Refined concise 2-3 word titles and 1-line puns (avoid raw unescaped double quotes in titles)
const REFINED_META = {
  'emerald-snakeskin-bdsm-trunk': { title: 'Emerald Bondage Trunk', pun: 'Opulence, surrender, and zero apologies.', sku: 'BDSM · 17', badge: '10-PIECE VAULT' },
  'leather-bondage-chest': { title: 'Noir Boudoir Chest', pun: 'Lock away your inhibitions.', sku: 'BDSM · 18', badge: 'LUXURY BDSM VAULT' },
  'love-is-a-gamble-kit': { title: 'Gamble Intimacy Kit', pun: 'Roll the dice. Lose your composure.', sku: 'BDSM · 19', badge: 'COUPLES STARTER' },
  'fluffy-bunny-tail-plugs': { title: 'Bunny Tail Plug', pun: 'Pure velvet innocence on the outside.', sku: 'BDSM · 20', badge: 'FAUX FUR TAIL' },
  'shibari-bondage-rope': { title: 'Braided Shibari Rope', pun: 'Tie them up in sweet knots.', sku: 'BDSM · 21', badge: 'JAPANESE SHIBARI' },
  'luxury-leather-cuffs': { title: 'Sovereign Leather Cuffs', pun: 'Padded comfort for willing captives.', sku: 'BDSM · 22', badge: 'LEATHER RESTRAINTS' },
  'restraint-bed-harness': { title: 'Boudoir Bed Harness', pun: 'Turns any mattress into an altar.', sku: 'BDSM · 23', badge: 'SPREAD-EAGLE' },
  'strap-on-harness-briefs': { title: 'Leather Harness Briefs', pun: 'Slip into complete bedroom command.', sku: 'BDSM · 24', badge: 'O-RING BRIEFS' },
  'strap-on-vegan-harness': { title: 'Vegan Strap-On Harness', pun: 'Multi-ring versatility for every mood.', sku: 'BDSM · 25', badge: 'UNIVERSAL HARNESS' },
  'silicone-bone-gag': { title: 'Silicone Bone Gag', pun: 'Silence is exceptionally golden.', sku: 'BDSM · 26', badge: 'BREATHABLE RESTRAINT' },
  'hemp-bondage-harness': { title: 'Hemp Shibari Harness', pun: 'Quick-cinch knots with natural grip.', sku: 'BDSM · 27', badge: 'NATURAL FIBER' },
  'twist-nipple-suckers': { title: 'Twist Vacuum Suckers', pun: 'Turn the dial for swelling thrills.', sku: 'BDSM · 28', badge: 'CALIBRATED VACUUM' },
  'crystal-glass-plugs': { title: 'Crystal Glass Plugs', pun: 'Temperature play in pure crystal.', sku: 'BDSM · 29', badge: 'BOROSILICATE GLASS' },
  'fantasy-tentacle-dildo': { title: 'Kraken Tentacle Shaft', pun: 'Alien ridges for otherworldly depth.', sku: 'BDSM · 30', badge: 'TEXTURED SUCTION' },

  'naughty-wooden-blocks': { title: 'Naughty Stacking Blocks', pun: 'One block removed. One layer discarded.', sku: 'GAMES · 31', badge: 'TUMBLING TOWER' },
  'couples-card-vault': { title: 'Boudoir Card Vault', pun: 'Deep questions. Deeper physical dares.', sku: 'GAMES · 32', badge: 'TALK FLIRT DARE' },
  'sexual-position-cards': { title: '52 Position Cards', pun: 'A full year of bedroom choreography.', sku: 'GAMES · 33', badge: 'WEEKLY INSPIRATION' },

  'kailin-water-lube': { title: 'Kailin Pure Lube', pun: 'Ultra-slick glide with effortless cleanup.', sku: 'LUBES · 34', badge: 'WATER-BASED 200ML' },
  'kailin-fruitastic-lube': { title: 'Fruitastic Lube Set', pun: 'Delicious strawberry and lemon teasers.', sku: 'LUBES · 35', badge: 'DUO FLAVORS' },
  'fragrant-massage-oil': { title: 'Sensual Massage Oil', pun: 'Warming touch for total body surrender.', sku: 'LUBES · 36', badge: 'BOTANICAL 500ML' },
  'boss-man-tonic': { title: 'Boss Man Elixir', pun: 'Take charge with untamed stamina.', sku: 'LUBES · 37', badge: 'GINSENG & HONEY' },
  'rhino-choco-vip': { title: 'Rhino VIP Chocolate', pun: 'Sweet taste. Ferocious lasting power.', sku: 'LUBES · 38', badge: 'STAMINA CHOCOLATE' },
  'hygiene-anal-douche': { title: 'Silicone Douche Bulb', pun: 'Effortless prep for worry-free bliss.', sku: 'LUBES · 39', badge: 'MEDICAL HYGIENE' },

  'stealth-brush-vibe': { title: 'Velvet Brush Vibe', pun: 'Looks like makeup. Plays like heaven.', sku: 'TOYS · 40', badge: 'STEALTH DISGUISE' },
  'satisfyer-pro-suction': { title: 'Satisfyer Pro 2', pun: 'Touchless airwaves. Inevitable climax.', sku: 'TOYS · 41', badge: 'AIR-PULSE SUCTION' },
  'empress-magic-wand': { title: 'Empress Magic Wand', pun: 'Royal vibrations with bone-deep authority.', sku: 'TOYS · 42', badge: 'HEAVY-DUTY RUMBLE' },
  'cherry-blossom-wand': { title: 'Sakura Petal Wand', pun: 'Gentle blossom petals with buzzing fury.', sku: 'TOYS · 43', badge: 'FLEXIBLE HEAD' },
  'chrome-pocket-wand': { title: 'Luxe Pocket Wand', pun: 'Chic miniature rumble on the go.', sku: 'TOYS · 44', badge: 'MIRROR CHROME' },
  'tulip-dual-stem-vibe': { title: 'Tulip Blossom Vibe', pun: 'Suction cup at one tip, wand on the other.', sku: 'TOYS · 45', badge: 'DUAL-END STIM' },
  'dual-rose-stem-vibe': { title: 'Rose Bloom Wand', pun: 'Flexible stem reaching all the right spots.', sku: 'TOYS · 46', badge: 'FLEXIBLE G-SPOT' },
  'foxshow-kegel-egg': { title: 'Fox Smart Egg', pun: 'Strengthen inside while trembling with joy.', sku: 'TOYS · 47', badge: 'APP-CONTROLLED' },
  'wearable-panty-vibe': { title: 'Fly Panty Vibe', pun: 'Discreet flutter for sneaky public thrills.', sku: 'TOYS · 48', badge: 'WIRELESS REMOTE' },
  'c-shape-sucking-vibe': { title: 'C-Shape Panty Vibe', pun: 'Hugs your hips with mouth-like suction.', sku: 'TOYS · 49', badge: 'HANDS-FREE SUCTION' },
  'palm-sphere-sucker': { title: 'Palm Sphere Sucker', pun: 'Curves into your hand. Pulses on command.', sku: 'TOYS · 50', badge: 'ERGONOMIC PALM' },
  'winged-rabbit-sucker': { title: 'Winged Empress Rabbit', pun: 'Flapping ears and deep internal rumbles.', sku: 'TOYS · 51', badge: 'AIR-PULSE RABBIT' },
  'triple-threat-remote-rabbit': { title: 'Heated Remote Rabbit', pun: 'Heats up to body temperature in seconds.', sku: 'TOYS · 52', badge: 'THERMAL WARMING' },
  'crystal-beaded-rabbit': { title: 'Crystal Beaded Rabbit', pun: 'Spinning internal pearls for rolling pleasure.', sku: 'TOYS · 53', badge: 'ROTATING BEADS' },
  'dual-rabbit-tongue-vibe': { title: 'Licking Rabbit Vibe', pun: 'Oral tongue stroking meets internal buzz.', sku: 'TOYS · 54', badge: 'FLICKERING TONGUE' },
  'jump-o-curved-vibe': { title: 'Jump-O G-Spot Vibe', pun: 'Direct pinpoint curve targeting ecstasy.', sku: 'TOYS · 55', badge: 'CURVED SILICONE' },
  'curved-gspot-bullet': { title: 'Curved G-Spot Bullet', pun: 'Slender angle with easy finger retrieval.', sku: 'TOYS · 56', badge: 'RETRIEVAL TAIL' },
  'two-fingers-thrusting-vibe': { title: 'Peace Thrusting Vibe', pun: 'Twin silicone prongs thrusting in harmony.', sku: 'TOYS · 57', badge: 'MOTORIZED THRUST' },
  'sweet-hammer-vibe': { title: 'Sweet Hammer Wand', pun: 'Playful hammer head delivering hard hits.', sku: 'TOYS · 58', badge: 'NOVELTY WAND' },
  'finger-vibe-ring': { title: 'Sensual Ring Vibe', pun: 'Slip it onto your finger for guided ecstasy.', sku: 'TOYS · 59', badge: 'FINGER WEARABLE' },
  'interchangeable-vault-4in1': { title: '4-in-1 Luxury Vault', pun: 'Swap heads in seconds to match the mood.', sku: 'TOYS · 60', badge: 'INTERCHANGEABLE' },
  'strap-on-dildo-kit': { title: 'Vibrating Harness Kit', pun: 'Vibrating silicone dong with adjustable harness.', sku: 'TOYS · 61', badge: 'COMPLETE SUITE' },
  'escapade-expert-dildo': { title: 'Escapade 6-Inch Dong', pun: 'Veined contours with vibrating stamina.', sku: 'TOYS · 62', badge: 'REALISTIC TEXTURE' },
  'expansion-remote-dildo': { title: 'Wireless Remote Shaft', pun: 'Wall-mountable suction base with remote control.', sku: 'TOYS · 63', badge: 'REMOTE SUCTION' },
  'veined-suction-dildo': { title: 'Veined Suction Shaft', pun: 'Firm suction stick for shower & wall thrills.', sku: 'TOYS · 64', badge: 'HANDS-FREE BASE' },
  'spiral-swirl-dildo': { title: 'Spiral Swirl Shaft', pun: 'Ribbed twists delivering delicious friction.', sku: 'TOYS · 65', badge: 'SPIRAL RIBS' },
  'dual-prong-dildo': { title: 'Double Trouble Shaft', pun: 'Dual exploration for the truly daring.', sku: 'TOYS · 66', badge: 'V-DILDO DUO' },
  'crystal-dual-dildo': { title: 'Crystal Jelly Shaft', pun: 'Flexible clear crystal with twin tips.', sku: 'TOYS · 67', badge: 'DUAL PRONG JELLY' },
  'neon-pink-remote-dildo': { title: 'Neon Remote Shaft', pun: 'Vibrant glow with escalating frequency dial.', sku: 'TOYS · 68', badge: 'WIRED CONTROLLER' },
  'dual-rabbit-suction-dildo': { title: 'Dual-Action Rabbit Shaft', pun: 'Hands-free suction base with clit teaser.', sku: 'TOYS · 69', badge: 'RABBIT SUCTION' },
  'martha-pussy-pump': { title: 'Automatic Vacuum Pump', pun: 'Electric vacuum swelling for hyper-sensitivity.', sku: 'TOYS · 70', badge: 'RECHARGEABLE PUMP' },
  'motorized-dual-cock-ring': { title: 'Motorized Cock Ring', pun: 'Locks his stamina. Thrills her clitoris.', sku: 'TOYS · 71', badge: 'DUAL-LOOP BUZZ' },
  'textured-penis-sleeves': { title: 'Ribbed Extension Sleeves', pun: 'Adds girth and texture for deeper thrills.', sku: 'TOYS · 72', badge: '3-PACK SLEEVES' },
  'cyclone-stroker': { title: 'Cyclone 360 Stroker', pun: 'Automatic spiral spin for hands-free surrender.', sku: 'TOYS · 73', badge: '360 ROTATING' },
  'champion-suction-stroker': { title: 'Champion Cup Stroker', pun: 'Hands-free angle lock with ribbed tunnel.', sku: 'TOYS · 74', badge: 'SUCTION STAND' },
  'beer-cup-stroker': { title: 'Stealth Can Stroker', pun: 'Hiding in plain sight as a cold beverage.', sku: 'TOYS · 75', badge: 'DISGUISE CAN' },
  'dual-ended-pocket-stroker': { title: 'Dual Pocket Stroker', pun: 'Two distinct ribbed entrances in one pocket body.', sku: 'TOYS · 76', badge: 'ORAL & VAGINAL' },
  'stamina-lip-stroker': { title: 'Stamina Lips Stroker', pun: 'Warm soft lips with internal electric pulse.', sku: 'TOYS · 77', badge: 'VIBRATING LIPS' },
  'full-torso-doll': { title: 'Aphrodite Torso Doll', pun: 'Life-sized curves with hyper-realistic warmth.', sku: 'TOYS · 78', badge: 'DUAL CHANNEL TPE' }
};

const processedNewProds = newProdsRaw.map(prod => {
  const meta = REFINED_META[prod.id] || { title: prod.title, pun: prod.desc ? prod.desc.split('.')[0] + '.' : '', sku: `${prod.category.toUpperCase()} · NEW`, badge: prod.badge || '' };
  return {
    ...prod,
    title: meta.title.replace(/"/g, ''),
    badge: meta.badge.replace(/"/g, ''),
    pun: meta.pun.replace(/"/g, ''),
    sku: meta.sku
  };
});

const safeAttr = (s) => (s || '').replace(/"/g, '&quot;');

// 1. GENERATE HTML CARDS FOR products.html
let cardsHtml = '';
processedNewProds.forEach((p, idx) => {
  let variantsHtml = '';
  if (p.variants && p.variants.length > 0) {
    variantsHtml = `\n              <div class="color-row">`;
    p.variants.forEach((v, vIdx) => {
      const activeClass = vIdx === 0 ? 'active' : '';
      variantsHtml += `\n                <button class="size-pill ${activeClass}" data-size="${safeAttr(v.name)}" data-price="${v.price}" data-pricestr="${safeAttr(v.priceStr)}" data-img="${safeAttr(v.img)}">${v.name}</button>`;
    });
    variantsHtml += `\n                <span class="color-name">${p.variants[0].name}</span>\n              </div>`;
  }

  const keywords = `${p.title.toLowerCase()} ${p.category} ${p.badge.toLowerCase()} ${(p.specs || []).map(s => s.value).join(' ').toLowerCase()}`.replace(/["']/g, '');

  cardsHtml += `
          <!-- ${17 + idx}. ${p.category.toUpperCase()}: ${p.title} -->
          <article class="product-card" data-category="${p.category}" data-id="${p.id}" data-keywords="${keywords}">
            <div class="product-img-wrap">
              ${p.badge ? `<span class="product-badge ruby-badge">${p.badge}</span>` : ''}
              <img src="${p.img}" alt="${safeAttr(p.title)}" class="product-img" loading="lazy" decoding="async" />
              <div class="product-overlay">
                <button class="btn-quick-view" data-product="${p.id}">Quick Look</button>
              </div>
            </div>
            <div class="product-body">
              <div class="product-top">
                <span class="product-sku">${p.sku}</span>
                <span class="product-price">${p.priceStr}</span>
              </div>
              <h3 class="product-name">${p.title}</h3>
              <p class="product-line">${p.pun}</p>${variantsHtml}
              <button class="btn btn-black btn-block btn-add-cart"
                data-id="${p.id}" data-title="${safeAttr(p.title)}"
                data-price="${p.price}" data-img="${p.img}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add to Bag
              </button>
            </div>
          </article>
`;
});

// 2. REBUILD products.html CLEANLY
const productsHtmlPath = path.join(__dirname, '../products.html');
let productsHtml = fs.readFileSync(productsHtmlPath, 'utf8');

// Isolate everything up to card 16
const card16EndMarker = '<!-- 16. LUBES: African Brute Tonic -->';
const card16Idx = productsHtml.indexOf(card16EndMarker);
if (card16Idx === -1) {
  console.error('Could not find card 16 in products.html');
  process.exit(1);
}

const articleCloseIdx = productsHtml.indexOf('</article>', card16Idx);
const insertPoint = articleCloseIdx + '</article>'.length;

// Find the section closing marker for products-grid
const whispersMarker = '<!-- ===== THE BOUDOIR WHISPERS: VERIFIED CUSTOMER REVIEWS ===== -->';
const whispersIdx = productsHtml.indexOf(whispersMarker);
if (whispersIdx === -1) {
  console.error('Could not find whispersMarker');
  process.exit(1);
}

// Find `</div>\n      </div>\n    </section>` right before whispersIdx
const gridSectionCloseIdx = productsHtml.lastIndexOf('</section>', whispersIdx);
if (gridSectionCloseIdx === -1) {
  console.error('Could not find grid section close');
  process.exit(1);
}

const beforeGridCloseIdx = productsHtml.lastIndexOf('</div>', gridSectionCloseIdx);
const beforeWrapCloseIdx = productsHtml.lastIndexOf('</div>', beforeGridCloseIdx - 1);

// Replace everything between insertPoint and beforeWrapCloseIdx with cardsHtml
productsHtml = productsHtml.slice(0, insertPoint) + '\n' + cardsHtml + '\n        ' + productsHtml.slice(beforeWrapCloseIdx);

fs.writeFileSync(productsHtmlPath, productsHtml, 'utf8');
console.log('Successfully re-injected 62 cards into products.html');

// 3. UPDATE PRODUCT_DATABASE in src/main.js
const mainJsPath = path.join(__dirname, '../src/main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

const newDbEntries = {};
processedNewProds.forEach(p => {
  newDbEntries[p.id] = {
    id: p.id,
    title: p.title,
    badge: p.badge,
    price: p.price,
    priceStr: p.priceStr,
    img: p.img,
    desc: (p.desc || p.pun).replace(/[—–]/g, '-'),
    specs: p.specs || [],
    material: p.material || 'Medical-Grade Body-Safe Materials',
    acoustics: p.acoustics || '< 30 dB (Whisper Quiet)',
    freq: 70,
    pattern: 'luxe'
  };
  if (p.variants && p.variants.length > 0) {
    newDbEntries[p.id].variants = p.variants;
  }
  if (p.media && p.media.length > 0) {
    newDbEntries[p.id].media = p.media;
  } else {
    newDbEntries[p.id].media = [{ type: 'image', src: p.img, label: p.title }];
  }
});

const dbCloseMarker = 'function showShareToast';
const dbCloseIdx = mainJs.indexOf(dbCloseMarker);
const targetClosingBraceIdx = mainJs.lastIndexOf('};', dbCloseIdx);

let dbExtension = '';
for (const [id, prod] of Object.entries(newDbEntries)) {
  if (!mainJs.includes(`'${id}': {`)) {
    dbExtension += `  '${id}': ${JSON.stringify(prod, null, 4)},\n`;
  }
}

if (dbExtension) {
  mainJs = mainJs.slice(0, targetClosingBraceIdx) + dbExtension + mainJs.slice(targetClosingBraceIdx);
  fs.writeFileSync(mainJsPath, mainJs, 'utf8');
  console.log('Successfully updated PRODUCT_DATABASE in src/main.js');
}

// 4. seed-all-products.sql
let sql = `-- Seed ALL 78 Products into Supabase Products Table\n`;
sql += `INSERT INTO public.products (id, title, category, tagline, price, badge, image, description, specs, variants, in_stock)\nVALUES\n`;

const escapeStr = (s) => (s || '').replace(/'/g, "''").replace(/[—–]/g, '-');

const seedOriginalFile = path.join(__dirname, '../seed-products.sql');
let originalSql = fs.readFileSync(seedOriginalFile, 'utf8');
const originalValuesMatch = originalSql.match(/VALUES\s+([\s\S]*?)\s+ON CONFLICT/i);
const originalRows = originalValuesMatch ? originalValuesMatch[1].trim() : '';

const newRows = processedNewProds.map(p => {
  const title = escapeStr(p.title);
  const badge = escapeStr(p.badge || '');
  const image = escapeStr(p.img);
  const desc = escapeStr(p.desc || p.pun);
  const specsArr = (p.specs || []).map(s => escapeStr(`${s.label}: ${s.value}`));
  const specsSql = `ARRAY[${specsArr.map(s => `'${s}'`).join(', ')}]::text[]`;
  const variantsJson = escapeStr(JSON.stringify(p.variants || []));

  return `  ('${p.id}', '${title}', '${p.category}', '${badge}', ${p.price}, '${badge}', '${image}', '${desc}', ${specsSql}, '${variantsJson}'::jsonb, true)`;
});

const allRows = (originalRows ? originalRows + ',\n' : '') + newRows.join(',\n');
sql += allRows + `\nON CONFLICT (id) DO UPDATE SET\n  title = EXCLUDED.title,\n  price = EXCLUDED.price,\n  badge = EXCLUDED.badge,\n  image = EXCLUDED.image,\n  description = EXCLUDED.description,\n  specs = EXCLUDED.specs,\n  variants = EXCLUDED.variants;\n`;

fs.writeFileSync(path.join(__dirname, '../seed-all-products.sql'), sql, 'utf8');
console.log('Successfully generated seed-all-products.sql!');
