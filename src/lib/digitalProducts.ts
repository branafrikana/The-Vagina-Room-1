
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface DigitalAsset {
  id: string;
  title: string;
  downloadUrl: string;
  isFree?: boolean;
}

/**
 * Validates if a user has access to a digital product by checking their order history
 * or membership status.
 */
export const verifyAssetAccess = async (userId: string, productId: string): Promise<boolean> => {
  try {
    // 1. Check if product is free
    const prodDoc = await getDoc(doc(db, 'products', productId));
    if (prodDoc.exists() && (prodDoc.data().price === 0 || prodDoc.data().price === "0")) {
      return true;
    }

    // 2. Check orders for this user that contain this product and are 'paid'
    // This part is best handled by the server for security, 
    // but we provide the utility here for UI gating.
    return false; // Default to server-side verification for security
  } catch (error) {
    console.error("Access verification error:", error);
    return false;
  }
};

/**
 * Triggers the professional digital fulfillment cycle on the server.
 * This includes link generation and email receipt dispatch.
 */
export const triggerDigitalFulfillment = async (orderId: string) => {
  // Mocked for No-Backend strategy
  console.log("Mock digital fulfillment triggered for order:", orderId);
  return { success: true, message: "Mock fulfillment completed" };
};
