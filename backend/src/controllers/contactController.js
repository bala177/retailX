const { ContactSubmission, Newsletter } = require("../models");
const { asyncHandler } = require("../utils/helpers");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const emailService = require("../utils/emailService");
const logger = require("../utils/logger");

// ═══════════ CONTACT FORM ═══════════

/**
 * Submit a contact form (Public)
 * POST /api/v1/store/:tenantSlug/contact
 */
const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    throw new BadRequestError("Name, email, subject, and message are required");
  }

  const submission = await ContactSubmission.create({
    tenant: req.tenant._id,
    name,
    email,
    phone,
    subject,
    message,
  });

  // Send notification email to store owner
  try {
    if (req.tenant.contact?.email) {
      await emailService.sendContactNotification(req.tenant, submission);
    }
  } catch (err) {
    logger.warn("Failed to send contact notification email:", err.message);
  }

  // Send confirmation email to customer
  try {
    await emailService.sendContactConfirmation(req.tenant, submission);
  } catch (err) {
    logger.warn("Failed to send contact confirmation email:", err.message);
  }

  logger.info(`Contact form submitted for tenant ${req.tenant.slug} from ${email}`);

  res.status(201).json({
    status: "success",
    message: "Your message has been sent successfully. We'll get back to you soon!",
    data: { id: submission._id },
  });
});

/**
 * Admin: Get all contact submissions
 * GET /api/v1/store/:tenantSlug/admin/contacts
 */
const getContactSubmissions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = { tenant: req.tenant._id };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [submissions, total] = await Promise.all([ContactSubmission.find(filter).sort("-createdAt").skip(skip).limit(parseInt(limit, 10)), ContactSubmission.countDocuments(filter)]);

  res.json({
    status: "success",
    data: {
      submissions,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total, pages: Math.ceil(total / limit) },
    },
  });
});

/**
 * Admin: Update contact submission status / reply
 * PATCH /api/v1/store/:tenantSlug/admin/contacts/:id
 */
const updateContactSubmission = asyncHandler(async (req, res) => {
  const submission = await ContactSubmission.findOne({ _id: req.params.id, tenant: req.tenant._id });
  if (!submission) throw new NotFoundError("Submission not found");

  const { status, reply } = req.body;
  if (status) submission.status = status;
  if (reply) {
    submission.adminReply = {
      message: reply,
      repliedAt: new Date(),
      repliedBy: req.user._id,
    };
    submission.status = "replied";

    // Send reply email
    try {
      await emailService.sendContactReply(req.tenant, submission, reply);
    } catch (err) {
      logger.warn("Failed to send contact reply email:", err.message);
    }
  }

  await submission.save();

  res.json({ status: "success", data: { submission } });
});

// ═══════════ NEWSLETTER ═══════════

/**
 * Subscribe to newsletter (Public)
 * POST /api/v1/store/:tenantSlug/newsletter
 */
const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new BadRequestError("Email is required");

  // Check if already subscribed
  const existing = await Newsletter.findOne({ tenant: req.tenant._id, email: email.toLowerCase() });
  if (existing) {
    if (existing.isActive) {
      return res.json({ status: "success", message: "You're already subscribed!" });
    }
    // Resubscribe
    existing.isActive = true;
    existing.subscribedAt = new Date();
    existing.unsubscribedAt = undefined;
    await existing.save();
    return res.json({ status: "success", message: "Welcome back! You've been re-subscribed." });
  }

  await Newsletter.create({ tenant: req.tenant._id, email: email.toLowerCase() });

  logger.info(`Newsletter subscription for tenant ${req.tenant.slug}: ${email}`);

  res.status(201).json({ status: "success", message: "Successfully subscribed to our newsletter!" });
});

/**
 * Unsubscribe from newsletter
 * POST /api/v1/store/:tenantSlug/newsletter/unsubscribe
 */
const unsubscribeNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const sub = await Newsletter.findOne({ tenant: req.tenant._id, email: email.toLowerCase() });
  if (sub) {
    sub.isActive = false;
    sub.unsubscribedAt = new Date();
    await sub.save();
  }

  res.json({ status: "success", message: "You have been unsubscribed" });
});

/**
 * Admin: Get newsletter subscribers
 * GET /api/v1/store/:tenantSlug/admin/newsletter
 */
const getSubscribers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, active } = req.query;
  const filter = { tenant: req.tenant._id };
  if (active !== undefined) filter.isActive = active === "true";

  const skip = (page - 1) * limit;
  const [subscribers, total] = await Promise.all([Newsletter.find(filter).sort("-subscribedAt").skip(skip).limit(parseInt(limit, 10)), Newsletter.countDocuments(filter)]);

  res.json({
    status: "success",
    data: {
      subscribers,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total, pages: Math.ceil(total / limit) },
    },
  });
});

module.exports = {
  submitContactForm,
  getContactSubmissions,
  updateContactSubmission,
  subscribeNewsletter,
  unsubscribeNewsletter,
  getSubscribers,
};
