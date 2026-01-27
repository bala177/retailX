# RetailX - Multi-Tenant eCommerce Platform

RetailX is a powerful, multi-tenant, white-label eCommerce platform built to create and manage multiple online stores from a single codebase. It enables businesses to quickly launch their own branded online shops for various product categories (clothing, grocery, cosmetics, electronics, and more) with comprehensive product management, order processing, and payment capabilities.

## 🚀 Features

### Multi-Tenancy
- **Tenant Isolation**: Each store operates independently with complete data isolation
- **Flexible Identification**: Support for subdomains, custom domains, and API headers
- **White-Label Ready**: Customizable branding (logo, colors, themes) per tenant
- **Multiple Categories**: Support for clothing, grocery, cosmetics, electronics, and general stores

### Product Management
- **Complete CRUD Operations**: Create, read, update, and delete products
- **Rich Product Data**: SKU, pricing, images, categories, and attributes
- **Inventory Tracking**: Real-time stock management with low-stock alerts
- **Product Variants**: Support for different sizes, colors, and options
- **Advanced Search**: Filter by category, status, tags, and keywords

### Order Management
- **Shopping Cart**: Full checkout process with cart management
- **Order Processing**: Complete order lifecycle from creation to delivery
- **Payment Integration**: Support for multiple payment methods (Stripe, PayPal, Cash on Delivery)
- **Order Tracking**: Real-time status updates and order history
- **Analytics**: Order statistics, revenue tracking, and insights

### Payment Processing
- **Multiple Gateways**: Stripe, PayPal integration ready
- **Transaction Logging**: Complete payment history and tracking
- **Secure Processing**: Industry-standard payment security

## 📋 Prerequisites

- Node.js 16+ and npm
- MongoDB 4.4+
- TypeScript 4.5+

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bala177/retailX.git
   cd retailX
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/retailx
   JWT_SECRET=your_secure_jwt_secret
   NODE_ENV=development
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🏃 Usage

### Starting the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Tenant Management

#### Create a New Tenant (Store)
```bash
POST /api/tenants
Content-Type: application/json

{
  "name": "Fashion Store",
  "subdomain": "fashion",
  "domain": "fashion-store.com",
  "category": "clothing",
  "contactEmail": "contact@fashion-store.com",
  "contactPhone": "+1234567890",
  "primaryColor": "#FF6B6B",
  "secondaryColor": "#4ECDC4",
  "description": "Your one-stop shop for trendy fashion"
}
```

#### List All Tenants
```bash
GET /api/tenants?status=active&category=clothing&page=1&limit=10
```

#### Get Tenant Details
```bash
GET /api/tenants/:id
```

#### Update Tenant
```bash
PUT /api/tenants/:id
Content-Type: application/json

{
  "name": "Updated Fashion Store",
  "primaryColor": "#000000"
}
```

### Product Management

All product endpoints require tenant identification via:
- Header: `X-Tenant-ID: <tenant_id>`
- OR Subdomain: `fashion.retailx.com`
- OR Custom domain: `fashion-store.com`

#### Create a Product
```bash
POST /api/products
X-Tenant-ID: <tenant_id>
Content-Type: application/json

{
  "name": "Premium Cotton T-Shirt",
  "description": "High-quality cotton t-shirt",
  "sku": "TSHIRT-001",
  "price": 29.99,
  "compareAtPrice": 39.99,
  "category": "Clothing",
  "subcategory": "T-Shirts",
  "images": ["https://example.com/image1.jpg"],
  "inventory": {
    "quantity": 100,
    "lowStockThreshold": 10,
    "trackInventory": true
  },
  "tags": ["cotton", "casual", "summer"],
  "status": "active",
  "featured": true
}
```

#### List Products
```bash
GET /api/products?category=Clothing&status=active&featured=true&search=shirt&page=1&limit=20
X-Tenant-ID: <tenant_id>
```

#### Get Product by ID
```bash
GET /api/products/:id
X-Tenant-ID: <tenant_id>
```

#### Update Product
```bash
PUT /api/products/:id
X-Tenant-ID: <tenant_id>
Content-Type: application/json

{
  "price": 24.99,
  "inventory": {
    "quantity": 80
  }
}
```

#### Get Products by Category
```bash
GET /api/products/categories
X-Tenant-ID: <tenant_id>
```

### Order Management

#### Create an Order
```bash
POST /api/orders
X-Tenant-ID: <tenant_id>
Content-Type: application/json

{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "items": [
    {
      "productId": "product_id_here",
      "quantity": 2,
      "variant": "Large/Blue"
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  },
  "paymentMethod": "stripe"
}
```

#### List Orders
```bash
GET /api/orders?orderStatus=pending&paymentStatus=paid&page=1&limit=20
X-Tenant-ID: <tenant_id>
```

#### Get Order by ID
```bash
GET /api/orders/:id
X-Tenant-ID: <tenant_id>
```

#### Update Order Status
```bash
PUT /api/orders/:id/status
X-Tenant-ID: <tenant_id>
Content-Type: application/json

{
  "orderStatus": "shipped",
  "paymentStatus": "paid"
}
```

#### Get Order Statistics
```bash
GET /api/orders/stats
X-Tenant-ID: <tenant_id>
```

## 🏗️ Architecture

### Multi-Tenant Architecture
RetailX implements tenant isolation at the application level:
- Each request is tagged with a tenant identifier
- Database queries are automatically scoped to the tenant
- Tenant middleware validates and attaches tenant context to requests

### Data Models

#### Tenant
- Store configuration and branding
- Contact information
- Payment gateway settings
- Domain/subdomain mapping

#### Product
- Product catalog with variants
- Inventory management
- Category organization
- Rich media support

#### Order
- Complete order information
- Customer details
- Payment and shipping information
- Order lifecycle tracking

### Technology Stack
- **Backend**: Node.js + Express + TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (ready for implementation)
- **Payment**: Stripe/PayPal integration structure

## 🔒 Security Considerations

- Input validation on all endpoints
- Tenant data isolation enforced at database level
- Secure payment processing structure
- Environment-based configuration
- Prepared for JWT authentication implementation

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📦 Project Structure

```
retailX/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.ts  # MongoDB connection
│   ├── models/          # Database models
│   │   ├── Tenant.ts    # Tenant/Store model
│   │   ├── Product.ts   # Product model
│   │   └── Order.ts     # Order model
│   ├── controllers/     # Request handlers
│   │   ├── tenantController.ts
│   │   ├── productController.ts
│   │   └── orderController.ts
│   ├── routes/          # API routes
│   │   ├── tenantRoutes.ts
│   │   ├── productRoutes.ts
│   │   └── orderRoutes.ts
│   ├── middleware/      # Custom middleware
│   │   └── tenant.ts    # Tenant identification
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── dist/                # Compiled JavaScript
├── node_modules/        # Dependencies
├── .env.example         # Environment template
├── .gitignore          # Git ignore rules
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
└── README.md           # Documentation
```

## 🚀 Deployment

### Production Checklist
- [ ] Set strong JWT_SECRET in production
- [ ] Configure production MongoDB instance
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Configure payment gateway credentials
- [ ] Set up domain/subdomain routing
- [ ] Configure CORS for production domains
- [ ] Set up monitoring and logging

### Environment Variables
```env
PORT=3000
MONGODB_URI=mongodb://your-production-db/retailx
JWT_SECRET=your-very-strong-secret-key
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

ISC

## 🆘 Support

For issues and questions:
- Create an issue on GitHub
- Contact: support@retailx.com

## 🎯 Roadmap

- [ ] User authentication and authorization
- [ ] Admin dashboard UI
- [ ] Customer-facing storefront
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Multi-currency support
- [ ] Shipping integration
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Coupon and discount system

---

Built with ❤️ for multi-tenant eCommerce excellence