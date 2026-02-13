import { useState, useRef } from "react";
import { Cake, Palette, MessageSquare, Upload, AlertTriangle, Clock, ChevronDown, ChevronUp, X, Sparkles, Info, Weight, Check } from "lucide-react";

const SIZES = [
  { id: "half", label: "0.5 kg", sublabel: "Serves 2–4", multiplier: 1.0 },
  { id: "one", label: "1 kg", sublabel: "Serves 6–8", multiplier: 1.8 },
  { id: "two", label: "2 kg", sublabel: "Serves 12–16", multiplier: 3.2 },
  { id: "three", label: "3 kg", sublabel: "Serves 20–25", multiplier: 4.5 },
];

const FLAVORS = [
  { id: "vanilla", label: "Classic Vanilla", emoji: "🍦", color: "bg-yellow-50 border-yellow-200" },
  { id: "chocolate", label: "Belgian Chocolate", emoji: "🍫", color: "bg-amber-50 border-amber-200" },
  { id: "red-velvet", label: "Red Velvet", emoji: "❤️", color: "bg-red-50 border-red-200" },
  { id: "strawberry", label: "Fresh Strawberry", emoji: "🍓", color: "bg-pink-50 border-pink-200" },
  { id: "butterscotch", label: "Butterscotch", emoji: "🧈", color: "bg-orange-50 border-orange-200" },
  { id: "pineapple", label: "Tropical Pineapple", emoji: "🍍", color: "bg-lime-50 border-lime-200" },
  { id: "mango", label: "Alphonso Mango", emoji: "🥭", color: "bg-yellow-50 border-yellow-300" },
  { id: "black-forest", label: "Black Forest", emoji: "🍒", color: "bg-stone-50 border-stone-200" },
];

const ALLERGENS = ["Gluten", "Dairy", "Eggs", "Nuts", "Soy", "Peanuts"];

export default function CakeCustomizer({ basePrice = 0, onCustomizationChange, currencySymbol = "$" }) {
  const [selectedSize, setSelectedSize] = useState(SIZES[1]); // Default 1kg
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [cakeMessage, setCakeMessage] = useState("");
  const [customImage, setCustomImage] = useState(null);
  const [customImagePreview, setCustomImagePreview] = useState(null);
  const [showAllergens, setShowAllergens] = useState(false);
  const [expandedSection, setExpandedSection] = useState("size");
  const fileInputRef = useRef(null);

  const charLimit = 50;
  const prepTimeHours = selectedSize.id === "three" ? 48 : selectedSize.id === "two" ? 24 : 12;

  const calculatedPrice = basePrice * selectedSize.multiplier;

  // Notify parent of changes
  const notifyChange = (updates = {}) => {
    const current = {
      size: selectedSize.id,
      sizeLabel: selectedSize.label,
      flavor: updates.flavor !== undefined ? updates.flavor : selectedFlavor?.id,
      flavorLabel: updates.flavorLabel !== undefined ? updates.flavorLabel : selectedFlavor?.label,
      message: updates.message !== undefined ? updates.message : cakeMessage,
      customImage: updates.customImage !== undefined ? updates.customImage : customImage,
      totalPrice: updates.totalPrice !== undefined ? updates.totalPrice : calculatedPrice,
      prepTime: prepTimeHours,
      allergens: ALLERGENS,
      ...updates,
    };
    onCustomizationChange?.(current);
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    const newPrice = basePrice * size.multiplier;
    notifyChange({ size: size.id, sizeLabel: size.label, totalPrice: newPrice, prepTime: size.id === "three" ? 48 : size.id === "two" ? 24 : 12 });
  };

  const handleFlavorSelect = (flavor) => {
    setSelectedFlavor(flavor);
    notifyChange({ flavor: flavor.id, flavorLabel: flavor.label });
  };

  const handleMessageChange = (e) => {
    const val = e.target.value.slice(0, charLimit);
    setCakeMessage(val);
    notifyChange({ message: val });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }
    setCustomImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCustomImagePreview(ev.target.result);
      notifyChange({ customImage: file });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setCustomImage(null);
    setCustomImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    notifyChange({ customImage: null });
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-amber-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Customize Your Order</h3>
      </div>

      {/* ===== SIZE SELECTION ===== */}
      <div className="border border-amber-100 rounded-2xl overflow-hidden">
        <button onClick={() => toggleSection("size")} className="w-full flex items-center justify-between p-4 bg-amber-50/50 hover:bg-amber-50 transition-colors">
          <div className="flex items-center space-x-3">
            <Weight className="w-5 h-5 text-amber-600" />
            <div className="text-left">
              <span className="font-semibold text-gray-900">Size</span>
              {selectedSize && <span className="ml-2 text-sm text-amber-700 font-medium">— {selectedSize.label}</span>}
            </div>
          </div>
          {expandedSection === "size" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {expandedSection === "size" && (
          <div className="p-4 grid grid-cols-2 gap-3">
            {SIZES.map((size) => (
              <button
                key={size.id}
                onClick={() => handleSizeSelect(size)}
                className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${selectedSize.id === size.id ? "border-amber-500 bg-amber-50 shadow-md shadow-amber-100" : "border-gray-200 hover:border-amber-300 hover:bg-amber-50/30"}`}
              >
                {selectedSize.id === size.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <p className="font-bold text-gray-900">{size.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{size.sublabel}</p>
                <p className="text-sm font-semibold text-amber-700 mt-2">
                  {currencySymbol}
                  {(basePrice * size.multiplier).toFixed(2)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ===== FLAVOR PICKER ===== */}
      <div className="border border-amber-100 rounded-2xl overflow-hidden">
        <button onClick={() => toggleSection("flavor")} className="w-full flex items-center justify-between p-4 bg-amber-50/50 hover:bg-amber-50 transition-colors">
          <div className="flex items-center space-x-3">
            <Palette className="w-5 h-5 text-rose-500" />
            <div className="text-left">
              <span className="font-semibold text-gray-900">Flavor</span>
              {selectedFlavor && (
                <span className="ml-2 text-sm text-rose-600 font-medium">
                  — {selectedFlavor.emoji} {selectedFlavor.label}
                </span>
              )}
            </div>
          </div>
          {expandedSection === "flavor" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {expandedSection === "flavor" && (
          <div className="p-4 grid grid-cols-2 gap-2">
            {FLAVORS.map((flavor) => (
              <button key={flavor.id} onClick={() => handleFlavorSelect(flavor)} className={`flex items-center space-x-3 p-3 rounded-xl border-2 text-left transition-all duration-200 ${selectedFlavor?.id === flavor.id ? "border-amber-500 bg-amber-50 shadow-sm" : `${flavor.color} hover:shadow-sm`}`}>
                <span className="text-xl">{flavor.emoji}</span>
                <span className={`text-sm font-medium ${selectedFlavor?.id === flavor.id ? "text-amber-800" : "text-gray-700"}`}>{flavor.label}</span>
                {selectedFlavor?.id === flavor.id && <Check className="w-4 h-4 text-amber-600 ml-auto" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ===== CAKE MESSAGE ===== */}
      <div className="border border-amber-100 rounded-2xl overflow-hidden">
        <button onClick={() => toggleSection("message")} className="w-full flex items-center justify-between p-4 bg-amber-50/50 hover:bg-amber-50 transition-colors">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-5 h-5 text-purple-500" />
            <div className="text-left">
              <span className="font-semibold text-gray-900">Message on Cake</span>
              {cakeMessage && <span className="ml-2 text-sm text-purple-600 font-medium">— "{cakeMessage}"</span>}
            </div>
          </div>
          {expandedSection === "message" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {expandedSection === "message" && (
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                value={cakeMessage}
                onChange={handleMessageChange}
                placeholder='e.g. "Happy Birthday Sarah!"'
                maxLength={charLimit}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-gray-800 placeholder-gray-400 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {cakeMessage.length}/{charLimit}
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500 flex items-center">
              <Info className="w-3 h-3 mr-1" />
              Optional. Leave empty for no message.
            </p>
          </div>
        )}
      </div>

      {/* ===== CUSTOM IMAGE UPLOAD ===== */}
      <div className="border border-amber-100 rounded-2xl overflow-hidden">
        <button onClick={() => toggleSection("image")} className="w-full flex items-center justify-between p-4 bg-amber-50/50 hover:bg-amber-50 transition-colors">
          <div className="flex items-center space-x-3">
            <Upload className="w-5 h-5 text-blue-500" />
            <div className="text-left">
              <span className="font-semibold text-gray-900">Photo on Cake</span>
              {customImagePreview && <span className="ml-2 text-sm text-blue-600 font-medium">— Uploaded ✓</span>}
            </div>
          </div>
          {expandedSection === "image" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {expandedSection === "image" && (
          <div className="p-4">
            {customImagePreview ? (
              <div className="relative inline-block">
                <img src={customImagePreview} alt="Custom cake" className="w-32 h-32 object-cover rounded-xl border-2 border-amber-200" />
                <button onClick={removeImage} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-600">Upload a photo for your cake</span>
                <span className="text-xs text-gray-400 mt-1">JPG, PNG • Max 5MB</span>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
            <p className="mt-2 text-xs text-gray-500 flex items-center">
              <Info className="w-3 h-3 mr-1" />
              For photo cakes only. We'll print this on your cake.
            </p>
          </div>
        )}
      </div>

      {/* ===== ALLERGEN INFO ===== */}
      <div className="border border-orange-100 rounded-2xl overflow-hidden bg-orange-50/30">
        <button onClick={() => setShowAllergens(!showAllergens)} className="w-full flex items-center justify-between p-4 hover:bg-orange-50/50 transition-colors">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-gray-900">Allergen Information</span>
          </div>
          {showAllergens ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>
        {showAllergens && (
          <div className="px-4 pb-4">
            <div className="flex flex-wrap gap-2">
              {ALLERGENS.map((allergen) => (
                <span key={allergen} className="px-3 py-1.5 bg-orange-100 text-orange-800 text-xs font-medium rounded-full border border-orange-200">
                  {allergen}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-orange-700">⚠️ Our products may contain or come in contact with these allergens. Please contact us for specific dietary requirements.</p>
          </div>
        )}
      </div>

      {/* ===== PREP TIME NOTICE ===== */}
      <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
        <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900">Preparation Time: ~{prepTimeHours} hours</p>
          <p className="text-xs text-blue-700 mt-1">{prepTimeHours >= 48 ? "Large cakes require 2 days advance order." : prepTimeHours >= 24 ? "Please order at least 1 day in advance." : "Same-day orders available if placed before 10 AM."}</p>
        </div>
      </div>

      {/* ===== PRICE SUMMARY ===== */}
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Customized Price</p>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                {currencySymbol}
                {calculatedPrice.toFixed(2)}
              </span>
              {selectedSize.multiplier > 1 && (
                <span className="text-xs text-gray-500">
                  (Base: {currencySymbol}
                  {basePrice.toFixed(2)} × {selectedSize.label})
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            {selectedFlavor && (
              <p className="text-xs text-amber-700">
                {selectedFlavor.emoji} {selectedFlavor.label}
              </p>
            )}
            {cakeMessage && <p className="text-xs text-purple-600 italic mt-0.5">"{cakeMessage}"</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
