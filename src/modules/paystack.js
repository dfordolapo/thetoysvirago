// Paystack Inline Payment Integration Module
export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';

export function isPaystackConfigured() {
  return typeof PAYSTACK_PUBLIC_KEY === 'string' && PAYSTACK_PUBLIC_KEY.trim().startsWith('pk_');
}

export function openPaystackInline({
  email,
  amountInNaira,
  reference,
  customerName,
  phone,
  address,
  onSuccess,
  onCancel
}) {
  if (!isPaystackConfigured()) {
    console.warn('[Paystack] Public Key is not configured in .env.');
    return false;
  }

  if (typeof window.PaystackPop === 'undefined' || !window.PaystackPop.setup) {
    console.error('[Paystack] Inline SDK script not loaded.');
    return false;
  }

  try {
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY.trim(),
      email: email,
      amount: Math.round(amountInNaira * 100), // in kobo
      currency: 'NGN',
      ref: reference,
      metadata: {
        custom_fields: [
          { display_name: 'Customer Name', variable_name: 'customer_name', value: customerName },
          { display_name: 'Phone', variable_name: 'phone', value: phone },
          { display_name: 'Delivery Address', variable_name: 'delivery_address', value: address }
        ]
      },
      callback: function (response) {
        if (typeof onSuccess === 'function') {
          onSuccess(response);
        }
      },
      onClose: function () {
        if (typeof onCancel === 'function') {
          onCancel();
        }
      }
    });

    handler.openIframe();
    return true;
  } catch (err) {
    console.error('[Paystack] Initialization error:', err);
    return false;
  }
}
