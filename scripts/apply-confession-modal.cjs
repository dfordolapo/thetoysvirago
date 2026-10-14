const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. UPDATE index.html with the new moodboard confession modal structure
const indexHtmlPath = path.join(rootDir, 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

const oldModalStart = '<!-- ===== ANONYMOUS CONFESSION MODAL (100% NAMELESS) ===== -->';
const oldModalEnd = '<!-- Toast -->';

const newConfessionModalHtml = `<!-- ===== MOODBOARD ANONYMOUS CONFESSION MODAL ===== -->
    <div id="confession-modal" class="modal-overlay confession-modal-overlay" hidden style="display: none;">
      <div class="confession-board-card">
        <button type="button" class="btn-close-confession" id="btn-close-confession" aria-label="Close modal">&times;</button>

        <!-- Mobile Header (Hidden on Desktop, Displayed on Mobile Above Form) -->
        <div class="confession-mobile-header">
          <h2 class="confession-title">Share your confession</h2>
          <p class="confession-subtitle">Leave a little piece of your story.</p>
        </div>

        <!-- Center Paper Card / Interactive Form Container -->
        <div class="confession-center-card">
          <!-- 3D Red Pushpin Icon -->
          <div class="confession-pin-marker" aria-hidden="true">
            <svg width="22" height="28" viewBox="0 0 24 32" fill="none">
              <ellipse cx="12" cy="10" rx="9" ry="9" fill="url(#confPinGrad)" />
              <ellipse cx="9.5" cy="7" rx="3.5" ry="2" fill="#ff8a9e" opacity="0.8" />
              <path d="M12 19L12 30" stroke="#71717a" stroke-width="2.5" stroke-linecap="round" />
              <defs>
                <radialGradient id="confPinGrad" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stop-color="#ef4444"/>
                  <stop offset="60%" stop-color="#b91c1c"/>
                  <stop offset="100%" stop-color="#7f1d1d"/>
                </radialGradient>
              </defs>
            </svg>
          </div>

          <form id="confession-form" class="confession-form">
            <!-- Textarea with Inset Border & Character Counter -->
            <div class="confession-input-wrap">
              <textarea
                id="conf-text"
                class="confession-textarea"
                maxlength="500"
                placeholder="Let it out..."
                required
              ></textarea>
              <div class="conf-counter" id="conf-char-count">0/500</div>
            </div>

            <!-- Anonymous Row -->
            <div class="confession-anon-row">
              <div class="confession-anon-label">
                <svg class="mask-icon" width="20" height="14" viewBox="0 0 24 16" fill="currentColor">
                  <path d="M12 4.5C9.5 2 6 2 3 3.5C1.5 4.2 0 6 0 8C0 11.5 3 14 6 14C8.5 14 10.5 12.5 12 10.5C13.5 12.5 15.5 14 18 14C21 14 24 11.5 24 8C24 6 22.5 4.2 21 3.5C18 2 14.5 2 12 4.5ZM5.5 10.5C4.1 10.5 3 9.4 3 8C3 6.6 4.1 5.5 5.5 5.5C6.9 5.5 8 6.6 8 8C8 9.4 6.9 10.5 5.5 10.5ZM18.5 10.5C17.1 10.5 16 9.4 16 8C16 6.6 17.1 5.5 18.5 5.5C19.9 5.5 21 6.6 21 8C21 9.4 19.9 10.5 18.5 10.5Z"/>
                </svg>
                <span>Keep me anonymous</span>
              </div>
              <label class="switch conf-switch" title="Toggle anonymous mode">
                <input type="checkbox" id="conf-anon" checked />
                <span class="slider"></span>
              </label>
            </div>

            <!-- Submit Button -->
            <button type="submit" id="btn-pin-confession" class="btn-pin-confession">
              Pin My Confession
            </button>
          </form>
        </div>
      </div>
    </div>

    `;

const startIdx = indexHtml.indexOf(oldModalStart);
const endIdx = indexHtml.indexOf(oldModalEnd);
if (startIdx !== -1 && endIdx !== -1) {
  indexHtml = indexHtml.substring(0, startIdx) + newConfessionModalHtml + indexHtml.substring(endIdx);
  fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
  console.log('✓ Successfully replaced confession modal in index.html');
} else {
  console.warn('⚠️ Could not locate confession modal markers in index.html');
}

// 2. ADD CSS to src/style.css
const styleCssPath = path.join(rootDir, 'src', 'style.css');
let styleCss = fs.readFileSync(styleCssPath, 'utf8');

const confessionModalCss = `
/* ── SCRAPBOOK MOODBOARD CONFESSION MODAL ── */
.confession-modal-overlay {
  background: rgba(10, 10, 15, 0.78);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 99996;
}

.confession-board-card {
  width: 580px;
  max-width: 94vw;
  aspect-ratio: 1 / 1;
  background-color: #0d0d12;
  background-image: url('/assets/confession-modal-bg.webp');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  border-radius: 24px;
  box-shadow: 0 35px 80px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Close button pinned to top right */
.btn-close-confession {
  position: absolute;
  top: 18px;
  right: 20px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: none;
  border: none;
  font-size: 26px;
  line-height: 1;
  color: #1a1a1a;
  cursor: pointer;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, color 0.2s ease;
  padding: 0;
}
.btn-close-confession:hover {
  color: #b91c1c;
  transform: scale(1.15);
}

/* Desktop Center Card Interactive Layer */
.confession-center-card {
  position: absolute;
  top: 34.5%;
  left: 29.8%;
  width: 44.5%;
  height: 40.5%;
  z-index: 15;
  display: flex;
  flex-direction: column;
}

.confession-pin-marker {
  display: none; /* Already rendered in desktop background image */
}

.confession-mobile-header {
  display: none; /* Already rendered in desktop background image */
}

.confession-form {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Textarea input wrapper */
.confession-input-wrap {
  position: relative;
  width: 100%;
  height: 54%;
}

.confession-textarea {
  width: 100%;
  height: 100%;
  background: #ebe8e1;
  border: 1.5px solid #d5d0c5;
  border-radius: 12px;
  padding: 10px 12px 24px 12px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  line-height: 1.45;
  color: #1f2937;
  resize: none;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.confession-textarea::placeholder {
  color: #9ca3af;
  font-style: italic;
}
.confession-textarea:focus {
  border-color: #b91c1c;
  box-shadow: 0 0 0 3px rgba(185, 28, 28, 0.15);
}

/* Character counter at bottom-right inside textarea */
.conf-counter {
  position: absolute;
  bottom: 6px;
  right: 10px;
  font-size: 10.5px;
  color: #78716c;
  font-weight: 500;
  pointer-events: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* Anonymous row */
.confession-anon-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 2px;
  margin-top: 4px;
}

.confession-anon-label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 600;
  color: #111827;
  letter-spacing: -0.01em;
}
.confession-anon-label .mask-icon {
  color: #111827;
  flex-shrink: 0;
}

/* Toggle Switch customized to match red slider */
.conf-switch {
  position: relative;
  display: inline-block;
  width: 38px;
  height: 22px;
  margin: 0;
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
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.25s ease;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.25);
}
.conf-switch input:checked + .slider {
  background-color: #b91c1c;
}
.conf-switch input:checked + .slider:before {
  transform: translateX(16px);
}

/* Pin My Confession Pill Button */
.btn-pin-confession {
  width: 100%;
  height: 38px;
  border-radius: 999px;
  background: linear-gradient(180deg, #b91c1c 0%, #991b1b 100%);
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.03em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(185, 28, 28, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  margin-top: 4px;
}
.btn-pin-confession:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(185, 28, 28, 0.5);
  background: linear-gradient(180deg, #dc2626 0%, #b91c1c 100%);
}
.btn-pin-confession:active {
  transform: translateY(1px);
}

/* ── Mobile Responsive Adaptation (< 540px) ── */
@media (max-width: 539px) {
  .confession-board-card {
    width: 100%;
    max-width: 380px;
    aspect-ratio: auto;
    padding: 22px 18px 24px;
    background-size: cover;
    background-position: center top;
    box-shadow: 0 20px 50px rgba(0,0,0,0.8);
  }

  .btn-close-confession {
    top: 14px;
    right: 14px;
    color: #ffffff;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(6px);
  }

  .confession-mobile-header {
    display: block;
    text-align: center;
    margin-bottom: 12px;
    padding-top: 8px;
  }
  .confession-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 26px;
    font-weight: 700;
    color: #ffffff;
    margin: 0 0 4px;
    text-shadow: 0 2px 10px rgba(0,0,0,0.85);
  }
  .confession-subtitle {
    font-size: 12.5px;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
    text-shadow: 0 1px 6px rgba(0,0,0,0.85);
  }

  .confession-center-card {
    position: relative;
    top: auto;
    left: auto;
    width: 100%;
    height: auto;
    background: #f5f2ec;
    border: 1px solid #dcd7cc;
    border-radius: 16px;
    padding: 22px 16px 18px;
    box-shadow: 0 12px 30px rgba(0,0,0,0.35);
  }

  .confession-pin-marker {
    display: block;
    position: absolute;
    top: -14px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
  }

  .confession-form {
    height: auto;
    gap: 12px;
  }

  .confession-input-wrap {
    height: 120px;
  }

  .confession-textarea {
    font-size: 13.5px;
  }

  .btn-pin-confession {
    height: 44px;
    font-size: 17px;
    margin-top: 8px;
  }
}
`;

if (!styleCss.includes('/* ── SCRAPBOOK MOODBOARD CONFESSION MODAL ── */')) {
  styleCss += '\n' + confessionModalCss;
  fs.writeFileSync(styleCssPath, styleCss, 'utf8');
  console.log('✓ Added confession modal CSS to src/style.css');
} else {
  console.log('ℹ Confession modal CSS already present in src/style.css');
}

// 3. UPDATE src/main.js: Update character count listener and form handler
const mainJsPath = path.join(rootDir, 'src', 'main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

const confCounterCode = `
  // Confession character counter & live update
  const confTextarea = document.getElementById('conf-text');
  const confCharCount = document.getElementById('conf-char-count');
  if (confTextarea && confCharCount) {
    confTextarea.addEventListener('input', () => {
      confCharCount.textContent = \`\${confTextarea.value.length}/500\`;
    });
  }
`;

if (!mainJs.includes("conf-char-count")) {
  mainJs = mainJs.replace(
    "const form = document.getElementById('confession-form');",
    "const form = document.getElementById('confession-form');" + confCounterCode
  );
  fs.writeFileSync(mainJsPath, mainJs, 'utf8');
  console.log('✓ Added character counter listener to src/main.js');
}

console.log('\nAll confession modal updates applied successfully!');
