const fs = require('fs');
const path = require('path');

function auditFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const imgTags = content.match(/<img[^>]*>/gi) || [];
  
  let eager = 0;
  let lazy = 0;
  let missingLoading = 0;
  let missingDecoding = 0;
  let jpgPngSources = [];

  imgTags.forEach(tag => {
    if (tag.includes('loading="eager"') || tag.includes("loading='eager'")) eager++;
    else if (tag.includes('loading="lazy"') || tag.includes("loading='lazy'")) lazy++;
    else missingLoading++;

    if (!tag.includes('decoding="async"') && !tag.includes("decoding='async'")) missingDecoding++;

    const srcMatch = tag.match(/src=["']([^"']+)["']/i);
    if (srcMatch && /\.(jpe?g|png)$/i.test(srcMatch[1])) {
      jpgPngSources.push(srcMatch[1]);
    }
  });

  console.log(`=== Audit: ${filePath} ===`);
  console.log(`Total <img> tags: ${imgTags.length}`);
  console.log(`Eager: ${eager}, Lazy: ${lazy}, Missing loading: ${missingLoading}`);
  console.log(`Missing decoding=async: ${missingDecoding}`);
  console.log(`JPG/PNG sources that could be .webp: ${jpgPngSources.length}`);
  if (jpgPngSources.length > 0) {
    console.log('Sample JPG/PNG sources:', jpgPngSources.slice(0, 10));
  }
}

['index.html', 'products.html', 'blog.html'].forEach(f => auditFile(path.join(__dirname, '..', f)));
