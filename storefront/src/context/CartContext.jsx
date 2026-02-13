import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";

const CartContext = createContext();

const CART_STORAGE_KEY = "retailx_cart";
const DELIVERY_STORAGE_KEY = "retailx_delivery";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);

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
    const savedDelivery = localStorage.getItem(DELIVERY_STORAGE_KEY);
    if (savedDelivery) {
      try {
        setDeliveryInfo(JSON.parse(savedDelivery));
      } catch (e) {
        console.error("Failed to parse delivery info:", e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Save delivery info to localStorage
  useEffect(() => {
    if (deliveryInfo) {
      localStorage.setItem(DELIVERY_STORAGE_KEY, JSON.stringify(deliveryInfo));
    } else {
      localStorage.removeItem(DELIVERY_STORAGE_KEY);
    }
  }, [deliveryInfo]);

  // Add item to cart (supports bakery customization)
  const addItem = useCallback((product, quantity = 1, variant = null, options = {}) => {
    const { customization, delivery } = options;

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

      // Customized items (bakery) are always unique entries
      if (customization) {
        const customPrice = customization.totalPrice || product.currentPrice || product.pricing?.salePrice || product.pricing?.basePrice || 0;
        const newItem = {
          id: `${product._id}-custom-${Date.now()}`,
          productId: product._id,
          name: product.name,
          slug: product.slug,
          price: customPrice,
          originalPrice: product.originalPrice || product.pricing?.basePrice || customPrice,
          image: product.primaryImage || product.images?.[0]?.url,
          quantity,
          variant,
          maxQuantity: product.inventory?.quantity || 99,
          customization: {
            size: customization.size || null,
            flavor: customization.flavor || null,
            message: customization.message || "",
            customImage: customization.customImage || null,
            allergens: customization.allergens || [],
            prepTime: customization.prepTime || null,
            sizeLabel: customization.sizeLabel || "",
            flavorLabel: customization.flavorLabel || "",
          },
        };

        // Save delivery info if provided
        if (delivery) {
          setDeliveryInfo(delivery);
        }

        toast.success("Customized order added!");
        return [...prevItems, newItem];
      }

      const existingIndex = prevItems.findIndex((item) => item.productId === product._id && item.variant === variant && !item.bookingDetails && !item.customization);

      if (existingIndex > -1) {
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
        price: product.currentPrice || product.pricing?.salePrice || product.pricing?.basePrice || 0,
        originalPrice: product.originalPrice || product.pricing?.basePrice || 0,
        image: product.primaryImage || product.images?.[0]?.url,
        quantity,
        variant,
        maxQuantity: product.inventory?.quantity || 99,
      };

      toast.success("Added to cart");
      return [...prevItems, newItem];
    });
  }, []);

  // Update delivery info
  const updateDeliveryInfo = useCallback((info) => {
    setDeliveryInfo(info);
  }, []);

  // Clear delivery info
  const clearDeliveryInfo = useCallback(() => {
    setDeliveryInfo(null);
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
    setDeliveryInfo(null);
    toast.success("Cart cleared");
  }, []);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate delivery fee
  const deliveryFee = useMemo(() => {
    if (!deliveryInfo) return 0;
    if (deliveryInfo.type === "pickup") return 0;
    if (subtotal >= 50) return 0; // Free delivery over $50
    return deliveryInfo.expressFee || 4.99;
  }, [deliveryInfo, subtotal]);

  // Tax estimate (bakery tax)
  const taxRate = 0.08; // 8%
  const taxAmount = subtotal * taxRate;

  // Grand total
  const grandTotal = subtotal + deliveryFee + taxAmount;

  // Check if cart has customized items
  const hasCustomizedItems = items.some((item) => item.customization);

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
        deliveryInfo,
        updateDeliveryInfo,
        clearDeliveryInfo,
        deliveryFee,
        taxAmount,
        grandTotal,
        hasCustomizedItems,
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
