import { initWhatsAppWidget } from './modules/whatsappWidget.js';
import { initPullToRefresh } from './modules/pullToRefresh.js';
import { BLOG_ARTICLES } from './data/articles.js';

document.addEventListener('DOMContentLoaded', () => {
  initWhatsAppWidget();
  initPullToRefresh();
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
        <div class="empty-box" style="grid-column: 1 / -1;">
          <div class="empty-icon-badge">✍️</div>
          <h3 class="empty-box-title">More bedtime stories coming.</h3>
          <p class="empty-box-desc">We haven't filed any dispatches in this category yet, but our pleasure writers are on it.</p>
          <div class="empty-box-actions">
            <button type="button" class="btn btn-ruby btn-md" id="btn-reset-filter" style="border-radius: 8px !important;">Explore All Articles</button>
          </div>
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
          <img src="${article.heroImg}" alt="${article.title}" class="blog-card-img" loading="lazy" onerror="this.onerror=null; this.src='/assets/hero-collection.webp';" />
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
    if (!article) {
      // Friendly, playful 404 article error state
      if (readerView && readerContent) {
        if (readerCategory) readerCategory.textContent = 'Lost in the Sheets';
        if (readerTitle) readerTitle.textContent = 'This article slipped away.';
        if (readerAuthor) readerAuthor.textContent = 'TheToysVirago';
        if (readerDate) readerDate.textContent = 'Dispatches';
        if (readerTime) readerTime.textContent = '1 min';
        if (readerCrumbTitle) readerCrumbTitle.textContent = 'Story Not Found';
        readerContent.innerHTML = `
          <div class="error-box" style="margin: 40px auto;">
            <div class="error-icon-badge">📄</div>
            <h3 class="error-box-title">We couldn't find this piece.</h3>
            <p class="error-box-desc">It may have been moved, renamed, or retired to make room for fresh intimacy dispatches.</p>
            <div class="error-box-actions">
              <button type="button" class="btn btn-ruby btn-md" id="btn-err-back-to-journal" style="border-radius: 8px !important;">Back to Pleasure Journal</button>
            </div>
          </div>
        `;
        const heroSection = document.getElementById('blog-hero-section');
        if (heroSection) heroSection.style.display = 'none';
        if (indexView) indexView.style.display = 'none';
        readerView.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'instant' });
        const btnErrBack = document.getElementById('btn-err-back-to-journal');
        if (btnErrBack) {
          btnErrBack.addEventListener('click', () => closeArticle(true));
        }
      }
      return;
    }

    currentArticle = article;

    if (readerCategory) readerCategory.textContent = article.category;
    if (readerTitle) readerTitle.textContent = article.title;
    if (readerAuthor) readerAuthor.textContent = article.author || 'TheToysVirago Team';
    if (readerDate) readerDate.textContent = article.date;
    if (readerTime) readerTime.textContent = article.readTime;
    if (readerCrumbTitle) readerCrumbTitle.textContent = article.title;
    const heroBg = document.getElementById('article-hero-bg');
    if (heroBg && article.heroImg) {
      heroBg.style.backgroundImage = `url('${article.heroImg}')`;
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

    const heroSection = document.getElementById('blog-hero-section');
    if (heroSection) heroSection.style.display = 'none';
    if (indexView) indexView.style.display = 'none';
    if (readerView) {
      readerView.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Update document title and meta description (strictly no em dashes)
    document.title = article.seoTitle ? `${article.seoTitle} | TheToysVirago` : `${article.title} · The Pleasure Journal | TheToysVirago`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && article.metaDesc) {
      metaDesc.setAttribute('content', article.metaDesc);
    }

    if (pushState) {
      const newUrl = `/blog/${encodeURIComponent(slug)}`;
      window.history.pushState({ slug }, '', newUrl);
    }
  }

  // Close reader and return to index
  function closeArticle(pushState = true) {
    currentArticle = null;
    const heroSection = document.getElementById('blog-hero-section');
    if (heroSection) heroSection.style.display = '';
    if (readerView) readerView.style.display = 'none';
    if (indexView) indexView.style.display = 'block';
    // Strictly no em dashes
    document.title = 'The Pleasure Journal · Intimacy & Wellness Guides | TheToysVirago Nigeria';

    // Always scroll to the top of the Journal page
    window.scrollTo({ top: 0, behavior: 'instant' });

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
    btnBack.addEventListener('click', (e) => {
      e.preventDefault();
      closeArticle(true);
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }
  if (btnTopBack) {
    btnTopBack.addEventListener('click', (e) => {
      e.preventDefault();
      closeArticle(true);
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }
  const btnCompactBack = document.getElementById('btn-compact-back');
  if (btnCompactBack) {
    btnCompactBack.addEventListener('click', () => closeArticle(true));
  }
  const btnCompactBrand = document.getElementById('btn-compact-journal-brand');
  if (btnCompactBrand) {
    btnCompactBrand.addEventListener('click', (e) => {
      e.preventDefault();
      closeArticle(true);
    });
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
  const blogAppWrapper = document.getElementById('app-wrapper');
  const blogBtnExitStealth = document.getElementById('btn-exit-stealth');
  const blogBtnShuffleStealth = document.getElementById('btn-stealth-shuffle');
  const blogOriginalTitle = document.title;

  const BLOG_STEALTH_DISGUISES = [
    { id: 'stealth-view-excel', title: 'Q4_Enterprise_Logistics_Inventory_Audit_Consolidated.xlsx - Excel' },
    { id: 'stealth-view-google', title: 'best inverter battery lagos 2026 - Google Search' },
    { id: 'stealth-view-wikipedia', title: 'Plate tectonics - Wikipedia' },
    { id: 'stealth-view-news', title: 'CBN Issues Updated Liquidity Risk Guidelines - BusinessDay' },
    { id: 'stealth-view-recipe', title: 'Authentic Smoky Party Jollof Rice Recipe - 9jaFoodie' }
  ];
  let blogStealthIdx = 0;
  let blogIsStealth = false;

  function applyBlogDisguise(idx) {
    blogStealthIdx = (idx + BLOG_STEALTH_DISGUISES.length) % BLOG_STEALTH_DISGUISES.length;
    const current = BLOG_STEALTH_DISGUISES[blogStealthIdx];
    BLOG_STEALTH_DISGUISES.forEach((d, i) => {
      const el = document.getElementById(d.id);
      if (el) {
        if (i === blogStealthIdx) {
          el.style.display = d.id === 'stealth-view-excel' ? 'flex' : 'block';
        } else {
          el.style.display = 'none';
        }
      }
    });
    document.title = current.title;
  }

  function activateBlogStealth() {
    blogIsStealth = true;
    let rnd = Math.floor(Math.random() * BLOG_STEALTH_DISGUISES.length);
    if (rnd === blogStealthIdx && BLOG_STEALTH_DISGUISES.length > 1) {
      rnd = (rnd + 1) % BLOG_STEALTH_DISGUISES.length;
    }
    applyBlogDisguise(rnd);
    if (shield) {
      shield.removeAttribute('hidden');
      shield.style.display = 'block';
    }
    if (blogAppWrapper) blogAppWrapper.style.display = 'none';
  }

  function deactivateBlogStealth() {
    blogIsStealth = false;
    if (shield) {
      shield.setAttribute('hidden', '');
      shield.style.display = 'none';
    }
    if (blogAppWrapper) blogAppWrapper.style.display = 'block';
    document.title = blogOriginalTitle;
  }

  if (stealthBtn && shield) {
    stealthBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (blogIsStealth) deactivateBlogStealth();
      else activateBlogStealth();
    });
    if (blogBtnExitStealth) {
      blogBtnExitStealth.addEventListener('click', deactivateBlogStealth);
    }
    if (blogBtnShuffleStealth) {
      blogBtnShuffleStealth.addEventListener('click', () => {
        applyBlogDisguise((blogStealthIdx + 1) % BLOG_STEALTH_DISGUISES.length);
      });
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (blogIsStealth) deactivateBlogStealth();
        else activateBlogStealth();
      } else if (e.altKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        if (blogIsStealth) deactivateBlogStealth();
        else activateBlogStealth();
      }
    });
  }

  // -------------------------------------------------------------------------
  // BLOG LIGHT / DARK MODE TOGGLE SYSTEM
  // -------------------------------------------------------------------------
  const themeToggleBtns = document.querySelectorAll('.blog-theme-toggle');

  function updateThemeUI(theme) {
    const isLight = theme === 'light';
    if (isLight) {
      document.documentElement.classList.add('blog-light-mode');
      document.body.classList.add('blog-light-mode');
    } else {
      document.documentElement.classList.remove('blog-light-mode');
      document.body.classList.remove('blog-light-mode');
    }

    themeToggleBtns.forEach((btn) => {
      const sunIcon = btn.querySelector('.theme-icon-sun');
      const moonIcon = btn.querySelector('.theme-icon-moon');
      const label = btn.querySelector('.theme-toggle-label');

      if (sunIcon) sunIcon.style.display = isLight ? 'none' : 'inline-block';
      if (moonIcon) moonIcon.style.display = isLight ? 'inline-block' : 'none';
      if (label) label.textContent = isLight ? 'Dark Mode' : 'Light Mode';
      btn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
      btn.setAttribute('title', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
    });
  }

  function toggleBlogTheme() {
    const currentTheme = document.body.classList.contains('blog-light-mode') ? 'light' : 'dark';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    try {
      localStorage.setItem('ttv_blog_theme', nextTheme);
    } catch (e) {}
    updateThemeUI(nextTheme);
    showToast(nextTheme === 'light' ? 'Light mode enabled' : 'Dark mode enabled');
  }

  // Initial Theme sync from localStorage
  let savedTheme = 'dark';
  try {
    savedTheme = localStorage.getItem('ttv_blog_theme') || 'dark';
  } catch (e) {}
  updateThemeUI(savedTheme);

  themeToggleBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleBlogTheme();
    });
  });

  // Offline detection banner
  const offlineBanner = document.getElementById('offline-banner');
  const btnCloseOffline = document.getElementById('btn-close-offline-banner');

  function updateNetworkStatus() {
    const isOffline = !navigator.onLine;

    if (offlineBanner) {
      if (isOffline) {
        offlineBanner.removeAttribute('hidden');
        offlineBanner.style.display = 'flex';
      } else {
        offlineBanner.setAttribute('hidden', '');
        offlineBanner.style.display = 'none';
      }
    }
  }

  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  if (btnCloseOffline && offlineBanner) {
    btnCloseOffline.addEventListener('click', () => {
      offlineBanner.setAttribute('hidden', '');
      offlineBanner.style.display = 'none';
    });
  }
  updateNetworkStatus();

  // Error States Gallery Modal in Blog
  const btnOpenBlogErrorStates = document.getElementById('btn-open-error-states');
  const blogErrorStatesModal = document.getElementById('error-states-modal');
  const btnCloseBlogErrorStates = document.getElementById('btn-close-error-states');

  if (btnOpenBlogErrorStates && blogErrorStatesModal) {
    btnOpenBlogErrorStates.addEventListener('click', (e) => {
      e.preventDefault();
      if (dropdown) {
        dropdown.setAttribute('hidden', '');
        dropdown.style.display = 'none';
      }
      blogErrorStatesModal.removeAttribute('hidden');
      blogErrorStatesModal.style.display = 'flex';
    });
  }

  if (btnCloseBlogErrorStates && blogErrorStatesModal) {
    btnCloseBlogErrorStates.addEventListener('click', () => {
      blogErrorStatesModal.setAttribute('hidden', '');
      blogErrorStatesModal.style.display = 'none';
    });
    blogErrorStatesModal.addEventListener('click', (e) => {
      if (e.target === blogErrorStatesModal) {
        blogErrorStatesModal.setAttribute('hidden', '');
        blogErrorStatesModal.style.display = 'none';
      }
    });
  }

  document.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.error-tab-btn');
    if (tabBtn) {
      const tabId = tabBtn.dataset.tab;
      document.querySelectorAll('.error-tab-btn').forEach(b => b.classList.toggle('active', b === tabBtn));
      document.querySelectorAll('.error-state-view').forEach(v => {
        v.classList.toggle('active', v.id === `view-${tabId}`);
      });
    }
  });

  // Image download protection (Disable context menu & drag on blog images)
  document.addEventListener('contextmenu', (e) => {
    if (e.target && (e.target.tagName === 'IMG' || e.target.closest('img') || e.target.tagName === 'PICTURE')) {
      e.preventDefault();
      return false;
    }
  }, { capture: true });

  document.addEventListener('dragstart', (e) => {
    if (e.target && (e.target.tagName === 'IMG' || e.target.closest('img'))) {
      e.preventDefault();
      return false;
    }
  }, { capture: true });
});
