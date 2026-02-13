import { AlertTriangle, Clock, Flame, TrendingUp, CheckCircle } from "lucide-react";

// Simulated daily capacity - in production this would come from backend
function getCapacityForProduct(productId) {
  // Use productId hash to generate consistent pseudo-random capacity
  const hash = (productId || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const dailyLimit = 15 + (hash % 10); // 15-24 per day
  // Deterministic "random-like" value so UI does not flicker on re-renders
  const ordersToday = (hash * 7) % Math.max(1, Math.floor(dailyLimit * 0.9));
  const remaining = Math.max(0, dailyLimit - ordersToday);
  return { dailyLimit, ordersToday, remaining };
}

export default function CapacityIndicator({ productId, productName }) {
  const { dailyLimit, remaining } = getCapacityForProduct(productId);

  const percentage = ((dailyLimit - remaining) / dailyLimit) * 100;
  const isLow = remaining <= 5 && remaining > 0;
  const isSoldOut = remaining === 0;
  const isAvailable = remaining > 5;

  if (isSoldOut) {
    return (
      <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-800">Sold Out for Today</p>
            <p className="text-xs text-red-600 mt-0.5">All {dailyLimit} slots taken. Please select a future date for delivery.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLow) {
    return (
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
            <Flame className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-amber-800">
              🔥 Only {remaining} slot{remaining > 1 ? "s" : ""} left today!
            </p>
            <p className="text-xs text-amber-600 mt-0.5">High demand — order soon to secure your {productName || "order"}.</p>
          </div>
        </div>
        {/* Capacity bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-amber-700 mb-1">
            <span>{dailyLimit - remaining} ordered</span>
            <span>{remaining} remaining</span>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-2">
            <div className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500" style={{ width: `${percentage}%` }} />
          </div>
        </div>
      </div>
    );
  }

  // Available
  return (
    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-emerald-800">Available Today</p>
          <p className="text-xs text-emerald-600">
            {remaining} of {dailyLimit} slots remaining
          </p>
        </div>
        <div className="flex items-center text-xs text-emerald-600">
          <TrendingUp className="w-3 h-3 mr-1" />
          Popular
        </div>
      </div>
    </div>
  );
}
