import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function getSupabaseAdminClient() {
  const serviceKey = typeof window !== 'undefined' ? (localStorage.getItem('thetoysvirago_supabase_service_key') || '') : '';
  if (supabaseUrl && serviceKey) {
    return createClient(supabaseUrl, serviceKey);
  }
  return supabase;
}

if (!isSupabaseConfigured) {
  console.info(
    '%c[Supabase]%c Not connected yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file to enable live backend sync.',
    'color: #d4af37; font-weight: bold;',
    'color: inherit;'
  );
} else {
  console.info(
    '%c[Supabase]%c Connected successfully to ' + supabaseUrl,
    'color: #22c55e; font-weight: bold;',
    'color: inherit;'
  );
}

/**
 * Fetch products from Supabase if configured, otherwise returns null.
 * @param {string} columns - Columns to select (default: '*' or lightweight summary)
 */
export async function getSupabaseProducts(columns = '*') {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select(columns)
      .order('updated_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.warn('[Supabase] Failed to fetch products:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('[Supabase] Unexpected error fetching products:', err);
    return null;
  }
}

/**
 * Fetch full details for a single product by ID (used on-demand when editing).
 */
export async function getSupabaseProductById(id) {
  if (!supabase || !id) return null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] Failed to fetch product:', error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error('[Supabase] Unexpected error fetching product:', err);
    return null;
  }
}

/**
 * Fetch just the gallery metadata (labels/types) for one product, without
 * downloading the heavy `media` data URLs. Used to build optimised
 * /product-image/<id>?i=n URLs for the quick-view gallery.
 */
export async function getSupabaseProductGallery(id, limit = 10) {
  if (!supabase || !id) return null;
  try {
    const parts = ['id', 'title', 'updated_at'];
    for (let i = 0; i < limit; i++) {
      parts.push(`media${i}_label:media->${i}->>label`);
      parts.push(`media${i}_type:media->${i}->>type`);
    }
    const { data, error } = await supabase
      .from('products')
      .select(parts.join(','))
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] Failed to fetch product gallery:', error.message);
      return null;
    }
    if (!data) return null;

    const mediaMeta = [];
    for (let i = 0; i < limit; i++) {
      const label = data[`media${i}_label`];
      const type = data[`media${i}_type`];
      if (!label && !type) continue;
      mediaMeta.push({ index: i, label: label || '', type: type || '' });
    }
    return { id: data.id, title: data.title, updatedAt: data.updated_at, mediaMeta };
  } catch (err) {
    console.error('[Supabase] Unexpected product gallery error:', err);
    return null;
  }
}

/**
 * Save customer order to Supabase `orders` table.
 */
export async function recordSupabaseOrder(order) {
  if (!supabase) return { success: false, reason: 'unconfigured' };
  try {
    // Only include columns that exist in the Supabase 'orders' table
    const safePayload = {
      reference: order.reference,
      customer_name: order.customer_name || 'Customer',
      customer_email: order.customer_email || order.email || '',
      phone: order.phone || '',
      address: order.address || '',
      city: order.city || '',
      items: Array.isArray(order.items) ? order.items : [],
      total_amount: Number(order.total_amount || 0),
      status: order.status || 'awaiting_confirmation'
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([safePayload])
      .select();

    if (error) {
      console.warn('[Supabase] Error saving order:', error.message);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('[Supabase] Unexpected order recording error:', err);
    return { success: false, error: err };
  }
}

/**
 * Fetch all customer orders from Supabase (for Admin vault).
 */
export async function getSupabaseOrders() {
  const client = getSupabaseAdminClient() || supabase;
  if (!client) {
    // Fallback to local storage if supabase not yet initialized
    try {
      const local = JSON.parse(localStorage.getItem('ttv_local_orders') || '[]');
      return { success: true, data: local };
    } catch (e) {
      return { success: false, data: [] };
    }
  }
  try {
    const { data, error } = await client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Error fetching orders:', error.message);
      const local = JSON.parse(localStorage.getItem('ttv_local_orders') || '[]');
      return { success: false, error, data: local };
    }
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('[Supabase] Unexpected error fetching orders:', err);
    return { success: false, error: err, data: [] };
  }
}

/**
 * Update order status (e.g. from 'awaiting_confirmation' to 'confirmed').
 */
export async function updateSupabaseOrderStatus(orderRef, newStatus = 'confirmed') {
  const client = getSupabaseAdminClient() || supabase;
  const now = new Date().toISOString();

  // Update in localStorage cache as well
  try {
    const local = JSON.parse(localStorage.getItem('ttv_local_orders') || '[]');
    const idx = local.findIndex(o => o.reference === orderRef);
    if (idx >= 0) {
      local[idx].status = newStatus;
      local[idx].confirmed_at = now;
      localStorage.setItem('ttv_local_orders', JSON.stringify(local));
    }
  } catch (e) {}

  if (!client) return { success: true, note: 'updated_locally' };

  try {
    const { data, error } = await client
      .from('orders')
      .update({
        status: newStatus,
        confirmed_at: now
      })
      .eq('reference', orderRef)
      .select();

    if (error) {
      console.warn('[Supabase] Error updating order status:', error.message);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('[Supabase] Unexpected order status update error:', err);
    return { success: false, error: err };
  }
}

/**
 * Send customer order emails: confirmed, dispatched, or delivered (with reviews prompt).
 * Dispatches automatically via Vercel Serverless /api/send-confirmation.
 */
export async function sendCustomerOrderStatusEmail(order, action = 'order_confirmed') {
  try {
    const apiRes = await fetch('/api/send-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order,
        action
      })
    });

    const resData = await apiRes.json();
    if (apiRes.ok && resData.success) {
      console.log(`[Email Dispatch] ${action} sent successfully:`, resData);
      return { success: true, method: 'resend_api', data: resData };
    } else {
      console.warn(`[Email Dispatch] ${action} route error:`, resData);
      return { success: false, method: 'resend_failed', error: resData?.error };
    }
  } catch (err) {
    console.warn(`[Email Dispatch] Network error connecting to /api/send-confirmation for ${action}:`, err);
    return { success: false, method: 'connection_error', error: err.message };
  }
}

export async function sendCustomerOrderConfirmationEmail(order) {
  return sendCustomerOrderStatusEmail(order, 'order_confirmed');
}

export async function sendCustomerOrderDispatchedEmail(order) {
  return sendCustomerOrderStatusEmail(order, 'order_dispatched');
}

export async function sendCustomerOrderDeliveredEmail(order) {
  return sendCustomerOrderStatusEmail(order, 'order_delivered');
}

/**
 * Save newsletter / VIP club subscription.
 */
export async function recordNewsletterSubscriber(email, source = 'website') {
  if (!supabase) return { success: false, reason: 'unconfigured' };
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .upsert([{ email, source, subscribed_at: new Date().toISOString() }], { onConflict: 'email' })
      .select();

    if (error) {
      console.warn('[Supabase] Error saving subscriber:', error.message);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error('[Supabase] Unexpected subscriber error:', err);
    return { success: false, error: err };
  }
}

/**
 * Upsert (insert or update) a product in Supabase.
 */
export async function upsertSupabaseProduct(product) {
  const client = getSupabaseAdminClient();
  if (!client) return { success: false, reason: 'unconfigured' };
  try {
    const payload = {
      id: product.id,
      title: product.title,
      category: product.category || 'toys',
      tagline: product.tagline || product.pun || '',
      price: Number(product.price) || 0,
      original_price: product.originalPrice ? Number(product.originalPrice) : null,
      badge: product.badge || '',
      image: product.img || product.image || '',
      description: product.desc || product.description || '',
      specs: Array.isArray(product.specs) ? product.specs.map(s => {
        if (typeof s === 'string') return s.trim();
        const label = String(s?.label || '').trim().replace(/:+$/, '').trim();
        let value = String(s?.value || '').trim();
        if (label) {
          const lowLbl = label.toLowerCase();
          while (true) {
            const cIdx = value.indexOf(':');
            if (cIdx === -1 || value.slice(0, cIdx).trim().toLowerCase() !== lowLbl) break;
            value = value.slice(cIdx + 1).trim();
          }
        }
        return label ? `${label}: ${value}` : value;
      }).filter(Boolean) : [],
      variants: Array.isArray(product.variants) ? product.variants.map(v => {
        const hasCustom = Boolean(v.hasCustomPrice && typeof v.price === 'number' && !isNaN(v.price) && v.price > 0);
        return {
          name: v.name,
          price: hasCustom ? Number(v.price) : (Number(product.price) || 0),
          priceStr: hasCustom ? (v.priceStr || `₦${Number(v.price).toLocaleString()}`) : '',
          hasCustomPrice: hasCustom,
          color: v.color || '',
          imgIndex: Number.isInteger(v.imgIndex) ? v.imgIndex : null,
          img: (v.img && !String(v.img).startsWith('data:')) ? v.img : ''
        };
      }) : [],
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      media: Array.isArray(product.media) ? product.media : [{ type: 'image', src: product.img || product.image || '', label: product.title }],
      region: product.region || (product.isAbuja ? 'abuja' : 'all'),
      is_abuja: Boolean(product.isAbuja || product.region === 'abuja'),
      in_stock: product.inStock !== false,
      updated_at: new Date().toISOString()
    };

    let { data, error } = await client
      .from('products')
      .upsert([payload], { onConflict: 'id' })
      .select();

    const optionalColumns = ['media', 'sizes', 'region', 'is_abuja'];
    const missingColumnPattern = /Could not find the '([^']+)' column|column "([^"]+)" does not exist/;

    for (const _ of optionalColumns) {
      if (!error) break;
      const match = String(error.message || '').match(missingColumnPattern);
      const missing = match?.[1] || match?.[2];
      if (!missing || !optionalColumns.includes(missing) || !(missing in payload)) break;
      console.warn(`[Supabase] Missing optional column "${missing}". Retrying without it...`);
      delete payload[missing];
      const retry = await client
        .from('products')
        .upsert([payload], { onConflict: 'id' })
        .select();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.warn('[Supabase] Error upserting product:', error.message);
      const isRls = error.message.includes('row-level security') || error.code === '42501';
      return { success: false, error: error.message, isRlsError: isRls, code: error.code };
    }
    return { success: true, data };
  } catch (err) {
    console.error('[Supabase] Unexpected product upsert error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Update only the in_stock status for a product in Supabase.
 */
export async function updateSupabaseProductStock(id, inStock) {
  const client = getSupabaseAdminClient();
  if (!client || !id) return { success: false, reason: 'unconfigured' };
  try {
    const { error } = await client
      .from('products')
      .update({ in_stock: Boolean(inStock), updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      console.warn('[Supabase] updateSupabaseProductStock failed:', error.message);
      return { success: false, reason: error.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, reason: err.message };
  }
}

/**
 * Subscribe a customer email to a back-in-stock alert for an unavailable product.
 */
export async function submitRestockRequest(productId, productTitle, email) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!productId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { success: false, reason: 'Please enter a valid email address.' };
  }
  if (!supabase) {
    try {
      const key = 'ttv_restock_requests';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const already = existing.some(r => r && r.product_id === productId && String(r.email || '').trim().toLowerCase() === cleanEmail && !r.notified);
      if (already) {
        return { success: false, duplicate: true, reason: "You're already on the list for this piece. We'll email you as soon as it's back." };
      }
      existing.push({ product_id: productId, product_title: productTitle || '', email: cleanEmail, notified: false, created_at: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(existing));
      return { success: true, localOnly: true };
    } catch (e) {
      return { success: false, reason: 'Could not save notification request.' };
    }
  }
  try {
    const { data: dupRows } = await supabase
      .from('restock_requests')
      .select('id')
      .eq('product_id', productId)
      .ilike('email', cleanEmail)
      .eq('notified', false)
      .limit(1);
    if (Array.isArray(dupRows) && dupRows.length > 0) {
      return { success: false, duplicate: true, reason: "You're already on the list for this piece. We'll email you as soon as it's back." };
    }

    const { error } = await supabase
      .from('restock_requests')
      .insert([{ product_id: productId, product_title: productTitle || '', email: cleanEmail, notified: false }]);
    if (error) {
      console.warn('[Supabase] submitRestockRequest failed:', error.message);
      return { success: false, reason: error.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, reason: err.message };
  }
}

export async function getRestockRequests() {
  const client = getSupabaseAdminClient();
  if (!client) return [];
  try {
    const { data, error } = await client
      .from('restock_requests')
      .select('id, product_id, product_title, email, notified, created_at')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('[Supabase] getRestockRequests failed:', error.message);
      return [];
    }
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

export async function sendRestockAlertToSubscriber(row) {
  if (!row || !row.product_id || !row.email) {
    return { success: false, error: 'Missing subscriber email or product.' };
  }
  try {
    const localResendKey = typeof window !== 'undefined' ? (localStorage.getItem('ttv_resend_api_key') || '') : '';
    const res = await fetch('/api/send-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'restock_alert',
        productId: row.product_id,
        productTitle: row.product_title || row.product_id,
        emails: [row.email],
        resendApiKey: localResendKey || undefined
      })
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok || !payload.sent) {
      return { success: false, error: payload.detail || payload.error || `Failed (HTTP ${res.status})` };
    }
    const client = getSupabaseAdminClient();
    if (client && row.id) {
      await client.from('restock_requests').update({ notified: true }).eq('id', row.id);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err && err.message ? err.message : 'Network error' };
  }
}

export async function deleteRestockRequest(id) {
  const client = getSupabaseAdminClient();
  if (!client || !id) return { success: false };
  try {
    const { error } = await client
      .from('restock_requests')
      .delete()
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Notify pending restock subscribers via Resend and mark them notified in Supabase.
 */
export async function notifyPendingRestockSubscribers(productId, productTitle) {
  const client = getSupabaseAdminClient();
  if (!client || !productId) return { success: false, notifiedCount: 0 };
  try {
    const { data, error } = await client
      .from('restock_requests')
      .select('id, email')
      .eq('product_id', productId)
      .eq('notified', false);
    if (error || !Array.isArray(data) || data.length === 0) {
      return { success: true, notifiedCount: 0 };
    }
    const uniqueEmails = [...new Set(data.map(r => String(r.email || '').trim().toLowerCase()).filter(Boolean))];
    if (uniqueEmails.length === 0) return { success: true, notifiedCount: 0 };

    const res = await fetch('/api/send-confirmation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'restock_alert',
        productId,
        productTitle: productTitle || productId,
        emails: uniqueEmails
      })
    });
    if (!res.ok) return { success: false, notifiedCount: 0 };

    const ids = data.map(r => r.id).filter(Boolean);
    if (ids.length > 0) {
      await client.from('restock_requests').update({ notified: true }).in('id', ids);
    }
    return { success: true, notifiedCount: uniqueEmails.length };
  } catch (err) {
    return { success: false, notifiedCount: 0 };
  }
}

/**
 * Delete a product from Supabase.
 */
export async function deleteSupabaseProduct(id) {
  const client = getSupabaseAdminClient();
  if (!client) return { success: false, reason: 'unconfigured' };
  try {
    const { data, error } = await client
      .from('products')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) {
      console.warn('[Supabase] Error deleting product:', error.message);
      return { success: false, error: error.message };
    }
    if (!data || data.length === 0) {
      return { success: false, reason: 'rls_no_rows' };
    }
    return { success: true };
  } catch (err) {
    console.error('[Supabase] Unexpected product delete error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Save anonymous confession to Supabase `confessions` table.
 */
export async function recordSupabaseConfession(confession) {
  if (!supabase) return { success: false, reason: 'unconfigured' };
  try {
    const { data, error } = await supabase
      .from('confessions')
      .insert([confession])
      .select();

    if (error) {
      console.warn('[Supabase] Error saving confession:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err) {
    console.error('[Supabase] Unexpected confession recording error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Fetch approved community confessions from Supabase.
 */
export async function getSupabaseConfessions() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('confessions')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist yet, gracefully return null
      return null;
    }
    return data;
  } catch (err) {
    console.error('[Supabase] Unexpected confessions fetch error:', err);
    return null;
  }
}

/**
 * Subscribe to realtime orders from Supabase.
 */
export function subscribeToSupabaseOrders(onNewOrder) {
  if (!supabase) return null;
  try {
    const channel = supabase
      .channel('ttv_admin_live_orders_feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload && payload.new) {
            onNewOrder(payload.new);
          }
        }
      )
      .subscribe((status) => {
        console.log('[Supabase Realtime] Live orders feed status:', status);
      });
    return channel;
  } catch (err) {
    console.warn('[Supabase Realtime] Orders feed subscription error:', err);
    return null;
  }
}

/**
 * Fetch articles from Supabase `articles` table if configured, otherwise returns null.
 */
export async function getSupabaseArticles() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Table may not exist yet in Supabase or be empty
      return null;
    }
    return data;
  } catch (err) {
    console.error('[Supabase] Unexpected error fetching articles:', err);
    return null;
  }
}

/**
 * Upsert (insert or update) an article in Supabase.
 */
export async function upsertSupabaseArticle(article) {
  const client = getSupabaseAdminClient();
  if (!client) return { success: false, reason: 'unconfigured' };
  try {
    const payload = {
      slug: article.slug,
      title: article.title,
      category: article.category || 'Guides',
      read_time: article.readTime || article.read_time || '5 min read',
      date: article.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      author: article.author || 'Real stories',
      hero_img: article.heroImg || article.hero_img || '/assets/hero-collection.webp',
      img_alt: article.imgAlt || article.img_alt || article.title,
      excerpt: article.excerpt || '',
      content: article.content || '',
      seo_title: article.seoTitle || article.seo_title || article.title,
      meta_desc: article.metaDesc || article.meta_desc || article.excerpt,
      search_phrase: article.searchPhrase || article.search_phrase || '',
      related_products: article.relatedProducts || article.related_products || [],
      published: article.published !== false,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await client
      .from('articles')
      .upsert([payload], { onConflict: 'slug' })
      .select();

    if (error) {
      console.warn('[Supabase] Error upserting article:', error.message);
      const isRls = error.message.includes('row-level security') || error.code === '42501';
      return { success: false, error: error.message, isRlsError: isRls, code: error.code };
    }
    return { success: true, data: data?.[0] };
  } catch (err) {
    console.error('[Supabase] Unexpected article upsert error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete an article from Supabase.
 */
export async function deleteSupabaseArticle(slug) {
  const client = getSupabaseAdminClient();
  if (!client) return { success: false, reason: 'unconfigured' };
  try {
    const { error } = await client
      .from('articles')
      .delete()
      .eq('slug', slug);

    if (error) {
      console.warn('[Supabase] Error deleting article:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error('[Supabase] Unexpected article delete error:', err);
    return { success: false, error: err.message };
  }
}
