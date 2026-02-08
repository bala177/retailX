# Glamour Hair Studio - Hero Banner Implementation

## 📸 New Image Uploaded: Luxury Hair Salon

**Image Details:**

- **Store:** Glamour Hair Studio
- **Type:** Hero Banner (Main storefront image)
- **Theme:** Luxury salon interior - pink, gold, and white aesthetic
- **Location Shown:** Multiple mirrors with LED lighting, pink chairs, product shelves, crystal chandelier

---

## ✅ What's Been Done

### 1. Database Model Updated

**File:** `backend/src/models/Tenant.js`

Added two new fields to the `branding` object:

```javascript
heroBanner: {
  type: String,
  default: null,
  description: "Main hero/banner image for store homepage (1920x600px recommended)"
},
heroBannerAlt: {
  type: String,
  default: null,
  description: "Alternative hero banner for seasonal campaigns"
}
```

### 2. Seed Data Updated

**File:** `backend/src/seeds/index.js`

Updated Glamour Hair Studio configuration:

```javascript
branding: {
  logo: "/uploads/logos/glamour-hair.png",
  heroBanner: "/uploads/heroes/glamour-hair-hero.jpg",        // ← NEW
  heroBannerAlt: "/uploads/heroes/glamour-hair-hero-alt.jpg", // ← NEW
  primaryColor: "#E91E63",
  secondaryColor: "#C2185B",
  accentColor: "#F48FB1",
  fontFamily: "Playfair Display",
}
```

### 3. Directory Structure Created

```
backend/public/uploads/
├── heroes/              ← For hero banners
│   └── glamour-hair-hero.jpg (ready for image)
├── logos/               ← For store logos
└── ...other directories
```

### 4. Documentation Created

- `IMAGE_MANAGEMENT_GUIDE.md` - Complete image management system
- `STORE_SETUP_GUIDE.md` - Already created (comprehensive checklist)

---

## 🚀 Next Steps to Complete

### Step 1: Process & Save the Image

The luxury salon image you provided needs to be:

1. **Resize** from original to **1920x600px** (landscape)
   - Tools: ImageMagick, Photoshop, or free online resizer
   - Keep aspect ratio and high quality
2. **Export as JPG** with **85-90% quality**
   - Reduces file size while maintaining visual quality
   - Target file size: <200KB
3. **Save to:**
   ```
   /home/bala/Desktop/MySpace/Synexon Edge Apps/RetailX/backend/public/uploads/heroes/glamour-hair-hero.jpg
   ```

### Step 2: Run Database Seed

```bash
cd "/home/bala/Desktop/MySpace/Synexon Edge Apps/RetailX/backend"
npm run seed
```

This will:

- Connect to MongoDB
- Update Glamour Hair Studio record
- Set `branding.heroBanner` to `/uploads/heroes/glamour-hair-hero.jpg`

### Step 3: Verify & Test

```bash
# 1. Check file exists
ls -lh backend/public/uploads/heroes/glamour-hair-hero.jpg

# 2. Restart services
./retailx.sh start

# 3. Test in browser
# Go to: http://localhost:5002 (Storefront)
# Select: Glamour Hair Studio
# Should see: Hero banner at top of homepage
```

---

## 📊 Current Image Setup

### Glamour Hair Studio - Complete Asset Map

| Asset              | Status         | Path                                        | Notes                                                             |
| ------------------ | -------------- | ------------------------------------------- | ----------------------------------------------------------------- |
| **Logo**           | ✅ Configured  | `/uploads/logos/glamour-hair.png`           | 200x200px PNG                                                     |
| **Hero Banner**    | 🔄 In Progress | `/uploads/heroes/glamour-hair-hero.jpg`     | 1920x600px JPG (ready for image)                                  |
| **Hero Alt**       | ⏳ Pending     | `/uploads/heroes/glamour-hair-hero-alt.jpg` | For seasonal campaigns                                            |
| **Category Icons** | ⏳ Pending     | `/uploads/categories/glamour-hair/*.png`    | 5 icons needed (Haircuts, Coloring, Treatments, Bridal, Products) |
| **Product Images** | ⏳ Pending     | `/uploads/products/glamour-hair/*.jpg`      | 7 service images needed                                           |
| **Gallery Images** | ⏳ Pending     | `/uploads/gallery/glamour-hair/*.jpg`       | 3-4 lifestyle shots                                               |

---

## 🎨 Visual Display

### How It Will Look on Storefront

**Before:** (Default gray placeholder)

```
┌─────────────────────────────────────┐
│                                     │
│   [Glamour Hair Studio storefront]  │
│   (No banner image, gray default)   │
│                                     │
└─────────────────────────────────────┘
```

**After:** (With hero banner)

```
┌────────────────────────────────────────────┐
│  ╔══════════════════════════════════════╗  │
│  ║                                      ║  │
│  ║  🏢 Luxury Salon Interior            ║  │
│  ║  Pink & Gold, Mirrors, LED Lights   ║  │
│  ║  Professional Shop Layout           ║  │
│  ║                                      ║  │
│  ╚══════════════════════════════════════╝  │
│                                            │
│  [Services Grid Below Banner]              │
└────────────────────────────────────────────┘
```

---

## 🔗 API Integration

### Store Data API Response

```
GET /api/v1/stores/glamour-hair

Response:
{
  "_id": "...",
  "name": "Glamour Hair Studio",
  "slug": "glamour-hair",
  "branding": {
    "logo": "/uploads/logos/glamour-hair.png",
    "heroBanner": "/uploads/heroes/glamour-hair-hero.jpg",    ← Used for homepage
    "heroBannerAlt": "/uploads/heroes/glamour-hair-hero-alt.jpg",
    "primaryColor": "#E91E63",
    "secondaryColor": "#C2185B",
    "accentColor": "#F48FB1",
    "fontFamily": "Playfair Display"
  },
  "...": "other store details"
}
```

### Storefront will automatically:

1. Fetch store data on load
2. Display `branding.heroBanner` image on homepage
3. Use `primaryColor` and `accentColor` for styling
4. Fall back to default if image unavailable

---

## 💡 Design Notes

### Pink & Gold Color Scheme

- **Primary:** #E91E63 (Vibrant Pink) - Main accent
- **Secondary:** #C2185B (Darker Pink) - Buttons, links
- **Accent:** #F48FB1 (Light Pink) - Highlights
- **Complements:** Gold accents visible in luxury salon image

### Hero Banner Best Practices

- ✅ **Full width** on desktop
- ✅ **Responsive scaling** on mobile
- ✅ **Safe text area**: Center 60% for overlays
- ✅ **Professional quality**: High-res, well-lit
- ✅ **Brand consistency**: Colors match salon branding

---

## 📋 Complete Checklist

```
Glamour Hair Studio - Full Setup

BRANDING & IMAGES
  ✅ Logo field configured in database
  ✅ Hero banner field added to model
  ✅ Hero alt field added to model
  ✅ Primary, secondary, accent colors set
  ✅ Font family configured (Playfair Display)

CURRENT IMAGE (Luxury Salon)
  ⏳ Resize to 1920x600px
  ⏳ Export as JPG 85% quality
  ⏳ Save to /uploads/heroes/glamour-hair-hero.jpg
  ⏳ Run seed script to update DB
  ⏳ Test display on homepage

ADDITIONAL IMAGES NEEDED
  ⏳ 5 Category icons (200x200px PNG)
  ⏳ 7 Product/service images (600x600px JPG)
  ⏳ 4 Gallery images (600x400px JPG)
  ⏳ Optional: 3 Team photos (300x400px JPG)

TESTING
  ⏳ Verify hero displays on homepage
  ⏳ Test responsive design (desktop/mobile)
  ⏳ Check image loads from API
  ⏳ Verify color scheme consistency
```

---

## 📞 Quick Reference

**Files Modified:**

- `backend/src/models/Tenant.js` - Added hero banner fields
- `backend/src/seeds/index.js` - Updated Glamour Hair config
- `backend/public/uploads/` - Directory structure created

**Files Created:**

- `IMAGE_MANAGEMENT_GUIDE.md` - Full image system documentation
- `GLAMOUR_HAIR_IMPLEMENTATION.md` - This file

**Required Action:**

1. Process uploaded image (resize to 1920x600px)
2. Save to `backend/public/uploads/heroes/glamour-hair-hero.jpg`
3. Run `npm run seed` from backend directory
4. Test at http://localhost:5002

---

**Status:** Ready for image upload and database update
**Created:** February 8, 2026
