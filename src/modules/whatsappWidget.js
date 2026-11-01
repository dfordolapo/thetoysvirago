/**
 * Interactive WhatsApp Chat Widget
 * - Click button to open a sleek mini chat popover
 * - Type question or click quick prompts (Delivery, Pricing, Discretion)
 * - Click "Send to WhatsApp" -> opens wa.me with custom encoded message
 */

export function initWhatsAppWidget() {
  const wrapper = document.getElementById('floating-wa-wrapper');
  const btn = document.getElementById('floating-whatsapp-btn');
  const popup = document.getElementById('floating-wa-popup');
  const btnClose = document.getElementById('wa-popup-close');
  const form = document.getElementById('wa-popup-form');
  const input = document.getElementById('wa-popup-input');
  const promptPills = document.querySelectorAll('.wa-quick-prompt');

  if (!btn || !popup) return;

  const STORE_NUMBER = '2348036514814';

  function togglePopup(open) {
    if (open) {
      popup.removeAttribute('hidden');
      popup.classList.add('open');
      if (wrapper) wrapper.classList.add('is-open');
      btn.classList.add('active');
      setTimeout(() => {
        if (input) input.focus();
      }, 100);
    } else {
      popup.classList.remove('open');
      if (wrapper) wrapper.classList.remove('is-open');
      btn.classList.remove('active');
      setTimeout(() => {
        popup.setAttribute('hidden', '');
      }, 250);
    }
  }

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const isOpen = popup.classList.contains('open');
    togglePopup(!isOpen);
  });

  if (btnClose) {
    btnClose.addEventListener('click', () => {
      togglePopup(false);
    });
  }

  // Quick preset suggestion prompts
  promptPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const text = pill.dataset.msg || pill.textContent;
      if (input) {
        input.value = text;
        input.focus();
      }
    });
  });

  // Submit and open WhatsApp
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const userText = input ? input.value.trim() : '';
      const finalMsg = userText || "Hello TheToysVirago, I'm browsing your store and have a question.";
      const waUrl = `https://wa.me/${STORE_NUMBER}?text=${encodeURIComponent(finalMsg)}`;
      
      togglePopup(false);
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      if (input) input.value = '';
    });
  }

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!popup.classList.contains('open')) return;
    if (!popup.contains(e.target) && !btn.contains(e.target)) {
      togglePopup(false);
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup.classList.contains('open')) {
      togglePopup(false);
    }
  });
}
