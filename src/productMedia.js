/**
 * Normalises the different product shapes used by the static build
 * (scripts/products-db.json) and Supabase rows so the product page template
 * and image endpoint agree on the gallery order.
 */
export function buildImageList(product = {}) {
  const list = [];
  const push = (src) => {
    if (typeof src !== 'string') return;
    const value = src.trim();
    if (!value) return;
    if (!list.includes(value)) list.push(value);
  };

  push(product.image);
  push(product.img);

  const media = Array.isArray(product.media) ? product.media : [];
  media.forEach((item) => {
    if (!item) return;
    if (item.type && item.type !== 'image') return;
    push(item.src || item.url);
  });

  const variants = Array.isArray(product.variants) ? product.variants : [];
  variants.forEach((variant) => {
    if (variant) push(variant.img || variant.image);
  });

  return list;
}

export function pickProductImage(product = {}, index = 0) {
  const list = buildImageList(product);
  if (!list.length) return '';
  const safeIndex = Number.isInteger(index) && index >= 0 ? index : 0;
  return list[safeIndex] || list[0];
}
