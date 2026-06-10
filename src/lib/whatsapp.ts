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

export const formatPhoneForWhatsApp = (phone: string): string => {
  if (!phone) return '';
  // Remove all non-digit characters
  return phone.replace(/\D/g, '');
};

export const sendWhatsAppMessage = async (phone: string, message: string, method: 'REDIRECT' | 'API' = 'REDIRECT') => {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  
  if (method === 'API') {
    alert("Direct WhatsApp API sending is currently disabled (No Backend configured). Defaulting to redirect.");
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    return { success: true };
  } else {
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    return { success: true };
  }
};
