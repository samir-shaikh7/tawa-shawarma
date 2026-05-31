import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type CartItem = {
  productId: string;
  name: string;
  variant: string;
  price: number;
  quantity: number;
};

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variant: string) => void;
  updateQuantity: (productId: string, variant: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem("tawa-cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("tawa-cart", JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === newItem.productId && i.variant === newItem.variant);
      if (existing) {
        return prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + newItem.quantity } : i
        );
      }
      return [...prev, newItem];
    });
  };

  const removeItem = (productId: string, variant: string) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.variant === variant)));
  };

  const updateQuantity = (productId: string, variant: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.productId === productId && i.variant === variant) {
          const newQ = i.quantity + delta;
          return { ...i, quantity: newQ > 0 ? newQ : 1 };
        }
        return i;
      })
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
