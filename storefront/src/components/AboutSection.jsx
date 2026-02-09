import { useStore } from "../context/StoreContext";
import { Award, Heart, Users, Clock, Target, Sparkles, CheckCircle, ArrowRight, Footprints } from "lucide-react";
import { Link } from "react-router-dom";

const iconMap = { Award, Heart, Users, Clock, Target, Sparkles, CheckCircle, Footprints };

export default function AboutSection() {
  const { store } = useStore();

  const brandColors = {
    primary: store?.branding?.primaryColor || "#6366f1",
    secondary: store?.branding?.secondaryColor || "#4f46e5",
  };

  // Check if store has custom about content
  const hasCustomContent = store?.aboutContent && (store.aboutContent.headline || store.aboutContent.description || store.aboutContent.story);

  // Store-specific content fallback
  const getStoreType = () => {
    const slug = store?.slug || "";
    if (slug.includes("hair") || slug.includes("salon") || slug.includes("glamour")) return "hairsalon";
    if (slug.includes("spa") || slug.includes("massage") || slug.includes("tranquil")) return "spa";
    if (slug.includes("feet") || slug.includes("foot") || slug.includes("podolog")) return "podologie";
    return "spa";
  };

  const storeType = getStoreType();

  // Default content per store type (fallback when no custom content set)
  const defaultContent = {
    hairsalon: {
      headline: "Where Artistry Meets Style",
      subheadline: "Transforming hair, transforming confidence",
      description: "Welcome to our award-winning hair studio, where every visit is an experience tailored to you.",
      story: "Founded with a passion for hair artistry, we've grown from a small salon to a premier destination for those seeking exceptional hair care.",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
      secondaryImage: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600",
      values: [
        { icon: Sparkles, title: "Creativity", desc: "Innovative styles that set trends" },
        { icon: Heart, title: "Care", desc: "Your hair health is our priority" },
        { icon: Award, title: "Excellence", desc: "Uncompromising quality standards" },
        { icon: Users, title: "Connection", desc: "Building lasting relationships" },
      ],
      stats: [
        { value: "15+", label: "Years of Excellence" },
        { value: "50,000+", label: "Happy Clients" },
        { value: "25+", label: "Expert Stylists" },
        { value: "100+", label: "Awards Won" },
      ],
      features: ["Premium hair products", "Continuous education", "Personalized consultations", "Relaxing atmosphere", "Latest techniques", "Color correction experts"],
    },
    spa: {
      headline: "Your Sanctuary of Serenity",
      subheadline: "Where relaxation meets rejuvenation",
      description: "Step into our tranquil oasis and leave the stresses of daily life behind.",
      story: "Born from a deep appreciation for holistic wellness, our spa was created to be more than just a place for treatments.",
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
      secondaryImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600",
      values: [
        { icon: Heart, title: "Wellness", desc: "Holistic approach to health" },
        { icon: Target, title: "Precision", desc: "Tailored treatments for you" },
        { icon: Clock, title: "Timeless", desc: "Ancient wisdom, modern care" },
        { icon: Sparkles, title: "Renewal", desc: "Rejuvenate body and soul" },
      ],
      stats: [
        { value: "12+", label: "Years of Healing" },
        { value: "40,000+", label: "Treatments Given" },
        { value: "20+", label: "Certified Therapists" },
        { value: "98%", label: "Client Satisfaction" },
      ],
      features: ["Thai massage specialists", "Aromatherapy experts", "Hot stone treatments", "Couples packages", "Corporate wellness", "Gift certificates"],
    },
    podologie: {
      headline: "Expert Foot Care You Can Trust",
      subheadline: "Where medical expertise meets compassionate care",
      description: "Our clinic combines medical-grade foot care with a welcoming, comfortable environment.",
      story: "We believe healthy feet are the foundation of an active, fulfilling life.",
      image: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800",
      secondaryImage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600",
      values: [
        { icon: Award, title: "Expertise", desc: "Board-certified specialists" },
        { icon: Heart, title: "Compassion", desc: "Patient-centered approach" },
        { icon: Target, title: "Precision", desc: "Accurate diagnosis & treatment" },
        { icon: CheckCircle, title: "Results", desc: "Proven treatment outcomes" },
      ],
      stats: [
        { value: "20+", label: "Years in Practice" },
        { value: "35,000+", label: "Patients Treated" },
        { value: "15+", label: "Specialists" },
        { value: "99%", label: "Treatment Success" },
      ],
      features: ["Diabetic foot care", "Sports podiatry", "Custom orthotics", "Nail surgery", "Wound care", "Biomechanical assessments"],
    },
  };

  const fallback = defaultContent[storeType] || defaultContent.spa;

  // Build content: prefer custom from DB, fallback to defaults
  const aboutData = store?.aboutContent || {};
  const content = {
    headline: aboutData.headline || fallback.headline,
    subheadline: aboutData.description || fallback.subheadline,
    description: aboutData.description || fallback.description,
    story: aboutData.story || fallback.story,
    image: aboutData.images?.[0] || fallback.image,
    secondaryImage: aboutData.images?.[1] || fallback.secondaryImage,
    values: aboutData.values?.length > 0 ? aboutData.values.map((v) => ({ icon: Heart, title: v.title, desc: v.description, emoji: v.icon })) : fallback.values,
    stats: aboutData.stats?.length > 0 ? aboutData.stats : fallback.stats,
    features: aboutData.features?.length > 0 ? aboutData.features : fallback.features,
  };

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main About Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          {/* Image Side */}
          <div className="relative">
            {/* Main Image or Icon Placeholder */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              {content.image ? (
                <>
                  <img src={content.image} alt="About our business" className="w-full h-[500px] object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </>
              ) : (
                <div className="w-full h-[500px] bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 flex items-center justify-center">
                  <Footprints className="w-48 h-48 text-blue-400" />
                </div>
              )}
            </div>

            {/* Secondary Floating Image - only show if has image */}
            {content.secondaryImage && (
              <div className="absolute -bottom-8 -right-8 w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden shadow-xl border-4 border-white hidden md:block">
                <img src={content.secondaryImage} alt="Our work" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Experience Badge */}
            <div className="absolute top-6 -left-4 md:-left-8 bg-white rounded-2xl shadow-xl p-4 md:p-6">
              <p className="text-3xl md:text-4xl font-bold" style={{ color: brandColors.primary }}>
                {content.stats[0].value}
              </p>
              <p className="text-sm text-gray-600">{content.stats[0].label}</p>
            </div>
          </div>

          {/* Content Side */}
          <div>
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-6" style={{ backgroundColor: `${brandColors.primary}15`, color: brandColors.primary }}>
              <Heart className="w-4 h-4 mr-2" />
              About Us
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">{content.headline}</h2>
            <p className="text-lg md:text-xl text-gray-600 mb-6">{content.subheadline}</p>

            <p className="text-gray-600 leading-relaxed mb-6">{content.description}</p>
            <p className="text-gray-600 leading-relaxed mb-8">{content.story}</p>

            {/* Features List */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {content.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: brandColors.primary }} />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <Link to="/products" className="inline-flex items-center px-8 py-4 rounded-full text-white font-semibold transition-all hover:shadow-lg" style={{ backgroundColor: brandColors.primary }}>
              Explore Our Services
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Our Core Values</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">These principles guide everything we do and define who we are as a team.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {content.values.map((value, index) => (
              <div key={index} className="group text-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-colors" style={{ backgroundColor: `${brandColors.primary}15` }}>
                  {value.emoji ? <span className="text-2xl">{value.emoji}</span> : value.icon ? <value.icon className="w-8 h-8" style={{ color: brandColors.primary }} /> : <Heart className="w-8 h-8" style={{ color: brandColors.primary }} />}
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{value.title}</h4>
                <p className="text-sm text-gray-600">{value.desc || value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="rounded-3xl p-8 md:p-12" style={{ backgroundColor: brandColors.primary }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {content.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
