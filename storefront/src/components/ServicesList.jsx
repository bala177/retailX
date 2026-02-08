import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { useQuery } from "@tanstack/react-query";
import { productsAPI, categoriesAPI } from "../services/api";
import ServiceCard from "./ServiceCard";
import { Link } from "react-router-dom";
import { Clock, Star, ArrowRight, Filter, Calendar, ChevronDown, Search, Sparkles, Award, Users, CheckCircle } from "lucide-react";

export default function ServicesList({ showFilters = true, limit = null, showHeader = true }) {
  const { store, storeSlug, terminology } = useStore();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  const brandColors = {
    primary: store?.branding?.primaryColor || "#6366f1",
    secondary: store?.branding?.secondaryColor || "#4f46e5",
  };

  // Fetch services
  const { data: servicesData, isLoading } = useQuery({
    queryKey: ["services-list", storeSlug, selectedCategory, sortBy],
    queryFn: () =>
      productsAPI.getAll({
        limit: limit || 50,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        sort: sortBy === "popular" ? "-ratings.count" : sortBy === "rating" ? "-ratings.average" : sortBy === "price-low" ? "pricing.basePrice" : sortBy === "price-high" ? "-pricing.basePrice" : "-createdAt",
      }),
    enabled: !!storeSlug,
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["categories", storeSlug],
    queryFn: categoriesAPI.getAll,
    enabled: !!storeSlug,
  });

  const services = servicesData?.data?.data?.products || [];
  const categories = categoriesData?.data?.data?.categories || [];

  const sortOptions = [
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Highest Rated" },
    { value: "newest", label: "Newest" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
  ];

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {showHeader && (
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: `${brandColors.primary}15`, color: brandColors.primary }}>
              <Sparkles className="w-4 h-4 mr-2" />
              {terminology?.products || "Services"}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Professional {terminology?.products || "Services"}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Choose from our wide range of professional treatments and services, each delivered by certified experts committed to your satisfaction.</p>
          </div>
        )}

        {/* Filters Bar */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === "all" ? "text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  style={selectedCategory === "all" ? { backgroundColor: brandColors.primary } : {}}
                >
                  All {terminology?.products || "Services"}
                </button>
                {categories.slice(0, 5).map((category) => (
                  <button
                    key={category._id || category.id}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category.slug ? "text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    style={selectedCategory === category.slug ? { backgroundColor: brandColors.primary } : {}}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="appearance-none bg-gray-100 border-0 rounded-full px-4 py-2 pr-10 text-sm font-medium text-gray-600 focus:ring-2 focus:bg-white cursor-pointer" style={{ "--tw-ring-color": brandColors.primary }}>
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* Services Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="flex justify-between pt-4 border-t border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-20" />
                    <div className="h-9 bg-gray-200 rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No {terminology?.products?.toLowerCase() || "services"} found</h3>
            <p className="text-gray-500 mb-6">Try selecting a different category or check back later.</p>
            <button onClick={() => setSelectedCategory("all")} className="px-6 py-3 rounded-full text-white font-semibold transition-all hover:opacity-90" style={{ backgroundColor: brandColors.primary }}>
              View All {terminology?.products || "Services"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => (
              <ServiceCard key={service._id || service.id} service={service} />
            ))}
          </div>
        )}

        {/* View All Link */}
        {limit && services.length >= limit && (
          <div className="text-center mt-10">
            <Link to="/products" className="inline-flex items-center px-8 py-4 rounded-full text-white font-semibold transition-all hover:shadow-lg" style={{ backgroundColor: brandColors.primary }}>
              View All {terminology?.products || "Services"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
