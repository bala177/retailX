#!/usr/bin/env python3
"""
RetailX — Store Image Generator
Generates professional-looking placeholder images for any store.

Usage:
  python3 generate-images.py <store-slug>
  python3 generate-images.py sweet-delights
  python3 generate-images.py --all     # Generate for all stores

Generates: logo, hero banner, category images, product images
"""

import sys
import os
import json
import math
import random
import hashlib
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
except ImportError:
    print("❌ Pillow is required. Install: pip3 install Pillow")
    sys.exit(1)

# ─── Configuration ────────────────────────────────────────────────
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
UPLOADS_DIR = BACKEND_DIR / "uploads"

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"

# Image dimensions
SIZES = {
    "logo": (400, 400),
    "hero": (1920, 700),
    "category": (600, 400),
    "product": (800, 800),
}

# ─── Industry Color Palettes ─────────────────────────────────────
INDUSTRY_PALETTES = {
    "bakery": {
        "colors": ["#FF6B9D", "#C44569", "#FFC75F", "#FFE8D6", "#B8860B"],
        "bg_gradient": [("#FFF5F7", "#FFE0E6"), ("#FFF8F0", "#FFE8D6")],
        "emoji_set": ["🎂", "🧁", "🍰", "🥐", "🍪", "🎀", "🍓", "🫐"],
        "shapes": "circles",
    },
    "food": {
        "colors": ["#FF6B9D", "#C44569", "#FFC75F", "#FFE8D6", "#B8860B"],
        "bg_gradient": [("#FFF5F7", "#FFE0E6"), ("#FFF8F0", "#FFE8D6")],
        "emoji_set": ["🎂", "🧁", "🍰", "🥐", "🍪", "🎀", "🍓", "🫐"],
        "shapes": "circles",
    },
    "grocery": {
        "colors": ["#27ae60", "#2ecc71", "#f39c12", "#e74c3c", "#8e44ad"],
        "bg_gradient": [("#f0fff4", "#c6f6d5"), ("#fffff0", "#fefcbf")],
        "emoji_set": ["🥦", "🍎", "🥕", "🍊", "🫑", "🥬", "🍋", "🌽"],
        "shapes": "leaves",
    },
    "wellness": {
        "colors": ["#6c5ce7", "#a29bfe", "#00b894", "#81ecec", "#ffeaa7"],
        "bg_gradient": [("#f3e8ff", "#e9d5ff"), ("#ecfdf5", "#d1fae5")],
        "emoji_set": ["🧘", "💆", "🌸", "✨", "🕯️", "💎", "🌿", "💫"],
        "shapes": "waves",
    },
    "fashion": {
        "colors": ["#2d3436", "#636e72", "#fd79a8", "#e17055", "#fab1a0"],
        "bg_gradient": [("#fdf2f8", "#fce7f3"), ("#f5f3ff", "#ede9fe")],
        "emoji_set": ["👗", "👠", "👜", "💄", "🕶️", "✨", "💍", "🎀"],
        "shapes": "diamonds",
    },
    "electronics": {
        "colors": ["#0984e3", "#00cec9", "#6c5ce7", "#fdcb6e", "#00b894"],
        "bg_gradient": [("#eff6ff", "#dbeafe"), ("#f0f9ff", "#e0f2fe")],
        "emoji_set": ["📱", "💻", "🎧", "⌚", "📷", "🖥️", "🔋", "⚡"],
        "shapes": "rectangles",
    },
    "healthcare": {
        "colors": ["#00b894", "#55a8b5", "#0984e3", "#74b9ff", "#dfe6e9"],
        "bg_gradient": [("#ecfdf5", "#d1fae5"), ("#f0f9ff", "#e0f2fe")],
        "emoji_set": ["💊", "🩺", "❤️", "🏥", "🧬", "💉", "🌡️", "⚕️"],
        "shapes": "crosses",
    },
}

DEFAULT_PALETTE = INDUSTRY_PALETTES["grocery"]


def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


def rgb_to_hex(r, g, b):
    return f"#{r:02x}{g:02x}{b:02x}"


def lighten(color, factor=0.3):
    """Lighten a color."""
    r, g, b = hex_to_rgb(color) if isinstance(color, str) else color
    return (
        int(r + (255 - r) * factor),
        int(g + (255 - g) * factor),
        int(b + (255 - b) * factor),
    )


def darken(color, factor=0.3):
    """Darken a color."""
    r, g, b = hex_to_rgb(color) if isinstance(color, str) else color
    return (int(r * (1 - factor)), int(g * (1 - factor)), int(b * (1 - factor)))


def seed_from_string(s):
    """Generate a deterministic seed from a string."""
    return int(hashlib.md5(s.encode()).hexdigest()[:8], 16)


def draw_gradient(draw, width, height, color1, color2, direction="vertical"):
    """Draw a smooth gradient."""
    c1 = hex_to_rgb(color1) if isinstance(color1, str) else color1
    c2 = hex_to_rgb(color2) if isinstance(color2, str) else color2
    for i in range(height if direction == "vertical" else width):
        ratio = i / (height if direction == "vertical" else width)
        r = int(c1[0] + (c2[0] - c1[0]) * ratio)
        g = int(c1[1] + (c2[1] - c1[1]) * ratio)
        b = int(c1[2] + (c2[2] - c1[2]) * ratio)
        if direction == "vertical":
            draw.line([(0, i), (width, i)], fill=(r, g, b))
        else:
            draw.line([(i, 0), (i, height)], fill=(r, g, b))


def draw_decorative_circles(draw, width, height, colors, count=12, seed=0):
    """Draw soft decorative circles."""
    rng = random.Random(seed)
    for _ in range(count):
        x = rng.randint(-50, width + 50)
        y = rng.randint(-50, height + 50)
        radius = rng.randint(20, 120)
        color = hex_to_rgb(rng.choice(colors))
        alpha_color = color + (rng.randint(20, 60),)
        overlay = Image.new("RGBA", (radius * 2, radius * 2), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        od.ellipse([0, 0, radius * 2, radius * 2], fill=alpha_color)
        overlay = overlay.filter(ImageFilter.GaussianBlur(radius=radius // 3))
        # Paste at position
        box = (x - radius, y - radius)
        try:
            base = Image.new("RGBA", (width, height), (0, 0, 0, 0))
            base.paste(overlay, box)
            # Return the overlay to be composited
        except:
            pass


def draw_pattern(img, pattern_type, colors, seed=0):
    """Draw decorative patterns on an RGBA image."""
    draw = ImageDraw.Draw(img, "RGBA")
    w, h = img.size
    rng = random.Random(seed)

    if pattern_type == "circles":
        for _ in range(15):
            x, y = rng.randint(0, w), rng.randint(0, h)
            r = rng.randint(10, min(w, h) // 4)
            c = hex_to_rgb(rng.choice(colors))
            draw.ellipse([x - r, y - r, x + r, y + r], fill=c + (30,))

    elif pattern_type == "waves":
        for i in range(0, h, 30):
            points = []
            for x in range(0, w + 20, 20):
                y_off = math.sin((x + i * 3) / 60) * 20 + i
                points.append((x, y_off))
            if len(points) >= 2:
                c = hex_to_rgb(rng.choice(colors))
                draw.line(points, fill=c + (25,), width=2)

    elif pattern_type == "diamonds":
        for _ in range(10):
            cx, cy = rng.randint(0, w), rng.randint(0, h)
            s = rng.randint(20, 60)
            c = hex_to_rgb(rng.choice(colors))
            draw.polygon(
                [(cx, cy - s), (cx + s, cy), (cx, cy + s), (cx - s, cy)],
                fill=c + (25,),
            )

    elif pattern_type == "leaves":
        for _ in range(12):
            cx, cy = rng.randint(0, w), rng.randint(0, h)
            s = rng.randint(15, 50)
            c = hex_to_rgb(rng.choice(colors))
            draw.ellipse([cx - s, cy - s // 2, cx + s, cy + s // 2], fill=c + (30,))

    elif pattern_type == "rectangles":
        for _ in range(10):
            x, y = rng.randint(0, w), rng.randint(0, h)
            rw, rh = rng.randint(30, 100), rng.randint(30, 100)
            c = hex_to_rgb(rng.choice(colors))
            draw.rectangle([x, y, x + rw, y + rh], fill=c + (20,), outline=c + (40,))

    elif pattern_type == "crosses":
        for _ in range(10):
            cx, cy = rng.randint(0, w), rng.randint(0, h)
            s = rng.randint(10, 35)
            c = hex_to_rgb(rng.choice(colors))
            draw.rectangle([cx - s, cy - 3, cx + s, cy + 3], fill=c + (35,))
            draw.rectangle([cx - 3, cy - s, cx + 3, cy + s], fill=c + (35,))


def draw_centered_text(draw, text, y, width, font, fill, shadow=False):
    """Draw centered text with optional shadow."""
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (width - tw) // 2
    if shadow:
        draw.text((x + 2, y + 2), text, font=font, fill=(0, 0, 0, 80))
    draw.text((x, y), text, font=font, fill=fill)


def wrap_text(text, font, max_width, draw):
    """Wrap text to fit within max_width."""
    words = text.split()
    lines = []
    current_line = ""
    for word in words:
        test_line = f"{current_line} {word}".strip()
        bbox = draw.textbbox((0, 0), test_line, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current_line = test_line
        else:
            if current_line:
                lines.append(current_line)
            current_line = word
    if current_line:
        lines.append(current_line)
    return lines


# ─── Image Generators ────────────────────────────────────────────


def generate_logo(store_name, primary_color, secondary_color, output_path):
    """Generate a clean store logo."""
    w, h = SIZES["logo"]
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")

    pc = hex_to_rgb(primary_color)
    sc = hex_to_rgb(secondary_color)

    # Background circle with gradient effect
    margin = 30
    # Outer circle
    draw.ellipse([margin, margin, w - margin, h - margin], fill=pc)
    # Inner highlight circle
    inner_m = margin + 15
    draw.ellipse(
        [inner_m, inner_m, w - inner_m, h - inner_m],
        fill=lighten(primary_color, 0.15),
    )

    # Store initials
    initials = "".join(
        word[0].upper()
        for word in store_name.split()
        if word[0].isalpha()
    )[:2]

    try:
        font_big = ImageFont.truetype(FONT_BOLD, 120)
    except:
        font_big = ImageFont.load_default()

    draw_centered_text(draw, initials, h // 2 - 70, w, font_big, (255, 255, 255))

    # Decorative ring
    ring_m = margin + 5
    draw.ellipse(
        [ring_m, ring_m, w - ring_m, h - ring_m],
        outline=sc + (120,),
        width=3,
    )

    # Save
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG")
    return output_path


def generate_hero(
    store_name, tagline, primary_color, secondary_color, accent_color,
    industry, output_path
):
    """Generate a beautiful hero banner."""
    w, h = SIZES["hero"]
    img = Image.new("RGBA", (w, h), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img, "RGBA")

    palette = INDUSTRY_PALETTES.get(industry, DEFAULT_PALETTE)
    pc = hex_to_rgb(primary_color)
    sc = hex_to_rgb(secondary_color)
    ac = hex_to_rgb(accent_color) if accent_color else lighten(primary_color, 0.3)

    # Rich gradient background
    for y in range(h):
        ratio = y / h
        # Diagonal gradient mixing primary -> secondary
        x_ratio = 0.3  # slight horizontal bias
        r = int(pc[0] * (1 - ratio) + sc[0] * ratio)
        g = int(pc[1] * (1 - ratio) + sc[1] * ratio)
        b = int(pc[2] * (1 - ratio) + sc[2] * ratio)
        # Darken slightly for depth
        r = max(0, int(r * 0.85))
        g = max(0, int(g * 0.85))
        b = max(0, int(b * 0.85))
        draw.line([(0, y), (w, y)], fill=(r, g, b, 255))

    # Decorative patterns
    draw_pattern(img, palette["shapes"], palette["colors"], seed=seed_from_string(store_name))

    # Large decorative circles in the right side
    rng = random.Random(seed_from_string(store_name + "hero"))
    for _ in range(8):
        x = rng.randint(w // 2, w + 100)
        y_pos = rng.randint(-50, h + 50)
        radius = rng.randint(40, 200)
        alpha = rng.randint(15, 45)
        draw.ellipse(
            [x - radius, y_pos - radius, x + radius, y_pos + radius],
            fill=(255, 255, 255, alpha),
        )

    # Floating accent elements
    for _ in range(5):
        x = rng.randint(w // 3, w - 50)
        y_pos = rng.randint(50, h - 50)
        s = rng.randint(8, 25)
        a = rng.randint(60, 140)
        draw.ellipse(
            [x - s, y_pos - s, x + s, y_pos + s],
            fill=ac + (a,) if isinstance(ac, tuple) else hex_to_rgb(accent_color) + (a,),
        )

    # Text section (left side)
    try:
        font_title = ImageFont.truetype(FONT_SERIF, 72)
        font_sub = ImageFont.truetype(FONT_REGULAR, 28)
        font_cta = ImageFont.truetype(FONT_BOLD, 24)
    except:
        font_title = ImageFont.load_default()
        font_sub = font_title
        font_cta = font_title

    text_x = 120
    text_y_start = h // 2 - 120

    # Store name with shadow
    lines = wrap_text(store_name, font_title, w // 2, draw)
    y_off = text_y_start
    for line in lines:
        draw.text((text_x + 3, y_off + 3), line, font=font_title, fill=(0, 0, 0, 60))
        draw.text((text_x, y_off), line, font=font_title, fill=(255, 255, 255, 255))
        y_off += 80

    # Tagline
    y_off += 15
    tag_lines = wrap_text(tagline, font_sub, w // 2 - 40, draw)
    for line in tag_lines:
        draw.text(
            (text_x, y_off), line, font=font_sub, fill=(255, 255, 255, 200)
        )
        y_off += 36

    # CTA button
    y_off += 30
    btn_text = "Shop Now →"
    btn_bbox = draw.textbbox((0, 0), btn_text, font=font_cta)
    btn_w = btn_bbox[2] - btn_bbox[0] + 50
    btn_h = 55
    # Button background
    draw.rounded_rectangle(
        [text_x, y_off, text_x + btn_w, y_off + btn_h],
        radius=btn_h // 2,
        fill=(255, 255, 255, 230),
    )
    draw.text(
        (text_x + 25, y_off + 13),
        btn_text,
        font=font_cta,
        fill=pc,
    )

    # Decorative line accent
    draw.rectangle(
        [text_x, text_y_start - 30, text_x + 60, text_y_start - 25],
        fill=ac if isinstance(ac, tuple) else hex_to_rgb(accent_color),
    )

    # Save as JPEG
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    rgb_img = Image.new("RGB", (w, h), (255, 255, 255))
    rgb_img.paste(img, mask=img.split()[3])
    rgb_img.save(output_path, "JPEG", quality=92)
    return output_path


def generate_category_image(
    category_name, primary_color, secondary_color, industry, output_path
):
    """Generate a category card image."""
    w, h = SIZES["category"]
    img = Image.new("RGBA", (w, h), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img, "RGBA")

    palette = INDUSTRY_PALETTES.get(industry, DEFAULT_PALETTE)
    seed = seed_from_string(category_name)
    rng = random.Random(seed)

    pc = hex_to_rgb(primary_color)
    sc = hex_to_rgb(secondary_color)

    # Pick a gradient from the palette
    grad = rng.choice(palette["bg_gradient"]) if palette["bg_gradient"] else ("#fff", "#eee")

    # Background gradient
    g1, g2 = hex_to_rgb(grad[0]), hex_to_rgb(grad[1])
    for y in range(h):
        ratio = y / h
        r = int(g1[0] * (1 - ratio) + sc[0] * ratio * 0.6 + g2[0] * ratio * 0.4)
        g = int(g1[1] * (1 - ratio) + sc[1] * ratio * 0.6 + g2[1] * ratio * 0.4)
        b = int(g1[2] * (1 - ratio) + sc[2] * ratio * 0.6 + g2[2] * ratio * 0.4)
        draw.line([(0, y), (w, y)], fill=(r, g, b, 255))

    # Decorative elements
    draw_pattern(img, palette["shapes"], palette["colors"], seed=seed)

    # Large centered icon/emoji representation (geometric)
    cx, cy = w // 2, h // 2 - 30
    radius = 80
    draw.ellipse(
        [cx - radius, cy - radius, cx + radius, cy + radius],
        fill=pc + (50,),
        outline=pc + (80,),
        width=3,
    )
    # Inner design
    inner_r = 45
    draw.ellipse(
        [cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r],
        fill=pc + (80,),
    )

    # Floating shapes
    for _ in range(6):
        fx = rng.randint(30, w - 30)
        fy = rng.randint(30, h - 80)
        fs = rng.randint(8, 30)
        fc = hex_to_rgb(rng.choice(palette["colors"]))
        draw.ellipse([fx - fs, fy - fs, fx + fs, fy + fs], fill=fc + (35,))

    # Category name at bottom with dark overlay
    overlay_h = 90
    for y in range(h - overlay_h, h):
        alpha = int(180 * ((y - (h - overlay_h)) / overlay_h))
        draw.line([(0, y), (w, y)], fill=(0, 0, 0, alpha))

    try:
        font = ImageFont.truetype(FONT_BOLD, 28)
    except:
        font = ImageFont.load_default()

    draw_centered_text(draw, category_name, h - 60, w, font, (255, 255, 255, 255))

    # Save
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    rgb_img = Image.new("RGB", (w, h), (255, 255, 255))
    rgb_img.paste(img, mask=img.split()[3])
    rgb_img.save(output_path, "JPEG", quality=90)
    return output_path


def generate_product_image(
    product_name, primary_color, secondary_color, accent_color,
    industry, price_str, output_path
):
    """Generate a product image."""
    w, h = SIZES["product"]
    img = Image.new("RGBA", (w, h), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img, "RGBA")

    palette = INDUSTRY_PALETTES.get(industry, DEFAULT_PALETTE)
    seed = seed_from_string(product_name)
    rng = random.Random(seed)

    pc = hex_to_rgb(primary_color)
    sc = hex_to_rgb(secondary_color)
    ac = hex_to_rgb(accent_color) if accent_color else lighten(primary_color, 0.3)

    # Soft radial-ish gradient background
    grad = rng.choice(palette["bg_gradient"]) if palette["bg_gradient"] else ("#fff", "#f5f5f5")
    g1, g2 = hex_to_rgb(grad[0]), hex_to_rgb(grad[1])
    for y in range(h):
        ratio = y / h
        r = int(g1[0] * (1 - ratio) + g2[0] * ratio)
        g = int(g1[1] * (1 - ratio) + g2[1] * ratio)
        b = int(g1[2] * (1 - ratio) + g2[2] * ratio)
        draw.line([(0, y), (w, y)], fill=(r, g, b, 255))

    # Central product representation — a stylized shape
    cx, cy = w // 2, h // 2 - 20

    # Shadow
    shadow_r = 140
    draw.ellipse(
        [cx - shadow_r, cy - shadow_r + 20, cx + shadow_r, cy + shadow_r + 20],
        fill=(0, 0, 0, 15),
    )

    # Main product circle
    main_r = 130
    draw.ellipse(
        [cx - main_r, cy - main_r, cx + main_r, cy + main_r],
        fill=pc + (40,),
        outline=pc + (100,),
        width=4,
    )

    # Inner ring
    ring_r = 100
    draw.ellipse(
        [cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r],
        fill=pc + (60,),
        outline=sc + (80,),
        width=2,
    )

    # Inner circle
    inner_r = 60
    draw.ellipse(
        [cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r],
        fill=lighten(primary_color, 0.2) + (180,),
    )

    # Decorative dots around product
    for i in range(12):
        angle = (i / 12) * 2 * math.pi
        dx = int(cx + math.cos(angle) * 170)
        dy = int(cy + math.sin(angle) * 170)
        dot_r = rng.randint(4, 10)
        draw.ellipse(
            [dx - dot_r, dy - dot_r, dx + dot_r, dy + dot_r],
            fill=sc + (50,),
        )

    # Light pattern in background
    draw_pattern(img, palette["shapes"], palette["colors"], seed=seed + 100)

    # Product name
    try:
        font_name = ImageFont.truetype(FONT_BOLD, 30)
        font_small = ImageFont.truetype(FONT_REGULAR, 18)
    except:
        font_name = ImageFont.load_default()
        font_small = font_name

    # Product name at bottom
    name_y = h - 130
    lines = wrap_text(product_name, font_name, w - 80, draw)
    for i, line in enumerate(lines):
        draw_centered_text(draw, line, name_y + i * 38, w, font_name, pc + (230,))

    # Subtle price badge if provided
    if price_str:
        try:
            font_price = ImageFont.truetype(FONT_BOLD, 22)
        except:
            font_price = font_name
        badge_text = price_str
        bbox = draw.textbbox((0, 0), badge_text, font=font_price)
        bw = bbox[2] - bbox[0] + 30
        bx = w - bw - 25
        by = 25
        draw.rounded_rectangle(
            [bx, by, bx + bw, by + 40],
            radius=20,
            fill=pc + (200,),
        )
        draw.text(
            (bx + 15, by + 7), badge_text, font=font_price, fill=(255, 255, 255, 255)
        )

    # Save
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    rgb_img = Image.new("RGB", (w, h), (255, 255, 255))
    rgb_img.paste(img, mask=img.split()[3])
    rgb_img.save(output_path, "JPEG", quality=90)
    return output_path


# ─── MongoDB Query Helper ────────────────────────────────────────


def get_store_data(slug):
    """Query MongoDB for store data using pymongo or subprocess."""
    import subprocess

    script = f"""
    const mongoose = require('mongoose');
    (async () => {{
      await mongoose.connect('mongodb://localhost:27017/retailx');
      const Tenant = require('./src/models/Tenant');
      const Category = require('./src/models/Category');
      const Product = require('./src/models/Product');

      const t = await Tenant.findOne({{ slug: '{slug}' }});
      if (!t) {{ console.log(JSON.stringify({{ error: 'Store not found' }})); process.exit(1); }}

      const cats = await Category.find({{ tenant: t._id }});
      const prods = await Product.find({{ tenant: t._id }});

      const data = {{
        store: {{
          name: t.name,
          slug: t.slug,
          industry: t.industry,
          description: t.description || '',
          logo: t.branding?.logo,
          heroBanner: t.branding?.heroBanner,
          primaryColor: t.branding?.primaryColor || '#3b82f6',
          secondaryColor: t.branding?.secondaryColor || '#1e40af',
          accentColor: t.branding?.accentColor || '#fbbf24',
        }},
        categories: cats.map(c => ({{
          id: c._id.toString(),
          name: c.name,
          slug: c.slug,
          image: c.image,
        }})),
        products: prods.map(p => ({{
          id: p._id.toString(),
          name: p.name,
          slug: p.slug,
          imageUrl: p.images?.[0]?.url,
          price: p.pricing?.basePrice,
        }})),
      }};

      console.log(JSON.stringify(data));
      await mongoose.disconnect();
    }})();
    """

    result = subprocess.run(
        ["node", "-e", script],
        cwd=str(BACKEND_DIR),
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:
        print(f"❌ Error querying MongoDB: {result.stderr}")
        sys.exit(1)

    # Parse the JSON output (skip any log lines from mongoose)
    for line in result.stdout.strip().split("\n"):
        line = line.strip()
        if line.startswith("{"):
            return json.loads(line)

    print(f"❌ Could not parse store data")
    print(result.stdout)
    sys.exit(1)


def update_category_images(slug, category_updates):
    """Update category image paths in MongoDB."""
    import subprocess

    updates_json = json.dumps(category_updates)
    script = f"""
    const mongoose = require('mongoose');
    (async () => {{
      await mongoose.connect('mongodb://localhost:27017/retailx');
      const Category = require('./src/models/Category');
      const updates = {updates_json};
      for (const u of updates) {{
        await Category.findByIdAndUpdate(u.id, {{ image: u.image }});
      }}
      console.log('Updated ' + updates.length + ' categories');
      await mongoose.disconnect();
    }})();
    """
    result = subprocess.run(
        ["node", "-e", script],
        cwd=str(BACKEND_DIR),
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"  ⚠️  Warning: Could not update category images: {result.stderr}")


def generate_store_images(slug):
    """Generate all images for a store."""
    print(f"\n{'═' * 55}")
    print(f"  🎨 Generating Images for: {slug}")
    print(f"{'═' * 55}\n")

    # Get store data from MongoDB
    data = get_store_data(slug)
    store = data["store"]
    categories = data["categories"]
    products = data["products"]

    pc = store["primaryColor"]
    sc = store["secondaryColor"]
    ac = store.get("accentColor", pc)
    industry = store["industry"]

    generated = []

    # 1. Logo
    logo_path = store.get("logo") or f"/uploads/logos/{slug}.png"
    logo_file = UPLOADS_DIR / logo_path.lstrip("/").replace("uploads/", "", 1)
    print(f"  📌 Logo: {logo_path}")
    generate_logo(store["name"], pc, sc, str(logo_file))
    generated.append(("Logo", logo_path))
    print(f"     ✅ Created ({logo_file.stat().st_size // 1024}KB)")

    # 2. Hero Banner
    hero_path = store.get("heroBanner") or f"/uploads/heroes/{slug}-hero.jpg"
    hero_file = UPLOADS_DIR / hero_path.lstrip("/").replace("uploads/", "", 1)
    tagline = store.get("description", f"Welcome to {store['name']}")
    print(f"  📌 Hero Banner: {hero_path}")
    generate_hero(store["name"], tagline, pc, sc, ac, industry, str(hero_file))
    generated.append(("Hero Banner", hero_path))
    print(f"     ✅ Created ({hero_file.stat().st_size // 1024}KB)")

    # 3. Categories
    print(f"  📌 Categories: {len(categories)}")
    cat_updates = []
    for cat in categories:
        cat_img_path = f"/uploads/categories/{slug}-{cat['slug']}.jpg"
        cat_file = UPLOADS_DIR / cat_img_path.lstrip("/").replace("uploads/", "", 1)
        generate_category_image(cat["name"], pc, sc, industry, str(cat_file))
        generated.append((f"Category: {cat['name']}", cat_img_path))
        cat_updates.append({"id": cat["id"], "image": cat_img_path})
        print(f"     ✅ {cat['name']} ({cat_file.stat().st_size // 1024}KB)")

    # Update category image paths in DB
    if cat_updates:
        update_category_images(slug, cat_updates)
        print(f"     📝 Updated {len(cat_updates)} category images in DB")

    # 4. Products
    print(f"  📌 Products: {len(products)}")
    skipped = 0
    for prod in products:
        raw_url = prod.get("imageUrl") or ""
        # Skip products with external URLs (already have real images)
        if raw_url.startswith("http://") or raw_url.startswith("https://"):
            skipped += 1
            continue
        prod_path = raw_url or f"/uploads/products/{slug}-{prod['slug']}.jpg"
        prod_file = UPLOADS_DIR / prod_path.lstrip("/").replace("uploads/", "", 1)
        price_str = f"${prod['price']:.2f}" if prod.get("price") else None
        generate_product_image(
            prod["name"], pc, sc, ac, industry, price_str, str(prod_file)
        )
        generated.append((f"Product: {prod['name']}", prod_path))
        print(f"     ✅ {prod['name']} ({prod_file.stat().st_size // 1024}KB)")
    if skipped:
        print(f"     ⏭️  Skipped {skipped} products (already have external images)")

    # Summary
    print(f"\n{'═' * 55}")
    print(f"  ✅ DONE — {len(generated)} images generated!")
    print(f"{'═' * 55}")
    total_size = sum(
        (UPLOADS_DIR / p.lstrip("/").replace("uploads/", "", 1)).stat().st_size
        for _, p in generated
    )
    print(f"  Total size: {total_size // 1024}KB")
    print(f"  Files saved to: {UPLOADS_DIR}")
    print(f"{'═' * 55}\n")


def get_all_slugs():
    """Get all store slugs from MongoDB."""
    import subprocess

    script = """
    const mongoose = require('mongoose');
    (async () => {
      await mongoose.connect('mongodb://localhost:27017/retailx');
      const Tenant = require('./src/models/Tenant');
      const tenants = await Tenant.find({}, 'slug');
      console.log(JSON.stringify(tenants.map(t => t.slug)));
      await mongoose.disconnect();
    })();
    """
    result = subprocess.run(
        ["node", "-e", script],
        cwd=str(BACKEND_DIR),
        capture_output=True,
        text=True,
    )
    for line in result.stdout.strip().split("\n"):
        if line.strip().startswith("["):
            return json.loads(line)
    return []


# ─── Main ─────────────────────────────────────────────────────────

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 generate-images.py <store-slug>")
        print("       python3 generate-images.py --all")
        print("\nAvailable stores:")
        for s in get_all_slugs():
            print(f"  • {s}")
        sys.exit(0)

    target = sys.argv[1]

    if target == "--all":
        slugs = get_all_slugs()
        print(f"Generating images for {len(slugs)} stores...")
        for s in slugs:
            generate_store_images(s)
    else:
        generate_store_images(target)
