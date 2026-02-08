import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { Star, Award, Calendar, Instagram, ChevronLeft, ChevronRight, Users } from "lucide-react";

export default function TeamSection({ team = [], title = "Meet Our Experts" }) {
  const { store } = useStore();
  const [activeIndex, setActiveIndex] = useState(0);

  const brandColors = {
    primary: store?.branding?.primaryColor || "#6366f1",
    secondary: store?.branding?.secondaryColor || "#4f46e5",
  };

  // Default team members based on store type
  const defaultTeamMembers = {
    hairsalon: [
      {
        name: "Sarah Mitchell",
        role: "Senior Stylist & Creative Director",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
        bio: "With over 15 years of experience, Sarah specializes in precision cuts and color transformations. Her work has been featured in major fashion magazines.",
        specialties: ["Color Specialist", "Balayage Expert", "Bridal Styling"],
        rating: 4.9,
        reviews: 234,
        yearsExp: 15,
        instagram: "@sarahmitchellhair",
      },
      {
        name: "Marcus Chen",
        role: "Master Colorist",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        bio: "Marcus is known for his innovative color techniques and ability to create stunning, natural-looking highlights that complement every skin tone.",
        specialties: ["Highlights", "Ombre", "Fashion Colors"],
        rating: 4.8,
        reviews: 189,
        yearsExp: 12,
        instagram: "@marcuschencolor",
      },
      {
        name: "Emma Rodriguez",
        role: "Texture & Treatment Specialist",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
        bio: "Emma focuses on hair health and texture, offering customized treatment plans and styling solutions for all hair types.",
        specialties: ["Keratin Treatments", "Curly Hair", "Hair Repair"],
        rating: 4.9,
        reviews: 167,
        yearsExp: 8,
        instagram: "@emmatexturesstudio",
      },
      {
        name: "David Park",
        role: "Men's Grooming Expert",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
        bio: "David brings precision and style to men's grooming with his expertise in classic and contemporary cuts.",
        specialties: ["Fades", "Beard Styling", "Classic Cuts"],
        rating: 4.8,
        reviews: 145,
        yearsExp: 10,
        instagram: "@davidparkbarber",
      },
    ],
    spa: [
      {
        name: "Mia Thompson",
        role: "Lead Massage Therapist",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
        bio: "Mia is a certified massage therapist with expertise in Swedish, Deep Tissue, and Thai massage techniques.",
        specialties: ["Thai Massage", "Deep Tissue", "Aromatherapy"],
        rating: 5.0,
        reviews: 312,
        yearsExp: 14,
        instagram: "@miatherapytouch",
      },
      {
        name: "Dr. Anika Patel",
        role: "Wellness Director",
        image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400",
        bio: "Dr. Patel oversees all wellness programs and ensures each treatment plan is tailored to individual needs.",
        specialties: ["Holistic Wellness", "Stress Relief", "Meditation"],
        rating: 4.9,
        reviews: 278,
        yearsExp: 18,
        instagram: "@dranikapatel",
      },
      {
        name: "James Wilson",
        role: "Senior Spa Therapist",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
        bio: "James specializes in therapeutic treatments that combine ancient techniques with modern spa practices.",
        specialties: ["Hot Stone", "Sports Massage", "Reflexology"],
        rating: 4.8,
        reviews: 198,
        yearsExp: 11,
        instagram: "@jameswellness",
      },
    ],
    podologie: [
      {
        name: "Dr. Helena Fischer",
        role: "Chief Podiatrist",
        image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400",
        bio: "Dr. Fischer is a board-certified podiatrist with extensive experience in diabetic foot care and sports podiatry.",
        specialties: ["Diabetic Foot Care", "Sports Podiatry", "Nail Surgery"],
        rating: 5.0,
        reviews: 256,
        yearsExp: 20,
        instagram: "@drhelenafeet",
      },
      {
        name: "Thomas Meyer",
        role: "Medical Pedicurist",
        image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400",
        bio: "Thomas combines medical expertise with aesthetic care to provide comprehensive foot treatments.",
        specialties: ["Medical Pedicure", "Callus Treatment", "Orthotic Fitting"],
        rating: 4.9,
        reviews: 189,
        yearsExp: 12,
        instagram: "@thomasmedipedi",
      },
      {
        name: "Lisa Andersson",
        role: "Foot Wellness Specialist",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
        bio: "Lisa specializes in therapeutic foot massages and relaxation treatments for tired feet.",
        specialties: ["Foot Massage", "Reflexology", "Spa Pedicure"],
        rating: 4.8,
        reviews: 167,
        yearsExp: 9,
        instagram: "@lisafootwellness",
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

  const teamMembers = team.length > 0 ? team : defaultTeamMembers[getStoreType()] || defaultTeamMembers.spa;

  const nextMember = () => {
    setActiveIndex((prev) => (prev + 1) % teamMembers.length);
  };

  const prevMember = () => {
    setActiveIndex((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: `${brandColors.primary}15`, color: brandColors.primary }}>
            <Users className="w-4 h-4 mr-2" />
            Our Team
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Our team of certified professionals is dedicated to providing you with exceptional service and care. Each member brings unique expertise and passion.</p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer ${activeIndex === index ? "ring-2 shadow-xl scale-[1.02]" : ""}`}
              style={activeIndex === index ? { ringColor: brandColors.primary } : {}}
            >
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img src={member.image} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Quick Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-white/80 text-sm">{member.role}</p>
                  <div className="flex items-center mt-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 text-sm font-medium">{member.rating}</span>
                    <span className="mx-2 text-white/50">•</span>
                    <span className="text-sm text-white/80">{member.reviews} reviews</span>
                  </div>
                </div>

                {/* Experience Badge */}
                <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-800">{member.yearsExp}+ years</div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Member Detail Card */}
        <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Side */}
            <div className="relative aspect-square lg:aspect-auto">
              <img src={teamMembers[activeIndex].image} alt={teamMembers[activeIndex].name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 lg:bg-gradient-to-l" />

              {/* Navigation Arrows */}
              <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 lg:hidden">
                <button onClick={prevMember} className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <button onClick={nextMember} className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Content Side */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="flex items-center space-x-2 mb-4">
                <Award className="w-5 h-5" style={{ color: brandColors.primary }} />
                <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: brandColors.primary }}>
                  Featured Professional
                </span>
              </div>

              <h3 className="text-3xl font-bold text-gray-900 mb-2">{teamMembers[activeIndex].name}</h3>
              <p className="text-lg text-gray-600 mb-4">{teamMembers[activeIndex].role}</p>

              {/* Rating */}
              <div className="flex items-center mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(teamMembers[activeIndex].rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                  ))}
                </div>
                <span className="ml-2 font-bold text-gray-900">{teamMembers[activeIndex].rating}</span>
                <span className="ml-2 text-gray-500">({teamMembers[activeIndex].reviews} reviews)</span>
              </div>

              {/* Bio */}
              <p className="text-gray-600 mb-6 leading-relaxed">{teamMembers[activeIndex].bio}</p>

              {/* Specialties */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {teamMembers[activeIndex].specialties.map((specialty, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: `${brandColors.primary}15`, color: brandColors.primary }}>
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-gray-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{teamMembers[activeIndex].yearsExp}+</p>
                  <p className="text-sm text-gray-500">Years Experience</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{teamMembers[activeIndex].reviews}</p>
                  <p className="text-sm text-gray-500">Client Reviews</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{Math.round(teamMembers[activeIndex].reviews * 0.95)}+</p>
                  <p className="text-sm text-gray-500">Happy Clients</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold transition-all hover:shadow-lg" style={{ backgroundColor: brandColors.primary }}>
                  <Calendar className="w-5 h-5 mr-2" />
                  Book with {teamMembers[activeIndex].name.split(" ")[0]}
                </button>
                {teamMembers[activeIndex].instagram && (
                  <a
                    href={`https://instagram.com/${teamMembers[activeIndex].instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-6 py-3 border-2 rounded-xl font-semibold transition-all hover:bg-gray-50"
                    style={{ borderColor: brandColors.primary, color: brandColors.primary }}
                  >
                    <Instagram className="w-5 h-5 mr-2" />
                    Follow
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 left-4">
            <button onClick={prevMember} className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
          </div>
          <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 right-4">
            <button onClick={nextMember} className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors">
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
