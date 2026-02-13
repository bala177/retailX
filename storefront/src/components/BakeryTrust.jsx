import { MapPin, Phone, Clock, Star, Shield, Award, Users, Heart } from "lucide-react";

export default function BakeryTrust({ store }) {
  const storeName = store?.name || "Sweet Delights Bakery";
  const phone = store?.contact?.phone || store?.phone || "(555) 123-4567";
  const rawAddress = store?.contact?.address || store?.address || "123 Baker Street, Sweet Town";
  const address = typeof rawAddress === "object" ? [rawAddress.street, rawAddress.city, rawAddress.state, rawAddress.zipCode, rawAddress.country].filter(Boolean).join(", ") : rawAddress;
  const email = store?.contact?.email || store?.email || "hello@sweetdelights.com";

  const testimonials = [
    {
      name: "Priya M.",
      text: "The best cake I've ever ordered! The customization options are amazing and it tasted even better than it looked.",
      rating: 5,
      event: "Birthday Cake",
      avatar: "P",
    },
    {
      name: "Rahul K.",
      text: "We ordered our wedding cake from here and it was absolutely perfect. Every guest was raving about it!",
      rating: 5,
      event: "Wedding Cake",
      avatar: "R",
    },
    {
      name: "Anita S.",
      text: "Fresh, delicious, and delivered right on time. Their pastries are to die for. Highly recommend!",
      rating: 5,
      event: "Pastry Box",
      avatar: "A",
    },
  ];

  const trustBadges = [
    { icon: Shield, label: "FSSAI Certified", color: "text-green-600", bg: "bg-green-50" },
    { icon: Award, label: "100% Eggless Options", color: "text-purple-600", bg: "bg-purple-50" },
    { icon: Clock, label: "Same Day Available", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: Users, label: "10,000+ Happy Customers", color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Visit Our Bakery</h2>
          <p className="text-gray-600 max-w-xl mx-auto">Come experience the aroma of freshly baked goods or order online for delivery!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Map & Contact */}
          <div className="space-y-6">
            {/* Google Maps Placeholder */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <div className="aspect-video bg-gradient-to-br from-emerald-100 via-teal-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-8 h-8 text-amber-600" />
                  </div>
                  <p className="font-bold text-gray-800 text-lg">{storeName}</p>
                  <p className="text-sm text-gray-500 mt-1">{address}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-3 px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-full hover:bg-amber-600 transition-colors shadow"
                  >
                    <MapPin className="w-4 h-4 mr-1.5" />
                    View on Google Maps
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Address</p>
                  <p className="text-sm font-semibold text-gray-900">{address}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Phone</p>
                  <a href={`tel:${phone}`} className="text-sm font-semibold text-gray-900 hover:text-amber-700">
                    {phone}
                  </a>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Hours</p>
                  <p className="text-sm font-semibold text-gray-900">8 AM – 9 PM Daily</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Follow Us</p>
                  <p className="text-sm font-semibold text-gray-900">@{storeName.replace(/\s+/g, "").toLowerCase()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Testimonials */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h3 className="text-lg font-bold text-gray-900">What Our Customers Say</h3>
            </div>

            <div className="space-y-4">
              {testimonials.map((t, i) => (
                <div key={i} className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center text-amber-800 font-bold text-lg flex-shrink-0">{t.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{t.name}</p>
                          <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">{t.event}</span>
                        </div>
                        <div className="flex">
                          {[...Array(t.rating)].map((_, j) => (
                            <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed">"{t.text}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {trustBadges.map((badge, i) => (
            <div key={i} className={`flex items-center space-x-3 p-4 ${badge.bg} rounded-xl border border-gray-100`}>
              <badge.icon className={`w-6 h-6 ${badge.color} flex-shrink-0`} />
              <span className="text-sm font-semibold text-gray-800">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
