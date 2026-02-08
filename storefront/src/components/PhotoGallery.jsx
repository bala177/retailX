import { useState } from "react";
import { useStore } from "../context/StoreContext";
import { X, ChevronLeft, ChevronRight, ZoomIn, Grid3X3, Rows3, Image as ImageIcon } from "lucide-react";

export default function PhotoGallery({ images = [], title = "Our Work" }) {
  const { store } = useStore();
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid, masonry
  const [filter, setFilter] = useState("all");

  const brandColors = {
    primary: store?.branding?.primaryColor || "#6366f1",
    secondary: store?.branding?.secondaryColor || "#4f46e5",
  };

  // Default gallery images for different service types
  const defaultGalleryImages = {
    hairsalon: [
      { url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800", category: "haircuts", title: "Classic Bob Cut" },
      { url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800", category: "coloring", title: "Balayage Highlights" },
      { url: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800", category: "styling", title: "Bridal Styling" },
      { url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800", category: "haircuts", title: "Modern Layered Cut" },
      { url: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800", category: "coloring", title: "Vibrant Color" },
      { url: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=800", category: "styling", title: "Event Updo" },
      { url: "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800", category: "treatments", title: "Keratin Treatment" },
      { url: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800", category: "haircuts", title: "Precision Cut" },
    ],
    spa: [
      { url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800", category: "massage", title: "Thai Massage" },
      { url: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800", category: "massage", title: "Hot Stone Therapy" },
      { url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800", category: "aromatherapy", title: "Aromatherapy Session" },
      { url: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800", category: "body", title: "Body Wrap Treatment" },
      { url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800", category: "facial", title: "Luxury Facial" },
      { url: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800", category: "massage", title: "Deep Tissue Massage" },
      { url: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800", category: "relaxation", title: "Meditation Room" },
      { url: "https://images.unsplash.com/photo-1583416750470-965b2707b355?w=800", category: "aromatherapy", title: "Essential Oils" },
    ],
    podologie: [
      { url: "https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800", category: "pedicure", title: "Medical Pedicure" },
      { url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800", category: "massage", title: "Foot Reflexology" },
      { url: "https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?w=800", category: "treatment", title: "Heel Treatment" },
      { url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800", category: "therapy", title: "Foot Therapy" },
      { url: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800", category: "wellness", title: "Foot Wellness" },
      { url: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=800", category: "relaxation", title: "Relaxation" },
    ],
  };

  // Determine store type from slug
  const getStoreType = () => {
    const slug = store?.slug || "";
    if (slug.includes("hair") || slug.includes("salon") || slug.includes("glamour")) return "hairsalon";
    if (slug.includes("spa") || slug.includes("massage") || slug.includes("tranquil")) return "spa";
    if (slug.includes("feet") || slug.includes("foot") || slug.includes("podolog")) return "podologie";
    return "spa"; // Default
  };

  const galleryImages = images.length > 0 ? images : defaultGalleryImages[getStoreType()] || defaultGalleryImages.spa;

  // Get unique categories
  const categories = ["all", ...new Set(galleryImages.map((img) => img.category).filter(Boolean))];

  // Filter images
  const filteredImages = filter === "all" ? galleryImages : galleryImages.filter((img) => img.category === filter);

  // Navigate lightbox
  const navigateImage = (direction) => {
    const currentIndex = filteredImages.findIndex((img) => img.url === selectedImage.url);
    let newIndex;
    if (direction === "next") {
      newIndex = (currentIndex + 1) % filteredImages.length;
    } else {
      newIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    }
    setSelectedImage(filteredImages[newIndex]);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!selectedImage) return;
    if (e.key === "Escape") setSelectedImage(null);
    if (e.key === "ArrowRight") navigateImage("next");
    if (e.key === "ArrowLeft") navigateImage("prev");
  };

  return (
    <section className="py-16 bg-white" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: `${brandColors.primary}15`, color: brandColors.primary }}>
            <ImageIcon className="w-4 h-4 mr-2" />
            Gallery
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Explore our portfolio and see the quality of our work. Each image represents our commitment to excellence.</p>
        </div>

        {/* Filters and View Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === category ? "text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                style={filter === category ? { backgroundColor: brandColors.primary } : {}}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`} title="Grid view">
              <Grid3X3 className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={() => setViewMode("masonry")} className={`p-2 rounded-md transition-colors ${viewMode === "masonry" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`} title="Masonry view">
              <Rows3 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Gallery Grid */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map((image, index) => (
              <div key={index} onClick={() => setSelectedImage(image)} className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300">
                <img src={image.url} alt={image.title || `Gallery image ${index + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                    <ZoomIn className="w-6 h-6 text-white" />
                  </div>
                </div>
                {image.title && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white font-medium truncate">{image.title}</p>
                    {image.category && <p className="text-white/70 text-sm capitalize">{image.category}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Masonry layout
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filteredImages.map((image, index) => (
              <div key={index} onClick={() => setSelectedImage(image)} className="group relative break-inside-avoid rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300">
                <img src={image.url} alt={image.title || `Gallery image ${index + 1}`} className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                    <ZoomIn className="w-6 h-6 text-white" />
                  </div>
                </div>
                {image.title && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white font-medium truncate">{image.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {selectedImage && (
          <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setSelectedImage(null)}>
            {/* Close Button */}
            <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10">
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage("prev");
              }}
              className="absolute left-4 md:left-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <ChevronLeft className="w-8 h-8 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage("next");
              }}
              className="absolute right-4 md:right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <ChevronRight className="w-8 h-8 text-white" />
            </button>

            {/* Image */}
            <div onClick={(e) => e.stopPropagation()} className="max-w-5xl max-h-[85vh] mx-4">
              <img src={selectedImage.url} alt={selectedImage.title || "Gallery image"} className="max-w-full max-h-[80vh] object-contain rounded-lg" />
              {selectedImage.title && (
                <div className="text-center mt-4">
                  <h3 className="text-xl font-semibold text-white">{selectedImage.title}</h3>
                  {selectedImage.category && <p className="text-white/70 capitalize mt-1">{selectedImage.category}</p>}
                </div>
              )}
            </div>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm">
              {filteredImages.findIndex((img) => img.url === selectedImage.url) + 1} / {filteredImages.length}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
