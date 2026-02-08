import { useStore } from "../context/StoreContext";
import { Clock, Star, Calendar, Heart, Award, Footprints, Scissors, Activity, Sparkles } from "lucide-react";
import { useState } from "react";

// Default images for different service types - Professional foot care images
const defaultServiceImages = {
  // Foot care specific images
  foot: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800",
  feet: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800",
  pedicure: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800",
  medical: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800",
  nail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
  ingrown: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
  fungal: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800",
  callus: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800",
  corn: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800",
  cracked: "https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?w=800",
  heel: "https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?w=800",
  reflexology: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
  diabetic: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800",
  massage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
  spa: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800",
  wellness: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800",
  cream: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800",
  insole: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800",
  orthotic: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800",
  // Hair salon
  hair: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
  salon: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
  // Default
  default: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800",
};

// Get appropriate default image based on service name or category
const getDefaultImage = (service, storeSlug) => {
  const name = (service?.name || "").toLowerCase();
  const category = (service?.category?.name || "").toLowerCase();
  const slug = (storeSlug || "").toLowerCase();

  // Check if this is a foot clinic store
  if (slug.includes("feet") || slug.includes("foot") || slug.includes("healthy") || slug.includes("podolog")) {
    // Return foot-related images based on specific service type
    if (name.includes("cracked") || name.includes("heel")) return defaultServiceImages.heel;
    if (name.includes("callus") || name.includes("corn")) return defaultServiceImages.callus;
    if (name.includes("ingrown")) return defaultServiceImages.ingrown;
    if (name.includes("fungal")) return defaultServiceImages.fungal;
    if (name.includes("cream") || name.includes("moistur")) return defaultServiceImages.cream;
    if (name.includes("insole") || name.includes("orthotic")) return defaultServiceImages.insole;
    if (name.includes("diabetic") || category.includes("diabetic")) return defaultServiceImages.diabetic;
    if (name.includes("nail") || category.includes("nail")) return defaultServiceImages.nail;
    if (name.includes("reflexology") || category.includes("reflexology") || category.includes("wellness")) return defaultServiceImages.reflexology;
    return defaultServiceImages.foot;
  }

  // Check for other service types
  for (const [key, url] of Object.entries(defaultServiceImages)) {
    if (url && (name.includes(key) || category.includes(key) || slug.includes(key))) return url;
  }

  return defaultServiceImages.default;
};

// Get icon based on service type
const getServiceIcon = (service) => {
  const name = (service?.name || "").toLowerCase();
  const category = (service?.category?.name || "").toLowerCase();

  if (name.includes("nail") || category.includes("nail")) return Scissors;
  if (name.includes("diabetic") || category.includes("diabetic")) return Activity;
  if (name.includes("cream") || name.includes("insole") || name.includes("orthotic")) return Sparkles;
  return Footprints; // Default foot icon
};

export default function ServiceCard({ service, variant = "default", onBook }) {
  const { store, storeSlug } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const brandColors = {
    primary: store?.branding?.primaryColor || "#6366f1",
    secondary: store?.branding?.secondaryColor || "#4f46e5",
  };

  // Get service data
  const currentPrice = service.pricing?.salePrice || service.pricing?.basePrice || service.currentPrice || 0;
  const originalPrice = service.pricing?.basePrice || service.originalPrice || currentPrice;
  const hasDiscount = originalPrice > currentPrice;
  const discountPercent = hasDiscount ? Math.round((1 - currentPrice / originalPrice) * 100) : 0;

  // Get rating
  const rating = service.ratings?.average || service.rating || 4.8;
  const reviewCount = service.ratings?.count || service.reviewCount || 0;

  // Get duration from variant options or description
  const duration = service.variantOptions?.find((v) => v.name === "Duration")?.values?.[0] || service.duration || "60 min";

  // Get primary image - use service image or smart default based on store type
  const primaryImage = service.primaryImage || service.images?.[0]?.url || getDefaultImage(service, storeSlug);

  // Get icon for placeholder
  const ServiceIcon = getServiceIcon(service);
  const hasImage = primaryImage && primaryImage.length > 0;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleCardClick = () => {
    // Directly open booking modal - simple one-click action
    onBook && onBook();
  };

  // Compact card variant for lists
  if (variant === "compact") {
    return (
      <div onClick={handleCardClick} className="group flex bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer">
        {/* Image */}
        <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden">
          <img src={primaryImage} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {hasDiscount && <span className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full bg-rose-500 text-white">{discountPercent}% OFF</span>}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{service.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-1 mt-1">{service.shortDescription || service.description}</p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {duration}
              </span>
              <span className="flex items-center">
                <Star className="w-3.5 h-3.5 mr-1 text-yellow-400 fill-yellow-400" />
                {rating}
              </span>
            </div>
            <div className="text-right">
              {hasDiscount && <span className="text-xs text-gray-400 line-through">${originalPrice}</span>}
              <span className="font-bold ml-1" style={{ color: brandColors.primary }}>
                ${currentPrice}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Featured/Large card variant
  if (variant === "featured") {
    return (
      <div onClick={handleCardClick} className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={primaryImage} alt={service.name} className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? "scale-110" : "scale-100"}`} />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col space-y-2">
            {service.featured && (
              <span className="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg">
                <Award className="w-3 h-3 mr-1" />
                Popular
              </span>
            )}
            {hasDiscount && <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-rose-500 text-white shadow-lg">{discountPercent}% OFF</span>}
          </div>

          {/* Wishlist Button */}
          <button onClick={handleWishlist} className={`absolute top-4 right-4 p-2.5 rounded-full shadow-lg transition-all duration-300 ${isWishlisted ? "bg-rose-500 text-white" : "bg-white/90 text-gray-600 hover:bg-rose-50 hover:text-rose-500"}`}>
            <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
          </button>

          {/* Bottom Content on Image */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center space-x-4 text-white/90 text-sm mb-3">
              <span className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <Clock className="w-4 h-4 mr-1.5" />
                {duration}
              </span>
              <span className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <Star className="w-4 h-4 mr-1.5 text-yellow-400 fill-yellow-400" />
                {rating} ({reviewCount})
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{service.name}</h3>
            <p className="text-white/80 line-clamp-2">{service.shortDescription || service.description}</p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-6 flex items-center justify-between bg-white">
          <div>
            {hasDiscount && <span className="text-sm text-gray-400 line-through">${originalPrice}</span>}
            <span className="text-2xl font-bold ml-2" style={{ color: brandColors.primary }}>
              ${currentPrice}
            </span>
          </div>
          <span className="inline-flex items-center px-5 py-2.5 rounded-full font-semibold text-white transition-all group-hover:shadow-lg" style={{ backgroundColor: brandColors.primary }}>
            <Calendar className="w-4 h-4 mr-2" />
            Book Now
          </span>
        </div>
      </div>
    );
  }

  // Default card - SIMPLIFIED: Click anywhere to book
  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={primaryImage} alt={service.name} className={`w-full h-full object-cover transition-all duration-500 ${isHovered ? "scale-105" : "scale-100"}`} loading="lazy" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {service.featured && (
            <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg">
              <Award className="w-3 h-3 mr-1" />
              Popular
            </span>
          )}
          {hasDiscount && <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500 text-white shadow-lg">{discountPercent}% OFF</span>}
        </div>

        {/* Duration & Price Badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-white/90 text-gray-700 backdrop-blur-sm shadow">
            <Clock className="w-3 h-3 mr-1" />
            {duration} - ${currentPrice}
          </span>
        </div>

        {/* Wishlist Button */}
        <button onClick={handleWishlist} className={`absolute bottom-3 right-3 p-2 rounded-full shadow-lg transition-all duration-300 ${isWishlisted ? "bg-rose-500 text-white scale-110" : "bg-white/90 text-gray-600 hover:bg-rose-50 hover:text-rose-500 opacity-0 group-hover:opacity-100"}`}>
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Hover Overlay - Book Now CTA */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}>
          <span className="px-6 py-3 rounded-full font-semibold text-white shadow-lg flex items-center space-x-2" style={{ backgroundColor: brandColors.primary }}>
            <Calendar className="w-5 h-5" />
            <span>Book Now</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        {service.category?.name && <span className="text-xs font-medium uppercase tracking-wider text-gray-400">{service.category.name}</span>}

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mt-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{service.name}</h3>

        {/* Description */}
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{service.shortDescription || service.description}</p>

        {/* Rating */}
        <div className="flex items-center mt-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">
            {rating} ({reviewCount} reviews)
          </span>
        </div>

        {/* Price and Availability */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div>
            {hasDiscount && <span className="text-sm text-gray-400 line-through">${originalPrice}</span>}
            <span className="text-xl font-bold ml-1" style={{ color: brandColors.primary }}>
              ${currentPrice}
            </span>
          </div>
          <span className="text-xs text-green-600 font-medium flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
            Available
          </span>
        </div>
      </div>
    </div>
  );
}
