import { useStore } from "../context/StoreContext";
import { Link } from "react-router-dom";
import { Calendar, Phone, Clock, MapPin, ArrowRight, Star, Users, Award, Sparkles } from "lucide-react";

export default function BookingCTA({ variant = "default" }) {
  const { store, terminology } = useStore();

  const brandColors = {
    primary: store?.branding?.primaryColor || "#6366f1",
    secondary: store?.branding?.secondaryColor || "#4f46e5",
  };

  // Simple inline CTA variant
  if (variant === "inline") {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Book Your Appointment?</h3>
            <p className="text-gray-600">Schedule your visit today and experience our professional services.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/products" className="inline-flex items-center justify-center px-6 py-3 rounded-full text-white font-semibold transition-all hover:shadow-lg" style={{ backgroundColor: brandColors.primary }}>
              <Calendar className="w-5 h-5 mr-2" />
              Book Online
            </Link>
            {store?.contact?.phone && (
              <a href={`tel:${store.contact.phone}`} className="inline-flex items-center justify-center px-6 py-3 rounded-full border-2 font-semibold transition-all hover:bg-gray-50" style={{ borderColor: brandColors.primary, color: brandColors.primary }}>
                <Phone className="w-5 h-5 mr-2" />
                Call Us
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full-width banner variant
  if (variant === "banner") {
    return (
      <section className="py-16" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-white">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-6 bg-white/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Book Your Visit
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Transform Your Experience Today</h2>
              <p className="text-white/90 text-lg mb-8 leading-relaxed">Don't wait to treat yourself. Book your appointment now and let our expert team provide you with exceptional care and service.</p>

              {/* Quick Info */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Flexible Hours</p>
                    <p className="text-sm text-white/70">Open 7 days</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">Certified Experts</p>
                    <p className="text-sm text-white/70">Licensed pros</p>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products" className="inline-flex items-center justify-center px-8 py-4 bg-white rounded-full font-bold transition-all hover:shadow-xl hover:scale-105" style={{ color: brandColors.primary }}>
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Appointment
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                {store?.contact?.phone && (
                  <a href={`tel:${store.contact.phone}`} className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 rounded-full font-semibold hover:bg-white/10 transition-all">
                    <Phone className="w-5 h-5 mr-2" />
                    {store.contact.phone}
                  </a>
                )}
              </div>
            </div>

            {/* Stats/Trust Badges */}
            <div className="hidden lg:grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <p className="text-4xl font-bold text-white mb-2">4.9</p>
                <div className="flex items-center justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-white/80 text-sm">Average Rating</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <p className="text-4xl font-bold text-white mb-2">10k+</p>
                <Users className="w-6 h-6 text-white/80 mx-auto mb-2" />
                <p className="text-white/80 text-sm">Happy Clients</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center col-span-2">
                <p className="text-4xl font-bold text-white mb-2">15+</p>
                <Award className="w-6 h-6 text-white/80 mx-auto mb-2" />
                <p className="text-white/80 text-sm">Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default card variant
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Image Side */}
        <div className="relative h-64 md:h-auto">
          <div className="absolute inset-0 bg-gradient-to-br opacity-80" style={{ backgroundImage: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white p-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                <Calendar className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Book Online 24/7</h3>
              <p className="text-white/80">Easy appointment scheduling at your fingertips</p>
            </div>
          </div>
        </div>

        {/* Content Side */}
        <div className="p-8 md:p-10">
          <h3 className="text-2xl font-bold text-white mb-4">Ready for Your Appointment?</h3>
          <p className="text-gray-300 mb-6 leading-relaxed">Experience the difference with our professional team. Book your session today and discover why our clients keep coming back.</p>

          {/* Contact Info */}
          <div className="space-y-3 mb-8">
            {store?.contact?.phone && (
              <a href={`tel:${store.contact.phone}`} className="flex items-center text-gray-300 hover:text-white transition-colors">
                <Phone className="w-5 h-5 mr-3" style={{ color: brandColors.primary }} />
                {store.contact.phone}
              </a>
            )}
            {store?.contact?.address && (
              <div className="flex items-start text-gray-300">
                <MapPin className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: brandColors.primary }} />
                <span>
                  {store.contact.address.street}, {store.contact.address.city}
                </span>
              </div>
            )}
            <div className="flex items-center text-gray-300">
              <Clock className="w-5 h-5 mr-3" style={{ color: brandColors.primary }} />
              <span>Mon-Sat: 9AM - 7PM | Sun: 10AM - 5PM</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/products" className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold transition-all hover:shadow-lg hover:opacity-90" style={{ backgroundColor: brandColors.primary }}>
              <Calendar className="w-5 h-5 mr-2" />
              Book Now
            </Link>
            <a href="#contact" className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-gray-600 text-gray-300 font-semibold hover:border-gray-500 hover:text-white transition-all">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
