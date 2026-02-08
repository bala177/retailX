import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "../context/StoreContext";
import { productsAPI, categoriesAPI } from "../services/api";
import ProductCard from "../components/ProductCard";
import ContactSection from "../components/ContactSection";
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, ChevronRight, Star, TrendingUp, Sparkles, Tag, Clock, Award, Heart, Zap, Gift, ShoppingBag, Play, Percent, Calendar, BadgeCheck, Sparkle, ThumbsUp } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const { store, storeSlug } = useStore();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 59, seconds: 59 });
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch featured products
  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ["featured-products", storeSlug],
    queryFn: productsAPI.getFeatured,
    enabled: !!storeSlug,
  });

  // Fetch new arrivals
  const { data: newArrivalsData } = useQuery({
    queryKey: ["new-arrivals", storeSlug],
    queryFn: productsAPI.getNewArrivals,
    enabled: !!storeSlug,
  });

  // Fetch on-sale products
  const { data: onSaleData } = useQuery({
    queryKey: ["on-sale", storeSlug],
    queryFn: productsAPI.getOnSale,
    enabled: !!storeSlug,
  });

  // Fetch bestsellers
  const { data: bestsellersData } = useQuery({
    queryKey: ["bestsellers", storeSlug],
    queryFn: productsAPI.getBestsellers,
    enabled: !!storeSlug,
  });

  // Fetch all products for latest
  const { data: latestData } = useQuery({
    queryKey: ["latest-products", storeSlug],
    queryFn: () => productsAPI.getAll({ limit: 12, sort: "-createdAt" }),
    enabled: !!storeSlug,
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories", storeSlug],
    queryFn: categoriesAPI.getAll,
    enabled: !!storeSlug,
  });

  const featuredProducts = featuredData?.data?.data?.products || [];
  const newArrivals = newArrivalsData?.data?.data?.products || [];
  const onSaleProducts = onSaleData?.data?.data?.products || [];
  const bestsellers = bestsellersData?.data?.data?.products || [];
  const latestProducts = latestData?.data?.data?.products || [];
  const categories = categoriesData?.data?.data?.categories || [];

  // Category images mapping for different store types
  const categoryImages = {
    // Tech/Electronics
    smartphones: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
    phones: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
    laptops: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",
    computers: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",
    accessories: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    gaming: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&q=80",
    audio: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
    headphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
    tablets: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80",
    wearables: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    cameras: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80",

    // Fashion
    clothing: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=80",
    men: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=400&q=80",
    women: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80",
    shoes: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    bags: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80",
    jewelry: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80",
    watches: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80",

    // Grocery
    fruits: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&q=80",
    vegetables: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80",
    dairy: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80",
    bakery: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
    beverages: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&q=80",
    snacks: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&q=80",

    // Beauty
    skincare: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80",
    makeup: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80",
    haircare: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400&q=80",
    fragrance: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80",

    // Hair Salon
    haircuts: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80",
    cutting: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80",
    coloring: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80",
    styling: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&q=80",
    treatments: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&q=80",
    bridal: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80",

    // Massage & Spa
    massage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80",
    relaxation: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80",
    therapeutic: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400&q=80",
    body: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&q=80",
    facial: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80",
    specialty: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80",
    aromatherapy: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80",

    // Podologie / Foot Care
    foot: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=400&q=80",
    feet: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=400&q=80",
    pedicure: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&q=80",
    nail: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80",
    diabetic: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80",
    medical: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80",
    orthotic: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80",
    podiatry: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=400&q=80",
    wellness: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80",
    therapy: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&q=80",

    // Default
    default: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&q=80",
  };

  // Get category image based on slug or name
  const getCategoryImage = (category) => {
    if (category.image) return category.image;
    const slug = (category.slug || category.name || "").toLowerCase();
    for (const [key, url] of Object.entries(categoryImages)) {
      if (slug.includes(key)) return url;
    }
    return categoryImages.default;
  };

  // Handle hero search
  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Store-specific background images based on industry/type
  const storeBackgrounds = {
    fashion: {
      bg: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80",
      product: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80",
      gradient: "from-slate-900 via-purple-900 to-slate-900",
      accent: "#818cf8",
    },
    electronics: {
      bg: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80",
      product: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
      gradient: "from-slate-900 via-blue-900 to-slate-900",
      accent: "#60a5fa",
    },
    grocery: {
      bg: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&q=80",
      product: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&q=80",
      gradient: "from-green-900 via-emerald-900 to-teal-900",
      accent: "#34d399",
    },
    cosmetics: {
      bg: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1920&q=80",
      product: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80",
      gradient: "from-pink-900 via-rose-900 to-purple-900",
      accent: "#f472b6",
    },
    // Hair Salon theme
    hairsalon: {
      bg: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80",
      product: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
      gradient: "from-rose-900 via-pink-800 to-fuchsia-900",
      accent: "#ec4899",
    },
    // Massage Spa theme
    spa: {
      bg: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1920&q=80",
      product: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&q=80",
      gradient: "from-teal-900 via-cyan-800 to-emerald-900",
      accent: "#14b8a6",
    },
    // Podologie / Foot Care theme
    podologie: {
      bg: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=1920&q=80",
      product: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80",
      gradient: "from-blue-900 via-indigo-800 to-violet-900",
      accent: "#6366f1",
    },
    default: {
      bg: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80",
      product: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
      gradient: "from-slate-900 via-purple-900 to-slate-900",
      accent: "#818cf8",
    },
  };

  // Get store theme based on store slug or industry
  const getStoreTheme = () => {
    const slug = storeSlug || "";
    if (slug.includes("fashion") || slug.includes("urban")) return storeBackgrounds.fashion;
    if (slug.includes("tech") || slug.includes("electron")) return storeBackgrounds.electronics;
    if (slug.includes("fresh") || slug.includes("mart") || slug.includes("grocery")) return storeBackgrounds.grocery;
    if (slug.includes("beauty") || slug.includes("glow") || slug.includes("cosmetic")) return storeBackgrounds.cosmetics;
    // Wellness / Service businesses
    if (slug.includes("hair") || slug.includes("glamour") || slug.includes("salon")) return storeBackgrounds.hairsalon;
    if (slug.includes("spa") || slug.includes("massage") || slug.includes("tranquil")) return storeBackgrounds.spa;
    if (slug.includes("feet") || slug.includes("foot") || slug.includes("podolog")) return storeBackgrounds.podologie;
    return storeBackgrounds.default;
  };

  const storeTheme = getStoreTheme();

  // Check if this is a service-based business (spa, salon, wellness, etc.)
  const isServiceBusiness = () => {
    const slug = storeSlug || "";
    return (
      slug.includes("spa") ||
      slug.includes("massage") ||
      slug.includes("tranquil") ||
      slug.includes("hair") ||
      slug.includes("glamour") ||
      slug.includes("salon") ||
      slug.includes("feet") ||
      slug.includes("foot") ||
      slug.includes("podolog") ||
      slug.includes("wellness") ||
      slug.includes("beauty") ||
      slug.includes("therapy")
    );
  };

  // Get dynamic product images from actual products
  const getFeaturedProductImage = (index) => {
    const allProducts = [...featuredProducts, ...bestsellers, ...latestProducts];
    if (allProducts.length > index && allProducts[index]?.primaryImage) {
      return allProducts[index].primaryImage;
    }
    if (allProducts.length > index && allProducts[index]?.images?.[0]?.url) {
      return allProducts[index].images[0].url;
    }
    return null;
  };

  // Dynamic hero slides based on store and actual products - uses store theme for all slides
  const heroSlides = [
    {
      title: `${store?.name || "Premium Store"}`,
      highlight: "Discover Our Services",
      subtitle: store?.description || "Discover our professional services and premium quality products.",
      cta: "Browse Services",
      ctaLink: "/products",
      secondaryCta: "View Categories",
      secondaryCtaLink: "/products",
      badge: "✨ Welcome",
      bgGradient: storeTheme.gradient,
      accentColor: store?.branding?.primaryColor || storeTheme.accent,
      image: storeTheme.bg,
      productImage: getFeaturedProductImage(0) || storeTheme.product,
    },
    {
      title: onSaleProducts.length > 0 ? "Special Offers" : "Popular Services",
      highlight: onSaleProducts.length > 0 ? "Limited Time Deals" : "Customer Favorites",
      subtitle: onSaleProducts.length > 0 ? "Don't miss out on these amazing deals. Limited time offers!" : "Discover what our customers love the most.",
      cta: onSaleProducts.length > 0 ? "View Offers" : "View Popular",
      ctaLink: onSaleProducts.length > 0 ? "/products?sale=true" : "/products?sort=-ratings.count",
      secondaryCta: "View All",
      secondaryCtaLink: "/products",
      badge: onSaleProducts.length > 0 ? "🔥 Limited Time" : "⭐ Top Rated",
      bgGradient: storeTheme.gradient,
      accentColor: storeTheme.accent,
      image: storeTheme.bg,
      productImage: getFeaturedProductImage(1) || onSaleProducts[0]?.primaryImage || onSaleProducts[0]?.images?.[0]?.url || storeTheme.product,
    },
    {
      title: "New Arrivals",
      highlight: "Fresh & Exclusive",
      subtitle: `${newArrivals.length > 0 ? newArrivals.length + " new services" : "Latest additions"} just added. Be the first to discover our newest offerings.`,
      cta: "Explore New",
      ctaLink: "/products?sort=-createdAt",
      secondaryCta: "See What's New",
      secondaryCtaLink: "/products?sort=-createdAt",
      badge: "🆕 Just Added",
      bgGradient: storeTheme.gradient,
      accentColor: storeTheme.accent,
      image: storeTheme.bg,
      productImage: getFeaturedProductImage(2) || newArrivals[0]?.primaryImage || newArrivals[0]?.images?.[0]?.url || storeTheme.product,
    },
  ];

  // Auto-rotate hero
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Features based on business type
  const retailFeatures = [
    { icon: Truck, title: "Free Shipping", desc: "On orders over $50", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: Shield, title: "Secure Payment", desc: "100% protected", color: "text-green-600", bg: "bg-green-50" },
    { icon: RefreshCw, title: "Easy Returns", desc: "30-day policy", color: "text-purple-600", bg: "bg-purple-50" },
    { icon: Headphones, title: "24/7 Support", desc: "Always here to help", color: "text-orange-600", bg: "bg-orange-50" },
  ];

  const serviceFeatures = [
    { icon: Calendar, title: "Easy Booking", desc: "Book online anytime", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: BadgeCheck, title: "Certified Experts", desc: "Licensed professionals", color: "text-green-600", bg: "bg-green-50" },
    { icon: Sparkle, title: "Premium Quality", desc: "Top-grade products", color: "text-purple-600", bg: "bg-purple-50" },
    { icon: ThumbsUp, title: "Satisfaction", desc: "100% guaranteed", color: "text-orange-600", bg: "bg-orange-50" },
  ];

  const features = isServiceBusiness() ? serviceFeatures : retailFeatures;

  const brandColors = {
    primary: store?.branding?.primaryColor || "#6366f1",
    secondary: store?.branding?.secondaryColor || "#4f46e5",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Carousel - Improved Design */}
      <section className="relative h-[650px] md:h-[700px] lg:h-[750px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div key={index} className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}>
            {/* Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.bgGradient}`} />
            <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${slide.image})` }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse" style={{ backgroundColor: slide.accentColor }} />
              <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse" style={{ backgroundColor: slide.accentColor, animationDelay: "1s" }} />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-center">
                {/* Content Side */}
                <div className="text-white pt-16 lg:pt-0">
                  {/* Badge */}
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-md border border-white/20" style={{ backgroundColor: `${slide.accentColor}30` }}>
                    {slide.badge}
                  </span>

                  {/* Highlight Text */}
                  <p className="text-lg md:text-xl font-bold tracking-wide mb-2" style={{ color: slide.accentColor }}>
                    {slide.highlight}
                  </p>

                  {/* Main Title */}
                  <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight">{slide.title}</h1>

                  {/* Subtitle */}
                  <p className="mt-6 text-lg md:text-xl text-white/80 leading-relaxed max-w-lg">{slide.subtitle}</p>

                  {/* Search Bar */}
                  <form onSubmit={handleHeroSearch} className="mt-8 max-w-md">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for products..."
                        className="w-full pl-5 pr-14 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all"
                      />
                      <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full text-white transition-all hover:scale-110" style={{ backgroundColor: slide.accentColor }}>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </form>

                  {/* CTA Buttons */}
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <Link to={slide.ctaLink} className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transform hover:scale-105 transition-all shadow-2xl group">
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      {slide.cta}
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to={slide.secondaryCtaLink} className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/50 text-white font-bold rounded-full hover:bg-white/10 backdrop-blur-sm transition-all">
                      <Play className="w-5 h-5 mr-2" />
                      {slide.secondaryCta}
                    </Link>
                  </div>

                  {/* Stats */}
                  <div className="mt-10 flex items-center gap-8">
                    <div>
                      <p className="text-3xl font-bold">500+</p>
                      <p className="text-white/60 text-sm">Products</p>
                    </div>
                    <div className="w-px h-12 bg-white/20" />
                    <div>
                      <p className="text-3xl font-bold">50k+</p>
                      <p className="text-white/60 text-sm">Happy Customers</p>
                    </div>
                    <div className="w-px h-12 bg-white/20" />
                    <div>
                      <p className="text-3xl font-bold">4.9</p>
                      <p className="text-white/60 text-sm flex items-center">
                        Rating <Star className="w-3 h-3 ml-1 fill-yellow-400 text-yellow-400" />
                      </p>
                    </div>
                  </div>
                </div>

                {/* Product Image Side */}
                <div className="hidden lg:flex items-center justify-center relative">
                  {/* Floating Product Image */}
                  <div className="relative">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 rounded-full blur-3xl opacity-40 scale-75" style={{ backgroundColor: slide.accentColor }} />
                    {/* Product Image Container */}
                    <div className="relative w-80 h-80 xl:w-96 xl:h-96 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl animate-float">
                      <img src={slide.productImage} alt="Featured Product" className="w-full h-full object-cover" />
                    </div>
                    {/* Floating Badge */}
                    <div className="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-3 shadow-xl">
                      <div className="flex items-center gap-2">
                        <Percent className="w-5 h-5" style={{ color: slide.accentColor }} />
                        <span className="font-bold text-gray-900">Save 20%</span>
                      </div>
                    </div>
                    {/* Rating Badge */}
                    <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-3 shadow-xl">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="font-bold text-gray-900 text-sm">4.9</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {heroSlides.map((_, index) => (
            <button key={index} onClick={() => setCurrentSlide(index)} className={`h-3 rounded-full transition-all duration-300 ${index === currentSlide ? "bg-white w-12 shadow-lg" : "bg-white/40 w-3 hover:bg-white/60"}`} />
          ))}
        </div>

        {/* Slide Navigation */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white transition-all z-20 hover:scale-110"
        >
          <ChevronRight className="w-6 h-6 rotate-180" />
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white transition-all z-20 hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </section>

      {/* Floating Animation Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Features Bar */}
      <section className="bg-white shadow-sm border-b border-gray-100 relative -mt-8 mx-4 lg:mx-auto lg:max-w-6xl rounded-2xl z-30">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className={`flex-shrink-0 w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale Banner */}
      {onSaleProducts.length > 0 && (
        <section className="py-6 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between text-white shadow-lg">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="p-3 bg-white/20 rounded-full animate-pulse">
                  <Zap className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold">Flash Sale!</h3>
                  <p className="text-white/90 text-sm">Grab the best deals before they're gone</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-center min-w-[60px]">
                    <span className="text-2xl font-bold">{String(countdown.hours).padStart(2, "0")}</span>
                    <p className="text-xs text-white/80">Hours</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-center min-w-[60px]">
                    <span className="text-2xl font-bold">{String(countdown.minutes).padStart(2, "0")}</span>
                    <p className="text-xs text-white/80">Mins</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-center min-w-[60px]">
                    <span className="text-2xl font-bold">{String(countdown.seconds).padStart(2, "0")}</span>
                    <p className="text-xs text-white/80">Secs</p>
                  </div>
                </div>
                <Link to="/products?sale=true" className="bg-white text-red-600 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors flex items-center">
                  Shop Now <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories Grid */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Shop by Category</h2>
                <p className="mt-2 text-gray-600">Browse our curated collections</p>
              </div>
              <Link to="/products" className="hidden md:flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                View All Categories
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.slice(0, 5).map((category, index) => (
                <Link key={category._id || category.id} to={`/products?category=${category.slug}`} className="group relative overflow-hidden rounded-2xl aspect-square shadow-sm hover:shadow-xl transition-all duration-300">
                  <img src={getCategoryImage(category)} alt={category.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-sm md:text-base truncate">{category.name}</h3>
                    <span className="text-white/80 text-xs flex items-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore <ChevronRight className="w-3 h-3 ml-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100">
                  <Sparkles className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
                  <p className="text-gray-500">Handpicked items you'll love</p>
                </div>
              </div>
              <Link to="/products?featured=true" className="hidden md:flex items-center px-5 py-2.5 rounded-full text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promotional Banner */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
              />
            </div>
            <div className="relative px-8 py-16 md:py-20 md:px-16 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
                  <Gift className="w-4 h-4" />
                  <span>Exclusive Offer</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">Get 20% Off Your First Order</h2>
                <p className="text-white/90 text-lg max-w-lg">Sign up for our newsletter and receive exclusive discounts, early access to sales, and personalized recommendations.</p>
              </div>
              <div className="w-full lg:w-auto">
                <div className="flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-sm p-2 rounded-2xl">
                  <input type="email" placeholder="Enter your email" className="px-6 py-4 rounded-xl text-gray-900 w-full sm:w-72 focus:ring-2 focus:ring-white/50 outline-none" />
                  <button className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap">Subscribe Now</button>
                </div>
                <p className="text-white/70 text-xs text-center mt-3">By subscribing, you agree to our Privacy Policy and Terms of Service</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hot Deals Section */}
      {onSaleProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-red-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-red-100">
                  <Tag className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Hot Deals</h2>
                  <p className="text-gray-500">Save big on these amazing offers</p>
                </div>
              </div>
              <Link to="/products?sale=true" className="hidden md:flex items-center px-5 py-2.5 rounded-full text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors">
                View All Deals
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {onSaleProducts.slice(0, 4).map((product) => (
                <ProductCard key={product._id || product.id} product={product} showSaleBadge />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {(newArrivals.length > 0 || latestProducts.length > 0) && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-blue-100">
                  <Clock className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">New Arrivals</h2>
                  <p className="text-gray-500">Fresh products just landed</p>
                </div>
              </div>
              <Link to="/products?sort=-createdAt" className="hidden md:flex items-center px-5 py-2.5 rounded-full text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                View All New
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(newArrivals.length > 0 ? newArrivals : latestProducts).slice(0, 8).map((product) => (
                <ProductCard key={product._id || product.id} product={product} showNewBadge />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bestsellers/Trending */}
      {(bestsellers.length > 0 || latestProducts.length > 0) && (
        <section className="py-16 bg-gradient-to-b from-amber-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-amber-100">
                  <TrendingUp className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Trending Now</h2>
                  <p className="text-gray-500">Most popular with our customers</p>
                </div>
              </div>
              <Link to="/products?sort=-ratings.count" className="hidden md:flex items-center px-5 py-2.5 rounded-full text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors">
                View All Trending
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(bestsellers.length > 0 ? bestsellers : latestProducts).slice(0, 8).map((product, index) => (
                <div key={product._id || product.id} className="relative">
                  {index < 3 && <div className="absolute -top-2 -left-2 z-10 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg">#{index + 1}</div>}
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Why Shop With Us?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We're committed to providing you with the best shopping experience possible</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-100 flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Premium Quality</h3>
              <p className="text-gray-600">All our products are carefully selected to ensure the highest quality standards and customer satisfaction.</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-yellow-100 flex items-center justify-center mb-6">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Reviews</h3>
              <p className="text-gray-600">Read genuine reviews from thousands of satisfied customers to make informed purchase decisions.</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">100% Satisfaction</h3>
              <p className="text-gray-600">Our dedicated support team ensures your complete satisfaction with every order you place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection />

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">Browse our services and products. Book your appointment today!</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/products" className="inline-flex items-center px-10 py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-xl">
              Explore All Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/select-store" className="inline-flex items-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-colors">
              <ShoppingBag className="mr-2 w-5 h-5" />
              Browse Other Stores
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
