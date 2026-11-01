/**
 * Pull to Refresh Controller
 * - Triggers ONLY from the very top of the screen (scrollY <= 0, touch start <= 70px)
 * - Physical tension resistance (square-root / logarithmic dampening)
 * - Visual feedback indicator: animated circular spinner with arrow rotation
 * - Threshold: requires an intentional 85px physical pull
 * - Haptic vibration feedback on threshold reached
 * - Smooth spring release and reload
 */

export function initPullToRefresh() {
  if (typeof window === 'undefined' || !('ontouchstart' in window)) {
    return; // Touch-only feature for mobile devices and simulators
  }

  // Prevent multiple initializations
  if (document.getElementById('ptr-indicator')) return;

  // Create Pull-to-Refresh Indicator Element
  const ptr = document.createElement('div');
  ptr.id = 'ptr-indicator';
  ptr.className = 'ptr-indicator';
  ptr.innerHTML = `
    <div class="ptr-pill">
      <svg class="ptr-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path class="ptr-arrow" d="M12 4v12m0 0l-4-4m4 4l4-4" />
        <path class="ptr-arc" d="M20 12A8 8 0 1 1 12 4" stroke-dasharray="50" stroke-dashoffset="50" />
      </svg>
      <span class="ptr-label">Pull to refresh</span>
    </div>
  `;
  document.body.appendChild(ptr);

  const ptrPill = ptr.querySelector('.ptr-pill');
  const ptrIcon = ptr.querySelector('.ptr-icon');
  const ptrArrow = ptr.querySelector('.ptr-arrow');
  const ptrArc = ptr.querySelector('.ptr-arc');
  const ptrLabel = ptr.querySelector('.ptr-label');

  let startY = 0;
  let startX = 0;
  let currentY = 0;
  let pulling = false;
  let refreshing = false;
  let hasVibrated = false;

  const PULL_THRESHOLD = 80; // pixels of dampened pull required
  const MAX_PULL = 130;      // max displacement cap
  const TOP_TOUCH_ZONE = 90; // must start touch near top of the screen (within 90px)

  function isModalOpen() {
    const modals = [
      '#cart-drawer.open',
      '#checkout-modal:not([hidden])',
      '#quickview-modal:not([hidden])',
      '#policy-modal:not([hidden])',
      '#error-states-modal:not([hidden])',
      '#nav-dropdown:not([hidden])'
    ];
    return !!document.querySelector(modals.join(','));
  }

  window.addEventListener('touchstart', (e) => {
    if (refreshing || isModalOpen()) return;

    // Strict top check: Page must be scrolled to 0 AND finger must start in the top zone
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollY > 2) return;

    const touch = e.touches[0];
    if (touch.clientY > TOP_TOUCH_ZONE) {
      // Must start at the very top of the screen
      return;
    }

    startY = touch.clientY;
    startX = touch.clientX;
    currentY = startY;
    pulling = false;
    hasVibrated = false;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (refreshing || startY === 0 || isModalOpen()) return;

    const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollY > 2) {
      // User scrolled down into content, cancel pull
      cancelPull();
      return;
    }

    const touch = e.touches[0];
    const diffY = touch.clientY - startY;
    const diffX = Math.abs(touch.clientX - startX);

    // If horizontal swipe or scrolling upwards, ignore
    if (diffY <= 0 || diffX > diffY) {
      return;
    }

    // Require an initial intentional drag distance of 14px before activating
    if (diffY > 14) {
      pulling = true;
      // Dampened tension resistance: diffY ^ 0.72
      const pullDistance = Math.min(Math.pow(diffY, 0.74) * 2.5, MAX_PULL);
      const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);

      ptr.style.transform = `translate(-50%, ${pullDistance}px)`;
      ptr.style.opacity = Math.min(progress * 1.4, 1);

      // Rotate arrow and fill circular arc based on progress
      if (ptrIcon) {
        ptrIcon.style.transform = `rotate(${progress * 180}deg)`;
      }
      if (ptrArc) {
        // stroke-dashoffset: 50 -> 0
        const offset = 50 - (progress * 50);
        ptrArc.style.strokeDashoffset = offset;
      }

      if (pullDistance >= PULL_THRESHOLD) {
        ptr.classList.add('ptr-ready');
        if (ptrLabel) ptrLabel.textContent = 'Release to refresh';
        if (!hasVibrated && navigator.vibrate) {
          navigator.vibrate(12);
          hasVibrated = true;
        }
      } else {
        ptr.classList.remove('ptr-ready');
        if (ptrLabel) ptrLabel.textContent = 'Pull to refresh';
        hasVibrated = false;
      }

      // Prevent native overscroll quirks when pulling
      if (e.cancelable && pullDistance > 30) {
        e.preventDefault();
      }
    }
  }, { passive: false });

  function cancelPull() {
    startY = 0;
    startX = 0;
    pulling = false;
    ptr.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease';
    ptr.style.transform = 'translate(-50%, -60px)';
    ptr.style.opacity = '0';
    ptr.classList.remove('ptr-ready', 'ptr-refreshing');
    if (ptrIcon) ptrIcon.style.transform = 'rotate(0deg)';
    if (ptrArc) ptrArc.style.strokeDashoffset = '50';
    setTimeout(() => {
      ptr.style.transition = '';
    }, 320);
  }

  window.addEventListener('touchend', (e) => {
    if (refreshing || startY === 0) return;

    if (!pulling) {
      startY = 0;
      return;
    }

    const isReady = ptr.classList.contains('ptr-ready');
    if (isReady) {
      // Trigger actual refresh
      refreshing = true;
      ptr.classList.remove('ptr-ready');
      ptr.classList.add('ptr-refreshing');
      ptr.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
      ptr.style.transform = 'translate(-50%, 65px)';
      ptr.style.opacity = '1';
      if (ptrLabel) ptrLabel.textContent = 'Refreshing...';

      if (navigator.vibrate) {
        navigator.vibrate([15, 40, 15]);
      }

      // Visual pause so the user sees the refreshing feedback spinner
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } else {
      cancelPull();
    }
  }, { passive: true });

  window.addEventListener('touchcancel', () => {
    if (!refreshing) {
      cancelPull();
    }
  }, { passive: true });
}
