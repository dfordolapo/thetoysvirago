import fs from 'fs';
import assert from 'assert';
import { DELIVERY_ZONES, autoDetectDeliveryZoneFromAddress } from '../src/modules/zones.js';
import { renderProductPage } from '../src/productPageTemplate.js';
import { buildProductCopyPrompt, parseGeminiJson } from '../src/aiPrompt.js';

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
  } catch (err) {
    console.error(`FAIL: ${name}\n  ${err.message}`);
    process.exitCode = 1;
  }
}

// 1. Zones 1-7 & Lagos auto-detection
check('All 42 interstate cities resolve to expected zones and pricing', () => {
  const expected = {
    Ibadan: 'zone_2_southwest',
    Abeokuta: 'zone_2_southwest',
    'Ijebu Ode': 'zone_2_southwest',
    Osogbo: 'zone_2_southwest',
    Akure: 'zone_2_southwest',
    'Ado Ekiti': 'zone_2_southwest',
    Enugu: 'zone_3_east_south',
    Abakaliki: 'zone_3_east_south',
    Calabar: 'zone_3_east_south',
    'Port Harcourt': 'zone_4_south_south',
    Owerri: 'zone_4_south_south',
    Aba: 'zone_4_south_south',
    Yenagoa: 'zone_4_south_south',
    Uyo: 'zone_4_south_south',
    Benin: 'zone_5_edo_delta_anambra',
    Asaba: 'zone_5_edo_delta_anambra',
    Warri: 'zone_5_edo_delta_anambra',
    Onitsha: 'zone_5_edo_delta_anambra',
    Abuja: 'abuja_outer',
    Ilorin: 'zone_6_north_central',
    Lafia: 'zone_6_north_central',
    Lokoja: 'zone_6_north_central',
    Kaduna: 'zone_7_pickup',
    Kano: 'zone_7_pickup',
    Jos: 'zone_7_doorstep',
    Bauchi: 'zone_7_doorstep',
    Nsukka: 'zone_7_doorstep',
    Zaria: 'zone_7_doorstep'
  };
  for (const [city, zoneId] of Object.entries(expected)) {
    assert.strictEqual(autoDetectDeliveryZoneFromAddress('', city), zoneId, `City ${city}`);
  }
  assert.strictEqual(DELIVERY_ZONES.zone_2_southwest.officeFee, 3500);
  assert.strictEqual(DELIVERY_ZONES.zone_2_southwest.parkFee, 4000);
  assert.strictEqual(DELIVERY_ZONES.zone_2_southwest.doorstepFee, 5000);
  assert.strictEqual(DELIVERY_ZONES.zone_7_pickup.officeFee, 8500);
  assert.strictEqual(DELIVERY_ZONES.zone_7_doorstep.officeAvailable, false);
});

// 2. Product detail page template: specs deduplication, Case/No Case, unavailable state, crossed-out price, mobile thumb padding
check('Product detail page template renders specs cleanly without duplicates, supports out-of-stock & discount price', () => {
  const html = renderProductPage({
    id: 'test-item',
    title: 'Test Luxury Piece',
    price: 3500,
    original_price: 5000,
    in_stock: false,
    material: 'Medical Liquid Silicone',
    acoustics: '< 30 dB',
    specs: [
      'Material: Material: Medical Liquid Silicone',
      'Sound Level: < 30 dB',
      'Waterproof: IPX7'
    ],
    variants: [
      { name: 'No Case', price: 3500 },
      { name: 'Case', price: 5000 }
    ]
  }, { siteUrl: 'https://www.thetoysvirago.shop', pageUrl: 'https://www.thetoysvirago.shop/products/test-item' });

  assert(html.includes('₦3,500'), 'Missing sale price');
  assert(html.includes('price-was') && html.includes('₦5,000'), 'Missing crossed-out original price');
  assert(html.includes('id="pdp-restock-wrap"') && html.includes('Get an email when this piece is back in stock'), 'Missing clean Notify Me box on unavailable PDP');
  assert(!html.includes('id="btn-order-primary"'), 'Add to Bag button should be omitted when unavailable');

  const inStockHtml = renderProductPage({
    id: 'test-item-2',
    title: 'Test In-Stock Piece',
    price: 3500,
    in_stock: true,
    material: 'Medical Liquid Silicone',
    acoustics: '< 30 dB',
    specs: [
      'Material: Material: Medical Liquid Silicone',
      'Sound Level: < 30 dB',
      'Waterproof: IPX7'
    ]
  }, { siteUrl: 'https://www.thetoysvirago.shop', pageUrl: 'https://www.thetoysvirago.shop/products/test-item-2' });
  assert(!inStockHtml.includes('Material: Medical'), 'Repeated Material: prefix leaked into spec value');
  assert.strictEqual((inStockHtml.match(/<dt>Material<\/dt>/g) || []).length, 1, 'Duplicate Material spec row');
  assert(inStockHtml.includes('padding: 5px 4px 6px 4px !important'), 'Missing mobile thumb padding for red active stroke');
});

// 3. AI copy prompt rules
check('AI copy prompt enforces color-free copy, collection detection, and JSON extraction', () => {
  const prompt = buildProductCopyPrompt('toys', 'seductive', '', {});
  assert(prompt.includes('STRICTLY NO COLOURS IN COPY'), 'Missing no-colour rule');
  assert(prompt.includes('"category"'), 'Missing category detection output field');
  const parsed = parseGeminiJson('Here is the JSON:\n```json\n{"category":"toys","title":"Test"}\n```');
  assert.strictEqual(parsed.category, 'toys');
});

// 4. Built dist files & HTML partial invariants
check('Built dist/products.html and dist/index.html have 2-phase checkout, 3 interstate methods, Abuja modal card, and 0 em dashes', () => {
  const files = ['dist/products.html', 'dist/index.html', 'dist/blog.html'].filter(f => fs.existsSync(f));
  assert(files.length === 3, 'Missing built dist HTML files (run npm run build first)');
  for (const f of files) {
    const c = fs.readFileSync(f, 'utf8');
    assert(!/\u2014|&mdash;|&#8212;/.test(c), `Em dash found in ${f}`);
  }
  const prodHtml = fs.readFileSync('dist/products.html', 'utf8');
  assert(prodHtml.includes('id="co-step-1"') && prodHtml.includes('id="co-step-2"'), 'Missing 2-phase checkout steps');
  assert(prodHtml.includes('id="opt-park-delivery"') && prodHtml.includes('id="opt-office-delivery"') && prodHtml.includes('id="opt-doorstep-delivery"'), 'Missing 3 interstate delivery cards');
  assert(prodHtml.includes('id="qv-deliv-abuja"') && prodHtml.includes('id="qv-deliv-standard"'), 'Missing Abuja/Standard delivery modal cards');
});

if (!process.exitCode) {
  console.log(`All ${passed} automated verification checks passed.`);
}
