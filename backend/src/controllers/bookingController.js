const { Staff, Booking } = require("../models");
const { asyncHandler } = require("../utils/helpers");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const logger = require("../utils/logger");

// ═══════════ STAFF MANAGEMENT (Admin) ═══════════

/**
 * Get all staff members
 * GET /api/v1/store/:tenantSlug/staff
 */
const getStaff = asyncHandler(async (req, res) => {
  const filter = { tenant: req.tenant._id };
  if (req.query.active !== "false") filter.isActive = true;

  const staff = await Staff.find(filter).sort("sortOrder firstName").populate("services", "name price");

  res.json({ status: "success", data: { staff } });
});

/**
 * Get single staff member
 * GET /api/v1/store/:tenantSlug/staff/:id
 */
const getStaffById = asyncHandler(async (req, res) => {
  const staff = await Staff.findOne({ _id: req.params.id, tenant: req.tenant._id }).populate("services", "name price description");
  if (!staff) throw new NotFoundError("Staff member not found");

  res.json({ status: "success", data: { staff } });
});

/**
 * Create staff member (Admin)
 * POST /api/v1/store/:tenantSlug/staff
 */
const createStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.create({ ...req.body, tenant: req.tenant._id });
  logger.info(`Staff member created: ${staff.fullName} for tenant ${req.tenant.slug}`);
  res.status(201).json({ status: "success", data: { staff } });
});

/**
 * Update staff member (Admin)
 * PATCH /api/v1/store/:tenantSlug/staff/:id
 */
const updateStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findOneAndUpdate({ _id: req.params.id, tenant: req.tenant._id }, req.body, { new: true, runValidators: true });
  if (!staff) throw new NotFoundError("Staff member not found");

  res.json({ status: "success", data: { staff } });
});

/**
 * Delete staff member (Admin)
 * DELETE /api/v1/store/:tenantSlug/staff/:id
 */
const deleteStaff = asyncHandler(async (req, res) => {
  const staff = await Staff.findOneAndDelete({ _id: req.params.id, tenant: req.tenant._id });
  if (!staff) throw new NotFoundError("Staff member not found");

  res.json({ status: "success", message: "Staff member deleted" });
});

// ═══════════ BOOKING SYSTEM ═══════════

/**
 * Get available time slots for a staff member on a date
 * GET /api/v1/store/:tenantSlug/bookings/availability
 */
const getAvailability = asyncHandler(async (req, res) => {
  const { staffId, date, duration = 60 } = req.query;

  if (!staffId || !date) {
    throw new BadRequestError("staffId and date are required");
  }

  const staff = await Staff.findOne({ _id: staffId, tenant: req.tenant._id, isActive: true });
  if (!staff) throw new NotFoundError("Staff member not found");

  // Get day of week
  const dateObj = new Date(date);
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayName = days[dateObj.getDay()];

  const dayHours = staff.workingHours?.[dayName] || req.tenant.bookingSettings?.workingHours?.[dayName];
  if (!dayHours || !dayHours.enabled) {
    return res.json({ status: "success", data: { slots: [], message: "Not available on this day" } });
  }

  // Get existing bookings for this staff on this date
  const bookedSlots = await Booking.getBookedSlots(req.tenant._id, staffId, date);

  // Generate available time slots
  const slotDuration = parseInt(duration, 10) || req.tenant.bookingSettings?.slotDuration || 60;
  const bufferTime = req.tenant.bookingSettings?.bufferTime || 15;

  const slots = [];
  const [startHour, startMin] = dayHours.start.split(":").map(Number);
  const [endHour, endMin] = dayHours.end.split(":").map(Number);

  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  while (currentMinutes + slotDuration <= endMinutes) {
    const slotStart = `${String(Math.floor(currentMinutes / 60)).padStart(2, "0")}:${String(currentMinutes % 60).padStart(2, "0")}`;
    const slotEndMinutes = currentMinutes + slotDuration;
    const slotEnd = `${String(Math.floor(slotEndMinutes / 60)).padStart(2, "0")}:${String(slotEndMinutes % 60).padStart(2, "0")}`;

    // Check if slot conflicts with any existing booking
    const isBooked = bookedSlots.some((booking) => {
      const bookStart = booking.startTime;
      const bookEnd = booking.endTime;
      return slotStart < bookEnd && slotEnd > bookStart;
    });

    // Check if slot is in the past
    const now = new Date();
    const slotDateTime = new Date(date);
    slotDateTime.setHours(Math.floor(currentMinutes / 60), currentMinutes % 60);
    const isPast = slotDateTime < now;

    slots.push({
      startTime: slotStart,
      endTime: slotEnd,
      available: !isBooked && !isPast,
    });

    currentMinutes += slotDuration + bufferTime;
  }

  res.json({ status: "success", data: { slots, staff: { id: staff._id, name: staff.fullName } } });
});

/**
 * Create a booking
 * POST /api/v1/store/:tenantSlug/bookings
 */
const createBooking = asyncHandler(async (req, res) => {
  const { staffId, serviceId, date, startTime, notes, guestInfo } = req.body;

  // Validate staff exists
  const staff = await Staff.findOne({ _id: staffId, tenant: req.tenant._id, isActive: true });
  if (!staff) throw new NotFoundError("Staff member not found");

  // Validate service exists
  const service = await require("../models").Product.findOne({ _id: serviceId, tenant: req.tenant._id });
  if (!service) throw new NotFoundError("Service not found");

  const duration = service.serviceDuration || req.tenant.bookingSettings?.slotDuration || 60;
  const [startH, startM] = startTime.split(":").map(Number);
  const endMinutes = startH * 60 + startM + duration;
  const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;

  // Check for conflicts
  const hasConflict = await Booking.hasConflict(req.tenant._id, staffId, date, startTime, endTime);
  if (hasConflict) throw new BadRequestError("This time slot is no longer available");

  const booking = await Booking.create({
    tenant: req.tenant._id,
    customer: req.user?._id || null,
    guestInfo: !req.user ? guestInfo : undefined,
    staff: staffId,
    service: serviceId,
    date: new Date(date),
    startTime,
    endTime,
    duration,
    price: service.price?.salePrice || service.price?.basePrice || 0,
    notes,
    status: req.tenant.bookingSettings?.confirmationRequired ? "pending" : "confirmed",
  });

  await booking.populate([
    { path: "staff", select: "firstName lastName title" },
    { path: "service", select: "name price" },
  ]);

  logger.info(`Booking created: ${booking._id} for tenant ${req.tenant.slug}`);

  res.status(201).json({
    status: "success",
    message: req.tenant.bookingSettings?.confirmationRequired ? "Booking submitted! Awaiting confirmation." : "Booking confirmed!",
    data: { booking },
  });
});

/**
 * Get customer's bookings
 * GET /api/v1/store/:tenantSlug/bookings/my-bookings
 */
const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ tenant: req.tenant._id, customer: req.user._id }).sort("-date").populate("staff", "firstName lastName title avatar").populate("service", "name price images");

  res.json({ status: "success", data: { bookings } });
});

/**
 * Cancel a booking
 * POST /api/v1/store/:tenantSlug/bookings/:id/cancel
 */
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, tenant: req.tenant._id });
  if (!booking) throw new NotFoundError("Booking not found");

  // Verify ownership (customer or admin)
  if (booking.customer && booking.customer.toString() !== req.user._id.toString() && req.user.role !== "store_owner" && req.user.role !== "super_admin") {
    throw new BadRequestError("You can only cancel your own bookings");
  }

  if (["completed", "cancelled"].includes(booking.status)) {
    throw new BadRequestError("This booking cannot be cancelled");
  }

  booking.status = "cancelled";
  booking.cancellationReason = req.body.reason || "Cancelled by customer";
  booking.cancelledAt = new Date();
  await booking.save();

  res.json({ status: "success", message: "Booking cancelled" });
});

/**
 * Admin: Get all bookings
 * GET /api/v1/store/:tenantSlug/admin/bookings
 */
const getAllBookings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, date, staffId } = req.query;
  const filter = { tenant: req.tenant._id };

  if (status) filter.status = status;
  if (staffId) filter.staff = staffId;
  if (date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const dEnd = new Date(date);
    dEnd.setHours(23, 59, 59, 999);
    filter.date = { $gte: d, $lte: dEnd };
  }

  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    Booking.find(filter).sort("-date -startTime").skip(skip).limit(parseInt(limit, 10)).populate("staff", "firstName lastName title avatar").populate("service", "name price").populate("customer", "firstName lastName email phone"),
    Booking.countDocuments(filter),
  ]);

  res.json({
    status: "success",
    data: {
      bookings,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total, pages: Math.ceil(total / limit) },
    },
  });
});

/**
 * Admin: Update booking status
 * PATCH /api/v1/store/:tenantSlug/admin/bookings/:id/status
 */
const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, tenant: req.tenant._id });
  if (!booking) throw new NotFoundError("Booking not found");

  const { status } = req.body;
  booking.status = status;

  if (status === "confirmed") booking.confirmedAt = new Date();
  if (status === "completed") booking.completedAt = new Date();
  if (status === "cancelled") {
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || "Cancelled by admin";
  }

  await booking.save();

  res.json({ status: "success", data: { booking } });
});

module.exports = {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getAvailability,
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
};
