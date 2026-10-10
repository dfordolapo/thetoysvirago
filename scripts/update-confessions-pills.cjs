const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. NEW CSS FOR SCATTERED PILLS POPPING OUT OF CARDBOARD BOX
const cssContent = `/* ── THE CONFESSIONS CARDBOARD BOX SLIDESHOW (SCATTERED PILLS) ── */
.toybox-section {
  padding: 48px 0 56px;
  background: #000000 !important;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
}

.toybox-header {
  text-align: center;
  margin-bottom: 24px;
}
.toybox-header .sh2 {
  font-size: clamp(26px, 4vw, 36px);
  margin: 0;
  color: #ffffff;
  letter-spacing: -0.01em;
}

/* 3D Box Container Stage */
.toybox-stage {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  position: relative;
}

.cardboard-box-wrapper {
  position: relative;
  width: 100%;
  max-width: 520px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cardboard-box-img {
  width: 100%;
  height: auto;
  max-height: 380px;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 20px 45px rgba(0, 0, 0, 0.95));
  user-select: none;
  pointer-events: none;
}

/* ── SLIDESHOW VIEWPORT FOR SCATTERED PILLS ──────────────── */
.confessions-slider-wrap {
  position: absolute;
  top: 10%;
  width: 92%;
  max-width: 440px;
  z-index: 10;
  overflow: visible;
  pointer-events: none;
}

.confessions-slider-viewport {
  width: 100%;
  min-height: 190px;
  overflow: hidden;
  position: relative;
  pointer-events: auto;
}

.confessions-slides-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.38s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

.confession-slide {
  min-width: 100%;
  max-width: 100%;
  width: 100%;
  flex-shrink: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 4px;
}

/* Scattered Pills Cluster */
.confession-pills-cluster {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  max-width: 400px;
}

.confession-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(14, 15, 23, 0.94);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 9999px;
  padding: 8px 16px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.35;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(225, 29, 72, 0.16);
  transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
  pointer-events: auto;
  cursor: default;
  will-change: transform, opacity;
}

.confession-pill:hover {
  border-color: rgba(225, 29, 72, 0.6);
  background: rgba(24, 25, 36, 0.98);
}

.pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e11d48;
  box-shadow: 0 0 8px #e11d48;
  flex-shrink: 0;
}

.pill-text {
  color: #f3f4f6;
  white-space: normal;
}

/* Organic Scatter Positions & Rotations */
.pill-scatter-1 {
  align-self: flex-start;
  margin-left: 8px;
  transform: rotate(-2.8deg);
}

.pill-scatter-2 {
  align-self: flex-end;
  margin-right: 8px;
  transform: rotate(3deg);
}

.pill-scatter-3 {
  align-self: center;
  transform: rotate(-1.2deg);
}

/* Staggered Pop-out Animation from Inside the Box */
.confession-slide.active .confession-pill.pill-scatter-1 {
  animation: popOutPill1 0.46s cubic-bezier(0.16, 1, 0.3, 1) 0.03s both;
}

.confession-slide.active .confession-pill.pill-scatter-2 {
  animation: popOutPill2 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.11s both;
}

.confession-slide.active .confession-pill.pill-scatter-3 {
  animation: popOutPill3 0.54s cubic-bezier(0.16, 1, 0.3, 1) 0.19s both;
}

@keyframes popOutPill1 {
  0% {
    opacity: 0;
    transform: translateY(45px) rotate(-2.8deg) scale(0.65);
  }
  70% {
    opacity: 1;
    transform: translateY(-4px) rotate(-2.8deg) scale(1.03);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(-2.8deg) scale(1);
  }
}

@keyframes popOutPill2 {
  0% {
    opacity: 0;
    transform: translateY(50px) rotate(3deg) scale(0.65);
  }
  70% {
    opacity: 1;
    transform: translateY(-4px) rotate(3deg) scale(1.03);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(3deg) scale(1);
  }
}

@keyframes popOutPill3 {
  0% {
    opacity: 0;
    transform: translateY(45px) rotate(-1.2deg) scale(0.65);
  }
  70% {
    opacity: 1;
    transform: translateY(-4px) rotate(-1.2deg) scale(1.03);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(-1.2deg) scale(1);
  }
}

/* Slideshow Left/Right Arrow Navs */
.confession-slider-nav {
  position: absolute;
  top: 50%;
  left: -20px;
  right: -20px;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  z-index: 30;
}

.confession-arrow-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(20, 20, 28, 0.9);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6);
}

.confession-arrow-btn:hover {
  background: #e11d48;
  border-color: #e11d48;
  transform: scale(1.08);
}

/* ── TOYS UNDERNEATH (SIDEWAYS SCROLL) ───────────── */
.toy-selector-section {
  max-width: 680px;
  margin: 18px auto 0;
}

.toy-selector-scroll-wrap {
  width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding: 4px;
}
.toy-selector-scroll-wrap::-webkit-scrollbar {
  display: none;
}

.toy-selector-track {
  display: flex;
  gap: 12px;
  justify-content: center;
  min-width: max-content;
  padding: 0 4px;
}

.toy-tab-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 95px;
}
.toy-tab-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}
.toy-tab-card.active {
  background: rgba(225, 29, 72, 0.2);
  border-color: #fb7185;
  transform: translateY(-3px);
}

.toy-tab-img-wrap {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  overflow: hidden;
}
.toy-tab-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.toy-tab-name {
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
}

/* ── CTA: "SHARE YOUR CONFESSION" ───────────────── */
.toybox-share-row {
  margin-top: 22px;
  display: flex;
  justify-content: center;
}
.btn-share-confession {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #be123c;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 12px 28px;
  border-radius: var(--r-pill);
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-share-confession:hover {
  background: #e11d48;
  transform: translateY(-2px);
  border-color: #ffffff;
}

@media (max-width: 600px) {
  .toybox-section {
    padding: 32px 0 40px;
  }
  .cardboard-box-wrapper {
    max-width: 340px;
  }
  .cardboard-box-img {
    max-height: 260px;
  }
  .confessions-slider-wrap {
    top: 7%;
    max-width: 310px;
  }
  .confessions-slider-viewport {
    min-height: 165px;
  }
  .confession-pills-cluster {
    gap: 9px;
  }
  .confession-pill {
    padding: 6.5px 12px;
    font-size: 11.5px;
  }
  .pill-scatter-1 {
    margin-left: 2px;
  }
  .pill-scatter-2 {
    margin-right: 2px;
  }
  .confession-slider-nav {
    left: -12px;
    right: -12px;
  }
  .confession-arrow-btn {
    width: 30px;
    height: 30px;
  }
  .toy-selector-track {
    justify-content: flex-start;
  }
  .toy-tab-card {
    min-width: 86px;
    padding: 6px 8px;
  }
  .toy-tab-img-wrap {
    width: 38px;
    height: 38px;
  }
  .btn-share-confession {
    font-size: 12.5px;
    padding: 10px 22px;
  }
}
`;

// UPDATE src/style.css
const styleCssPath = path.join(rootDir, 'src', 'style.css');
let styleCss = fs.readFileSync(styleCssPath, 'utf8');

const sIdx = styleCss.indexOf('/* ── THE CONFESSIONS CARDBOARD BOX');
const eIdx = styleCss.indexOf('/* Share Link Button */');

if (sIdx !== -1 && eIdx !== -1) {
  styleCss = styleCss.slice(0, sIdx) + cssContent + '\n\n' + styleCss.slice(eIdx);
  fs.writeFileSync(styleCssPath, styleCss, 'utf8');
  console.log('✓ Successfully updated src/style.css with Scattered Pills CSS');
} else {
  console.error('Could not find markers in style.css', { sIdx, eIdx });
}

// 2. HTML FOR SCATTERED PILLS POPPING OUT OF BOX
const htmlContent = `    <!-- ===== THE CONFESSIONS CARDBOARD BOX SLIDESHOW ===== -->
    <section class="toybox-section" id="whispers">
      <div class="section-inner">
        <!-- Heading Only -->
        <div class="toybox-header">
          <h2 class="sh2">Confessions</h2>
        </div>

        <!-- 3D Cardboard Box Stage with Pop-out Slideshow -->
        <div class="toybox-stage">
          <div class="cardboard-box-wrapper" id="cardboard-box-wrap">
            <!-- 3D Render Image of Cardboard Box with Toys & Rumpled Letters -->
            <img src="/assets/confessions-box.webp" alt="Cardboard Confessions Box with Toys and Rumpled Letters" class="cardboard-box-img" id="cardboard-box-img" />

            <!-- SLIDESHOW POPPING OUT FROM INSIDE THE BOX AS SCATTERED PILLS -->
            <div class="confessions-slider-wrap" id="confessions-slider-wrap">
              <!-- Slideshow Viewport -->
              <div class="confessions-slider-viewport">
                <div class="confessions-slides-track" id="confessions-slides-track">
                  
                  <!-- SLIDE 0: The Rose Sucker -->
                  <div class="confession-slide active" data-index="0">
                    <div class="confession-pills-cluster">
                      <div class="confession-pill pill-scatter-1">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"roommate thought it was skincare docs 😭"</span>
                      </div>
                      <div class="confession-pill pill-scatter-2">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"cancel tomorrow... rose took me out in 3 mins 🌹"</span>
                      </div>
                      <div class="confession-pill pill-scatter-3">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"zero branding on package, 100% discreet 🔒"</span>
                      </div>
                    </div>
                  </div>

                  <!-- SLIDE 1: The Mini Wand -->
                  <div class="confession-slide" data-index="1">
                    <div class="confession-pills-cluster">
                      <div class="confession-pill pill-scatter-1">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"standing in bathroom and my knees gave way 🫠"</span>
                      </div>
                      <div class="confession-pill pill-scatter-2">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"medical-grade motor hits completely different ⚡"</span>
                      </div>
                      <div class="confession-pill pill-scatter-3">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"whisper quiet, nobody in the house heard a thing 🤫"</span>
                      </div>
                    </div>
                  </div>

                  <!-- SLIDE 2: Pocket Bullet -->
                  <div class="confession-slide" data-index="2">
                    <div class="confession-pills-cluster">
                      <div class="confession-pill pill-scatter-1">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"strict landlady handed me the package 😂"</span>
                      </div>
                      <div class="confession-pill pill-scatter-2">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"'sister your serum arrived'... I almost passed out laughing"</span>
                      </div>
                      <div class="confession-pill pill-scatter-3">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"plain brown box, zero drama 📦"</span>
                      </div>
                    </div>
                  </div>

                  <!-- SLIDE 3: The Siren -->
                  <div class="confession-slide" data-index="3">
                    <div class="confession-pills-cluster">
                      <div class="confession-pill pill-scatter-1">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"he had app control from Heathrow while I was at dinner 🥵"</span>
                      </div>
                      <div class="confession-pill pill-scatter-2">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"gripping my bag with white knuckles so I wouldn't scream"</span>
                      </div>
                      <div class="confession-pill pill-scatter-3">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"global sync is unreal, 1000/10 🖤"</span>
                      </div>
                    </div>
                  </div>

                  <!-- SLIDE 4: African Brute -->
                  <div class="confession-slide" data-index="4">
                    <div class="confession-pills-cluster">
                      <div class="confession-pill pill-scatter-1">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"took two spoons of tonic + rabbit ring 🔥"</span>
                      </div>
                      <div class="confession-pill pill-scatter-2">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"had to cancel Sunday morning plans entirely ⚡"</span>
                      </div>
                      <div class="confession-pill pill-scatter-3">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"three rounds back to back, insane energy 💪"</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <!-- Slideshow Left/Right Arrow Navs -->
              <div class="confession-slider-nav">
                <button type="button" class="confession-arrow-btn" id="btn-confession-prev" aria-label="Previous confession">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button type="button" class="confession-arrow-btn" id="btn-confession-next" aria-label="Next confession">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>

            </div>

          </div>
        </div>

        <!-- The Toys Underneath (Sideways Scroll) -->
        <div class="toy-selector-section">
          <div class="toy-selector-scroll-wrap">
            <div class="toy-selector-track" id="toy-selector-track">
              <button type="button" class="toy-tab-card active" data-toy-idx="0">
                <div class="toy-tab-img-wrap">
                  <img src="/assets/product-rose.webp" alt="The Rose Sucker" />
                </div>
                <span class="toy-tab-name">The Rose Sucker</span>
              </button>

              <button type="button" class="toy-tab-card" data-toy-idx="1">
                <div class="toy-tab-img-wrap">
                  <img src="/assets/product-wand.webp" alt="The Mini Wand" />
                </div>
                <span class="toy-tab-name">The Mini Wand</span>
              </button>

              <button type="button" class="toy-tab-card" data-toy-idx="2">
                <div class="toy-tab-img-wrap">
                  <img src="/assets/product-bullet.webp" alt="Pocket Bullet" />
                </div>
                <span class="toy-tab-name">Pocket Bullet</span>
              </button>

              <button type="button" class="toy-tab-card" data-toy-idx="3">
                <div class="toy-tab-img-wrap">
                  <img src="/assets/siren-app-red.webp" alt="The Siren" />
                </div>
                <span class="toy-tab-name">The Siren</span>
              </button>

              <button type="button" class="toy-tab-card" data-toy-idx="4">
                <div class="toy-tab-img-wrap">
                  <img src="/assets/african-brute.webp" alt="African Brute" />
                </div>
                <span class="toy-tab-name">African Brute</span>
              </button>
            </div>
          </div>
        </div>

        <!-- CTA: Share Your Confession -->
        <div class="toybox-share-row">
          <button type="button" class="btn-share-confession" id="btn-open-confession">
            Share your confession
          </button>
        </div>

      </div>
    </section>`;

// UPDATE index.html
const indexHtmlPath = path.join(rootDir, 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

const oldHtmlStart = indexHtml.indexOf('<!-- ===== THE CONFESSIONS CARDBOARD BOX');
const discretionStart = indexHtml.indexOf('<!-- ===== DISCRETION ===== -->');

if (oldHtmlStart !== -1 && discretionStart !== -1) {
  indexHtml = indexHtml.slice(0, oldHtmlStart) + htmlContent + '\n\n    ' + indexHtml.slice(discretionStart);
  fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
  console.log('✓ Successfully updated index.html with Scattered Pills');
} else {
  console.error('Could not find markers in index.html', { oldHtmlStart, discretionStart });
}

// UPDATE products.html
const productsHtmlPath = path.join(rootDir, 'products.html');
let productsHtml = fs.readFileSync(productsHtmlPath, 'utf8');

const prodHtmlStart = productsHtml.indexOf('<!-- ===== THE CONFESSIONS CARDBOARD BOX');
const prodFooterStart = productsHtml.indexOf('<!-- ===== FOOTER ===== -->');

if (prodHtmlStart !== -1 && prodFooterStart !== -1) {
  productsHtml = productsHtml.slice(0, prodHtmlStart) + htmlContent + '\n\n    ' + productsHtml.slice(prodFooterStart);
  fs.writeFileSync(productsHtmlPath, productsHtml, 'utf8');
  console.log('✓ Successfully updated products.html with Scattered Pills');
} else {
  console.error('Could not find markers in products.html', { prodHtmlStart, prodFooterStart });
}

// 3. JAVASCRIPT FOR CONFESSIONS SLIDESHOW LOGIC
const jsContent = `// ================= 10. CONFESSIONS SLIDESHOW LOGIC =================
function initConfessionsSlideshow() {
  const track = document.getElementById('confessions-slides-track');
  const slides = document.querySelectorAll('.confession-slide');
  const toyTabs = document.querySelectorAll('.toy-tab-card');
  const btnPrev = document.getElementById('btn-confession-prev');
  const btnNext = document.getElementById('btn-confession-next');
  const sliderWrap = document.getElementById('confessions-slider-wrap');

  if (!track || !slides.length) return;

  let currentSlide = 0;
  const totalSlides = slides.length;

  function goToSlide(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    currentSlide = index;

    // Shift track like collections slideshow
    track.style.transform = \`translateX(-\${currentSlide * 100}%)\`;

    // Active slide class triggers staggered pop-out animations for pills
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === currentSlide);
    });

    // Update active toy tab underneath
    toyTabs.forEach((tab, i) => {
      tab.classList.toggle('active', i === currentSlide);
    });
  }

  toyTabs.forEach((tab, i) => {
    tab.addEventListener('click', () => goToSlide(i));
  });

  if (btnPrev) {
    btnPrev.addEventListener('click', () => goToSlide(currentSlide - 1));
  }
  if (btnNext) {
    btnNext.addEventListener('click', () => goToSlide(currentSlide + 1));
  }

  // Touch Swipe Support
  if (sliderWrap) {
    let touchStartX = 0;
    let touchEndX = 0;
    sliderWrap.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderWrap.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          goToSlide(currentSlide - 1);
        } else {
          goToSlide(currentSlide + 1);
        }
      }
    }, { passive: true });
  }

  // Modal open
  const modal = document.getElementById('confession-modal');
  const btnOpen = document.getElementById('btn-open-confession');
  const btnClose = document.getElementById('btn-close-confession');
  const form = document.getElementById('confession-form');

  if (btnOpen && modal) {
    btnOpen.addEventListener('click', () => {
      modal.removeAttribute('hidden');
      modal.style.display = 'flex';
    });
  }

  if (btnClose && modal) {
    btnClose.addEventListener('click', () => {
      modal.setAttribute('hidden', '');
      modal.style.display = 'none';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.setAttribute('hidden', '');
        modal.style.display = 'none';
      }
    });
  }

  if (form && modal) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      modal.setAttribute('hidden', '');
      modal.style.display = 'none';
      form.reset();
      if (typeof showToast === 'function') {
        showToast('Confession placed inside the vault with zero trace. Thank you.');
      }
    });
  }

  goToSlide(0);
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initConfessionsSlideshow);
} else {
  initConfessionsSlideshow();
}
`;

// UPDATE src/main.js
const mainJsPath = path.join(rootDir, 'src', 'main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

const oldJsMarker = '// ================= 10. CONFESSIONS SLIDESHOW LOGIC =================';
const oldJsIdx = mainJs.indexOf(oldJsMarker);

if (oldJsIdx !== -1) {
  mainJs = mainJs.slice(0, oldJsIdx) + jsContent;
  fs.writeFileSync(mainJsPath, mainJs, 'utf8');
  console.log('✓ Successfully updated src/main.js with Scattered Pills logic');
} else {
  console.error('Could not find marker in main.js:', oldJsMarker);
}
