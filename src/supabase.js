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
 */
export async function getSupabaseProducts() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

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
 * Save customer order to Supabase `orders` table.
 */
export async function recordSupabaseOrder(order) {
  if (!supabase) return { success: false, reason: 'unconfigured' };
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
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
  const resendApiKey = import.meta.env.VITE_RESEND_API_KEY || (typeof window !== 'undefined' ? localStorage.getItem('ttv_resend_api_key') : '');

  try {
    const apiRes = await fetch('/api/send-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order,
        action,
        apiKey: resendApiKey
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
      specs: Array.isArray(product.specs) ? product.specs.map(s => typeof s === 'string' ? s : `${s.label}: ${s.value}`) : [],
      variants: Array.isArray(product.variants) ? product.variants.map(v => ({
        name: v.name,
        price: Number(v.price) || Number(product.price) || 0,
        priceStr: v.priceStr || `₦${Number(v.price || product.price).toLocaleString()}`,
        color: v.color || '',
        img: (v.img && !v.img.startsWith('data:')) ? v.img : (v.img === (product.img || product.image) ? '' : (v.img || ''))
      })) : [],
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      media: Array.isArray(product.media) ? product.media : [{ type: 'image', src: product.img || product.image || '', label: product.title }],
      in_stock: product.inStock !== false,
      updated_at: new Date().toISOString()
    };

    let { data, error } = await client
      .from('products')
      .upsert([payload], { onConflict: 'id' })
      .select();

    // If remote table lacks media or sizes columns, gracefully strip and retry
    if (error && (error.message.includes('column "media"') || error.message.includes('column "sizes"'))) {
      console.warn('[Supabase] Missing optional columns (media/sizes). Retrying with core schema...');
      delete payload.media;
      delete payload.sizes;
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
 * Delete a product from Supabase.
 */
export async function deleteSupabaseProduct(id) {
  const client = getSupabaseAdminClient();
  if (!client) return { success: false, reason: 'unconfigured' };
  try {
    const { error } = await client
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.warn('[Supabase] Error deleting product:', error.message);
      return { success: false, error: error.message };
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
