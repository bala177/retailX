# RetailX - Multi-Tenant eCommerce Platform

<p align="center">
  <img src="docs/logo.png" alt="RetailX Logo" width="200"/>
</p>

<p align="center">
  <strong>A powerful, scalable, and secure multi-tenant eCommerce platform</strong>
</p>

<p align="center">
  One system powering many independent online stores
</p>

---

## 🌟 Features

### Multi-Tenant Architecture

- **Complete Tenant Isolation**: Each store's data is completely separated
- **Custom Branding**: Each tenant can customize colors, logos, and fonts
- **Domain Support**: Subdomain, path-based, or custom domain routing
- **Feature Toggles**: Enable/disable features per tenant

### Industry Support

- 👔 **Fashion & Apparel**: Sizes, colors, materials, care instructions
- 🛒 **Grocery**: Nutrition facts, expiry dates, storage instructions
- 💻 **Electronics**: Specifications, warranty, model numbers
- 💄 **Cosmetics**: Ingredients, skin types, usage instructions
- 📚 **Stationery**: Paper types, dimensions, bundle options

### Product Management

- Flexible product variants (size, color, storage, etc.)
- Rich product attributes per industry
- Image gallery with primary/secondary images
- Inventory tracking with low-stock alerts
- SKU management
- Pricing with sale prices and cost tracking
- SEO-friendly slugs and metadata

### User & Role System

- **Platform Owner**: Manages all tenants and system settings
- **Store Owner**: Full control over their store
- **Store Staff**: Limited admin access
- **Customer**: Shopping and order management

### Security (OWASP Best Practices)

- 🔐 JWT-based authentication with refresh tokens
- 🛡️ Rate limiting on all endpoints
- 🔒 Password hashing with bcrypt
- 🧹 Input sanitization (XSS, NoSQL injection)
- 📝 Request ID tracking for audit trails
- 🚫 HTTP security headers (Helmet)
- ⚠️ Parameter pollution prevention

### Order Management

- Full order lifecycle tracking
- Multiple payment status support
- Shipping with multiple methods
- Order history and status timeline

### Shopping Cart

- Persistent cart for authenticated users
- Session-based cart for guests
- Cart merging on login
- Discount code support

---

## 🏗️ Project Structure

```
RetailX/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   │   ├── index.js       # Central config export
│   │   │   └── database.js    # MongoDB connection
│   │   ├── controllers/       # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── cartController.js
│   │   │   ├── categoryController.js
│   │   │   ├── orderController.js
│   │   │   ├── productController.js
│   │   │   └── tenantController.js
│   │   ├── middleware/        # Express middleware
│   │   │   ├── auth.js        # JWT authentication
│   │   │   ├── error.js       # Error handling
│   │   │   ├── security.js    # Security middleware
│   │   │   ├── tenant.js      # Tenant resolution
│   │   │   └── validators.js  # Request validation
│   │   ├── models/            # Mongoose models
│   │   │   ├── Cart.js
│   │   │   ├── Category.js
│   │   │   ├── Order.js
│   │   │   ├── Product.js
│   │   │   ├── Tenant.js
│   │   │   └── User.js
│   │   ├── routes/            # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── platformRoutes.js
│   │   │   └── storeRoutes.js
│   │   ├── seeds/             # Database seeders
│   │   │   └── index.js
│   │   ├── utils/             # Utility functions
│   │   │   ├── errors.js      # Custom error classes
│   │   │   ├── helpers.js     # Helper functions
│   │   │   └── logger.js      # Winston logger
│   │   ├── app.js             # Express application
│   │   └── server.js          # Server entry point
│   ├── .env.example           # Environment template
│   └── package.json
├── admin/                      # React Admin Panel (Coming Soon)
├── storefront/                 # React Storefront (Coming Soon)
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **MongoDB** >= 6.0
- **npm** or **yarn**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/retailx.git
   cd retailx
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your values:

   ```env
   # Server
   NODE_ENV=development
   PORT=5000

   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/retailx

   # JWT
   JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
   JWT_ACCESS_EXPIRY=15m
   JWT_REFRESH_EXPIRY=7d

   # Platform Owner (for seeding)
   PLATFORM_OWNER_EMAIL=admin@retailx.com
   PLATFORM_OWNER_PASSWORD=Admin@123456
   ```

4. **Start MongoDB** (if not running)

   ```bash
   # macOS with Homebrew
   brew services start mongodb-community

   # Linux
   sudo systemctl start mongod

   # Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Seed the database**

   ```bash
   npm run seed
   ```

   This creates:
   - Platform owner account
   - 3 demo stores (Fashion, Electronics, Cosmetics)
   - Store owners for each store
   - Sample categories and products
   - Demo customer account

6. **Start the development server**

   ```bash
   npm run dev
   ```

   The API will be available at `http://localhost:5000`

---

## 🔐 Demo Accounts

After seeding the database, you can use these accounts to log in:

### Super Admin (Platform Owner)

| Role            | Email                    | Password            |
| --------------- | ------------------------ | ------------------- |
| **Super Admin** | `superadmin@retailx.com` | `SuperAdmin@123456` |

> ⚡ The Super Admin has full platform access: manage all stores, users, and system settings.

### Store Owners

| Store               | Email                    | Password       |
| ------------------- | ------------------------ | -------------- |
| Urban Fashion       | `owner@urbanfashion.com` | `Owner@123456` |
| Tranquil Spa        | `owner@tranquilspa.com`  | `Owner@123456` |
| Glow Beauty         | `owner@glowbeauty.com`   | `Owner@123456` |
| Healthy Feet Clinic | `owner@healthyfeet.com`  | `Owner@123456` |
| Glamour Hair Studio | `owner@glamourhair.com`  | `Owner@123456` |
| FreshMart Grocery   | `owner@freshmart.com`    | `Owner@123456` |

### Access URLs

| Application | URL                   |
| ----------- | --------------------- |
| Admin Panel | http://localhost:5001 |
| Storefront  | http://localhost:5002 |
| Backend API | http://localhost:5000 |

---

## 📡 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication

#### Register

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "..." },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    }
  }
}
```

#### Refresh Token

```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJ..."
}
```

### Tenant Resolution

The platform supports multiple ways to identify the tenant:

1. **Path-based** (default): `/api/v1/store/:tenantSlug/...`

   ```
   GET /api/v1/store/urban-fashion/products
   ```

2. **Subdomain**: `urban-fashion.retailx.com/api/v1/...`

3. **Header**: `X-Tenant-ID: urban-fashion`

### Platform Routes (Platform Owner Only)

```http
# List all tenants
GET /api/v1/platform/tenants
Authorization: Bearer <token>

# Create tenant
POST /api/v1/platform/tenants
Authorization: Bearer <token>

# Get tenant details
GET /api/v1/platform/tenants/:id
Authorization: Bearer <token>

# Update tenant
PATCH /api/v1/platform/tenants/:id
Authorization: Bearer <token>

# Delete tenant
DELETE /api/v1/platform/tenants/:id
Authorization: Bearer <token>
```

### Store Routes

#### Products

```http
# List products
GET /api/v1/store/:tenantSlug/products
GET /api/v1/store/:tenantSlug/products?category=men&minPrice=10&maxPrice=100&sort=-createdAt

# Get product
GET /api/v1/store/:tenantSlug/products/:id

# Create product (Store Owner/Staff)
POST /api/v1/store/:tenantSlug/products
Authorization: Bearer <token>

# Update product (Store Owner/Staff)
PATCH /api/v1/store/:tenantSlug/products/:id
Authorization: Bearer <token>

# Delete product (Store Owner/Staff)
DELETE /api/v1/store/:tenantSlug/products/:id
Authorization: Bearer <token>
```

#### Categories

```http
GET /api/v1/store/:tenantSlug/categories
GET /api/v1/store/:tenantSlug/categories/:id
POST /api/v1/store/:tenantSlug/categories
PATCH /api/v1/store/:tenantSlug/categories/:id
DELETE /api/v1/store/:tenantSlug/categories/:id
```

#### Cart

```http
GET /api/v1/store/:tenantSlug/cart
POST /api/v1/store/:tenantSlug/cart/items
PATCH /api/v1/store/:tenantSlug/cart/items/:productId
DELETE /api/v1/store/:tenantSlug/cart/items/:productId
DELETE /api/v1/store/:tenantSlug/cart
```

#### Orders

```http
GET /api/v1/store/:tenantSlug/orders
GET /api/v1/store/:tenantSlug/orders/:id
POST /api/v1/store/:tenantSlug/orders
PATCH /api/v1/store/:tenantSlug/orders/:id/status
```

---

## 🔑 Demo Accounts

After seeding, use these credentials:

| Role                    | Email                  | Password     |
| ----------------------- | ---------------------- | ------------ |
| Platform Owner          | admin@retailx.com      | Admin@123456 |
| Fashion Store Owner     | owner@urbanfashion.com | Owner@123456 |
| Electronics Store Owner | owner@techhub.com      | Owner@123456 |
| Cosmetics Store Owner   | owner@glowbeauty.com   | Owner@123456 |
| Demo Customer           | customer@demo.com      | Customer@123 |

## 🏪 Demo Stores

| Store               | Slug          | Industry    |
| ------------------- | ------------- | ----------- |
| Urban Fashion Co.   | urban-fashion | Fashion     |
| TechHub Electronics | techhub       | Electronics |
| Glow Beauty         | glow-beauty   | Cosmetics   |

---

## 🛡️ Security Features

### Rate Limiting

- **Authentication endpoints**: 5 requests/15 minutes
- **API endpoints**: 100 requests/15 minutes
- **Heavy operations**: 10 requests/minute

### Input Validation & Sanitization

- Express-validator for all inputs
- MongoDB query sanitization
- XSS attack prevention
- HTTP Parameter Pollution prevention

### Authentication

- JWT with short-lived access tokens (15 min)
- Refresh tokens for session management
- Password complexity requirements
- Secure password hashing (bcrypt, 12 rounds)

### Security Headers (Helmet)

- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Content-Security-Policy
- And more...

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=auth
```

---

## 📝 Environment Variables

| Variable                  | Description               | Default           |
| ------------------------- | ------------------------- | ----------------- |
| `NODE_ENV`                | Environment               | development       |
| `PORT`                    | Server port               | 5000              |
| `MONGODB_URI`             | MongoDB connection string | -                 |
| `JWT_ACCESS_SECRET`       | Access token secret       | -                 |
| `JWT_REFRESH_SECRET`      | Refresh token secret      | -                 |
| `JWT_ACCESS_EXPIRY`       | Access token expiry       | 15m               |
| `JWT_REFRESH_EXPIRY`      | Refresh token expiry      | 7d                |
| `PLATFORM_OWNER_EMAIL`    | Platform admin email      | admin@retailx.com |
| `PLATFORM_OWNER_PASSWORD` | Platform admin password   | Admin@123456      |
| `SMTP_HOST`               | Email server host         | -                 |
| `SMTP_PORT`               | Email server port         | 587               |
| `SMTP_USER`               | Email username            | -                 |
| `SMTP_PASS`               | Email password            | -                 |
| `AWS_ACCESS_KEY_ID`       | AWS access key            | -                 |
| `AWS_SECRET_ACCESS_KEY`   | AWS secret key            | -                 |
| `AWS_S3_BUCKET`           | S3 bucket name            | -                 |
| `STRIPE_SECRET_KEY`       | Stripe API key            | -                 |

---

## 🔮 Roadmap

### Phase 1 - Backend API ✅

- [x] Multi-tenant architecture
- [x] User authentication & authorization
- [x] Product management with variants
- [x] Category management with hierarchy
- [x] Shopping cart
- [x] Order management
- [x] Security middleware

### Phase 2 - Admin Panel 🚧

- [ ] Dashboard with analytics
- [ ] Product management UI
- [ ] Category management UI
- [ ] Order management UI
- [ ] Customer management
- [ ] Store settings

### Phase 3 - Storefront 🚧

- [ ] Product listing & filtering
- [ ] Product detail page
- [ ] Shopping cart UI
- [ ] Checkout flow
- [ ] User account management
- [ ] Order history

### Phase 4 - Advanced Features 📅

- [ ] Payment gateway integration (Stripe)
- [ ] Email notifications
- [ ] Image upload to S3
- [ ] Search with Elasticsearch
- [ ] Inventory management
- [ ] Reporting & analytics
- [ ] Mobile app (React Native)

---

## 🚀 Deploy to Render

### One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/bala177/retailX)

### Manual Deployment

#### Prerequisites

1. **MongoDB Atlas Account** - Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. **Render Account** - Sign up at [render.com](https://render.com)

#### Step 1: Set up MongoDB Atlas

1. Create a new cluster (free tier available)
2. Create a database user with read/write access
3. Whitelist `0.0.0.0/0` for Render access
4. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/retailx`

#### Step 2: Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Blueprint**
3. Connect your GitHub repo: `https://github.com/bala177/retailX`
4. Render will detect `render.yaml` and create all services

#### Step 3: Configure Environment Variables

In Render Dashboard, set these for `retailx-api`:
| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Auto-generated by Render |
| `CORS_ORIGIN` | `https://retailx-admin.onrender.com,https://retailx-storefront.onrender.com` |

#### Step 4: Seed the Database

After deployment, run in Render Shell:

```bash
npm run seed
```

### Your URLs (after deployment)

| Service        | URL                                       |
| -------------- | ----------------------------------------- |
| **API**        | `https://retailx-api.onrender.com`        |
| **Admin**      | `https://retailx-admin.onrender.com`      |
| **Storefront** | `https://retailx-storefront.onrender.com` |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Express.js team
- Mongoose team
- All the open-source contributors

---

<p align="center">
  Built with ❤️ by the RetailX Team
</p>
