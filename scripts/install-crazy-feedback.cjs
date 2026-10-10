const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. CSS FOR THE CRAZY 3D CHAT STAGE & FLOATING MESSAGES
const crazyFeedbackCss = `/* ── AVANT-GARDE 3D CHAT DECK & FLOATING WHISPERS ──────── */
.chat-proofs-section {
  padding: 48px 0 54px;
  background: radial-gradient(ellipse at 50% 15%, rgba(225, 29, 72, 0.1) 0%, rgba(10, 10, 16, 0.95) 70%, #07070a 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
}

/* Subtle background grid & ambient particles */
.chat-proofs-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
  opacity: 0.7;
}

.chat-proofs-header {
  text-align: center;
  max-width: 680px;
  margin: 0 auto 28px;
  position: relative;
  z-index: 3;
}
.proofs-tag {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #fb7185;
  background: rgba(225, 29, 72, 0.1);
  border: 1px solid rgba(225, 29, 72, 0.25);
  padding: 4px 13px;
  border-radius: var(--r-pill);
  text-transform: uppercase;
  margin-bottom: 10px;
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
  font-size: clamp(26px, 4vw, 36px);
  margin: 0 0 6px;
  color: #ffffff;
  letter-spacing: -0.01em;
}
.proofs-sub {
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
  line-height: 1.5;
}

/* ── 3D INTERACTIVE STAGE ───────────────────────── */
.chat-stage-container {
  position: relative;
  max-width: 960px;
  height: 380px;
  margin: 0 auto;
  perspective: 1200px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

/* 3D Stack Deck */
.chat-3d-deck {
  position: relative;
  width: 270px;
  height: 340px;
  transform-style: preserve-3d;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-proof-card {
  position: absolute;
  width: 270px;
  height: 340px;
  border-radius: 22px;
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1),
              opacity 0.4s ease,
              box-shadow 0.4s ease,
              filter 0.4s ease;
  user-select: none;
  cursor: pointer;
  will-change: transform, opacity;
}

/* Center Active Card */
.chat-proof-card.card-center {
  transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
  z-index: 10;
  opacity: 1;
  filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 24px rgba(225, 29, 72, 0.25));
  cursor: default;
}

/* Left Card in Stack */
.chat-proof-card.card-left {
  transform: translate3d(-170px, 12px, -80px) rotate(-7deg) scale(0.88);
  z-index: 5;
  opacity: 0.55;
  filter: blur(0.5px) brightness(0.75);
}
.chat-proof-card.card-left:hover {
  opacity: 0.85;
  filter: none;
  transform: translate3d(-175px, 6px, -60px) rotate(-5deg) scale(0.91);
}

/* Right Card in Stack */
.chat-proof-card.card-right {
  transform: translate3d(170px, 12px, -80px) rotate(7deg) scale(0.88);
  z-index: 5;
  opacity: 0.55;
  filter: blur(0.5px) brightness(0.75);
}
.chat-proof-card.card-right:hover {
  opacity: 0.85;
  filter: none;
  transform: translate3d(175px, 6px, -60px) rotate(5deg) scale(0.91);
}

/* Hidden Cards in Stack */
.chat-proof-card.card-hidden {
  transform: translate3d(0, 20px, -150px) scale(0.7);
  z-index: 1;
  opacity: 0;
  pointer-events: none;
}

/* The Screenshot Frame Container */
.chat-screen-frame {
  width: 100%;
  height: 100%;
  background: #0d0e14;
  border: 1.5px solid rgba(255, 255, 255, 0.16);
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
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

/* ── SCATTERED FLOATING MESSAGE BUBBLES ─────────── */
.floating-scatter-bubble {
  position: absolute;
  z-index: 15;
  background: rgba(16, 17, 24, 0.88);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.6), 0 0 16px rgba(225, 29, 72, 0.18);
  border-radius: var(--r-pill);
  padding: 7px 14px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              background 0.25s ease,
              border-color 0.25s ease,
              box-shadow 0.25s ease;
  user-select: none;
}
.floating-scatter-bubble:hover {
  background: rgba(225, 29, 72, 0.25);
  border-color: rgba(225, 29, 72, 0.6);
  box-shadow: 0 14px 34px rgba(225, 29, 72, 0.35);
  transform: scale(1.08) !important;
}
.floating-scatter-bubble.bubble-active {
  background: linear-gradient(135deg, rgba(225, 29, 72, 0.35), rgba(159, 18, 57, 0.2));
  border-color: #fb7185;
  box-shadow: 0 0 20px rgba(225, 29, 72, 0.4);
}
.bubble-pulse-tick {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
  flex-shrink: 0;
}

/* Organic Scatter Positions & Keyframe Floating */
.pos-tl {
  top: 18px;
  left: 2%;
  transform: rotate(-3deg);
  animation: floatScatter1 4.2s ease-in-out infinite alternate;
}
.pos-tr {
  top: 14px;
  right: 2%;
  transform: rotate(2.5deg);
  animation: floatScatter2 3.8s ease-in-out infinite alternate;
}
.pos-ml {
  top: 48%;
  left: -20px;
  transform: translateY(-50%) rotate(1.5deg);
  animation: floatScatter3 4.5s ease-in-out infinite alternate;
}
.pos-mr {
  top: 48%;
  right: -20px;
  transform: translateY(-50%) rotate(-2deg);
  animation: floatScatter1 4.0s ease-in-out infinite alternate;
}
.pos-bl {
  bottom: 16px;
  left: 4%;
  transform: rotate(2deg);
  animation: floatScatter2 3.5s ease-in-out infinite alternate;
}
.pos-br {
  bottom: 18px;
  right: 4%;
  transform: rotate(-3.5deg);
  animation: floatScatter3 4.1s ease-in-out infinite alternate;
}

@keyframes floatScatter1 {
  0% { transform: translateY(0px) rotate(-3deg); }
  100% { transform: translateY(-8px) rotate(-1deg); }
}
@keyframes floatScatter2 {
  0% { transform: translateY(0px) rotate(2.5deg); }
  100% { transform: translateY(-9px) rotate(0.5deg); }
}
@keyframes floatScatter3 {
  0% { transform: translateY(-50%) translateY(0px) rotate(1.5deg); }
  100% { transform: translateY(-50%) translateY(-8px) rotate(-1deg); }
}

/* ── TACTILE STAGE CONTROLS ─────────────────────── */
.chat-stage-controls {
  margin-top: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  position: relative;
  z-index: 10;
}

.stage-pills-row {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 4px;
  border-radius: var(--r-pill);
}

.stage-pill-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-family: monospace;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 14px;
  border-radius: var(--r-pill);
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.05em;
}
.stage-pill-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.06);
}
.stage-pill-btn.active {
  background: var(--ruby);
  color: #ffffff;
  box-shadow: 0 2px 12px rgba(225, 29, 72, 0.4);
}

.stage-arrow-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.stage-arrow-btn:hover {
  background: var(--ruby);
  border-color: var(--ruby);
  transform: scale(1.08);
}

/* ── RESPONSIVE MOBILE ADJUSTMENTS ──────────────── */
@media (max-width: 860px) {
  .chat-stage-container {
    height: 360px;
  }
  .chat-proof-card.card-left {
    transform: translate3d(-130px, 10px, -60px) rotate(-6deg) scale(0.85);
  }
  .chat-proof-card.card-right {
    transform: translate3d(130px, 10px, -60px) rotate(6deg) scale(0.85);
  }
  .pos-ml, .pos-mr {
    display: none;
  }
}

@media (max-width: 580px) {
  .chat-proofs-section {
    padding: 36px 0 42px;
  }
  .chat-stage-container {
    height: 340px;
  }
  .chat-3d-deck {
    width: 240px;
    height: 300px;
  }
  .chat-proof-card {
    width: 240px;
    height: 300px;
  }
  .chat-proof-card.card-left {
    transform: translate3d(-85px, 10px, -40px) rotate(-5deg) scale(0.84);
  }
  .chat-proof-card.card-right {
    transform: translate3d(85px, 10px, -40px) rotate(5deg) scale(0.84);
  }
  .floating-scatter-bubble {
    font-size: 10.5px;
    padding: 5px 11px;
    gap: 5px;
  }
  .pos-tl {
    top: 6px;
    left: 0;
  }
  .pos-tr {
    top: 6px;
    right: 0;
  }
  .pos-bl {
    bottom: 8px;
    left: 0;
  }
  .pos-br {
    bottom: 8px;
    right: 0;
  }
  .stage-pills-row {
    overflow-x: auto;
    max-width: 100%;
    scrollbar-width: none;
  }
  .stage-pill-btn {
    padding: 5px 10px;
    font-size: 10px;
  }
}
`;

// 2. UPDATE src/style.css
const styleCssPath = path.join(rootDir, 'src', 'style.css');
let styleCss = fs.readFileSync(styleCssPath, 'utf8');

const oldChatProofsMarker = '/* ── CHAT SCREENSHOTS & FLOATING MESSAGES SHOWCASE';
const shareLinkMarker = '/* Share Link Button */';

const oldStart = styleCss.indexOf(oldChatProofsMarker);
const shareIdx = styleCss.indexOf(shareLinkMarker);

if (oldStart !== -1 && shareIdx !== -1) {
  styleCss = styleCss.slice(0, oldStart) + crazyFeedbackCss + '\n\n' + styleCss.slice(shareIdx);
  fs.writeFileSync(styleCssPath, styleCss, 'utf8');
  console.log('✓ Successfully updated src/style.css with crazy 3D stage & floating whispers CSS');
} else {
  console.error('Could not find CSS markers:', { oldStart, shareIdx });
}

// 3. HTML FOR THE 3D STAGE & SCATTERED FLOATING WHISPERS
const crazyFeedbackHtml = `    <!-- ===== CRAZY 3D CHAT DECK & SCATTERED FLOATING WHISPERS ===== -->
    <section class="chat-proofs-section" id="whispers">
      <div class="section-inner">
        <div class="chat-proofs-header">
          <span class="proofs-tag">
            <span class="proofs-dot"></span>
            Verified Customer WhatsApp &amp; DMs
          </span>
          <h2 class="sh2">Uncensored Receipts.</h2>
          <p class="proofs-sub">Raw customer chat screenshots. Identities 100% blacked out for complete discretion.</p>
        </div>

        <!-- The 3D Interactive Stage -->
        <div class="chat-stage-container" id="chat-stage">

          <!-- Scattered Floating Message Bubbles Orbiting The Stage -->
          <button type="button" class="floating-scatter-bubble pos-tl" data-jump-to="0">
            <span class="bubble-pulse-tick"></span>
            <span>"roommate took package thinking it was skincare 📦"</span>
          </button>

          <button type="button" class="floating-scatter-bubble pos-tr" data-jump-to="1">
            <span class="bubble-pulse-tick"></span>
            <span>"standing in bathroom and my knees gave way 🫠"</span>
          </button>

          <button type="button" class="floating-scatter-bubble pos-ml" data-jump-to="2">
            <span class="bubble-pulse-tick"></span>
            <span>"10/10 plain packaging... landlady had no clue 🔒"</span>
          </button>

          <button type="button" class="floating-scatter-bubble pos-mr" data-jump-to="3">
            <span class="bubble-pulse-tick"></span>
            <span>"app sync from Heathrow lounge to VI dinner 🥵"</span>
          </button>

          <button type="button" class="floating-scatter-bubble pos-bl" data-jump-to="0">
            <span class="bubble-pulse-tick"></span>
            <span>"cancel tomorrow... rose took me out in 3 mins 🌹"</span>
          </button>

          <button type="button" class="floating-scatter-bubble pos-br" data-jump-to="4">
            <span class="bubble-pulse-tick"></span>
            <span>"sister stole mine... ordering 2 more right now 😂"</span>
          </button>

          <!-- 3D Interactive Card Deck -->
          <div class="chat-3d-deck" id="chat-3d-deck">

            <!-- Card 0: Lekki Plain Packaging -->
            <div class="chat-proof-card card-center" data-index="0">
              <div class="chat-screen-frame">
                <img src="/assets/chat-proof-1.webp" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" class="chat-screenshot-img" alt="Customer Chat Proof 1" />
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

            <!-- Card 1: Abuja Mini Wand -->
            <div class="chat-proof-card card-right" data-index="1">
              <div class="chat-screen-frame">
                <img src="/assets/chat-proof-2.webp" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" class="chat-screenshot-img" alt="Customer Chat Proof 2" />
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
                      Standing in my bathroom and my knees gave way. You people are very dangerous!
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

            <!-- Card 2: Yaba Landlady -->
            <div class="chat-proof-card card-hidden" data-index="2">
              <div class="chat-screen-frame">
                <img src="/assets/chat-proof-3.webp" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" class="chat-screenshot-img" alt="Customer Chat Proof 3" />
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

            <!-- Card 3: VI Heathrow App Control -->
            <div class="chat-proof-card card-hidden" data-index="3">
              <div class="chat-screen-frame">
                <img src="/assets/chat-proof-4.webp" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" class="chat-screenshot-img" alt="Customer Chat Proof 4" />
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

            <!-- Card 4: Ikeja Repeat Order -->
            <div class="chat-proof-card card-left" data-index="4">
              <div class="chat-screen-frame">
                <img src="/assets/chat-proof-5.webp" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" class="chat-screenshot-img" alt="Customer Chat Proof 5" />
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

        <!-- Tactical Stage Controls -->
        <div class="chat-stage-controls">
          <button class="stage-arrow-btn" id="btn-stage-prev" type="button" aria-label="Previous chat proof">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          
          <div class="stage-pills-row" role="tablist" aria-label="Customer receipts">
            <button class="stage-pill-btn active" data-stage-idx="0" type="button">01 // LEKKI</button>
            <button class="stage-pill-btn" data-stage-idx="1" type="button">02 // ABUJA</button>
            <button class="stage-pill-btn" data-stage-idx="2" type="button">03 // YABA</button>
            <button class="stage-pill-btn" data-stage-idx="3" type="button">04 // VI</button>
            <button class="stage-pill-btn" data-stage-idx="4" type="button">05 // IKEJA</button>
          </div>

          <button class="stage-arrow-btn" id="btn-stage-next" type="button" aria-label="Next chat proof">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

      </div>
    </section>`;

// 4. UPDATE index.html
const indexHtmlPath = path.join(rootDir, 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

const htmlStart = indexHtml.indexOf('<!-- ===== CUSTOMER CHAT PROOFS');
const discretionStart = indexHtml.indexOf('<!-- ===== DISCRETION ===== -->');

if (htmlStart !== -1 && discretionStart !== -1) {
  indexHtml = indexHtml.slice(0, htmlStart) + crazyFeedbackHtml + '\n\n    ' + indexHtml.slice(discretionStart);
  fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
  console.log('✓ Successfully updated index.html with 3D chat deck & scattered floating whispers');
} else {
  console.error('Could not find markers in index.html', { htmlStart, discretionStart });
}

// 5. UPDATE products.html
const productsHtmlPath = path.join(rootDir, 'products.html');
let productsHtml = fs.readFileSync(productsHtmlPath, 'utf8');

const prodHtmlStart = productsHtml.indexOf('<!-- ===== CUSTOMER CHAT PROOFS');
const prodFooterStart = productsHtml.indexOf('<!-- ===== FOOTER ===== -->');

if (prodHtmlStart !== -1 && prodFooterStart !== -1) {
  productsHtml = productsHtml.slice(0, prodHtmlStart) + crazyFeedbackHtml + '\n\n    ' + productsHtml.slice(prodFooterStart);
  fs.writeFileSync(productsHtmlPath, productsHtml, 'utf8');
  console.log('✓ Successfully updated products.html with 3D chat deck & scattered floating whispers');
} else {
  console.error('Could not find markers in products.html', { prodHtmlStart, prodFooterStart });
}

// 6. JAVASCRIPT FOR 3D CHAT STAGE & TOUCH/SWIPE/PILL CONTROLS
const crazyFeedbackJs = `// ================= 10. CRAZY 3D CHAT DECK CONTROLS =================
function initCrazyChatStage() {
  const cards = document.querySelectorAll('.chat-3d-deck .chat-proof-card');
  const pillBtns = document.querySelectorAll('.stage-pill-btn');
  const btnPrev = document.getElementById('btn-stage-prev');
  const btnNext = document.getElementById('btn-stage-next');
  const scatterBubbles = document.querySelectorAll('.floating-scatter-bubble');
  const deck = document.getElementById('chat-3d-deck');

  if (!cards.length) return;

  let currentIdx = 0;
  const totalCards = cards.length;

  function updateDeck(newIdx) {
    if (newIdx < 0) newIdx = totalCards - 1;
    if (newIdx >= totalCards) newIdx = 0;
    currentIdx = newIdx;

    const leftIdx = (currentIdx - 1 + totalCards) % totalCards;
    const rightIdx = (currentIdx + 1) % totalCards;

    cards.forEach((card, i) => {
      card.classList.remove('card-center', 'card-left', 'card-right', 'card-hidden');
      if (i === currentIdx) {
        card.classList.add('card-center');
      } else if (i === leftIdx) {
        card.classList.add('card-left');
      } else if (i === rightIdx) {
        card.classList.add('card-right');
      } else {
        card.classList.add('card-hidden');
      }
    });

    pillBtns.forEach((pill, i) => {
      pill.classList.toggle('active', i === currentIdx);
    });

    scatterBubbles.forEach(bubble => {
      const target = parseInt(bubble.dataset.jumpTo, 10);
      bubble.classList.toggle('bubble-active', target === currentIdx);
    });
  }

  // Pill Clicks
  pillBtns.forEach((pill, idx) => {
    pill.addEventListener('click', () => updateDeck(idx));
  });

  // Card Clicks (click left/right card to bring to front)
  cards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      if (card.classList.contains('card-left') || card.classList.contains('card-right')) {
        updateDeck(idx);
      }
    });
  });

  // Scatter Bubble Clicks (jumps directly to relevant proof)
  scatterBubbles.forEach(bubble => {
    bubble.addEventListener('click', () => {
      const target = parseInt(bubble.dataset.jumpTo, 10);
      if (!isNaN(target)) updateDeck(target);
    });
  });

  if (btnPrev) {
    btnPrev.addEventListener('click', () => updateDeck(currentIdx - 1));
  }
  if (btnNext) {
    btnNext.addEventListener('click', () => updateDeck(currentIdx + 1));
  }

  // Touch Swipe on mobile
  if (deck) {
    let touchStartX = 0;
    let touchEndX = 0;
    deck.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    deck.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          updateDeck(currentIdx - 1); // Swiped right -> go prev
        } else {
          updateDeck(currentIdx + 1); // Swiped left -> go next
        }
      }
    }, { passive: true });
  }

  updateDeck(0);
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initCrazyChatStage);
} else {
  initCrazyChatStage();
}
`;

// UPDATE src/main.js
const mainJsPath = path.join(rootDir, 'src', 'main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

const oldProofJsStart = mainJs.indexOf('// ================= 10. CHAT PROOFS CAROUSEL CONTROLS');
if (oldProofJsStart !== -1) {
  mainJs = mainJs.slice(0, oldProofJsStart) + crazyFeedbackJs;
  fs.writeFileSync(mainJsPath, mainJs, 'utf8');
  console.log('✓ Successfully updated src/main.js with initCrazyChatStage()');
} else {
  console.error('Could not find // ================= 10. CHAT PROOFS CAROUSEL CONTROLS in main.js');
}
