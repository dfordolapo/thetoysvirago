/**
 * Shared Custom White Rounded Dropdown (<select> enhancer)
 * Portals the open menu to document.body with position: fixed and z-index: 999999
 * so it is never clipped or hidden behind drawers, cards, or modal footers.
 */

const instances = [];
let globalListenersAttached = false;

function closeAllMenus(exceptWrapper = null) {
  instances.forEach((inst) => {
    if (inst.wrapper !== exceptWrapper) {
      inst.close();
    }
  });
}

function ensureGlobalListeners() {
  if (globalListenersAttached) return;
  globalListenersAttached = true;

  document.addEventListener('click', () => closeAllMenus());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllMenus();
  });
  window.addEventListener('resize', () => {
    instances.forEach((inst) => {
      if (inst.isOpen()) inst.positionMenu();
    });
  });
  window.addEventListener('scroll', (e) => {
    instances.forEach((inst) => {
      if (!inst.isOpen()) return;
      if (e.target && inst.menu.contains(e.target)) return;
      inst.positionMenu();
    });
  }, true);
}

/**
 * Enhances a native <select> with a sleek white rounded dropdown box.
 * @param {HTMLSelectElement} select
 * @param {{ inline?: boolean }} options
 */
export function enhanceCustomSelect(select, options = {}) {
  if (!select || select.dataset.customSelectInit === 'true') return null;
  select.dataset.customSelectInit = 'true';
  ensureGlobalListeners();

  const wrapper = document.createElement('div');
  wrapper.className = 'ttv-custom-select';
  if (options.inline || select.classList.contains('ai-mood-select')) {
    wrapper.classList.add('ttv-custom-select--inline');
  }
  if (select.classList.contains('admin-filter-select')) {
    wrapper.classList.add('admin-filter-select-wrap');
  }

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'ttv-custom-select-trigger';
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');

  const labelSpan = document.createElement('span');
  labelSpan.className = 'ttv-custom-select-label';

  const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  chevron.setAttribute('width', '14');
  chevron.setAttribute('height', '14');
  chevron.setAttribute('viewBox', '0 0 24 24');
  chevron.setAttribute('fill', 'none');
  chevron.setAttribute('stroke', 'currentColor');
  chevron.setAttribute('stroke-width', '2');
  chevron.classList.add('ttv-custom-select-chevron');
  chevron.innerHTML = '<polyline points="6 9 12 15 18 9"/>';

  trigger.appendChild(labelSpan);
  trigger.appendChild(chevron);

  const menu = document.createElement('div');
  menu.className = 'ttv-custom-select-menu';
  menu.setAttribute('role', 'listbox');
  if (document.body.classList.contains('admin-body')) {
    menu.classList.add('ttv-custom-select-menu--admin');
  }
  const isDark = Boolean(options.dark || select.closest('.dark-theme, .bg-dark, [data-theme="dark"]'));
  if (isDark) {
    wrapper.classList.add('ttv-custom-select--dark');
    menu.classList.add('ttv-custom-select-menu--dark');
  }

  function createOptionButton(opt) {
    const optBtn = document.createElement('button');
    optBtn.type = 'button';
    optBtn.className = 'ttv-custom-select-option' + (opt.value === select.value ? ' is-selected' : '');
    optBtn.setAttribute('role', 'option');
    optBtn.setAttribute('aria-selected', opt.value === select.value ? 'true' : 'false');
    optBtn.dataset.value = opt.value;
    optBtn.textContent = opt.textContent;
    if (opt.disabled) {
      optBtn.disabled = true;
      optBtn.classList.add('is-disabled');
    } else {
      optBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (select.value !== opt.value) {
          select.value = opt.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }
        syncUI();
        close();
      });
    }
    return optBtn;
  }

  function rebuildOptions() {
    menu.innerHTML = '';
    Array.from(select.children).forEach((child) => {
      if (child.tagName === 'OPTGROUP') {
        const groupLabel = document.createElement('div');
        groupLabel.className = 'ttv-custom-select-group';
        groupLabel.textContent = child.label || '';
        menu.appendChild(groupLabel);
        Array.from(child.children).forEach((opt) => {
          if (opt.tagName === 'OPTION') menu.appendChild(createOptionButton(opt));
        });
      } else if (child.tagName === 'OPTION') {
        menu.appendChild(createOptionButton(child));
      }
    });
  }

  function syncUI() {
    const selectedOpt = select.options[select.selectedIndex] || select.options[0];
    labelSpan.textContent = selectedOpt ? selectedOpt.textContent : '';
    const isPlaceholder = Boolean(selectedOpt && selectedOpt.disabled);
    labelSpan.classList.toggle('is-placeholder', isPlaceholder);
    menu.querySelectorAll('.ttv-custom-select-option').forEach((btn) => {
      const isSel = !btn.disabled && btn.dataset.value === select.value;
      btn.classList.toggle('is-selected', isSel);
      btn.setAttribute('aria-selected', isSel ? 'true' : 'false');
    });
  }

  function positionMenu() {
    const rect = trigger.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 10;
    const gap = 6;

    const menuWidth = Math.min(Math.max(rect.width, 190), vw - margin * 2);
    let left = rect.left;
    if (left + menuWidth > vw - margin) {
      left = Math.max(margin, vw - margin - menuWidth);
    }

    const spaceBelow = vh - rect.bottom - margin - gap;
    const spaceAbove = rect.top - margin - gap;

    menu.style.width = `${menuWidth}px`;
    menu.style.left = `${left}px`;
    menu.style.display = 'block';

    const naturalHeight = menu.scrollHeight;
    const openUp = spaceBelow < Math.min(naturalHeight, 220) && spaceAbove > spaceBelow;
    const maxCap = options.maxHeight || (vw <= 768 ? 380 : 440);
    const available = Math.min(maxCap, Math.max(160, openUp ? spaceAbove : spaceBelow));

    menu.style.maxHeight = `${available}px`;
    if (openUp) {
      menu.style.top = 'auto';
      menu.style.bottom = `${vh - rect.top + gap}px`;
    } else {
      menu.style.bottom = 'auto';
      menu.style.top = `${rect.bottom + gap}px`;
    }
  }

  function open() {
    closeAllMenus(wrapper);
    syncUI();
    if (menu.parentNode !== document.body) {
      document.body.appendChild(menu);
    }
    wrapper.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    positionMenu();
    const activeOpt = menu.querySelector('.ttv-custom-select-option.is-selected');
    if (activeOpt) activeOpt.scrollIntoView({ block: 'nearest' });
  }

  function close() {
    wrapper.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    menu.style.display = 'none';
  }

  function isOpen() {
    return wrapper.classList.contains('is-open');
  }

  select.parentNode.insertBefore(wrapper, select);
  wrapper.appendChild(select);
  select.classList.add('ttv-custom-select-native');
  wrapper.appendChild(trigger);

  // Intercept programmatic select.value = '...' assignments so UI stays synced
  const valueDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  if (valueDescriptor && valueDescriptor.get && valueDescriptor.set) {
    Object.defineProperty(select, 'value', {
      configurable: true,
      get() {
        return valueDescriptor.get.call(this);
      },
      set(val) {
        valueDescriptor.set.call(this, val);
        syncUI();
      }
    });
  }

  rebuildOptions();
  syncUI();

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isOpen()) close();
    else open();
  });

  select.addEventListener('change', syncUI);

  const inst = { wrapper, trigger, menu, close, isOpen, positionMenu, syncUI, rebuildOptions };
  instances.push(inst);
  return inst;
}
