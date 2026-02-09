import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { ShoppingBag, Search, Menu, X, User, Heart, ChevronDown, Store, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube, CreditCard, Truck, Shield, Clock, ChevronRight, Tag, Calendar, LogIn, LogOut, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { categoriesAPI, contactAPI, resolveImageUrl } from "../services/api";
import CartDrawer from "./CartDrawer";
import ScrollToTop from "./ScrollToTop";

export default function Layout() {
  const { store, isLoading, storeSlug, terminology, isServiceBased } = useStore();
  const { itemCount, openCart, subtotal } = useCart();
  const { isAuthenticated, user, openAuthModal, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // Track scroll for header styling and active section detection
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Only track sections on homepage for service-based stores
      if (location.pathname === "/" && isServiceBased) {
        const sections = ["gallery", "team", "about", "contact", "services"];
        let currentSection = "";

        for (const sectionId of sections) {
          const element = document.getElementById(sectionId);
          if (element) {
            const rect = element.getBoundingClientRect();
            // Check if section is in viewport (with some offset for header)
            if (rect.top <= 150 && rect.bottom >= 150) {
              currentSection = sectionId;
              break;
            }
          }
        }
        setActiveSection(currentSection);
      } else {
        setActiveSection("");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname, isServiceBased]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Handle smooth scrolling for hash links
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = location.hash;
      if (hash) {
        // Small delay to ensure page is loaded
        setTimeout(() => {
          const element = document.getElementById(hash.slice(1));
          if (element) {
            const headerOffset = 100; // Account for fixed header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
          }
        }, 100);
      }
    };

    handleHashNavigation();
  }, [location.hash, location.pathname]);

  // Fetch categories for navigation
  const { data: categoriesData } = useQuery({
    queryKey: ["categories", storeSlug],
    queryFn: categoriesAPI.getAll,
    enabled: !!storeSlug,
  });

  const categories = categoriesData?.data?.data?.categories || [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  // Smooth scroll to section handler
  const scrollToSection = (e, sectionId) => {
    e.preventDefault();

    // If not on homepage, navigate to homepage first then scroll
    if (location.pathname !== "/") {
      navigate(`/#${sectionId}`);
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const brandColors = {
    primary: store?.branding?.primaryColor || "#6366f1",
    secondary: store?.branding?.secondaryColor || "#4f46e5",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600 mx-auto"></div>
            <Store className="w-8 h-8 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading your store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top Banner with Store Switcher & RetailX Branding */}
      {store?.promoBanner?.enabled ? (
        <div className="text-center py-2 text-sm font-medium" style={{ backgroundColor: store.promoBanner.backgroundColor || brandColors.primary, color: store.promoBanner.textColor || "#FFFFFF" }}>
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <Link to="/select-store" className="flex items-center space-x-2 hover:opacity-80 px-3 py-1.5 rounded-full transition-colors group">
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <Store className="w-3.5 h-3.5" />
              </div>
              <span className="hidden sm:inline font-semibold">RetailX</span>
              <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <div className="flex items-center space-x-2">
              {store.promoBanner.link ? (
                <a href={store.promoBanner.link} className="hover:underline">
                  {store.promoBanner.text}
                </a>
              ) : (
                <span>{store.promoBanner.text}</span>
              )}
            </div>
            <Link to="/select-store" className="flex items-center space-x-2 hover:opacity-80 px-3 py-1.5 rounded-full transition-colors">
              <span className="text-xs font-medium">{store?.name || "Select Store"}</span>
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                <ChevronDown className="w-3 h-3" />
              </div>
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-white text-center py-2 text-sm font-medium" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}>
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <Link to="/select-store" className="flex items-center space-x-2 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors group">
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                <Store className="w-3.5 h-3.5" />
              </div>
              <span className="hidden sm:inline font-semibold">RetailX</span>
              <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <div className="flex items-center space-x-2">
              {isServiceBased ? (
                <>
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    Book online & get <strong>10% OFF</strong> your first appointment!
                  </span>
                  <span className="sm:hidden">10% OFF first booking!</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  <span className="hidden sm:inline">Free shipping on orders over $50!</span>
                  <span className="sm:hidden">Free shipping over $50!</span>
                </>
              )}
            </div>
            <Link to="/select-store" className="flex items-center space-x-2 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors">
              <span className="text-xs font-medium">{store?.name || "Select Store"}</span>
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                <ChevronDown className="w-3 h-3" />
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`bg-white sticky top-0 z-40 transition-all duration-300 ${scrolled ? "shadow-lg" : "border-b border-gray-100"}`}>
        {/* Top Header Bar - Desktop Only */}
        <div className="hidden lg:block border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-10 text-sm">
              <div className="flex items-center space-x-6 text-gray-500">
                {(store?.contact?.phone || store?.contactPhone) && (
                  <a href={`tel:${store?.contact?.phone || store?.contactPhone}`} className="flex items-center space-x-1 hover:text-gray-700">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{store?.contact?.phone || store?.contactPhone}</span>
                  </a>
                )}
                {(store?.contact?.email || store?.contactEmail) && (
                  <a href={`mailto:${store?.contact?.email || store?.contactEmail}`} className="flex items-center space-x-1 hover:text-gray-700">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{store?.contact?.email || store?.contactEmail}</span>
                  </a>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/select-store" className="flex items-center space-x-1.5 text-indigo-600 hover:text-indigo-700 font-medium">
                  <Store className="w-3.5 h-3.5" />
                  <span>All Stores</span>
                </Link>
                {!isServiceBased && (
                  <>
                    <span className="text-gray-300">|</span>
                    <a href="#" className="text-gray-500 hover:text-gray-700">
                      Track Order
                    </a>
                  </>
                )}
                <span className="text-gray-300">|</span>
                <a href="#" className="text-gray-500 hover:text-gray-700">
                  Help
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
              {store?.branding?.logo || store?.logo ? (
                <img src={resolveImageUrl(store.branding?.logo || store.logo)} alt={store?.name} className="h-10 lg:h-12 w-auto" />
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${brandColors.primary}15` }}>
                    <Store className="w-6 h-6 lg:w-7 lg:h-7" style={{ color: brandColors.primary }} />
                  </div>
                  <span className="text-xl lg:text-2xl font-bold text-gray-900 hidden sm:block">{store?.name || "Welcome"}</span>
                </div>
              )}
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-8">
              <form onSubmit={handleSearch} className="w-full relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isServiceBased ? "Search for services..." : "Search for products, brands, and more..."}
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:border-indigo-500 focus:ring-0 transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-white rounded-lg text-sm font-medium transition-colors" style={{ backgroundColor: brandColors.primary }}>
                  Search
                </button>
              </form>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Mobile Search Toggle */}
              <button onClick={() => setSearchOpen(!searchOpen)} className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <button className="hidden sm:flex items-center space-x-1 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Heart className="w-5 h-5" />
                <span className="hidden xl:inline text-sm">Wishlist</span>
              </button>

              {/* Account */}
              <div className="relative hidden sm:block">
                {isAuthenticated ? (
                  <div>
                    <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ backgroundColor: brandColors.primary }}>
                        {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <span className="hidden xl:inline text-sm font-medium">{user?.firstName}</span>
                      <ChevronDown className="w-4 h-4 hidden xl:block" />
                    </button>

                    {/* User Dropdown */}
                    {userMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-900">
                              {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          </div>
                          <div className="py-1">
                            <Link to="/account" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                              <User className="w-4 h-4 mr-3 text-gray-400" />
                              My Account
                            </Link>
                            <Link to="/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                              <ShoppingBag className="w-4 h-4 mr-3 text-gray-400" />
                              My {isServiceBased ? "Bookings" : "Orders"}
                            </Link>
                            <Link to="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                              <Settings className="w-4 h-4 mr-3 text-gray-400" />
                              Settings
                            </Link>
                          </div>
                          <div className="border-t border-gray-100 pt-1">
                            <button
                              onClick={() => {
                                setUserMenuOpen(false);
                                logout();
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <LogOut className="w-4 h-4 mr-3" />
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <button onClick={() => openAuthModal("login")} className="flex items-center space-x-1 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                    <User className="w-5 h-5" />
                    <span className="hidden xl:inline text-sm">Sign In</span>
                  </button>
                )}
              </div>

              {/* Cart */}
              <button onClick={openCart} className="relative flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg group">
                <div className="relative">
                  {isServiceBased ? <Calendar className="w-6 h-6" /> : <ShoppingBag className="w-6 h-6" />}
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 text-white text-xs font-bold rounded-full flex items-center justify-center" style={{ backgroundColor: brandColors.primary }}>
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </div>
                <div className="hidden xl:block text-left">
                  <span className="text-xs text-gray-500">{terminology?.cart || "Cart"}</span>
                  <p className="text-sm font-semibold text-gray-900">${subtotal?.toFixed(2) || "0.00"}</p>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {searchOpen && (
            <div className="lg:hidden pb-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isServiceBased ? "Search services..." : "Search products..."}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </form>
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 pb-3 border-t border-gray-100 pt-3 mt-2">
            <Link to="/" className={`px-4 py-2 font-medium rounded-lg transition-all text-sm ${location.pathname === "/" && !activeSection ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
              Home
            </Link>

            {isServiceBased ? (
              // Service-oriented navigation - All links go to home page sections
              <>
                <button onClick={(e) => scrollToSection(e, "services")} className={`px-4 py-2 font-medium rounded-lg transition-all text-sm ${activeSection === "services" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
                  Our Services
                </button>
                <button onClick={(e) => scrollToSection(e, "gallery")} className={`px-4 py-2 font-medium rounded-lg transition-all text-sm ${activeSection === "gallery" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
                  Gallery
                </button>
                <button onClick={(e) => scrollToSection(e, "team")} className={`px-4 py-2 font-medium rounded-lg transition-all text-sm ${activeSection === "team" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
                  Our Team
                </button>
                <button onClick={(e) => scrollToSection(e, "about")} className={`px-4 py-2 font-medium rounded-lg transition-all text-sm ${activeSection === "about" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
                  About Us
                </button>
                <button onClick={(e) => scrollToSection(e, "contact")} className={`px-4 py-2 font-medium rounded-lg transition-all text-sm ${activeSection === "contact" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
                  Contact
                </button>
              </>
            ) : (
              // E-commerce navigation
              <>
                <Link to="/products" className={`px-4 py-2 font-medium rounded-lg transition-all text-sm ${location.pathname === "/products" && !location.search ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
                  {terminology?.allProducts || "All Products"}
                </Link>

                {/* Categories Dropdown */}
                <div className="relative" onMouseLeave={() => setCategoriesOpen(false)}>
                  <button
                    onClick={() => setCategoriesOpen(!categoriesOpen)}
                    onMouseEnter={() => setCategoriesOpen(true)}
                    className={`flex items-center space-x-1 px-4 py-2 font-medium rounded-lg transition-all text-sm ${categoriesOpen || location.pathname.startsWith("/categories/") ? "bg-indigo-100 text-indigo-900" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
                  >
                    <span>{terminology?.categories || "Categories"}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
                  </button>
                  {categoriesOpen && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      {categories.length > 0 ? (
                        categories.map((category) => {
                          const isActive = location.pathname === `/categories/${category.slug}`;
                          return (
                            <Link
                              key={category._id || category.id}
                              to={`/categories/${category.slug}`}
                              onClick={() => setCategoriesOpen(false)}
                              className={`flex items-center px-4 py-2.5 text-sm transition-colors ${isActive ? "bg-indigo-50 text-indigo-700 font-medium border-l-2 border-indigo-600" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}`}
                            >
                              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-2"></span>}
                              {category.name}
                            </Link>
                          );
                        })
                      ) : (
                        <div className="px-4 py-3 text-gray-500 text-sm">No categories</div>
                      )}
                    </div>
                  )}
                </div>

                <Link to="/products?featured=true" className={`px-4 py-2 font-medium rounded-lg transition-all text-sm ${location.search.includes("featured=true") ? "bg-amber-500 text-white" : "text-gray-600 hover:text-amber-600 hover:bg-amber-50"}`}>
                  {terminology?.featured || "Featured"}
                </Link>
                <Link to="/products?sale=true" className={`px-4 py-2 font-medium rounded-lg transition-all text-sm flex items-center ${location.search.includes("sale=true") ? "bg-red-500 text-white" : "text-red-600 hover:bg-red-50"}`}>
                  Sale
                </Link>
                <Link
                  to="/products?sort=-createdAt"
                  className={`px-4 py-2 font-medium rounded-lg transition-all text-sm ${location.search.includes("sort=-createdAt") && !location.search.includes("featured") && !location.search.includes("sale") ? "bg-emerald-500 text-white" : "text-gray-600 hover:text-emerald-600 hover:bg-emerald-50"}`}
                >
                  New Arrivals
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-80 max-w-full bg-white z-50 lg:hidden overflow-y-auto shadow-2xl">
              <div className="sticky top-0 p-4 border-b border-gray-100 bg-white flex items-center justify-between">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2">
                  <Store className="w-8 h-8" style={{ color: brandColors.primary }} />
                  <span className="text-lg font-bold">{store?.name}</span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="p-4 space-y-1">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className={`flex items-center px-4 py-3 rounded-xl font-medium ${location.pathname === "/" && !activeSection ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"}`}>
                  🏠 Home
                </Link>

                {isServiceBased ? (
                  // Service-based mobile menu - All links go to home page sections
                  <>
                    <button
                      onClick={(e) => {
                        setMobileMenuOpen(false);
                        scrollToSection(e, "services");
                      }}
                      className={`flex items-center w-full px-4 py-3 rounded-xl font-medium ${activeSection === "services" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      💆 Our Services
                    </button>
                    <button
                      onClick={(e) => {
                        setMobileMenuOpen(false);
                        scrollToSection(e, "gallery");
                      }}
                      className={`flex items-center w-full px-4 py-3 rounded-xl font-medium ${activeSection === "gallery" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      📸 Gallery
                    </button>
                    <button
                      onClick={(e) => {
                        setMobileMenuOpen(false);
                        scrollToSection(e, "team");
                      }}
                      className={`flex items-center w-full px-4 py-3 rounded-xl font-medium ${activeSection === "team" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      👥 Our Team
                    </button>
                    <button
                      onClick={(e) => {
                        setMobileMenuOpen(false);
                        scrollToSection(e, "about");
                      }}
                      className={`flex items-center w-full px-4 py-3 rounded-xl font-medium ${activeSection === "about" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      ℹ️ About Us
                    </button>
                    <button
                      onClick={(e) => {
                        setMobileMenuOpen(false);
                        scrollToSection(e, "contact");
                      }}
                      className={`flex items-center w-full px-4 py-3 rounded-xl font-medium ${activeSection === "contact" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      📞 Contact
                    </button>

                    {/* Book Now CTA */}
                    <div className="pt-4 mt-4 border-t border-gray-100">
                      <button
                        onClick={(e) => {
                          setMobileMenuOpen(false);
                          scrollToSection(e, "services");
                        }}
                        className="flex items-center justify-center w-full px-4 py-3 rounded-xl font-semibold text-white"
                        style={{ backgroundColor: brandColors.primary }}
                      >
                        <Calendar className="w-5 h-5 mr-2" />
                        Book Appointment
                      </button>
                    </div>
                  </>
                ) : (
                  // E-commerce mobile menu
                  <>
                    <Link to="/products" onClick={() => setMobileMenuOpen(false)} className={`flex items-center px-4 py-3 rounded-xl font-medium ${location.pathname === "/products" && !location.search ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"}`}>
                      🛍️ Shop All
                    </Link>
                    <Link to="/products?featured=true" onClick={() => setMobileMenuOpen(false)} className={`flex items-center px-4 py-3 rounded-xl font-medium ${location.search.includes("featured=true") ? "bg-amber-50 text-amber-700" : "text-gray-700 hover:bg-gray-50"}`}>
                      ⭐ Featured
                    </Link>
                    <Link to="/products?sale=true" onClick={() => setMobileMenuOpen(false)} className={`flex items-center px-4 py-3 rounded-xl font-medium ${location.search.includes("sale=true") ? "bg-red-50 text-red-700" : "text-red-600 hover:bg-red-50"}`}>
                      🏷️ Sale
                    </Link>

                    <div className="pt-4 pb-2">
                      <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Shop by Category</p>
                    </div>
                    {categories.map((category) => {
                      const isActive = location.pathname === `/categories/${category.slug}`;
                      return (
                        <Link
                          key={category._id || category.id}
                          to={`/categories/${category.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl ${isActive ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                        >
                          <span className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-3 ${isActive ? "bg-indigo-500" : "bg-gray-300"}`}></span>
                            {category.name}
                          </span>
                          <ChevronRight className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-gray-400"}`} />
                        </Link>
                      );
                    })}
                  </>
                )}

                <div className="pt-4 border-t border-gray-100 mt-4">
                  <Link to="/select-store" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl">
                    <Store className="w-5 h-5 mr-3" />
                    Switch Store
                  </Link>

                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 bg-gray-50 rounded-xl mx-2 my-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ backgroundColor: brandColors.primary }}>
                            {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl">
                        <User className="w-5 h-5 mr-3" />
                        My Account
                      </Link>
                      <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl">
                        <ShoppingBag className="w-5 h-5 mr-3" />
                        My {isServiceBased ? "Bookings" : "Orders"}
                      </Link>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          logout();
                        }}
                        className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl"
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          openAuthModal("login");
                        }}
                        className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl"
                      >
                        <LogIn className="w-5 h-5 mr-3" />
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          openAuthModal("register");
                        }}
                        className="flex items-center w-full px-4 py-3 font-medium rounded-xl text-white mx-2 mt-2"
                        style={{ backgroundColor: brandColors.primary }}
                      >
                        <User className="w-5 h-5 mr-3" />
                        Create Account
                      </button>
                    </>
                  )}

                  <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl mt-2">
                    <Heart className="w-5 h-5 mr-3" />
                    Wishlist
                  </a>
                </div>
              </nav>
            </div>
          </>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        {/* Newsletter Section */}
        <div className="border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-white">Subscribe to Our Newsletter</h3>
                <p className="text-gray-400 mt-1">Get the latest deals and updates delivered to your inbox</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="px-5 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-full sm:w-72"
                />
                <button
                  disabled={newsletterLoading}
                  onClick={async () => {
                    if (!newsletterEmail.trim()) return;
                    setNewsletterLoading(true);
                    try {
                      await contactAPI.subscribeNewsletter(newsletterEmail);
                      setNewsletterEmail("");
                    } catch {}
                    setNewsletterLoading(false);
                  }}
                  className="px-6 py-3 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                  style={{ backgroundColor: brandColors.primary }}
                >
                  {newsletterLoading ? "..." : "Subscribe"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Store Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <Store className="w-8 h-8" style={{ color: brandColors.primary }} />
                <span className="text-xl font-bold text-white">{store?.name || "Store"}</span>
              </div>
              <p className="text-gray-400 mb-6 text-sm leading-relaxed">{store?.description || "Your one-stop shop for quality products at great prices."}</p>
              <div className="space-y-3 text-sm">
                {(store?.contact?.email || store?.contactEmail) && (
                  <a href={`mailto:${store?.contact?.email || store?.contactEmail}`} className="flex items-center space-x-3 text-gray-400 hover:text-white">
                    <Mail className="w-4 h-4" />
                    <span>{store?.contact?.email || store?.contactEmail}</span>
                  </a>
                )}
                {(store?.contact?.phone || store?.contactPhone) && (
                  <a href={`tel:${store?.contact?.phone || store?.contactPhone}`} className="flex items-center space-x-3 text-gray-400 hover:text-white">
                    <Phone className="w-4 h-4" />
                    <span>{store?.contact?.phone || store?.contactPhone}</span>
                  </a>
                )}
                {(store?.contact?.address || store?.address) && (
                  <div className="flex items-center space-x-3 text-gray-400">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{store?.contact?.address?.street ? `${store.contact.address.street}, ${store.contact.address.city || ""}` : store?.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-5">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                {isServiceBased ? (
                  <>
                    <li>
                      <Link to="/products" className="text-gray-400 hover:text-white transition-colors">
                        Services & Prices
                      </Link>
                    </li>
                    <li>
                      <a href="/#gallery" className="text-gray-400 hover:text-white transition-colors">
                        Gallery
                      </a>
                    </li>
                    <li>
                      <a href="/#team" className="text-gray-400 hover:text-white transition-colors">
                        Our Team
                      </a>
                    </li>
                    <li>
                      <a href="/#about" className="text-gray-400 hover:text-white transition-colors">
                        About Us
                      </a>
                    </li>
                    <li>
                      <a href="/#contact" className="text-gray-400 hover:text-white transition-colors">
                        Contact
                      </a>
                    </li>
                    <li>
                      <a href={`tel:${store?.contact?.phone || ""}`} className="text-gray-400 hover:text-white transition-colors">
                        Book Appointment
                      </a>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link to="/products" className="text-gray-400 hover:text-white transition-colors">
                        All Products
                      </Link>
                    </li>
                    <li>
                      <Link to="/products?featured=true" className="text-gray-400 hover:text-white transition-colors">
                        Featured Products
                      </Link>
                    </li>
                    <li>
                      <Link to="/products?sale=true" className="text-gray-400 hover:text-white transition-colors">
                        Sale Items
                      </Link>
                    </li>
                    <li>
                      <Link to="/products?sort=-createdAt" className="text-gray-400 hover:text-white transition-colors">
                        New Arrivals
                      </Link>
                    </li>
                    <li>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        Track Order
                      </a>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-white font-semibold mb-5">Categories</h4>
              <ul className="space-y-3 text-sm">
                {categories.slice(0, 6).map((category) => (
                  <li key={category._id || category.id}>
                    <Link to={`/products?category=${category.slug}`} className="text-gray-400 hover:text-white transition-colors">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-white font-semibold mb-5">Customer Service</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    FAQs
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {isServiceBased ? "Booking Policy" : "Shipping & Returns"}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>

              {/* Social Links */}
              <div className="mt-6">
                <h5 className="text-white font-semibold mb-3">Follow Us</h5>
                <div className="flex space-x-3">
                  {(store?.socialLinks?.facebook || !store?.socialLinks) && (
                    <a href={store?.socialLinks?.facebook || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {(store?.socialLinks?.twitter || !store?.socialLinks) && (
                    <a href={store?.socialLinks?.twitter || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {(store?.socialLinks?.instagram || !store?.socialLinks) && (
                    <a href={store?.socialLinks?.instagram || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {(store?.socialLinks?.youtube || !store?.socialLinks) && (
                    <a href={store?.socialLinks?.youtube || "#"} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                      <Youtube className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="border-t border-gray-800 mt-10 pt-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {isServiceBased ? (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Easy Booking</p>
                      <p className="text-gray-500 text-xs">Book online anytime</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Certified Experts</p>
                      <p className="text-gray-500 text-xs">Licensed professionals</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Flexible Hours</p>
                      <p className="text-gray-500 text-xs">Appointments that fit you</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Satisfaction</p>
                      <p className="text-gray-500 text-xs">100% guaranteed</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                      <Truck className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Free Shipping</p>
                      <p className="text-gray-500 text-xs">On orders over $50</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Secure Payment</p>
                      <p className="text-gray-500 text-xs">100% protected</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">24/7 Support</p>
                      <p className="text-gray-500 text-xs">Always here to help</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Easy Returns</p>
                      <p className="text-gray-500 text-xs">30-day return policy</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} {store?.name}. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <Link to="/select-store" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  <Store className="w-4 h-4" />
                  Browse All Stores
                </Link>
                <span className="text-gray-600">•</span>
                <p className="text-sm text-gray-600">
                  Powered by <span className="font-semibold text-indigo-400">RetailX</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Store Switcher Button (Mobile) */}
      {scrolled && (
        <Link to="/select-store" className="fixed bottom-20 right-4 z-30 lg:hidden p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all animate-bounce-once" style={{ animationIterationCount: 3 }}>
          <Store className="w-5 h-5" />
        </Link>
      )}

      {/* Scroll to Top Button */}
      <ScrollToTop />

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
