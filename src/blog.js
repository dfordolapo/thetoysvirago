import { BLOG_ARTICLES } from './data/articles.js';

document.addEventListener('DOMContentLoaded', () => {
  const cardsGrid = document.getElementById('blog-cards-grid');
  const indexView = document.getElementById('blog-index-view');
  const readerView = document.getElementById('article-reader-view');
  const filterPills = document.querySelectorAll('.blog-filter-pill');

  // Reader elements
  const readerCategory = document.getElementById('reader-category');
  const readerTitle = document.getElementById('reader-title');
  const readerAuthor = document.getElementById('reader-author');
  const readerDate = document.getElementById('reader-date');
  const readerTime = document.getElementById('reader-time');
  const readerHeroImg = document.getElementById('reader-hero-img');
  const readerContent = document.getElementById('reader-content');
  const readerCrumbTitle = document.getElementById('reader-crumb-title');
  const btnBack = document.getElementById('btn-back-to-articles');
  const btnTopBack = document.getElementById('btn-top-back');
  const btnCrumbJournal = document.getElementById('btn-crumb-journal');

  // Share elements
  const btnShareStory = document.getElementById('btn-share-story');
  const btnShareStoryBottom = document.getElementById('btn-share-story-bottom');
  const btnShareWhatsapp = document.getElementById('btn-share-whatsapp');
  const btnShareTwitter = document.getElementById('btn-share-twitter');

  let currentArticle = null;
  let toastTimer = null;

  // Single-line toast notification for feedback
  function showToast(msg) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-message');
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 3000);
  }

  // Canonical shareable URL
  function getShareUrl(slug) {
    const origin = window.location.origin;
    return `${origin}/blog/${encodeURIComponent(slug)}`;
  }

  // Share action with Web Share API and Clipboard fallback
  async function shareArticle(article) {
    if (!article) return;
    const shareUrl = getShareUrl(article.slug);
    const shareData = {
      title: article.title,
      text: article.excerpt || article.title,
      url: shareUrl
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: clipboard copy
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const temp = document.createElement('textarea');
        temp.value = shareUrl;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      showToast('Link copied to clipboard');
    } catch (e) {
      window.prompt('Copy article link:', shareUrl);
    }
  }

  // Render cards
  function renderArticles(filter = 'all') {
    if (!cardsGrid) return;
    const cleanFilter = (filter || 'all').toLowerCase().trim();
    const filtered = cleanFilter === 'all'
      ? BLOG_ARTICLES
      : BLOG_ARTICLES.filter(a => a.category.toLowerCase().trim() === cleanFilter);

    if (filtered.length === 0) {
      cardsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: #94a3b8;">
          <p style="font-size: 14px; margin-bottom: 14px;">No articles found in this category.</p>
          <button type="button" class="btn btn-ruby btn-sm" id="btn-reset-filter" style="border-radius: 8px !important;">View All Stories</button>
        </div>
      `;
      const btnReset = document.getElementById('btn-reset-filter');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          const allPill = document.querySelector('.blog-filter-pill[data-category="all"]');
          if (allPill) allPill.click();
          else renderArticles('all');
        });
      }
      return;
    }

    cardsGrid.innerHTML = filtered.map(article => `
      <article class="blog-card" data-slug="${article.slug}">
        <div class="blog-card-media">
          <span class="blog-card-badge">${article.category}</span>
          <img src="${article.heroImg}" alt="${article.title}" class="blog-card-img" loading="lazy" />
        </div>
        <div class="blog-card-body">
          <div class="blog-card-meta">
            <span>${article.date}</span>
            <span class="dot">•</span>
            <span>${article.readTime}</span>
          </div>
          <h2 class="blog-card-title">${article.title}</h2>
          <p class="blog-card-excerpt">${article.excerpt}</p>
          <div class="blog-card-foot">
            <span class="blog-card-readmore">
              <span>Read full story</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
            <button type="button" class="btn-card-share" data-slug="${article.slug}" title="Share story link">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              <span>Share</span>
            </button>
          </div>
        </div>
      </article>
    `).join('');

    // Attach click handlers to cards
    cardsGrid.querySelectorAll('.blog-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-card-share')) return;
        const slug = card.getAttribute('data-slug');
        openArticle(slug, true);
      });
    });

    // Attach share click handlers
    cardsGrid.querySelectorAll('.btn-card-share').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const slug = btn.getAttribute('data-slug');
        const art = BLOG_ARTICLES.find(a => a.slug === slug);
        if (art) shareArticle(art);
      });
    });
  }

  // Open single article
  function openArticle(slug, pushState = true) {
    const article = BLOG_ARTICLES.find(a => a.slug === slug);
    if (!article) return;

    currentArticle = article;

    if (readerCategory) readerCategory.textContent = article.category;
    if (readerTitle) readerTitle.textContent = article.title;
    if (readerAuthor) readerAuthor.textContent = article.author || 'TheToysVirago Team';
    if (readerDate) readerDate.textContent = article.date;
    if (readerTime) readerTime.textContent = article.readTime;
    if (readerCrumbTitle) readerCrumbTitle.textContent = article.title;
    if (readerHeroImg) {
      readerHeroImg.src = article.heroImg;
      readerHeroImg.alt = article.title;
    }
    if (readerContent) {
      readerContent.innerHTML = article.content;
    }

    // Configure share links
    const shareUrl = getShareUrl(article.slug);
    if (btnShareWhatsapp) {
      btnShareWhatsapp.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' - ' + shareUrl)}`;
    }
    if (btnShareTwitter) {
      btnShareTwitter.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}`;
    }

    if (indexView) indexView.style.display = 'none';
    if (readerView) {
      readerView.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update document title (strictly no em dashes)
    document.title = `${article.title} · The Pleasure Journal | TheToysVirago`;

    if (pushState) {
      const newUrl = `/blog/${encodeURIComponent(slug)}`;
      window.history.pushState({ slug }, '', newUrl);
    }
  }

  // Close reader and return to index
  function closeArticle(pushState = true) {
    currentArticle = null;
    if (readerView) readerView.style.display = 'none';
    if (indexView) indexView.style.display = 'block';
    // Strictly no em dashes
    document.title = 'The Pleasure Journal · Intimacy & Wellness Guides | TheToysVirago Nigeria';

    if (pushState) {
      window.history.pushState({}, '', '/blog');
    }
  }

  // Share buttons in reader view
  if (btnShareStory) {
    btnShareStory.addEventListener('click', () => {
      if (currentArticle) shareArticle(currentArticle);
    });
  }
  if (btnShareStoryBottom) {
    btnShareStoryBottom.addEventListener('click', () => {
      if (currentArticle) shareArticle(currentArticle);
    });
  }

  // Filter pills
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.getAttribute('data-category') || 'all';

      // If user was reading an article, close reader and return to list
      if (readerView && readerView.style.display !== 'none') {
        closeArticle(true);
      }

      renderArticles(cat);

      // Scroll smoothly to grid
      if (cardsGrid) {
        const gridTop = cardsGrid.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: gridTop, behavior: 'smooth' });
      }
    });
  });

  if (btnBack) {
    btnBack.addEventListener('click', () => closeArticle(true));
  }
  if (btnTopBack) {
    btnTopBack.addEventListener('click', () => closeArticle(true));
  }
  if (btnCrumbJournal) {
    btnCrumbJournal.addEventListener('click', (e) => {
      e.preventDefault();
      closeArticle(true);
    });
  }

  function getSlugFromCurrentUrl() {
    const pathMatch = window.location.pathname.match(/\/blog\/([a-zA-Z0-9_-]+)/);
    if (pathMatch && pathMatch[1] && pathMatch[1] !== 'index') return pathMatch[1];
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('post');
  }

  // Handle browser back/forward buttons
  window.addEventListener('popstate', (e) => {
    const postSlug = getSlugFromCurrentUrl();
    if (postSlug) {
      openArticle(postSlug, false);
    } else {
      closeArticle(false);
    }
  });

  // Initial render
  renderArticles('all');

  // Check URL on page load for deep-link
  const initialPost = getSlugFromCurrentUrl();
  if (initialPost) {
    openArticle(initialPost, false);
  }

  // Navigation menu toggle
  const menuBtn = document.getElementById('btn-mobile-menu');
  const dropdown = document.getElementById('nav-dropdown');
  if (menuBtn && dropdown) {
    menuBtn.addEventListener('click', () => {
      const isHidden = dropdown.style.display === 'none' || dropdown.hidden;
      dropdown.style.display = isHidden ? 'flex' : 'none';
      dropdown.hidden = !isHidden;
    });
  }

  // Stealth mode trigger
  const stealthBtn = document.getElementById('btn-stealth-nav');
  const shield = document.getElementById('stealth-shield');
  if (stealthBtn && shield) {
    stealthBtn.addEventListener('click', () => {
      shield.classList.toggle('active');
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') shield.classList.toggle('active');
    });
  }
});
