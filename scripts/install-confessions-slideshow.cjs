const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. CSS FOR CONFESSIONS SLIDESHOW POPPING OUT OF CARDBOARD BOX
const cssContent = `/* ── THE CONFESSIONS CARDBOARD BOX SLIDESHOW ────────────── */
.toybox-section {
  padding: 44px 0 52px;
  background: #000000 !important;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
}

.toybox-header {
  text-align: center;
  margin-bottom: 22px;
}
.toybox-header .sh2 {
  font-size: clamp(26px, 4vw, 36px);
  margin: 0;
  color: #ffffff;
  letter-spacing: -0.01em;
}

/* 3D Box Container Stage */
.toybox-stage {
  max-width: 620px;
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
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.95));
  user-select: none;
  pointer-events: none;
}

/* ── SLIDESHOW POPPING OUT OF THE BOX ───────────────────── */
.confessions-slider-wrap {
  position: absolute;
  top: 6%;
  width: 90%;
  max-width: 350px;
  z-index: 10;
  border-radius: 18px;
  overflow: visible;
  animation: popOutOfBox 0.48s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  will-change: transform, opacity;
}

@keyframes popOutOfBox {
  0% {
    opacity: 0;
    transform: translateY(75px) scale(0.62);
  }
  65% {
    opacity: 1;
    transform: translateY(-8px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.confessions-slider-viewport {
  width: 100%;
  height: 235px;
  background: #090a0f;
  border: 1.5px solid rgba(255, 255, 255, 0.18);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.95), 0 0 30px rgba(225, 29, 72, 0.3);
  position: relative;
}

.confessions-slides-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

.confession-slide {
  min-width: 100%;
  max-width: 100%;
  width: 100%;
  height: 100%;
  flex-shrink: 0;
  box-sizing: border-box;
  position: relative;
}

/* Screenshot image */
.flyout-screenshot-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Fallback WhatsApp UI inside Slide */
.flyout-fallback-ui {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0b0c10;
  color: #fff;
}
.flyout-ui-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #14151e;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.flyout-ui-user {
  display: flex;
  align-items: center;
  gap: 8px;
}
.flyout-ui-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e11d48, #be123c);
  font-size: 9.5px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.flyout-ui-name {
  font-size: 11px;
  font-weight: 700;
  display: block;
}
.flyout-ui-status {
  font-size: 8.5px;
  color: #10b981;
}
.flyout-ui-secure {
  font-size: 9.5px;
  color: rgba(255, 255, 255, 0.4);
}

.flyout-ui-messages {
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: flex-end;
  background: #0d0e14;
}
.f-msg {
  max-width: 88%;
  padding: 7px 10px;
  border-radius: 11px;
  font-size: 11.5px;
  line-height: 1.4;
  position: relative;
}
.f-msg.in {
  align-self: flex-start;
  background: #1e2029;
  color: #f1f2f6;
  border-bottom-left-radius: 2px;
}
.f-msg.out {
  align-self: flex-end;
  background: linear-gradient(135deg, #be123c, #9f1239);
  color: #ffffff;
  border-bottom-right-radius: 2px;
}
.f-time {
  font-size: 8.5px;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 6px;
}
.blue-tick {
  color: #38bdf8;
  font-weight: 700;
}

.flyout-ui-foot {
  padding: 6px 10px;
  background: #14151e;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 9.5px;
  color: rgba(255, 255, 255, 0.45);
}

/* Floating Message Bubbles Around the Pop-up */
.toybox-bubble {
  position: absolute;
  z-index: 25;
  background: rgba(14, 15, 22, 0.94);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.7);
  border-radius: var(--r-pill);
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  pointer-events: none;
}
.toybox-bubble .bubble-tick {
  color: #10b981;
  font-size: 8px;
}
.toybox-bubble.bubble-top {
  top: -14px;
  right: -8px;
  animation: floatBubble1 3.5s ease-in-out infinite alternate;
}
.toybox-bubble.bubble-bottom {
  bottom: -12px;
  left: -8px;
  animation: floatBubble2 4s ease-in-out infinite alternate;
}

@keyframes floatBubble1 {
  0% { transform: translateY(0px) rotate(-1.5deg); }
  100% { transform: translateY(-7px) rotate(1.5deg); }
}
@keyframes floatBubble2 {
  0% { transform: translateY(0px) rotate(1.5deg); }
  100% { transform: translateY(-8px) rotate(-1deg); }
}

/* Slideshow Left/Right Arrow Navs */
.confession-slider-nav {
  position: absolute;
  top: 50%;
  left: -18px;
  right: -18px;
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
  background: var(--ruby);
  border-color: var(--ruby);
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
    padding: 30px 0 36px;
  }
  .cardboard-box-wrapper {
    max-width: 330px;
  }
  .cardboard-box-img {
    max-height: 250px;
  }
  .confessions-slider-wrap {
    max-width: 290px;
    top: 5%;
  }
  .confessions-slider-viewport {
    height: 195px;
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

const markerStart = '/* ── LIFELIKE 3D CARDBOARD CONFESSIONS BOX';
const shareMarker = '/* Share Link Button */';

const sIdx = styleCss.indexOf(markerStart);
const eIdx = styleCss.indexOf(shareMarker);

if (sIdx !== -1 && eIdx !== -1) {
  styleCss = styleCss.slice(0, sIdx) + cssContent + '\n\n' + styleCss.slice(eIdx);
  fs.writeFileSync(styleCssPath, styleCss, 'utf8');
  console.log('✓ Successfully updated src/style.css with Confessions Slideshow CSS');
} else {
  console.error('Could not find markers in style.css', { sIdx, eIdx });
}

// 2. HTML FOR CONFESSIONS SLIDESHOW POPPING OUT OF BOX
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

            <!-- SLIDESHOW POPPING OUT FROM INSIDE THE BOX -->
            <div class="confessions-slider-wrap" id="confessions-slider-wrap">
              <!-- Floating Message Bubbles -->
              <div class="toybox-bubble bubble-top" id="flyout-bubble-top">
                <span class="bubble-tick">●</span>
                <span id="flyout-bubble-top-text">"roommate thought it was skincare 📦"</span>
              </div>
              <div class="toybox-bubble bubble-bottom" id="flyout-bubble-bottom">
                <span class="bubble-tick">●</span>
                <span id="flyout-bubble-bottom-text">"cancel tomorrow... rose took me out in 3 mins 🌹"</span>
              </div>

              <!-- Slideshow Viewport -->
              <div class="confessions-slider-viewport">
                <div class="confessions-slides-track" id="confessions-slides-track">
                  
                  <!-- SLIDE 0: The Rose Sucker -->
                  <div class="confession-slide active" data-index="0">
                    <img src="/assets/chat-proof-1.webp" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" class="flyout-screenshot-img" alt="Rose Sucker Chat Proof" />
                    <div class="flyout-fallback-ui">
                      <div class="flyout-ui-header">
                        <div class="flyout-ui-user">
                          <span class="flyout-ui-avatar">VIP</span>
                          <div>
                            <span class="flyout-ui-name">[Discreet Client · Lekki]</span>
                            <span class="flyout-ui-status">● Online</span>
                          </div>
                        </div>
                        <span class="flyout-ui-secure">🔒 Disappearing</span>
                      </div>
                      <div class="flyout-ui-messages">
                        <div class="f-msg in">
                          Babe my package just arrived in plain brown wrap... rider asked if it was skincare docs 😭
                          <span class="f-time">11:42 PM <span class="blue-tick">✓✓</span></span>
                        </div>
                        <div class="f-msg out">
                          Zero branding always! Enjoy tonight 😉
                          <span class="f-time">11:43 PM</span>
                        </div>
                        <div class="f-msg in">
                          UPDATE: cancel tomorrow. The Rose Sucker took me to another dimension in 3 mins.
                          <span class="f-time">01:15 AM <span class="blue-tick">✓✓</span></span>
                        </div>
                      </div>
                      <div class="flyout-ui-foot">
                        <span>Featured: The Rose Sucker</span>
                        <span>100% Anonymous</span>
                      </div>
                    </div>
                  </div>

                  <!-- SLIDE 1: The Mini Wand -->
                  <div class="confession-slide" data-index="1">
                    <img src="/assets/chat-proof-2.webp" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" class="flyout-screenshot-img" alt="Mini Wand Chat Proof" />
                    <div class="flyout-fallback-ui">
                      <div class="flyout-ui-header">
                        <div class="flyout-ui-user">
                          <span class="flyout-ui-avatar" style="background: linear-gradient(135deg, #8b5cf6, #6366f1);">VIP</span>
                          <div>
                            <span class="flyout-ui-name">[Discreet Client · Abuja]</span>
                            <span class="flyout-ui-status">● Online</span>
                          </div>
                        </div>
                        <span class="flyout-ui-secure">🔒 Disappearing</span>
                      </div>
                      <div class="flyout-ui-messages">
                        <div class="f-msg in">
                          I thought Twitter people were hyping The Mini Wand for nothing...
                          <span class="f-time">01:08 AM <span class="blue-tick">✓✓</span></span>
                        </div>
                        <div class="f-msg in">
                          Standing in my bathroom and my knees gave way. You people are dangerous!
                          <span class="f-time">01:09 AM <span class="blue-tick">✓✓</span></span>
                        </div>
                        <div class="f-msg out">
                          Medical-grade motor hits different 🌹
                          <span class="f-time">01:10 AM</span>
                        </div>
                      </div>
                      <div class="flyout-ui-foot">
                        <span>Featured: The Mini Wand</span>
                        <span>100% Anonymous</span>
                      </div>
                    </div>
                  </div>

                  <!-- SLIDE 2: Pocket Bullet -->
                  <div class="confession-slide" data-index="2">
                    <img src="/assets/chat-proof-3.webp" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" class="flyout-screenshot-img" alt="Pocket Bullet Chat Proof" />
                    <div class="flyout-fallback-ui">
                      <div class="flyout-ui-header">
                        <div class="flyout-ui-user">
                          <span class="flyout-ui-avatar" style="background: linear-gradient(135deg, #f59e0b, #d97706);">VIP</span>
                          <div>
                            <span class="flyout-ui-name">[Discreet Client · Yaba]</span>
                            <span class="flyout-ui-status">● Online</span>
                          </div>
                        </div>
                        <span class="flyout-ui-secure">🔒 Disappearing</span>
                      </div>
                      <div class="flyout-ui-messages">
                        <div class="f-msg in">
                          My strict landlady took the parcel from rider downstairs.
                          <span class="f-time">03:20 PM <span class="blue-tick">✓✓</span></span>
                        </div>
                        <div class="f-msg in">
                          She said 'Sister your serum has arrived'. I almost laughed out loud. 10/10 packaging!
                          <span class="f-time">03:21 PM <span class="blue-tick">✓✓</span></span>
                        </div>
                        <div class="f-msg out">
                          Discretion is our #1 priority always!
                          <span class="f-time">03:22 PM</span>
                        </div>
                      </div>
                      <div class="flyout-ui-foot">
                        <span>Featured: Pocket Bullet</span>
                        <span>100% Anonymous</span>
                      </div>
                    </div>
                  </div>

                  <!-- SLIDE 3: The Siren -->
                  <div class="confession-slide" data-index="3">
                    <img src="/assets/chat-proof-4.webp" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" class="flyout-screenshot-img" alt="The Siren Chat Proof" />
                    <div class="flyout-fallback-ui">
                      <div class="flyout-ui-header">
                        <div class="flyout-ui-user">
                          <span class="flyout-ui-avatar" style="background: linear-gradient(135deg, #0ea5e9, #0284c7);">VIP</span>
                          <div>
                            <span class="flyout-ui-name">[Discreet Client · VI]</span>
                            <span class="flyout-ui-status">● Online</span>
                          </div>
                        </div>
                        <span class="flyout-ui-secure">🔒 Disappearing</span>
                      </div>
                      <div class="flyout-ui-messages">
                        <div class="f-msg in">
                          He had app control of The Siren from Heathrow lounge while I was having dinner in VI.
                          <span class="f-time">08:24 PM <span class="blue-tick">✓✓</span></span>
                        </div>
                        <div class="f-msg in">
                          Had to grip my bag with white knuckles so I wouldn't make a sound.
                          <span class="f-time">08:25 PM <span class="blue-tick">✓✓</span></span>
                        </div>
                        <div class="f-msg out">
                          Global app sync is unmatched!
                          <span class="f-time">08:26 PM</span>
                        </div>
                      </div>
                      <div class="flyout-ui-foot">
                        <span>Featured: The Siren</span>
                        <span>100% Anonymous</span>
                      </div>
                    </div>
                  </div>

                  <!-- SLIDE 4: African Brute -->
                  <div class="confession-slide" data-index="4">
                    <img src="/assets/chat-proof-5.webp" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" class="flyout-screenshot-img" alt="African Brute Chat Proof" />
                    <div class="flyout-fallback-ui">
                      <div class="flyout-ui-header">
                        <div class="flyout-ui-user">
                          <span class="flyout-ui-avatar" style="background: linear-gradient(135deg, #ec4899, #db2777);">VIP</span>
                          <div>
                            <span class="flyout-ui-name">[Discreet Client · Port Harcourt]</span>
                            <span class="flyout-ui-status">● Online</span>
                          </div>
                        </div>
                        <span class="flyout-ui-secure">🔒 Disappearing</span>
                      </div>
                      <div class="flyout-ui-messages">
                        <div class="f-msg in">
                          He took two spoons of African Brute Tonic and used the Rabbit Ring.
                          <span class="f-time">04:12 PM <span class="blue-tick">✓✓</span></span>
                        </div>
                        <div class="f-msg in">
                          We literally had to cancel Sunday morning plans. Three rounds back to back.
                          <span class="f-time">04:13 PM <span class="blue-tick">✓✓</span></span>
                        </div>
                        <div class="f-msg out">
                          Natural herbal stamina never fails! 🔥
                          <span class="f-time">04:14 PM</span>
                        </div>
                      </div>
                      <div class="flyout-ui-foot">
                        <span>Featured: African Brute</span>
                        <span>100% Anonymous</span>
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
                  <img src="/assets/bullet-vibe-all-colors.webp" alt="Pocket Bullet" />
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
  console.log('✓ Successfully updated index.html with Confessions Slideshow');
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
  console.log('✓ Successfully updated products.html with Confessions Slideshow');
} else {
  console.error('Could not find markers in products.html', { prodHtmlStart, prodFooterStart });
}

// 3. JAVASCRIPT FOR CONFESSIONS SLIDESHOW LOGIC
const jsContent = `// ================= 10. CONFESSIONS SLIDESHOW LOGIC =================
const SLIDE_BUBBLES = [
  {
    top: '"roommate thought it was skincare 📦"',
    bottom: '"cancel tomorrow... rose took me out in 3 mins 🌹"'
  },
  {
    top: '"my knees literally gave out 🫠"',
    bottom: '"standing in bathroom... dangerous! ⚡"'
  },
  {
    top: '"landlady handed it to me 😂"',
    bottom: '"10/10 plain packaging 🔒"'
  },
  {
    top: '"controlled from London Heathrow 🥵"',
    bottom: '"at dinner in VI... insane device 🖤"'
  },
  {
    top: '"cancelled Sunday morning plans 🔥"',
    bottom: '"three rounds back to back ⚡"'
  }
];

function initConfessionsSlideshow() {
  const track = document.getElementById('confessions-slides-track');
  const slides = document.querySelectorAll('.confession-slide');
  const toyTabs = document.querySelectorAll('.toy-tab-card');
  const btnPrev = document.getElementById('btn-confession-prev');
  const btnNext = document.getElementById('btn-confession-next');
  const sliderWrap = document.getElementById('confessions-slider-wrap');
  const bubbleTopText = document.getElementById('flyout-bubble-top-text');
  const bubbleBottomText = document.getElementById('flyout-bubble-bottom-text');

  if (!track || !slides.length) return;

  let currentSlide = 0;
  const totalSlides = slides.length;

  function goToSlide(index) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    currentSlide = index;

    // Shift track like collections slideshow
    track.style.transform = \`translateX(-\${currentSlide * 100}%)\`;

    // Active slide class
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === currentSlide);
    });

    // Update active toy tab underneath
    toyTabs.forEach((tab, i) => {
      tab.classList.toggle('active', i === currentSlide);
    });

    // Update floating message bubbles
    if (SLIDE_BUBBLES[currentSlide]) {
      if (bubbleTopText) bubbleTopText.textContent = SLIDE_BUBBLES[currentSlide].top;
      if (bubbleBottomText) bubbleBottomText.textContent = SLIDE_BUBBLES[currentSlide].bottom;
    }

    // Pop-up animation from box
    if (sliderWrap) {
      sliderWrap.style.animation = 'none';
      sliderWrap.offsetHeight; // force reflow
      sliderWrap.style.animation = 'popOutOfBox 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    }
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

const oldJsMarker = '// ================= 10. THE CONFESSIONS TOY BOX FLY-OUT LOGIC';
const oldJsIdx = mainJs.indexOf(oldJsMarker);

if (oldJsIdx !== -1) {
  mainJs = mainJs.slice(0, oldJsIdx) + jsContent;
  fs.writeFileSync(mainJsPath, mainJs, 'utf8');
  console.log('✓ Successfully updated src/main.js with Confessions Slideshow logic');
} else {
  console.error('Could not find marker in main.js:', oldJsMarker);
}
