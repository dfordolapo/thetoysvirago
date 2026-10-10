const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. CSS UPDATES
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
  max-width: 540px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cardboard-box-img {
  width: 100%;
  height: auto;
  max-height: 390px;
  object-fit: contain;
  display: block;
  user-select: none;
  pointer-events: none;
}

/* ── SLIDESHOW VIEWPORT FOR SCATTERED PILLS ──────────────── */
.confessions-slider-wrap {
  position: absolute;
  top: 9%;
  width: 95%;
  max-width: 440px;
  z-index: 10;
  overflow: visible;
  pointer-events: none;
}

.confessions-slider-viewport {
  width: 100%;
  min-height: 180px;
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
  padding: 8px 4px;
}

/* Scattered Pills Cluster */
.confession-pills-cluster {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 400px;
  align-items: center;
}

/* Single line pills with NO dropshadow */
.confession-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.95);
  border-radius: 9999px;
  padding: 7px 15px;
  color: #0b0c12;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap !important;
  box-shadow: none !important;
  transition: transform 0.25s ease;
  pointer-events: auto;
  cursor: default;
  will-change: transform, opacity;
  width: max-content;
  max-width: 100%;
}

.confession-pill:hover {
  background: #ffffff;
  box-shadow: none !important;
  transform: scale(1.03) !important;
}

.pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e11d48;
  flex-shrink: 0;
}

.pill-text {
  color: #0b0c12;
  font-weight: 600;
  white-space: nowrap !important;
}

/* Organic Scatter Positions & Rotations */
.pill-scatter-1 {
  align-self: flex-start;
  margin-left: 10px;
  transform: rotate(-2.5deg);
}

.pill-scatter-2 {
  align-self: flex-end;
  margin-right: 10px;
  transform: rotate(2.5deg);
}

.pill-scatter-3 {
  align-self: center;
  transform: rotate(-1deg);
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
    transform: translateY(40px) rotate(-2.5deg) scale(0.68);
  }
  70% {
    opacity: 1;
    transform: translateY(-3px) rotate(-2.5deg) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(-2.5deg) scale(1);
  }
}

@keyframes popOutPill2 {
  0% {
    opacity: 0;
    transform: translateY(45px) rotate(2.5deg) scale(0.68);
  }
  70% {
    opacity: 1;
    transform: translateY(-3px) rotate(2.5deg) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(2.5deg) scale(1);
  }
}

@keyframes popOutPill3 {
  0% {
    opacity: 0;
    transform: translateY(40px) rotate(-1deg) scale(0.68);
  }
  70% {
    opacity: 1;
    transform: translateY(-3px) rotate(-1deg) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotate(-1deg) scale(1);
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

/* ── TOYS UNDERNEATH: IMAGE-ONLY ROUND ICONS ─────── */
.toy-selector-section {
  max-width: 500px;
  margin: 20px auto 0;
}

.toy-selector-scroll-wrap {
  width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding: 6px;
}
.toy-selector-scroll-wrap::-webkit-scrollbar {
  display: none;
}

.toy-selector-track {
  display: flex;
  gap: 14px;
  justify-content: center;
  min-width: max-content;
  padding: 0 4px;
}

.toy-tab-card {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  width: 52px;
  height: 52px;
  min-width: 52px;
  padding: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
}
.toy-tab-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}
.toy-tab-card.active {
  background: rgba(225, 29, 72, 0.25);
  border-color: #fb7185;
  transform: translateY(-3px) scale(1.08);
  box-shadow: 0 0 16px rgba(225, 29, 72, 0.5);
}

.toy-tab-img-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  overflow: hidden;
}
.toy-tab-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.toy-tab-name {
  display: none !important;
}

/* ── CTA: "SHARE YOUR CONFESSION" ───────────────── */
.toybox-share-row {
  margin-top: 24px;
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

/* Mobile: Box BIGGER, Pills Single Line, Image Only Toys */
@media (max-width: 600px) {
  .toybox-section {
    padding: 28px 0 36px;
  }
  .toybox-stage {
    padding: 0;
    width: 100%;
  }
  .cardboard-box-wrapper {
    max-width: 100%;
    width: 100%;
  }
  .cardboard-box-img {
    max-height: 410px;
    width: 100%;
    max-width: 100%;
    transform: scale(1.06);
  }
  .confessions-slider-wrap {
    top: 6%;
    width: 96%;
    max-width: 320px;
  }
  .confessions-slider-viewport {
    min-height: 145px;
  }
  .confession-pills-cluster {
    gap: 7px;
    width: 100%;
    max-width: 100%;
  }
  .confession-pill {
    padding: 4.5px 10px;
    font-size: clamp(9px, 2.7vw, 11px);
    white-space: nowrap !important;
    box-shadow: none !important;
    gap: 5px;
  }
  .pill-dot {
    width: 4.5px;
    height: 4.5px;
  }
  .pill-scatter-1 {
    margin-left: 2px;
    align-self: flex-start;
  }
  .pill-scatter-2 {
    margin-right: 2px;
    align-self: flex-end;
  }
  .pill-scatter-3 {
    align-self: center;
  }
  .confession-slider-nav {
    left: -12px;
    right: -12px;
  }
  .confession-arrow-btn {
    width: 28px;
    height: 28px;
  }
  .toy-selector-section {
    margin-top: 16px;
  }
  .toy-selector-track {
    gap: 10px;
  }
  .toy-tab-card {
    width: 46px;
    height: 46px;
    min-width: 46px;
    padding: 5px;
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
  console.log('✓ Successfully updated src/style.css');
} else {
  console.error('Could not find markers in style.css');
}

// 2. HTML CONTENT (Concise single line pills, NO dropshadow, NO texts for toys)
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
                        <span class="pill-text">"roommate thought it was skincare 📦"</span>
                      </div>
                      <div class="confession-pill pill-scatter-2">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"rose took me out in 3 mins 🌹"</span>
                      </div>
                      <div class="confession-pill pill-scatter-3">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"zero branding, 100% discreet 🔒"</span>
                      </div>
                    </div>
                  </div>

                  <!-- SLIDE 1: The Mini Wand -->
                  <div class="confession-slide" data-index="1">
                    <div class="confession-pills-cluster">
                      <div class="confession-pill pill-scatter-1">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"standing in bathroom & knees gave out 🫠"</span>
                      </div>
                      <div class="confession-pill pill-scatter-2">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"medical-grade motor hits different ⚡"</span>
                      </div>
                      <div class="confession-pill pill-scatter-3">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"whisper silent, nobody heard a thing 🤫"</span>
                      </div>
                    </div>
                  </div>

                  <!-- SLIDE 2: Pocket Bullet -->
                  <div class="confession-slide" data-index="2">
                    <div class="confession-pills-cluster">
                      <div class="confession-pill pill-scatter-1">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"strict landlady handed me parcel 😂"</span>
                      </div>
                      <div class="confession-pill pill-scatter-2">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"'sister your serum arrived'... I died laughing"</span>
                      </div>
                      <div class="confession-pill pill-scatter-3">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"plain brown wrap, zero drama 📦"</span>
                      </div>
                    </div>
                  </div>

                  <!-- SLIDE 3: The Siren -->
                  <div class="confession-slide" data-index="3">
                    <div class="confession-pills-cluster">
                      <div class="confession-pill pill-scatter-1">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"controlled from Heathrow lounge 🥵"</span>
                      </div>
                      <div class="confession-pill pill-scatter-2">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"at dinner in VI gripping my bag 🖤"</span>
                      </div>
                      <div class="confession-pill pill-scatter-3">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"global sync is unreal ⚡"</span>
                      </div>
                    </div>
                  </div>

                  <!-- SLIDE 4: African Brute -->
                  <div class="confession-slide" data-index="4">
                    <div class="confession-pills-cluster">
                      <div class="confession-pill pill-scatter-1">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"two spoons tonic + rabbit ring 🔥"</span>
                      </div>
                      <div class="confession-pill pill-scatter-2">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"cancelled Sunday morning plans ⚡"</span>
                      </div>
                      <div class="confession-pill pill-scatter-3">
                        <span class="pill-dot"></span>
                        <span class="pill-text">"three rounds back to back 💪"</span>
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

        <!-- The Toys Underneath: Image-Only Round Icons (No Texts) -->
        <div class="toy-selector-section">
          <div class="toy-selector-scroll-wrap">
            <div class="toy-selector-track" id="toy-selector-track">
              <button type="button" class="toy-tab-card active" data-toy-idx="0" aria-label="The Rose Sucker">
                <div class="toy-tab-img-wrap">
                  <img src="/assets/product-rose.webp" alt="The Rose Sucker" />
                </div>
              </button>

              <button type="button" class="toy-tab-card" data-toy-idx="1" aria-label="The Mini Wand">
                <div class="toy-tab-img-wrap">
                  <img src="/assets/product-wand.webp" alt="The Mini Wand" />
                </div>
              </button>

              <button type="button" class="toy-tab-card" data-toy-idx="2" aria-label="Pocket Bullet">
                <div class="toy-tab-img-wrap">
                  <img src="/assets/product-bullet.webp" alt="Pocket Bullet" />
                </div>
              </button>

              <button type="button" class="toy-tab-card" data-toy-idx="3" aria-label="The Siren">
                <div class="toy-tab-img-wrap">
                  <img src="/assets/siren-app-red.webp" alt="The Siren" />
                </div>
              </button>

              <button type="button" class="toy-tab-card" data-toy-idx="4" aria-label="African Brute">
                <div class="toy-tab-img-wrap">
                  <img src="/assets/african-brute.webp" alt="African Brute" />
                </div>
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
  console.log('✓ Successfully updated index.html');
} else {
  console.error('Could not find markers in index.html');
}

// UPDATE products.html
const productsHtmlPath = path.join(rootDir, 'products.html');
let productsHtml = fs.readFileSync(productsHtmlPath, 'utf8');

const prodHtmlStart = productsHtml.indexOf('<!-- ===== THE CONFESSIONS CARDBOARD BOX');
const prodFooterStart = productsHtml.indexOf('<!-- ===== FOOTER ===== -->');

if (prodHtmlStart !== -1 && prodFooterStart !== -1) {
  productsHtml = productsHtml.slice(0, prodHtmlStart) + htmlContent + '\n\n    ' + productsHtml.slice(prodFooterStart);
  fs.writeFileSync(productsHtmlPath, productsHtml, 'utf8');
  console.log('✓ Successfully updated products.html');
} else {
  console.error('Could not find markers in products.html');
}
