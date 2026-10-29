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

    const resendApiKey = apiKey || process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;
    const storeOwnerEmails = ['thetoysvirago@gmail.com', 'admin@thetoysvirago.shop', 'dfordolapo@gmail.com'];

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

    // Helper function to send email via Resend
    const sendResendEmail = async (toAddresses, subject, htmlContent) => {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: Array.isArray(toAddresses) ? toAddresses : [toAddresses],
          subject,
          html: htmlContent
        })
      });
      const data = await response.json();
      return { ok: response.ok, data };
    };

    // ================= ACTION 1: ORDER PLACED (NEW CHECKOUT) =================
    // Dispatches instant alert to the Store Owner so their phone buzzes immediately!
    // Also sends an initial order receipt to the customer.
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

      // 1. Send alert to store owner (triggers instant phone notification via email app)
      await sendResendEmail(
        storeOwnerEmails,
        `🚨 New Order Placed: [${orderRef}] ₦${totalAmount} from ${customerName}`,
        ownerAlertHtml
      );

      // 2. If customer provided an email, send initial order acknowledgment
      if (customerEmail) {
        const customerAckHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #0f172a;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0;">
    <div style="background: #0c0c0e; padding: 30px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 22px; letter-spacing: 0.08em; text-transform: uppercase; color: #e2cb98;">The Toys Virago</h1>
      <p style="margin: 8px 0 0; font-size: 13px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em;">Order Received &bull; Transfer Verification Underway</p>
    </div>
    <div style="padding: 28px;">
      <p style="margin: 0 0 14px; font-size: 15px;">Hello <strong>${customerName}</strong>,</p>
      <p style="margin: 0 0 20px; font-size: 14.5px; color: #334155; line-height: 1.6;">
        Thank you for choosing TheToysVirago! We have received your order details for reference <strong>${orderRef}</strong> (Total: <strong>₦${totalAmount}</strong>). Our concierge is verifying your payment and preparing your 100% discreet courier package.
      </p>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; margin-bottom: 22px; font-size: 13px; color: #475569; line-height: 1.6;">
        <strong>🔒 Discreet Packaging Guarantee:</strong> Your parcel will arrive in a plain, unbranded courier bag with zero mention of adult novelties, intimate wellness, or brand names on the exterior.
      </div>
      <div style="text-align: center;">
        <a href="https://wa.me/${whatsappNum}?text=Hello%20TheToysVirago%2C%20following%20up%20on%20my%20order%20${orderRef}" style="display: inline-block; background: #0c0c0e; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 13px;">
          Chat with Concierge on WhatsApp &rarr;
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;
        await sendResendEmail(customerEmail, `Order Received [${orderRef}] — TheToysVirago`, customerAckHtml);
      }

      return res.status(200).json({ success: true, message: 'Owner alert and customer acknowledgment dispatched' });
    }

    // ================= ACTION 2: ORDER CONFIRMED (FROM ADMIN) =================
    // Dispatches full Haute Boudoir verified receipt to customer
    if (!customerEmail) {
      return res.status(400).json({ error: 'Customer email address is missing' });
    }

    const customerConfirmationHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0c0c0e; padding: 36px 30px; text-align: center;">
              <span style="display: inline-block; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #e2cb98; font-weight: 700; margin-bottom: 8px;">DISCREET LUXURY &bull; INTIMATE WELLNESS</span>
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;">
                The Toys Virago
              </h1>
              <div style="margin-top: 14px; display: inline-block; background: rgba(159, 18, 57, 0.25); border: 1px solid #9f1239; color: #fecdd3; padding: 5px 14px; border-radius: 999px; font-size: 11.5px; font-weight: 600; letter-spacing: 0.05em;">
                ✓ PAYMENT VERIFIED &bull; ORDER CONFIRMED
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #0f172a;">
                Hello <strong>${customerName}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #334155;">
                We have verified your payment! Your order <strong>${orderRef}</strong> is officially confirmed and our discreet logistics team is prepping it for priority dispatch.
              </p>

              <!-- Reference Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; margin-bottom: 26px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <div style="font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.08em; color: #9f1239; font-weight: 700; margin-bottom: 4px;">
                      Official Order Reference
                    </div>
                    <div style="font-size: 20px; font-weight: 800; color: #881337; letter-spacing: 0.04em;">
                      ${orderRef}
                    </div>
                  </td>
                  <td align="right" style="padding: 16px 20px;">
                    <div style="font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.08em; color: #9f1239; font-weight: 700; margin-bottom: 4px;">
                      Amount Paid
                    </div>
                    <div style="font-size: 20px; font-weight: 800; color: #0f172a;">
                      ₦${totalAmount}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Items Table -->
              <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; font-weight: 700;">
                Your Selection
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 26px;">
                <thead>
                  <tr style="border-bottom: 2px solid #e2e8f0; text-align: left;">
                    <th style="padding: 10px; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700;">Product</th>
                    <th style="padding: 10px; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; text-align: center;">Qty</th>
                    <th style="padding: 10px; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRowsHtml}
                </tbody>
              </table>

              <!-- Discreet Guarantee -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; margin-bottom: 26px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <strong style="color: #0f172a; font-size: 14px;">🔒 100% Discreet Packaging Guarantee</strong>
                    <p style="margin: 6px 0 0; font-size: 13px; color: #475569; line-height: 1.55;">
                      Your package will arrive in a plain, unbranded opaque courier bag with zero mention of intimate wellness, adult novelties, or brand names on the exterior.
                    </p>
                  </td>
                </tr>
              </table>

              ${order.address ? `
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin-bottom: 26px;">
                <div style="font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; font-weight: 700; margin-bottom: 4px;">Delivery Destination</div>
                <div style="font-size: 13.5px; color: #1e293b; line-height: 1.5;">${order.address}</div>
                ${order.phone ? `<div style="font-size: 13px; color: #64748b; margin-top: 4px;">Phone: <strong>${order.phone}</strong></div>` : ''}
              </div>` : ''}

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 10px 0 20px;">
                    <a href="https://wa.me/${whatsappNum}?text=Hello%20TheToysVirago%2C%20following%20up%20on%20my%20confirmed%20order%20${orderRef}" target="_blank" rel="noopener" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 13.5px;">
                      Contact Concierge on WhatsApp &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0c0c0e; padding: 24px 30px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
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
      `Order Confirmed & Payment Verified [${orderRef}] — TheToysVirago`,
      customerConfirmationHtml
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
