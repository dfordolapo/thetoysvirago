const fs = require('fs');
const mainJs = fs.readFileSync('src/main.js', 'utf8');

const regex = /badge:\s*['"]([^'"]+)['"]/g;
let m;
const badges = [];
while ((m = regex.exec(mainJs)) !== null) {
  badges.push(m[1]);
}
console.log('Badges in src/main.js:');
console.log([...new Set(badges)]);
