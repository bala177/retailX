import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, CheckCircle, Globe, Navigation } from "lucide-react";

export default function ContactSection() {
  const { store } = useStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSubmitted(true);
    setLoading(false);
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });

    // Reset success message after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  const brandColors = {
    primary: store?.branding?.primaryColor || "#6366f1",
    secondary: store?.branding?.secondaryColor || "#4f46e5",
  };

  // Get address for map embed
  const address = store?.contact?.address;
  const fullAddress = address ? `${address.street || ""}, ${address.city || ""}, ${address.state || ""} ${address.zipCode || ""}, ${address.country || ""}` : "";
  const mapQuery = encodeURIComponent(fullAddress || store?.name || "");

  // Business hours - can be customized per store type
  const businessHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 7:00 PM" },
    { day: "Saturday", hours: "10:00 AM - 6:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: `${brandColors.primary}15`, color: brandColors.primary }}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Get In Touch
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Have questions or want to book an appointment? We'd love to hear from you. Reach out to us anytime!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Send className="w-5 h-5 mr-2" style={{ color: brandColors.primary }} />
              Send Us a Message
            </h3>

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColors.primary}15` }}>
                  <CheckCircle className="w-8 h-8" style={{ color: brandColors.primary }} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h4>
                <p className="text-gray-600">Thank you for reaching out. We'll get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Your name" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all" style={{ focusRing: brandColors.primary }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="your@email.com" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                    <select name="subject" value={formData.subject} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all bg-white">
                      <option value="">Select a subject</option>
                      <option value="appointment">Book an Appointment</option>
                      <option value="inquiry">General Inquiry</option>
                      <option value="pricing">Pricing Information</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} required rows={4} placeholder="How can we help you?" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all resize-none" />
                </div>

                <button type="submit" disabled={loading} className="w-full py-4 px-6 rounded-xl text-white font-semibold transition-all hover:shadow-lg disabled:opacity-70 flex items-center justify-center" style={{ backgroundColor: brandColors.primary }}>
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info & Map */}
          <div className="space-y-6">
            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Address */}
              <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${brandColors.primary}15` }}>
                  <MapPin className="w-5 h-5" style={{ color: brandColors.primary }} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Visit Us</h4>
                <p className="text-sm text-gray-600">
                  {address?.street || "123 Main Street"}
                  <br />
                  {address?.city || "City"}, {address?.state || "ST"} {address?.zipCode || "00000"}
                </p>
              </div>

              {/* Phone */}
              <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${brandColors.primary}15` }}>
                  <Phone className="w-5 h-5" style={{ color: brandColors.primary }} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Call Us</h4>
                <a href={`tel:${store?.contact?.phone || store?.contactPhone}`} className="text-sm hover:underline" style={{ color: brandColors.primary }}>
                  {store?.contact?.phone || store?.contactPhone || "+1 (555) 000-0000"}
                </a>
                <p className="text-xs text-gray-500 mt-1">Appointments by phone only</p>
              </div>

              {/* Email */}
              <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${brandColors.primary}15` }}>
                  <Mail className="w-5 h-5" style={{ color: brandColors.primary }} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Email Us</h4>
                <a href={`mailto:${store?.contact?.email || store?.contactEmail}`} className="text-sm hover:underline break-all" style={{ color: brandColors.primary }}>
                  {store?.contact?.email || store?.contactEmail || "hello@store.com"}
                </a>
              </div>

              {/* Hours */}
              <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${brandColors.primary}15` }}>
                  <Clock className="w-5 h-5" style={{ color: brandColors.primary }} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Business Hours</h4>
                <div className="text-sm text-gray-600 space-y-0.5">
                  {businessHours.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.day}</span>
                      <span className="font-medium">{item.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="relative h-64 bg-gray-100">
                <iframe title="Store Location" width="100%" height="100%" frameBorder="0" style={{ border: 0 }} src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${mapQuery}`} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Navigation className="w-4 h-4 mr-2" style={{ color: brandColors.primary }} />
                  <span>Get directions to our location</span>
                </div>
                <a href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90" style={{ backgroundColor: brandColors.primary }}>
                  Open in Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
