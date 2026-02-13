import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "../context/StoreContext";
import { productsAPI, categoriesAPI, resolveImageUrl } from "../services/api";
import ProductCard from "../components/ProductCard";
import ContactSection from "../components/ContactSection";
import BakeryTrust from "../components/BakeryTrust";
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, ChevronRight, Star, TrendingUp, Sparkles, Tag, Clock, Award, Heart, Gift, ShoppingBag, Percent, Calendar, BadgeCheck, Sparkle, ThumbsUp, Search } from "lucide-react";
import React, { useState, useEffect } from "react";

export default function Home() {
  const { store, storeSlug } = useStore();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch featured products
  const { data: featuredData } = useQuery({
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

  // ========== STORE TYPE DETECTION ==========
  const isBakeryStore = () => {
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
  };

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

  const bakery = isBakeryStore();

  // ========== CATEGORY IMAGES ==========
  const categoryImages = {
    // Bakery / Cake / Sweet Shop
    cakes: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80",
    cake: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80",
    cupcakes: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400&q=80",
    cupcake: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400&q=80",
    pastries: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
    pastry: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
    bread: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80",
    breads: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&q=80",
    cookies: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80",
    cookie: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80",
    chocolate: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&q=80",
    chocolates: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&q=80",
    macarons: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400&q=80",
    macaron: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400&q=80",
    donuts: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80",
    donut: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80",
    desserts: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80",
    dessert: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80",
    wedding: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=400&q=80",
    birthday: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400&q=80",
    muffins: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80",
    muffin: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80",
    croissant: "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400&q=80",
    croissants: "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=400&q=80",
    tarts: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400&q=80",
    sweet: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80",
    sweets: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80",
    brownies: "https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400&q=80",
    beverages: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80",
    drinks: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80",
    coffee: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80",
    custom: "https://images.unsplash.com/photo-1562440499-64c9a111f713?w=400&q=80",
    default: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
  };

  const getCategoryImage = (category) => {
    if (category.image) return resolveImageUrl(category.image);
    const slug = (category.slug || category.name || "").toLowerCase();
    for (const [key, url] of Object.entries(categoryImages)) {
      if (slug.includes(key)) return url;
    }
    return categoryImages.default;
  };

  // ========== HERO SEARCH ==========
  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  // ========== STORE THEME ==========
  const storeBackgrounds = {
    bakery: {
      bg: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1920&q=80",
      product: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80",
      gradient: "from-amber-950 via-orange-950 to-rose-950",
      accent: "#d97706",
    },
    default: {
      bg: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1920&q=80",
      product: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80",
      gradient: "from-amber-950 via-orange-950 to-rose-950",
      accent: "#d97706",
    },
  };

  const getStoreTheme = () => {
    return storeBackgrounds.bakery;
  };

  const storeTheme = getStoreTheme();
  if (store?.branding?.heroBanner) storeTheme.bg = resolveImageUrl(store.branding.heroBanner);

  // ========== PRODUCT IMAGES FOR HERO ==========
  const getFeaturedProductImage = (index) => {
    const allProducts = [...featuredProducts, ...bestsellers, ...latestProducts];
    if (allProducts.length > index && allProducts[index]?.primaryImage) return resolveImageUrl(allProducts[index].primaryImage);
    if (allProducts.length > index && allProducts[index]?.images?.[0]?.url) return resolveImageUrl(allProducts[index].images[0].url);
    return null;
  };

  const bakeryHeroImages = ["https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80", "https://images.unsplash.com/photo-1486427944781-dbf259de1e55?w=600&q=80", "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80"];

  // ========== HERO SLIDES ==========
  const heroSlides = bakery
    ? [
        {
          title: store?.name || "Fresh Baked Goodness",
          highlight: "Handcrafted with Love",
          subtitle: store?.description || "Artisan cakes, pastries & desserts baked fresh daily with the finest ingredients.",
          cta: "Order Now",
          ctaLink: "/products",
          badge: "🧁 Freshly Baked",
          image: storeTheme.bg,
          productImage: getFeaturedProductImage(0) || bakeryHeroImages[0],
        },
        {
          title: onSaleProducts.length > 0 ? "Sweet Deals" : "Our Specialties",
          highlight: onSaleProducts.length > 0 ? "Limited Time Offers" : "Customer Favorites",
          subtitle: onSaleProducts.length > 0 ? "Don't miss our delicious deals — treat yourself today!" : "Discover our customers' most loved cakes and pastries.",
          cta: onSaleProducts.length > 0 ? "View Deals" : "View Favorites",
          ctaLink: onSaleProducts.length > 0 ? "/products?sale=true" : "/products?sort=-ratings.count",
          badge: onSaleProducts.length > 0 ? "🎂 Sweet Savings" : "⭐ Most Loved",
          image: storeTheme.bg,
          productImage: getFeaturedProductImage(1) || bakeryHeroImages[1],
        },
        {
          title: "Fresh Additions",
          highlight: "New This Week",
          subtitle: `${newArrivals.length > 0 ? newArrivals.length + " new treats" : "Fresh creations"} just added. Be the first to try them!`,
          cta: "See New Items",
          ctaLink: "/products?sort=-createdAt",
          badge: "🆕 Just Added",
          image: storeTheme.bg,
          productImage: getFeaturedProductImage(2) || bakeryHeroImages[2],
        },
      ]
    : [
        {
          title: store?.name || "Premium Store",
          highlight: "Discover Our Collection",
          subtitle: store?.description || "Discover our curated collection of premium quality products.",
          cta: "Shop Now",
          ctaLink: "/products",
          badge: "✨ Welcome",
          image: storeTheme.bg,
          productImage: getFeaturedProductImage(0) || storeTheme.product,
        },
        {
          title: onSaleProducts.length > 0 ? "Special Offers" : "Popular Picks",
          highlight: onSaleProducts.length > 0 ? "Limited Time Deals" : "Customer Favorites",
          subtitle: onSaleProducts.length > 0 ? "Don't miss out on these amazing deals!" : "Discover what our customers love the most.",
          cta: onSaleProducts.length > 0 ? "View Offers" : "View Popular",
          ctaLink: onSaleProducts.length > 0 ? "/products?sale=true" : "/products?sort=-ratings.count",
          badge: onSaleProducts.length > 0 ? "🔥 Limited Time" : "⭐ Top Rated",
          image: storeTheme.bg,
          productImage: getFeaturedProductImage(1) || storeTheme.product,
        },
        {
          title: "New Arrivals",
          highlight: "Fresh & Exclusive",
          subtitle: `${newArrivals.length > 0 ? newArrivals.length + " new items" : "Latest additions"} just added to our collection.`,
          cta: "Explore New",
          ctaLink: "/products?sort=-createdAt",
          badge: "🆕 Just Added",
          image: storeTheme.bg,
          productImage: getFeaturedProductImage(2) || storeTheme.product,
        },
      ];

  // Auto-rotate hero
  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length), 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // ========== FEATURES ==========
  const bakeryFeatures = [
    { icon: Award, title: "Baked Fresh Daily", desc: "Made every morning", color: "text-amber-700", bg: "bg-amber-50" },
    { icon: Heart, title: "Made with Love", desc: "Handcrafted recipes", color: "text-rose-600", bg: "bg-rose-50" },
    { icon: Star, title: "Premium Ingredients", desc: "Only the finest", color: "text-orange-600", bg: "bg-orange-50" },
    { icon: Truck, title: "Fresh Delivery", desc: "Right to your door", color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

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

  const features = bakery ? bakeryFeatures : isServiceBusiness() ? serviceFeatures : retailFeatures;
  const accentColor = store?.branding?.primaryColor || storeTheme.accent;

  // =========================================
  // RENDER
  // =========================================
  return (
    <div className={`min-h-screen ${bakery ? "bg-amber-50/30" : "bg-gray-50"}`}>
      {/* ===================== HERO ===================== */}
      {bakery ? (
        <section className="relative overflow-hidden">
          {/* Warm bakery background */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-900 to-rose-900" />
          <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${heroSlides[currentSlide].image})` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-950/80 via-amber-950/50 to-transparent" />

          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl" />
            <svg className="absolute bottom-0 left-0 w-full opacity-[0.03]" viewBox="0 0 1440 320">
              <path fill="#fff" d="M0,192L48,181.3C96,171,192,149,288,154.7C384,160,480,192,576,197.3C672,203,768,181,864,165.3C960,149,1056,139,1152,149.3C1248,160,1344,192,1392,208L1440,224L1440,320L0,320Z" />
            </svg>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: text */}
              <div className="text-white">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-amber-500/20 border border-amber-400/30 backdrop-blur-sm mb-6">{heroSlides[currentSlide].badge}</span>
                <p className="text-amber-300 text-lg font-semibold tracking-wide mb-2">{heroSlides[currentSlide].highlight}</p>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">{heroSlides[currentSlide].title}</h1>
                <p className="mt-6 text-lg text-amber-100/80 leading-relaxed max-w-lg">{heroSlides[currentSlide].subtitle}</p>

                <form onSubmit={handleHeroSearch} className="mt-8 max-w-md">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search cakes, pastries, treats..."
                      className="w-full pl-5 pr-14 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all"
                    />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-amber-500 text-white hover:bg-amber-400 transition-all">
                      <Search className="w-5 h-5" />
                    </button>
                  </div>
                </form>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link to={heroSlides[currentSlide].ctaLink} className="inline-flex items-center justify-center px-8 py-4 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-2xl transition-all shadow-lg shadow-amber-500/25 group">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    {heroSlides[currentSlide].cta}
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/products" className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">
                    View Full Menu
                  </Link>
                </div>

                {/* Event-Based Quick Links */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {[
                    { label: "🎂 Birthday", search: "birthday" },
                    { label: "💒 Wedding", search: "wedding" },
                    { label: "💝 Anniversary", search: "anniversary" },
                    { label: "🧁 Cupcakes", search: "cupcake" },
                    { label: "🍪 Cookies", search: "cookies" },
                  ].map((event) => (
                    <Link key={event.search} to={`/products?search=${event.search}`} className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium rounded-full hover:bg-white/20 transition-all">
                      {event.label}
                    </Link>
                  ))}
                </div>

                {/* Same-Day Delivery Banner */}
                <div className="mt-6 inline-flex items-center px-5 py-3 bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-sm rounded-2xl">
                  <Clock className="w-5 h-5 text-emerald-300 mr-3" />
                  <div>
                    <p className="text-sm font-semibold text-white">⚡ Same-Day Delivery Available</p>
                    <p className="text-xs text-emerald-200">Order before 10 AM for delivery today in your city</p>
                  </div>
                </div>

                <div className="mt-10 flex items-center gap-8">
                  {(store?.aboutContent?.stats?.length > 0
                    ? store.aboutContent.stats.slice(0, 3)
                    : [
                        { value: "50+", label: "Varieties" },
                        { value: "10k+", label: "Happy Customers" },
                        { value: "4.9", label: "Rating" },
                      ]
                  ).map((stat, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <div className="w-px h-10 bg-amber-400/30" />}
                      <div>
                        <p className="text-2xl font-bold text-amber-300">{stat.value}</p>
                        <p className="text-amber-100/60 text-sm">{stat.label}</p>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Right: image */}
              <div className="hidden lg:flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full blur-3xl opacity-20 bg-amber-500 scale-75" />
                <div className="relative w-80 h-80 xl:w-[420px] xl:h-[420px] rounded-3xl overflow-hidden border-4 border-amber-400/20 shadow-2xl shadow-amber-900/30 rotate-2 hover:rotate-0 transition-transform duration-500">
                  <img src={heroSlides[currentSlide].productImage} alt="Featured treat" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -top-2 -right-2 bg-white rounded-2xl px-4 py-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🧁</span>
                    <span className="font-bold text-gray-900 text-sm">Freshly Baked</span>
                  </div>
                </div>
                <div className="absolute -bottom-2 -left-2 bg-white rounded-2xl px-4 py-3 shadow-xl">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="font-bold text-gray-900 text-sm ml-1">4.9</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide dots */}
            <div className="flex justify-center gap-3 mt-12">
              {heroSlides.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2.5 rounded-full transition-all duration-300 ${i === currentSlide ? "bg-amber-400 w-10" : "bg-white/30 w-2.5 hover:bg-white/50"}`} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        /* ---- DEFAULT HERO ---- */
        <section className="relative h-[650px] md:h-[700px] lg:h-[750px] overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div key={index} className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${storeTheme.gradient}`} />
              <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${slide.image})` }} />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse" style={{ backgroundColor: accentColor }} />
              </div>

              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full items-center">
                  <div className="text-white pt-16 lg:pt-0">
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-md border border-white/20" style={{ backgroundColor: `${accentColor}30` }}>
                      {slide.badge}
                    </span>
                    <p className="text-lg md:text-xl font-bold tracking-wide mb-2" style={{ color: accentColor }}>
                      {slide.highlight}
                    </p>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight">{slide.title}</h1>
                    <p className="mt-6 text-lg md:text-xl text-white/80 leading-relaxed max-w-lg">{slide.subtitle}</p>

                    <form onSubmit={handleHeroSearch} className="mt-8 max-w-md">
                      <div className="relative">
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search for products..."
                          className="w-full pl-5 pr-14 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                        />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full text-white transition-all hover:scale-110" style={{ backgroundColor: accentColor }}>
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </form>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                      <Link to={slide.ctaLink} className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-bold rounded-full hover:bg-gray-100 transform hover:scale-105 transition-all shadow-2xl group">
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        {slide.cta}
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <Link to="/products" className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/50 text-white font-bold rounded-full hover:bg-white/10 transition-all">
                        View All
                      </Link>
                    </div>

                    <div className="mt-10 flex items-center gap-8">
                      {(store?.aboutContent?.stats?.length > 0
                        ? store.aboutContent.stats.slice(0, 3)
                        : [
                            { value: "500+", label: "Products" },
                            { value: "50k+", label: "Happy Customers" },
                            { value: "4.9", label: "Rating" },
                          ]
                      ).map((stat, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <div className="w-px h-12 bg-white/20" />}
                          <div>
                            <p className="text-3xl font-bold">{stat.value}</p>
                            <p className="text-white/60 text-sm">{stat.label}</p>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="hidden lg:flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full blur-3xl opacity-40 scale-75" style={{ backgroundColor: accentColor }} />
                    <div className="relative w-80 h-80 xl:w-96 xl:h-96 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl animate-float">
                      <img src={slide.productImage} alt="Featured" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-3 shadow-xl">
                      <div className="flex items-center gap-2">
                        <Percent className="w-5 h-5" style={{ color: accentColor }} />
                        <span className="font-bold text-gray-900">Save 20%</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-3 shadow-xl">
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="font-bold text-gray-900 text-sm ml-1">4.9</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
            {heroSlides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} className={`h-3 rounded-full transition-all duration-300 ${i === currentSlide ? "bg-white w-12 shadow-lg" : "bg-white/40 w-3 hover:bg-white/60"}`} />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide((p) => (p - 1 + heroSlides.length) % heroSlides.length)}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white z-20 hover:scale-110 transition-all"
          >
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
          <button
            onClick={() => setCurrentSlide((p) => (p + 1) % heroSlides.length)}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white z-20 hover:scale-110 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </section>
      )}

      {/* Float animation */}
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>

      {/* ===================== FEATURES BAR ===================== */}
      <section className={`bg-white shadow-sm relative -mt-8 mx-4 lg:mx-auto lg:max-w-6xl rounded-2xl z-30 ${bakery ? "border border-amber-100" : "border-b border-gray-100"}`}>
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {features.map((f, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className={`flex-shrink-0 w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{f.title}</h3>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== DEALS BANNER ===================== */}
      {onSaleProducts.length > 0 && (
        <section className="py-6 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`${bakery ? "bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500" : "bg-gradient-to-r from-red-600 via-red-500 to-orange-500"} rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center justify-between text-white shadow-lg`}>
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="p-3 bg-white/20 rounded-full">
                  <Tag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold">{bakery ? "🎂 Sweet Deals!" : "Flash Sale!"}</h3>
                  <p className="text-white/90 text-sm">{bakery ? "Grab our special treats at amazing prices" : "Grab the best deals before they're gone"}</p>
                </div>
              </div>
              <Link to="/products?sale=true" className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors flex items-center shadow-lg">
                {bakery ? "Order Now" : "Shop Now"} <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===================== CATEGORIES ===================== */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{bakery ? "Our Sweet Categories" : "Shop by Category"}</h2>
                <p className="mt-2 text-gray-600">{bakery ? "Explore our delicious range" : "Browse our curated collections"}</p>
              </div>
              <Link to="/products" className={`hidden md:flex items-center text-sm font-semibold ${bakery ? "text-amber-700 hover:text-amber-800" : "text-indigo-600 hover:text-indigo-700"}`}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.slice(0, 5).map((cat) => (
                <Link key={cat._id || cat.id} to={`/products?category=${cat.slug}`} className={`group relative overflow-hidden ${bakery ? "rounded-3xl" : "rounded-2xl"} aspect-square shadow-sm hover:shadow-xl transition-all duration-300`}>
                  <img src={getCategoryImage(cat)} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className={`absolute inset-0 ${bakery ? "bg-gradient-to-t from-amber-950/80 via-amber-900/20 to-transparent" : "bg-gradient-to-t from-black/80 via-black/30 to-transparent"}`} />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-sm md:text-base truncate">{cat.name}</h3>
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

      {/* ===================== FEATURED ===================== */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-2xl ${bakery ? "bg-gradient-to-br from-amber-100 to-orange-100" : "bg-gradient-to-br from-purple-100 to-indigo-100"}`}>{bakery ? <Star className="w-7 h-7 text-amber-600" /> : <Sparkles className="w-7 h-7 text-indigo-600" />}</div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{bakery ? "Our Specialties" : "Featured Products"}</h2>
                  <p className="text-gray-500">{bakery ? "Handcrafted treats you'll love" : "Handpicked items you'll love"}</p>
                </div>
              </div>
              <Link to="/products?featured=true" className={`hidden md:flex items-center px-5 py-2.5 rounded-full text-sm font-semibold text-white ${bakery ? "bg-amber-600 hover:bg-amber-700" : "bg-indigo-600 hover:bg-indigo-700"}`}>
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 8).map((p) => (
                <ProductCard key={p._id || p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== PROMO BANNER ===================== */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`relative rounded-3xl overflow-hidden ${bakery ? "bg-gradient-to-r from-amber-700 via-orange-600 to-rose-600" : "bg-gradient-to-r from-indigo-600 to-purple-600"}`}>
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='6'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
            <div className="relative px-8 py-16 md:py-20 md:px-16 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
                  <Gift className="w-4 h-4" />
                  <span>{bakery ? "Sweet Offer" : "Exclusive Offer"}</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{bakery ? "Get 15% Off Your First Order" : "Get 20% Off Your First Order"}</h2>
                <p className="text-white/90 text-lg max-w-lg">{bakery ? "Sign up and receive exclusive discounts, early access to seasonal treats, and birthday surprises! 🎂" : "Sign up for our newsletter and receive exclusive discounts and personalized recommendations."}</p>
              </div>
              <div className="w-full lg:w-auto">
                <div className="flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-sm p-2 rounded-2xl">
                  <input type="email" placeholder="Enter your email" className="px-6 py-4 rounded-xl text-gray-900 w-full sm:w-72 focus:ring-2 focus:ring-amber-400/50 outline-none" />
                  <button className={`px-8 py-4 bg-white font-bold rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap ${bakery ? "text-amber-700" : "text-indigo-600"}`}>Subscribe</button>
                </div>
                <p className="text-white/60 text-xs text-center mt-3">{bakery ? "No spam, just sweet updates! 🍪" : "We respect your privacy."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== HOT DEALS ===================== */}
      {onSaleProducts.length > 0 && (
        <section className={`py-16 ${bakery ? "bg-gradient-to-b from-orange-50 to-white" : "bg-gradient-to-b from-red-50 to-white"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-2xl ${bakery ? "bg-orange-100" : "bg-red-100"}`}>
                  <Tag className={`w-7 h-7 ${bakery ? "text-orange-600" : "text-red-600"}`} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{bakery ? "Sweet Deals" : "Hot Deals"}</h2>
                  <p className="text-gray-500">{bakery ? "Amazing prices on delicious treats" : "Save big on these offers"}</p>
                </div>
              </div>
              <Link to="/products?sale=true" className={`hidden md:flex items-center px-5 py-2.5 rounded-full text-sm font-semibold text-white ${bakery ? "bg-orange-600 hover:bg-orange-700" : "bg-red-600 hover:bg-red-700"}`}>
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {onSaleProducts.slice(0, 4).map((p) => (
                <ProductCard key={p._id || p.id} product={p} showSaleBadge />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== NEW ARRIVALS ===================== */}
      {(newArrivals.length > 0 || latestProducts.length > 0) && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-2xl ${bakery ? "bg-rose-100" : "bg-blue-100"}`}>
                  <Clock className={`w-7 h-7 ${bakery ? "text-rose-600" : "text-blue-600"}`} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{bakery ? "Fresh from the Oven" : "New Arrivals"}</h2>
                  <p className="text-gray-500">{bakery ? "Our latest creations, baked fresh" : "Fresh products just landed"}</p>
                </div>
              </div>
              <Link to="/products?sort=-createdAt" className={`hidden md:flex items-center px-5 py-2.5 rounded-full text-sm font-semibold text-white ${bakery ? "bg-rose-600 hover:bg-rose-700" : "bg-blue-600 hover:bg-blue-700"}`}>
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(newArrivals.length > 0 ? newArrivals : latestProducts).slice(0, 8).map((p) => (
                <ProductCard key={p._id || p.id} product={p} showNewBadge />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== BESTSELLERS ===================== */}
      {(bestsellers.length > 0 || latestProducts.length > 0) && (
        <section className="py-16 bg-gradient-to-b from-amber-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-2xl bg-amber-100">
                  <TrendingUp className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{bakery ? "Most Loved Treats" : "Trending Now"}</h2>
                  <p className="text-gray-500">{bakery ? "Our customers' absolute favorites" : "Most popular with our customers"}</p>
                </div>
              </div>
              <Link to="/products?sort=-ratings.count" className="hidden md:flex items-center px-5 py-2.5 rounded-full text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(bestsellers.length > 0 ? bestsellers : latestProducts).slice(0, 8).map((p, idx) => (
                <div key={p._id || p.id} className="relative">
                  {idx < 3 && <div className="absolute -top-2 -left-2 z-10 w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-full flex items-center justify-center font-bold shadow-lg">#{idx + 1}</div>}
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================== BAKERY TRUST ===================== */}
      {bakery && <BakeryTrust store={store} />}

      {/* ===================== WHY US ===================== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{bakery ? "Why Choose Us?" : "Why Shop With Us?"}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{bakery ? "We're passionate about bringing you the finest baked goods, made with love and the best ingredients" : "We're committed to providing you with the best shopping experience possible"}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {bakery ? (
              <>
                <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-lg transition-shadow border border-amber-100">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center mb-6">
                    <Award className="w-8 h-8 text-amber-700" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Premium Ingredients</h3>
                  <p className="text-gray-600">We source only the finest flour, butter, chocolate, and fresh fruits for every recipe.</p>
                </div>
                <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-rose-50 to-pink-50 hover:shadow-lg transition-shadow border border-rose-100">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 flex items-center justify-center mb-6">
                    <Heart className="w-8 h-8 text-rose-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Made with Love</h3>
                  <p className="text-gray-600">Every item is handcrafted by passionate bakers with traditional recipes and modern techniques.</p>
                </div>
                <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-lg transition-shadow border border-emerald-100">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
                    <Star className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">5-Star Reviews</h3>
                  <p className="text-gray-600">Thousands of happy customers rate us 5 stars for taste, freshness, and presentation.</p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-100 flex items-center justify-center mb-6">
                    <Award className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Premium Quality</h3>
                  <p className="text-gray-600">All our products are carefully selected to ensure the highest quality standards.</p>
                </div>
                <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-yellow-100 flex items-center justify-center mb-6">
                    <Star className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Reviews</h3>
                  <p className="text-gray-600">Read genuine reviews from thousands of satisfied customers.</p>
                </div>
                <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 flex items-center justify-center mb-6">
                    <Heart className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">100% Satisfaction</h3>
                  <p className="text-gray-600">Our support team ensures your complete satisfaction with every order.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Contact */}
      <ContactSection />

      {/* ===================== FINAL CTA ===================== */}
      <section className={`py-16 ${bakery ? "bg-gradient-to-r from-amber-900 to-orange-900" : "bg-gradient-to-r from-gray-900 to-gray-800"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{bakery ? "Ready to Treat Yourself?" : "Ready to Get Started?"}</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">{bakery ? "Browse our full menu of freshly baked cakes, pastries, and desserts. Order online for pickup or delivery!" : "Browse our products and services. Start shopping today!"}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/products" className={`inline-flex items-center px-10 py-4 font-bold rounded-full transition-colors shadow-xl ${bakery ? "bg-amber-500 hover:bg-amber-400 text-white" : "bg-white hover:bg-gray-100 text-gray-900"}`}>
              {bakery ? "View Full Menu" : "Explore All Products"}
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
