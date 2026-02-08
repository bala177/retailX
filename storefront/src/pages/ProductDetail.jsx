import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "../context/StoreContext";
import { useCart } from "../context/CartContext";
import { productsAPI } from "../services/api";
import ProductCard from "../components/ProductCard";
import ServiceCard from "../components/ServiceCard";
import BookingModal from "../components/BookingModal";
import { Minus, Plus, ShoppingCart, Heart, Share2, Truck, Shield, RefreshCw, ChevronRight, Star, Check, Home, ZoomIn, X, ChevronLeft, Package, Award, Clock, ThumbsUp, MessageSquare, Copy, Facebook, Twitter, Mail, Calendar, BadgeCheck, Sparkles } from "lucide-react";

export default function ProductDetail() {
  const { slug } = useParams();
  const { storeSlug, store, isServiceBased, terminology } = useStore();
  const { addItem } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 });
  const [showZoomLens, setShowZoomLens] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [zoomBoxPosition, setZoomBoxPosition] = useState({ x: 0, y: 0 });
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRelatedService, setSelectedRelatedService] = useState(null);

  // Fetch product
  const {
    data: productData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => productsAPI.getBySlug(slug),
    enabled: !!slug,
  });

  // Fetch related products
  const { data: relatedData } = useQuery({
    queryKey: ["related-products", productData?.data?.data?.product?.category?._id],
    queryFn: () =>
      productsAPI.getAll({
        category: productData?.data?.data?.product?.category?.slug,
        limit: 8,
      }),
    enabled: !!productData?.data?.data?.product?.category,
  });

  const product = productData?.data?.data?.product;
  const relatedProducts = relatedData?.data?.data?.products?.filter((p) => p._id !== product?._id) || [];

  // Reset state when product changes
  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setActiveTab("description");
    setAddedToCart(false);
  }, [slug]);

  const brandColors = {
    primary: store?.branding?.primaryColor || "#6366f1",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-4 w-48 bg-gray-200 rounded mb-8" />
            <div className="bg-white rounded-2xl p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-200 rounded-xl" />
                  <div className="flex space-x-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg" />
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-6 w-24 bg-gray-200 rounded" />
                  <div className="h-8 w-3/4 bg-gray-200 rounded" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-10 w-40 bg-gray-200 rounded" />
                  <div className="h-20 bg-gray-200 rounded" />
                  <div className="h-12 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-12 shadow-sm max-w-md">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/products" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [{ url: product.primaryImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600" }];

  // Get prices from product schema
  const currentPrice = product.pricing?.salePrice || product.pricing?.basePrice || product.currentPrice || 0;
  const originalPrice = product.pricing?.basePrice || product.originalPrice || currentPrice;
  const discount = originalPrice > currentPrice ? Math.round((1 - currentPrice / originalPrice) * 100) : 0;

  // Get stock status
  const stockQuantity = product.inventory?.quantity ?? product.stock ?? 100;
  const stockStatus = stockQuantity === 0 ? "out-of-stock" : stockQuantity < 10 ? "low-stock" : "in-stock";

  // Get rating info
  const rating = product.ratings?.average || product.rating || 4.5;
  const reviewCount = product.ratings?.count || product.reviewCount || 0;
  const sku = product.inventory?.sku || product.sku || "N/A";

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, stockQuantity || 99)));
  };

  const handleImageMouseMove = (e) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate percentage for background position
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    setImagePosition({ x: xPercent, y: yPercent });

    // Lens size (square magnifier) - centered on cursor
    const lensSize = 220;
    const halfLens = lensSize / 2;

    // Position lens centered on cursor
    setLensPosition({ x: x - halfLens, y: y - halfLens });

    // Calculate zoom box background position
    const bgX = (x / rect.width) * 100;
    const bgY = (y / rect.height) * 100;
    setZoomBoxPosition({ x: bgX, y: bgY });
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = product.name;

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
      copy: url,
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    } else {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
    setShowShareMenu(false);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : i < rating ? "text-yellow-400 fill-yellow-400 opacity-50" : "text-gray-300"}`} />
        ))}
      </div>
    );
  };

  // Generate fake reviews for demo
  const fakeReviews = isServiceBased
    ? [
        { name: "John D.", rating: 5, date: "2 days ago", comment: "Excellent service! Very professional and relaxing experience. Highly recommended.", helpful: 12 },
        { name: "Sarah M.", rating: 4, date: "1 week ago", comment: "Very good session. The therapist was skilled and attentive. Will definitely book again.", helpful: 8 },
        { name: "Mike R.", rating: 5, date: "2 weeks ago", comment: "Amazing experience. Best service I've had. Worth every penny!", helpful: 15 },
        { name: "Emily L.", rating: 5, date: "3 weeks ago", comment: "Love it! Perfect for relaxation. The ambiance was wonderful too.", helpful: 6 },
      ]
    : [
        { name: "John D.", rating: 5, date: "2 days ago", comment: "Excellent product! Exactly as described. Fast shipping and great quality.", helpful: 12 },
        { name: "Sarah M.", rating: 4, date: "1 week ago", comment: "Very good quality. Would recommend to others. Only minor issue was the packaging.", helpful: 8 },
        { name: "Mike R.", rating: 5, date: "2 weeks ago", comment: "Amazing value for money. This exceeded my expectations in every way.", helpful: 15 },
        { name: "Emily L.", rating: 5, date: "3 weeks ago", comment: "Love it! Perfect for what I needed. Will definitely buy again.", helpful: 6 },
      ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <Link to="/products" className="text-gray-500 hover:text-gray-700">
              Products
            </Link>
            {product.category && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-300" />
                <Link to={`/products?category=${product.category.slug}`} className="text-gray-500 hover:text-gray-700">
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Images Section */}
            <div className="p-6 lg:p-8 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-100">
              {/* Main Image with Magnifying Lens */}
              <div
                className="relative aspect-square rounded-2xl overflow-hidden bg-white cursor-none lg:cursor-none cursor-zoom-in group"
                onClick={() => setIsZoomed(true)}
                onMouseMove={handleImageMouseMove}
                onMouseEnter={() => setShowZoomLens(true)}
                onMouseLeave={() => {
                  setShowZoomLens(false);
                  setImagePosition({ x: 50, y: 50 });
                }}
              >
                {/* Base Image - Always visible */}
                <img src={images[selectedImage]?.url} alt={product.name} className="w-full h-full object-contain pointer-events-none select-none" draggable="false" />

                {/* Magnifying Lens - Square with rounded corners */}
                {showZoomLens && (
                  <div
                    className="absolute w-[220px] h-[220px] rounded-xl pointer-events-none z-20 hidden lg:block"
                    style={{
                      left: `${lensPosition.x}px`,
                      top: `${lensPosition.y}px`,
                      boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.4), 0 8px 32px rgba(0,0,0,0.2)",
                      background: `url(${images[selectedImage]?.url}) no-repeat`,
                      backgroundSize: "400%",
                      backgroundPosition: `${zoomBoxPosition.x}% ${zoomBoxPosition.y}%`,
                    }}
                  >
                    {/* Crosshair in center of lens */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-[1px] h-6 bg-indigo-500/30 absolute" />
                      <div className="h-[1px] w-6 bg-indigo-500/30 absolute" />
                    </div>
                    {/* Corner accents */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-indigo-400/50 rounded-tl" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-indigo-400/50 rounded-tr" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-indigo-400/50 rounded-bl" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-indigo-400/50 rounded-br" />
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2 z-10">
                  {discount > 0 && <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">-{discount}% OFF</span>}
                  {product.featured && <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">FEATURED</span>}
                </div>

                {/* Zoom Hint */}
                <div className={`absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm flex items-center space-x-2 transition-opacity duration-200 ${showZoomLens ? "opacity-0" : "opacity-100"}`}>
                  <ZoomIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Hover to magnify</span>
                </div>

                {/* Magnification indicator when lens is active */}
                {showZoomLens && (
                  <div className="absolute bottom-4 left-4 bg-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-medium hidden lg:flex items-center space-x-1.5 z-10">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>5x Zoom</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex space-x-3 mt-4 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button key={index} onClick={() => setSelectedImage(index)} className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === index ? "border-indigo-500 shadow-lg scale-105" : "border-gray-200 hover:border-gray-300"}`}>
                      <img src={img.url} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6 lg:p-8 space-y-6">
              {/* Category & Brand */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {product.category && (
                    <Link to={`/products?category=${product.category.slug}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                      {product.category.name}
                    </Link>
                  )}
                  {product.brand && (
                    <span className="text-sm text-gray-500">
                      by <span className="font-medium">{product.brand}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => setIsWishlisted(!isWishlisted)} className={`p-2 rounded-full transition-all ${isWishlisted ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                    <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                  </button>
                  <div className="relative">
                    <button onClick={() => setShowShareMenu(!showShareMenu)} className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                    {showShareMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowShareMenu(false)} />
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                          <button onClick={() => handleShare("facebook")} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Facebook className="w-4 h-4 text-blue-600" />
                            <span>Facebook</span>
                          </button>
                          <button onClick={() => handleShare("twitter")} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Twitter className="w-4 h-4 text-sky-500" />
                            <span>Twitter</span>
                          </button>
                          <button onClick={() => handleShare("email")} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Mail className="w-4 h-4 text-gray-600" />
                            <span>Email</span>
                          </button>
                          <button onClick={() => handleShare("copy")} className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            <Copy className="w-4 h-4 text-gray-600" />
                            <span>Copy Link</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {renderStars(rating)}
                  <span className="text-lg font-semibold text-gray-900">{rating.toFixed(1)}</span>
                </div>
                <span className="text-gray-300">|</span>
                <button onClick={() => setActiveTab("reviews")} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  {reviewCount} Reviews
                </button>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500">{Math.floor(Math.random() * 500) + 100} sold</span>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5">
                <div className="flex items-baseline space-x-3">
                  <span className="text-4xl font-bold text-gray-900">${currentPrice.toFixed(2)}</span>
                  {discount > 0 && (
                    <>
                      <span className="text-xl text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
                      <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold animate-pulse">Save ${(originalPrice - currentPrice).toFixed(2)}</span>
                    </>
                  )}
                </div>
                {currentPrice >= 50 && !isServiceBased && (
                  <p className="mt-2 text-sm text-green-600 flex items-center">
                    <Truck className="w-4 h-4 mr-1" />
                    Free shipping on this item
                  </p>
                )}
              </div>

              {/* Short Description */}
              {product.shortDescription && <p className="text-gray-600 leading-relaxed">{product.shortDescription}</p>}

              {/* Stock Status */}
              <div className="flex items-center space-x-4">
                {stockStatus === "in-stock" && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="font-semibold">{isServiceBased ? "Available" : "In Stock"}</span>
                    {!isServiceBased && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 text-sm">Ships within 24 hours</span>
                      </>
                    )}
                  </div>
                )}
                {stockStatus === "low-stock" && (
                  <div className="flex items-center space-x-2 text-amber-600">
                    <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                    <span className="font-semibold">{isServiceBased ? "Limited Availability" : `Only ${stockQuantity} left!`}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm">{isServiceBased ? "Book soon" : "Order soon"}</span>
                  </div>
                )}
                {stockStatus === "out-of-stock" && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <span className="font-semibold">{isServiceBased ? "Fully Booked" : "Out of Stock"}</span>
                  </div>
                )}
              </div>

              {/* Quantity & Add to Cart */}
              {stockStatus !== "out-of-stock" && (
                <div className="space-y-4">
                  {!isServiceBased && (
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-700">Quantity:</span>
                      <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                        <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1} className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                          <Minus className="w-5 h-5" />
                        </button>
                        <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(parseInt(e.target.value) || 1, stockQuantity)))} className="w-16 text-center font-semibold text-lg border-none focus:ring-0" />
                        <button onClick={() => handleQuantityChange(1)} disabled={quantity >= stockQuantity} className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                      {stockStatus === "low-stock" && <span className="text-sm text-amber-600">Max: {stockQuantity}</span>}
                    </div>
                  )}

                  <div className="flex space-x-3">
                    {isServiceBased ? (
                      // Service-based: Show Book Now button
                      <>
                        <button onClick={() => setBookingModalOpen(true)} className="flex-1 flex items-center justify-center space-x-3 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] text-white hover:opacity-90" style={{ backgroundColor: brandColors.primary }}>
                          <Calendar className="w-6 h-6" />
                          <span>Book Now</span>
                        </button>
                        <button onClick={handleAddToCart} disabled={addedToCart} className={`px-6 py-4 border-2 rounded-xl font-semibold transition-colors ${addedToCart ? "bg-green-500 text-white border-green-500" : "border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"}`}>
                          {addedToCart ? <Check className="w-6 h-6" /> : <Heart className="w-6 h-6" />}
                        </button>
                      </>
                    ) : (
                      // Retail: Show Add to Cart button
                      <>
                        <button
                          onClick={handleAddToCart}
                          disabled={addedToCart}
                          className={`flex-1 flex items-center justify-center space-x-3 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] ${addedToCart ? "bg-green-500 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
                        >
                          {addedToCart ? (
                            <>
                              <Check className="w-6 h-6" />
                              <span>Added to Cart!</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="w-6 h-6" />
                              <span>Add to Cart</span>
                            </>
                          )}
                        </button>
                        <button className="px-6 py-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors">Buy Now</button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {stockStatus === "out-of-stock" && (
                <div className="space-y-3">
                  <button className="w-full py-4 bg-gray-200 text-gray-500 font-semibold rounded-xl cursor-not-allowed" disabled>
                    Out of Stock
                  </button>
                  <button className="w-full py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors">Notify Me When Available</button>
                </div>
              )}

              {/* Trust Features - Different for services vs products */}
              <div className="border-t border-gray-100 pt-6 grid grid-cols-2 gap-4">
                {isServiceBased ? (
                  <>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Easy Booking</p>
                        <p className="text-xs text-gray-500">Book online anytime</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <BadgeCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Certified Experts</p>
                        <p className="text-xs text-gray-500">Licensed professionals</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Premium Quality</p>
                        <p className="text-xs text-gray-500">Top-grade products</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <ThumbsUp className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Satisfaction</p>
                        <p className="text-xs text-gray-500">100% guaranteed</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Truck className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Free Shipping</p>
                        <p className="text-xs text-gray-500">On orders over $50</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Secure Payment</p>
                        <p className="text-xs text-gray-500">100% protected</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Easy Returns</p>
                        <p className="text-xs text-gray-500">30-day policy</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Quality Guarantee</p>
                        <p className="text-xs text-gray-500">Verified products</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* SKU & Tags */}
              <div className="text-sm text-gray-500 space-y-2 border-t border-gray-100 pt-4">
                <p>
                  <span className="font-medium">SKU:</span> {sku}
                </p>
                {product.tags?.length > 0 && (
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-medium">Tags:</span>
                    {product.tags.map((tag) => (
                      <Link key={tag} to={`/products?search=${tag}`} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs transition-colors">
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-100">
            <div className="flex space-x-1 px-6 lg:px-8 pt-2 bg-gray-50 overflow-x-auto">
              {[
                { key: "description", label: "Description", icon: MessageSquare },
                { key: "specifications", label: "Specifications", icon: Package },
                { key: "reviews", label: `Reviews (${reviewCount || fakeReviews.length})`, icon: Star },
              ].map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center space-x-2 px-5 py-4 text-sm font-medium rounded-t-xl transition-all ${activeTab === tab.key ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"}`}>
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="p-6 lg:p-8 bg-white">
              {activeTab === "description" && (
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed text-lg">{product.description || `Experience excellence with the ${product.name}. This premium product combines quality craftsmanship with modern design to deliver outstanding performance and value.`}</p>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-2">{isServiceBased ? "Service Highlights" : "Key Features"}</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        {isServiceBased ? (
                          <>
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2" /> Professional certified experts
                            </li>
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2" /> Premium quality products used
                            </li>
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2" /> Relaxing ambiance
                            </li>
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2" /> Personalized experience
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2" /> Premium quality materials
                            </li>
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2" /> Modern and stylish design
                            </li>
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2" /> Durable construction
                            </li>
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2" /> Easy to use
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-2">{isServiceBased ? "What to Expect" : "What's Included"}</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        {isServiceBased ? (
                          <>
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2" /> Consultation with specialist
                            </li>
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2" /> {product.name} treatment
                            </li>
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2" /> Post-service care tips
                            </li>
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2" /> Follow-up recommendations
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2" /> 1x {product.name}
                            </li>
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2" /> User manual
                            </li>
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2" /> Original packaging
                            </li>
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2" /> Warranty card
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "specifications" && (
                <div className="space-y-4">
                  {product.specifications?.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <table className="w-full">
                        <tbody className="divide-y divide-gray-100">
                          {product.specifications.map((spec, index) => (
                            <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                              <td className="py-4 px-6 text-sm font-medium text-gray-700 w-1/3">{spec.key}</td>
                              <td className="py-4 px-6 text-sm text-gray-900">{spec.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <table className="w-full">
                        <tbody className="divide-y divide-gray-100">
                          <tr className="bg-gray-50">
                            <td className="py-4 px-6 text-sm font-medium text-gray-700 w-1/3">{isServiceBased ? "Service ID" : "SKU"}</td>
                            <td className="py-4 px-6 text-sm text-gray-900">{sku}</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="py-4 px-6 text-sm font-medium text-gray-700">Category</td>
                            <td className="py-4 px-6 text-sm text-gray-900">{product.category?.name || "N/A"}</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="py-4 px-6 text-sm font-medium text-gray-700">{isServiceBased ? "Provider" : "Brand"}</td>
                            <td className="py-4 px-6 text-sm text-gray-900">{product.brand || terminology.storeName}</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="py-4 px-6 text-sm font-medium text-gray-700">Availability</td>
                            <td className="py-4 px-6 text-sm text-gray-900">
                              {isServiceBased ? (stockStatus === "in-stock" ? "Available" : stockStatus === "low-stock" ? "Limited Availability" : "Fully Booked") : stockStatus === "in-stock" ? "In Stock" : stockStatus === "low-stock" ? `Only ${stockQuantity} left` : "Out of Stock"}
                            </td>
                          </tr>
                          {isServiceBased ? (
                            <>
                              <tr className="bg-gray-50">
                                <td className="py-4 px-6 text-sm font-medium text-gray-700">Duration</td>
                                <td className="py-4 px-6 text-sm text-gray-900">{product.duration || "Varies by service"}</td>
                              </tr>
                              <tr className="bg-white">
                                <td className="py-4 px-6 text-sm font-medium text-gray-700">Booking Policy</td>
                                <td className="py-4 px-6 text-sm text-gray-900">24-hour cancellation notice required</td>
                              </tr>
                            </>
                          ) : (
                            <>
                              <tr className="bg-gray-50">
                                <td className="py-4 px-6 text-sm font-medium text-gray-700">Shipping</td>
                                <td className="py-4 px-6 text-sm text-gray-900">Free shipping on orders over $50</td>
                              </tr>
                              <tr className="bg-white">
                                <td className="py-4 px-6 text-sm font-medium text-gray-700">Returns</td>
                                <td className="py-4 px-6 text-sm text-gray-900">30-day return policy</td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "reviews" && (
                <div className="space-y-8">
                  {/* Review Summary */}
                  <div className="flex flex-col md:flex-row gap-8 p-6 bg-gray-50 rounded-2xl">
                    <div className="text-center md:text-left">
                      <div className="text-5xl font-bold text-gray-900">{rating.toFixed(1)}</div>
                      <div className="mt-2">{renderStars(rating)}</div>
                      <p className="text-sm text-gray-500 mt-1">Based on {reviewCount || fakeReviews.length} reviews</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const percentage = stars === 5 ? 65 : stars === 4 ? 25 : stars === 3 ? 7 : stars === 2 ? 2 : 1;
                        return (
                          <div key={stars} className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600 w-8">{stars}★</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                            </div>
                            <span className="text-sm text-gray-500 w-10">{percentage}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Review List */}
                  <div className="space-y-6">
                    {fakeReviews.map((review, index) => (
                      <div key={index} className="border-b border-gray-100 pb-6 last:border-0">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">{review.name.charAt(0)}</div>
                            <div>
                              <p className="font-medium text-gray-900">{review.name}</p>
                              <div className="flex items-center space-x-2">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
                            <Check className="w-3 h-3 mr-1" />
                            Verified Purchase
                          </span>
                        </div>
                        <p className="mt-3 text-gray-600">{review.comment}</p>
                        <div className="mt-3 flex items-center space-x-4">
                          <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700">
                            <ThumbsUp className="w-4 h-4" />
                            <span>Helpful ({review.helpful})</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Write Review CTA */}
                  <div className="text-center py-6 bg-gray-50 rounded-xl">
                    <p className="text-gray-600 mb-3">Have you used this product?</p>
                    <button className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors">Write a Review</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
              <Link to={`/products?category=${product.category?.slug}`} className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct) =>
                isServiceBased ? (
                  <ServiceCard
                    key={relatedProduct._id || relatedProduct.id}
                    service={relatedProduct}
                    onBook={() => {
                      setSelectedRelatedService(relatedProduct);
                    }}
                  />
                ) : (
                  <ProductCard key={relatedProduct._id || relatedProduct.id} product={relatedProduct} />
                ),
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {isZoomed && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setIsZoomed(false)}>
          <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full" onClick={() => setIsZoomed(false)}>
            <X className="w-8 h-8" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
            }}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <img src={images[selectedImage]?.url} alt={product.name} className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 hover:bg-white/10 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage((prev) => (prev + 1) % images.length);
            }}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${selectedImage === index ? "bg-white w-6" : "bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal for main product */}
      {isServiceBased && <BookingModal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} service={product} />}

      {/* Booking Modal for related services */}
      {isServiceBased && selectedRelatedService && <BookingModal isOpen={!!selectedRelatedService} onClose={() => setSelectedRelatedService(null)} service={selectedRelatedService} />}
    </div>
  );
}
