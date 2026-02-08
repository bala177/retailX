# RetailX Store Setup Checklist & Asset Generation Guide

Complete checklist for adding a new store to RetailX with standardized requirements and AI generation prompts.

---

## 📋 Quick Overview Table

| Category        | Item             | Specifications    | Status | Notes                            |
| --------------- | ---------------- | ----------------- | ------ | -------------------------------- |
| **Store Setup** | Store Name       | Text              | ☐      | e.g., "FreshMart Grocery"        |
|                 | Store Slug       | URL-friendly      | ☐      | e.g., "fresh-mart"               |
|                 | Description      | 50-150 chars      | ☐      | Short tagline                    |
|                 | Industry         | Category          | ☐      | grocery, fashion, wellness, etc. |
|                 | Business Type    | products/services | ☐      | Determines cart vs booking       |
| **Branding**    | Primary Color    | Hex code          | ☐      | e.g., #4CAF50                    |
|                 | Secondary Color  | Hex code          | ☐      | e.g., #388E3C                    |
|                 | Accent Color     | Hex code          | ☐      | e.g., #8BC34A                    |
|                 | Logo             | SVG/PNG 200x200px | ☐      | Transparent background           |
| **Images**      | Hero Banner      | 1920x600px JPG    | ☐      | Main storefront image            |
|                 | Hero Alt Banner  | 1920x600px JPG    | ☐      | For seasonal campaigns           |
|                 | Category Icons   | PNG 200x200px     | ☐      | Per category (3-5)               |
|                 | Product Images   | 600x600px JPG     | ☐      | 6-10 per store                   |
|                 | Gallery Images   | 600x400px JPG     | ☐      | 3-4 lifestyle shots              |
|                 | Team Photos      | 300x400px JPG     | ☐      | 2-3 staff (if applicable)        |
| **Contact**     | Email            | Standard email    | ☐      | contact@store.com                |
|                 | Phone            | +1 (XXX) XXX-XXXX | ☐      | Include country code             |
|                 | Address          | Full address      | ☐      | Street, City, State, ZIP         |
|                 | Website          | URL (optional)    | ☐      | https://example.com              |
| **Settings**    | Currency         | USD/EUR/GBP       | ☐      | Default: USD                     |
|                 | Tax Rate         | Percentage        | ☐      | e.g., 8.875%                     |
|                 | Shipping Enabled | Yes/No            | ☐      | For product stores               |
|                 | Guest Checkout   | Yes/No            | ☐      | Allow anonymous purchases        |
|                 | Product Variants | Yes/No            | ☐      | Size, color, etc.                |
| **Pages**       | About Us         | 200-500 words     | ☐      | Store story & mission            |
|                 | Contact Form     | Functional        | ☐      | Email notifications setup        |
|                 | Gallery/Showcase | 4-6 images        | ☐      | Highlight store offerings        |
|                 | Team Section     | Photos + Bios     | ☐      | Staff introductions              |

---

## 🏪 Store Template Form

```
STORE INFORMATION
├─ Store Name: ___________________________________
├─ Store Slug: ___________________________________
├─ Description: ___________________________________
├─ Industry: ☐ Grocery ☐ Fashion ☐ Salon ☐ Spa ☐ Healthcare ☐ Other: _____
├─ Business Type: ☐ Products ☐ Services ☐ Hybrid
│
BRANDING COLORS
├─ Primary: #________  (Dark/Main color)
├─ Secondary: #______  (Lighter shade)
├─ Accent: #_________  (Highlight color)
│
CONTACT INFORMATION
├─ Email: ___________________________________
├─ Phone: ___________________________________
├─ Address: ___________________________________
├─ City: ________________ State: ____ ZIP: _____
│
BUSINESS SETTINGS
├─ Currency: ☐ USD ☐ EUR ☐ GBP ☐ Other: _____
├─ Tax Rate: __________%
├─ Shipping Enabled: ☐ Yes ☐ No
├─ Guest Checkout: ☐ Yes ☐ No
├─ Booking System: ☐ Yes ☐ No (for services)
│
CATEGORIES (List 4-5 main categories)
├─ Category 1: ___________________________________
├─ Category 2: ___________________________________
├─ Category 3: ___________________________________
├─ Category 4: ___________________________________
└─ Category 5: ___________________________________
```

---

## 🎨 Asset Generation Prompts by Store Type

### TEMPLATE: RETAIL STORE (Fashion, Electronics, etc.)

#### Logo

**Specifications:** 200x200px, PNG, transparent background, high contrast

```
A modern, professional logo for [STORE_NAME] featuring [BRAND_CONCEPT].
Style: flat design, minimalist, [COLORS]. Should work well as a small icon.
No text/lettering, icon only. Transparent background.
High quality, scalable vector style.
```

**Example for Fashion Store:**

```
A modern, professional logo for "Urban Fashion Store" featuring a stylized
clothing hanger or shirt silhouette. Style: flat design, minimalist, pink
and white. Should work well as a small icon. No text/lettering, icon only.
Transparent background. High quality, scalable vector style.
```

#### Hero Banner

**Specifications:** 1920x600px, JPG 90% quality

```
A vibrant, professional hero banner for an online [STORE_TYPE] store.
Center/featured: [MAIN_PRODUCT_CATEGORY] products displayed attractively.
Colors: [PRIMARY_COLOR], [SECONDARY_COLOR], white backgrounds.
Atmosphere: [MOOD - e.g., "luxury", "energetic", "welcoming"].
Professional product photography, bright lighting, clean composition.
High resolution, retail-quality image. Horizontal orientation.
Include subtle text overlay space at center (30% width).
```

**Example for Fashion Store:**

```
A vibrant, professional hero banner for an online fashion retail store.
Center/featured: beautiful women's clothing and accessories displayed attractively.
Colors: pink (#E91E63), white, and neutral backgrounds.
Atmosphere: luxurious, modern, energetic.
Professional fashion photography, bright studio lighting, clean composition.
High resolution, retail-quality image. Horizontal orientation.
Include subtle text overlay space at center (30% width).
```

#### Product Images (General Template)

**Specifications:** 600x600px, JPG 90% quality, white/neutral background

```
Professional product photography for e-commerce.
Product: [PRODUCT_NAME] by [STORE_NAME]
Details: [SPECIFIC_DESCRIPTION]
Background: White or light neutral
Lighting: Professional studio lighting, shadowless
Angle: [FRONT/SIDE/ANGLED view]
Quality: High detail, sharp focus, realistic colors
Style: Modern e-commerce, product-centric photography
```

**Example - Fashion Store Product:**

```
Professional product photography for e-commerce.
Product: Classic Cotton T-Shirt in Navy Blue
Details: Premium organic cotton, relaxed fit, visible seams and fabric texture
Background: Pure white, shadowless
Lighting: Professional studio lighting, bright and even
Angle: Front view with slight 45-degree angle
Quality: High detail, sharp focus, true color representation
Style: Modern e-commerce, product-centric photography
```

#### Category Icons

**Specifications:** 200x200px, PNG, transparent background

```
A flat design icon representing [CATEGORY_NAME] for retail store.
Style: minimalist, modern, flat design, no gradients
Colors: [PRIMARY_COLOR] and white
Single icon, no background text
Transparent background, high quality
Suitable for e-commerce interface use
```

---

### TEMPLATE: SERVICE BUSINESS (Hair Salon, Spa, Clinic, etc.)

#### Logo

**Specifications:** 200x200px, PNG, transparent background

```
A professional, elegant logo for [SERVICE_BUSINESS_NAME].
Concept: [SERVICE_SYMBOL - e.g., "scissors", "water ripples", "healing hands"]
Style: flat design, luxury aesthetic, [COLORS]
Icon only, no text. Transparent background.
Suitable for small icon and professional branding.
High quality vector style.
```

**Example for Hair Salon:**

```
A professional, elegant logo for Glamour Hair Studio.
Concept: stylized scissors with flowing hair strands
Style: flat design, luxury aesthetic, pink (#E91E63) and gold
Icon only, no text. Transparent background.
Suitable for small icon and professional branding.
High quality vector style.
```

#### Hero Banner

**Specifications:** 1920x600px, JPG 90% quality

```
A professional, luxurious hero banner for [SERVICE_NAME].
Foreground: [MAIN_SERVICE_IMAGE - e.g., "person receiving hair treatment"]
Setting: upscale [SERVICE_LOCATION - e.g., "modern salon"]
Colors: [PRIMARY_COLOR] accents with warm, inviting tones
Atmosphere: professional, [MOOD - e.g., "calming", "luxury", "joyful"]
Lighting: warm, professional, creates sense of comfort
High quality professional photography
Include subtle text overlay space.
Horizontal orientation.
```

**Example for Spa:**

```
A professional, luxurious hero banner for Tranquil Touch Spa.
Foreground: person receiving a relaxing massage
Setting: upscale modern spa with calming elements
Colors: teal (#00897B) accents with warm, inviting earth tones
Atmosphere: professional, serene, meditative
Lighting: warm, soft, dim professional spa lighting
High quality professional photography
Include subtle text overlay space at center.
Horizontal orientation.
```

#### Service Images

**Specifications:** 600x600px, JPG 90% quality

```
Professional photograph of [SERVICE_NAME] in action.
Setting: professional [SERVICE_LOCATION - e.g., "salon", "spa", "clinic"]
Focus: therapist/professional performing service on client
Client: looks relaxed, satisfied, comfortable
Details: professional equipment, clean environment, good hygiene
Lighting: professional, warm, [MOOD-APPROPRIATE]
Quality: high detail, professional service photography
Atmosphere: professional yet welcoming
```

**Example for Hair Salon:**

```
Professional photograph of Women's Haircut & Blow Dry service in action.
Setting: professional modern hair salon
Focus: professional stylist performing blow-dry on client's hair
Client: looks satisfied, hair styled beautifully and glossy
Details: professional styling tools, mirrors, well-lit salon
Lighting: professional, warm, salon lighting
Quality: high detail, professional beauty photography
Atmosphere: professional, luxurious, inspiring
```

---

### TEMPLATE: GROCERY/FOOD RETAIL

#### Hero Banner

**Specifications:** 1920x600px, JPG 90% quality

```
A vibrant, fresh hero banner for online grocery store.
Foreground: colorful fresh produce (vegetables, fruits) prominently displayed
Layout: natural arrangement, abundant, appealing
Colors: greens, reds, oranges, yellows - natural food colors
Atmosphere: fresh, healthy, trustworthy
Lighting: natural daylight, warm, inviting
Setting: modern grocery display or farmer's market
Quality: professional food photography, high resolution
Include text overlay space.
```

#### Product Images

**Specifications:** 600x600px, JPG 90% quality

```
Professional food photography for e-commerce.
Product: [FOOD_ITEM_NAME]
Presentation: [HOW_DISPLAYED - e.g., "in bowl", "on cutting board", "in package"]
Background: [WHITE/COLORED] background
Lighting: professional studio lighting, makes food look fresh and appealing
Angle: [TOP/SIDE/ANGLED]
Quality: high detail showing texture, freshness, appetizing
Style: professional food photography, commercial retail quality
```

---

## 📸 Complete Asset Checklist by Store Type

### GROCERY STORE ASSETS

```
SETUP (1-2 hours):
  ☐ Store info: Name, slug, description
  ☐ Colors: Primary (green), Secondary, Accent
  ☐ Contact info: Email, phone, address
  ☐ 4-5 categories: Fruits, Dairy, Bakery, Pantry, Beverages

BRANDING (2-3 hours):
  ☐ Logo (1): Grocery icon
  ☐ Hero Banner (1): Fresh produce display
  ☐ Category Icons (5): One per category

CONTENT (4-5 hours):
  ☐ Product Images (7): Mix of products
  ☐ Gallery Images (3): Store, delivery, customer
  ☐ Team Photos (0): Optional

TOTAL ASSETS: 18 images + metadata
GENERATION TIME: 2-3 hours with AI tools
COST: $5-15 (if using paid AI services)
```

### HAIR SALON ASSETS

```
SETUP (1-2 hours):
  ☐ Store info: Name, slug, description
  ☐ Colors: Primary (pink), Secondary, Accent
  ☐ Contact info: Email, phone, address
  ☐ 5 categories: Haircuts, Coloring, Treatments, Bridal, Products

BRANDING (2-3 hours):
  ☐ Logo (1): Scissors/hair icon
  ☐ Hero Banner (1): Woman with styled hair
  ☐ Category Icons (5): One per category

CONTENT (6-8 hours):
  ☐ Product/Service Images (7): Haircuts, coloring, etc.
  ☐ Gallery Images (4): Salon interior, process, results, team
  ☐ Team Photos (3): Stylists with headshots

TOTAL ASSETS: 23 images + metadata
GENERATION TIME: 3-4 hours with AI tools
COST: $8-20 (if using paid AI services)
```

### SPA/WELLNESS ASSETS

```
SETUP (1-2 hours):
  ☐ Store info: Name, slug, description
  ☐ Colors: Primary (teal), Secondary, Accent
  ☐ Contact info: Email, phone, address
  ☐ 5 categories: Relaxation, Therapeutic, Specialty, Couples, Body Treatments

BRANDING (2-3 hours):
  ☐ Logo (1): Water/wellness icon
  ☐ Hero Banner (1): Spa setting with massage
  ☐ Category Icons (5): One per category

CONTENT (6-8 hours):
  ☐ Service Images (9): Various massage/treatment types
  ☐ Gallery Images (4): Relaxation area, treatment room, amenities, ambiance
  ☐ Team Photos (0): Optional

TOTAL ASSETS: 22 images + metadata
GENERATION TIME: 3-4 hours with AI tools
COST: $8-20 (if using paid AI services)
```

### PODIATRY CLINIC ASSETS

```
SETUP (1-2 hours):
  ☐ Store info: Name, slug, description
  ☐ Colors: Primary (blue), Secondary, Accent
  ☐ Contact info: Email, phone, address
  ☐ 5 categories: Medical, Nails, Diabetic, Reflexology, Products

BRANDING (2-3 hours):
  ☐ Logo (1): Foot/medical icon
  ☐ Hero Banner (1): Professional clinical setting
  ☐ Category Icons (5): One per category

CONTENT (6-8 hours):
  ☐ Service Images (10): Medical procedures, treatments
  ☐ Gallery Images (4): Clinic interior, equipment, procedure, patient result
  ☐ Team Photos (3): Podiatrists/doctors

TOTAL ASSETS: 25 images + metadata
GENERATION TIME: 4-5 hours with AI tools
COST: $10-25 (if using paid AI services)
```

---

## 🛠️ Asset Generation Workflow

### Step 1: Prepare Information (15-30 min)

- [ ] Fill out Store Template Form
- [ ] Choose colors using color picker
- [ ] Write store description & taglines
- [ ] List all categories
- [ ] Prepare contact information

### Step 2: Generate Logo (15-20 min)

- [ ] Use logo prompt template
- [ ] Generate 3-5 variations
- [ ] Pick best option
- [ ] Export as PNG transparent

### Step 3: Generate Hero Banner (20-30 min)

- [ ] Use hero banner prompt
- [ ] Generate 3-5 variations
- [ ] Pick best composition
- [ ] Ensure 1920x600px
- [ ] Save as JPG 90%

### Step 4: Generate Category Icons (30-45 min)

- [ ] Create prompt for each category
- [ ] Generate 2-3 per category
- [ ] Select best match
- [ ] Export as PNG transparent 200x200px
- [ ] Ensure consistent style

### Step 5: Generate Product/Service Images (45-90 min)

- [ ] Create specific prompt per product
- [ ] Generate 1-2 variations per product
- [ ] Review for consistency
- [ ] Ensure 600x600px
- [ ] Save as JPG 90%

### Step 6: Generate Gallery Images (30-45 min)

- [ ] Create prompts for 3-4 lifestyle shots
- [ ] Generate variations
- [ ] Select best images
- [ ] Ensure 600x400px
- [ ] Save as JPG 90%

### Step 7: Team Photos (20-30 min, if applicable)

- [ ] Create professional headshot prompts
- [ ] Generate staff members
- [ ] Ensure diversity and professionalism
- [ ] Ensure 300x400px
- [ ] Save as JPG 90%

---

## 📝 Asset Management Template

```
STORE: ___________________________
SLUG: ___________________________
GENERATION DATE: ___________________________

LOGO
├─ Filename: retailx-[SLUG]-logo.svg
├─ Size: 200x200px
├─ Status: ☐ Generated ☐ Approved ☐ Uploaded

HERO BANNER
├─ Filename: [SLUG]-hero-banner.jpg
├─ Size: 1920x600px
├─ Status: ☐ Generated ☐ Approved ☐ Uploaded
├─ Alt Hero: [SLUG]-hero-alt.jpg (Optional)
└─ Status: ☐ Generated ☐ Approved ☐ Uploaded

CATEGORY ICONS (List each)
├─ Category 1: [SLUG]-category-1.png (Status: ☐)
├─ Category 2: [SLUG]-category-2.png (Status: ☐)
├─ Category 3: [SLUG]-category-3.png (Status: ☐)
├─ Category 4: [SLUG]-category-4.png (Status: ☐)
└─ Category 5: [SLUG]-category-5.png (Status: ☐)

PRODUCT/SERVICE IMAGES
├─ [SLUG]-product-1.jpg (Status: ☐)
├─ [SLUG]-product-2.jpg (Status: ☐)
├─ [SLUG]-product-3.jpg (Status: ☐)
├─ [SLUG]-product-4.jpg (Status: ☐)
├─ [SLUG]-product-5.jpg (Status: ☐)
├─ [SLUG]-product-6.jpg (Status: ☐)
├─ [SLUG]-product-7.jpg (Status: ☐)
└─ [Additional products as needed]

GALLERY IMAGES
├─ [SLUG]-gallery-1.jpg (Status: ☐)
├─ [SLUG]-gallery-2.jpg (Status: ☐)
├─ [SLUG]-gallery-3.jpg (Status: ☐)
└─ [SLUG]-gallery-4.jpg (Status: ☐)

TEAM PHOTOS (If applicable)
├─ [SLUG]-team-1.jpg (Status: ☐)
├─ [SLUG]-team-2.jpg (Status: ☐)
└─ [SLUG]-team-3.jpg (Status: ☐)

TOTAL ASSETS: _____
GENERATION TIME: _____ hours
UPLOAD DATE: _____
STORE LIVE DATE: _____
```

---

## 🚀 AI Image Generation Tips

### Best Platforms for Bulk Generation

- **Midjourney**: Most consistent style, batch generation
- **DALL-E 3**: Excellent for specific details and variety
- **Stable Diffusion**: Cost-effective for large batches
- **Adobe Firefly**: Integration with Adobe tools

### Optimization Tips

1. **Batch Generation**: Generate 5-10 variations at once
2. **Style Consistency**: Use same adjectives across store (e.g., "professional", "luxurious")
3. **Color Consistency**: Mention hex codes in prompts
4. **Aspect Ratios**: Specify exact dimensions
5. **Negative Prompts**: Exclude unwanted elements
6. **Iteration**: Refine prompts based on results

### Cost Estimates

- **Small Store** (8-12 images): $5-10
- **Medium Store** (15-20 images): $10-20
- **Large Store** (25-35 images): $20-40
- **Bulk/Multiple Stores**: $50-100 per store

---

## ✅ Final QA Checklist

Before launching store, verify:

- [ ] All images generated and saved
- [ ] All images correct dimensions
- [ ] All images appropriate quality (JPG 90%)
- [ ] Logo works at small sizes
- [ ] Hero banner has good text overlay space
- [ ] Product images consistent lighting/style
- [ ] Store information complete and accurate
- [ ] Contact form functional
- [ ] Categories properly configured
- [ ] Colors properly set in database
- [ ] All images uploaded to CDN/server
- [ ] Store preview tested
- [ ] Admin can manage products
- [ ] Customers can browse store

---

**Last Updated:** February 8, 2026
