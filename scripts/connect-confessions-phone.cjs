const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. UPDATE index.html: Replace the phone interior and clear hardcoded pills
const indexHtmlPath = path.join(rootDir, 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

const oldStageStart = '<div class="cardboard-box-wrapper" id="cardboard-box-wrap"';
const oldStageEnd = '<div class="toybox-share-row"';

const newPhoneStageHtml = `<div class="cardboard-box-wrapper" id="cardboard-box-wrap" style="background: transparent; position: relative; display: flex; justify-content: center; min-height: 600px; padding: 20px 0;">
            
            <!-- Real Dynamic Confessions Phone Mockup -->
            <div class="transparent-phone-mockup" id="confessions-phone">
              <!-- Phone Status Bar -->
              <div class="phone-status-bar">
                <span class="phone-status-time">9:41</span>
                <div class="phone-dynamic-island">
                  <span class="island-camera"></span>
                </div>
                <div class="phone-status-icons">
                  <svg width="14" height="10" viewBox="0 0 16 12" fill="currentColor"><path d="M0 2C3.3-0.7 8.7-0.7 12 2L6 10L0 2Z"/></svg>
                  <svg width="18" height="9" viewBox="0 0 20 10" fill="currentColor"><rect x="1" y="1" width="15" height="8" rx="2" stroke="currentColor" fill="none"/><rect x="3" y="3" width="9" height="4" rx="1" fill="currentColor"/><path d="M18 4V6" stroke="currentColor" stroke-width="1.5"/></svg>
                </div>
              </div>

              <!-- Phone Chat Header -->
              <div class="phone-chat-bar">
                <div class="phone-chat-user">
                  <div class="phone-chat-avatar">
                    <svg width="14" height="10" viewBox="0 0 24 16" fill="#fff"><path d="M12 4.5C9.5 2 6 2 3 3.5C1.5 4.2 0 6 0 8C0 11.5 3 14 6 14C8.5 14 10.5 12.5 12 10.5C13.5 12.5 15.5 14 18 14C21 14 24 11.5 24 8C24 6 22.5 4.2 21 3.5C18 2 14.5 2 12 4.5Z"/></svg>
                  </div>
                  <div class="phone-chat-info">
                    <span class="phone-chat-title">Confessions Vault</span>
                    <span class="phone-chat-status">● End-to-End Encrypted</span>
                  </div>
                </div>
                <span class="phone-chat-lock" title="100% Anonymous & Secure">🔒</span>
              </div>

              <!-- Phone Messages Feed (Cleared of old dummy messages, dynamic live feed) -->
              <div class="phone-chat-body" id="confessions-phone-feed">
                <!-- Dynamically rendered by JS from submitted confessions -->
              </div>

              <!-- Phone Bottom Quick Trigger -->
              <div class="phone-chat-foot">
                <button type="button" class="phone-input-fake" id="btn-phone-quick-confess">
                  <span>Whisper your confession...</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
                <div class="phone-home-indicator"></div>
              </div>
            </div>

          </div>
        </div>

        `;

const startIdx = indexHtml.indexOf(oldStageStart);
const endIdx = indexHtml.indexOf(oldStageEnd);
if (startIdx !== -1 && endIdx !== -1) {
  indexHtml = indexHtml.substring(0, startIdx) + newPhoneStageHtml + indexHtml.substring(endIdx);
  fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
  console.log('✓ Successfully replaced phone mockup and cleared old messages in index.html');
} else {
  console.warn('⚠️ Could not locate phone mockup markers in index.html');
}

// 2. ADD CSS TO src/style.css
const styleCssPath = path.join(rootDir, 'src', 'style.css');
let styleCss = fs.readFileSync(styleCssPath, 'utf8');

const phoneChatCss = `
/* ── CONFESSIONS PHONE MOCKUP CHAT UI ── */
.transparent-phone-mockup {
  width: 300px !important;
  height: 590px !important;
  max-width: 90vw !important;
  border-radius: 46px !important;
  border: 7px solid #201e1c !important;
  outline: 2.5px solid rgba(226, 203, 152, 0.45) !important;
  overflow: hidden !important;
  position: relative !important;
  z-index: 2 !important;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.15),
    0 25px 60px rgba(0, 0, 0, 0.8),
    0 0 50px rgba(225, 29, 72, 0.18) !important;
  align-self: center !important;
  background: #090a0f !important;
  display: flex !important;
  flex-direction: column !important;
}

.phone-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px 4px;
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  z-index: 10;
  background: #090a0f;
}
.phone-dynamic-island {
  width: 72px;
  height: 18px;
  background: #000000;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
}
.island-camera {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #1e1e24;
  border: 1px solid #2a2a35;
}
.phone-status-icons {
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.85;
}

.phone-chat-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px 10px;
  background: rgba(18, 19, 26, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  z-index: 5;
}
.phone-chat-user {
  display: flex;
  align-items: center;
  gap: 10px;
}
.phone-chat-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e11d48 0%, #9f1239 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(225, 29, 72, 0.35);
}
.phone-chat-info {
  display: flex;
  flex-direction: column;
}
.phone-chat-title {
  font-size: 12.5px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.01em;
}
.phone-chat-status {
  font-size: 9.5px;
  color: #34d399;
  letter-spacing: 0.02em;
}
.phone-chat-lock {
  font-size: 13px;
  opacity: 0.7;
}

.phone-chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  background:
    radial-gradient(circle at 50% 10%, rgba(225, 29, 72, 0.08) 0%, transparent 60%),
    #0c0d14;
}
.phone-chat-body::-webkit-scrollbar {
  display: none;
}

.phone-empty-state {
  margin: auto;
  text-align: center;
  padding: 24px 14px;
}
.phone-empty-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(225, 29, 72, 0.12);
  border: 1px solid rgba(225, 29, 72, 0.25);
  color: #e11d48;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}
.phone-empty-title {
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}
.phone-empty-sub {
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.45;
}

.phone-msg-bubble {
  max-width: 90%;
  align-self: flex-start;
  background: rgba(26, 28, 38, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px 16px 16px 4px;
  padding: 10px 12px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  animation: phoneMsgIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}
.phone-msg-bubble.is-new {
  border-color: rgba(225, 29, 72, 0.55);
  background: rgba(38, 20, 26, 0.95);
  box-shadow: 0 4px 16px rgba(225, 29, 72, 0.25);
}
@keyframes phoneMsgIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.phone-msg-text {
  font-size: 12px;
  line-height: 1.5;
  color: #f8fafc;
  word-break: break-word;
}
.phone-msg-foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 6px;
}
.phone-msg-tag {
  font-size: 8.5px;
  color: #fda4af;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-right: auto;
}
.phone-msg-time {
  font-size: 9px;
  color: #64748b;
}
.phone-msg-ticks {
  font-size: 10px;
  color: #38bdf8;
  font-weight: 700;
  line-height: 1;
}

.phone-chat-foot {
  padding: 8px 12px 10px;
  background: rgba(18, 19, 26, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 5;
}
.phone-input-fake {
  width: 100%;
  height: 36px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #94a3b8;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11.5px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.phone-input-fake:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  border-color: rgba(225, 29, 72, 0.5);
}
.phone-home-indicator {
  width: 100px;
  height: 4px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 4px;
}
`;

if (!styleCss.includes('/* ── CONFESSIONS PHONE MOCKUP CHAT UI ── */')) {
  styleCss += '\n' + phoneChatCss;
  fs.writeFileSync(styleCssPath, styleCss, 'utf8');
  console.log('✓ Added phone chat CSS to src/style.css');
} else {
  console.log('ℹ Phone chat CSS already present in src/style.css');
}

// 3. UPDATE src/main.js: Add confession manager and phone feed wiring
const mainJsPath = path.join(rootDir, 'src', 'main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

const confessionsPhoneManagerJs = `
// ================= CONFESSIONS LIVE PHONE MANAGER =================
const CONFESSIONS_STORAGE_KEY = 'thetoysvirago_community_confessions';

function escapeConfHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getStoredConfessions() {
  try {
    const raw = localStorage.getItem(CONFESSIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveConfessionToPhone(text, isAnonymous = true) {
  const list = getStoredConfessions();
  const newEntry = {
    id: Date.now(),
    text: text,
    isAnonymous: isAnonymous,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date().toISOString()
  };
  list.unshift(newEntry);
  try {
    localStorage.setItem(CONFESSIONS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Confessions localStorage error:', e);
  }
  renderPhoneConfessions(true);
  return newEntry;
}

function renderPhoneConfessions(highlightFirst = false) {
  const feed = document.getElementById('confessions-phone-feed');
  if (!feed) return;

  const confessions = getStoredConfessions();
  feed.innerHTML = '';

  if (confessions.length === 0) {
    feed.innerHTML = \`
      <div class="phone-empty-state">
        <div class="phone-empty-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <div class="phone-empty-title">Zero Traces Yet</div>
        <div class="phone-empty-sub">Be the first to whisper a secret. Tap below to share your confession.</div>
      </div>
    \`;
    return;
  }

  confessions.forEach((c, idx) => {
    const bubble = document.createElement('div');
    bubble.className = \`phone-msg-bubble \${highlightFirst && idx === 0 ? 'is-new' : ''}\`;
    bubble.innerHTML = \`
      <div class="phone-msg-text">"\${escapeConfHtml(c.text)}"</div>
      <div class="phone-msg-foot">
        <span class="phone-msg-tag">🔒 Anonymous</span>
        <span class="phone-msg-time">\${c.time || 'Today'}</span>
        <span class="phone-msg-ticks">✓✓</span>
      </div>
    \`;
    feed.appendChild(bubble);
  });

  feed.scrollTop = 0;
}
`;

// Replace initConfessionsSlideshow in src/main.js with updated logic that renders confessions on the phone
const oldInitConfessionsStart = 'function initConfessionsSlideshow() {';
const oldInitConfessionsEnd = 'if (document.readyState === \'loading\') {\n  window.addEventListener(\'DOMContentLoaded\', initConfessionsSlideshow);';

const newInitConfessionsCode = `function initConfessionsSlideshow() {
  const modal = document.getElementById('confession-modal');
  const btnOpen = document.getElementById('btn-open-confession');
  const btnPhoneQuick = document.getElementById('btn-phone-quick-confess');
  const btnClose = document.getElementById('btn-close-confession');
  const form = document.getElementById('confession-form');

  // Render stored confessions onto the phone screen
  renderPhoneConfessions();

  // Modal open triggers
  function openConfessionModal() {
    if (modal) {
      modal.removeAttribute('hidden');
      modal.style.display = 'flex';
      const textInput = document.getElementById('conf-text');
      if (textInput) textInput.focus();
    }
  }

  function closeConfessionModal() {
    if (modal) {
      modal.setAttribute('hidden', '');
      modal.style.display = 'none';
    }
  }

  if (btnOpen) btnOpen.addEventListener('click', openConfessionModal);
  if (btnPhoneQuick) btnPhoneQuick.addEventListener('click', openConfessionModal);
  if (btnClose) btnClose.addEventListener('click', closeConfessionModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeConfessionModal();
    });
  }

  // Handle confession submission: Saves & displays on phone screen!
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const textInput = document.getElementById('conf-text');
      const text = textInput ? textInput.value.trim() : '';
      const isAnonInput = document.getElementById('conf-anon');
      const isAnon = isAnonInput ? isAnonInput.checked : true;

      if (text) {
        saveConfessionToPhone(text, isAnon);
      }

      closeConfessionModal();
      form.reset();
      const countEl = document.getElementById('conf-char-count');
      if (countEl) countEl.textContent = '0/500';

      if (typeof showToast === 'function') {
        showToast('Confession pinned! It is now live on the phone screen.');
      }
    });
  }
}
`;

// Insert confessionsPhoneManagerJs before initConfessionsSlideshow
if (!mainJs.includes('CONFESSIONS_STORAGE_KEY')) {
  mainJs = mainJs.replace(oldInitConfessionsStart, confessionsPhoneManagerJs + '\n' + oldInitConfessionsStart);
}

const cStart = mainJs.indexOf('function initConfessionsSlideshow() {');
const cEnd = mainJs.indexOf("if (document.readyState === 'loading') {\n  window.addEventListener('DOMContentLoaded', initConfessionsSlideshow);");
if (cStart !== -1 && cEnd !== -1) {
  mainJs = mainJs.substring(0, cStart) + newInitConfessionsCode + '\n' + mainJs.substring(cEnd);
  fs.writeFileSync(mainJsPath, mainJs, 'utf8');
  console.log('✓ Updated confession handling and phone feed in src/main.js');
} else {
  console.warn('⚠️ Could not match initConfessionsSlideshow block in src/main.js');
}

console.log('\nConfessions phone screen integration complete!');
