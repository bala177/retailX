const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    guestInfo: {
      name: String,
      email: String,
      phone: String,
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    date: {
      type: Date,
      required: [true, "Booking date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
    },
    duration: {
      type: Number, // minutes
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in-progress", "completed", "cancelled", "no-show"],
      default: "pending",
    },
    notes: String,
    cancellationReason: String,
    cancelledAt: Date,
    confirmedAt: Date,
    completedAt: Date,
    reminder: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({ tenant: 1, date: 1, staff: 1 });
bookingSchema.index({ tenant: 1, customer: 1, createdAt: -1 });
bookingSchema.index({ tenant: 1, status: 1 });

// Check for time slot conflicts
bookingSchema.statics.hasConflict = async function (tenantId, staffId, date, startTime, endTime, excludeBookingId) {
  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(date);
  dateEnd.setHours(23, 59, 59, 999);

  const query = {
    tenant: tenantId,
    staff: staffId,
    date: { $gte: dateStart, $lte: dateEnd },
    status: { $nin: ["cancelled", "no-show"] },
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // Overlapping
    ],
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflict = await this.findOne(query);
  return !!conflict;
};

// Get available slots for a staff member on a date
bookingSchema.statics.getBookedSlots = async function (tenantId, staffId, date) {
  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(date);
  dateEnd.setHours(23, 59, 59, 999);

  return this.find({
    tenant: tenantId,
    staff: staffId,
    date: { $gte: dateStart, $lte: dateEnd },
    status: { $nin: ["cancelled", "no-show"] },
  }).select("startTime endTime duration");
};

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
