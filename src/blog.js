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

  // Render cards
  function renderArticles(filter = 'all') {
    if (!cardsGrid) return;
    const filtered = filter === 'all'
      ? BLOG_ARTICLES
      : BLOG_ARTICLES.filter(a => a.category.toLowerCase() === filter.toLowerCase());

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
            <span>Read full story</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </div>
      </article>
    `).join('');

    // Attach click handlers to cards
    cardsGrid.querySelectorAll('.blog-card').forEach(card => {
      card.addEventListener('click', () => {
        const slug = card.getAttribute('data-slug');
        openArticle(slug, true);
      });
    });
  }

  // Open single article
  function openArticle(slug, pushState = true) {
    const article = BLOG_ARTICLES.find(a => a.slug === slug);
    if (!article) return;

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

    if (indexView) indexView.style.display = 'none';
    if (readerView) {
      readerView.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update document title
    document.title = `${article.title} — The Pleasure Edit | TheToysVirago`;

    if (pushState) {
      const newUrl = `${window.location.pathname}?post=${encodeURIComponent(slug)}`;
      window.history.pushState({ slug }, '', newUrl);
    }
  }

  // Close reader and return to index
  function closeArticle(pushState = true) {
    if (readerView) readerView.style.display = 'none';
    if (indexView) indexView.style.display = 'block';
    document.title = 'The Pleasure Edit — Intimacy & Wellness Guides | TheToysVirago Nigeria';

    if (pushState) {
      window.history.pushState({}, '', window.location.pathname);
    }
  }

  // Filter pills
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.getAttribute('data-category');
      renderArticles(cat);
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

  // Handle browser back/forward buttons
  window.addEventListener('popstate', (e) => {
    const params = new URLSearchParams(window.location.search);
    const postSlug = params.get('post');
    if (postSlug) {
      openArticle(postSlug, false);
    } else {
      closeArticle(false);
    }
  });

  // Initial render
  renderArticles('all');

  // Check URL on page load for deep-link
  const urlParams = new URLSearchParams(window.location.search);
  const initialPost = urlParams.get('post');
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
