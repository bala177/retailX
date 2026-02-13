import { useState, useMemo } from "react";
import { Calendar, Clock, Truck, MapPin, ChevronLeft, ChevronRight, Check, Zap, Package, Info } from "lucide-react";

const TIME_SLOTS = [
  { id: "morning", label: "Morning", time: "9:00 AM – 12:00 PM", icon: "🌅" },
  { id: "afternoon", label: "Afternoon", time: "12:00 PM – 4:00 PM", icon: "☀️" },
  { id: "evening", label: "Evening", time: "4:00 PM – 8:00 PM", icon: "🌇" },
];

const DELIVERY_TYPES = [
  { id: "standard", label: "Standard Delivery", fee: 4.99, desc: "Regular delivery slot", icon: Truck },
  { id: "express", label: "Express Delivery", fee: 9.99, desc: "Priority 2-hour window", icon: Zap },
  { id: "pickup", label: "Store Pickup", fee: 0, desc: "Pick up from our bakery", icon: Package },
];

export default function DeliveryScheduler({ prepTimeHours = 12, onDeliveryChange, currencySymbol = "$" }) {
  const [deliveryType, setDeliveryType] = useState(DELIVERY_TYPES[0]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Calculate minimum date based on prep time
  const minDate = useMemo(() => {
    const now = new Date();
    const min = new Date(now.getTime() + prepTimeHours * 60 * 60 * 1000);
    // If prep time pushes past 10 AM, add a day for same-day cutoff
    if (prepTimeHours < 24 && now.getHours() >= 10) {
      min.setDate(min.getDate() + 1);
    }
    min.setHours(0, 0, 0, 0);
    return min;
  }, [prepTimeHours]);

  const maxDate = useMemo(() => {
    const max = new Date();
    max.setDate(max.getDate() + 30);
    return max;
  }, []);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay(); // 0=Sun
    const days = [];

    // Padding
    for (let i = 0; i < startPad; i++) {
      days.push(null);
    }
    // Actual days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      date.setHours(0, 0, 0, 0);
      const isDisabled = date < minDate || date > maxDate;
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      days.push({ date, day: d, isDisabled, isToday, isSelected });
    }
    return days;
  }, [currentMonth, minDate, maxDate, selectedDate]);

  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  const nextAvailable = useMemo(() => {
    const d = new Date(minDate);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }, [minDate]);

  const navigateMonth = (dir) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + dir);
    setCurrentMonth(newMonth);
  };

  const handleDateSelect = (dayObj) => {
    if (!dayObj || dayObj.isDisabled) return;
    setSelectedDate(dayObj.date);
    notifyChange({ date: dayObj.date });
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    notifyChange({ slot });
  };

  const handleTypeSelect = (type) => {
    setDeliveryType(type);
    notifyChange({ type });
  };

  const notifyChange = (updates = {}) => {
    const info = {
      type: updates.type?.id || deliveryType.id,
      typeLabel: updates.type?.label || deliveryType.label,
      fee: updates.type?.fee ?? deliveryType.fee,
      expressFee: updates.type?.id === "express" || deliveryType.id === "express" ? 9.99 : 4.99,
      date: updates.date || selectedDate,
      dateFormatted:
        (updates.date || selectedDate)?.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }) || null,
      slot: updates.slot?.id || selectedSlot?.id,
      slotLabel: updates.slot?.label || selectedSlot?.label,
      slotTime: updates.slot?.time || selectedSlot?.time,
    };
    onDeliveryChange?.(info);
  };

  const isComplete = selectedDate && selectedSlot;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
          <Truck className="w-4 h-4 text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Delivery / Pickup</h3>
      </div>

      {/* Next Available */}
      <div className="flex items-center space-x-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
        <Zap className="w-4 h-4 text-emerald-600" />
        <span className="text-sm text-emerald-800">
          Next available: <strong>{nextAvailable}</strong>
        </span>
      </div>

      {/* Delivery Type */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Delivery Method</p>
        <div className="grid grid-cols-3 gap-2">
          {DELIVERY_TYPES.map((type) => (
            <button key={type.id} onClick={() => handleTypeSelect(type)} className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${deliveryType.id === type.id ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-gray-200 hover:border-emerald-300"}`}>
              <type.icon className={`w-5 h-5 mx-auto mb-1 ${deliveryType.id === type.id ? "text-emerald-600" : "text-gray-400"}`} />
              <p className="text-xs font-semibold text-gray-900">{type.label}</p>
              <p className={`text-xs font-bold mt-1 ${type.fee === 0 ? "text-emerald-600" : "text-gray-600"}`}>{type.fee === 0 ? "FREE" : `${currencySymbol}${type.fee.toFixed(2)}`}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Calendar */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        {/* Month Navigation */}
        <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
          <button onClick={() => navigateMonth(-1)} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="font-semibold text-gray-900 text-sm">{monthName}</span>
          <button onClick={() => navigateMonth(1)} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 text-center border-b border-gray-100">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2 text-xs font-medium text-gray-500">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 p-2 gap-1">
          {calendarDays.map((dayObj, i) => {
            if (!dayObj) return <div key={`pad-${i}`} />;
            return (
              <button
                key={dayObj.day}
                onClick={() => handleDateSelect(dayObj)}
                disabled={dayObj.isDisabled}
                className={`relative w-full aspect-square flex items-center justify-center rounded-lg text-sm transition-all
                  ${dayObj.isSelected ? "bg-amber-500 text-white font-bold shadow-md" : dayObj.isToday ? "bg-amber-50 text-amber-700 font-semibold border border-amber-200" : dayObj.isDisabled ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:bg-amber-50 hover:text-amber-700"}
                `}
              >
                {dayObj.day}
                {dayObj.isToday && !dayObj.isSelected && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-500 rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">{deliveryType.id === "pickup" ? "Pickup Time" : "Delivery Time"}</p>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((slot) => (
              <button key={slot.id} onClick={() => handleSlotSelect(slot)} className={`p-3 rounded-xl border-2 text-center transition-all duration-200 ${selectedSlot?.id === slot.id ? "border-amber-500 bg-amber-50 shadow-sm" : "border-gray-200 hover:border-amber-300"}`}>
                <span className="text-lg">{slot.icon}</span>
                <p className="text-xs font-semibold text-gray-900 mt-1">{slot.label}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{slot.time}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {isComplete && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200">
          <div className="flex items-center space-x-2 mb-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-emerald-800">{deliveryType.id === "pickup" ? "Pickup Scheduled" : "Delivery Scheduled"}</span>
          </div>
          <div className="space-y-1 text-sm text-gray-700">
            <p className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              {selectedSlot.time}
            </p>
            <p className="flex items-center">
              <deliveryType.icon className="w-4 h-4 mr-2 text-gray-400" />
              {deliveryType.label}
              {deliveryType.fee > 0 && (
                <span className="ml-1 text-gray-500">
                  ({currencySymbol}
                  {deliveryType.fee.toFixed(2)})
                </span>
              )}
              {deliveryType.fee === 0 && <span className="ml-1 text-emerald-600 font-medium">FREE</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
