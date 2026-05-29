import { fetchWithApiBase } from './api';

export const WHATSAPP_TEMPLATES = {
  RECEIVED: (name: string, orderNo: string) => `Hello ${name} 👋
Your order *#${orderNo}* has been received successfully and is currently being processed.

Thank you for shopping with *The Vagina Room* 💜`,

  PAYMENT_CONFIRMED: (name: string, orderNo: string) => `Hello ${name} 👋
Payment for order *#${orderNo}* has been confirmed successfully.

We are preparing your order for delivery 🚚`,

  SHIPPED: (name: string, orderNo: string, trackUrl: string) => `Good news 🎉
Your order *#${orderNo}* has been shipped successfully.

Track your order here:
${trackUrl}`,

  DELIVERED: (name: string, orderNo: string) => `Hello ${name} 👋
Your order *#${orderNo}* has been delivered successfully.

Thank you for choosing *The Vagina Room* 💜
We appreciate your trust and support.`
};

export const sendWhatsAppMessage = async (phone: string, message: string, method: 'REDIRECT' | 'API' = 'REDIRECT') => {
  const formattedPhone = phone.replace(/\s+/g, '').replace('+', '');
  
  if (method === 'API') {
    try {
      const response = await fetchWithApiBase('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone, message })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send WhatsApp message via API');
      }
      return { success: true };
    } catch (err: any) {
      console.error(err);
      alert('Error sending WhatsApp message via API: ' + err.message);
      return { success: false, error: err.message };
    }
  } else {
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    return { success: true };
  }
};
