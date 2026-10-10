const fs = require('fs');
const path = require('path');

// =========================================================================
// 1. UPDATE products.html:
//    - Remove `<p class="product-line">...</p>` from all product cards
//    - For products 17 to 78: leave price blank (`<span class="product-price"></span>`)
//    - Replace covers for products with missing/deleted covers with next appropriate photo:
//      - lipstick-vibe -> /assets/lipstick-hand.webp
//      - siren-app -> /assets/siren-app-red.webp
// =========================================================================

const productsHtmlPath = path.join(__dirname, '../products.html');
let productsHtml = fs.readFileSync(productsHtmlPath, 'utf8');

// Use next appropriate images for lipstick and siren
productsHtml = productsHtml.replace('src="/assets/lipstick-vibe.webp"', 'src="/assets/lipstick-hand.webp"');
productsHtml = productsHtml.replace('data-img="/assets/lipstick-vibe.webp"', 'data-img="/assets/lipstick-hand.webp"');

productsHtml = productsHtml.replace('src="/assets/siren-app.webp"', 'src="/assets/siren-app-red.webp"');
productsHtml = productsHtml.replace('data-img="/assets/siren-app.webp"', 'data-img="/assets/siren-app-red.webp"');

// Remove `<p class="product-line">...</p>` from all product cards
productsHtml = productsHtml.replace(/\s*<p class="product-line">[\s\S]*?<\/p>/g, '');

// For cards 17 to 78, blank out their prices
// Card 17 starts after African Brute (card 16)
const card16Marker = '<!-- 16. LUBES: African Brute Tonic -->';
const card16Idx = productsHtml.indexOf(card16Marker);

if (card16Idx !== -1) {
  const before16 = productsHtml.slice(0, card16Idx);
  let after16 = productsHtml.slice(card16Idx);

  // Find the end of card 16
  const article16Close = after16.indexOf('</article>') + '</article>'.length;
  const part16 = after16.slice(0, article16Close);
  let part17to78 = after16.slice(article16Close);

  // Blank out <span class="product-price">...</span> for cards 17-78
  part17to78 = part17to78.replace(/<span class="product-price">[^<]*<\/span>/g, '<span class="product-price"></span>');

  // Blank out data-pricestr and data-price on cards 17-78
  part17to78 = part17to78.replace(/data-pricestr="[^"]*"/g, 'data-pricestr=""');
  part17to78 = part17to78.replace(/data-price="[0-9]+"/g, 'data-price=""');

  productsHtml = before16 + part16 + part17to78;
}

fs.writeFileSync(productsHtmlPath, productsHtml, 'utf8');
console.log('Successfully updated products.html: removed product lines & blanked prices on cards 17-78');


// =========================================================================
// 2. UPDATE index.html:
//    - Ensure Toys section showcase-img uses /assets/product-rose.webp
// =========================================================================
const indexHtmlPath = path.join(__dirname, '../index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// Verify slide 1 has product-rose.webp
if (!indexHtml.includes('/assets/product-rose.webp')) {
  indexHtml = indexHtml.replace(/<img[^>]+alt="The Rose Sucker - Toys & Devices Collection"[^>]*\/>/,
    '<img src="/assets/product-rose.webp" alt="The Rose Sucker - Toys & Devices Collection" class="showcase-img" loading="eager" />');
}

fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
console.log('Successfully confirmed/updated index.html toys section image');


// =========================================================================
// 3. UPDATE src/main.js:
//    - For products 17 to 78, set price: 0, priceStr: ''
//    - Update lipstick-vibe and siren-app images to appropriate photos
//    - If qvPrice is blank, hide it in quickview
// =========================================================================
const mainJsPath = path.join(__dirname, '../src/main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

// Update lipstick and siren default images in PRODUCT_DATABASE
mainJs = mainJs.replace(/id: 'lipstick-vibe',\s*title: 'Lipstick Vibe',\s*badge: 'RECHARGEABLE • STEALTH LUXE',\s*price: 22000,\s*priceStr: '₦22,000',\s*img: '\/assets\/lipstick-vibe\.webp'/,
  `id: 'lipstick-vibe',
    title: 'Lipstick Vibe',
    badge: 'RECHARGEABLE • STEALTH LUXE',
    price: 22000,
    priceStr: '₦22,000',
    img: '/assets/lipstick-hand.webp'`);

mainJs = mainJs.replace(/id: 'siren-app',\s*title: 'The Siren',\s*badge: 'APP CONNECT • LONG DISTANCE',\s*price: 27000,\s*priceStr: '₦27,000',\s*img: '\/assets\/siren-app\.webp'/,
  `id: 'siren-app',
    title: 'The Siren',
    badge: 'APP CONNECT • LONG DISTANCE',
    price: 27000,
    priceStr: '₦27,000',
    img: '/assets/siren-app-red.webp'`);

// Load new products IDs from new-products-data.json
const newProdsRaw = JSON.parse(fs.readFileSync(path.join(__dirname, '../new-products-data.json'), 'utf8'));
const newIds = newProdsRaw.map(p => p.id);

// In src/main.js, for each new product ID, blank out its price and priceStr
newIds.forEach(id => {
  // Regex match the block for this product
  const idRegex = new RegExp(`('${id}':\\s*\\{[\\s\\S]*?"price":\\s*)[0-9]+(,[\\s\\S]*?"priceStr":\\s*")[^"]*(")`);
  if (idRegex.test(mainJs)) {
    mainJs = mainJs.replace(idRegex, `$10$2$3`);
  }
});

// Update Quickview price display logic: if prod.priceStr is empty, hide qvPrice
mainJs = mainJs.replace("if (qvPrice) qvPrice.textContent = prod.priceStr;",
  "if (qvPrice) { qvPrice.textContent = prod.priceStr || ''; qvPrice.style.display = prod.priceStr ? 'block' : 'none'; }");

fs.writeFileSync(mainJsPath, mainJs, 'utf8');
console.log('Successfully updated src/main.js: blanked prices for products 17-78 & updated cover images');
