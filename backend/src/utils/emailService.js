const nodemailer = require("nodemailer");
const config = require("../config");
const logger = require("./logger");

// Create transporter
let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  if (config.email?.host && config.email?.user) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  } else {
    // Fallback: log emails in development
    logger.info("Email service: No SMTP configured. Emails will be logged to console.");
    transporter = {
      sendMail: async (options) => {
        logger.info(`📧 EMAIL (not sent - no SMTP configured):`);
        logger.info(`   To: ${options.to}`);
        logger.info(`   Subject: ${options.subject}`);
        logger.info(`   Preview: ${options.text?.substring(0, 200) || options.html?.substring(0, 200)}`);
        return { messageId: `dev-${Date.now()}` };
      },
    };
  }

  return transporter;
};

// ═══════════ TEMPLATES ═══════════

const baseTemplate = (storeName, content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: #4F46E5; color: white; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 32px 24px; }
    .content h2 { color: #1a1a1a; margin-top: 0; }
    .content p { color: #555; line-height: 1.6; }
    .btn { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .footer { padding: 24px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; }
    .info-box { background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 4px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>${storeName}</h1></div>
    <div class="content">${content}</div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
      <p>Powered by RetailX</p>
    </div>
  </div>
</body>
</html>
`;

// ═══════════ EMAIL FUNCTIONS ═══════════

const emailService = {
  /**
   * Send password reset email
   */
  sendPasswordReset: async (tenant, user, resetToken, resetUrl) => {
    const storeName = tenant?.name || "RetailX";
    const html = baseTemplate(
      storeName,
      `
      <h2>Reset Your Password</h2>
      <p>Hi ${user.firstName},</p>
      <p>You requested a password reset. Click the button below to create a new password:</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </p>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
    );

    await getTransporter().sendMail({
      from: `"${storeName}" <${config.email?.from || "noreply@retailx.com"}>`,
      to: user.email,
      subject: `Reset Your Password - ${storeName}`,
      html,
      text: `Reset your password: ${resetUrl}`,
    });

    logger.info(`Password reset email sent to ${user.email}`);
  },

  /**
   * Send email verification
   */
  sendVerificationEmail: async (tenant, user, verifyUrl) => {
    const storeName = tenant?.name || "RetailX";
    const html = baseTemplate(
      storeName,
      `
      <h2>Verify Your Email</h2>
      <p>Hi ${user.firstName},</p>
      <p>Welcome! Please verify your email address:</p>
      <p style="text-align: center; margin: 24px 0;">
        <a href="${verifyUrl}" class="btn">Verify Email</a>
      </p>
    `,
    );

    await getTransporter().sendMail({
      from: `"${storeName}" <${config.email?.from || "noreply@retailx.com"}>`,
      to: user.email,
      subject: `Verify Your Email - ${storeName}`,
      html,
      text: `Verify your email: ${verifyUrl}`,
    });

    logger.info(`Verification email sent to ${user.email}`);
  },

  /**
   * Send order confirmation
   */
  sendOrderConfirmation: async (tenant, order, user) => {
    const storeName = tenant?.name || "RetailX";
    const items = order.items
      .map(
        (item) => `
      <div class="info-row">
        <span>${item.name} × ${item.quantity}</span>
        <span>$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `,
      )
      .join("");

    const html = baseTemplate(
      storeName,
      `
      <h2>Order Confirmed! 🎉</h2>
      <p>Hi ${user?.firstName || order.shipping?.address?.firstName || "there"},</p>
      <p>Thank you for your order! Here's your summary:</p>
      <div class="info-box">
        <p><strong>Order #${order.orderNumber}</strong></p>
        ${items}
        <hr style="border: none; border-top: 1px solid #ddd; margin: 8px 0;">
        <div class="info-row"><strong>Total</strong> <strong>$${order.pricing?.total?.toFixed(2)}</strong></div>
      </div>
      <p>We'll notify you when your order ships.</p>
    `,
    );

    const email = user?.email || order.shipping?.address?.email || order.contact?.email;
    if (email) {
      await getTransporter().sendMail({
        from: `"${storeName}" <${config.email?.from || "noreply@retailx.com"}>`,
        to: email,
        subject: `Order Confirmed #${order.orderNumber} - ${storeName}`,
        html,
        text: `Order confirmed! Order #${order.orderNumber}. Total: $${order.pricing?.total?.toFixed(2)}`,
      });

      logger.info(`Order confirmation email sent for ${order.orderNumber}`);
    }
  },

  /**
   * Send order status update
   */
  sendOrderStatusUpdate: async (tenant, order, newStatus) => {
    const storeName = tenant?.name || "RetailX";
    const statusMessages = {
      processing: "Your order is being processed.",
      shipped: `Your order has been shipped! ${order.shipping?.trackingNumber ? `Tracking: ${order.shipping.trackingNumber}` : ""}`,
      delivered: "Your order has been delivered!",
      cancelled: "Your order has been cancelled.",
    };

    const html = baseTemplate(
      storeName,
      `
      <h2>Order Update</h2>
      <p>Your order <strong>#${order.orderNumber}</strong> status has been updated to: <strong>${newStatus}</strong></p>
      <p>${statusMessages[newStatus] || ""}</p>
    `,
    );

    const email = order.shipping?.address?.email || order.contact?.email;
    if (email) {
      await getTransporter().sendMail({
        from: `"${storeName}" <${config.email?.from || "noreply@retailx.com"}>`,
        to: email,
        subject: `Order #${order.orderNumber} - ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} - ${storeName}`,
        html,
      });
    }
  },

  /**
   * Send contact form notification to store owner
   */
  sendContactNotification: async (tenant, submission) => {
    const storeName = tenant?.name || "RetailX";
    const html = baseTemplate(
      storeName,
      `
      <h2>New Contact Message</h2>
      <div class="info-box">
        <p><strong>From:</strong> ${submission.name} (${submission.email})</p>
        ${submission.phone ? `<p><strong>Phone:</strong> ${submission.phone}</p>` : ""}
        <p><strong>Subject:</strong> ${submission.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${submission.message}</p>
      </div>
    `,
    );

    await getTransporter().sendMail({
      from: `"${storeName}" <${config.email?.from || "noreply@retailx.com"}>`,
      to: tenant.contact.email,
      subject: `New Contact: ${submission.subject} - ${storeName}`,
      html,
    });
  },

  /**
   * Send contact form confirmation to customer
   */
  sendContactConfirmation: async (tenant, submission) => {
    const storeName = tenant?.name || "RetailX";
    const html = baseTemplate(
      storeName,
      `
      <h2>We received your message!</h2>
      <p>Hi ${submission.name},</p>
      <p>Thank you for reaching out. We've received your message about "${submission.subject}" and will get back to you as soon as possible.</p>
      <p>Best regards,<br>The ${storeName} Team</p>
    `,
    );

    await getTransporter().sendMail({
      from: `"${storeName}" <${config.email?.from || "noreply@retailx.com"}>`,
      to: submission.email,
      subject: `We received your message - ${storeName}`,
      html,
    });
  },

  /**
   * Send contact reply to customer
   */
  sendContactReply: async (tenant, submission, reply) => {
    const storeName = tenant?.name || "RetailX";
    const html = baseTemplate(
      storeName,
      `
      <h2>Reply to your message</h2>
      <p>Hi ${submission.name},</p>
      <p>We're responding to your inquiry about "${submission.subject}":</p>
      <div class="info-box">${reply}</div>
      <p>Best regards,<br>The ${storeName} Team</p>
    `,
    );

    await getTransporter().sendMail({
      from: `"${storeName}" <${config.email?.from || "noreply@retailx.com"}>`,
      to: submission.email,
      subject: `Re: ${submission.subject} - ${storeName}`,
      html,
    });
  },

  /**
   * Send booking confirmation
   */
  sendBookingConfirmation: async (tenant, booking, user) => {
    const storeName = tenant?.name || "RetailX";
    const html = baseTemplate(
      storeName,
      `
      <h2>Booking ${booking.status === "confirmed" ? "Confirmed" : "Received"}! 📅</h2>
      <p>Hi ${user?.firstName || booking.guestInfo?.name || "there"},</p>
      <div class="info-box">
        <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
        <p><strong>Price:</strong> $${booking.price?.toFixed(2)}</p>
      </div>
      ${booking.status === "pending" ? "<p>Your booking is pending confirmation. We'll notify you shortly.</p>" : "<p>See you then!</p>"}
    `,
    );

    const email = user?.email || booking.guestInfo?.email;
    if (email) {
      await getTransporter().sendMail({
        from: `"${storeName}" <${config.email?.from || "noreply@retailx.com"}>`,
        to: email,
        subject: `Booking ${booking.status === "confirmed" ? "Confirmed" : "Received"} - ${storeName}`,
        html,
      });
    }
  },
};

module.exports = emailService;
