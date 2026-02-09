import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useCart } from "../context/CartContext";
import { platformAPI } from "../services/api";
import { Store, ArrowRight, Check, Package, Calendar, Loader2, AlertCircle, RefreshCw } from "lucide-react";

// Industry colors mapping
const INDUSTRY_CONFIG = {
  fashion: { color: "bg-pink-500", gradient: "from-pink-500 to-rose-500" },
  grocery: { color: "bg-green-500", gradient: "from-green-500 to-emerald-500" },
  electronics: { color: "bg-blue-500", gradient: "from-blue-500 to-indigo-500" },
  cosmetics: { color: "bg-purple-500", gradient: "from-purple-500 to-pink-500" },
  wellness: { color: "bg-teal-500", gradient: "from-teal-500 to-emerald-500" },
  healthcare: { color: "bg-blue-600", gradient: "from-blue-500 to-indigo-600" },
  general: { color: "bg-indigo-500", gradient: "from-indigo-500 to-purple-500" },
};

export default function StoreSelector() {
  const navigate = useNavigate();
  const { storeSlug, switchStore } = useStore();
  const { clearCart } = useCart();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isWakingUp, setIsWakingUp] = useState(false);

  // Fetch stores from API with auto-retry for Render cold starts
  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async (attempt = 0) => {
    const maxRetries = 3;
    try {
      setLoading(true);
      setError(null);
      if (attempt > 0) {
        setIsWakingUp(true);
      }
      const response = await platformAPI.getStores();
      const storesList = response.data?.data?.stores || [];
      setStores(storesList);
      setIsWakingUp(false);
      setRetryCount(0);
      setLoading(false);

      // If current storeSlug is not in the list, it's invalid - clear it
      if (storeSlug && !storesList.find((s) => s.slug === storeSlug)) {
        localStorage.removeItem("storeSlug");
      }
    } catch (err) {
      console.error(`Failed to fetch stores (attempt ${attempt + 1}/${maxRetries + 1}):`, err);

      // Auto-retry for network errors or 5xx (likely cold start)
      const isNetworkError = !err.response || err.code === "ECONNABORTED" || err.code === "ERR_NETWORK";
      const isServerError = err.response?.status >= 500;

      if ((isNetworkError || isServerError) && attempt < maxRetries) {
        setIsWakingUp(true);
        setRetryCount(attempt + 1);
        // Exponential backoff: 2s, 4s, 8s
        const delay = Math.pow(2, attempt + 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchStores(attempt + 1);
      }

      setIsWakingUp(false);
      setLoading(false);
      setError(
        isNetworkError
          ? "Server is starting up. Please wait a moment and try again."
          : "Failed to load stores. Please try again."
      );
    } finally {
      // Loading is cleared in success/error paths above
    }
  };

  const handleSelectStore = (slug) => {
    clearCart();
    switchStore(slug);
  };

  const getIndustryConfig = (industry) => {
    return INDUSTRY_CONFIG[industry] || INDUSTRY_CONFIG.general;
  };

  const formatStoreName = (slug) => {
    if (!slug) return "";
    return slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  // Check if current store is valid
  const isCurrentStoreValid = storeSlug && stores.find((s) => s.slug === storeSlug);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Top Navigation Bar */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600 rounded-xl">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">RetailX</span>
              <span className="hidden sm:inline text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-full">Platform</span>
            </div>
            {isCurrentStoreValid && (
              <button onClick={() => navigate("/")} className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full transition-colors">
                <span>Back to {formatStoreName(storeSlug)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-indigo-600/20 rounded-2xl border border-indigo-500/30">
                <Store className="w-12 h-12 text-indigo-400" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Welcome to <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">RetailX</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">Select a store to start shopping.</p>
            {isCurrentStoreValid && (
              <div className="inline-flex items-center space-x-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm border border-green-500/30">
                <Check className="w-4 h-4" />
                <span>
                  Currently shopping at: <strong>{formatStoreName(storeSlug)}</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Store Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 -mt-6">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-gray-400">{isWakingUp ? "Server is waking up, please wait..." : "Loading stores..."}</p>
            {isWakingUp && (
              <p className="text-gray-500 text-sm mt-2">This may take up to 30 seconds on first visit</p>
            )}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-gray-400 mb-4">{error}</p>
            <button onClick={fetchStores} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && stores.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <Store className="w-12 h-12 text-gray-500 mb-4" />
            <p className="text-gray-400 text-lg">No stores available</p>
            <p className="text-gray-500 text-sm mt-2">Please check back later</p>
          </div>
        )}

        {/* Stores Grid */}
        {!loading && !error && stores.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stores.map((store) => {
              const config = getIndustryConfig(store.industry);
              const isSelected = isCurrentStoreValid && storeSlug === store.slug;
              const isService = store.businessType === "services" || store.features?.bookingEnabled;

              return (
                <div key={store.id} className={`relative group cursor-pointer transform transition-all duration-300 hover:-translate-y-2 ${isSelected ? "ring-4 ring-indigo-500 ring-offset-4 ring-offset-gray-900 rounded-2xl" : ""}`} onClick={() => handleSelectStore(store.slug)}>
                  <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-700 hover:border-gray-600 transition-colors">
                    {/* Gradient Header */}
                    <div className="relative h-32 overflow-hidden">
                      <div className={`w-full h-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                        <Store className="w-16 h-16 text-white/30" />
                      </div>
                      <div className={`absolute inset-0 bg-gradient-to-t ${config.gradient} opacity-60`} />
                      <div className="absolute top-4 left-4">
                        <div className={`p-2 ${config.color} rounded-xl`}>
                          <Store className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      {/* Business Type Badge */}
                      <div className="absolute bottom-4 left-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${isService ? "bg-purple-500/90 text-white" : "bg-blue-500/90 text-white"}`}>
                          {isService ? <Calendar className="w-3 h-3 mr-1" /> : <Package className="w-3 h-3 mr-1" />}
                          {isService ? "Services" : "Products"}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-4 right-4 bg-white rounded-full p-1">
                          <Check className="w-5 h-5 text-indigo-600" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-white mb-2">{store.name}</h2>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{store.description || `Welcome to ${store.name}`}</p>

                      {/* Industry Badge */}
                      <div className="mb-4">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-700 text-gray-300 capitalize">{store.industry}</span>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {store.features?.paymentEnabled && <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Payment</span>}
                        {store.features?.cartEnabled && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Cart</span>}
                        {store.features?.bookingEnabled && <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Booking</span>}
                      </div>

                      {/* Button */}
                      <button className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center transition-colors ${isSelected ? "bg-indigo-600 text-white" : "bg-gray-700 text-white hover:bg-gray-600"}`}>
                        {isSelected ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Currently Selected
                          </>
                        ) : (
                          <>
                            Enter Store
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Section */}
        {!loading && !error && stores.length > 0 && (
          <div className="mt-16 text-center">
            <div className="inline-flex items-center px-6 py-3 bg-gray-800/50 rounded-full border border-gray-700">
              <span className="text-gray-400 text-sm">
                {stores.length} store{stores.length !== 1 ? "s" : ""} available. Each store has unique products and branding.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
