/**
 * Shared Toast Type Classifier & Icon Renderer
 * Ensures success, warning, error, and info toasts have distinct icons and accents.
 */

export function resolveToastType(message = '', explicitType = null) {
  if (explicitType && ['success', 'warning', 'error', 'info'].includes(explicitType)) {
    return explicitType;
  }
  const text = String(message || '').replace(/<[^>]*>/g, '').trim().toLowerCase();

  if (
    /\b(failed|error|could not|unable to|incorrect|wrong|invalid|denied|not generated|cannot)\b/.test(text)
  ) {
    return 'error';
  }

  if (
    /\b(warning|offline template|saved locally|removed locally|updated locally|already on the list|please |must |only |upload a product|no custom|no products|missing|unavailable|sold out|out of stock)\b/.test(text) ||
    text.includes('⚠')
  ) {
    return 'warning';
  }

  if (
    /\b(editing|uploading|refreshing|analysing|analyzing|syncing|loading|connecting)\b/.test(text) ||
    text.endsWith('...')
  ) {
    return 'info';
  }

  return 'success';
}

export function getToastIconSvg(type = 'success') {
  if (type === 'error') {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
  }
  if (type === 'warning') {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
  }
  if (type === 'info') {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
  }
  return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
}
