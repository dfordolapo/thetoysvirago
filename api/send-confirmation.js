// Vercel Serverless Function: Automated Customer Order Confirmation via Resend
export default async function handler(req, res) {
  // Set CORS headers for security and flexibility
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
    const { order, apiKey } = body;

    if (!order) {
      return res.status(400).json({ error: 'Order details missing from request' });
    }

    // Determine Resend API Key: from request or environment variables
    const resendApiKey = apiKey || process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return res.status(400).json({ error: 'Resend API key is not configured' });
    }

    // Extract customer email
    let customerEmail = order.customer_email || order.email || '';
    if (!customerEmail && order.address) {
      const match = order.address.match(/Email:\s*([\w.-]+@[\w.-]+)/i);
      if (match) customerEmail = match[1];
    }

    if (!customerEmail) {
      return res.status(400).json({ error: 'Customer email address could not be identified' });
    }

    const customerName = order.customer_name || 'Valued Client';
    const orderRef = order.reference || 'TTV-' + Date.now().toString(36).toUpperCase();
    const totalAmount = Number(order.total_amount || 0).toLocaleString();
    const items = Array.isArray(order.items) ? order.items : [];
    const whatsappNum = process.env.VITE_STORE_WHATSAPP || '2348036514814';

    // Format item list
    const itemsHtml = items.length > 0
      ? items.map(item => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 14px 10px; font-size: 14px; color: #0f172a;">
            <strong>${item.title || 'Item'}</strong>
            ${item.finish ? `<br/><span style="font-size: 12px; color: #64748b; background: #f8fafc; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px;">Option: ${item.finish}</span>` : ''}
          </td>
          <td style="padding: 14px 10px; font-size: 14px; text-align: center; color: #475569; font-weight: 600;">
            ${item.qty || 1}
          </td>
          <td style="padding: 14px 10px; font-size: 14px; text-align: right; color: #9f1239; font-weight: 700;">
            ₦${Number(item.price || 0).toLocaleString()}
          </td>
        </tr>
      `).join('')
      : `
        <tr>
          <td colspan="3" style="padding: 14px 10px; font-size: 14px; color: #475569;">
            Intimate Wellness Devices &amp; Accessories
          </td>
        </tr>
      `;

    // Haute Boudoir Luxury HTML Email Design (matching NailExpress style)
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed &bull; TheToysVirago</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
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

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #0f172a;">
                Hello <strong>${customerName}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #334155;">
                Your payment has been successfully confirmed! Our discreet fulfillment team is already carefully preparing your parcel for priority dispatch.
              </p>

              <!-- Order Reference Box -->
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

              <!-- Itemized Table -->
              <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; font-weight: 700;">
                Your Selection
              </h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse; margin-bottom: 26px;">
                <thead>
                  <tr style="border-bottom: 2px solid #e2e8f0; text-align: left;">
                    <th style="padding: 10px 10px; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.05em;">Product</th>
                    <th style="padding: 10px 10px; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.05em; text-align: center;">Qty</th>
                    <th style="padding: 10px 10px; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.05em; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- 100% Discreet Packaging Guarantee Badge -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; margin-bottom: 26px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <div style="display: flex; align-items: center; margin-bottom: 6px;">
                      <strong style="color: #0f172a; font-size: 14px;">🔒 100% Discreet Packaging Guarantee</strong>
                    </div>
                    <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.55;">
                      Your privacy is sacred. Your order will arrive in a plain, unbranded opaque courier flyer with <strong>zero indication</strong> of intimate products, adult novelties, or our brand name on the parcel. The dispatch note only shows standard courier delivery details.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Delivery Destination Summary -->
              ${order.address ? `
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin-bottom: 26px;">
                <div style="font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; font-weight: 700; margin-bottom: 4px;">Delivery Destination</div>
                <div style="font-size: 13.5px; color: #1e293b; line-height: 1.5;">${order.address}</div>
                ${order.phone ? `<div style="font-size: 13px; color: #64748b; margin-top: 4px;">Phone: <strong>${order.phone}</strong></div>` : ''}
              </div>
              ` : ''}

              <!-- WhatsApp Concierge Support Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 10px 0 20px;">
                    <a href="https://wa.me/${whatsappNum}?text=Hello%20TheToysVirago%2C%20following%20up%20on%20my%20confirmed%20order%20${orderRef}" target="_blank" rel="noopener" style="display: inline-block; background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 13.5px; letter-spacing: 0.03em;">
                      Contact Concierge on WhatsApp &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 13px; color: #64748b; text-align: center; line-height: 1.5;">
                Need to adjust delivery timing or instructions? Chat with our discreet team at any time.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0c0c0e; padding: 24px 30px; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 12px; color: #94a3b8;">
                &copy; ${new Date().getFullYear()} TheToysVirago &bull; Discretion &amp; Pleasure Delivered.
              </p>
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                Nigeria's Premier Discreet Intimate Wellness Destination.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    // Attempt to send email via Resend
    const sendWithSender = async (senderEmail) => {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: senderEmail,
          to: [customerEmail],
          subject: `Order Confirmed & Payment Verified [${orderRef}] — TheToysVirago`,
          html: emailHtml
        })
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    };

    // Priority 1: From configured environment email
    const preferredFrom = process.env.VITE_RESEND_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'TheToysVirago Concierge <onboarding@resend.dev>';
    let result = await sendWithSender(preferredFrom);

    // Priority 2: Fallback to verified onboarding@resend.dev if custom domain failed
    if (!result.ok && !preferredFrom.includes('onboarding@resend.dev')) {
      console.warn('[Resend] Primary sender failed, falling back to onboarding@resend.dev:', result.data);
      result = await sendWithSender('TheToysVirago Concierge <onboarding@resend.dev>');
    }

    if (result.ok) {
      return res.status(200).json({ success: true, id: result.data?.id, to: customerEmail });
    } else {
      console.error('[Resend Error]', result.data);
      return res.status(result.status || 400).json({ error: result.data });
    }
  } catch (error) {
    console.error('[API send-confirmation error]', error);
    return res.status(500).json({ error: error.message || 'Internal server error while sending email' });
  }
}
