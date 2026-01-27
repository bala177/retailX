import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tenant from './models/Tenant';
import Product from './models/Product';
import Order from './models/Order';

dotenv.config();

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/retailx';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Tenant.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data');

    // Create sample tenants
    const tenants = await Tenant.insertMany([
      {
        name: 'Fashion Forward',
        subdomain: 'fashion',
        domain: 'fashion-forward.com',
        category: 'clothing',
        contactEmail: 'contact@fashion-forward.com',
        contactPhone: '+1-555-0101',
        primaryColor: '#FF6B6B',
        secondaryColor: '#4ECDC4',
        description: 'Your destination for trendy fashion and accessories',
        status: 'active',
        address: {
          street: '123 Fashion Ave',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          zipCode: '10001',
        },
      },
      {
        name: 'Fresh Grocers',
        subdomain: 'grocery',
        domain: 'fresh-grocers.com',
        category: 'grocery',
        contactEmail: 'support@fresh-grocers.com',
        contactPhone: '+1-555-0102',
        primaryColor: '#00C853',
        secondaryColor: '#FF6D00',
        description: 'Farm-fresh groceries delivered to your door',
        status: 'active',
        address: {
          street: '456 Market St',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          zipCode: '94102',
        },
      },
      {
        name: 'Beauty Bliss',
        subdomain: 'beauty',
        domain: 'beauty-bliss.com',
        category: 'cosmetics',
        contactEmail: 'hello@beauty-bliss.com',
        contactPhone: '+1-555-0103',
        primaryColor: '#E91E63',
        secondaryColor: '#9C27B0',
        description: 'Premium cosmetics and beauty products',
        status: 'active',
        address: {
          street: '789 Beauty Blvd',
          city: 'Los Angeles',
          state: 'CA',
          country: 'USA',
          zipCode: '90001',
        },
      },
      {
        name: 'Tech Haven',
        subdomain: 'tech',
        domain: 'tech-haven.com',
        category: 'electronics',
        contactEmail: 'info@tech-haven.com',
        contactPhone: '+1-555-0104',
        primaryColor: '#2196F3',
        secondaryColor: '#FF9800',
        description: 'Latest electronics and gadgets',
        status: 'active',
        address: {
          street: '321 Tech Park',
          city: 'Austin',
          state: 'TX',
          country: 'USA',
          zipCode: '73301',
        },
      },
    ]);

    console.log(`Created ${tenants.length} tenants`);

    // Create sample products for Fashion Forward
    const fashionProducts = await Product.insertMany([
      {
        tenantId: tenants[0]._id,
        name: 'Classic Cotton T-Shirt',
        description: 'Comfortable 100% cotton t-shirt perfect for everyday wear',
        sku: 'FASHION-TSH-001',
        price: 24.99,
        compareAtPrice: 34.99,
        category: 'Clothing',
        subcategory: 'T-Shirts',
        images: ['https://example.com/tshirt1.jpg'],
        inventory: {
          quantity: 150,
          lowStockThreshold: 20,
          trackInventory: true,
        },
        tags: ['cotton', 'casual', 'basic'],
        status: 'active',
        featured: true,
      },
      {
        tenantId: tenants[0]._id,
        name: 'Slim Fit Jeans',
        description: 'Modern slim fit jeans with stretch comfort',
        sku: 'FASHION-JEAN-001',
        price: 69.99,
        compareAtPrice: 89.99,
        category: 'Clothing',
        subcategory: 'Jeans',
        images: ['https://example.com/jeans1.jpg'],
        inventory: {
          quantity: 80,
          lowStockThreshold: 15,
          trackInventory: true,
        },
        tags: ['denim', 'slim-fit', 'casual'],
        status: 'active',
        featured: false,
      },
    ]);

    // Create sample products for Fresh Grocers
    const groceryProducts = await Product.insertMany([
      {
        tenantId: tenants[1]._id,
        name: 'Organic Apples',
        description: 'Fresh organic apples, 1 lb bag',
        sku: 'GROCERY-FRUIT-001',
        price: 4.99,
        category: 'Fruits',
        subcategory: 'Fresh Fruits',
        images: ['https://example.com/apples.jpg'],
        inventory: {
          quantity: 200,
          lowStockThreshold: 30,
          trackInventory: true,
        },
        tags: ['organic', 'fresh', 'fruit'],
        status: 'active',
        featured: true,
      },
      {
        tenantId: tenants[1]._id,
        name: 'Whole Wheat Bread',
        description: 'Artisan whole wheat bread loaf',
        sku: 'GROCERY-BREAD-001',
        price: 3.99,
        category: 'Bakery',
        subcategory: 'Bread',
        images: ['https://example.com/bread.jpg'],
        inventory: {
          quantity: 50,
          lowStockThreshold: 10,
          trackInventory: true,
        },
        tags: ['whole-wheat', 'bakery', 'fresh'],
        status: 'active',
        featured: false,
      },
    ]);

    // Create sample products for Beauty Bliss
    const beautyProducts = await Product.insertMany([
      {
        tenantId: tenants[2]._id,
        name: 'Luxury Face Cream',
        description: 'Anti-aging face cream with vitamin C',
        sku: 'BEAUTY-SKIN-001',
        price: 49.99,
        compareAtPrice: 69.99,
        category: 'Skincare',
        subcategory: 'Face Care',
        images: ['https://example.com/facecream.jpg'],
        inventory: {
          quantity: 100,
          lowStockThreshold: 20,
          trackInventory: true,
        },
        tags: ['skincare', 'anti-aging', 'vitamin-c'],
        status: 'active',
        featured: true,
      },
    ]);

    // Create sample products for Tech Haven
    const techProducts = await Product.insertMany([
      {
        tenantId: tenants[3]._id,
        name: 'Wireless Earbuds Pro',
        description: 'Premium wireless earbuds with noise cancellation',
        sku: 'TECH-AUDIO-001',
        price: 149.99,
        compareAtPrice: 199.99,
        category: 'Audio',
        subcategory: 'Earbuds',
        images: ['https://example.com/earbuds.jpg'],
        inventory: {
          quantity: 75,
          lowStockThreshold: 10,
          trackInventory: true,
        },
        tags: ['wireless', 'audio', 'noise-cancelling'],
        status: 'active',
        featured: true,
      },
    ]);

    console.log('Created sample products for all tenants');

    // Create a sample order for Fashion Forward
    const sampleOrder = await Order.create({
      tenantId: tenants[0]._id,
      orderNumber: `ORD-${Date.now()}-SAMPLE001`,
      customer: {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-9999',
      },
      items: [
        {
          productId: fashionProducts[0]._id,
          productName: fashionProducts[0].name,
          sku: fashionProducts[0].sku,
          quantity: 2,
          price: fashionProducts[0].price,
        },
      ],
      subtotal: 49.98,
      tax: 4.00,
      shipping: 0,
      total: 53.98,
      shippingAddress: {
        street: '123 Customer Lane',
        city: 'Boston',
        state: 'MA',
        country: 'USA',
        zipCode: '02101',
      },
      paymentMethod: 'credit_card',
      paymentStatus: 'paid',
      orderStatus: 'processing',
    });

    console.log('Created sample order');

    console.log('\n✅ Seed data created successfully!');
    console.log('\nSample Tenants:');
    tenants.forEach((tenant) => {
      console.log(`  - ${tenant.name} (subdomain: ${tenant.subdomain})`);
    });

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
