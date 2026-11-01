/**
 * Pull to Refresh Controller
 * - Works on mobile touch devices as well as desktop mouse drag / device emulation
 * - Triggers when dragging downwards from the top of the viewport (scrollY <= 0)
 * - Physical tension resistance (logarithmic / exponential dampening)
 * - Visual feedback indicator: animated circular spinner with arrow rotation
 * - Threshold: requires an intentional 75px physical pull
 * - Haptic vibration feedback on threshold reached
 * - Smooth spring release and reload
 */

export function initPullToRefresh() {
  if (typeof window === 'undefined') return;

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

  const ptrIcon = ptr.querySelector('.ptr-icon');
  const ptrArc = ptr.querySelector('.ptr-arc');
  const ptrLabel = ptr.querySelector('.ptr-label');

  let startY = 0;
  let startX = 0;
  let pulling = false;
  let refreshing = false;
  let hasVibrated = false;

  const PULL_THRESHOLD = 75;  // pixels of dampened pull required to trigger
  const MAX_PULL = 130;       // max displacement cap
  const TOP_TOUCH_ZONE = 160; // start drag anywhere within top 160px (under top nav or hero)

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

  function handleStart(clientX, clientY) {
    if (refreshing || isModalOpen()) return;

    const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollY > 5) return;

    if (clientY > TOP_TOUCH_ZONE) return;

    startY = clientY;
    startX = clientX;
    pulling = false;
    hasVibrated = false;
  }

  function handleMove(clientX, clientY, e) {
    if (refreshing || startY === 0 || isModalOpen()) return;

    const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollY > 5) {
      cancelPull();
      return;
    }

    const diffY = clientY - startY;
    const diffX = Math.abs(clientX - startX);

    // If horizontal swipe or scrolling upwards, ignore
    if (diffY <= 0 || diffX > diffY * 1.2) {
      return;
    }

    // Require an initial intentional drag distance of 10px before activating
    if (diffY > 10) {
      pulling = true;
      // Dampened tension resistance: diffY ^ 0.74
      const pullDistance = Math.min(Math.pow(diffY, 0.74) * 2.4, MAX_PULL);
      const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);

      ptr.style.transform = `translate(-50%, ${pullDistance}px)`;
      ptr.style.opacity = Math.min(progress * 1.5, 1);

      // Rotate arrow and fill circular arc based on progress
      if (ptrIcon) {
        ptrIcon.style.transform = `rotate(${progress * 180}deg)`;
      }
      if (ptrArc) {
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

      if (e && e.cancelable && pullDistance > 25) {
        e.preventDefault();
      }
    }
  }

  function handleEnd() {
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
      ptr.style.transform = 'translate(-50%, 75px)';
      ptr.style.opacity = '1';
      if (ptrLabel) ptrLabel.textContent = 'Refreshing...';

      if (navigator.vibrate) {
        navigator.vibrate([15, 40, 15]);
      }

      setTimeout(() => {
        window.location.reload();
      }, 700);
    } else {
      cancelPull();
    }
  }

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

  // 1. Mobile Touch Listeners
  window.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches[0]) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY, e);
    }
  }, { passive: false });

  window.addEventListener('touchend', () => {
    handleEnd();
  }, { passive: true });

  window.addEventListener('touchcancel', () => {
    if (!refreshing) cancelPull();
  }, { passive: true });

  // 2. Desktop Mouse Drag (helps testing on desktop & browser inspection without device toolbar)
  let isMouseDown = false;
  window.addEventListener('mousedown', (e) => {
    // Only left click
    if (e.button !== 0) return;
    isMouseDown = true;
    handleStart(e.clientX, e.clientY);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    handleMove(e.clientX, e.clientY, e);
  });

  window.addEventListener('mouseup', () => {
    if (!isMouseDown) return;
    isMouseDown = false;
    handleEnd();
  });
}
