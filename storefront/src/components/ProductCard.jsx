import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useStore } from "../context/StoreContext";
import { resolveImageUrl } from "../services/api";
import { ShoppingCart, Eye, Heart, Star, Check, Truck, Calendar, Clock, Cake } from "lucide-react";
import { useState } from "react";

export default function ProductCard({ product, showSaleBadge, showNewBadge }) {
  const { addItem } = useCart();
  const { terminology, isServiceBased, storeSlug, store } = useStore();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Bakery detection
  const isBakeryStore = (() => {
    const slug = (storeSlug || "").toLowerCase();
    const name = (store?.name || "").toLowerCase();
    const combined = slug + " " + name;
    return (
      combined.includes("bake") ||
      combined.includes("bakery") ||
      combined.includes("cake") ||
      combined.includes("sweet") ||
      combined.includes("pastry") ||
      combined.includes("patisserie") ||
      combined.includes("confection") ||
      combined.includes("cupcake") ||
      combined.includes("dessert") ||
      combined.includes("cookie") ||
      combined.includes("donut") ||
      combined.includes("chocolate")
    );
  })();

  // Get prices from product schema
  const currentPrice = product.pricing?.salePrice || product.pricing?.basePrice || product.currentPrice || 0;
  const originalPrice = product.pricing?.basePrice || product.originalPrice || currentPrice;
  const discount = originalPrice > currentPrice ? Math.round((1 - currentPrice / originalPrice) * 100) : 0;

  // Get stock status (for services, this represents availability)
  const stockQuantity = product.inventory?.quantity ?? product.stock ?? 100;
  const stockStatus = stockQuantity === 0 ? "out-of-stock" : stockQuantity < 10 ? "low-stock" : "in-stock";

  // Get rating info
  const rating = product.ratings?.average || product.rating || 4.5;
  const reviewCount = product.ratings?.count || product.reviewCount || 0;

  // Get images
  const images = product.images || [];
  const primaryImage = resolveImageUrl(product.primaryImage || images.find((img) => img.isPrimary)?.url || images[0]?.url) || "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400";
  const hoverImage = resolveImageUrl(images[1]?.url) || primaryImage;

  // Get duration for services
  const duration = product.variantOptions?.find((v) => v.name === "Duration")?.values?.[0] || null;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    // For bakery, navigate to product detail for customization
    if (isBakeryStore) {
      navigate(`/products/${product.slug}`);
      return;
    }
    setIsAddingToCart(true);
    await addItem(product);
    setTimeout(() => setIsAddingToCart(false), 1000);
  };

  const navigate = useNavigate();

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : i < rating ? "text-yellow-400 fill-yellow-400 opacity-50" : "text-gray-300"}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Link to={`/products/${product.slug}`}>
          <img src={isHovered ? hoverImage : primaryImage} alt={product.name} className="w-full h-full object-cover transition-all duration-500 ease-out" loading="lazy" />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2 z-10">
          {(showSaleBadge || discount > 0) && <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">-{discount}% OFF</span>}
          {showNewBadge && <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">NEW</span>}
          {product.featured && !showNewBadge && !showSaleBadge && <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">FEATURED</span>}
          {!isServiceBased && stockStatus === "low-stock" && <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg animate-pulse">Only {stockQuantity} left!</span>}
          {isServiceBased && duration && (
            <span className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {duration}
            </span>
          )}
          {isBakeryStore && !isServiceBased && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Fresh Daily
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button onClick={handleWishlist} className={`absolute top-3 right-3 z-10 p-2.5 rounded-full shadow-lg transition-all duration-300 ${isWishlisted ? "bg-red-500 text-white scale-110" : "bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500"}`}>
          <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Quick View Overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-3 transition-all duration-300 ${isHovered ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <Link to={`/products/${product.slug}`} className="p-3 bg-white rounded-full text-gray-700 hover:bg-gray-100 hover:scale-110 transition-all shadow-lg" title="View Details">
            <Eye className="w-5 h-5" />
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={stockStatus === "out-of-stock" || isAddingToCart}
            className={`p-3 rounded-full shadow-lg transition-all hover:scale-110 ${isAddingToCart ? "bg-green-500 text-white" : "bg-white text-gray-700 hover:bg-primary-600 hover:text-white"} disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isBakeryStore ? "Customize & Order" : terminology?.addToCart || "Add to Cart"}
          >
            {isAddingToCart ? <Check className="w-5 h-5" /> : isBakeryStore ? <Cake className="w-5 h-5" /> : isServiceBased ? <Calendar className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <Link to={`/products?category=${product.category.slug || product.category}`} className="text-xs text-primary-600 font-medium hover:text-primary-700 uppercase tracking-wide">
            {product.category.name || product.category}
          </Link>
        )}

        {/* Name */}
        <Link to={`/products/${product.slug}`}>
          <h3 className="mt-1.5 text-sm font-semibold text-gray-900 hover:text-primary-600 line-clamp-2 min-h-[2.5rem] transition-colors">{product.name}</h3>
        </Link>

        {/* Rating */}
        <div className="mt-2 flex items-center space-x-2">
          {renderStars(rating)}
          <span className="text-xs text-gray-500">({reviewCount > 0 ? reviewCount.toLocaleString() : "No"} reviews)</span>
        </div>

        {/* Price */}
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-xl font-bold text-gray-900">${currentPrice.toFixed(2)}</span>
          {originalPrice > currentPrice && <span className="text-sm text-gray-400 line-through">${originalPrice.toFixed(2)}</span>}
          {discount > 0 && <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Save ${(originalPrice - currentPrice).toFixed(2)}</span>}
        </div>

        {/* Stock/Availability & Shipping */}
        <div className="mt-3 space-y-1.5">
          {isServiceBased ? (
            // Service-based: Show availability
            <span className="flex items-center text-xs text-green-600 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              {terminology?.inStock || "Available"}
            </span>
          ) : stockStatus === "out-of-stock" ? (
            <span className="flex items-center text-xs text-red-500 font-medium">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              {terminology?.outOfStock || "Out of Stock"}
            </span>
          ) : stockStatus === "low-stock" ? (
            <span className="flex items-center text-xs text-amber-600 font-medium">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></span>
              Only {stockQuantity} left in stock
            </span>
          ) : (
            <span className="flex items-center text-xs text-green-600 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              {terminology?.inStock || "In Stock"}
            </span>
          )}
          {!isServiceBased && currentPrice >= 50 && (
            <span className="flex items-center text-xs text-blue-600">
              <Truck className="w-3.5 h-3.5 mr-1.5" />
              Free Shipping
            </span>
          )}
        </div>

        {/* Add to Cart / Book Button */}
        <button
          onClick={handleAddToCart}
          disabled={stockStatus === "out-of-stock" || isAddingToCart}
          className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
            isAddingToCart
              ? "bg-green-500 text-white"
              : stockStatus === "out-of-stock"
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : isBakeryStore
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 hover:shadow-lg"
                  : "bg-gray-900 text-white hover:bg-primary-600 hover:shadow-lg"
          }`}
        >
          {isAddingToCart ? (
            <>
              <Check className="w-4 h-4" />
              <span>{isServiceBased ? "Added!" : "Added!"}</span>
            </>
          ) : stockStatus === "out-of-stock" ? (
            <span>{terminology?.outOfStock || "Out of Stock"}</span>
          ) : (
            <>
              {isBakeryStore ? <Cake className="w-4 h-4" /> : isServiceBased ? <Calendar className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              <span>{isBakeryStore ? "Customize & Order" : terminology?.addToCart || "Add to Cart"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
