const fs = require('fs');
const path = require('path');

// 1. UPDATE src/admin.js
const adminPath = path.join(__dirname, '../src/admin.js');
let adminCode = fs.readFileSync(adminPath, 'utf8');

const seedRegex = /const DEFAULT_LINGERIE_SEEDS = \[[\s\S]*?\r?\n\];/;
adminCode = adminCode.replace(seedRegex, 'const DEFAULT_LINGERIE_SEEDS = [];');

const getRegex = /function getCustomProducts\(\) \{[\s\S]*?return Array\.isArray\(parsed\) \? parsed : \[\];\r?\n\s*\}\s*catch/;
const newGet = `function getCustomProducts() {
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    const cleaned = (Array.isArray(parsed) ? parsed : []).filter(p => p && p.id !== 'noir-chantilly-teddy' && p.id !== 'scarlet-silk-chemise');
    if (cleaned.length !== (Array.isArray(parsed) ? parsed.length : 0)) {
      localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch`;

adminCode = adminCode.replace(getRegex, newGet);
adminCode = adminCode.replace(/'Noir Chantilly Lace Teddy',\s*'Scarlet Silk Ribbon Chemise',/, "'Zebra Set',\n      'Heart Teddy',");

fs.writeFileSync(adminPath, adminCode, 'utf8');
console.log('Cleaned src/admin.js successfully!');

// 2. UPDATE src/main.js
const mainPath = path.join(__dirname, '../src/main.js');
let mainCode = fs.readFileSync(mainPath, 'utf8');

const initRegex = /export async function initCustomCatalogProducts\(\) \{[\s\S]*?if \(!customProds\) \{ customProds = \[\]; \}/;
const newInit = `export async function initCustomCatalogProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  // Purge any obsolete placeholder cards from the DOM
  document.querySelectorAll('.product-card[data-id="noir-chantilly-teddy"], .product-card[data-id="scarlet-silk-chemise"]').forEach(el => el.remove());

  let customProds = [];
  try {
    const stored = localStorage.getItem('thetoysvirago_custom_products');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        customProds = parsed.filter(p => p && p.id !== 'noir-chantilly-teddy' && p.id !== 'scarlet-silk-chemise');
        if (customProds.length !== parsed.length) {
          localStorage.setItem('thetoysvirago_custom_products', JSON.stringify(customProds));
        }
      }
    }
  } catch (e) {
    console.warn('[Catalog] Error reading custom products:', e);
  }

  if (!customProds) { customProds = []; }`;

mainCode = mainCode.replace(initRegex, newInit);
fs.writeFileSync(mainPath, mainCode, 'utf8');
console.log('Cleaned src/main.js successfully!');

// 3. UPDATE admin.html placeholder text
const adminHtmlPath = path.join(__dirname, '../admin.html');
let adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');
adminHtml = adminHtml.replace(/placeholder="e\.g\. Noir Chantilly Lace Teddy"/g, 'placeholder="e.g. Zebra Set"');
fs.writeFileSync(adminHtmlPath, adminHtml, 'utf8');
console.log('Cleaned admin.html placeholder successfully!');
