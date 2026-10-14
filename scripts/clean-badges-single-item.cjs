const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// Function to clean a badge string so it only has one thing
function cleanBadge(badgeText) {
  let cleaned = badgeText.trim();
  // If it has "WITH CASE" or "W/CASE", remove it
  cleaned = cleaned.replace(/\s*[·•]\s*(?:WITH\s+CASE|W\/CASE)\s*/gi, '');
  cleaned = cleaned.replace(/\s*(?:WITH\s+CASE|W\/CASE)\s*[·•]?\s*/gi, '');
  
  // If it has a separator (· or •), keep only the first item
  if (cleaned.includes('·')) {
    cleaned = cleaned.split('·')[0].trim();
  }
  if (cleaned.includes('•')) {
    cleaned = cleaned.split('•')[0].trim();
  }

  // Remove any remaining video/case tags if any
  cleaned = cleaned.replace(/\s*🎬\s*VIDEOS?/gi, '').trim();

  // Clean trailing punctuation or spaces
  cleaned = cleaned.replace(/^[·•\s-]+|[·•\s-]+$/g, '').trim();

  // Specific custom fixes
  if (cleaned === 'NEW') cleaned = 'NEW ARRIVAL';
  if (cleaned === 'JEWELED & SILICONE') cleaned = 'JEWELED SILICONE';

  return cleaned;
}

// 1. UPDATE products.html
const productsPath = path.join(rootDir, 'products.html');
let productsHtml = fs.readFileSync(productsPath, 'utf8');

let pCount = 0;
productsHtml = productsHtml.replace(/(<span[^>]*class="[^"]*badge[^"]*"[^>]*>)([\s\S]*?)(<\/span>)/gi, (match, openTag, text, closeTag) => {
  const original = text.trim();
  const cleaned = cleanBadge(original);
  if (original !== cleaned) {
    pCount++;
    return `${openTag}${cleaned}${closeTag}`;
  }
  return match;
});

fs.writeFileSync(productsPath, productsHtml, 'utf8');
console.log(`✓ Updated ${pCount} badges in products.html to only have one thing.`);


// 2. UPDATE index.html
const indexPath = path.join(rootDir, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

let iCount = 0;
indexHtml = indexHtml.replace(/(<span[^>]*class="[^"]*badge[^"]*"[^>]*>)([\s\S]*?)(<\/span>)/gi, (match, openTag, text, closeTag) => {
  const original = text.trim();
  const cleaned = cleanBadge(original);
  if (original !== cleaned) {
    iCount++;
    return `${openTag}${cleaned}${closeTag}`;
  }
  return match;
});

fs.writeFileSync(indexPath, indexHtml, 'utf8');
console.log(`✓ Updated ${iCount} badges in index.html to only have one thing.`);


// 3. UPDATE src/main.js
const mainJsPath = path.join(rootDir, 'src', 'main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

let mCount = 0;
mainJs = mainJs.replace(/badge:\s*(['"])([\s\S]*?)\1/g, (match, quote, text) => {
  const original = text.trim();
  const cleaned = cleanBadge(original);
  if (original !== cleaned) {
    mCount++;
    return `badge: ${quote}${cleaned}${quote}`;
  }
  return match;
});

fs.writeFileSync(mainJsPath, mainJs, 'utf8');
console.log(`✓ Updated ${mCount} badge entries in src/main.js to only have one thing.`);

console.log('\nAll badges cleaned successfully!');
