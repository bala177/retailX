import { useState, useEffect } from "react";
import { useStore } from "../context/StoreContext";
import { Star, Quote, ChevronLeft, ChevronRight, MessageCircle, ThumbsUp, Verified } from "lucide-react";

export default function TestimonialsSection({ testimonials = [] }) {
  const { store } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const brandColors = {
    primary: store?.branding?.primaryColor || "#6366f1",
    secondary: store?.branding?.secondaryColor || "#4f46e5",
  };

  // Default testimonials based on store type
  const defaultTestimonials = {
    hairsalon: [
      {
        name: "Jennifer Lawrence",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        rating: 5,
        service: "Balayage & Haircut",
        date: "2 weeks ago",
        text: "Absolutely love my new hair! Sarah understood exactly what I wanted and delivered beyond my expectations. The balayage is perfect - natural yet stunning. Will definitely be coming back!",
        verified: true,
      },
      {
        name: "Michael Stevens",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        rating: 5,
        service: "Men's Cut & Styling",
        date: "1 week ago",
        text: "Best haircut I've had in years! David really knows his craft. The attention to detail and the relaxed atmosphere made the whole experience enjoyable. Highly recommend!",
        verified: true,
      },
      {
        name: "Emily Chen",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
        rating: 5,
        service: "Color Correction",
        date: "3 days ago",
        text: "I came in with a hair disaster from another salon, and Marcus worked magic! My hair looks healthier than ever and the color is exactly what I dreamed of. Thank you so much!",
        verified: true,
      },
      {
        name: "Sarah Thompson",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
        rating: 5,
        service: "Bridal Hair",
        date: "1 month ago",
        text: "They did my hair for my wedding and it was absolutely perfect! The trial went smoothly and on the big day, my hair stayed flawless all night. Couldn't have asked for better!",
        verified: true,
      },
    ],
    spa: [
      {
        name: "Amanda Roberts",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100",
        rating: 5,
        service: "Thai Massage",
        date: "1 week ago",
        text: "The most relaxing experience I've ever had. Mia's Thai massage technique is incredible - I felt like a new person afterwards. The ambiance is peaceful and the staff is so welcoming.",
        verified: true,
      },
      {
        name: "David Kim",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100",
        rating: 5,
        service: "Deep Tissue Massage",
        date: "3 days ago",
        text: "As someone with chronic back pain, finding this spa has been life-changing. James's deep tissue massage provides relief that lasts. I've been coming weekly for 3 months now.",
        verified: true,
      },
      {
        name: "Rachel Green",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
        rating: 5,
        service: "Aromatherapy Session",
        date: "2 weeks ago",
        text: "A truly transformative experience! The aromatherapy session helped me destress completely. The oils they use are premium quality and the therapist was very attentive to my needs.",
        verified: true,
      },
      {
        name: "Thomas Brown",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
        rating: 5,
        service: "Hot Stone Therapy",
        date: "1 week ago",
        text: "The hot stone therapy was exactly what I needed after a stressful month. The heat combined with expert massage melted all my tension away. Booking another session already!",
        verified: true,
      },
    ],
    podologie: [
      {
        name: "Margaret Wilson",
        avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100",
        rating: 5,
        service: "Medical Pedicure",
        date: "1 week ago",
        text: "Dr. Fischer is amazing! As a diabetic, I need specialized foot care, and this clinic provides exactly that. They're thorough, professional, and genuinely care about my health.",
        verified: true,
      },
      {
        name: "Robert Johnson",
        avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100",
        rating: 5,
        service: "Orthotic Fitting",
        date: "2 weeks ago",
        text: "Finally got custom orthotics that actually work! Thomas took his time to understand my needs and the result has eliminated my foot pain during runs. Worth every penny!",
        verified: true,
      },
      {
        name: "Susan Davis",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        rating: 5,
        service: "Spa Pedicure",
        date: "5 days ago",
        text: "The most relaxing pedicure I've ever had! Lisa has magic hands. My feet look and feel amazing. The foot massage at the end was the perfect touch. Will be a regular client!",
        verified: true,
      },
      {
        name: "John Martinez",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        rating: 5,
        service: "Sports Podiatry",
        date: "1 month ago",
        text: "As a marathon runner, proper foot care is essential. The team here understands athletes' needs. The treatment plan they created has kept me injury-free for my last three races!",
        verified: true,
      },
    ],
  };

  // Determine store type
  const getStoreType = () => {
    const slug = store?.slug || "";
    if (slug.includes("hair") || slug.includes("salon") || slug.includes("glamour")) return "hairsalon";
    if (slug.includes("spa") || slug.includes("massage") || slug.includes("tranquil")) return "spa";
    if (slug.includes("feet") || slug.includes("foot") || slug.includes("podolog")) return "podologie";
    return "spa";
  };

  const reviews = testimonials.length > 0 ? testimonials : defaultTestimonials[getStoreType()] || defaultTestimonials.spa;

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, reviews.length]);

  const nextReview = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  // Calculate average rating
  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: `${brandColors.primary}15`, color: brandColors.primary }}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Testimonials
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">Real experiences from our valued clients. Your satisfaction is our greatest achievement.</p>

          {/* Overall Rating Summary */}
          <div className="inline-flex items-center space-x-4 bg-white px-6 py-4 rounded-2xl shadow-lg">
            <div className="text-center pr-4 border-r border-gray-200">
              <p className="text-4xl font-bold" style={{ color: brandColors.primary }}>
                {avgRating}
              </p>
              <div className="flex items-center justify-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                ))}
              </div>
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">{reviews.length}+ Reviews</p>
              <p className="text-sm text-gray-500">from verified clients</p>
            </div>
          </div>
        </div>

        {/* Featured Testimonial */}
        <div className="relative max-w-4xl mx-auto mb-16">
          {/* Background Decoration */}
          <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: brandColors.primary }} />
          <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: brandColors.primary }} />

          {/* Quote Icon */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: brandColors.primary }}>
            <Quote className="w-6 h-6" />
          </div>

          {/* Testimonial Card */}
          <div className="relative bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="text-center">
              {/* Stars */}
              <div className="flex items-center justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-6 h-6 ${i < reviews[currentIndex].rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8 italic">"{reviews[currentIndex].text}"</blockquote>

              {/* Author */}
              <div className="flex flex-col items-center">
                <img src={reviews[currentIndex].avatar} alt={reviews[currentIndex].name} className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg mb-4" />
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-gray-900">{reviews[currentIndex].name}</h4>
                  {reviews[currentIndex].verified && (
                    <span className="flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                      <Verified className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {reviews[currentIndex].service} • {reviews[currentIndex].date}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <button onClick={prevReview} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={nextReview} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Dots Navigation */}
          <div className="flex items-center justify-center space-x-2 mt-8">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(index);
                }}
                className={`h-2.5 rounded-full transition-all duration-300 ${index === currentIndex ? "w-8" : "w-2.5 bg-gray-300 hover:bg-gray-400"}`}
                style={index === currentIndex ? { backgroundColor: brandColors.primary } : {}}
              />
            ))}
          </div>
        </div>

        {/* Mini Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reviews.map((review, index) => (
            <div
              key={index}
              onClick={() => {
                setIsAutoPlaying(false);
                setCurrentIndex(index);
              }}
              className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 ${index === currentIndex ? "bg-white shadow-lg ring-2 scale-[1.02]" : "bg-white/50 hover:bg-white hover:shadow-md"}`}
              style={index === currentIndex ? { ringColor: brandColors.primary } : {}}
            >
              <div className="flex items-center space-x-3 mb-3">
                <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h5 className="font-semibold text-gray-900 text-sm">{review.name}</h5>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{review.text}</p>
              <p className="text-xs text-gray-400 mt-2">{review.service}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Join thousands of satisfied clients</p>
          <button className="inline-flex items-center px-8 py-3 rounded-full text-white font-semibold transition-all hover:shadow-lg" style={{ backgroundColor: brandColors.primary }}>
            <ThumbsUp className="w-5 h-5 mr-2" />
            Book Your Appointment
          </button>
        </div>
      </div>
    </section>
  );
}
