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
      variants: Array.isArray(product.variants) ? product.variants : [],
      in_stock: product.inStock !== false,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await client
      .from('products')
      .upsert([payload], { onConflict: 'id' })
      .select();

    if (error) {
      console.warn('[Supabase] Error upserting product:', error.message);
      return { success: false, error: error.message };
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

