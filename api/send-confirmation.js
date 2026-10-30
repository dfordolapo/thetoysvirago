// Vercel Serverless Function: Automated Email Dispatch via Resend
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { order, action, apiKey } = body;

    if (!order) {
      return res.status(400).json({ error: 'Order details missing from request' });
    }

    let resendApiKey = apiKey || process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const envPath = path.join(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          const m = envContent.match(/(?:VITE_RESEND_API_KEY|RESEND_API_KEY)=["']?([^"'\r\n]+)["']?/);
          if (m) resendApiKey = m[1].trim();
        }
      } catch (e) {}
    }
    const storeOwnerEmails = ['thetoysvirago@gmail.com'];

    let customerEmail = order.customer_email || order.email || '';
    if (!customerEmail && order.address) {
      const match = order.address.match(/Email:\s*([\w.-]+@[\w.-]+)/i);
      if (match) customerEmail = match[1];
    }

    const customerName = order.customer_name || 'Valued Client';
    const orderRef = order.reference || 'TTV-' + Date.now().toString(36).toUpperCase();
    const totalAmount = Number(order.total_amount || 0).toLocaleString();
    const items = Array.isArray(order.items) ? order.items : [];
    const whatsappNum = process.env.VITE_STORE_WHATSAPP || '2348036514814';
    const fromEmail = process.env.VITE_RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'TheToysVirago <admin@thetoysvirago.shop>';

    const itemsRowsHtml = items.length > 0
      ? items.map(item => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 10px; font-size: 14px; color: #0f172a;">
            <strong>${item.title || 'Item'}</strong>
            ${item.finish ? `<br/><span style="font-size: 11.5px; color: #64748b; background: #f8fafc; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 3px;">Finish: ${item.finish}</span>` : ''}
          </td>
          <td style="padding: 12px 10px; font-size: 14px; text-align: center; color: #475569; font-weight: 600;">
            ${item.qty || 1}
          </td>
          <td style="padding: 12px 10px; font-size: 14px; text-align: right; color: #9f1239; font-weight: 700;">
            ₦${Number(item.price || 0).toLocaleString()}
          </td>
        </tr>
      `).join('')
      : `<tr><td colspan="3" style="padding: 12px 10px; color: #475569;">Intimate Wellness Items</td></tr>`;

    const siteUrl = process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://thetoysvirago.shop';
    const currencySymbol = order.currency === 'USD' ? '$' : order.currency === 'GBP' ? '£' : '₦';
    const formatMoney = (val) => `${currencySymbol}${Number(val || 0).toLocaleString()}`;

    const calculatedSubtotal = items.reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.qty || 1)), 0);
    const finalTotal = Number(order.total_amount || calculatedSubtotal || 0);
    const subtotalAmount = Number(order.subtotal || calculatedSubtotal || finalTotal);
    const deliveryFee = order.delivery_fee != null 
      ? Number(order.delivery_fee) 
      : (finalTotal > subtotalAmount ? finalTotal - subtotalAmount : 0);
    const discountAmount = order.discount ? Number(order.discount) : 0;
    const orderDetailsUrl = `${siteUrl}/?order=${encodeURIComponent(orderRef)}`;

    // Helper function to send email via Resend (supports HTML + text alternative + attachments)
    const sendResendEmail = async (toAddresses, subject, htmlContent, textContent, attachments) => {
      const payload = {
        from: fromEmail,
        to: Array.isArray(toAddresses) ? toAddresses : [toAddresses],
        subject,
        html: htmlContent
      };
      if (textContent) {
        payload.text = textContent;
      }
      if (attachments && attachments.length > 0) {
        payload.attachments = attachments;
      }
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      return { ok: response.ok, data };
    };

    // ================= ACTION 1: ORDER PLACED (NEW CHECKOUT) =================
    // Dispatches instant alert ONLY to the Store Owner (thetoysvirago@gmail.com).
    // The customer receives NO email yet; their first and only email will be the
    // verified Order Confirmed receipt after the owner verifies payment in Admin.
    if (action === 'order_placed') {
      const ownerAlertHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9; color: #0f172a;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
    <div style="background: #9f1239; padding: 24px; text-align: center; color: #ffffff;">
      <h2 style="margin: 0; font-size: 22px; letter-spacing: 0.05em; text-transform: uppercase;">🚨 New Order Received!</h2>
      <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Total Value: <strong>₦${totalAmount}</strong> &bull; Ref: <strong>${orderRef}</strong></p>
    </div>
    <div style="padding: 26px;">
      <div style="background: #f8fafc; border-left: 4px solid #9f1239; padding: 14px 18px; margin-bottom: 20px; border-radius: 6px;">
        <p style="margin: 0 0 6px; font-size: 14px;"><strong>Customer:</strong> ${customerName}</p>
        <p style="margin: 0 0 6px; font-size: 14px;"><strong>Phone:</strong> <a href="tel:${order.phone}" style="color: #9f1239; font-weight: 600;">${order.phone}</a></p>
        <p style="margin: 0 0 6px; font-size: 14px;"><strong>Email:</strong> ${customerEmail || 'Not specified'}</p>
        <p style="margin: 0; font-size: 14px;"><strong>Delivery Address:</strong> ${order.address || 'Standard Delivery'}</p>
      </div>

      <h3 style="margin: 0 0 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569;">Items Ordered</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="border-bottom: 2px solid #e2e8f0; text-align: left; font-size: 12px; color: #64748b;">
            <th style="padding: 8px;">Product</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>${itemsRowsHtml}</tbody>
      </table>

      <div style="text-align: center; margin-top: 15px;">
        <a href="https://thetoysvirago.shop/admin" target="_blank" rel="noopener" style="display: inline-block; background: #0c0c0e; color: #ffffff; padding: 14px 28px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 14px;">
          Open Admin to Confirm Order &rarr;
        </a>
      </div>
    </div>
  </div>
 </body>
</html>`;

      // 1. Send alert ONLY to store owner (thetoysvirago@gmail.com)
      await sendResendEmail(
        storeOwnerEmails,
        `🚨 New Order Placed: [${orderRef}] ₦${totalAmount} from ${customerName}`,
        ownerAlertHtml
      );

      return res.status(200).json({ success: true, message: 'Store owner alert dispatched to thetoysvirago@gmail.com' });
    }

    // For all customer actions, verify customer email exists:
    if (!customerEmail) {
      return res.status(400).json({ error: 'Customer email address is missing' });
    }

    // ================= ACTION 2: ORDER DISPATCHED (COURIER IN TRANSIT) =================
    if (action === 'order_dispatched') {
      const customerDispatchedHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your order is on the way</title>
</head>
<body style="margin: 0; padding: 12px 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 10px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 440px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Content (Starts directly as requested) -->
          <tr>
            <td style="padding: 22px 18px 22px;">
              <p style="margin: 0 0 10px; font-size: 13px; line-height: 1.5; color: #0f172a;">
                Hello <strong>${customerName}</strong>,
              </p>
              <p style="margin: 0 0 18px; font-size: 12px; line-height: 1.55; color: #334155;">
                Exciting news! Your order <strong>${orderRef}</strong> has been handed over to our discreet dispatch courier. It is currently in transit to you.
              </p>

              <!-- Reference Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; margin-bottom: 16px;">
                <tr>
                  <td style="padding: 12px 14px;">
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #0369a1; font-weight: 700; margin-bottom: 2px;">
                      Order Reference
                    </div>
                    <div style="font-size: 15px; font-weight: 800; color: #0c4a6e; letter-spacing: 0.03em;">
                      ${orderRef}
                    </div>
                  </td>
                  <td align="right" style="padding: 12px 14px;">
                    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #0369a1; font-weight: 700; margin-bottom: 2px;">
                      Order Total
                    </div>
                    <div style="font-size: 15px; font-weight: 800; color: #0f172a;">
                      ₦${totalAmount}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Discreet Packaging Guarantee -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; margin-bottom: 16px;">
                <tr>
                  <td style="padding: 12px 14px;">
                    <strong style="color: #0f172a; font-size: 11.5px;">🔒 100% Discreet Packaging Guarantee</strong>
                    <p style="margin: 4px 0 0; font-size: 10.5px; color: #475569; line-height: 1.45;">
                      Your package is inside a completely plain, unbranded opaque courier flyer with zero mention of adult novelties, intimate wellness, or brand names on the exterior. Total confidentiality is our sacred vow.
                    </p>
                  </td>
                </tr>
              </table>

              ${order.address ? `
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; margin-bottom: 16px;">
                <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; font-weight: 700; margin-bottom: 3px;">Delivery Destination</div>
                <div style="font-size: 11.5px; color: #1e293b; line-height: 1.45;">${order.address}</div>
                ${order.phone ? `<div style="font-size: 11px; color: #64748b; margin-top: 3px;">Contact Phone: <strong>${order.phone}</strong></div>` : ''}
              </div>` : ''}

              <!-- Items Table -->
              <h3 style="margin: 0 0 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; font-weight: 700;">
                Items in This Shipment
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 18px;">
                <thead>
                  <tr style="border-bottom: 1px solid #e2e8f0; text-align: left;">
                    <th style="padding: 6px 8px; font-size: 10.5px; text-transform: uppercase; color: #64748b; font-weight: 700;">Product</th>
                    <th style="padding: 6px 8px; font-size: 10.5px; text-transform: uppercase; color: #64748b; font-weight: 700; text-align: center;">Qty</th>
                    <th style="padding: 6px 8px; font-size: 10.5px; text-transform: uppercase; color: #64748b; font-weight: 700; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRowsHtml}
                </tbody>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 6px 0 10px;">
                    <a href="https://wa.me/${whatsappNum}?text=Hello%20TheToysVirago%2C%20following%20up%20on%20my%20dispatched%20order%20${orderRef}" target="_blank" rel="noopener" style="display: inline-block; background-color: #0c0c0e; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px !important; font-weight: 700; font-size: 11.5px;">
                      Track / Inquire via WhatsApp &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0c0c0e; padding: 16px 20px; text-align: center;">
              <p style="margin: 0; font-size: 10.5px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} TheToysVirago &bull; Discretion &amp; Pleasure Delivered.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

        const result = await sendResendEmail(
          customerEmail,
          `🚚 Discreet Parcel Dispatched [${orderRef}] — TheToysVirago`,
          customerDispatchedHtml
        );

        if (result.ok) {
          return res.status(200).json({ success: true, id: result.data?.id, to: customerEmail });
        } else {
          return res.status(400).json({ error: result.data });
        }
    }

    // ================= ACTION 3: ORDER DELIVERED (REVIEW & CONFESSIONS PROMPT) =================
    if (action === 'order_delivered') {
      const customerDeliveredHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your order has been delivered</title>
</head>
<body style="margin: 0; padding: 12px 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 10px 8px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 440px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Content (Starts directly as requested) -->
          <tr>
            <td style="padding: 22px 18px 22px;">
              <p style="margin: 0 0 10px; font-size: 13px; line-height: 1.5; color: #0f172a;">
                Hello <strong>${customerName}</strong>,
              </p>
              <p style="margin: 0 0 16px; font-size: 12px; line-height: 1.55; color: #334155;">
                Courier reports indicate that your parcel for order <strong>${orderRef}</strong> has been safely delivered! We hope your new intimate pieces bring you unbounded curiosity, sensual pleasure, and pure joy.
              </p>

              <!-- HERO PROMPT CARD: WHISPER A CONFESSION / LEAVE A REVIEW -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%); border: 1px solid #f43f5e; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 14px rgba(244, 63, 94, 0.08);">
                <tr>
                  <td style="padding: 16px 14px; text-align: center;">
                    <div style="font-size: 18px; margin-bottom: 4px;">🤫 ✨ 💌</div>
                    <h2 style="margin: 0 0 6px; font-size: 13.5px; color: #881337; font-weight: 800; letter-spacing: 0.01em;">
                      Whisper a Confession
                    </h2>
                    <p style="margin: 0 0 14px; font-size: 11px; color: #4c0519; line-height: 1.5; max-width: 360px; margin-left: auto; margin-right: auto;">
                      How was your unboxing? Did your new piece ignite the spark you were seeking? Your experience is sacred to us. Visit our interactive Confessions Wall to leave an anonymous story, review your items, or share your thoughts with our private community.
                    </p>
                    <a href="https://thetoysvirago.shop/#confessions" target="_blank" rel="noopener" style="display: inline-block; background-color: #9f1239; color: #ffffff; text-decoration: none; padding: 9px 20px; border-radius: 8px !important; font-weight: 700; font-size: 11px; box-shadow: 0 3px 10px rgba(159, 18, 57, 0.25); text-transform: uppercase; letter-spacing: 0.04em;">
                      Leave a Review &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Order Recap -->
              <h3 style="margin: 0 0 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; font-weight: 700;">
                Delivered Items Recap
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 18px;">
                <thead>
                  <tr style="border-bottom: 1px solid #e2e8f0; text-align: left;">
                    <th style="padding: 6px 8px; font-size: 10.5px; text-transform: uppercase; color: #64748b; font-weight: 700;">Product</th>
                    <th style="padding: 6px 8px; font-size: 10.5px; text-transform: uppercase; color: #64748b; font-weight: 700; text-align: center;">Qty</th>
                    <th style="padding: 6px 8px; font-size: 10.5px; text-transform: uppercase; color: #64748b; font-weight: 700; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRowsHtml}
                </tbody>
              </table>

              <!-- Intimate Care & Concierge Reassurance -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 16px;">
                <tr>
                  <td style="padding: 12px 14px;">
                    <strong style="color: #0f172a; font-size: 11.5px;">🧴 Device Care &amp; Private Inquiries</strong>
                    <p style="margin: 4px 0 10px; font-size: 10.5px; color: #475569; line-height: 1.45;">
                      Have questions about initial USB charging, water resistance, gentle cleansing, or safe storage? Our discreet concierge is available anytime for private guidance.
                    </p>
                    <a href="https://wa.me/${whatsappNum}?text=Hello%20TheToysVirago%2C%20I%20received%20my%20order%20${orderRef}%20and%20have%20a%20question" target="_blank" rel="noopener" style="display: inline-block; background-color: #0c0c0e; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 8px !important; font-weight: 600; font-size: 11px;">
                      Chat with Concierge &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0c0c0e; padding: 16px 20px; text-align: center;">
              <p style="margin: 0; font-size: 10.5px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} TheToysVirago &bull; Discretion &amp; Pleasure Delivered.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

        const result = await sendResendEmail(
          customerEmail,
          `🎁 Your Order Has Arrived [${orderRef}] — Share Your Experience`,
          customerDeliveredHtml
        );

        if (result.ok) {
          return res.status(200).json({ success: true, id: result.data?.id, to: customerEmail });
        } else {
          return res.status(400).json({ error: result.data });
        }
    }

    // ================= ACTION 4 (DEFAULT): ORDER CONFIRMED (FROM ADMIN) =================
    // Dispatches editorial luxury receipt confirmation to customer
    const receiptItemsHtml = items.length > 0
      ? items.map(item => {
          const itemTitle = item.title || item.name || 'Intimate Piece';
          const itemVariant = item.variant || item.finish || item.size || item.color || (item.options ? Object.values(item.options).join(' · ') : '');
          const itemQty = item.qty || item.quantity || 1;
          const itemPrice = Number(item.price || 0);
          const linePrice = itemPrice * itemQty;
          const rawImg = item.img || item.image || item.thumbnail || '';
          const itemImgUrl = rawImg ? (rawImg.startsWith('http') ? rawImg : `${siteUrl}/${rawImg.replace(/^\/+/, '')}`) : '';

          return `
            <tr>
              <td style="padding: 7px 0; border-bottom: 1px solid #dfd8cd; vertical-align: middle;">
                <table role="presentation" cellspacing="0" cellpadding="0" width="100%">
                  <tr>
                    <td width="48" valign="middle" style="width: 48px; padding-right: 8px;">
                      ${itemImgUrl ? `
                        <img src="${itemImgUrl}" width="42" height="42" alt="${itemTitle}" style="display: block; width: 42px; height: 42px; border-radius: 6px; object-fit: cover; background-color: #232228;" />
                      ` : `
                        <table role="presentation" width="42" height="42" cellspacing="0" cellpadding="0" style="width: 42px; height: 42px; background-color: #232228; border-radius: 6px;">
                          <tr><td align="center" valign="middle" style="color: #9c958d; font-size: 11px;">✦</td></tr>
                        </table>
                      `}
                    </td>
                    <td valign="middle" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                      <div style="font-size: 11.5px; font-weight: 700; color: #1a1819; line-height: 1.25;">
                        ${itemTitle}
                      </div>
                      ${itemVariant ? `
                        <div style="font-size: 9.5px; color: #6b635b; margin-top: 1px;">
                          ${itemVariant}
                        </div>
                      ` : ''}
                    </td>
                    <td width="34" valign="middle" align="center" style="width: 34px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 10.5px; color: #4a453e; font-weight: 500; white-space: nowrap;">
                      &times; ${itemQty}
                    </td>
                    <td width="76" valign="middle" align="right" style="width: 76px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11.5px; font-weight: 700; color: #1a1819; white-space: nowrap;">
                      ${formatMoney(linePrice)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          `;
        }).join('')
      : `<tr><td style="padding: 8px 0; color: #6b635b; font-size: 11px;">Intimate wellness selection</td></tr>`;

    // High-speed CDN URLs (Instant 200 OK across all inboxes worldwide)
    const waxSealCdnUrl = 'https://iili.io/nSGL2at.png';
    const paperTopCdnUrl = 'https://iili.io/nSGQw79.png';

    // Build attachments array for inline CID delivery
    const emailAttachments = [];
    try {
      const fs = await import('fs');
      const path = await import('path');
      const assetsDir = path.join(process.cwd(), 'public', 'assets');
      const waxPath = path.join(assetsDir, 'wax-seal-email.png');
      if (fs.existsSync(waxPath)) {
        emailAttachments.push({
          filename: 'wax-seal-email.png',
          content: fs.readFileSync(waxPath).toString('base64'),
          cid: 'wax-seal-email.png'
        });
      }
    } catch (e) {}

    const customerConfirmationHtml = `<!DOCTYPE html>
<html lang="en" style="background-color: #f1ede8;">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your TheToysVirago order is confirmed</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background-color: #f1ede8 !important;
      min-height: 100%;
      -webkit-font-smoothing: antialiased;
    }
  </style>
</head>
<body style="margin: 0; padding: 12px 0; background-color: #f1ede8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1819; -webkit-font-smoothing: antialiased; min-height: 100%;">
  <!-- Preview Text Spacers -->
  <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #f1ede8; opacity: 0; mso-hide: all;">
    We've got your order. Here's everything you need to know.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" width="100%" height="100%" cellspacing="0" cellpadding="0" style="background-color: #f1ede8; padding: 8px 6px; min-height: 100%;">
    <tr>
      <td align="center">
        <!-- Main Email Container: Exact Width of Receipt Alone, Ends Directly at the Button -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 420px; margin: 0 auto; box-shadow: 0 6px 20px rgba(0,0,0,0.07); border-radius: 8px; overflow: hidden;">
          
          <!-- Realistic Torn Top Edge -->
          <tr>
            <td style="line-height: 0; padding: 0;">
              <img src="${paperTopCdnUrl}" width="420" alt="" style="display: block; width: 100%; max-width: 420px; height: auto; border: 0;" />
            </td>
          </tr>

          <!-- Ivory Paper Receipt Body -->
          <tr>
            <td style="background-color: #ede6dc; padding: 12px 18px 14px; color: #1a1819;">
              
              <!-- Receipt Header: Editorial Title + Prominent Wax Seal -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td valign="top" style="padding-right: 6px;">
                    <h1 style="margin: 0 0 5px; font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 21px; line-height: 1.15; font-weight: 600; color: #1a1819; letter-spacing: -0.01em; white-space: nowrap;">
                      Consider it <span style="font-style: italic; color: #8b1e2f; font-weight: 500;">handled.</span>
                    </h1>
                    <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10.5px; line-height: 1.4; color: #4a453e; max-width: 230px;">
                      Your order is confirmed.<br/>We've got the details, and we'll take it from here.
                    </p>
                  </td>
                  <td width="96" valign="top" align="right" style="width: 96px; padding-top: 0;">
                    <img src="${waxSealCdnUrl}" width="96" height="94" alt="TheToysVirago Seal" style="display: block; width: 96px; height: 94px; max-width: 96px;" />
                  </td>
                </tr>
              </table>

              <!-- Subtle Divider -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 12px; margin-bottom: 10px;">
                <tr>
                  <td style="border-bottom: 1px solid #d5cbbf; line-height: 1px; font-size: 1px;">&nbsp;</td>
                </tr>
              </table>

              <!-- Order Section Heading -->
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #231f20; margin-bottom: 6px;">
                YOUR ORDER
              </div>

              <!-- Product Item Rows -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                ${receiptItemsHtml}
              </table>

              <!-- Order Totals -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <tr>
                  <td style="padding: 2.5px 0; font-size: 11px; color: #5a544c;">Subtotal</td>
                  <td align="right" style="padding: 2.5px 0; font-size: 11px; color: #1a1819; font-weight: 500;">${formatMoney(subtotalAmount)}</td>
                </tr>
                <tr>
                  <td style="padding: 2.5px 0; font-size: 11px; color: #5a544c;">Delivery</td>
                  <td align="right" style="padding: 2.5px 0; font-size: 11px; color: #1a1819; font-weight: 500;">${deliveryFee > 0 ? formatMoney(deliveryFee) : 'Free'}</td>
                </tr>
                ${discountAmount > 0 ? `
                <tr>
                  <td style="padding: 2.5px 0; font-size: 11px; color: #8b1e2f;">Discount</td>
                  <td align="right" style="padding: 2.5px 0; font-size: 11px; color: #8b1e2f; font-weight: 600;">-${formatMoney(discountAmount)}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 8px 0 2px; font-size: 13.5px; font-weight: 800; color: #1a1819;">Total</td>
                  <td align="right" style="padding: 8px 0 2px; font-size: 13.5px; font-weight: 800; color: #1a1819;">${formatMoney(finalTotal)}</td>
                </tr>
              </table>

              <!-- Primary CTA Button: Receipt Ends Directly Here (Strict 8px radius) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 12px; margin-bottom: 0;">
                <tr>
                  <td align="center">
                    <a href="${orderDetailsUrl}" target="_blank" rel="noopener" style="display: block; width: 100%; box-sizing: border-box; background-color: #8b1e2f; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px !important; font-size: 11.5px; font-weight: 600; text-align: center; letter-spacing: 0.01em; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      View order details &rarr;
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const plainTextReceipt = `Consider it handled.

Your order is confirmed. We've got the details, and we'll take it from here.

YOUR ORDER
${items.map(it => `- ${it.title || 'Item'}${it.variant || it.finish ? ' (' + (it.variant || it.finish) + ')' : ''} × ${it.qty || 1} — ${formatMoney(Number(it.price || 0) * Number(it.qty || 1))}`).join('\n')}

Subtotal: ${formatMoney(subtotalAmount)}
Delivery: ${deliveryFee > 0 ? formatMoney(deliveryFee) : 'Free'}
${discountAmount > 0 ? `Discount: -${formatMoney(discountAmount)}\n` : ''}Total: ${formatMoney(finalTotal)}

View order details: ${orderDetailsUrl}

TheToysVirago • ${siteUrl}`;

    const result = await sendResendEmail(
      customerEmail,
      `Your TheToysVirago order is confirmed`,
      customerConfirmationHtml,
      plainTextReceipt,
      emailAttachments
    );

    if (result.ok) {
      return res.status(200).json({ success: true, id: result.data?.id, to: customerEmail });
    } else {
      console.error('[Resend Error]', result.data);
      return res.status(400).json({ error: result.data });
    }

  } catch (error) {
    console.error('[API send-confirmation error]', error);
    return res.status(500).json({ error: error.message || 'Internal server error while sending email' });
  }
}
