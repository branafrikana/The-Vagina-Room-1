import React, { createContext, useContext, useState, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { useContent } from "./ContentContext";

export interface CartItem {
  id: string;
  title: string;
  price: string;
  memberDiscountPrice?: string; // Optional specific member price
  currency: string;
  imageUrl: string;
  quantity: number;
  isDigital?: boolean;
  downloadUrl?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  originalTotalPrice: number;
  discountAmount: number;
  memberDiscountApplied: boolean;
  discountPercentage: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { userData } = useAuth();
  const { content } = useContent();

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("tvr_cart");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Get discount settings from content
  const discountConfig = useMemo(() => {
    try {
      const config = JSON.parse(content.generalSettingsJson || "{}");
      return {
        enabled: config.memberDiscountEnabled !== false,
        percentage: parseInt(config.memberDiscountPercent || "10")
      };
    } catch {
      return { enabled: true, percentage: 10 };
    }
  }, [content.generalSettingsJson]);

  // Check if member discount should be applied (user logged in and feature enabled)
  // Note: Assuming userData exists and has a role/status. For now, any logged-in user who is not an admin is a "member"
  // or we can check for a specific field like `userData.membershipStatus === 'active'`
  const isMember = !!userData;
  const memberDiscountApplied = isMember && discountConfig.enabled;

  // Persist cart to localStorage
  React.useEffect(() => {
    localStorage.setItem("tvr_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);
      if (existingItem) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setCartItems([]);

  const { totalItems, totalPrice, originalTotalPrice, discountAmount } = useMemo(() => {
    const itemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    
    let total = 0;
    let originalTotal = 0;

    cartItems.forEach(item => {
      const basePrice = parseFloat(String(item.price).replace(/[^0-9.]/g, '') || "0");
      const subtotal = basePrice * item.quantity;
      originalTotal += subtotal;

      if (memberDiscountApplied) {
        // Use specific member price if available, otherwise apply global percentage
        if (item.memberDiscountPrice) {
          const mPrice = parseFloat(String(item.memberDiscountPrice).replace(/[^0-9.]/g, '') || "0");
          total += mPrice * item.quantity;
        } else {
          const discountedPrice = basePrice * (1 - discountConfig.percentage / 100);
          total += discountedPrice * item.quantity;
        }
      } else {
        total += subtotal;
      }
    });

    return { 
      totalItems: itemsCount, 
      totalPrice: total, 
      originalTotalPrice: originalTotal,
      discountAmount: originalTotal - total
    };
  }, [cartItems, memberDiscountApplied, discountConfig]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        originalTotalPrice,
        discountAmount,
        memberDiscountApplied,
        discountPercentage: discountConfig.percentage
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be initialized inside CartProvider");
  }
  return context;
}
