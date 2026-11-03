const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'articles.js');
let code = fs.readFileSync(filePath, 'utf8');

const slugStr = "slug: 'confessions-good-christian-girl-first-toy-at-27'";
const idx = code.indexOf(slugStr);
if (idx === -1) {
  console.error('Slug not found');
  process.exit(1);
}

const objStart = code.lastIndexOf('  {', idx);
const objEnd = code.indexOf('\n  }', idx) + 4; // includes closing brace

let targetArticle = code.slice(objStart, objEnd);
let remaining = code.slice(0, objStart) + code.slice(objEnd);

// clean up double commas or trailing commas
remaining = remaining.replace(/,\s*,\s*/g, ',\n');
remaining = remaining.replace(/,\s*\];/g, '\n];');

// Insert after export const BLOG_ARTICLES = [
const arrIdx = remaining.indexOf('export const BLOG_ARTICLES = [');
const bracketIdx = remaining.indexOf('[', arrIdx);

const newCode = remaining.slice(0, bracketIdx + 1) + '\n' + targetArticle + ',' + remaining.slice(bracketIdx + 1);

fs.writeFileSync(filePath, newCode, 'utf8');
console.log('Successfully moved confession article to position #1!');
