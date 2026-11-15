import sharp from 'sharp';
import { fetchSupabaseProductMedia, getRequestOrigin } from '../src/productApi.js';

function firstQueryValue(value) {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

function clampInt(value, min, max, fallback) {
  const parsed = parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

// Products can be re-uploaded, so keep the CDN TTL modest while still letting
// browsers cache the optimised bytes for a day. Callers append a version query
// (from updated_at) to bust the cache instantly after an edit.
const MEDIA_CACHE = 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400';
const MAX_FULL_WIDTH = 1400;

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
  const width = clampInt(firstQueryValue(req.query && req.query.w), 40, 2000, 0);
  const quality = clampInt(firstQueryValue(req.query && req.query.q), 35, 92, 74);

  if (!id) {
    return res.redirect(302, fallback);
  }

  let media = null;
  try {
    media = await fetchSupabaseProductMedia(id, index);
  } catch (error) {
    console.error('Product media lookup failed:', error);
  }

  if (!media || !media.src) {
    return res.redirect(302, fallback);
  }

  const src = media.src;

  // Absolute URLs and local asset paths are served as-is.
  if (/^https?:\/\//i.test(src)) {
    return res.redirect(302, src);
  }
  if (src.startsWith('/')) {
    return res.redirect(302, `${origin}${src}`);
  }

  // Videos are streamed untouched (sharp only handles images).
  const videoMatch = src.match(/^data:(video\/[a-zA-Z0-9.+-]+);base64,(.*)$/s);
  if (videoMatch) {
    const buffer = Buffer.from(videoMatch[2], 'base64');
    res.setHeader('Content-Type', videoMatch[1]);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', MEDIA_CACHE);
    return res.status(200).send(buffer);
  }

  const imageMatch = src.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.*)$/s);
  if (!imageMatch) {
    return res.redirect(302, fallback);
  }

  const inputBuffer = Buffer.from(imageMatch[2], 'base64');

  try {
    const targetWidth = width > 0 ? width : MAX_FULL_WIDTH;
    const optimized = await sharp(inputBuffer, { failOn: 'none' })
      .rotate()
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality, effort: 4 })
      .toBuffer();

    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Content-Length', optimized.length);
    res.setHeader('Cache-Control', MEDIA_CACHE);
    return res.status(200).send(optimized);
  } catch (error) {
    console.warn('Image optimisation failed, serving original bytes:', error && error.message);
    res.setHeader('Content-Type', imageMatch[1]);
    res.setHeader('Content-Length', inputBuffer.length);
    res.setHeader('Cache-Control', MEDIA_CACHE);
    return res.status(200).send(inputBuffer);
  }
}
