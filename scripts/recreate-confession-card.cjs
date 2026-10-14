const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. UPDATE index.html
const indexHtmlPath = path.join(rootDir, 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

const oldModalStart = '<!-- ===== MOODBOARD ANONYMOUS CONFESSION MODAL ===== -->';
const oldModalEnd = '<!-- Toast -->';

const newConfessionHtml = `<!-- ===== RECREATED ANONYMOUS CONFESSION CARD MODAL ===== -->
    <div id="confession-modal" class="modal-overlay confession-modal-overlay" hidden style="display: none;">
      <div class="confession-paper-card">
        <!-- Close Button -->
        <button type="button" class="btn-close-confession" id="btn-close-confession" aria-label="Close modal">&times;</button>

        <!-- 3D Glossy Red Pushpin Pinned at Top Center -->
        <div class="confession-pin-marker" aria-hidden="true">
          <svg width="28" height="34" viewBox="0 0 28 34" fill="none">
            <!-- Pin Shadow -->
            <ellipse cx="14" cy="31" rx="5.5" ry="2" fill="rgba(0,0,0,0.22)"/>
            <!-- Metal Needle Tip -->
            <path d="M14 18L14 30" stroke="#52525b" stroke-width="2.2" stroke-linecap="round"/>
            <!-- Lower Rim Base -->
            <ellipse cx="14" cy="18" rx="8" ry="3" fill="#7f1d1d"/>
            <!-- Cylindrical Taper -->
            <path d="M7.5 10C7.5 10 9.5 15.5 9.5 18C9.5 18 18.5 18 18.5 18C18.5 15.5 20.5 10 20.5 10Z" fill="url(#pinTaperGrad)"/>
            <!-- Main Bulb Sphere -->
            <circle cx="14" cy="9" r="7.5" fill="url(#pinBulbGrad)"/>
            <!-- Glossy Highlight Reflection -->
            <ellipse cx="11.5" cy="6.5" rx="3" ry="1.8" fill="#ffffff" opacity="0.75"/>
            <defs>
              <linearGradient id="pinTaperGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#991b1b"/>
                <stop offset="35%" stop-color="#ef4444"/>
                <stop offset="70%" stop-color="#b91c1c"/>
                <stop offset="100%" stop-color="#7f1d1d"/>
              </linearGradient>
              <radialGradient id="pinBulbGrad" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stop-color="#f87171"/>
                <stop offset="45%" stop-color="#dc2626"/>
                <stop offset="85%" stop-color="#991b1b"/>
                <stop offset="100%" stop-color="#7f1d1d"/>
              </radialGradient>
            </defs>
          </svg>
        </div>

        <!-- Card Header -->
        <div class="confession-head">
          <h2 class="confession-title">Share your confession</h2>
          <p class="confession-subtitle">Leave a little piece of your story.</p>
        </div>

        <!-- Form Elements -->
        <form id="confession-form" class="confession-form">
          <!-- Textarea Container -->
          <div class="confession-input-wrap">
            <textarea
              id="conf-text"
              class="confession-textarea"
              maxlength="500"
              placeholder="Let it out..."
              required
              rows="5"
            ></textarea>
            <div class="conf-counter" id="conf-char-count">0/500</div>
          </div>

          <!-- Anonymous Toggle Row -->
          <div class="confession-anon-row">
            <div class="confession-anon-label">
              <svg class="mask-icon" width="22" height="15" viewBox="0 0 24 16" fill="currentColor">
                <path d="M12 4.5C9.5 2 6 2 3 3.5C1.5 4.2 0 6 0 8C0 11.5 3 14 6 14C8.5 14 10.5 12.5 12 10.5C13.5 12.5 15.5 14 18 14C21 14 24 11.5 24 8C24 6 22.5 4.2 21 3.5C18 2 14.5 2 12 4.5ZM5.5 10.5C4.1 10.5 3 9.4 3 8C3 6.6 4.1 5.5 5.5 5.5C6.9 5.5 8 6.6 8 8C8 9.4 6.9 10.5 5.5 10.5ZM18.5 10.5C17.1 10.5 16 9.4 16 8C16 6.6 17.1 5.5 18.5 5.5C19.9 5.5 21 6.6 21 8C21 9.4 19.9 10.5 18.5 10.5Z"/>
              </svg>
              <span>Keep me anonymous</span>
            </div>
            <label class="switch conf-switch" title="Toggle anonymous mode">
              <input type="checkbox" id="conf-anon" checked />
              <span class="slider"></span>
            </label>
          </div>

          <!-- Pin My Confession Button -->
          <button type="submit" id="btn-pin-confession" class="btn-pin-confession">
            Pin My Confession
          </button>
        </form>
      </div>
    </div>

    `;

const startIdx = indexHtml.indexOf(oldModalStart);
const endIdx = indexHtml.indexOf(oldModalEnd);
if (startIdx !== -1 && endIdx !== -1) {
  indexHtml = indexHtml.substring(0, startIdx) + newConfessionHtml + indexHtml.substring(endIdx);
  fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
  console.log('✓ Successfully updated confession modal in index.html');
} else {
  console.warn('⚠️ Could not find old confession modal in index.html');
}

// 2. UPDATE src/style.css
const styleCssPath = path.join(rootDir, 'src', 'style.css');
let styleCss = fs.readFileSync(styleCssPath, 'utf8');

const oldCssStart = '/* ── SCRAPBOOK MOODBOARD CONFESSION MODAL ── */';
const oldCssIdx = styleCss.indexOf(oldCssStart);

const newConfessionCss = `/* ── RECREATED CONFESSION CARD MODAL ── */
.confession-modal-overlay {
  background: rgba(10, 10, 15, 0.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  z-index: 99996;
}

.confession-paper-card {
  max-width: 480px;
  width: 100%;
  background: #fbf9f5;
  border: 1px solid #e8e2d5;
  border-radius: 16px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.08),
    0 25px 60px -5px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.4) inset;
  padding: 34px 32px 30px;
  position: relative;
  box-sizing: border-box;
  animation: confessionCardIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes confessionCardIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 3D Red Pushpin at top center */
.confession-pin-marker {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2));
  pointer-events: none;
}

/* Close Button in top right */
.btn-close-confession {
  position: absolute;
  top: 14px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: none;
  border: none;
  font-size: 22px;
  line-height: 1;
  color: #64748b;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
}
.btn-close-confession:hover {
  color: #0f172a;
  background: rgba(0, 0, 0, 0.05);
  transform: scale(1.08);
}

/* Header */
.confession-head {
  text-align: center;
  margin-bottom: 22px;
  padding: 0 10px;
}
.confession-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: clamp(28px, 5.5vw, 35px);
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px;
  line-height: 1.15;
  letter-spacing: -0.01em;
}
.confession-subtitle {
  font-size: 13.5px;
  color: #64748b;
  margin: 0;
  line-height: 1.45;
}

/* Form */
.confession-form {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Textarea input wrapper */
.confession-input-wrap {
  position: relative;
  width: 100%;
  margin-bottom: 16px;
}

.confession-textarea {
  width: 100%;
  min-height: 135px;
  background: #f0ece3;
  border: 1.5px solid #dfd8cb;
  border-radius: 12px;
  padding: 14px 16px 28px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  line-height: 1.55;
  color: #0f172a;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.confession-textarea::placeholder {
  color: #94a3b8;
  font-style: italic;
}
.confession-textarea:focus {
  border-color: #b91c1c;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.12);
}

/* Character counter at bottom-right inside textarea */
.conf-counter {
  position: absolute;
  bottom: 8px;
  right: 14px;
  font-size: 11px;
  font-weight: 500;
  color: #78716c;
  pointer-events: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* Anonymous row */
.confession-anon-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  margin-bottom: 20px;
}

.confession-anon-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13.5px;
  font-weight: 600;
  color: #1e293b;
  letter-spacing: -0.01em;
}
.confession-anon-label .mask-icon {
  color: #1e293b;
  flex-shrink: 0;
}

/* Toggle Switch customized to red */
.conf-switch {
  position: relative;
  display: inline-block;
  width: 42px;
  height: 24px;
  margin: 0;
  flex-shrink: 0;
}
.conf-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.conf-switch .slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #cbd5e1;
  transition: 0.25s ease;
  border-radius: 999px;
}
.conf-switch .slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.25s ease;
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
}
.conf-switch input:checked + .slider {
  background-color: #b91c1c;
}
.conf-switch input:checked + .slider:before {
  transform: translateX(18px);
}

/* Pin My Confession Pill Button */
.btn-pin-confession {
  width: 100%;
  height: 48px;
  border-radius: 999px;
  background: linear-gradient(180deg, #b91c1c 0%, #991b1b 100%);
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.02em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(185, 28, 28, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}
.btn-pin-confession:hover {
  transform: translateY(-1.5px);
  box-shadow: 0 8px 22px rgba(185, 28, 28, 0.45);
  background: linear-gradient(180deg, #dc2626 0%, #b91c1c 100%);
}
.btn-pin-confession:active {
  transform: translateY(1px);
}

/* ── Mobile Optimization (< 520px) ── */
@media (max-width: 520px) {
  .confession-modal-overlay {
    padding: 16px 12px;
  }
  .confession-paper-card {
    padding: 28px 18px 22px;
    border-radius: 14px;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  }
  .confession-pin-marker {
    top: -13px;
  }
  .confession-head {
    margin-bottom: 16px;
  }
  .confession-title {
    font-size: 26px;
  }
  .confession-subtitle {
    font-size: 12.5px;
  }
  .confession-textarea {
    min-height: 120px;
    font-size: 13.5px;
    padding: 12px 14px 26px;
  }
  .confession-anon-label {
    font-size: 12.5px;
  }
  .btn-pin-confession {
    height: 44px;
    font-size: 17px;
  }
}
`;

if (oldCssIdx !== -1) {
  styleCss = styleCss.substring(0, oldCssIdx) + newConfessionCss;
} else {
  styleCss += '\n' + newConfessionCss;
}

fs.writeFileSync(styleCssPath, styleCss, 'utf8');
console.log('✓ Successfully updated confession modal CSS in src/style.css');

console.log('\nConfession card completely recreated in pure HTML & CSS!');
