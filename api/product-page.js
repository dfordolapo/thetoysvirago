import { renderProductPage, renderProductNotFoundPage } from '../src/productPageTemplate.js';
import { fetchSupabaseProduct, getRequestOrigin } from '../src/productApi.js';

function firstQueryValue(value) {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method Not Allowed');
  }

  const origin = getRequestOrigin(req);
  const id = String(firstQueryValue(req.query && req.query.id)).trim();

  if (!id) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(404).send(renderProductNotFoundPage(origin));
  }

  let product = null;
  try {
    product = await fetchSupabaseProduct(id);
  } catch (error) {
    console.error('Product page lookup failed:', error);
  }

  if (!product) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(404).send(renderProductNotFoundPage(origin));
  }

  // Index 0 is always the primary image (falls back to the legacy `image`
  // column); other indexes are image entries from the raw `media` array.
  const imageIndexes = [0];
  const mediaMeta = Array.isArray(product.mediaMeta) ? product.mediaMeta : [];
  mediaMeta.forEach((item) => {
    if (item.index > 0 && item.type === 'image') imageIndexes.push(item.index);
  });
  const imageUrls = imageIndexes.map((index) => {
    const suffix = index > 0 ? `?i=${index}` : '';
    return `${origin}/product-image/${encodeURIComponent(id)}${suffix}`;
  });

  const html = renderProductPage(product, {
    siteUrl: origin,
    pageUrl: `${origin}/products/${encodeURIComponent(id)}`,
    imageUrls
  });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=86400');
  res.setHeader('X-Robots-Tag', 'index, follow');
  return res.status(200).send(html);
}
