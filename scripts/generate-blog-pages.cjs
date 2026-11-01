const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distBlogPath = path.join(rootDir, 'dist', 'blog.html');
const rawBlogPath = path.join(rootDir, 'blog.html');

async function generateBlogPages() {
  const { BLOG_ARTICLES } = await import('../src/data/articles.js');

  // Prefer the production compiled dist/blog.html so bundled CSS/JS and posthtml includes are already resolved
  const sourcePath = fs.existsSync(distBlogPath) ? distBlogPath : rawBlogPath;
  const baseHtml = fs.readFileSync(sourcePath, 'utf8');

  const distBlogDir = path.join(rootDir, 'dist', 'blog');
  if (!fs.existsSync(distBlogDir)) {
    fs.mkdirSync(distBlogDir, { recursive: true });
  }

  const BASE_URL = 'https://www.thetoysvirago.shop';

  for (const article of BLOG_ARTICLES) {
    const slug = article.slug;
    const pageUrl = `${BASE_URL}/blog/${slug}`;
    const imgUrl = `${BASE_URL}${article.heroImg}`;
    const cleanTitle = article.title.replace(/[\u2018\u2019]/g, "'").replace(/"/g, '&quot;');
    const seoTitle = (article.seoTitle || `${cleanTitle} · The Pleasure Journal`).replace(/"/g, '&quot;');
    const fullTitle = `${seoTitle} | TheToysVirago`;
    const cleanExcerpt = (article.metaDesc || article.excerpt).replace(/[\u2018\u2019]/g, "'").replace(/"/g, '&quot;');
    const imgAlt = (article.imgAlt || article.title).replace(/"/g, '&quot;');

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
      `<meta property="og:title" content="${seoTitle}" />`
    );
    html = html.replace(
      /<meta property="og:description" content="[\s\S]*?" \/>/,
      `<meta property="og:description" content="${cleanExcerpt}" />`
    );
    html = html.replace(
      /<meta property="og:image" content="[\s\S]*?" \/>/,
      `<meta property="og:image" content="${imgUrl}" />\n  <meta property="og:image:alt" content="${imgAlt}" />\n  <meta property="og:image:width" content="1200" />\n  <meta property="og:image:height" content="675" />`
    );

    // 3. Replace Twitter Card Metadata
    html = html.replace(
      /<meta name="twitter:title" content="[\s\S]*?" \/>/,
      `<meta name="twitter:title" content="${seoTitle}" />`
    );
    html = html.replace(
      /<meta name="twitter:description" content="[\s\S]*?" \/>/,
      `<meta name="twitter:description" content="${cleanExcerpt}" />`
    );
    html = html.replace(
      /<meta name="twitter:image" content="[\s\S]*?" \/>/,
      `<meta name="twitter:image" content="${imgUrl}" />\n  <meta name="twitter:image:alt" content="${imgAlt}" />`
    );

    // 4. Inject Schema.org BlogPosting & BreadcrumbList structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BlogPosting",
          "@id": `${pageUrl}#article`,
          "isPartOf": {
            "@type": "Blog",
            "@id": `${BASE_URL}/blog#blog`,
            "name": "The Pleasure Journal",
            "publisher": {
              "@type": "Organization",
              "name": "TheToysVirago",
              "url": BASE_URL
            }
          },
          "headline": cleanTitle,
          "alternativeHeadline": article.seoTitle || cleanTitle,
          "description": cleanExcerpt,
          "url": pageUrl,
          "mainEntityOfPage": pageUrl,
          "datePublished": article.datePublished || "2026-10-30T09:00:00+01:00",
          "dateModified": article.dateModified || "2026-11-01T08:00:00+01:00",
          "author": {
            "@type": "Organization",
            "name": "TheToysVirago Team",
            "url": BASE_URL
          },
          "publisher": {
            "@type": "Organization",
            "name": "TheToysVirago",
            "url": BASE_URL,
            "logo": {
              "@type": "ImageObject",
              "url": `${BASE_URL}/assets/logo.jpg`
            }
          },
          "image": {
            "@type": "ImageObject",
            "url": imgUrl,
            "caption": imgAlt
          },
          "keywords": article.searchPhrase || "intimate wellness Nigeria"
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${pageUrl}#breadcrumb`,
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": `${BASE_URL}/`
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "The Pleasure Journal",
              "item": `${BASE_URL}/blog`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": cleanTitle,
              "item": pageUrl
            }
          ]
        }
      ]
    };

    const structuredScript = `<script type="application/ld+json">\n${JSON.stringify(structuredData, null, 2)}\n  </script>`;
    // Replace default Blog structured data with this article's specific BlogPosting schema
    html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, structuredScript);

    // 5. Pre-render Article Reader View & Hide Index Grid and Hero
    html = html.replace(
      'id="blog-hero-section"',
      'id="blog-hero-section" style="display: none !important;"'
    );
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
      '<span class="blog-card-badge article-badge-hero" id="reader-category">Category</span>',
      `<span class="blog-card-badge article-badge-hero" id="reader-category">${article.category}</span>`
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
      'id="article-hero-bg"',
      `id="article-hero-bg" style="background-image: url('${article.heroImg}');"`
    );
    html = html.replace(
      /<article class="article-body" id="reader-content">[\s\S]*?<\/article>/,
      `<article class="article-body" id="reader-content">${article.content}</article>`
    );

    // Pre-populate share links if present
    const shareText = encodeURIComponent(`${article.title} - ${pageUrl}`);
    const tweetText = encodeURIComponent(article.title);
    const encUrl = encodeURIComponent(pageUrl);
    if (html.includes('id="btn-share-whatsapp"')) {
      html = html.replace(
        /id="btn-share-whatsapp"[^>]*>/,
        `id="btn-share-whatsapp" href="https://api.whatsapp.com/send?text=${shareText}" target="_blank" rel="noopener">`
      );
    }
    if (html.includes('id="btn-share-twitter"')) {
      html = html.replace(
        /id="btn-share-twitter"[^>]*>/,
        `id="btn-share-twitter" href="https://twitter.com/intent/tweet?text=${tweetText}&url=${encUrl}" target="_blank" rel="noopener">`
      );
    }

    const destFile = path.join(distBlogDir, `${slug}.html`);
    fs.writeFileSync(destFile, html, { encoding: 'utf8' });
    console.log(`Generated: dist/blog/${slug}.html (SEO: ${seoTitle})`);
  }

  console.log(`✓ All ${BLOG_ARTICLES.length} blog post static pages generated in dist/blog/ with custom Schema.org & SEO metadata!`);
}

generateBlogPages().catch(err => {
  console.error('Failed to generate blog pages:', err);
  process.exit(1);
});
