import { createContext, useContext, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { storeAPI } from "../services/api";

const StoreContext = createContext();

// Helper function to determine if store is service-based from slug
const isServiceBasedFromSlug = (slug) => {
  if (!slug) return false;
  const serviceKeywords = ["spa", "massage", "tranquil", "hair", "glamour", "salon", "beauty", "wellness", "therapy", "feet", "foot", "podolog", "clinic", "studio", "healthy"];
  return serviceKeywords.some((keyword) => slug.toLowerCase().includes(keyword));
};

// Helper function to get appropriate terminology based on business type
const getTerminology = (businessType, storeSlug) => {
  // Check both database businessType AND slug patterns
  const isService = businessType === "services" || isServiceBasedFromSlug(storeSlug);
  return {
    isServiceBased: isService,
    isProductBased: !isService,
    // Singular terms
    product: isService ? "Service" : "Product",
    item: isService ? "Service" : "Item",
    // Plural terms
    products: isService ? "Services" : "Products",
    items: isService ? "Services" : "Items",
    // Actions
    addToCart: isService ? "Book Now" : "Add to Cart",
    buyNow: isService ? "Book Appointment" : "Buy Now",
    shopNow: isService ? "Browse Services" : "Shop Now",
    viewAll: isService ? "View All Services" : "View All Products",
    // Cart related
    cart: isService ? "Bookings" : "Cart",
    checkout: isService ? "Confirm Booking" : "Checkout",
    // Other
    price: isService ? "Price" : "Price",
    stock: isService ? "Availability" : "Stock",
    inStock: isService ? "Available" : "In Stock",
    outOfStock: isService ? "Fully Booked" : "Out of Stock",
    // Navigation
    allProducts: isService ? "All Services" : "All Products",
    featured: isService ? "Featured Services" : "Featured Products",
    newArrivals: isService ? "New Services" : "New Arrivals",
    categories: isService ? "Service Categories" : "Categories",
    // Descriptions
    browseCollection: isService ? "Browse our professional services" : "Browse our collection",
    addedToCart: isService ? "Added to bookings" : "Added to cart",
    // Service-specific
    bookAppointment: "Book Appointment",
    viewGallery: "View Gallery",
    ourTeam: "Our Team",
    testimonials: "Testimonials",
  };
};

export function StoreProvider({ children }) {
  const [storeSlug, setStoreSlug] = useState(() => {
    return localStorage.getItem("storeSlug") || null;
  });

  // Fetch store info
  const {
    data: storeData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["store", storeSlug],
    queryFn: storeAPI.getInfo,
    enabled: !!storeSlug,
    retry: false, // Don't retry on 404
  });

  const store = storeData?.data?.data?.store;

  // Handle store not found - clear invalid slug
  useEffect(() => {
    if (error && error.response?.status === 404 && storeSlug) {
      console.warn(`Store "${storeSlug}" not found, clearing...`);
      localStorage.removeItem("storeSlug");
      setStoreSlug(null);
    }
  }, [error, storeSlug]);

  // Update localStorage when store changes
  useEffect(() => {
    if (storeSlug) {
      localStorage.setItem("storeSlug", storeSlug);
    }
  }, [storeSlug]);

  // Switch store function
  const switchStore = (slug) => {
    setStoreSlug(slug);
    localStorage.setItem("storeSlug", slug);
    window.location.reload(); // Reload to fetch new store data
  };

  // Determine if service-based from both DB and slug
  const isServiceBasedStore = store?.businessType === "services" || isServiceBasedFromSlug(storeSlug);

  // Get terminology based on business type
  const terminology = getTerminology(store?.businessType, storeSlug);

  // Feature flags from store configuration
  const features = {
    // Core features
    paymentEnabled: store?.features?.paymentEnabled ?? true,
    cartEnabled: store?.features?.cartEnabled ?? true,
    bookingEnabled: store?.features?.bookingEnabled ?? false,
    guestCheckoutEnabled: store?.features?.guestCheckoutEnabled ?? true,
    shippingEnabled: store?.features?.shippingEnabled ?? true,
    inventoryEnabled: store?.features?.inventoryEnabled ?? true,
    customerAccountsEnabled: store?.features?.customerAccountsEnabled ?? true,
    customerAccountRequired: store?.features?.customerAccountRequired ?? false,

    // Customer features
    reviewsEnabled: store?.features?.reviewsEnabled ?? true,
    wishlistEnabled: store?.features?.wishlistEnabled ?? true,
    discountsEnabled: store?.features?.discountsEnabled ?? true,
    couponsEnabled: store?.features?.couponsEnabled ?? true,

    // Booking settings
    bookingRequiresPayment: store?.features?.bookingRequiresPayment ?? false,
    bookingAllowCancellation: store?.features?.bookingAllowCancellation ?? true,
  };

  // Booking settings from store
  const bookingSettings = store?.bookingSettings || {
    slotDuration: 60,
    bufferTime: 15,
    advanceBookingDays: 30,
    minAdvanceHours: 24,
    phoneNumber: store?.contact?.phone || "",
    confirmationMessage: "Thank you for your booking! Please call us to confirm your appointment.",
  };

  return (
    <StoreContext.Provider
      value={{
        store,
        storeSlug,
        switchStore,
        isLoading,
        error,
        terminology,
        isServiceBased: isServiceBasedStore,
        isProductBased: !isServiceBasedStore,
        features,
        bookingSettings,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
