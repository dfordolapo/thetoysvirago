const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, '../src/main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

// 1. Clean product titles in PRODUCT_DATABASE
mainJs = mainJs.replace("title: 'Siren App-Controlled',", "title: 'The Siren',");
mainJs = mainJs.replace("title: 'The Lipstick Vibrator',", "title: 'Lipstick Vibe',");
mainJs = mainJs.replace("title: 'Remote Thrusting Shaft',", "title: 'Kinetic Thrusting Shaft',");
mainJs = mainJs.replace("title: 'Sculpted Contour Plugs',", "title: 'Contour Crystal Plugs',");
mainJs = mainJs.replace("title: 'The Rabbit Cock Ring',", "title: 'Rabbit Cock Ring',");
mainJs = mainJs.replace("title: 'Creature Ergonomic Cock Ring',", "title: 'Creature Cock Ring',");
mainJs = mainJs.replace("title: 'The 6\" Heart Bullet',", "title: 'Heart Bullet 6\"',");
mainJs = mainJs.replace("title: 'The 7\" Sleek Bullet',", "title: 'Sleek Bullet 7\"',");
mainJs = mainJs.replace("title: 'Rose Jump Egg: App-Controlled Egg',", "title: 'Rose Jump Egg',");
mainJs = mainJs.replace("title: 'African Brute Herbal Tincture',", "title: 'African Brute Tonic',");

// Clean en-dashes / em-dashes
mainJs = mainJs.replace(/30–40 mins/g, '30-40 mins');
mainJs = mainJs.replace(/[—–]/g, '-');

// Replace .jpg with .webp in PRODUCT_DATABASE where webp exists
const assetMatches = mainJs.match(/\/assets\/[a-zA-Z0-9_\-\.]+\.jpg/g) || [];
assetMatches.forEach(jpgPath => {
  const webpName = jpgPath.replace('.jpg', '.webp');
  const fullWebp = path.join(__dirname, '../public', webpName);
  if (fs.existsSync(fullWebp)) {
    mainJs = mainJs.split(jpgPath).join(webpName);
  }
});

fs.writeFileSync(mainJsPath, mainJs, 'utf8');
console.log('Main.js catalog & titles updated successfully');
