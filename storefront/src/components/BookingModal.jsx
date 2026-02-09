import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { staffAPI, bookingAPI } from "../services/api";
import { X, Calendar, Clock, ChevronLeft, ChevronRight, Check, User, Users, Sparkles, AlertCircle, LogIn, PhoneCall, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function BookingModal({ isOpen, onClose, service }) {
  const navigate = useNavigate();
  const { store, features, bookingSettings } = useStore();
  const { addItem } = useCart();
  const { isAuthenticated, user, openAuthModal } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState("any");
  const [guestCount, setGuestCount] = useState(1);
  const [notes, setNotes] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [staffMembers, setStaffMembers] = useState([{ id: "any", name: "Any Available", specialty: "Best available match" }]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const brandColors = {
    primary: store?.branding?.primaryColor || "#00897B",
    secondary: store?.branding?.secondaryColor || "#00695C",
  };

  // Reset state when modal opens and fetch staff
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedStaff("any");
      setGuestCount(1);
      setNotes("");
      setCurrentMonth(new Date());
      setAvailableSlots([]);

      // Fetch real staff from API
      setLoadingStaff(true);
      staffAPI
        .getAll()
        .then((res) => {
          const apiStaff = res.data?.data?.staff || [];
          const staffList = [{ id: "any", name: "Any Available", specialty: "Best available match" }];
          apiStaff.forEach((s) => {
            staffList.push({
              id: s._id,
              name: s.name,
              specialty: s.title || s.specialties?.join(", ") || "",
              avatar: s.avatar || null,
            });
          });
          setStaffMembers(staffList);
        })
        .catch(() => {
          // Keep default "Any Available" on error
        })
        .finally(() => setLoadingStaff(false));
    }
  }, [isOpen]);

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days = [];

    // Add padding for days before the first of the month
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Check if a date is available (not in the past, not too far in future)
  const isDateAvailable = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const advanceDays = bookingSettings?.advanceBookingDays || 60;
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + advanceDays);

    // Check if the day is open based on working hours
    if (bookingSettings?.workingHours) {
      const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const dayName = dayNames[date.getDay()];
      const dayHours = bookingSettings.workingHours[dayName];
      if (dayHours && !dayHours.isOpen) {
        return false;
      }
    }

    return date >= today && date <= maxDate;
  };

  // Fetch available time slots from API when date changes
  useEffect(() => {
    if (!selectedDate || !service) return;
    setLoadingSlots(true);
    setSelectedTime(null);

    const dateStr = selectedDate.toISOString().split("T")[0];
    const staffId = selectedStaff !== "any" ? selectedStaff : undefined;
    const duration = parseInt(service?.duration) || bookingSettings?.slotDuration || 60;

    bookingAPI
      .getAvailability({ date: dateStr, staffId, duration })
      .then((res) => {
        const slots = res.data?.data?.slots || res.data?.data?.availableSlots || [];
        if (Array.isArray(slots) && slots.length > 0) {
          setAvailableSlots(slots.map((s) => (typeof s === "string" ? { time: s, available: true } : s)));
        } else {
          // Fallback: generate slots locally from booking settings
          setAvailableSlots(generateTimeSlotsLocal());
        }
      })
      .catch(() => {
        // Fallback: generate slots locally from booking settings
        setAvailableSlots(generateTimeSlotsLocal());
      })
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, selectedStaff]);

  // Fallback local time slot generation from booking settings (no random simulation)
  const generateTimeSlotsLocal = () => {
    const slots = [];
    const duration = parseInt(service?.duration) || bookingSettings?.slotDuration || 60;
    const bufferTime = bookingSettings?.bufferTime || 0;

    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const selectedDayName = selectedDate ? dayNames[selectedDate.getDay()] : "monday";
    const dayHours = bookingSettings?.workingHours?.[selectedDayName];

    let startHour = 9;
    let endHour = 20;

    if (dayHours && dayHours.isOpen) {
      const [openH] = (dayHours.open || "09:00").split(":").map(Number);
      const [closeH] = (dayHours.close || "20:00").split(":").map(Number);
      startHour = openH;
      endHour = closeH;
    } else if (dayHours && !dayHours.isOpen) {
      return slots;
    }

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const totalMinutes = hour * 60 + minute + duration + bufferTime;
        if (totalMinutes <= endHour * 60) {
          const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
          slots.push({ time, available: true });
        }
      }
    }
    return slots;
  };

  // Format time for display
  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDateSelect = (date) => {
    if (isDateAvailable(date)) {
      setSelectedDate(date);
      // Time slots will be fetched via useEffect
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time");
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Show auth modal with callback to complete booking after login
      openAuthModal("register", () => {
        // This callback runs after successful login/register
        completeBooking();
      });
      return;
    }

    completeBooking();
  };

  const completeBooking = async () => {
    setSubmittingBooking(true);
    try {
      // Submit booking via API
      const bookingPayload = {
        serviceId: service._id || service.id,
        serviceName: service.name,
        date: selectedDate.toISOString().split("T")[0],
        time: selectedTime,
        staffId: selectedStaff !== "any" ? selectedStaff : undefined,
        notes: notes,
        guestCount: guestCount,
        customerName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : undefined,
        customerEmail: user?.email,
        customerPhone: user?.phone,
      };

      await bookingAPI.create(bookingPayload);

      // Also add to cart for payment flow
      const bookingItem = {
        productId: service._id || service.id,
        name: service.name,
        price: service.pricing?.salePrice || service.pricing?.basePrice || service.currentPrice || 0,
        image: service.primaryImage || service.images?.[0]?.url,
        quantity: guestCount,
        bookingDetails: {
          date: selectedDate.toISOString(),
          time: selectedTime,
          staff: selectedStaff === "any" ? null : staffMembers.find((s) => s.id === selectedStaff),
          notes: notes,
          guestCount: guestCount,
        },
      };

      addItem(bookingItem);
      toast.success("Booking confirmed! Proceeding to checkout.");
      onClose();
      navigate("/checkout", { state: { fromBooking: true, serviceName: service.name } });
    } catch (error) {
      // If booking API fails, still add to cart as fallback
      const bookingItem = {
        productId: service._id || service.id,
        name: service.name,
        price: service.pricing?.salePrice || service.pricing?.basePrice || service.currentPrice || 0,
        image: service.primaryImage || service.images?.[0]?.url,
        quantity: guestCount,
        bookingDetails: {
          date: selectedDate.toISOString(),
          time: selectedTime,
          staff: selectedStaff === "any" ? null : staffMembers.find((s) => s.id === selectedStaff),
          notes: notes,
          guestCount: guestCount,
        },
      };

      addItem(bookingItem);
      onClose();
      navigate("/checkout", { state: { fromBooking: true, serviceName: service.name } });
    } finally {
      setSubmittingBooking(false);
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const timeSlots = availableSlots;
  const calendarDays = generateCalendarDays();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const currentPrice = service?.pricing?.salePrice || service?.pricing?.basePrice || service?.currentPrice || 0;
  const duration = service?.duration || service?.variantOptions?.find((v) => v.name === "Duration")?.values?.[0] || "60 min";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center space-x-4">
              {step > 1 && (
                <button onClick={() => setStep(step - 1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
                <p className="text-sm text-gray-500">{service?.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center justify-between max-w-md mx-auto">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${step >= s ? "text-white" : "bg-gray-200 text-gray-500"}`} style={step >= s ? { backgroundColor: brandColors.primary } : {}}>
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </div>
                  {s < 3 && <div className={`w-16 h-1 mx-2 rounded-full ${step > s ? "bg-green-500" : "bg-gray-200"}`} />}
                </div>
              ))}
            </div>
            <div className="flex justify-between max-w-md mx-auto mt-2 text-xs text-gray-500">
              <span>Select Date</span>
              <span>Choose Time</span>
              <span>Confirm</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Step 1: Select Date */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Service Summary */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <img src={service?.primaryImage || service?.images?.[0]?.url || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100"} alt={service?.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{service?.name}</h3>
                    <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {duration}
                      </span>
                      <span className="font-semibold" style={{ color: brandColors.primary }}>
                        ${currentPrice}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Calendar */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Select a Date</h3>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      <span className="text-sm font-medium text-gray-700 min-w-[140px] text-center">{currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                      <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Week days header */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((date, index) => {
                      const isAvailable = isDateAvailable(date);
                      const isSelected = selectedDate && date && selectedDate.toDateString() === date.toDateString();
                      const isToday = date && new Date().toDateString() === date.toDateString();

                      return (
                        <button
                          key={index}
                          onClick={() => handleDateSelect(date)}
                          disabled={!isAvailable}
                          className={`
                            aspect-square flex items-center justify-center text-sm rounded-lg transition-all
                            ${!date ? "invisible" : ""}
                            ${isSelected ? "text-white font-semibold ring-2 ring-offset-2" : ""}
                            ${isAvailable && !isSelected ? "hover:bg-gray-100 text-gray-700" : ""}
                            ${!isAvailable && date ? "text-gray-300 cursor-not-allowed" : ""}
                            ${isToday && !isSelected ? "font-semibold ring-1 ring-gray-300" : ""}
                          `}
                          style={isSelected ? { backgroundColor: brandColors.primary, ringColor: brandColors.primary } : {}}
                        >
                          {date?.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedDate && (
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <span className="text-green-800 font-medium">{formatDate(selectedDate)}</span>
                    </div>
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Select Time & Staff */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Selected Date Display */}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">{formatDate(selectedDate)}</span>
                </div>

                {/* Time Slots */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Available Time Slots</h3>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                      <span className="ml-2 text-gray-500">Checking availability...</span>
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No available slots for this date</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map(({ time, available }) => (
                        <button
                          key={time}
                          onClick={() => available && setSelectedTime(time)}
                          disabled={!available}
                          className={`
                          py-3 px-2 text-sm rounded-lg font-medium transition-all
                          ${selectedTime === time ? "text-white" : ""}
                          ${available && selectedTime !== time ? "bg-gray-100 hover:bg-gray-200 text-gray-700" : ""}
                          ${!available ? "bg-gray-50 text-gray-300 cursor-not-allowed line-through" : ""}
                        `}
                          style={selectedTime === time ? { backgroundColor: brandColors.primary } : {}}
                        >
                          {formatTime(time)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Staff Selection */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Select Therapist (Optional)</h3>
                  {loadingStaff ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      <span className="ml-2 text-gray-500">Loading team...</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {staffMembers.map((staff) => (
                        <button key={staff.id} onClick={() => setSelectedStaff(staff.id)} className={`w-full flex items-center space-x-4 p-4 rounded-xl border-2 transition-all ${selectedStaff === staff.id ? "border-green-500 bg-green-50" : "border-gray-100 hover:border-gray-200 bg-white"}`}>
                          {staff.avatar ? (
                            <img src={staff.avatar} alt={staff.name} className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                              <Users className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">{staff.name}</p>
                            <p className="text-sm text-gray-500">{staff.specialty}</p>
                          </div>
                          {selectedStaff === staff.id && <Check className="w-5 h-5 text-green-600" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Confirm Booking */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Booking Summary */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" style={{ color: brandColors.primary }} />
                    Booking Summary
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service</span>
                      <span className="font-medium text-gray-900">{service?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date</span>
                      <span className="font-medium text-gray-900">{formatDate(selectedDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time</span>
                      <span className="font-medium text-gray-900">{formatTime(selectedTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium text-gray-900">{duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Therapist</span>
                      <span className="font-medium text-gray-900">{staffMembers.find((s) => s.id === selectedStaff)?.name || "Any Available"}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-bold" style={{ color: brandColors.primary }}>
                      ${currentPrice * guestCount}
                    </span>
                  </div>
                </div>

                {/* Guest Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests</label>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => setGuestCount(Math.max(1, guestCount - 1))} className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                      -
                    </button>
                    <span className="w-12 text-center font-semibold text-lg">{guestCount}</span>
                    <button onClick={() => setGuestCount(Math.min(10, guestCount + 1))} className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                      +
                    </button>
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requests or notes for your appointment..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-offset-0 resize-none"
                    style={{ focusRingColor: brandColors.primary }}
                    rows={3}
                  />
                </div>

                {/* Cancellation Policy */}
                <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800">Cancellation Policy</p>
                    <p className="text-amber-700 mt-1">Free cancellation up to 24 hours before your appointment. Late cancellations may incur a fee.</p>
                  </div>
                </div>

                {/* Account Status */}
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: brandColors.primary }}>
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <LogIn className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium text-blue-800">Sign in to confirm your booking</p>
                      <p className="text-blue-600">Create an account or sign in to manage your appointments</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
            {step < 3 ? (
              <button
                onClick={() => {
                  if (step === 1 && !selectedDate) {
                    toast.error("Please select a date");
                    return;
                  }
                  if (step === 2 && !selectedTime) {
                    toast.error("Please select a time slot");
                    return;
                  }
                  setStep(step + 1);
                }}
                className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: brandColors.primary }}
              >
                Continue
              </button>
            ) : (
              <button onClick={handleConfirmBooking} disabled={submittingBooking} className="w-full py-4 rounded-xl font-semibold text-white transition-all hover:opacity-90 flex items-center justify-center space-x-2 disabled:opacity-50" style={{ backgroundColor: brandColors.primary }}>
                {submittingBooking ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Confirming...</span>
                  </>
                ) : isAuthenticated ? (
                  <>
                    <Calendar className="w-5 h-5" />
                    <span>Confirm Booking</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In & Confirm</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
