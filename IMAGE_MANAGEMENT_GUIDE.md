# RetailX Image Management Guide

Complete guide for managing store images including logos, hero banners, product images, and gallery assets.

---

## 📁 Directory Structure

```
backend/public/
├── uploads/
│   ├── heroes/
│   │   ├── glamour-hair-hero.jpg          # Main hero banner (1920x600px)
│   │   ├── glamour-hair-hero-alt.jpg      # Alternative/seasonal banner
│   │   ├── fresh-mart-hero.jpg
│   │   ├── tranquil-spa-hero.jpg
│   │   └── healthy-feet-hero.jpg
│   │
│   ├── logos/
│   │   ├── glamour-hair.png               # Store logo (200x200px)
│   │   ├── fresh-mart.png
│   │   ├── tranquil-spa.png
│   │   └── healthy-feet.png
│   │
│   ├── products/
│   │   ├── glamour-hair/
│   │   │   ├── service-1.jpg
│   │   │   └── service-2.jpg
│   │   ├── fresh-mart/
│   │   │   └── ...
│   │   ├── tranquil-spa/
│   │   │   └── ...
│   │   └── healthy-feet/
│   │       └── ...
│   │
│   ├── categories/
│   │   ├── glamour-hair/
│   │   │   ├── haircuts-styling.png
│   │   │   └── hair-coloring.png
│   │   └── ...
│   │
│   └── gallery/
│       ├── glamour-hair/
│       │   ├── gallery-1.jpg
│       │   └── gallery-2.jpg
│       └── ...
```

---

## 🎨 Image Specifications

### Logo Images

```
Specs:
  ├─ Dimensions: 200x200px (square)
  ├─ Format: PNG
  ├─ Background: Transparent
  ├─ Quality: Lossless (for crisp rendering)
  ├─ File Size: <50KB
  └─ Usage: Store sidebar, favicon, browser tabs

Database Field: branding.logo
URL Format: /uploads/logos/[store-slug].png
Example: /uploads/logos/glamour-hair.png
```

### Hero Banner Images

```
Specs:
  ├─ Dimensions: 1920x600px (16:5 ratio)
  ├─ Format: JPG
  ├─ Quality: 85-90% JPG quality
  ├─ File Size: <200KB
  ├─ Usage: Main storefront banner, homepage
  └─ Safe Text Area: Center 60% (600-1320px horizontal)

Database Fields:
  ├─ branding.heroBanner (main)
  └─ branding.heroBannerAlt (seasonal/secondary)

URL Format: /uploads/heroes/[store-slug]-hero.jpg
Examples:
  ├─ /uploads/heroes/glamour-hair-hero.jpg
  └─ /uploads/heroes/glamour-hair-hero-alt.jpg
```

### Product/Service Images

```
Specs:
  ├─ Dimensions: 600x600px (square)
  ├─ Format: JPG
  ├─ Quality: 85-90% JPG quality
  ├─ File Size: <80KB
  ├─ Background: White or contextual
  ├─ Usage: Product listing, detail pages
  └─ Multiple angles recommended (front, side, detail)

Database Field: product.image or product.images[]
URL Format: /uploads/products/[store-slug]/[product-slug].jpg
Example: /uploads/products/glamour-hair/womens-haircut.jpg
```

### Category Icons

```
Specs:
  ├─ Dimensions: 200x200px (square)
  ├─ Format: PNG
  ├─ Background: Transparent or colored
  ├─ Quality: Lossless
  ├─ File Size: <50KB
  ├─ Style: Flat design, minimalist
  └─ Usage: Category menu, filters, navigation

Database Field: category.image
URL Format: /uploads/categories/[store-slug]/[category-slug].png
Example: /uploads/categories/glamour-hair/haircuts-styling.png
```

### Gallery Images

```
Specs:
  ├─ Dimensions: 600x400px (3:2 ratio)
  ├─ Format: JPG
  ├─ Quality: 85-90% JPG quality
  ├─ File Size: <100KB
  ├─ Usage: Store gallery, lifestyle shots, testimonials
  └─ Quantity: 3-6 images per store

Database Field: tenant.gallery[] or dedicated gallery collection
URL Format: /uploads/gallery/[store-slug]/[image-number].jpg
Example: /uploads/gallery/glamour-hair/gallery-1.jpg
```

---

## 🔄 Glamour Hair Studio - Current Status

### ✅ Completed

- Logo stored at: `/uploads/logos/glamour-hair.png`
- Database field added to Tenant model: `branding.heroBanner`
- Database field added to Tenant model: `branding.heroBannerAlt`
- Hero banner path configured: `/uploads/heroes/glamour-hair-hero.jpg`

### 🚀 Next Steps

#### 1. Save the Uploaded Image

The luxury salon hero image (pink & gold, professional interior) needs to be:

- **Resized to**: 1920x600px (landscape)
- **Exported as**: JPG at 85% quality
- **Saved to**: `backend/public/uploads/heroes/glamour-hair-hero.jpg`

#### 2. Update Database

Run the seed script to apply database changes:

```bash
cd /home/bala/Desktop/MySpace/Synexon\ Edge\ Apps/RetailX/backend
npm run seed
```

#### 3. Update Admin/Frontend

The storefront will automatically display hero banner if available:

- Homepage detects `branding.heroBanner` in Tenant data
- Falls back to default if not available
- Can be changed in admin dashboard (when image upload feature added)

---

## 📊 Glamour Hair Studio - Image Inventory

### Current Images in Database

```
Store: Glamour Hair Studio
├─ Logo: /uploads/logos/glamour-hair.png
├─ Hero Banner: /uploads/heroes/glamour-hair-hero.jpg ✨ NEW
├─ Hero Alt: /uploads/heroes/glamour-hair-hero-alt.jpg (pending)
│
├─ Categories (5):
│   ├─ Haircuts & Styling: https://images.unsplash.com/photo-1560066984-138dadb4c035
│   ├─ Hair Coloring: https://images.unsplash.com/photo-1522337360788-8b13dee7a37e
│   ├─ Hair Treatments: https://images.unsplash.com/photo-1605497788044-5a32c7078486
│   ├─ Bridal & Events: https://images.unsplash.com/photo-1519741497674-611481863552
│   └─ Hair Products: https://images.unsplash.com/photo-1608248597279-f99d160bfcbc
│
├─ Products/Services (7):
│   ├─ Women's Haircut & Blow Dry: Custom image
│   ├─ Men's Haircut & Styling: Custom image
│   ├─ Full Hair Color: Custom image
│   ├─ Highlights & Balayage: Custom image
│   ├─ Keratin Treatment: Custom image
│   ├─ Bridal Hair: Custom image
│   └─ Hair Product Set: Custom image
│
└─ Gallery (3):
    ├─ gallery-1: Salon interior
    ├─ gallery-2: Team at work
    └─ gallery-3: Customer results
```

---

## 🎯 Implementation Checklist

### For Glamour Hair Studio

```
HERO BANNER SETUP
├─ [✅] Identify luxury salon image
├─ [⏳] Resize to 1920x600px
├─ [⏳] Export as JPG 85% quality
├─ [⏳] Save to /uploads/heroes/glamour-hair-hero.jpg
├─ [✅] Update Tenant model with heroBanner field
├─ [✅] Update seed data with hero path
├─ [⏳] Run seed script to update database
└─ [⏳] Test display on storefront homepage

LOGO VERIFICATION
├─ [⏳] Verify logo exists at /uploads/logos/glamour-hair.png
├─ [⏳] Check dimensions are 200x200px
├─ [⏳] Test display in admin sidebar
└─ [⏳] Test favicon display in browser

CATEGORY IMAGES
├─ [⏳] Generate 5 custom category icons
├─ [⏳] Save to /uploads/categories/glamour-hair/
├─ [⏳] Update category records with image paths
└─ [⏳] Test display in category menu

PRODUCT IMAGES
├─ [⏳] Generate 7 service images
├─ [⏳] Save to /uploads/products/glamour-hair/
├─ [⏳] Update product records with image paths
└─ [⏳] Test display on service detail pages

GALLERY IMAGES
├─ [⏳] Generate 3-4 gallery images
├─ [⏳] Save to /uploads/gallery/glamour-hair/
├─ [⏳] Configure gallery display on storefront
└─ [⏳] Test lightbox/modal functionality
```

---

## 💾 Database Schema Updates

### Tenant Model - branding Object

```javascript
branding: {
  logo: String,              // "/uploads/logos/glamour-hair.png"
  favicon: String,           // Optional favicon image
  heroBanner: String,        // NEW: "/uploads/heroes/glamour-hair-hero.jpg"
  heroBannerAlt: String,     // NEW: "/uploads/heroes/glamour-hair-hero-alt.jpg"
  primaryColor: String,      // "#E91E63"
  secondaryColor: String,    // "#C2185B"
  accentColor: String,       // "#F48FB1"
  fontFamily: String,        // "Playfair Display"
  theme: String,             // "light" | "dark" | "auto"
}
```

### API Response Example

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Glamour Hair Studio",
  "slug": "glamour-hair",
  "branding": {
    "logo": "/uploads/logos/glamour-hair.png",
    "heroBanner": "/uploads/heroes/glamour-hair-hero.jpg",
    "heroBannerAlt": "/uploads/heroes/glamour-hair-hero-alt.jpg",
    "primaryColor": "#E91E63",
    "secondaryColor": "#C2185B",
    "accentColor": "#F48FB1",
    "fontFamily": "Playfair Display",
    "theme": "light"
  },
  "...": "other fields"
}
```

---

## 🌐 Frontend Display

### Homepage Hero Banner

```jsx
// In storefront Home.jsx
const [store, setStore] = useState(null);

useEffect(() => {
  // Fetch store data via API
  fetchStore().then((data) => setStore(data));
}, []);

return <div className="hero-section">{store?.branding?.heroBanner && <img src={store.branding.heroBanner} alt="Store Banner" className="hero-image" />}</div>;
```

### CSS Styling

```css
.hero-section {
  width: 100%;
  height: 600px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-section {
    height: 300px;
  }
}
```

---

## 🚀 Upload Instructions

### Step 1: Prepare the Image

```bash
# Save the luxury salon image as:
# /home/bala/Desktop/MySpace/Synexon\ Edge\ Apps/RetailX/backend/public/uploads/heroes/glamour-hair-hero.jpg

# Recommended image processing:
# Tool: ImageMagick, Photoshop, or online tool
# Resize: 1920x600px
# Quality: 85% JPG
# File Size: Target <200KB
```

### Step 2: Verify Directory Structure

```bash
ls -la /home/bala/Desktop/MySpace/Synexon\ Edge\ Apps/RetailX/backend/public/uploads/
# Should show:
# heroes/
# logos/
# products/
# categories/
# gallery/
```

### Step 3: Run Database Seed

```bash
cd /home/bala/Desktop/MySpace/Synexon\ Edge\ Apps/RetailX/backend
npm run seed
# This will update Glamour Hair Studio record with:
# - branding.heroBanner = "/uploads/heroes/glamour-hair-hero.jpg"
```

### Step 4: Verify in Database

```javascript
// Check MongoDB:
db.tenants.findOne({ slug: "glamour-hair" }).branding;
// Should return:
// {
//   logo: "/uploads/logos/glamour-hair.png",
//   heroBanner: "/uploads/heroes/glamour-hair-hero.jpg",
//   heroBannerAlt: "/uploads/heroes/glamour-hair-hero-alt.jpg",
//   ...
// }
```

### Step 5: Test on Storefront

```
1. Open http://localhost:5002 (storefront)
2. Click "Glamour Hair" store
3. Homepage should display hero banner image
4. Image should be responsive and properly sized
```

---

## 📝 Troubleshooting

### Image Not Displaying

1. **Check file path**: Verify image exists at `/uploads/heroes/glamour-hair-hero.jpg`
2. **Check database**: Verify `branding.heroBanner` contains correct path
3. **Check server logs**: Look for 404 errors or file not found messages
4. **Clear cache**: Refresh browser and clear cache

### Image Quality Issues

1. **Compression**: Ensure JPG quality is 85-90%
2. **Dimensions**: Verify image is exactly 1920x600px
3. **File size**: Keep under 200KB for fast loading
4. **Format**: Ensure it's JPG format (not PNG for hero)

### Responsive Issues

1. **Mobile display**: Image should scale properly
2. **Aspect ratio**: 16:5 ratio maintained on resize
3. **Text overlay**: Ensure overlay text is readable

---

## 📊 Image Statistics - Glamour Hair Studio

```
CURRENT STATUS
├─ Logo: ✅ Configured, pending verification
├─ Hero Banner: ✅ Database field ready, image pending
├─ Hero Alt Banner: ✅ Database field ready, image pending
├─ Category Icons: ⏳ Unsplash URLs configured, custom icons pending
├─ Product Images: ⏳ Pending generation
├─ Gallery Images: ⏳ Pending generation
└─ Team Photos: ⏳ Optional, pending generation

TOTAL IMAGES NEEDED: ~20 images
├─ Essential: 8 (logo, hero, hero-alt, 5 category icons)
├─ High Priority: 7 (product/service images)
└─ Medium Priority: 5+ (gallery, team photos)

STORAGE NEEDED: ~2-3 MB
FILE SIZE BUDGET:
├─ Logos: 50KB max each (3 × 50KB = 150KB)
├─ Hero banners: 200KB max each (2 × 200KB = 400KB)
├─ Product images: 80KB max each (7 × 80KB = 560KB)
├─ Category icons: 50KB max each (5 × 50KB = 250KB)
├─ Gallery images: 100KB max each (4 × 100KB = 400KB)
└─ Total Budget: ~1.8 MB
```

---

**Last Updated:** February 8, 2026
**Status:** Glamour Hair Studio hero banner configuration in progress
