# RetailX Image System - Complete Reference Table

Comprehensive overview of all image types, specifications, locations, and current status across all stores.

---

## 📊 Image Type Specifications

### Quick Reference Matrix

| Image Type        | Dimensions | Format | Quality  | Max Size | Location               | Database Field           |
| ----------------- | ---------- | ------ | -------- | -------- | ---------------------- | ------------------------ |
| **Logo**          | 200×200px  | PNG    | Lossless | 50 KB    | `/uploads/logos/`      | `branding.logo`          |
| **Hero Banner**   | 1920×600px | JPG    | 85-90%   | 200 KB   | `/uploads/heroes/`     | `branding.heroBanner`    |
| **Hero Alt**      | 1920×600px | JPG    | 85-90%   | 200 KB   | `/uploads/heroes/`     | `branding.heroBannerAlt` |
| **Category Icon** | 200×200px  | PNG    | Lossless | 50 KB    | `/uploads/categories/` | `category.image`         |
| **Product Image** | 600×600px  | JPG    | 85-90%   | 80 KB    | `/uploads/products/`   | `product.image`          |
| **Gallery Image** | 600×400px  | JPG    | 85-90%   | 100 KB   | `/uploads/gallery/`    | `tenant.gallery[]`       |
| **Team Photo**    | 300×400px  | JPG    | 85-90%   | 60 KB    | `/uploads/team/`       | `tenant.team[]`          |

---

## 🏪 Store-by-Store Asset Inventory

### FRESHMART GROCERY

| Asset              | Qty    | Status           | Location                                  | Notes                                    |
| ------------------ | ------ | ---------------- | ----------------------------------------- | ---------------------------------------- |
| **Logo**           | 1      | ✅ Configured    | `/uploads/logos/fresh-mart.png`           | 200×200px PNG                            |
| **Hero Banner**    | 1      | ⏳ Pending       | `/uploads/heroes/fresh-mart-hero.jpg`     | Fresh produce display                    |
| **Hero Alt**       | 1      | ⏳ Pending       | `/uploads/heroes/fresh-mart-hero-alt.jpg` | Seasonal/holiday                         |
| **Category Icons** | 5      | ⏳ Pending       | `/uploads/categories/fresh-mart/`         | Fruits, Dairy, Bakery, Pantry, Beverages |
| **Product Images** | 7      | ⏳ Pending       | `/uploads/products/fresh-mart/`           | Organic produce, dairy, bakery items     |
| **Gallery Images** | 3      | ⏳ Pending       | `/uploads/gallery/fresh-mart/`            | Store, delivery, customer                |
| **Team Photos**    | 0      | ✅ N/A           | -                                         | Not applicable for retail store          |
| **TOTAL**          | **18** | ⏳ 0/18 Complete | -                                         | Estimated: 1.5-2.0 MB                    |

**Color Scheme:** Green (#4CAF50), Light Green (#8BC34A), Dark Green (#388E3C)

---

### GLAMOUR HAIR STUDIO

| Asset              | Qty    | Status           | Location                                    | Notes                                              |
| ------------------ | ------ | ---------------- | ------------------------------------------- | -------------------------------------------------- |
| **Logo**           | 1      | ✅ Configured    | `/uploads/logos/glamour-hair.png`           | 200×200px PNG                                      |
| **Hero Banner**    | 1      | 🔄 In Progress   | `/uploads/heroes/glamour-hair-hero.jpg`     | ✨ Luxury salon interior (you provided)            |
| **Hero Alt**       | 1      | ⏳ Pending       | `/uploads/heroes/glamour-hair-hero-alt.jpg` | Seasonal special                                   |
| **Category Icons** | 5      | ⏳ Pending       | `/uploads/categories/glamour-hair/`         | Haircuts, Coloring, Treatments, Bridal, Products   |
| **Product Images** | 7      | ⏳ Pending       | `/uploads/products/glamour-hair/`           | Women's cut, Men's cut, Coloring, Treatments, etc. |
| **Gallery Images** | 4      | ⏳ Pending       | `/uploads/gallery/glamour-hair/`            | Salon interior, Team, Before/After, Ambiance       |
| **Team Photos**    | 3      | ⏳ Pending       | `/uploads/team/glamour-hair/`               | Hair stylists/professionals                        |
| **TOTAL**          | **22** | ⏳ 1/22 Complete | -                                           | Estimated: 2.0-2.5 MB                              |

**Color Scheme:** Pink (#E91E63), Dark Pink (#C2185B), Light Pink (#F48FB1), Gold Accents

---

### TRANQUIL SPA

| Asset              | Qty    | Status           | Location                                    | Notes                                                |
| ------------------ | ------ | ---------------- | ------------------------------------------- | ---------------------------------------------------- |
| **Logo**           | 1      | ✅ Configured    | `/uploads/logos/tranquil-spa.png`           | 200×200px PNG                                        |
| **Hero Banner**    | 1      | ⏳ Pending       | `/uploads/heroes/tranquil-spa-hero.jpg`     | Spa/wellness setting                                 |
| **Hero Alt**       | 1      | ⏳ Pending       | `/uploads/heroes/tranquil-spa-hero-alt.jpg` | Seasonal                                             |
| **Category Icons** | 5      | ⏳ Pending       | `/uploads/categories/tranquil-spa/`         | Relaxation, Therapeutic, Specialty, Couples, Body    |
| **Product Images** | 9      | ⏳ Pending       | `/uploads/products/tranquil-spa/`           | Massage, treatments, therapy services                |
| **Gallery Images** | 4      | ⏳ Pending       | `/uploads/gallery/tranquil-spa/`            | Relaxation area, Treatment room, Amenities, Ambiance |
| **Team Photos**    | 0      | ✅ N/A           | -                                           | Not applicable (therapists anonymous)                |
| **TOTAL**          | **21** | ⏳ 0/21 Complete | -                                           | Estimated: 2.0-2.3 MB                                |

**Color Scheme:** Teal (#00897B), Light Blue (#80DEEA), Sand (#D7CCC8)

---

### HEALTHY FEET CLINIC

| Asset              | Qty    | Status           | Location                                    | Notes                                           |
| ------------------ | ------ | ---------------- | ------------------------------------------- | ----------------------------------------------- |
| **Logo**           | 1      | ✅ Configured    | `/uploads/logos/healthy-feet.png`           | 200×200px PNG                                   |
| **Hero Banner**    | 1      | ⏳ Pending       | `/uploads/heroes/healthy-feet-hero.jpg`     | Clinical/wellness setting                       |
| **Hero Alt**       | 1      | ⏳ Pending       | `/uploads/heroes/healthy-feet-hero-alt.jpg` | Seasonal                                        |
| **Category Icons** | 5      | ⏳ Pending       | `/uploads/categories/healthy-feet/`         | Medical, Nails, Diabetic, Reflexology, Products |
| **Product Images** | 10     | ⏳ Pending       | `/uploads/products/healthy-feet/`           | Medical procedures, treatments, therapies       |
| **Gallery Images** | 4      | ⏳ Pending       | `/uploads/gallery/healthy-feet/`            | Clinic interior, Equipment, Procedure, Results  |
| **Team Photos**    | 3      | ⏳ Pending       | `/uploads/team/healthy-feet/`               | Podiatrists/doctors                             |
| **TOTAL**          | **25** | ⏳ 0/25 Complete | -                                           | Estimated: 2.3-2.8 MB                           |

**Color Scheme:** Blue (#1976D2), Light Blue (#64B5F6), Green (#4CAF50)

---

## 📈 Project Statistics

### Overall Progress

```
TOTAL ASSETS ACROSS ALL STORES: 86 images
├─ Complete: 1 (in progress - Glamour Hair hero)
├─ Pending: 85
└─ Percentage Complete: 1.2%

TOTAL STORAGE ESTIMATED: 8-10 MB
├─ FreshMart: 1.5-2.0 MB
├─ Glamour Hair: 2.0-2.5 MB (after hero banner added)
├─ Tranquil Spa: 2.0-2.3 MB
└─ Healthy Feet: 2.3-2.8 MB

GENERATION TIME ESTIMATE: 40-60 hours
├─ FreshMart: 8-10 hours
├─ Glamour Hair: 10-12 hours
├─ Tranquil Spa: 10-12 hours
└─ Healthy Feet: 12-14 hours

COST ESTIMATE (if using paid AI):
├─ Midjourney: $80-150 (depends on subscription)
├─ DALL-E 3: $100-200 (API credits)
├─ Stable Diffusion: $20-50 (local or cheap API)
└─ Professional Photographer: $500-2000+
```

---

## 🎯 Implementation Priority

### Phase 1: Current (Hero Banners)

**Goal:** Complete main hero banners for all 4 stores
**Time Estimate:** 2-3 hours per store
**Priority:** CRITICAL

| Store        | Status         | Action                          |
| ------------ | -------------- | ------------------------------- |
| FreshMart    | ⏳ Pending     | Generate fresh produce hero     |
| Glamour Hair | 🔄 In Progress | Save provided image, run seed   |
| Tranquil Spa | ⏳ Pending     | Generate spa/wellness hero      |
| Healthy Feet | ⏳ Pending     | Generate clinical/wellness hero |

### Phase 2: Category Icons

**Goal:** 5 icons per store (20 total)
**Time Estimate:** 1-2 hours per store
**Priority:** HIGH

### Phase 3: Product/Service Images

**Goal:** 7-10 images per store (34 total)
**Time Estimate:** 3-4 hours per store
**Priority:** HIGH

### Phase 4: Gallery Images

**Goal:** 3-4 images per store (15 total)
**Time Estimate:** 1-2 hours per store
**Priority:** MEDIUM

### Phase 5: Team Photos

**Goal:** 3 images per service store (6 total)
**Time Estimate:** 1 hour per store
**Priority:** LOW

---

## 💾 Database Integration

### MongoDB Document Structure

```javascript
// Tenant (Store) Document
{
  _id: ObjectId("..."),
  name: "Glamour Hair Studio",
  slug: "glamour-hair",

  // Branding with images
  branding: {
    logo: "/uploads/logos/glamour-hair.png",
    heroBanner: "/uploads/heroes/glamour-hair-hero.jpg",        ← NEW
    heroBannerAlt: "/uploads/heroes/glamour-hair-hero-alt.jpg", ← NEW
    primaryColor: "#E91E63",
    secondaryColor: "#C2185B",
    accentColor: "#F48FB1",
    fontFamily: "Playfair Display"
  },

  // Gallery (if implemented)
  gallery: [
    "/uploads/gallery/glamour-hair/1.jpg",
    "/uploads/gallery/glamour-hair/2.jpg",
    "/uploads/gallery/glamour-hair/3.jpg"
  ],

  // Team (if implemented)
  team: [
    { name: "Maria", title: "Lead Stylist", photo: "/uploads/team/glamour-hair/1.jpg" },
    { name: "Elena", title: "Color Specialist", photo: "/uploads/team/glamour-hair/2.jpg" }
  ]
}

// Category Document
{
  _id: ObjectId("..."),
  tenant: ObjectId("..."),
  name: "Haircuts & Styling",
  slug: "haircuts-styling",
  image: "/uploads/categories/glamour-hair/haircuts-styling.png"  ← Category icon
}

// Product Document
{
  _id: ObjectId("..."),
  tenant: ObjectId("..."),
  name: "Women's Haircut & Blow Dry",
  slug: "womens-haircut-blow-dry",
  image: "/uploads/products/glamour-hair/womens-haircut.jpg",    ← Product image
  gallery: [
    "/uploads/products/glamour-hair/womens-haircut-angle1.jpg",
    "/uploads/products/glamour-hair/womens-haircut-angle2.jpg"
  ]
}
```

---

## 🔄 Frontend Display Paths

### Homepage Hero Banner

```jsx
<img src={store.branding.heroBanner} alt="Store Hero Banner" className="hero-image" />
// Example: src="/uploads/heroes/glamour-hair-hero.jpg"
```

### Category Icon

```jsx
<img src={category.image} alt={category.name} className="category-icon" />
// Example: src="/uploads/categories/glamour-hair/haircuts-styling.png"
```

### Product Image

```jsx
<img src={product.image} alt={product.name} className="product-image" />
// Example: src="/uploads/products/glamour-hair/womens-haircut.jpg"
```

### Gallery Lightbox

```jsx
{
  store.gallery?.map((img, idx) => <img src={img} key={idx} alt={`Gallery ${idx + 1}`} onClick={() => openLightbox(img)} />);
}
// Example: src="/uploads/gallery/glamour-hair/1.jpg"
```

---

## 📋 Implementation Checklist

### Per-Store Template

```
STORE: ___________________

LOGOS & BRANDING
  ☐ Logo created (200×200px PNG)
  ☐ Logo saved to /uploads/logos/[slug].png
  ☐ Colors finalized (primary, secondary, accent)
  ☐ Font family selected
  ☐ Database record created with branding info

HERO BANNERS
  ☐ Hero banner image designed (1920×600px)
  ☐ Hero banner saved to /uploads/heroes/[slug]-hero.jpg
  ☐ Hero alt image created (seasonal)
  ☐ Hero alt saved to /uploads/heroes/[slug]-hero-alt.jpg
  ☐ Seed data updated with hero paths
  ☐ npm run seed executed

CATEGORY ICONS
  ☐ Category 1 icon created & saved
  ☐ Category 2 icon created & saved
  ☐ Category 3 icon created & saved
  ☐ Category 4 icon created & saved
  ☐ Category 5 icon created & saved
  ☐ All icons saved to /uploads/categories/[slug]/
  ☐ Category records updated with image paths

PRODUCT IMAGES (7-10 images)
  ☐ Product 1 image created & saved
  ☐ Product 2 image created & saved
  ☐ Product 3 image created & saved
  ☐ Product 4 image created & saved
  ☐ Product 5 image created & saved
  ☐ Product 6 image created & saved
  ☐ Product 7 image created & saved
  ☐ All saved to /uploads/products/[slug]/
  ☐ Product records updated with image paths

GALLERY IMAGES (3-4 images)
  ☐ Gallery image 1 created & saved
  ☐ Gallery image 2 created & saved
  ☐ Gallery image 3 created & saved
  ☐ Gallery image 4 created & saved (if applicable)
  ☐ All saved to /uploads/gallery/[slug]/
  ☐ Tenant gallery array updated

TEAM PHOTOS (if applicable)
  ☐ Team photo 1 created & saved
  ☐ Team photo 2 created & saved
  ☐ Team photo 3 created & saved
  ☐ All saved to /uploads/team/[slug]/
  ☐ Tenant team array updated

TESTING
  ☐ Storefront loads homepage
  ☐ Hero banner displays correctly
  ☐ Colors applied to UI
  ☐ Categories visible with icons
  ☐ Products display with images
  ☐ Gallery displays lightbox
  ☐ Responsive on mobile
  ☐ Images load quickly

FINAL VERIFICATION
  ☐ All images optimized (<file size limits)
  ☐ No broken image links
  ☐ Alt text added to all images
  ☐ SEO metadata correct
  ☐ Page load time acceptable
  ☐ Cross-browser compatibility tested
```

---

## 🚀 Quick Start Commands

### Check Current Status

```bash
# List all images in uploads directory
find /path/to/backend/public/uploads -type f

# Check specific store
ls -la backend/public/uploads/heroes/ | grep glamour
ls -la backend/public/uploads/logos/ | grep glamour
```

### Add Images

```bash
# Copy image to correct location
cp ~/Downloads/glamour-hair-hero.jpg \
   backend/public/uploads/heroes/glamour-hair-hero.jpg

# Verify it exists
ls -lh backend/public/uploads/heroes/glamour-hair-hero.jpg
```

### Update Database

```bash
# Run seed script
cd backend
npm run seed

# Verify in database
mongosh
use retailx
db.tenants.findOne({slug: "glamour-hair"}).branding
```

### Test Display

```bash
# Start services
./retailx.sh start

# Visit storefront
# http://localhost:5002

# Check browser console for errors
# F12 → Console tab
```

---

## 📞 Troubleshooting Guide

| Issue             | Solution                                                          |
| ----------------- | ----------------------------------------------------------------- |
| Image not showing | Check file exists, verify path in database, clear browser cache   |
| Distorted image   | Verify exact dimensions (1920×600), check aspect ratio            |
| Slow loading      | Reduce file size, optimize JPG quality, check file format         |
| Wrong colors      | Verify color codes in database, check CSS cascade, clear cache    |
| Mobile issues     | Check responsive CSS, verify viewport settings, test on device    |
| Broken links      | Verify file path in database, check file extension (.jpg vs .JPG) |

---

## 📚 Documentation Files

| File                             | Size      | Purpose                             |
| -------------------------------- | --------- | ----------------------------------- |
| `IMAGE_MANAGEMENT_GUIDE.md`      | 13 KB     | Complete image system documentation |
| `GLAMOUR_HAIR_IMPLEMENTATION.md` | 8 KB      | Glamour Hair implementation guide   |
| `IMAGE_IMPLEMENTATION_STATUS.md` | 12 KB     | Status and progress tracking        |
| `HERO_BANNER_SETUP_SUMMARY.md`   | 9 KB      | Quick setup reference               |
| `STORE_SETUP_GUIDE.md`           | 14 KB     | New store creation templates        |
| `IMAGE_SPECIFICATIONS.md`        | This file | Complete reference table            |

---

**Last Updated:** February 8, 2026
**Glamour Hair Status:** Hero banner image processing in progress
**Total Assets Needed:** 86 images across 4 stores
**Current Progress:** 1/86 (1.2%)
