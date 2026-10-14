const fs = require('fs');
const path = require('path');

const styleCssPath = path.join(__dirname, '../src/style.css');
let styleCss = fs.readFileSync(styleCssPath, 'utf8');

// 1. Remove separate .abuja-carousel-track .product-card .btn-black[disabled] at lines 2873-2876
styleCss = styleCss.replace(
  /\.abuja-carousel-track \.product-card \.btn-black\[disabled\]\s*\{[\s\S]*?\}/,
  `.abuja-carousel-track .product-card .btn-black[disabled] {
  background: #27272e !important;
  color: rgba(255, 255, 255, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.16) !important;
}`
);

// 2. Unify the UNAVAILABLE BUTTON STYLING block at the bottom
const oldBlockStart = '/* ── UNAVAILABLE BUTTON STYLING';
const oldBlockIdx = styleCss.indexOf(oldBlockStart);

const unifiedUnavailableCss = `/* ── UNAVAILABLE BUTTON STYLING (100% Identical in General Products & Abuja Exclusives) ── */
.btn-unavailable,
button.btn-unavailable[disabled],
.product-card .btn-unavailable,
.product-card button[disabled],
#products-grid .btn-unavailable,
#products-grid .product-card button[disabled],
#products-grid .product-card .btn-black[disabled],
.abuja-carousel-track .btn-unavailable,
.abuja-carousel-track .product-card button[disabled],
.abuja-carousel-track .product-card .btn-black[disabled] {
  background: #27272e !important;
  color: rgba(255, 255, 255, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.16) !important;
  border-radius: 8px !important;
  padding: 9px 14px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  letter-spacing: 0.04em !important;
  line-height: 1 !important;
  min-height: 38px !important;
  margin-top: auto !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: not-allowed !important;
  opacity: 1 !important;
  box-shadow: none !important;
}

@media (max-width: 580px) {
  .btn-unavailable,
  button.btn-unavailable[disabled],
  .product-card .btn-unavailable,
  .product-card button[disabled],
  #products-grid .btn-unavailable,
  #products-grid .product-card button[disabled],
  #products-grid .product-card .btn-black[disabled],
  .abuja-carousel-track .btn-unavailable,
  .abuja-carousel-track .product-card button[disabled],
  .abuja-carousel-track .product-card .btn-black[disabled] {
    padding: 7px 10px !important;
    font-size: 11px !important;
    min-height: 34px !important;
  }
}
`;

if (oldBlockIdx !== -1) {
  styleCss = styleCss.substring(0, oldBlockIdx) + unifiedUnavailableCss;
} else {
  styleCss += '\n' + unifiedUnavailableCss;
}

fs.writeFileSync(styleCssPath, styleCss, 'utf8');
console.log('✓ Successfully unified Unavailable button color and styling between general products and Abuja exclusives.');
