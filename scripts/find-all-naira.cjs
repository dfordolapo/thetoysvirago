const fs = require('fs');
const html = fs.readFileSync('products.html', 'utf8');

// Find all occurrences of ₦
const lines = html.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('₦') && !line.includes('product-price') && !line.includes('data-pricestr') && !line.includes('cart-') && !line.includes('qv-price')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
