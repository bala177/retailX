import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "../context/StoreContext";
import { productsAPI, categoriesAPI } from "../services/api";
import ProductCard from "../components/ProductCard";
import ServiceCard from "../components/ServiceCard";
import BookingModal from "../components/BookingModal";
import { Filter, Grid, List, ChevronDown, X, SlidersHorizontal, Star, ChevronRight, Search, Package, Tag, ArrowUpDown, LayoutGrid, Rows, Check, Home, Calendar, Clock, Users } from "lucide-react";

export default function Products() {
  const { slug: categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { storeSlug, store, isServiceBased, terminology } = useStore();

  const [view, setView] = useState("grid");
  const [gridSize, setGridSize] = useState(4); // 3 or 4 columns
  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || categorySlug || "",
    sort: searchParams.get("sort") || "-createdAt",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    inStock: searchParams.get("inStock") === "true",
    featured: searchParams.get("featured") === "true",
    onSale: searchParams.get("sale") === "true",
    rating: searchParams.get("rating") || "",
  });

  const searchQuery = searchParams.get("q") || searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = 12;

  // Sync filters with URL params when URL changes
  useEffect(() => {
    setFilters({
      category: categorySlug || searchParams.get("category") || "",
      sort: searchParams.get("sort") || "-createdAt",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      inStock: searchParams.get("inStock") === "true",
      featured: searchParams.get("featured") === "true",
      onSale: searchParams.get("sale") === "true",
      rating: searchParams.get("rating") || "",
    });
  }, [searchParams, categorySlug]);

  // Fetch products
  const {
    data: productsData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["products", storeSlug, filters, searchQuery, page],
    queryFn: () =>
      productsAPI.getAll({
        page,
        limit,
        search: searchQuery,
        category: filters.category,
        sort: filters.sort,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        inStock: filters.inStock || undefined,
        featured: filters.featured || undefined,
        onSale: filters.onSale || undefined,
      }),
    enabled: !!storeSlug,
    keepPreviousData: true,
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories", storeSlug],
    queryFn: categoriesAPI.getAll,
    enabled: !!storeSlug,
  });

  const products = productsData?.data?.data?.products || [];
  const rawPagination = productsData?.data?.data?.pagination || {};
  // Normalize pagination object - backend uses 'total' and 'pages', but we need 'totalItems' and 'totalPages'
  const pagination = {
    ...rawPagination,
    totalItems: rawPagination.total || rawPagination.totalItems || 0,
    totalPages: rawPagination.pages || rawPagination.totalPages || 0,
    currentPage: rawPagination.page || rawPagination.currentPage || 1,
  };
  const categories = categoriesData?.data?.data?.categories || [];

  const currentCategory = categories.find((c) => c.slug === (filters.category || categorySlug));

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete("page"); // Reset to page 1
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      sort: "-createdAt",
      minPrice: "",
      maxPrice: "",
      inStock: false,
      featured: false,
      onSale: false,
      rating: "",
    });
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage);
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const sortOptions = [
    { value: "-createdAt", label: "Newest First", icon: "🆕" },
    { value: "createdAt", label: "Oldest First", icon: "📅" },
    { value: "name", label: "Name A-Z", icon: "🔤" },
    { value: "-name", label: "Name Z-A", icon: "🔠" },
    { value: "pricing.basePrice", label: "Price: Low to High", icon: "💰" },
    { value: "-pricing.basePrice", label: "Price: High to Low", icon: "💎" },
    { value: "-ratings.average", label: "Highest Rated", icon: "⭐" },
    { value: "-ratings.count", label: "Most Reviews", icon: "💬" },
  ];

  const currentSort = sortOptions.find((s) => s.value === filters.sort) || sortOptions[0];

  const activeFilterCount = [filters.category, filters.minPrice, filters.maxPrice, filters.inStock, filters.featured, filters.onSale, filters.rating].filter(Boolean).length;

  const pageTitle = searchQuery ? `Search results for "${searchQuery}"` : currentCategory ? currentCategory.name : filters.featured ? terminology?.featured || "Featured" : filters.onSale ? (isServiceBased ? "Special Offers" : "Products on Sale") : terminology?.allProducts || "Shop All Products";

  const brandColors = {
    primary: store?.branding?.primaryColor || "#6366f1",
  };

  // Determine which card component to use
  const ItemCard = isServiceBased ? ServiceCard : ProductCard;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <Link to="/products" className="text-gray-500 hover:text-gray-700">
              {terminology?.products || "Products"}
            </Link>
            {currentCategory && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-300" />
                <span className="text-gray-900 font-medium">{currentCategory.name}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Compact Category Header - only show when category is selected */}
      {currentCategory && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentCategory.name}</h1>
                {currentCategory.description && <p className="text-sm text-gray-500 mt-1">{currentCategory.description}</p>}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{pagination.totalItems}</span>
                <span>{pagination.totalItems === 1 ? terminology?.product?.toLowerCase() : terminology?.products?.toLowerCase()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header (for non-category pages) */}
        {!currentCategory && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
            {searchQuery && <p className="text-gray-600 mt-2">Found {pagination.totalItems || 0} results for your search</p>}
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  {activeFilterCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: brandColors.primary }}>
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700 font-medium">
                    Clear all
                  </button>
                )}
              </div>

              <div className="p-5 space-y-6">
                {/* Categories */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <Tag className="w-4 h-4 mr-2" style={{ color: brandColors.primary }} />
                    {terminology?.categories || "Category"}
                  </h4>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => handleFilterChange("category", "")}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${!filters.category ? "text-white font-medium shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
                      style={!filters.category ? { backgroundColor: brandColors.primary } : {}}
                    >
                      <span className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${!filters.category ? "bg-white" : "bg-gray-300"}`}></span>
                        {terminology?.allProducts || "All Products"}
                      </span>
                      {!filters.category && <Check className="w-4 h-4" />}
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category._id || category.id}
                        onClick={() => handleFilterChange("category", category.slug)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${filters.category === category.slug ? "text-white font-medium shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
                        style={filters.category === category.slug ? { backgroundColor: brandColors.primary } : {}}
                      >
                        <span className="flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${filters.category === category.slug ? "bg-white" : "bg-gray-300"}`}></span>
                          {category.name}
                        </span>
                        {filters.category === category.slug && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">💰</span>
                    Price Range
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                        className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:border-transparent"
                        style={{ "--tw-ring-color": brandColors.primary }}
                      />
                    </div>
                    <span className="text-gray-300">—</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                        className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:border-transparent"
                        style={{ "--tw-ring-color": brandColors.primary }}
                      />
                    </div>
                  </div>
                  {/* Quick Price Filters */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {[
                      { label: "Under $50", min: "", max: "50" },
                      { label: "$50-$100", min: "50", max: "100" },
                      { label: "$100-$200", min: "100", max: "200" },
                      { label: "$200+", min: "200", max: "" },
                    ].map((range) => (
                      <button
                        key={range.label}
                        onClick={() => {
                          handleFilterChange("minPrice", range.min);
                          handleFilterChange("maxPrice", range.max);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filters.minPrice === range.min && filters.maxPrice === range.max ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <Star className="w-4 h-4 mr-2 text-yellow-400 fill-yellow-400" />
                    Rating
                  </h4>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleFilterChange("rating", filters.rating === String(rating) ? "" : String(rating))}
                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${filters.rating === String(rating) ? "bg-yellow-50 border border-yellow-200" : "hover:bg-gray-50"}`}
                      >
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">& Up</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Filters */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Filters</h4>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                      <input type="checkbox" checked={filters.inStock} onChange={(e) => handleFilterChange("inStock", e.target.checked)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                      <span className="ml-3 text-sm text-gray-700">In Stock Only</span>
                      <Package className="w-4 h-4 ml-auto text-green-500" />
                    </label>
                    <label className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                      <input type="checkbox" checked={filters.featured} onChange={(e) => handleFilterChange("featured", e.target.checked)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                      <span className="ml-3 text-sm text-gray-700">Featured</span>
                      <span className="ml-auto">⭐</span>
                    </label>
                    <label className="flex items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                      <input type="checkbox" checked={filters.onSale} onChange={(e) => handleFilterChange("onSale", e.target.checked)} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                      <span className="ml-3 text-sm text-gray-700">On Sale</span>
                      <span className="ml-auto text-red-500">🏷️</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  {/* Mobile Filter Toggle */}
                  <button onClick={() => setShowFilters(true)} className="lg:hidden flex items-center space-x-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="font-medium">Filters</span>
                    {activeFilterCount > 0 && <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">{activeFilterCount}</span>}
                  </button>

                  {/* Results Count */}
                  <p className="text-sm text-gray-500 hidden sm:block">
                    Showing <span className="font-semibold text-gray-900">{products.length}</span> of <span className="font-semibold text-gray-900">{pagination.totalItems || 0}</span> products
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <button onClick={() => setShowSortDropdown(!showSortDropdown)} className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                      <ArrowUpDown className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium hidden sm:inline">{currentSort.label}</span>
                      <span className="text-sm font-medium sm:hidden">Sort</span>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
                    </button>
                    {showSortDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                          {sortOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                handleFilterChange("sort", option.value);
                                setShowSortDropdown(false);
                              }}
                              className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-left transition-colors ${filters.sort === option.value ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"}`}
                            >
                              <span>{option.icon}</span>
                              <span>{option.label}</span>
                              {filters.sort === option.value && <Check className="w-4 h-4 ml-auto" />}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* View Toggle */}
                  <div className="hidden sm:flex items-center bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => {
                        setView("grid");
                        setGridSize(4);
                      }}
                      className={`p-2 rounded-lg transition-colors ${view === "grid" && gridSize === 4 ? "bg-white shadow-sm text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
                      title="Grid View (4 columns)"
                    >
                      <LayoutGrid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setView("grid");
                        setGridSize(3);
                      }}
                      className={`p-2 rounded-lg transition-colors ${view === "grid" && gridSize === 3 ? "bg-white shadow-sm text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}
                      title="Grid View (3 columns)"
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button onClick={() => setView("list")} className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-white shadow-sm text-indigo-600" : "text-gray-400 hover:text-gray-600"}`} title="List View">
                      <Rows className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters Pills */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">Active filters:</span>
                  {filters.category && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700">
                      {categories.find((c) => c.slug === filters.category)?.name || filters.category}
                      <button onClick={() => handleFilterChange("category", "")} className="ml-2 hover:text-indigo-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.minPrice && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                      Min: ${filters.minPrice}
                      <button onClick={() => handleFilterChange("minPrice", "")} className="ml-2 hover:text-green-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.maxPrice && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                      Max: ${filters.maxPrice}
                      <button onClick={() => handleFilterChange("maxPrice", "")} className="ml-2 hover:text-green-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.inStock && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                      In Stock
                      <button onClick={() => handleFilterChange("inStock", false)} className="ml-2 hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.featured && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700">
                      Featured
                      <button onClick={() => handleFilterChange("featured", false)} className="ml-2 hover:text-purple-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.onSale && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-700">
                      On Sale
                      <button onClick={() => handleFilterChange("onSale", false)} className="ml-2 hover:text-red-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700 underline">
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Loading Overlay */}
            {isFetching && !isLoading && (
              <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
                <div className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent" />
                  <span className="text-sm font-medium text-gray-700">Updating...</span>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-6 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">{isServiceBased ? <Calendar className="w-12 h-12 text-gray-300" /> : <Search className="w-12 h-12 text-gray-300" />}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No {terminology?.products?.toLowerCase() || "products"} found</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">We couldn't find any {terminology?.products?.toLowerCase() || "products"} matching your criteria. Try adjusting your filters or search terms.</p>
                <button onClick={clearFilters} className="px-6 py-3 text-white font-semibold rounded-xl transition-colors hover:opacity-90" style={{ backgroundColor: brandColors.primary }}>
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${view === "grid" ? (gridSize === 4 ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3") : "grid-cols-1"}`}>
                {products.map((product) =>
                  isServiceBased ? (
                    <ServiceCard
                      key={product._id || product.id}
                      service={product}
                      variant={view === "list" ? "compact" : "default"}
                      onBook={() => {
                        setSelectedService(product);
                        setBookingModalOpen(true);
                      }}
                    />
                  ) : (
                    <ProductCard key={product._id || product.id} product={product} />
                  ),
                )}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">
                  Page <span className="font-semibold text-gray-900">{pagination.currentPage}</span> of <span className="font-semibold text-gray-900">{pagination.totalPages}</span>
                </p>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handlePageChange(1)} disabled={page === 1} className="px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
                    First
                  </button>
                  <button onClick={() => handlePageChange(page - 1)} disabled={!pagination.hasPrev} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="hidden sm:flex items-center space-x-1">
                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button key={pageNum} onClick={() => handlePageChange(pageNum)} className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${pageNum === page ? "bg-indigo-600 text-white" : "hover:bg-gray-100 text-gray-700"}`}>
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button onClick={() => handlePageChange(page + 1)} disabled={!pagination.hasNext} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
                    Next
                  </button>
                  <button onClick={() => handlePageChange(pagination.totalPages)} disabled={page === pagination.totalPages} className="px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
                    Last
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showFilters && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-50 lg:hidden overflow-y-auto shadow-2xl">
            <div className="sticky top-0 p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Filters</h3>
              </div>
              <button onClick={() => setShowFilters(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Categories */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Tag className="w-4 h-4 mr-2 text-indigo-500" />
                  Category
                </h4>
                <div className="space-y-1">
                  <button onClick={() => handleFilterChange("category", "")} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${!filters.category ? "bg-indigo-600 text-white font-medium shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
                    <span className="flex items-center">
                      <span className={`w-2 h-2 rounded-full mr-2 ${!filters.category ? "bg-white" : "bg-gray-300"}`}></span>
                      All Products
                    </span>
                    {!filters.category && <Check className="w-4 h-4" />}
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category._id || category.id}
                      onClick={() => handleFilterChange("category", category.slug)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${filters.category === category.slug ? "bg-indigo-600 text-white font-medium shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                      <span className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${filters.category === category.slug ? "bg-white" : "bg-gray-300"}`}></span>
                        {category.name}
                      </span>
                      {filters.category === category.slug && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h4>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => handleFilterChange("minPrice", e.target.value)} className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
                  </div>
                  <span className="text-gray-300">—</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => handleFilterChange("maxPrice", e.target.value)} className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
                  </div>
                </div>
              </div>

              {/* Quick Filters */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Filters</h4>
                <div className="space-y-2">
                  <label className="flex items-center p-3 rounded-xl bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={filters.inStock} onChange={(e) => handleFilterChange("inStock", e.target.checked)} className="rounded border-gray-300 text-indigo-600 w-4 h-4" />
                    <span className="ml-3 text-sm text-gray-700">In Stock Only</span>
                  </label>
                  <label className="flex items-center p-3 rounded-xl bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={filters.featured} onChange={(e) => handleFilterChange("featured", e.target.checked)} className="rounded border-gray-300 text-indigo-600 w-4 h-4" />
                    <span className="ml-3 text-sm text-gray-700">Featured</span>
                  </label>
                  <label className="flex items-center p-3 rounded-xl bg-gray-50 cursor-pointer">
                    <input type="checkbox" checked={filters.onSale} onChange={(e) => handleFilterChange("onSale", e.target.checked)} className="rounded border-gray-300 text-indigo-600 w-4 h-4" />
                    <span className="ml-3 text-sm text-gray-700">On Sale</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Mobile Filter Actions */}
            <div className="sticky bottom-0 p-4 bg-white border-t border-gray-100 flex space-x-3">
              <button onClick={clearFilters} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
                Clear All
              </button>
              <button onClick={() => setShowFilters(false)} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
                Show {pagination.totalItems || 0} Results
              </button>
            </div>
          </div>
        </>
      )}

      {/* Booking Modal for Services */}
      {isServiceBased && <BookingModal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} service={selectedService} />}
    </div>
  );
}
