import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "../context/StoreContext";
import { categoriesAPI, productsAPI } from "../services/api";
import PhotoGallery from "../components/PhotoGallery";
import TeamSection from "../components/TeamSection";
import TestimonialsSection from "../components/TestimonialsSection";
import AboutSection from "../components/AboutSection";
import ContactSection from "../components/ContactSection";
import ServiceCard from "../components/ServiceCard";
import BookingModal from "../components/BookingModal";
import { ArrowRight, Star, Clock, Phone, MapPin, Sparkles, CheckCircle, BadgeCheck, Gift, Users, Award, Heart, Calendar, Footprints } from "lucide-react";
import { useState, useEffect } from "react";

export default function ServiceHome() {
  const { store, storeSlug } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showAllServices, setShowAllServices] = useState(false);

  // Fetch categories for quick links
  const { data: categoriesData } = useQuery({
    queryKey: ["categories", storeSlug],
    queryFn: categoriesAPI.getAll,
    enabled: !!storeSlug,
  });

  // Fetch all services/products
  const { data: servicesData } = useQuery({
    queryKey: ["services", storeSlug, selectedCategory],
    queryFn: () =>
      productsAPI.getAll({
        limit: 50, // Fetch more services
        category: selectedCategory,
      }),
    enabled: !!storeSlug,
  });

  const categories = categoriesData?.data?.data?.categories || [];
  const allServices = servicesData?.data?.data?.products || [];
  // Show 6 services initially, or all if showAllServices is true
  const services = showAllServices ? allServices : allServices.slice(0, 6);

  const brandColors = {
    primary: store?.branding?.primaryColor || "#00897B",
    secondary: store?.branding?.secondaryColor || "#00695C",
  };

  // Determine service type for customized content
  const getServiceType = () => {
    const slug = storeSlug || "";
    if (slug.includes("hair") || slug.includes("salon") || slug.includes("glamour")) return "hairsalon";
    if (slug.includes("spa") || slug.includes("massage") || slug.includes("tranquil")) return "spa";
    if (slug.includes("feet") || slug.includes("foot") || slug.includes("podolog") || slug.includes("healthy")) return "podologie";
    return "spa";
  };

  const serviceType = getServiceType();

  // Service-type specific hero content
  const heroContent = {
    hairsalon: {
      tagline: "Award-Winning Hair Salon",
      title: "Where Style Meets Artistry",
      subtitle: "Experience transformative hair care from our master stylists. From precision cuts to stunning color, we bring your vision to life in an atmosphere of luxury and relaxation.",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=80",
      features: ["Master Stylists", "Premium Products", "Personalized Consultations"],
    },
    spa: {
      tagline: "Your Sanctuary of Wellness",
      title: "Relax. Rejuvenate. Renew.",
      subtitle: "Escape the everyday and immerse yourself in pure relaxation. Our expert therapists guide you on a journey to complete rejuvenation through time-honored techniques and modern wellness practices.",
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1920&q=80",
      features: ["Licensed Therapists", "Organic Products", "Tranquil Environment"],
    },
    podologie: {
      tagline: "Professional Foot Care Specialists",
      title: "Step Into Comfort & Health",
      subtitle: "Trust your feet to our certified podiatrists. We combine medical expertise with personalized care, using state-of-the-art equipment for optimal foot health, mobility, and comfort.",
      image: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=1920&q=80",
      features: ["Board Certified", "Medical Grade Care", "Personalized Treatment"],
    },
  };

  const hero = heroContent[serviceType] || heroContent.spa;

  // Stats/achievements
  const stats = [
    { value: "12+", label: "Years Experience" },
    { value: "10,000+", label: "Happy Clients" },
    { value: "4.9", label: "Average Rating", icon: Star },
    { value: "50+", label: "Expert Staff" },
  ];

  // Why choose us content
  const whyChooseUs = {
    hairsalon: [
      { icon: BadgeCheck, title: "Expert Stylists", desc: "Our team consists of internationally trained professionals with years of experience." },
      { icon: Sparkles, title: "Premium Products", desc: "We exclusively use top-tier, salon-quality products for the best results." },
      { icon: Heart, title: "Personalized Care", desc: "Every client receives a consultation to understand their unique style needs." },
      { icon: Gift, title: "Loyalty Rewards", desc: "Earn points with every visit and enjoy exclusive member benefits." },
    ],
    spa: [
      { icon: BadgeCheck, title: "Licensed Therapists", desc: "All our therapists are certified and continuously trained in latest techniques." },
      { icon: Heart, title: "Holistic Approach", desc: "We treat the whole person - mind, body, and spirit - for complete wellness." },
      { icon: Sparkles, title: "Organic Products", desc: "We use only natural, organic products that are gentle on your skin." },
      { icon: Gift, title: "Gift Packages", desc: "Treat your loved ones to the gift of relaxation with our special packages." },
    ],
    podologie: [
      { icon: BadgeCheck, title: "Medical Expertise", desc: "Our specialists are board-certified with extensive clinical experience." },
      { icon: Award, title: "Advanced Technology", desc: "State-of-the-art equipment for accurate diagnosis and effective treatment." },
      { icon: Users, title: "Patient-Centered", desc: "We create personalized treatment plans tailored to your specific needs." },
      { icon: CheckCircle, title: "Proven Results", desc: "98% of our patients report significant improvement after treatment." },
    ],
  };

  const features = whyChooseUs[serviceType] || whyChooseUs.spa;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Clean and Professional */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background - Image or Gradient */}
        <div className="absolute inset-0">
          {hero.image ? (
            <>
              <img src={hero.image} alt={store?.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 right-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-400 rounded-full blur-3xl"></div>
              </div>
              {/* Decorative Foot Icon */}
              <div className="absolute right-10 md:right-32 top-1/2 -translate-y-1/2 opacity-10">
                <Footprints className="w-64 h-64 md:w-96 md:h-96 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            {/* Tagline */}
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-white backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              {hero.tagline}
            </span>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">{hero.title}</h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-8">{hero.subtitle}</p>

            {/* Features List */}
            <div className="flex flex-wrap gap-4 mb-10">
              {hero.features.map((feature, i) => (
                <span key={i} className="flex items-center text-white/90 text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                  {feature}
                </span>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  if (services.length > 0) {
                    setSelectedService(services[0]);
                    setBookingModalOpen(true);
                  }
                }}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                style={{ backgroundColor: brandColors.primary }}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Appointment
              </button>
              <a href="#services" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl bg-white/10 text-white border border-white/30 backdrop-blur-sm hover:bg-white/20 transition-all">
                View Our Services
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </div>

            {/* Contact Info */}
            {store?.contact && (
              <div className="mt-12 flex flex-wrap items-center gap-6 text-white/70">
                {store.contact.phone && (
                  <a href={`tel:${store.contact.phone}`} className="flex items-center hover:text-white transition-colors">
                    <Phone className="w-4 h-4 mr-2" />
                    {store.contact.phone}
                  </a>
                )}
                {store.contact.address?.city && (
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {store.contact.address.city}, {store.contact.address.state}
                  </span>
                )}
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Open Today: 9:00 AM - 8:00 PM
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden md:block">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white py-8 border-b border-gray-100 md:-mt-16 relative z-10 mx-4 lg:mx-auto lg:max-w-5xl md:rounded-2xl md:shadow-xl">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
          {stats.map((stat, i) => (
            <div key={i} className="text-center px-4 py-4">
              <p className="text-2xl md:text-4xl font-bold flex items-center justify-center" style={{ color: brandColors.primary }}>
                {stat.value}
                {stat.icon && <stat.icon className="w-5 h-5 ml-1 fill-yellow-400 text-yellow-400" />}
              </p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-20 bg-gray-50" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: `${brandColors.primary}15`, color: brandColors.primary }}>
              <Sparkles className="w-4 h-4 mr-2" />
              What We Offer
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Discover our range of professional services designed to help you look and feel your best.</p>
          </div>

          {/* Category Filter Tabs */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all ${selectedCategory === "" ? "text-white shadow-lg" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
                style={selectedCategory === "" ? { backgroundColor: brandColors.primary } : {}}
              >
                Featured
              </button>
              {categories.slice(0, 5).map((category) => (
                <button
                  key={category._id || category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all ${selectedCategory === category.slug ? "text-white shadow-lg" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}
                  style={selectedCategory === category.slug ? { backgroundColor: brandColors.primary } : {}}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}

          {/* Service Cards Grid */}
          {services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <ServiceCard
                  key={service._id || service.id}
                  service={service}
                  onBook={() => {
                    setSelectedService(service);
                    setBookingModalOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${brandColors.primary}15` }}>
                <Sparkles className="w-8 h-8" style={{ color: brandColors.primary }} />
              </div>
              <p className="text-gray-500">Loading services...</p>
            </div>
          )}

          {/* Show More / Show Less Button */}
          {allServices.length > 6 && (
            <div className="text-center mt-12">
              <button onClick={() => setShowAllServices(!showAllServices)} className="inline-flex items-center px-8 py-4 font-semibold rounded-xl text-white transition-all hover:opacity-90 hover:shadow-lg" style={{ backgroundColor: brandColors.primary }}>
                {showAllServices ? (
                  <>
                    Show Less
                    <ArrowRight className="w-5 h-5 ml-2 rotate-[-90deg]" />
                  </>
                ) : (
                  <>
                    View All {allServices.length} Services
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Photo Gallery */}
      <div id="gallery">
        <PhotoGallery title="Our Work" />
      </div>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: `${brandColors.primary}15`, color: brandColors.primary }}>
              Why Choose Us
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The {store?.name || "Our"} Difference</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">What sets us apart is our unwavering commitment to excellence, personalized care, and creating an experience that goes beyond expectations.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${brandColors.primary}15` }}>
                  <feature.icon className="w-8 h-8" style={{ color: brandColors.primary }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <div id="about">
        <AboutSection />
      </div>

      {/* Team Section */}
      <div id="team">
        <TeamSection title="Meet Our Experts" />
      </div>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Contact Section */}
      <div id="contact">
        <ContactSection />
      </div>

      {/* Final CTA */}
      <section className="py-20" style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Experience the {store?.name || "Our"} Difference?</h2>
          <p className="text-white/90 text-lg mb-10 max-w-2xl mx-auto">Take the first step towards feeling your best. Contact us today to schedule your appointment or learn more about our services.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                if (services.length > 0) {
                  setSelectedService(services[0]);
                  setBookingModalOpen(true);
                }
              }}
              className="inline-flex items-center px-8 py-4 bg-white font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
              style={{ color: brandColors.primary }}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Now
            </button>
            <a href="#services" className="inline-flex items-center px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors">
              View Services & Prices
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} service={selectedService} />
    </div>
  );
}
