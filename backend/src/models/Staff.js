const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: String,
    avatar: String,
    title: {
      type: String, // e.g., "Senior Stylist", "Massage Therapist"
      trim: true,
    },
    bio: {
      type: String,
      maxlength: 1000,
    },
    specialties: [String], // e.g., ["Hair Coloring", "Balayage", "Cuts"]
    experience: {
      type: Number, // years
      default: 0,
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    workingHours: {
      monday: { start: { type: String, default: "09:00" }, end: { type: String, default: "18:00" }, enabled: { type: Boolean, default: true } },
      tuesday: { start: { type: String, default: "09:00" }, end: { type: String, default: "18:00" }, enabled: { type: Boolean, default: true } },
      wednesday: { start: { type: String, default: "09:00" }, end: { type: String, default: "18:00" }, enabled: { type: Boolean, default: true } },
      thursday: { start: { type: String, default: "09:00" }, end: { type: String, default: "18:00" }, enabled: { type: Boolean, default: true } },
      friday: { start: { type: String, default: "09:00" }, end: { type: String, default: "18:00" }, enabled: { type: Boolean, default: true } },
      saturday: { start: { type: String, default: "10:00" }, end: { type: String, default: "16:00" }, enabled: { type: Boolean, default: true } },
      sunday: { start: { type: String, default: "10:00" }, end: { type: String, default: "14:00" }, enabled: { type: Boolean, default: false } },
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Services are stored as products
      },
    ],
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

staffSchema.index({ tenant: 1, isActive: 1, sortOrder: 1 });

staffSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const Staff = mongoose.model("Staff", staffSchema);
module.exports = Staff;
