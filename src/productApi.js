const env = typeof process !== 'undefined' && process.env ? process.env : {};

export const SUPABASE_URL =
  env.SUPABASE_URL || env.VITE_SUPABASE_URL || 'https://icopgheozdrauqevcbat.supabase.co';

export const SUPABASE_ANON_KEY =
  env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_859wsyvaLXUwaQlU3IuqsQ_x2yv3epp';

export function getRequestOrigin(req) {
  const headers = (req && req.headers) || {};
  const host = String(headers['x-forwarded-host'] || headers.host || 'www.thetoysvirago.shop').split(',')[0].trim();
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(host);
  const fallbackProto = isLocal ? 'http' : 'https';
  const proto = String(headers['x-forwarded-proto'] || fallbackProto).split(',')[0].trim() || fallbackProto;
  return `${proto}://${host}`;
}

function supabaseHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`
  };
}

const MEDIA_META_LIMIT = 10;

function mediaMetaSelect() {
  const parts = [];
  for (let index = 0; index < MEDIA_META_LIMIT; index++) {
    parts.push(`media${index}_label:media->${index}->>label`);
    parts.push(`media${index}_type:media->${index}->>type`);
  }
  return parts.join(',');
}

/**
 * Fetch a product without downloading its (potentially multi-megabyte)
 * `image`/`media` data URLs. Only media labels/types are returned so the
 * product page can render crawlable `/product-image/<id>?i=n` URLs.
 */
export async function fetchSupabaseProduct(id) {
  if (!id) return null;
  const select = [
    'id',
    'title',
    'category',
    'tagline',
    'price',
    'original_price',
    'badge',
    'description',
    'specs',
    'variants',
    'in_stock',
    'updated_at',
    'sizes',
    mediaMetaSelect()
  ].join(',');
  const url = `${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}&select=${select}&limit=1`;
  const response = await fetch(url, { headers: supabaseHeaders() });
  if (!response.ok) {
    throw new Error(`Supabase product fetch failed (HTTP ${response.status})`);
  }
  const rows = await response.json();
  if (!Array.isArray(rows) || !rows.length) return null;

  const product = rows[0];
  if (!product || product.badge === '__DELETED__' || product.region === 'deleted') return null;
  const mediaMeta = [];
  for (let index = 0; index < MEDIA_META_LIMIT; index++) {
    const label = product[`media${index}_label`];
    const type = product[`media${index}_type`];
    delete product[`media${index}_label`];
    delete product[`media${index}_type`];
    if (!label && !type) continue;
    mediaMeta.push({ index, label: label || '', type: type || '' });
  }
  product.mediaMeta = mediaMeta;
  return product;
}

/**
 * Fetch a single media entry (image or video) for a product. `index` maps to
 * the raw `media` array index. Index 0 falls back to the legacy `image` column.
 * Returns `{ src, type, label }` or null.
 */
export async function fetchSupabaseProductMedia(id, index = 0) {
  if (!id) return null;
  const safeIndex = Number.isInteger(index) && index >= 0
    ? Math.min(index, MEDIA_META_LIMIT - 1)
    : 0;

  const select = `src:media->${safeIndex}->>src,type:media->${safeIndex}->>type,label:media->${safeIndex}->>label`;
  const url = `${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}&select=${select}&limit=1`;
  const response = await fetch(url, { headers: supabaseHeaders() });
  if (response.ok) {
    const rows = await response.json();
    const row = Array.isArray(rows) && rows.length ? rows[0] : null;
    if (row && row.src) {
      return { src: String(row.src), type: row.type || 'image', label: row.label || '' };
    }
  }

  if (safeIndex === 0) {
    const fallbackUrl = `${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}&select=src:image&limit=1`;
    const fallbackResponse = await fetch(fallbackUrl, { headers: supabaseHeaders() });
    if (fallbackResponse.ok) {
      const rows = await fallbackResponse.json();
      const row = Array.isArray(rows) && rows.length ? rows[0] : null;
      if (row && row.src) return { src: String(row.src), type: 'image', label: '' };
    }
  }

  return null;
}

/**
 * Fetch a single image source for a product. `index` maps to the raw
 * `media` array index. Index 0 falls back to the legacy `image` column.
 */
export async function fetchSupabaseProductImage(id, index = 0) {
  const media = await fetchSupabaseProductMedia(id, index);
  if (media && media.src && (!media.type || media.type === 'image')) {
    return String(media.src);
  }
  return '';
}

export async function fetchAllSupabaseProducts() {
  // Keep this payload light: `image`/`media` can contain multi-hundred-KB
  // data URLs and selecting them for every row times out Postgres.
  const url = `${SUPABASE_URL}/rest/v1/products?select=id,title,category,updated_at&order=updated_at.desc&limit=5000`;
  const response = await fetch(url, { headers: supabaseHeaders() });
  if (!response.ok) {
    throw new Error(`Supabase product list failed (HTTP ${response.status})`);
  }
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}
