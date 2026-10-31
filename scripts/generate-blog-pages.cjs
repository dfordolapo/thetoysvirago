const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const blogTemplatePath = path.join(rootDir, 'blog.html');
const publicBlogDir = path.join(rootDir, 'public', 'blog');

async function generateBlogPages() {
  const { BLOG_ARTICLES } = await import('../src/data/articles.js');
  const baseHtml = fs.readFileSync(blogTemplatePath, 'utf8');

  if (!fs.existsSync(publicBlogDir)) {
    fs.mkdirSync(publicBlogDir, { recursive: true });
  }

  const BASE_URL = 'https://www.thetoysvirago.shop';

  for (const article of BLOG_ARTICLES) {
    const slug = article.slug;
    const pageUrl = `${BASE_URL}/blog/${slug}`;
    const imgUrl = `${BASE_URL}${article.heroImg}`;
    const cleanTitle = article.title.replace(/[\u2018\u2019]/g, "'").replace(/"/g, '&quot;');
    const fullTitle = `${cleanTitle} · The Pleasure Journal | TheToysVirago Nigeria`;
    const cleanExcerpt = article.excerpt.replace(/[\u2018\u2019]/g, "'").replace(/"/g, '&quot;');

    let html = baseHtml;

    // 1. Replace Title & Meta Description
    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${fullTitle}</title>`);
    html = html.replace(
      /<meta name="description" content="[\s\S]*?" \/>/,
      `<meta name="description" content="${cleanExcerpt}" />`
    );
    html = html.replace(
      /<link rel="canonical" href="[\s\S]*?" \/>/,
      `<link rel="canonical" href="${pageUrl}" />`
    );

    // 2. Replace Open Graph Metadata
    html = html.replace(
      /<meta property="og:type" content="[\s\S]*?" \/>/,
      `<meta property="og:type" content="article" />`
    );
    html = html.replace(
      /<meta property="og:url" content="[\s\S]*?" \/>/,
      `<meta property="og:url" content="${pageUrl}" />`
    );
    html = html.replace(
      /<meta property="og:title" content="[\s\S]*?" \/>/,
      `<meta property="og:title" content="${cleanTitle} · The Pleasure Journal" />`
    );
    html = html.replace(
      /<meta property="og:description" content="[\s\S]*?" \/>/,
      `<meta property="og:description" content="${cleanExcerpt}" />`
    );
    html = html.replace(
      /<meta property="og:image" content="[\s\S]*?" \/>/,
      `<meta property="og:image" content="${imgUrl}" />\n  <meta property="og:image:width" content="1200" />\n  <meta property="og:image:height" content="675" />`
    );

    // 3. Replace Twitter Card Metadata
    html = html.replace(
      /<meta name="twitter:title" content="[\s\S]*?" \/>/,
      `<meta name="twitter:title" content="${cleanTitle} · The Pleasure Journal" />`
    );
    html = html.replace(
      /<meta name="twitter:description" content="[\s\S]*?" \/>/,
      `<meta name="twitter:description" content="${cleanExcerpt}" />`
    );
    html = html.replace(
      /<meta name="twitter:image" content="[\s\S]*?" \/>/,
      `<meta name="twitter:image" content="${imgUrl}" />`
    );

    // 4. Pre-render Article Reader View & Hide Index Grid
    html = html.replace(
      'id="blog-index-view"',
      'id="blog-index-view" style="display: none !important;"'
    );
    html = html.replace(
      'id="article-reader-view"',
      'id="article-reader-view" style="display: block !important;"'
    );

    // Prepopulate article elements
    html = html.replace(
      '<span class="blog-card-badge" id="reader-category">Category</span>',
      `<span class="blog-card-badge" id="reader-category">${article.category}</span>`
    );
    html = html.replace(
      '<h1 class="article-headline" id="reader-title">Article Headline Goes Here</h1>',
      `<h1 class="article-headline" id="reader-title">${article.title}</h1>`
    );
    html = html.replace(
      '<span id="reader-author">TheToysVirago Team</span>',
      `<span id="reader-author">${article.author || 'TheToysVirago Team'}</span>`
    );
    html = html.replace(
      '<span id="reader-date">October 30, 2026</span>',
      `<span id="reader-date">${article.date}</span>`
    );
    html = html.replace(
      '<span id="reader-time">4 min read</span>',
      `<span id="reader-time">${article.readTime}</span>`
    );
    html = html.replace(
      '<span id="reader-crumb-title">Article</span>',
      `<span id="reader-crumb-title">${article.title}</span>`
    );
    html = html.replace(
      '<img id="reader-hero-img" src="/assets/hero-collection.webp" alt="Article Cover" />',
      `<img id="reader-hero-img" src="${article.heroImg}" alt="${cleanTitle}" />`
    );
    html = html.replace(
      '<article class="article-body" id="reader-content">\n              <!-- Dynamically populated -->\n            </article>',
      `<article class="article-body" id="reader-content">${article.content}</article>`
    );

    // Pre-populate share links
    const shareText = encodeURIComponent(`${article.title} - ${pageUrl}`);
    const tweetText = encodeURIComponent(article.title);
    const encUrl = encodeURIComponent(pageUrl);
    html = html.replace(
      'id="btn-share-whatsapp" target="_blank" rel="noopener"',
      `id="btn-share-whatsapp" href="https://api.whatsapp.com/send?text=${shareText}" target="_blank" rel="noopener"`
    );
    html = html.replace(
      'id="btn-share-twitter" target="_blank" rel="noopener"',
      `id="btn-share-twitter" href="https://twitter.com/intent/tweet?text=${tweetText}&url=${encUrl}" target="_blank" rel="noopener"`
    );

    const destFile = path.join(publicBlogDir, `${slug}.html`);
    fs.writeFileSync(destFile, html, 'utf8');
    console.log(`Generated: public/blog/${slug}.html (OG: ${imgUrl})`);
  }

  console.log(`✓ All ${BLOG_ARTICLES.length} blog post static pages generated with custom OG image metadata!`);
}

generateBlogPages().catch(err => {
  console.error('Failed to generate blog pages:', err);
  process.exit(1);
});
