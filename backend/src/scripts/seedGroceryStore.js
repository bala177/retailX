/**
 * Seed script for FreshMart Grocery Store
 * Run with: node src/scripts/seedGroceryStore.js
 * This adds realistic grocery products to the existing FreshMart store
 */

require("dotenv").config();
const mongoose = require("mongoose");
const config = require("../config");
const { Tenant, Category, Product } = require("../models");
const logger = require("../utils/logger");

// Unsplash image URLs for grocery products (reliable, free)
const images = {
  // Fruits
  apple: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop",
  banana: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop",
  orange: "https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=400&fit=crop",
  grapes: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&h=400&fit=crop",
  strawberry: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop",
  mango: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=400&fit=crop",
  watermelon: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop",
  pineapple: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&h=400&fit=crop",
  blueberry: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&h=400&fit=crop",
  avocado: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=400&fit=crop",

  // Vegetables
  tomato: "https://images.unsplash.com/photo-1546470427-227c7369a9b5?w=400&h=400&fit=crop",
  carrot: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop",
  broccoli: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=400&fit=crop",
  spinach: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop",
  potato: "https://images.unsplash.com/photo-1518977676601-b53f82ber52d?w=400&h=400&fit=crop",
  onion: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400&h=400&fit=crop",
  cucumber: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&h=400&fit=crop",
  bellPepper: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop",
  lettuce: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=400&fit=crop",
  mushroom: "https://images.unsplash.com/photo-1504545102780-26774c1bb073?w=400&h=400&fit=crop",

  // Dairy
  milk: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop",
  cheese: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop",
  yogurt: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop",
  butter: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop",
  eggs: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop",
  cream: "https://images.unsplash.com/photo-1634141510639-d691d86f47be?w=400&h=400&fit=crop",

  // Bakery
  bread: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop",
  croissant: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=400&fit=crop",
  bagel: "https://images.unsplash.com/photo-1585535936691-ebd47f0f6bbb?w=400&h=400&fit=crop",
  muffin: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=400&fit=crop",
  donut: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop",
  cake: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop",

  // Beverages
  juice: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop",
  appleJuice: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop",
  coffee: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop",
  coffeeBeans: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop",
  tea: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop",
  herbalTea: "https://images.unsplash.com/photo-1597318113128-e6e2d5c82fba?w=400&h=400&fit=crop",
  water: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop",
  sparklingWater: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&h=400&fit=crop",
  soda: "https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=400&h=400&fit=crop",
  smoothie: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=400&fit=crop",

  // Pantry
  rice: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop",
  brownRice: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&h=400&fit=crop",
  pasta: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop",
  spaghetti: "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&h=400&fit=crop",
  cereal: "https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=400&h=400&fit=crop",
  granola: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=400&h=400&fit=crop",
  oil: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop",
  honey: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&h=400&fit=crop",
  sauce: "https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400&h=400&fit=crop",
  spices: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=400&fit=crop",
  nuts: "https://images.unsplash.com/photo-1536816579748-4ecb3f03d72a?w=400&h=400&fit=crop",
  almonds: "https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=400&fit=crop",
  chips: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop",
  chocolate: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=400&h=400&fit=crop",
  peanutButter: "https://images.unsplash.com/photo-1563564099-25c0e8a20a3?w=400&h=400&fit=crop",
  jam: "https://images.unsplash.com/photo-1484433039-9e0375d2c1e1?w=400&h=400&fit=crop",
  flour: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop",
  sugar: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=400&h=400&fit=crop",
};

// Product definitions
const groceryProducts = [
  // ═══════════════════════════════════════════════════════════════════════
  // FRUITS & VEGETABLES
  // ═══════════════════════════════════════════════════════════════════════
  // Fruits
  { name: "Fresh Red Apples", slug: "fresh-red-apples", category: "fruits-and-vegetables", price: 3.99, unit: "lb", description: "Crisp and sweet red apples, perfect for snacking or baking. Locally sourced from organic farms.", image: images.apple, stock: 150, featured: true },
  { name: "Organic Bananas", slug: "organic-bananas", category: "fruits-and-vegetables", price: 1.49, unit: "bunch", description: "Perfectly ripe organic bananas. Rich in potassium and great for smoothies.", image: images.banana, stock: 200, featured: true },
  { name: "Navel Oranges", slug: "navel-oranges", category: "fruits-and-vegetables", price: 4.99, unit: "bag", description: "Juicy California navel oranges, seedless and perfect for juicing.", image: images.orange, stock: 100 },
  { name: "Red Seedless Grapes", slug: "red-seedless-grapes", category: "fruits-and-vegetables", price: 5.99, unit: "lb", description: "Sweet and crunchy red grapes, great for snacking or fruit salads.", image: images.grapes, stock: 80 },
  { name: "Fresh Strawberries", slug: "fresh-strawberries", category: "fruits-and-vegetables", price: 4.49, unit: "pack", description: "Sweet, juicy strawberries perfect for desserts and smoothies.", image: images.strawberry, stock: 60, featured: true },
  { name: "Ripe Mangoes", slug: "ripe-mangoes", category: "fruits-and-vegetables", price: 2.99, unit: "each", description: "Sweet and aromatic mangoes from tropical farms.", image: images.mango, stock: 75 },
  { name: "Seedless Watermelon", slug: "seedless-watermelon", category: "fruits-and-vegetables", price: 6.99, unit: "each", description: "Refreshing seedless watermelon, perfect for summer.", image: images.watermelon, stock: 40 },
  { name: "Fresh Pineapple", slug: "fresh-pineapple", category: "fruits-and-vegetables", price: 3.99, unit: "each", description: "Sweet golden pineapple, great for snacking or grilling.", image: images.pineapple, stock: 50 },
  { name: "Organic Blueberries", slug: "organic-blueberries", category: "fruits-and-vegetables", price: 5.99, unit: "pack", description: "Antioxidant-rich organic blueberries.", image: images.blueberry, stock: 45 },
  { name: "Hass Avocados", slug: "hass-avocados", category: "fruits-and-vegetables", price: 1.99, unit: "each", description: "Creamy Hass avocados, perfect for guacamole or toast.", image: images.avocado, stock: 120, featured: true },

  // Vegetables
  { name: "Vine Ripe Tomatoes", slug: "vine-ripe-tomatoes", category: "fruits-and-vegetables", price: 3.49, unit: "lb", description: "Juicy vine-ripened tomatoes with rich flavor.", image: images.tomato, stock: 100 },
  { name: "Organic Carrots", slug: "organic-carrots", category: "fruits-and-vegetables", price: 2.99, unit: "bunch", description: "Sweet organic carrots, great for snacking or cooking.", image: images.carrot, stock: 90 },
  { name: "Fresh Broccoli", slug: "fresh-broccoli", category: "fruits-and-vegetables", price: 2.49, unit: "head", description: "Crisp green broccoli crowns, rich in vitamins.", image: images.broccoli, stock: 70 },
  { name: "Baby Spinach", slug: "baby-spinach", category: "fruits-and-vegetables", price: 4.99, unit: "bag", description: "Tender baby spinach leaves, pre-washed and ready to eat.", image: images.spinach, stock: 85, featured: true },
  { name: "Russet Potatoes", slug: "russet-potatoes", category: "fruits-and-vegetables", price: 4.99, unit: "5lb bag", description: "Classic russet potatoes, perfect for baking or mashing.", image: images.potato, stock: 150 },
  { name: "Yellow Onions", slug: "yellow-onions", category: "fruits-and-vegetables", price: 2.49, unit: "3lb bag", description: "Versatile yellow onions for all your cooking needs.", image: images.onion, stock: 200 },
  { name: "English Cucumber", slug: "english-cucumber", category: "fruits-and-vegetables", price: 1.99, unit: "each", description: "Crisp seedless cucumber, perfect for salads.", image: images.cucumber, stock: 80 },
  { name: "Bell Pepper Trio", slug: "bell-pepper-trio", category: "fruits-and-vegetables", price: 4.99, unit: "pack", description: "Colorful red, yellow, and green bell peppers.", image: images.bellPepper, stock: 60 },
  { name: "Romaine Lettuce", slug: "romaine-lettuce", category: "fruits-and-vegetables", price: 2.99, unit: "head", description: "Crisp romaine lettuce hearts for salads.", image: images.lettuce, stock: 65 },
  { name: "Cremini Mushrooms", slug: "cremini-mushrooms", category: "fruits-and-vegetables", price: 3.99, unit: "8oz", description: "Flavorful cremini mushrooms for cooking.", image: images.mushroom, stock: 55 },

  // ═══════════════════════════════════════════════════════════════════════
  // DAIRY & EGGS
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Whole Milk", slug: "whole-milk", category: "dairy-and-eggs", price: 4.49, unit: "gallon", description: "Fresh whole milk from local dairy farms. Vitamin D fortified.", image: images.milk, stock: 100, featured: true },
  { name: "2% Reduced Fat Milk", slug: "reduced-fat-milk", category: "dairy-and-eggs", price: 4.29, unit: "gallon", description: "Reduced fat milk with all the taste and nutrition.", image: images.milk, stock: 90 },
  { name: "Sharp Cheddar Cheese", slug: "sharp-cheddar-cheese", category: "dairy-and-eggs", price: 5.99, unit: "8oz", description: "Aged sharp cheddar with bold, tangy flavor.", image: images.cheese, stock: 75 },
  { name: "Mozzarella Cheese", slug: "mozzarella-cheese", category: "dairy-and-eggs", price: 4.99, unit: "8oz", description: "Fresh mozzarella, perfect for pizzas and salads.", image: images.cheese, stock: 80 },
  { name: "Greek Yogurt Plain", slug: "greek-yogurt-plain", category: "dairy-and-eggs", price: 5.49, unit: "32oz", description: "Creamy Greek yogurt, high in protein.", image: images.yogurt, stock: 70, featured: true },
  { name: "Strawberry Yogurt", slug: "strawberry-yogurt", category: "dairy-and-eggs", price: 1.29, unit: "6oz", description: "Delicious strawberry flavored yogurt.", image: images.yogurt, stock: 100 },
  { name: "Unsalted Butter", slug: "unsalted-butter", category: "dairy-and-eggs", price: 4.99, unit: "lb", description: "Premium unsalted butter for baking and cooking.", image: images.butter, stock: 85 },
  { name: "Large Brown Eggs", slug: "large-brown-eggs", category: "dairy-and-eggs", price: 5.99, unit: "dozen", description: "Farm fresh large brown eggs from cage-free hens.", image: images.eggs, stock: 120, featured: true },
  { name: "Organic Free Range Eggs", slug: "organic-free-range-eggs", category: "dairy-and-eggs", price: 7.99, unit: "dozen", description: "USDA organic eggs from free-range hens.", image: images.eggs, stock: 60 },
  { name: "Heavy Whipping Cream", slug: "heavy-whipping-cream", category: "dairy-and-eggs", price: 4.49, unit: "pint", description: "Rich heavy cream for whipping or cooking.", image: images.cream, stock: 50 },
  { name: "Sour Cream", slug: "sour-cream", category: "dairy-and-eggs", price: 2.99, unit: "16oz", description: "Creamy sour cream for toppings and dips.", image: images.cream, stock: 65 },
  { name: "Cream Cheese", slug: "cream-cheese", category: "dairy-and-eggs", price: 3.49, unit: "8oz", description: "Smooth cream cheese for spreading and baking.", image: images.cheese, stock: 70 },

  // ═══════════════════════════════════════════════════════════════════════
  // BAKERY
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Artisan Sourdough Bread", slug: "artisan-sourdough-bread", category: "bakery", price: 4.99, unit: "loaf", description: "Freshly baked sourdough with crispy crust and tangy flavor.", image: images.bread, stock: 40, featured: true },
  { name: "Whole Wheat Bread", slug: "whole-wheat-bread", category: "bakery", price: 3.99, unit: "loaf", description: "Nutritious whole wheat bread, perfect for sandwiches.", image: images.bread, stock: 50 },
  { name: "French Baguette", slug: "french-baguette", category: "bakery", price: 2.99, unit: "each", description: "Classic French baguette with crispy golden crust.", image: images.bread, stock: 35 },
  { name: "Butter Croissants", slug: "butter-croissants", category: "bakery", price: 5.99, unit: "4 pack", description: "Flaky, buttery croissants baked fresh daily.", image: images.croissant, stock: 45, featured: true },
  { name: "Plain Bagels", slug: "plain-bagels", category: "bakery", price: 4.49, unit: "6 pack", description: "New York style bagels, perfect for breakfast.", image: images.bagel, stock: 55 },
  { name: "Everything Bagels", slug: "everything-bagels", category: "bakery", price: 4.99, unit: "6 pack", description: "Bagels topped with sesame, poppy, onion, and garlic.", image: images.bagel, stock: 50 },
  { name: "Blueberry Muffins", slug: "blueberry-muffins", category: "bakery", price: 5.99, unit: "4 pack", description: "Moist muffins loaded with fresh blueberries.", image: images.muffin, stock: 40 },
  { name: "Chocolate Chip Muffins", slug: "chocolate-chip-muffins", category: "bakery", price: 5.99, unit: "4 pack", description: "Soft muffins with rich chocolate chips.", image: images.muffin, stock: 40 },
  { name: "Glazed Donuts", slug: "glazed-donuts", category: "bakery", price: 6.99, unit: "6 pack", description: "Classic glazed donuts, light and sweet.", image: images.donut, stock: 30 },
  { name: "Chocolate Cake Slice", slug: "chocolate-cake-slice", category: "bakery", price: 4.99, unit: "slice", description: "Rich chocolate layer cake with chocolate frosting.", image: images.cake, stock: 25 },

  // ═══════════════════════════════════════════════════════════════════════
  // BEVERAGES
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Fresh Orange Juice", slug: "fresh-orange-juice", category: "beverages", price: 5.99, unit: "64oz", description: "100% fresh squeezed orange juice, no added sugar.", image: images.juice, stock: 60, featured: true },
  { name: "Apple Juice", slug: "apple-juice", category: "beverages", price: 4.49, unit: "64oz", description: "Pure apple juice from fresh apples.", image: images.appleJuice, stock: 70 },
  { name: "Ground Coffee Medium Roast", slug: "ground-coffee-medium", category: "beverages", price: 9.99, unit: "12oz", description: "Smooth medium roast coffee, perfect for everyday brewing.", image: images.coffee, stock: 80, featured: true },
  { name: "Coffee Beans Dark Roast", slug: "coffee-beans-dark", category: "beverages", price: 12.99, unit: "12oz", description: "Premium whole coffee beans, bold dark roast.", image: images.coffeeBeans, stock: 65 },
  { name: "Green Tea Bags", slug: "green-tea-bags", category: "beverages", price: 4.99, unit: "20 bags", description: "Premium green tea for a healthy, refreshing drink.", image: images.tea, stock: 90 },
  { name: "Herbal Tea Collection", slug: "herbal-tea-collection", category: "beverages", price: 6.49, unit: "variety pack", description: "Assorted herbal teas including chamomile, peppermint, and ginger.", image: images.herbalTea, stock: 55 },
  { name: "Spring Water", slug: "spring-water", category: "beverages", price: 4.99, unit: "24 pack", description: "Pure natural spring water in convenient bottles.", image: images.water, stock: 150 },
  { name: "Sparkling Water Variety", slug: "sparkling-water-variety", category: "beverages", price: 5.99, unit: "12 pack", description: "Refreshing sparkling water in assorted flavors.", image: images.sparklingWater, stock: 80 },
  { name: "Cola Soft Drink", slug: "cola-soft-drink", category: "beverages", price: 6.99, unit: "12 pack", description: "Classic cola soft drink.", image: images.soda, stock: 100 },
  { name: "Mixed Berry Smoothie", slug: "berry-smoothie", category: "beverages", price: 4.99, unit: "15oz", description: "Fresh berry smoothie with yogurt and honey.", image: images.smoothie, stock: 35 },

  // ═══════════════════════════════════════════════════════════════════════
  // PANTRY ESSENTIALS
  // ═══════════════════════════════════════════════════════════════════════
  { name: "Jasmine Rice", slug: "jasmine-rice", category: "pantry-essentials", price: 8.99, unit: "5lb", description: "Fragrant long-grain jasmine rice from Thailand.", image: images.rice, stock: 100, featured: true },
  { name: "Brown Rice", slug: "brown-rice", category: "pantry-essentials", price: 6.99, unit: "2lb", description: "Nutritious whole grain brown rice.", image: images.brownRice, stock: 80 },
  { name: "Spaghetti Pasta", slug: "spaghetti-pasta", category: "pantry-essentials", price: 2.49, unit: "16oz", description: "Classic Italian spaghetti pasta.", image: images.spaghetti, stock: 120 },
  { name: "Penne Pasta", slug: "penne-pasta", category: "pantry-essentials", price: 2.49, unit: "16oz", description: "Tube-shaped penne pasta for chunky sauces.", image: images.pasta, stock: 100 },
  { name: "Granola", slug: "granola", category: "pantry-essentials", price: 5.99, unit: "12oz", description: "Crunchy granola with oats, nuts, and honey.", image: images.granola, stock: 90 },
  { name: "Corn Flakes", slug: "corn-flakes", category: "pantry-essentials", price: 3.99, unit: "18oz", description: "Classic crispy corn flakes breakfast cereal.", image: images.cereal, stock: 85 },
  { name: "Extra Virgin Olive Oil", slug: "extra-virgin-olive-oil", category: "pantry-essentials", price: 11.99, unit: "500ml", description: "Premium cold-pressed extra virgin olive oil.", image: images.oil, stock: 70, featured: true },
  { name: "Pure Honey", slug: "pure-honey", category: "pantry-essentials", price: 8.99, unit: "16oz", description: "Raw, unfiltered pure honey from local bees.", image: images.honey, stock: 55 },
  { name: "Marinara Sauce", slug: "marinara-sauce", category: "pantry-essentials", price: 4.49, unit: "24oz", description: "Classic Italian marinara sauce with herbs.", image: images.sauce, stock: 75 },
  { name: "Mixed Spices Set", slug: "mixed-spices-set", category: "pantry-essentials", price: 12.99, unit: "set", description: "Essential cooking spices including cumin, paprika, oregano.", image: images.spices, stock: 45 },
  { name: "Roasted Almonds", slug: "roasted-almonds", category: "pantry-essentials", price: 8.99, unit: "12oz", description: "Premium lightly salted roasted almonds.", image: images.almonds, stock: 60 },
  { name: "Peanut Butter", slug: "peanut-butter", category: "pantry-essentials", price: 5.99, unit: "16oz", description: "Creamy natural peanut butter, no added sugar.", image: images.peanutButter, stock: 75 },
  { name: "Strawberry Jam", slug: "strawberry-jam", category: "pantry-essentials", price: 4.99, unit: "18oz", description: "Sweet strawberry jam made with real fruit.", image: images.jam, stock: 65 },
  { name: "All-Purpose Flour", slug: "all-purpose-flour", category: "pantry-essentials", price: 3.99, unit: "5lb", description: "Unbleached all-purpose flour for baking.", image: images.flour, stock: 90 },
  { name: "Granulated Sugar", slug: "granulated-sugar", category: "pantry-essentials", price: 2.99, unit: "4lb", description: "Pure cane granulated white sugar.", image: images.sugar, stock: 100 },
  { name: "Potato Chips Classic", slug: "potato-chips-classic", category: "pantry-essentials", price: 3.99, unit: "10oz", description: "Crispy classic salted potato chips.", image: images.chips, stock: 100 },
  { name: "Dark Chocolate Bar", slug: "dark-chocolate-bar", category: "pantry-essentials", price: 3.99, unit: "3.5oz", description: "Rich 70% dark chocolate bar.", image: images.chocolate, stock: 70 },
];

const seedGroceryStore = async () => {
  try {
    // Connect to database
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    logger.info("Connected to MongoDB");

    // Find FreshMart store
    const store = await Tenant.findOne({ slug: "fresh-mart" });
    if (!store) {
      throw new Error("FreshMart store not found! Please run the main seed first.");
    }
    logger.info(`Found store: ${store.name} (${store._id})`);

    // Get categories
    const categories = await Category.find({ tenant: store._id });
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });
    logger.info(`Found ${categories.length} categories`);

    // Delete existing products (optional - comment out to add to existing)
    await Product.deleteMany({ tenant: store._id });
    logger.info("Cleared existing products");

    // Create products
    let created = 0;
    for (const product of groceryProducts) {
      const categoryId = categoryMap[product.category];
      if (!categoryId) {
        logger.warn(`Category not found: ${product.category}`);
        continue;
      }

      await Product.create({
        tenant: store._id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.description.substring(0, 100),
        category: categoryId,
        brand: "FreshMart",
        images: [
          {
            url: product.image,
            alt: product.name,
            isPrimary: true,
            displayOrder: 0,
          },
        ],
        pricing: {
          basePrice: product.price,
          salePrice: product.sale ? product.price * 0.85 : null,
          costPrice: product.price * 0.6,
          currency: "USD",
        },
        inventory: {
          sku: `FM-${product.slug.toUpperCase().replace(/-/g, "").substring(0, 8)}`,
          quantity: product.stock,
          lowStockThreshold: 10,
          trackInventory: true,
          allowBackorder: false,
        },
        attributes: {
          unit: product.unit,
        },
        isFeatured: product.featured || false,
        isNewArrival: Math.random() > 0.7,
        isBestSeller: Math.random() > 0.8,
        status: "active",
        visibility: "visible",
      });
      created++;
    }

    logger.info(`✅ Created ${created} products for FreshMart Grocery`);

    // Verify
    const count = await Product.countDocuments({ tenant: store._id });
    logger.info(`Total products in store: ${count}`);

    await mongoose.disconnect();
    logger.info("Database disconnected");
    process.exit(0);
  } catch (error) {
    logger.error("Seed failed:", error);
    process.exit(1);
  }
};

seedGroceryStore();
