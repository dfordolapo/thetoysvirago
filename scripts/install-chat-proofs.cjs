const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. CSS FOR CHAT PROOFS & FLOATING MESSAGES
const chatProofsCss = `/* ── CHAT SCREENSHOTS & FLOATING MESSAGES SHOWCASE ──────── */
.chat-proofs-section {
  padding: 44px 0 50px;
  background: radial-gradient(ellipse at 50% 0%, rgba(225, 29, 72, 0.08) 0%, #09090d 75%);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
}

.chat-proofs-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 14px;
}
.chat-proofs-title-group {
  max-width: 620px;
}
.proofs-tag {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #fb7185;
  background: rgba(225, 29, 72, 0.1);
  border: 1px solid rgba(225, 29, 72, 0.25);
  padding: 4px 12px;
  border-radius: var(--r-pill);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.proofs-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e11d48;
  box-shadow: 0 0 10px #e11d48;
  animation: pulseDot 2s infinite;
}
@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
}
.chat-proofs-header .sh2 {
  font-size: clamp(24px, 3.6vw, 34px);
  margin: 0 0 4px;
  color: #ffffff;
}
.proofs-sub {
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
  line-height: 1.5;
}

/* Scroll Controls */
.chat-proofs-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}
.proof-nav-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.proof-nav-btn:hover {
  background: var(--ruby);
  border-color: var(--ruby);
  transform: scale(1.06);
}

/* Horizontal Track of Chat Proofs */
.chat-proofs-track-wrap {
  position: relative;
  width: 100%;
}
.chat-proofs-track {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  padding: 24px 6px 20px;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.chat-proofs-track::-webkit-scrollbar {
  display: none;
}

/* Individual Screenshot Card with Floating Message Bubbles */
.chat-proof-card {
  position: relative;
  flex: 0 0 280px;
  scroll-snap-align: start;
  border-radius: 20px;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.chat-proof-card:hover {
  transform: translateY(-4px);
}

/* Floating Small Message Bubbles */
.floating-bubble {
  position: absolute;
  z-index: 6;
  background: rgba(18, 18, 24, 0.92);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.55), 0 0 14px rgba(225, 29, 72, 0.2);
  border-radius: var(--r-pill);
  padding: 6px 12px;
  font-size: 11.5px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  pointer-events: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.floating-bubble .b-icon {
  font-size: 12px;
}

/* Bubble Positions */
.bubble-top-right {
  top: -12px;
  right: -8px;
}
.bubble-top-left {
  top: -12px;
  left: -8px;
}
.bubble-bottom-right {
  bottom: -10px;
  right: -8px;
}
.bubble-bottom-left {
  bottom: -10px;
  left: -8px;
}

/* Floating Animations */
.float-anim-1 {
  animation: floatSmall1 3.2s ease-in-out infinite alternate;
}
.float-anim-2 {
  animation: floatSmall2 3.8s ease-in-out infinite alternate;
}
.float-anim-3 {
  animation: floatSmall3 2.9s ease-in-out infinite alternate;
}

@keyframes floatSmall1 {
  0% { transform: translateY(0px) rotate(-1.5deg); }
  100% { transform: translateY(-7px) rotate(1.5deg); }
}
@keyframes floatSmall2 {
  0% { transform: translateY(0px) rotate(1.5deg); }
  100% { transform: translateY(-8px) rotate(-1deg); }
}
@keyframes floatSmall3 {
  0% { transform: translateY(0px) rotate(-1deg); }
  100% { transform: translateY(-6px) rotate(2deg); }
}

/* The Screenshot Frame Container */
.chat-screen-frame {
  width: 100%;
  height: 330px;
  background: #0d0e14;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Actual Screenshot Image */
.chat-screenshot-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Fallback Authentic WhatsApp Dark Chat UI */
.chat-screen-ui {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0b0c10;
  color: #fff;
}
.chat-ui-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #15161e;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.chat-ui-user {
  display: flex;
  align-items: center;
  gap: 8px;
}
.chat-ui-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e11d48, #9f1239);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chat-ui-info {
  display: flex;
  flex-direction: column;
}
.chat-ui-name {
  font-size: 11.5px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.02em;
}
.chat-ui-status {
  font-size: 9.5px;
  color: #10b981;
}
.chat-ui-lock {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

.chat-ui-body {
  flex: 1;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: flex-end;
  background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.015) 0%, transparent 100%), #0c0d12;
}
.chat-msg-bubble {
  max-width: 86%;
  padding: 9px 11px;
  border-radius: 12px;
  font-size: 12px;
  line-height: 1.45;
  position: relative;
  word-break: break-word;
}
.chat-msg-bubble.in {
  align-self: flex-start;
  background: #1e2029;
  color: #f1f2f6;
  border-bottom-left-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.chat-msg-bubble.out {
  align-self: flex-end;
  background: linear-gradient(135deg, #be123c, #9f1239);
  color: #ffffff;
  border-bottom-right-radius: 3px;
}
.chat-msg-time {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.55);
  float: right;
  margin-top: 4px;
  margin-left: 8px;
}
.chat-msg-time .blue-tick {
  color: #38bdf8;
  font-weight: 700;
}

.chat-ui-foot {
  padding: 8px 10px;
  background: #15161e;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.45);
}

@media (max-width: 600px) {
  .chat-proofs-section {
    padding: 34px 0 40px;
  }
  .chat-proof-card {
    flex: 0 0 250px;
  }
  .chat-screen-frame {
    height: 300px;
  }
  .floating-bubble {
    font-size: 10.5px;
    padding: 5px 10px;
  }
}
`;

// 2. UPDATE src/style.css
const styleCssPath = path.join(rootDir, 'src', 'style.css');
let styleCss = fs.readFileSync(styleCssPath, 'utf8');

const wireMarker = '/* ── THE MIDNIGHT WIRE: ENCRYPTED FREQUENCY CONSOLE';
const shareLinkMarker = '/* Share Link Button */';

const wireIdx = styleCss.indexOf(wireMarker);
const shareIdx = styleCss.indexOf(shareLinkMarker);

if (wireIdx !== -1 && shareIdx !== -1) {
  styleCss = styleCss.slice(0, wireIdx) + chatProofsCss + '\n\n' + styleCss.slice(shareIdx);
  fs.writeFileSync(styleCssPath, styleCss, 'utf8');
  console.log('✓ Successfully updated src/style.css with chat proofs & floating messages CSS');
} else {
  console.error('Could not find CSS markers:', { wireIdx, shareIdx });
}

// 3. HTML FOR CHAT PROOFS & FLOATING MESSAGES
const chatProofsHtml = `    <!-- ===== CUSTOMER CHAT PROOFS & FLOATING MESSAGES ===== -->
    <section class="chat-proofs-section" id="whispers">
      <div class="section-inner">
        <div class="chat-proofs-header">
          <div class="chat-proofs-title-group">
            <span class="proofs-tag">
              <span class="proofs-dot"></span>
              Verified Customer WhatsApp &amp; DMs
            </span>
            <h2 class="sh2">Customer Receipts.</h2>
            <p class="proofs-sub">Raw screenshots of our chats with customers. Identities 100% blacked out for complete discretion.</p>
          </div>
          <div class="chat-proofs-nav">
            <button class="proof-nav-btn" id="btn-proof-prev" type="button" aria-label="Previous chat proof">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button class="proof-nav-btn" id="btn-proof-next" type="button" aria-label="Next chat proof">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>

        <div class="chat-proofs-track-wrap">
          <div class="chat-proofs-track" id="chat-proofs-track">

            <!-- 1. CHAT PROOF: Plain Packaging & Dispatch -->
            <div class="chat-proof-card">
              <div class="floating-bubble bubble-top-right float-anim-1">
                <span class="b-icon">🤫</span> "roommate had zero clue"
              </div>
              <div class="floating-bubble bubble-bottom-left float-anim-2">
                <span class="b-icon">📦</span> "100/10 stealth delivery"
              </div>

              <div class="chat-screen-frame">
                <img src="/assets/chat-proof-1.webp" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" class="chat-screenshot-img" alt="Customer Chat Screenshot 1" />
                <div class="chat-screen-ui">
                  <div class="chat-ui-bar">
                    <div class="chat-ui-user">
                      <span class="chat-ui-avatar">VIP</span>
                      <div class="chat-ui-info">
                        <span class="chat-ui-name">[Discreet Client · Lekki]</span>
                        <span class="chat-ui-status">● Online</span>
                      </div>
                    </div>
                    <span class="chat-ui-lock">🔒</span>
                  </div>
                  <div class="chat-ui-body">
                    <div class="chat-msg-bubble in">
                      Babe my package just arrived in plain brown wrap... rider asked if it was skincare docs 😭
                      <span class="chat-msg-time">11:42 PM <span class="blue-tick">✓✓</span></span>
                    </div>
                    <div class="chat-msg-bubble out">
                      Haha zero labels always! Let us know how tonight goes 😉
                      <span class="chat-msg-time">11:43 PM</span>
                    </div>
                    <div class="chat-msg-bubble in">
                      UPDATE: cancel tomorrow. The Rose Sucker took me to another dimension in 3 mins.
                      <span class="chat-msg-time">01:15 AM <span class="blue-tick">✓✓</span></span>
                    </div>
                  </div>
                  <div class="chat-ui-foot">
                    <span>Disappearing messages on</span>
                    <span>Encrypted</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. CHAT PROOF: Mini Wand Knees Shock -->
            <div class="chat-proof-card">
              <div class="floating-bubble bubble-top-left float-anim-2">
                <span class="b-icon">🫠</span> "my knees literally gave out"
              </div>
              <div class="floating-bubble bubble-bottom-right float-anim-3">
                <span class="b-icon">⚡</span> "you people are dangerous"
              </div>

              <div class="chat-screen-frame">
                <img src="/assets/chat-proof-2.webp" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" class="chat-screenshot-img" alt="Customer Chat Screenshot 2" />
                <div class="chat-screen-ui">
                  <div class="chat-ui-bar">
                    <div class="chat-ui-user">
                      <span class="chat-ui-avatar" style="background: linear-gradient(135deg, #8b5cf6, #6366f1);">VIP</span>
                      <div class="chat-ui-info">
                        <span class="chat-ui-name">[Discreet Client · Abuja]</span>
                        <span class="chat-ui-status">● Online</span>
                      </div>
                    </div>
                    <span class="chat-ui-lock">🔒</span>
                  </div>
                  <div class="chat-ui-body">
                    <div class="chat-msg-bubble in">
                      I thought Twitter people were hyping The Mini Wand for nothing...
                      <span class="chat-msg-time">01:08 AM <span class="blue-tick">✓✓</span></span>
                    </div>
                    <div class="chat-msg-bubble in">
                      Standing in my bathroom and my knees gave way. You people are very dangerous on this website!
                      <span class="chat-msg-time">01:09 AM <span class="blue-tick">✓✓</span></span>
                    </div>
                    <div class="chat-msg-bubble out">
                      Glad you love it! Medical-grade motor hits different 🌹
                      <span class="chat-msg-time">01:10 AM</span>
                    </div>
                  </div>
                  <div class="chat-ui-foot">
                    <span>Voice note verified</span>
                    <span>Encrypted</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. CHAT PROOF: Landlady Courier Delivery -->
            <div class="chat-proof-card">
              <div class="floating-bubble bubble-top-right float-anim-3">
                <span class="b-icon">😂</span> "landlady handed it to me"
              </div>
              <div class="floating-bubble bubble-bottom-left float-anim-1">
                <span class="b-icon">🔒</span> "zero branding on bag"
              </div>

              <div class="chat-screen-frame">
                <img src="/assets/chat-proof-3.webp" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" class="chat-screenshot-img" alt="Customer Chat Screenshot 3" />
                <div class="chat-screen-ui">
                  <div class="chat-ui-bar">
                    <div class="chat-ui-user">
                      <span class="chat-ui-avatar" style="background: linear-gradient(135deg, #f59e0b, #d97706);">VIP</span>
                      <div class="chat-ui-info">
                        <span class="chat-ui-name">[Discreet Client · Yaba]</span>
                        <span class="chat-ui-status">● Online</span>
                      </div>
                    </div>
                    <span class="chat-ui-lock">🔒</span>
                  </div>
                  <div class="chat-ui-body">
                    <div class="chat-msg-bubble in">
                      My strict landlady took the parcel from rider downstairs.
                      <span class="chat-msg-time">03:20 PM <span class="blue-tick">✓✓</span></span>
                    </div>
                    <div class="chat-msg-bubble in">
                      She said 'Sister your serum has arrived'. I almost laughed out loud. 10/10 plain packaging!
                      <span class="chat-msg-time">03:21 PM <span class="blue-tick">✓✓</span></span>
                    </div>
                    <div class="chat-msg-bubble out">
                      Discretion is our #1 priority always! Enjoy!
                      <span class="chat-msg-time">03:22 PM</span>
                    </div>
                  </div>
                  <div class="chat-ui-foot">
                    <span>Yaba Hub delivery</span>
                    <span>Encrypted</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 4. CHAT PROOF: Long Distance App Control -->
            <div class="chat-proof-card">
              <div class="floating-bubble bubble-top-left float-anim-1">
                <span class="b-icon">🥵</span> "controlled from London"
              </div>
              <div class="floating-bubble bubble-bottom-right float-anim-2">
                <span class="b-icon">🖤</span> "at dinner in VI"
              </div>

              <div class="chat-screen-frame">
                <img src="/assets/chat-proof-4.webp" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" class="chat-screenshot-img" alt="Customer Chat Screenshot 4" />
                <div class="chat-screen-ui">
                  <div class="chat-ui-bar">
                    <div class="chat-ui-user">
                      <span class="chat-ui-avatar" style="background: linear-gradient(135deg, #0ea5e9, #0284c7);">VIP</span>
                      <div class="chat-ui-info">
                        <span class="chat-ui-name">[Discreet Client · VI]</span>
                        <span class="chat-ui-status">● Online</span>
                      </div>
                    </div>
                    <span class="chat-ui-lock">🔒</span>
                  </div>
                  <div class="chat-ui-body">
                    <div class="chat-msg-bubble in">
                      He had app control of The Siren from Heathrow lounge while I was having dinner in VI.
                      <span class="chat-msg-time">08:24 PM <span class="blue-tick">✓✓</span></span>
                    </div>
                    <div class="chat-msg-bubble in">
                      Had to grip my bag with white knuckles so I wouldn't make a sound. Insane device.
                      <span class="chat-msg-time">08:25 PM <span class="blue-tick">✓✓</span></span>
                    </div>
                    <div class="chat-msg-bubble out">
                      Global app sync is unmatched!
                      <span class="chat-msg-time">08:26 PM</span>
                    </div>
                  </div>
                  <div class="chat-ui-foot">
                    <span>Heathrow ⇄ Lagos</span>
                    <span>Encrypted</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 5. CHAT PROOF: Repeat Order Theft -->
            <div class="chat-proof-card">
              <div class="floating-bubble bubble-top-right float-anim-2">
                <span class="b-icon">🌹</span> "sister stole mine"
              </div>
              <div class="floating-bubble bubble-bottom-left float-anim-3">
                <span class="b-icon">🔥</span> "buying 2 more now"
              </div>

              <div class="chat-screen-frame">
                <img src="/assets/chat-proof-5.webp" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" class="chat-screenshot-img" alt="Customer Chat Screenshot 5" />
                <div class="chat-screen-ui">
                  <div class="chat-ui-bar">
                    <div class="chat-ui-user">
                      <span class="chat-ui-avatar" style="background: linear-gradient(135deg, #ec4899, #db2777);">VIP</span>
                      <div class="chat-ui-info">
                        <span class="chat-ui-name">[Discreet Client · Ikeja]</span>
                        <span class="chat-ui-status">● Online</span>
                      </div>
                    </div>
                    <span class="chat-ui-lock">🔒</span>
                  </div>
                  <div class="chat-ui-body">
                    <div class="chat-msg-bubble in">
                      Bought one for myself on Wed. Sister took it on Friday. Best friend asked for link.
                      <span class="chat-msg-time">04:12 PM <span class="blue-tick">✓✓</span></span>
                    </div>
                    <div class="chat-msg-bubble in">
                      I'm literally ordering 2 more right now so nobody touches mine again 😂
                      <span class="chat-msg-time">04:13 PM <span class="blue-tick">✓✓</span></span>
                    </div>
                    <div class="chat-msg-bubble out">
                      Dispatching to Ikeja immediately!
                      <span class="chat-msg-time">04:14 PM</span>
                    </div>
                  </div>
                  <div class="chat-ui-foot">
                    <span>Verified repeat buyer</span>
                    <span>Encrypted</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>`;

// 4. UPDATE index.html
const indexHtmlPath = path.join(rootDir, 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

const wireHtmlStart = indexHtml.indexOf('<!-- ===== THE MIDNIGHT WIRE');
const discretionStart = indexHtml.indexOf('<!-- ===== DISCRETION ===== -->');

if (wireHtmlStart !== -1 && discretionStart !== -1) {
  indexHtml = indexHtml.slice(0, wireHtmlStart) + chatProofsHtml + '\n\n    ' + indexHtml.slice(discretionStart);
  fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
  console.log('✓ Successfully updated index.html with Chat Proofs & Floating Messages');
} else {
  console.error('Could not find markers in index.html', { wireHtmlStart, discretionStart });
}

// 5. UPDATE products.html
const productsHtmlPath = path.join(rootDir, 'products.html');
let productsHtml = fs.readFileSync(productsHtmlPath, 'utf8');

const prodWireStart = productsHtml.indexOf('<!-- ===== THE BOUDOIR WHISPERS') !== -1 
  ? productsHtml.indexOf('<!-- ===== THE BOUDOIR WHISPERS')
  : productsHtml.indexOf('<!-- ===== THE MIDNIGHT WIRE');
const prodFooterStart = productsHtml.indexOf('<!-- ===== FOOTER ===== -->');

if (prodWireStart !== -1 && prodFooterStart !== -1) {
  productsHtml = productsHtml.slice(0, prodWireStart) + chatProofsHtml + '\n\n    ' + productsHtml.slice(prodFooterStart);
  fs.writeFileSync(productsHtmlPath, productsHtml, 'utf8');
  console.log('✓ Successfully updated products.html with Chat Proofs & Floating Messages');
} else {
  console.error('Could not find markers in products.html', { prodWireStart, prodFooterStart });
}

// 6. UPDATE src/main.js
const mainJsPath = path.join(rootDir, 'src', 'main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

const proofJs = `// ================= 10. CHAT PROOFS CAROUSEL CONTROLS =================
function initChatProofs() {
  const track = document.getElementById('chat-proofs-track');
  const btnPrev = document.getElementById('btn-proof-prev');
  const btnNext = document.getElementById('btn-proof-next');

  if (!track) return;

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      track.scrollBy({ left: -300, behavior: 'smooth' });
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      track.scrollBy({ left: 300, behavior: 'smooth' });
    });
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initChatProofs);
} else {
  initChatProofs();
}
`;

const midnightWireStart = mainJs.indexOf('// ================= 10. THE MIDNIGHT WIRE');
if (midnightWireStart !== -1) {
  mainJs = mainJs.slice(0, midnightWireStart) + proofJs;
  fs.writeFileSync(mainJsPath, mainJs, 'utf8');
  console.log('✓ Successfully updated src/main.js with initChatProofs()');
} else {
  console.error('Could not find // ================= 10. THE MIDNIGHT WIRE in main.js');
}
