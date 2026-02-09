#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════
 *   RetailX Store Generator CLI
 *   Automates: Tenant + Owner + Categories + Products + Images
 *   Usage: node src/scripts/add-store.js <config.json>
 *          node src/scripts/add-store.js --interactive
 * ═══════════════════════════════════════════════════════════════
 */

require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const config = require("../config");
const { Tenant, User, Category, Product } = require("../models");
const logger = require("../utils/logger");

// ─── Helpers ───────────────────────────────────────────────────
const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const skuPrefix = (slug) =>
  slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 3);

function ask(rl, question, defaultVal) {
  return new Promise((resolve) => {
    const prompt = defaultVal ? `${question} [${defaultVal}]: ` : `${question}: `;
    rl.question(prompt, (answer) => resolve(answer.trim() || defaultVal || ""));
  });
}

// ─── Industry Templates ──────────────────────────────────────
const INDUSTRY_TEMPLATES = {
  bakery: {
    industry: "food",
    businessType: "products",
    colors: { primary: "#FF6B9D", secondary: "#C44569", accent: "#FFC75F" },
    font: "Playfair Display",
    taxRate: 8.875,
    shippingEnabled: true,
    stockImages: {
      logo: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=200&h=200&fit=crop",
      hero: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=1920&h=700&fit=crop",
    },
    sampleCategories: [
      { name: "Birthday Cakes", slug: "birthday-cakes", desc: "Custom birthday cakes for all ages", image: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=600&h=400&fit=crop" },
      { name: "Wedding Cakes", slug: "wedding-cakes", desc: "Elegant cakes for your special day", image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=600&h=400&fit=crop" },
      { name: "Cupcakes & Muffins", slug: "cupcakes-muffins", desc: "Individual treats for any occasion", image: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=600&h=400&fit=crop" },
      { name: "Pastries & Desserts", slug: "pastries-desserts", desc: "French-inspired pastries and classics", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" },
      { name: "Custom Cakes", slug: "custom-cakes", desc: "Bespoke cakes designed just for you", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop" },
    ],
    sampleProducts: [
      {
        name: "Classic Chocolate Birthday Cake",
        cat: 0,
        price: 45.99,
        desc: "Rich 3-layer chocolate cake with ganache drips and strawberries. Serves 12-15.",
        short: "3-layer chocolate cake",
        tags: ["birthday", "chocolate", "cake"],
        featured: true,
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=800&fit=crop",
      },
      {
        name: "Vanilla Bean Wedding Cake",
        cat: 1,
        price: 450.0,
        desc: "Elegant 4-tier vanilla cake with buttercream piping, fresh roses, and gold leaf. Serves 80-100.",
        short: "4-tier wedding cake",
        tags: ["wedding", "vanilla", "luxury"],
        featured: true,
        image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800&h=800&fit=crop",
      },
      {
        name: "Red Velvet Cupcakes",
        cat: 2,
        price: 18.99,
        salePrice: 15.99,
        desc: "Classic red velvet with tangy cream cheese frosting. Box of 6.",
        short: "Red velvet 6-pack",
        tags: ["cupcakes", "red velvet"],
        featured: true,
        image: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=800&h=800&fit=crop",
      },
      {
        name: "Assorted French Macarons",
        cat: 3,
        price: 24.99,
        desc: "Delicate French macarons in vanilla, chocolate, pistachio, raspberry, lemon. Box of 12.",
        short: "Assorted 12-pack",
        tags: ["macarons", "french", "gift"],
        featured: true,
        image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=800&h=800&fit=crop",
      },
      {
        name: "Tiramisu Dessert",
        cat: 3,
        price: 32.99,
        desc: "Authentic Italian tiramisu with espresso-soaked ladyfingers and mascarpone. Serves 6-8.",
        short: "Classic Italian tiramisu",
        tags: ["tiramisu", "italian", "dessert"],
        featured: true,
        image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&h=800&fit=crop",
      },
      {
        name: "Strawberry Shortcake",
        cat: 3,
        price: 28.99,
        desc: "Fluffy sponge layered with whipped cream and fresh strawberries. Serves 8-10.",
        short: "Fresh strawberry cake",
        tags: ["strawberry", "summer", "fresh"],
        featured: false,
        image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=800&fit=crop",
      },
      {
        name: "Chocolate Croissants",
        cat: 3,
        price: 12.99,
        desc: "Buttery, flaky French croissants filled with dark chocolate. Pack of 4.",
        short: "Pain au chocolat 4-pack",
        tags: ["croissant", "chocolate", "breakfast"],
        featured: false,
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=800&h=800&fit=crop",
      },
      {
        name: "Custom Fondant Kids Cake",
        cat: 4,
        price: 85.0,
        desc: "Fully customizable fondant cake with your choice of character theme. 7 days advance notice required.",
        short: "Custom design cake",
        tags: ["custom", "fondant", "kids"],
        featured: true,
        image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=800&h=800&fit=crop",
      },
    ],
    imagePrompts: {
      logo: "Modern elegant bakery logo with a stylized layered cake and frosting swirls. Flat design, minimalist, {PRIMARY} and {ACCENT} colors. Icon only, no text. Transparent background.",
      hero: "Vibrant professional bakery hero banner. Beautifully decorated layered cakes (chocolate, vanilla, strawberry) with frosting, berries, elegant presentation on rustic wooden table. Soft bokeh of modern bakery. Colors: pinks, golds, creams. Professional food photography, warm lighting. Horizontal 1920x600.",
      categories: [
        "Flat icon of a birthday cake with candles in a circle. {PRIMARY} and {ACCENT} colors. Transparent background.",
        "Flat icon of a multi-tiered elegant wedding cake in a circle. White and gold tones. Transparent background.",
        "Flat icon of a cupcake with frosting swirl and cherry in a circle. {PRIMARY} colors. Transparent background.",
        "Flat icon of a croissant and macaron together in a circle. Golden and pastel colors. Transparent background.",
        "Flat icon of a chef hat with mixing bowl and whisk in a circle. {PRIMARY} colors. Transparent background.",
      ],
    },
  },

  grocery: {
    industry: "grocery",
    businessType: "products",
    colors: { primary: "#4CAF50", secondary: "#388E3C", accent: "#8BC34A" },
    font: "Inter",
    taxRate: 0,
    shippingEnabled: true,
    stockImages: {
      logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop",
      hero: "https://images.unsplash.com/photo-1543168256-418811576931?w=1920&h=700&fit=crop",
    },
    sampleCategories: [
      { name: "Fruits & Vegetables", slug: "fruits-vegetables", desc: "Fresh produce daily", image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&h=400&fit=crop" },
      { name: "Dairy & Eggs", slug: "dairy-eggs", desc: "Milk, cheese, eggs and more", image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&h=400&fit=crop" },
      { name: "Bakery", slug: "bakery", desc: "Fresh baked goods", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" },
      { name: "Pantry Essentials", slug: "pantry", desc: "Rice, pasta, oils and spices", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop" },
      { name: "Beverages", slug: "beverages", desc: "Drinks and juices", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&h=400&fit=crop" },
    ],
    sampleProducts: [
      {
        name: "Organic Bananas",
        cat: 0,
        price: 2.99,
        desc: "Fresh organic bananas, perfect for smoothies, snacks, or baking.",
        short: "Fresh organic bananas - 1 bunch",
        tags: ["organic", "fruits", "banana"],
        featured: true,
        image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&h=800&fit=crop",
      },
      {
        name: "Fresh Avocados",
        cat: 0,
        price: 5.99,
        desc: "Perfectly ripe Hass avocados. Great for guacamole, toast, or salads.",
        short: "Ripe Hass avocados - 4 pack",
        tags: ["avocado", "fruits", "fresh"],
        featured: true,
        image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&h=800&fit=crop",
      },
      {
        name: "Organic Whole Milk",
        cat: 1,
        price: 6.49,
        desc: "Fresh organic whole milk from grass-fed cows. No antibiotics.",
        short: "Organic whole milk - 1 gallon",
        tags: ["organic", "milk", "dairy"],
        featured: true,
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&h=800&fit=crop",
      },
      {
        name: "Farm Fresh Eggs",
        cat: 1,
        price: 5.99,
        salePrice: 4.99,
        desc: "Large brown eggs from free-range hens.",
        short: "Free-range eggs - Dozen",
        tags: ["eggs", "organic", "free-range"],
        featured: true,
        image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&h=800&fit=crop",
      },
      {
        name: "Artisan Sourdough Bread",
        cat: 2,
        price: 4.99,
        desc: "Freshly baked artisan sourdough with crusty exterior and soft interior.",
        short: "Fresh baked sourdough loaf",
        tags: ["bread", "sourdough", "artisan"],
        featured: true,
        image: "https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=800&h=800&fit=crop",
      },
      {
        name: "Extra Virgin Olive Oil",
        cat: 3,
        price: 12.99,
        desc: "Premium cold-pressed extra virgin olive oil from Italian olives.",
        short: "Italian EVOO - 500ml",
        tags: ["olive oil", "cooking", "italian"],
        featured: true,
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=800&fit=crop",
      },
      {
        name: "Organic Orange Juice",
        cat: 4,
        price: 7.99,
        salePrice: 6.49,
        desc: "Freshly squeezed organic orange juice. No sugar or preservatives.",
        short: "Fresh squeezed OJ - 64oz",
        tags: ["juice", "orange", "organic"],
        featured: true,
        image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800&h=800&fit=crop",
      },
    ],
    imagePrompts: {
      logo: "Modern clean grocery store logo with a green leaf and shopping cart combined. Minimalist, flat style, {PRIMARY} and white. No text. Transparent background.",
      hero: "Vibrant fresh produce banner with organic vegetables (tomatoes, cucumbers, lettuce) and fruits (bananas, avocados) on rustic wooden table with natural sunlight. Warm, healthy atmosphere. Professional food photography. Horizontal 1920x600.",
      categories: [
        "Colorful icon of fresh produce: tomato, carrot, bell pepper in a circle. Flat design, green and orange. Transparent background.",
        "Icon of milk bottle and eggs in a circle. Flat design, white and cream. Transparent background.",
        "Icon of a fresh loaf of bread and croissant in a circle. Warm brown and golden tones. Transparent background.",
        "Icon of pasta, rice jar, and oil bottle in a circle. Flat design, neutral tones. Transparent background.",
        "Icon of juice glass and coffee cup in a circle. Colorful (orange, brown). Transparent background.",
      ],
    },
  },

  salon: {
    industry: "wellness",
    businessType: "services",
    colors: { primary: "#E91E63", secondary: "#C2185B", accent: "#F48FB1" },
    font: "Playfair Display",
    taxRate: 9.5,
    shippingEnabled: false,
    stockImages: {
      logo: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop",
      hero: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1920&h=700&fit=crop",
    },
    sampleCategories: [
      { name: "Haircuts & Styling", slug: "haircuts-styling", desc: "Professional haircuts for all hair types", image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&h=400&fit=crop" },
      { name: "Hair Coloring", slug: "hair-coloring", desc: "Color, highlights, balayage, ombre", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop" },
      { name: "Hair Treatments", slug: "hair-treatments", desc: "Keratin, deep conditioning, repair", image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&h=400&fit=crop" },
      { name: "Bridal & Events", slug: "bridal-events", desc: "Wedding hair and special occasion styling", image: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&h=400&fit=crop" },
      { name: "Hair Products", slug: "hair-products", desc: "Professional shampoos and styling products", image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&h=400&fit=crop" },
    ],
    sampleProducts: [
      {
        name: "Women's Haircut & Blow Dry",
        cat: 0,
        price: 65.0,
        desc: "Professional women's haircut with consultation, shampoo, precision cut, and styling.",
        short: "Professional haircut with styling",
        tags: ["haircut", "women", "styling"],
        featured: true,
        image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=800&fit=crop",
      },
      {
        name: "Men's Haircut & Style",
        cat: 0,
        price: 35.0,
        desc: "Classic or modern men's haircut including wash, cut, and styling.",
        short: "Men's precision haircut",
        tags: ["haircut", "men", "barber"],
        featured: true,
        image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&h=800&fit=crop",
      },
      {
        name: "Full Hair Color",
        cat: 1,
        price: 120.0,
        salePrice: 99.0,
        desc: "Complete hair coloring with premium ammonia-free dyes.",
        short: "Complete color transformation",
        tags: ["hair color", "dye", "salon"],
        featured: true,
        image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=800&fit=crop",
      },
      {
        name: "Balayage Highlights",
        cat: 1,
        price: 180.0,
        desc: "Hand-painted balayage for a natural sun-kissed look.",
        short: "Natural hand-painted highlights",
        tags: ["balayage", "highlights", "natural"],
        featured: true,
        image: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=800&h=800&fit=crop",
      },
      {
        name: "Keratin Smoothing Treatment",
        cat: 2,
        price: 250.0,
        salePrice: 199.0,
        desc: "Brazilian keratin for frizz-free, silky hair lasting 3-4 months.",
        short: "Professional keratin smoothing",
        tags: ["keratin", "smoothing", "treatment"],
        featured: true,
        image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&h=800&fit=crop",
      },
      {
        name: "Bridal Hair Styling",
        cat: 3,
        price: 350.0,
        desc: "Complete bridal hair including trial session and wedding day styling.",
        short: "Complete bridal hair package",
        tags: ["bridal", "wedding", "updo"],
        featured: true,
        image: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&h=800&fit=crop",
      },
      {
        name: "Professional Shampoo & Conditioner Set",
        cat: 4,
        price: 45.0,
        desc: "Salon-quality sulfate-free shampoo and conditioner duo. 16oz each.",
        short: "Salon shampoo & conditioner duo",
        tags: ["shampoo", "conditioner", "hair care"],
        featured: true,
        image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&h=800&fit=crop",
      },
    ],
    imagePrompts: {
      logo: "Modern elegant hair salon logo with stylized scissors and flowing hair strands. Flat design, {PRIMARY} and gold. Icon only, no text. Transparent background.",
      hero: "Professional hair salon hero banner with woman with stunning freshly styled hair. Colorful salon interior with {PRIMARY} accents, mirrors, warm lighting. Luxurious atmosphere. Professional photography. Horizontal 1920x600.",
      categories: [
        "Flat icon of scissors cutting hair in a circle. {PRIMARY} colors. Transparent background.",
        "Flat icon of a hair dye brush and color palette in a circle. Colorful. Transparent background.",
        "Flat icon of hair treatment bottle and comb in a circle. {PRIMARY} colors. Transparent background.",
        "Flat icon of bridal tiara and flowers in a circle. Gold and white. Transparent background.",
        "Flat icon of shampoo bottle and comb in a circle. {PRIMARY} colors. Transparent background.",
      ],
    },
  },

  spa: {
    industry: "wellness",
    businessType: "services",
    colors: { primary: "#00897B", secondary: "#00695C", accent: "#4DB6AC" },
    font: "Lora",
    taxRate: 8.5,
    shippingEnabled: false,
    stockImages: {
      logo: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&h=200&fit=crop",
      hero: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1920&h=700&fit=crop",
    },
    sampleCategories: [
      { name: "Relaxation Massage", slug: "relaxation-massage", desc: "Swedish and aromatherapy massages", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop" },
      { name: "Therapeutic Massage", slug: "therapeutic-massage", desc: "Deep tissue and sports massage", image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400&fit=crop" },
      { name: "Specialty Treatments", slug: "specialty-treatments", desc: "Hot stone, Thai and unique treatments", image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&h=400&fit=crop" },
      { name: "Couples & Packages", slug: "couples-packages", desc: "Romantic couples massage and spa packages", image: "https://images.unsplash.com/photo-1591343395082-e120087004b4?w=600&h=400&fit=crop" },
      { name: "Body Treatments", slug: "body-treatments", desc: "Wraps, scrubs and body care treatments", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&h=400&fit=crop" },
    ],
    sampleProducts: [
      {
        name: "Swedish Relaxation Massage",
        cat: 0,
        price: 89.0,
        desc: "Classic full-body massage with long flowing strokes for deep relaxation. 60 minutes.",
        short: "Full-body relaxation - 60 min",
        tags: ["swedish", "relaxation", "massage"],
        featured: true,
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=800&fit=crop",
      },
      {
        name: "Deep Tissue Massage",
        cat: 1,
        price: 110.0,
        desc: "Firm pressure massage targeting chronic tension and muscle knots. 60 minutes.",
        short: "Deep muscle therapy - 60 min",
        tags: ["deep tissue", "therapeutic", "pain relief"],
        featured: true,
        image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800&h=800&fit=crop",
      },
      {
        name: "Hot Stone Therapy",
        cat: 2,
        price: 120.0,
        desc: "Heated volcanic basalt stones combined with massage for deep relaxation.",
        short: "Heated stone massage - 75 min",
        tags: ["hot stone", "relaxation", "spa"],
        featured: true,
        image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&h=800&fit=crop",
      },
      {
        name: "Couples Massage Package",
        cat: 3,
        price: 199.0,
        salePrice: 169.0,
        desc: "Side-by-side massage experience including champagne and aromatherapy.",
        short: "Romantic couples package",
        tags: ["couples", "romantic", "package"],
        featured: true,
        image: "https://images.unsplash.com/photo-1591343395082-e120087004b4?w=800&h=800&fit=crop",
      },
      {
        name: "Body Scrub & Wrap",
        cat: 4,
        price: 95.0,
        desc: "Full-body exfoliation followed by a nourishing body wrap. 90 minutes.",
        short: "Exfoliation & nourishment",
        tags: ["body scrub", "wrap", "exfoliation"],
        featured: true,
        image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&h=800&fit=crop",
      },
    ],
    imagePrompts: {
      logo: "Professional wellness spa logo with water ripple and lotus flower. Flat design, {PRIMARY} and white. Icon only, no text. Transparent background.",
      hero: "Luxurious spa hero banner with person receiving massage in upscale modern spa. Teal/green accents, warm earth tones. Serene atmosphere. Soft professional lighting. Horizontal 1920x600.",
      categories: [
        "Flat icon of hands giving massage in a circle. {PRIMARY} colors. Transparent background.",
        "Flat icon of strong arm muscle and healing hands in a circle. {PRIMARY} colors. Transparent background.",
        "Flat icon of hot stones stacked with steam in a circle. Earth tones. Transparent background.",
        "Flat icon of two people side by side with heart in a circle. {PRIMARY} and pink. Transparent background.",
        "Flat icon of body wrap and brush in a circle. {PRIMARY} colors. Transparent background.",
      ],
    },
  },

  fashion: {
    industry: "fashion",
    businessType: "products",
    colors: { primary: "#9C27B0", secondary: "#7B1FA2", accent: "#CE93D8" },
    font: "Montserrat",
    taxRate: 8.0,
    shippingEnabled: true,
    stockImages: {
      logo: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop",
      hero: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=700&fit=crop",
    },
    sampleCategories: [
      { name: "Women's Clothing", slug: "womens-clothing", desc: "Dresses, tops, bottoms and more", image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=400&fit=crop" },
      { name: "Men's Clothing", slug: "mens-clothing", desc: "Shirts, pants, jackets and more", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop" },
      { name: "Accessories", slug: "accessories", desc: "Bags, belts, jewelry and hats", image: "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?w=600&h=400&fit=crop" },
      { name: "Footwear", slug: "footwear", desc: "Shoes, boots, sandals and sneakers", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop" },
      { name: "Sale", slug: "sale-items", desc: "Seasonal deals and clearance", image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&h=400&fit=crop" },
    ],
    sampleProducts: [
      {
        name: "Classic Cotton T-Shirt",
        cat: 1,
        price: 29.99,
        desc: "Premium organic cotton t-shirt in navy blue. Relaxed fit, soft and comfortable.",
        short: "Organic cotton tee",
        tags: ["t-shirt", "cotton", "men", "casual"],
        featured: true,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
      },
      {
        name: "Floral Summer Dress",
        cat: 0,
        price: 59.99,
        salePrice: 44.99,
        desc: "Light, flowing summer dress with beautiful floral print. Perfect for warm days.",
        short: "Floral print dress",
        tags: ["dress", "summer", "floral", "women"],
        featured: true,
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&h=800&fit=crop",
      },
      {
        name: "Leather Crossbody Bag",
        cat: 2,
        price: 89.99,
        desc: "Genuine leather crossbody bag with adjustable strap and multiple compartments.",
        short: "Leather crossbody",
        tags: ["bag", "leather", "accessories"],
        featured: true,
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop",
      },
      {
        name: "Canvas Sneakers",
        cat: 3,
        price: 49.99,
        desc: "Classic canvas sneakers in white. Comfortable, versatile everyday footwear.",
        short: "White canvas sneakers",
        tags: ["sneakers", "shoes", "casual"],
        featured: true,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop",
      },
      {
        name: "Denim Jacket",
        cat: 1,
        price: 79.99,
        desc: "Classic denim jacket in medium wash. Timeless style for layering.",
        short: "Classic denim jacket",
        tags: ["jacket", "denim", "men", "outerwear"],
        featured: true,
        image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&h=800&fit=crop",
      },
    ],
    imagePrompts: {
      logo: "Modern fashion boutique logo with a stylized hanger or dress silhouette. Flat design, {PRIMARY} and white. Icon only, no text. Transparent background.",
      hero: "Professional fashion hero banner with models wearing stylish clothing in a modern store setting. {PRIMARY} accents. Professional fashion photography, bright lighting. Horizontal 1920x600.",
      categories: [
        "Flat icon of a dress or skirt silhouette in a circle. {PRIMARY} colors. Transparent background.",
        "Flat icon of a shirt and tie in a circle. {PRIMARY} colors. Transparent background.",
        "Flat icon of a handbag and sunglasses in a circle. {PRIMARY} colors. Transparent background.",
        "Flat icon of sneakers/shoes in a circle. {PRIMARY} colors. Transparent background.",
        "Flat icon of a price tag with percentage in a circle. Red and {PRIMARY}. Transparent background.",
      ],
    },
  },

  electronics: {
    industry: "electronics",
    businessType: "products",
    colors: { primary: "#1976D2", secondary: "#1565C0", accent: "#42A5F5" },
    font: "Roboto",
    taxRate: 8.0,
    shippingEnabled: true,
    stockImages: {
      logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop",
      hero: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1920&h=700&fit=crop",
    },
    sampleCategories: [
      { name: "Smartphones & Tablets", slug: "smartphones-tablets", desc: "Latest phones and tablets", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop" },
      { name: "Laptops & Computers", slug: "laptops-computers", desc: "Laptops, desktops and accessories", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop" },
      { name: "Audio & Headphones", slug: "audio-headphones", desc: "Speakers, headphones and earbuds", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop" },
      { name: "Wearables", slug: "wearables", desc: "Smartwatches and fitness trackers", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop" },
      { name: "Accessories", slug: "accessories", desc: "Cables, chargers and cases", image: "https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=600&h=400&fit=crop" },
    ],
    sampleProducts: [
      {
        name: "Wireless Bluetooth Earbuds",
        cat: 2,
        price: 79.99,
        desc: "Premium noise-cancelling earbuds with 24hr battery. IPX5 waterproof.",
        short: "ANC earbuds - 24hr battery",
        tags: ["earbuds", "wireless", "bluetooth"],
        featured: true,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=800&h=800&fit=crop",
      },
      {
        name: "Smart Fitness Watch",
        cat: 3,
        price: 199.99,
        salePrice: 149.99,
        desc: "Advanced fitness tracker with heart rate, GPS, sleep tracking.",
        short: "GPS fitness smartwatch",
        tags: ["smartwatch", "fitness", "GPS"],
        featured: true,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
      },
      { name: "USB-C Hub Adapter", cat: 4, price: 39.99, desc: "7-in-1 USB-C hub with HDMI, USB 3.0, SD card reader.", short: "7-in-1 USB-C hub", tags: ["usb-c", "hub", "adapter"], featured: true, image: "https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=800&h=800&fit=crop" },
      {
        name: "Portable Bluetooth Speaker",
        cat: 2,
        price: 59.99,
        desc: "Compact waterproof speaker with 360° sound and 12hr battery.",
        short: "Waterproof BT speaker",
        tags: ["speaker", "bluetooth", "portable"],
        featured: true,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop",
      },
      { name: "Laptop Stand", cat: 4, price: 34.99, desc: "Ergonomic aluminum laptop stand with adjustable height.", short: "Aluminum laptop stand", tags: ["stand", "ergonomic", "laptop"], featured: false, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&h=800&fit=crop" },
    ],
    imagePrompts: {
      logo: "Modern tech electronics store logo with circuit/chip pattern. Flat design, {PRIMARY} and white. Icon only, no text. Transparent background.",
      hero: "Clean modern electronics store hero banner with latest gadgets (phone, laptop, headphones) on minimal background. {PRIMARY} accent lighting. Professional product photography. Horizontal 1920x600.",
      categories: [
        "Flat icon of smartphone and tablet in a circle. {PRIMARY} colors. Transparent background.",
        "Flat icon of laptop computer in a circle. {PRIMARY} colors. Transparent background.",
        "Flat icon of headphones in a circle. {PRIMARY} colors. Transparent background.",
        "Flat icon of smartwatch on wrist in a circle. {PRIMARY} colors. Transparent background.",
        "Flat icon of charging cable and adapter in a circle. {PRIMARY} colors. Transparent background.",
      ],
    },
  },

  healthcare: {
    industry: "healthcare",
    businessType: "services",
    colors: { primary: "#2196F3", secondary: "#1565C0", accent: "#64B5F6" },
    font: "Open Sans",
    taxRate: 0,
    shippingEnabled: false,
    stockImages: {
      logo: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=200&h=200&fit=crop",
      hero: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&h=700&fit=crop",
    },
    sampleCategories: [
      { name: "General Consultation", slug: "general-consultation", desc: "Primary care and check-ups", image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&h=400&fit=crop" },
      { name: "Specialist Services", slug: "specialist-services", desc: "Specialized medical care", image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&h=400&fit=crop" },
      { name: "Diagnostics", slug: "diagnostics", desc: "Lab tests and imaging", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=400&fit=crop" },
      { name: "Therapy & Rehab", slug: "therapy-rehab", desc: "Physical therapy and rehabilitation", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop" },
      { name: "Health Products", slug: "health-products", desc: "Supplements and medical products", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=400&fit=crop" },
    ],
    sampleProducts: [
      {
        name: "General Health Check-Up",
        cat: 0,
        price: 150.0,
        desc: "Comprehensive health assessment including vitals, blood work, and consultation.",
        short: "Complete health screening",
        tags: ["checkup", "health", "screening"],
        featured: true,
        image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=800&fit=crop",
      },
      {
        name: "Physical Therapy Session",
        cat: 3,
        price: 95.0,
        desc: "One-on-one session with certified physical therapist. 45 minutes.",
        short: "PT session - 45 min",
        tags: ["therapy", "rehab", "physical"],
        featured: true,
        image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=800&fit=crop",
      },
      {
        name: "Blood Panel Test",
        cat: 2,
        price: 120.0,
        desc: "Complete blood count, metabolic panel, and lipid profile.",
        short: "Full blood work panel",
        tags: ["blood test", "lab", "diagnostics"],
        featured: true,
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=800&fit=crop",
      },
      {
        name: "Nutrition Consultation",
        cat: 0,
        price: 85.0,
        desc: "Personalized nutrition plan with certified nutritionist.",
        short: "Custom nutrition plan",
        tags: ["nutrition", "diet", "consultation"],
        featured: true,
        image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=800&fit=crop",
      },
      {
        name: "Premium Multivitamin Pack",
        cat: 4,
        price: 34.99,
        desc: "30-day supply of doctor-formulated multivitamins.",
        short: "30-day vitamin supply",
        tags: ["vitamins", "supplements", "health"],
        featured: true,
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=800&fit=crop",
      },
    ],
    imagePrompts: {
      logo: "Professional healthcare clinic logo with a medical cross and heart. Flat design, {PRIMARY} and white. Icon only, no text. Transparent background.",
      hero: "Professional healthcare hero banner with friendly doctor and modern clinic setting. {PRIMARY} accents, clean, trustworthy atmosphere. Professional medical photography. Horizontal 1920x600.",
      categories: [
        "Flat icon of stethoscope in a circle. {PRIMARY} colors. Transparent background.",
        "Flat icon of medical specialist with magnifying glass in a circle. {PRIMARY} colors. Transparent background.",
        "Flat icon of lab test tube and microscope in a circle. {PRIMARY} colors. Transparent background.",
        "Flat icon of person doing stretching exercise in a circle. {PRIMARY} colors. Transparent background.",
        "Flat icon of pill bottle and capsules in a circle. {PRIMARY} colors. Transparent background.",
      ],
    },
  },
};

// ─── Interactive Mode ────────────────────────────────────────
async function interactiveMode() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log("\n══════════════════════════════════════════════════");
  console.log("   🏪 RetailX Store Generator — Interactive Mode");
  console.log("══════════════════════════════════════════════════\n");

  const industries = Object.keys(INDUSTRY_TEMPLATES);
  console.log("Available industry templates:");
  industries.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
  console.log("");

  const industryChoice = await ask(rl, "Select industry # (or type name)", "bakery");
  const industryKey = /^\d+$/.test(industryChoice) ? industries[parseInt(industryChoice) - 1] : industryChoice;

  if (!INDUSTRY_TEMPLATES[industryKey]) {
    console.error("❌ Unknown industry:", industryKey);
    console.log("Available:", industries.join(", "));
    rl.close();
    process.exit(1);
  }

  const storeName = await ask(rl, "Store name", "Sweet Delights Bakery");
  const slug = await ask(rl, "Store slug (URL-friendly)", slugify(storeName));
  const description = await ask(rl, "Short description", `Premium ${industryKey} products and services`);
  const ownerFirst = await ask(rl, "Owner first name", "Owner");
  const ownerLast = await ask(rl, "Owner last name", storeName.split(" ")[0]);
  const ownerEmail = await ask(rl, "Owner email", `owner@${slug.replace(/-/g, "")}.com`);
  const contactEmail = await ask(rl, "Store contact email", `hello@${slug.replace(/-/g, "")}.com`);
  const phone = await ask(rl, "Phone", "+1 (555) 000-0000");
  const street = await ask(rl, "Street address", "123 Main St");
  const city = await ask(rl, "City", "New York");
  const state = await ask(rl, "State", "NY");
  const zip = await ask(rl, "ZIP code", "10001");

  const template = INDUSTRY_TEMPLATES[industryKey];
  const useDefaultColors = (await ask(rl, `Use default colors? (${template.colors.primary}, ${template.colors.secondary}, ${template.colors.accent}) [Y/n]`, "Y")).toLowerCase() !== "n";

  let colors = template.colors;
  if (!useDefaultColors) {
    colors = {
      primary: await ask(rl, "Primary color (hex)", template.colors.primary),
      secondary: await ask(rl, "Secondary color (hex)", template.colors.secondary),
      accent: await ask(rl, "Accent color (hex)", template.colors.accent),
    };
  }

  const useDefaultProducts = (await ask(rl, "Use template products? [Y/n]", "Y")).toLowerCase() !== "n";

  rl.close();

  const storeConfig = {
    store: { name: storeName, slug, description, industry: industryKey },
    owner: { firstName: ownerFirst, lastName: ownerLast, email: ownerEmail },
    contact: { email: contactEmail, phone, address: { street, city, state, zipCode: zip, country: "US" } },
    colors,
    useTemplateProducts: useDefaultProducts,
  };

  return storeConfig;
}

// ─── Generate Image Prompts File ─────────────────────────────
function generateImagePromptsFile(storeConfig, template) {
  const slug = storeConfig.store.slug;
  const name = storeConfig.store.name;
  const colors = storeConfig.colors;
  const prompts = template.imagePrompts;

  const replace = (str) =>
    str
      .replace(/\{PRIMARY\}/g, colors.primary)
      .replace(/\{SECONDARY\}/g, colors.secondary)
      .replace(/\{ACCENT\}/g, colors.accent)
      .replace(/\{NAME\}/g, name);

  let content = `# 🎨 Image Prompts for: ${name}\n`;
  content += `# Generated: ${new Date().toISOString().split("T")[0]}\n`;
  content += `# Copy each prompt into your AI image generator\n\n`;
  content += `## Specifications\n`;
  content += `| Asset | Size | Format | Save To |\n`;
  content += `|-------|------|--------|--------|\n`;
  content += `| Logo | 200x200px | PNG (transparent) | uploads/logos/${slug}.png |\n`;
  content += `| Hero Banner | 1920x600px | JPG (90%) | uploads/heroes/${slug}-hero.jpg |\n`;

  template.sampleCategories.forEach((cat, i) => {
    content += `| Category: ${cat.name} | 200x200px | PNG (transparent) | uploads/categories/${slug}-${cat.slug}.png |\n`;
  });

  template.sampleProducts.forEach((prod) => {
    const prodSlug = slugify(prod.name);
    content += `| Product: ${prod.name} | 600x600px | JPG (90%) | uploads/products/${slug}-${prodSlug}.jpg |\n`;
  });

  content += `\n---\n\n`;
  content += `## 1. Logo (200x200px PNG)\n\`\`\`\n${replace(prompts.logo)}\n\`\`\`\n\n`;
  content += `## 2. Hero Banner (1920x600px JPG)\n\`\`\`\n${replace(prompts.hero)}\n\`\`\`\n\n`;
  content += `## 3. Category Icons (200x200px PNG each)\n\n`;

  template.sampleCategories.forEach((cat, i) => {
    const prompt = prompts.categories[i] || prompts.categories[0];
    content += `### ${cat.name}\n\`\`\`\n${replace(prompt)}\n\`\`\`\n**Save as:** \`uploads/categories/${slug}-${cat.slug}.png\`\n\n`;
  });

  content += `## 4. Product Images (600x600px JPG each)\n\n`;
  template.sampleProducts.forEach((prod) => {
    const prodSlug = slugify(prod.name);
    content += `### ${prod.name}\n\`\`\`\nProfessional product/service photography for e-commerce.\nProduct: ${prod.name}\nDetails: ${prod.desc}\nBackground: White or light neutral\nLighting: Professional studio lighting\nQuality: High detail, sharp focus, realistic\nStyle: Modern e-commerce photography\n\`\`\`\n**Save as:** \`uploads/products/${slug}-${prodSlug}.jpg\`\n\n`;
  });

  return content;
}

// ─── Main: Seed Database ─────────────────────────────────────
async function seedStore(storeConfig) {
  const industryKey = storeConfig.store.industry;
  const template = INDUSTRY_TEMPLATES[industryKey];
  if (!template) throw new Error("Unknown industry: " + industryKey);

  const slug = storeConfig.store.slug;
  const colors = storeConfig.colors || template.colors;
  const prefix = skuPrefix(slug);
  const isService = template.businessType === "services";

  // Connect
  await mongoose.connect(config.mongodb.uri, config.mongodb.options);
  logger.info("Connected to MongoDB");

  // Check for existing store
  const existing = await Tenant.findOne({ slug });
  if (existing) {
    throw new Error(`Store with slug "${slug}" already exists! Choose a different slug.`);
  }

  // Find super admin
  const superAdmin = await User.findOne({ role: "super_admin" });
  if (!superAdmin) {
    throw new Error("No super admin found! Run the main seed first: node src/seeds/index.js");
  }

  // ── Create Tenant ──
  logger.info(`Creating store: ${storeConfig.store.name}...`);

  const tenantData = {
    name: storeConfig.store.name,
    slug,
    description: storeConfig.store.description,
    industry: template.industry,
    businessType: template.businessType,
    domains: { subdomain: slug },
    branding: {
      logo: template.stockImages?.logo || `/uploads/logos/${slug}.png`,
      heroBanner: template.stockImages?.hero || `/uploads/heroes/${slug}-hero.jpg`,
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
      accentColor: colors.accent,
      fontFamily: template.font,
    },
    contact: {
      email: storeConfig.contact.email,
      phone: storeConfig.contact.phone,
      address: storeConfig.contact.address,
    },
    settings: {
      currency: "USD",
      currencySymbol: "$",
      taxRate: template.taxRate,
      shippingEnabled: template.shippingEnabled,
      guestCheckout: true,
    },
    features: {
      productVariants: true,
      productSKU: true,
      productBrand: true,
      productTags: true,
    },
    status: "active",
    createdBy: superAdmin._id,
  };

  // Add service settings for service businesses
  if (isService) {
    tenantData.serviceSettings = {
      appointmentRequired: true,
      bookingLeadTime: 24,
      cancellationPolicy: "Please cancel at least 24 hours in advance",
      sessionBased: true,
      durationUnit: "minutes",
    };
    tenantData.features.paymentEnabled = false;
    tenantData.features.cartEnabled = false;
    tenantData.features.bookingEnabled = true;
    tenantData.bookingSettings = {
      workingHours: {
        monday: { open: "09:00", close: "18:00", isOpen: true },
        tuesday: { open: "09:00", close: "18:00", isOpen: true },
        wednesday: { open: "09:00", close: "18:00", isOpen: true },
        thursday: { open: "09:00", close: "18:00", isOpen: true },
        friday: { open: "09:00", close: "19:00", isOpen: true },
        saturday: { open: "10:00", close: "17:00", isOpen: true },
        sunday: { open: "10:00", close: "15:00", isOpen: false },
      },
      slotDuration: 60,
      bufferTime: 15,
      advanceBookingDays: 30,
    };
    tenantData.shipping = { methods: [], freeShippingThreshold: 0 };
  } else {
    tenantData.shipping = {
      methods: [
        { name: "Standard Delivery", description: "3-5 business days", price: 5.99, estimatedDays: "3-5", enabled: true },
        { name: "Express Delivery", description: "1-2 business days", price: 12.99, estimatedDays: "1-2", enabled: true },
      ],
      freeShippingThreshold: 75,
    };
  }

  const tenant = await Tenant.create(tenantData);
  logger.info(`  ✅ Tenant created: ${tenant.name} (${tenant.slug})`);

  // ── Create Owner ──
  const owner = await User.create({
    email: storeConfig.owner.email,
    password: "Owner@123456",
    firstName: storeConfig.owner.firstName,
    lastName: storeConfig.owner.lastName,
    role: "store_owner",
    tenant: tenant._id,
    status: "active",
    emailVerified: true,
  });
  logger.info(`  ✅ Owner created: ${owner.email}`);

  // ── Create Categories ──
  const categories = [];
  const catSource = storeConfig.categories || template.sampleCategories;
  for (let i = 0; i < catSource.length; i++) {
    const c = catSource[i];
    const cat = await Category.create({
      tenant: tenant._id,
      name: c.name,
      slug: c.slug || slugify(c.name),
      description: c.desc || c.description || "",
      image: c.image || null,
      displayOrder: i + 1,
      showInMenu: true,
      showInHomepage: true,
      status: "active",
      createdBy: owner._id,
    });
    categories.push(cat);
  }
  logger.info(`  ✅ Categories created: ${categories.length}`);

  // ── Create Products ──
  if (storeConfig.useTemplateProducts !== false) {
    const prodSource = storeConfig.products || template.sampleProducts;
    const products = prodSource.map((p, i) => {
      const catIndex = p.cat ?? 0;
      const prodSlug = p.slug || slugify(p.name);
      const catAbbr = (categories[catIndex]?.slug || "gen").slice(0, 2).toUpperCase();
      return {
        tenant: tenant._id,
        name: p.name,
        slug: prodSlug,
        description: p.desc || p.description || "",
        shortDescription: p.short || p.shortDescription || "",
        category: categories[catIndex]?._id || categories[0]._id,
        brand: storeConfig.store.name,
        images: [
          {
            url: p.image || `/uploads/products/${slug}-${prodSlug}.jpg`,
            alt: p.name,
            isPrimary: true,
          },
        ],
        pricing: {
          basePrice: p.price,
          ...(p.salePrice && { salePrice: p.salePrice }),
          currency: "USD",
        },
        inventory: {
          sku: `${prefix}-${catAbbr}-${String(i + 1).padStart(3, "0")}`,
          quantity: isService ? 999 : Math.floor(Math.random() * 80 + 20),
          trackQuantity: !isService,
        },
        tags: p.tags || [],
        ratings: {
          average: +(4.5 + Math.random() * 0.5).toFixed(1),
          count: Math.floor(Math.random() * 250 + 50),
        },
        status: "active",
        isFeatured: p.featured ?? false,
        isOnSale: !!p.salePrice,
        createdBy: owner._id,
      };
    });

    await Product.insertMany(products);
    logger.info(`  ✅ Products created: ${products.length}`);

    // Update stats
    await Tenant.findByIdAndUpdate(tenant._id, {
      "stats.totalProducts": products.length,
      "stats.totalCustomers": 0,
    });
  }

  // ── Create Upload Directories ──
  const uploadsBase = path.join(__dirname, "../../public/uploads");
  const dirs = ["logos", "heroes", "products", "categories", "about", "staff", "general"].map((d) => path.join(uploadsBase, d));
  dirs.forEach((d) => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
  logger.info("  ✅ Upload directories ready");

  // ── Generate Image Prompts File ──
  const promptsContent = generateImagePromptsFile(storeConfig, template);
  const promptsFile = path.join(__dirname, `../../IMAGE_PROMPTS_${slug.toUpperCase().replace(/-/g, "_")}.md`);
  fs.writeFileSync(promptsFile, promptsContent);
  logger.info(`  ✅ Image prompts saved: ${path.basename(promptsFile)}`);

  return { tenant, owner, categories, promptsFile };
}

// ─── Main Entry ──────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);

  try {
    let storeConfig;

    if (args[0] === "--interactive" || args[0] === "-i" || args.length === 0) {
      // Interactive mode
      storeConfig = await interactiveMode();
    } else if (args[0] === "--quick" || args[0] === "-q") {
      // Quick mode: node add-store.js --quick "Sweet Delights Bakery" bakery
      const name = args[1];
      const industry = args[2] || "bakery";
      if (!name) {
        console.error('Usage: node add-store.js --quick "Store Name" <industry>');
        console.error("Industries:", Object.keys(INDUSTRY_TEMPLATES).join(", "));
        process.exit(1);
      }
      const slug = slugify(name);
      storeConfig = {
        store: { name, slug, description: `Welcome to ${name}`, industry },
        owner: { firstName: "Owner", lastName: name.split(" ")[0], email: `owner@${slug.replace(/-/g, "")}.com` },
        contact: {
          email: `hello@${slug.replace(/-/g, "")}.com`,
          phone: "+1 (555) 000-0000",
          address: { street: "123 Main St", city: "New York", state: "NY", zipCode: "10001", country: "US" },
        },
        colors: INDUSTRY_TEMPLATES[industry]?.colors,
        useTemplateProducts: true,
      };
    } else {
      // JSON config file mode
      const configPath = path.resolve(args[0]);
      if (!fs.existsSync(configPath)) {
        console.error("Config file not found:", configPath);
        process.exit(1);
      }
      storeConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }

    // Validate
    const industryKey = storeConfig.store.industry;
    if (!INDUSTRY_TEMPLATES[industryKey]) {
      console.error("❌ Unknown industry:", industryKey);
      console.error("Available:", Object.keys(INDUSTRY_TEMPLATES).join(", "));
      process.exit(1);
    }

    // ── Seed ──
    console.log("\n══════════════════════════════════════════════════");
    console.log("   🚀 Creating Store: " + storeConfig.store.name);
    console.log("══════════════════════════════════════════════════\n");

    const result = await seedStore(storeConfig);
    const template = INDUSTRY_TEMPLATES[industryKey];

    console.log("\n══════════════════════════════════════════════════");
    console.log("   ✅ STORE CREATED SUCCESSFULLY!");
    console.log("══════════════════════════════════════════════════");
    console.log("");
    console.log(`   Store:       ${result.tenant.name}`);
    console.log(`   Slug:        ${result.tenant.slug}`);
    console.log(`   Industry:    ${industryKey} (${template.businessType})`);
    console.log(`   Categories:  ${result.categories.length}`);
    console.log(`   Owner:       ${result.owner.email}`);
    console.log(`   Password:    Owner@123456`);
    console.log("");
    console.log("   📍 Access URLs:");
    console.log(`   Storefront:  http://localhost:5173/store/${result.tenant.slug}`);
    console.log(`   Admin:       http://localhost:3000 (login as ${result.owner.email})`);
    console.log("");
    console.log("   🎨 Image Prompts:");
    console.log(`   ${result.promptsFile}`);
    console.log("   → Open this file, copy prompts into your AI image tool");
    console.log("   → Save generated images to the paths listed in the file");
    console.log("");
    console.log("══════════════════════════════════════════════════\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.code === 11000) {
      console.error("   A store with this slug or subdomain already exists.");
    }
    process.exit(1);
  }
}

main();
