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
 * Send customer order confirmation email.
 * Uses Resend API if VITE_RESEND_API_KEY is configured in .env,
 * or prepares mailto link fallback.
 */
export async function sendCustomerOrderConfirmationEmail(order) {
  const resendApiKey = import.meta.env.VITE_RESEND_API_KEY || (typeof window !== 'undefined' ? localStorage.getItem('ttv_resend_api_key') : '');
  const customerEmail = order.customer_email || (order.address && order.address.match(/Email:\s*([\w.-]+@[\w.-]+)/i) ? order.address.match(/Email:\s*([\w.-]+@[\w.-]+)/i)[1] : '');
  
  const customerName = order.customer_name || 'Valued Customer';
  const orderRef = order.reference || 'TTV-Order';
  const totalStr = `₦${Number(order.total_amount || 0).toLocaleString()}`;
  
  const itemsHtml = Array.isArray(order.items)
    ? order.items.map(i => `<li><strong>${i.qty || 1}x</strong> ${i.title || 'Item'} ${i.finish ? '(' + i.finish + ')' : ''} &mdash; ₦${Number(i.price || 0).toLocaleString()}</li>`).join('')
    : '<li>Intimate Wellness Items</li>';

  if (resendApiKey && customerEmail) {
    const defaultSender = import.meta.env.VITE_RESEND_FROM_EMAIL || 'TheToysVirago Concierge <onboarding@resend.dev>';
    const emailHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111116; background: #ffffff; border: 1px solid #f0f0f4; border-radius: 12px;">
              <div style="text-align: center; margin-bottom: 24px; border-bottom: 1px solid #f0f0f4; padding-bottom: 20px;">
                <h1 style="margin: 0; font-size: 26px; color: #9f1239; font-weight: 800; letter-spacing: 0.05em;">THETOYSVIRAGO</h1>
                <p style="margin: 6px 0 0; font-size: 13px; color: #64748b; letter-spacing: 0.08em; text-transform: uppercase;">Payment Verified &bull; Order Confirmed</p>
              </div>
              <p style="font-size: 15px; line-height: 1.6;">Hello <strong>${customerName}</strong>,</p>
              <p style="font-size: 15px; line-height: 1.6;">We have verified your payment! Your order <strong>${orderRef}</strong> is now confirmed and our discreet logistics team is prepping it for priority dispatch.</p>
              
              <div style="background: #fdf2f4; border: 1px solid #fbcfe8; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px; font-size: 14px; text-transform: uppercase; color: #9f1239; letter-spacing: 0.05em;">Order Summary</h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #334155;">
                  ${itemsHtml}
                </ul>
                <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #fbcfe8; font-size: 15px; font-weight: 700; color: #0f172a; display: flex; justify-content: space-between;">
                  <span>Total Amount Paid:</span>
                  <span>${totalStr}</span>
                </div>
              </div>

              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 20px 0; font-size: 13px; color: #475569; line-height: 1.6;">
                <strong style="color: #0f172a;">100% Discreet Packaging Guarantee:</strong><br/>
                Your package will arrive in a plain, unbranded opaque courier bag with zero mention of intimate wellness, adult novelties, or brand names on the exterior.
              </div>

              <p style="font-size: 14px; color: #64748b; line-height: 1.6;">If you have any special delivery instructions, reach out directly to our concierge on WhatsApp.</p>
              <div style="text-align: center; margin-top: 28px; padding-top: 20px; border-top: 1px solid #f0f0f4; font-size: 12px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} TheToysVirago &bull; Discretion &amp; Pleasure Delivered.
              </div>
            </div>
          `;

    const trySend = async (fromSender) => {
      return await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromSender,
          to: [customerEmail],
          subject: `Order Confirmed & Payment Verified [${orderRef}]`,
          html: emailHtml
        })
      });
    };

    try {
      let response = await trySend(defaultSender);
      if (!response.ok && defaultSender !== 'TheToysVirago Concierge <onboarding@resend.dev>') {
        response = await trySend('TheToysVirago Concierge <onboarding@resend.dev>');
      }

      if (response.ok) {
        return { success: true, method: 'resend_api' };
      } else {
        const errorData = await response.json();
        console.warn('Resend API response not ok:', errorData);
      }
    } catch (e) {
      console.warn('Error sending email via Resend:', e);
    }
  }

  // Fallback: Return mailto and notification details
  const subject = encodeURIComponent(`Order Confirmed & Payment Verified [${orderRef}] - TheToysVirago`);
  const body = encodeURIComponent(
`Hello ${customerName},

Great news! We have verified your payment for order ${orderRef} (Total: ${totalStr}).

Your order is now confirmed and our discreet logistics team is preparing it for dispatch.

Delivery Address:
${order.address || 'As specified at checkout'}

Discreet Packaging Guarantee:
Your package is dispatched in a 100% plain, opaque courier bag with zero exterior clues or brand names.

Thank you for choosing TheToysVirago!
Dispatch Concierge`
  );

  return {
    success: true,
    method: 'client_fallback',
    customerEmail,
    mailtoUrl: customerEmail ? `mailto:${customerEmail}?subject=${subject}&body=${body}` : null
  };
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


