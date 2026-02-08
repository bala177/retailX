import { createContext, useContext, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

const CartContext = createContext();

const CART_STORAGE_KEY = "retailx_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart:", e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Add item to cart
  const addItem = useCallback((product, quantity = 1, variant = null) => {
    setItems((prevItems) => {
      // For bookings with specific date/time, always add as new item
      if (product.bookingDetails) {
        const newItem = {
          id: `${product.productId}-booking-${Date.now()}`,
          productId: product.productId,
          name: product.name,
          slug: product.slug,
          price: product.price,
          originalPrice: product.originalPrice,
          image: product.image,
          quantity: product.quantity || 1,
          variant,
          maxQuantity: 10,
          bookingDetails: product.bookingDetails,
        };
        return [...prevItems, newItem];
      }

      const existingIndex = prevItems.findIndex((item) => item.productId === product._id && item.variant === variant && !item.bookingDetails);

      if (existingIndex > -1) {
        // Update quantity if item exists (only for non-booking items)
        const updatedItems = [...prevItems];
        updatedItems[existingIndex].quantity += quantity;
        toast.success("Cart updated");
        return updatedItems;
      }

      // Add new item
      const newItem = {
        id: `${product._id}-${variant || "default"}-${Date.now()}`,
        productId: product._id,
        name: product.name,
        slug: product.slug,
        price: product.currentPrice,
        originalPrice: product.originalPrice,
        image: product.primaryImage || product.images?.[0]?.url,
        quantity,
        variant,
        maxQuantity: product.inventory?.quantity || 99,
      };

      toast.success("Added to cart");
      return [...prevItems, newItem];
    });
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((itemId, quantity) => {
    setItems((prevItems) => prevItems.map((item) => (item.id === itemId ? { ...item, quantity: Math.max(1, Math.min(quantity, item.maxQuantity)) } : item)));
  }, []);

  // Remove item from cart
  const removeItem = useCallback((itemId) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    toast.success("Item removed");
  }, []);

  // Clear cart
  const clearCart = useCallback(() => {
    setItems([]);
    toast.success("Cart cleared");
  }, []);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Open/close cart
  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal,
        itemCount,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
