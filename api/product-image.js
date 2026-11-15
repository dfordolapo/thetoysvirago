import { fetchSupabaseProductImage, getRequestOrigin } from '../src/productApi.js';

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
  const fallback = `${origin}/assets/og-cover.jpg`;
  const id = String(firstQueryValue(req.query && req.query.id)).trim();
  const rawIndex = parseInt(firstQueryValue(req.query && req.query.i), 10);
  const index = Number.isFinite(rawIndex) && rawIndex > 0 ? rawIndex : 0;

  if (!id) {
    return res.redirect(302, fallback);
  }

  let src = '';
  try {
    src = await fetchSupabaseProductImage(id, index);
  } catch (error) {
    console.error('Product image lookup failed:', error);
  }

  if (!src) {
    return res.redirect(302, fallback);
  }

  if (src.startsWith('data:image/')) {
    const match = src.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/s);
    if (match) {
      const buffer = Buffer.from(match[2], 'base64');
      res.setHeader('Content-Type', match[1]);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
      return res.status(200).send(buffer);
    }
  }

  if (/^https?:\/\//i.test(src)) {
    return res.redirect(302, src);
  }

  if (src.startsWith('/')) {
    return res.redirect(302, `${origin}${src}`);
  }

  return res.redirect(302, fallback);
}
