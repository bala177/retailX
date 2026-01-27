# RetailX Architecture Documentation

## System Overview

RetailX is a multi-tenant, white-label eCommerce platform that enables businesses to create and manage multiple online stores from a single codebase. The system is designed with tenant isolation, scalability, and flexibility in mind.

## Architecture Principles

### 1. Multi-Tenancy Model
RetailX uses a **shared database, shared schema** multi-tenancy approach with application-level tenant isolation:

- **Single Database**: All tenants share the same MongoDB database
- **Tenant Discrimination**: Each document includes a `tenantId` field to identify ownership
- **Query-Level Isolation**: All queries are automatically scoped to the current tenant
- **Performance**: Better resource utilization compared to database-per-tenant approach
- **Scalability**: Easy to scale horizontally as business grows

### 2. Request Flow

```
Client Request
    ↓
Express Middleware Stack
    ↓
Tenant Identification Middleware
    ├─ Check X-Tenant-ID header
    ├─ Parse subdomain from host
    └─ Check custom domain mapping
    ↓
Tenant Context Attached to Request
    ↓
Route Handler (Controller)
    ↓
Database Query (filtered by tenantId)
    ↓
Response to Client
```

## Core Components

### 1. Data Models

#### Tenant Model
**Purpose**: Represents an individual store/business using the platform

**Key Features**:
- Unique subdomain and custom domain support
- White-label branding (colors, logo, description)
- Category classification (clothing, grocery, cosmetics, electronics, general)
- Contact information and address
- Payment gateway configuration
- Status management (active, inactive, suspended)

**Schema Design**:
```typescript
{
  name: String,              // Store name
  subdomain: String,         // Unique subdomain (e.g., 'fashion')
  domain: String,            // Custom domain (e.g., 'fashion-store.com')
  logo: String,              // Logo URL
  primaryColor: String,      // Brand primary color
  secondaryColor: String,    // Brand secondary color
  category: Enum,            // Store category
  status: Enum,              // Active status
  contactEmail: String,      // Contact information
  paymentConfig: Object,     // Payment gateway settings
  timestamps: true
}
```

**Indexes**:
- `subdomain` (unique)
- `domain` (unique, sparse)

#### Product Model
**Purpose**: Stores product catalog information for each tenant

**Key Features**:
- Complete product information (name, description, SKU, pricing)
- Multi-image support
- Category and subcategory organization
- Inventory tracking with low-stock alerts
- Product variants support
- Tag-based search
- Featured products
- Status management (active, draft, archived)

**Schema Design**:
```typescript
{
  tenantId: ObjectId,           // Owner tenant reference
  name: String,                 // Product name
  description: String,          // Full description
  sku: String,                  // Stock Keeping Unit
  price: Number,                // Current price
  compareAtPrice: Number,       // Original/compare price
  category: String,             // Main category
  subcategory: String,          // Sub-category
  images: [String],             // Array of image URLs
  inventory: {
    quantity: Number,           // Available stock
    lowStockThreshold: Number,  // Alert threshold
    trackInventory: Boolean     // Enable/disable tracking
  },
  variants: [Object],           // Product variants
  tags: [String],               // Search tags
  status: Enum,                 // Product status
  featured: Boolean,            // Featured flag
  timestamps: true
}
```

**Indexes**:
- `tenantId + status` (compound)
- `tenantId + category` (compound)
- `tenantId + sku` (compound, unique)

#### Order Model
**Purpose**: Manages customer orders and order lifecycle

**Key Features**:
- Unique order number generation
- Customer information
- Multiple items per order
- Price calculation (subtotal, tax, shipping, total)
- Shipping and billing addresses
- Payment status tracking
- Order status tracking
- Transaction details

**Schema Design**:
```typescript
{
  tenantId: ObjectId,           // Owner tenant reference
  orderNumber: String,          // Unique order identifier
  customer: {
    name: String,
    email: String,
    phone: String
  },
  items: [{
    productId: ObjectId,
    productName: String,
    sku: String,
    quantity: Number,
    price: Number,
    variant: String
  }],
  subtotal: Number,             // Items total
  tax: Number,                  // Tax amount
  shipping: Number,             // Shipping cost
  total: Number,                // Final total
  shippingAddress: Object,      // Delivery address
  billingAddress: Object,       // Billing address
  paymentMethod: Enum,          // Payment method
  paymentStatus: Enum,          // Payment status
  paymentDetails: Object,       // Transaction info
  orderStatus: Enum,            // Order status
  timestamps: true
}
```

**Indexes**:
- `tenantId + orderNumber` (compound)
- `tenantId + orderStatus` (compound)
- `tenantId + createdAt` (compound, descending)

### 2. Middleware Layer

#### Tenant Identification Middleware
**File**: `src/middleware/tenant.ts`

**Responsibilities**:
1. Identify tenant from incoming request
2. Validate tenant exists and is active
3. Attach tenant context to request object
4. Reject requests for non-existent or inactive tenants

**Identification Methods** (in priority order):
1. **Header-based**: `X-Tenant-ID` header (best for API calls)
2. **Subdomain-based**: Extract from `Host` header (e.g., `store.retailx.com`)
3. **Custom domain**: Direct domain lookup (e.g., `store.com`)

**Usage**:
```typescript
// Required tenant
router.use(identifyTenant);

// Optional tenant (for admin routes)
router.use(optionalTenant);
```

### 3. Controller Layer

#### Tenant Controller
**Responsibilities**:
- Create new tenants (store registration)
- List all tenants with filtering
- Get tenant details
- Update tenant configuration
- Delete tenants

**Key Operations**:
- CRUD operations on Tenant model
- Pagination support
- Filtering by status and category

#### Product Controller
**Responsibilities**:
- Manage product catalog for tenant
- Search and filter products
- Category aggregation
- Inventory management

**Key Operations**:
- Tenant-scoped CRUD operations
- Advanced search (name, description, tags)
- Category filtering
- Featured products filtering
- Pagination support

**Security**:
- All operations scoped to current tenant
- Prevents cross-tenant data access

#### Order Controller
**Responsibilities**:
- Order creation and processing
- Inventory deduction
- Price calculation
- Order status management
- Analytics and reporting

**Key Operations**:
- Create orders with validation
- Automatic inventory updates
- Tax and shipping calculation
- Order status updates
- Statistics aggregation

**Business Logic**:
- Inventory validation before order creation
- Automatic price calculation
- Order number generation
- Tax calculation (8% default)
- Free shipping for orders > $100

### 4. Route Layer

#### Route Organization
```
/api/tenants          - Tenant management (no tenant middleware)
/api/products         - Product catalog (requires tenant)
/api/orders           - Order management (requires tenant)
```

#### Security Model
- **Public routes**: Tenant CRUD (for platform admin)
- **Tenant-scoped routes**: Products, Orders (require tenant identification)
- All tenant-scoped routes automatically filter by current tenant

## Database Design

### Multi-Tenant Data Isolation

**Strategy**: Discriminator Column Pattern
- Each collection has a `tenantId` field
- Application enforces tenant filtering on all queries
- Indexes include `tenantId` for query performance

**Advantages**:
- Cost-effective (single database)
- Easy to maintain and backup
- Simple to scale
- Cross-tenant analytics possible (for platform owner)

**Security Considerations**:
- Application-level enforcement (must ensure all queries include tenantId)
- Compound indexes for performance
- Middleware validation before data access

### Indexing Strategy

**Tenant Collection**:
- `subdomain`: Fast lookup by subdomain
- `domain`: Fast lookup by custom domain

**Product Collection**:
- `tenantId + status`: List active products per tenant
- `tenantId + category`: Category browsing
- `tenantId + sku`: Prevent duplicate SKUs within tenant

**Order Collection**:
- `tenantId + orderNumber`: Order lookup
- `tenantId + orderStatus`: Filter by status
- `tenantId + createdAt`: Time-based queries

## API Design

### RESTful Principles
- Resource-based URLs
- HTTP methods for operations (GET, POST, PUT, DELETE)
- JSON request/response format
- Consistent error handling

### Response Format
```json
{
  "success": true/false,
  "message": "Human-readable message",
  "data": { ... },
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

### Error Handling
- 200: Success
- 201: Created
- 400: Bad request / Validation error
- 404: Resource not found
- 500: Server error

## Scalability Considerations

### Horizontal Scaling
- Stateless application design
- No session storage in application
- Can run multiple instances behind load balancer

### Database Scaling
- MongoDB replica sets for high availability
- Sharding by `tenantId` for very large deployments
- Read replicas for read-heavy workloads

### Caching Strategy (Future Enhancement)
- Redis for session management
- Product catalog caching
- Tenant configuration caching
- Order statistics caching

## Security Features

### Current Implementation
1. **Tenant Isolation**: Application-level filtering
2. **Input Validation**: Mongoose schema validation
3. **Environment Configuration**: Secrets in .env file

### Future Enhancements
1. **Authentication**: JWT-based user authentication
2. **Authorization**: Role-based access control (RBAC)
3. **Rate Limiting**: Prevent API abuse
4. **Input Sanitization**: Prevent injection attacks
5. **HTTPS**: Enforce secure connections
6. **CORS**: Configure allowed origins

## Payment Integration

### Current Structure
- Payment method selection (Stripe, PayPal, Cash on Delivery)
- Payment status tracking
- Transaction ID logging

### Integration Points
- Tenant-specific payment gateway configuration
- Support for multiple payment providers
- Webhook handlers for payment confirmations (to be implemented)

## White-Label Features

### Branding Customization
- **Primary Color**: Main brand color
- **Secondary Color**: Accent color
- **Logo**: Store logo URL
- **Description**: Store description

### Domain Configuration
- **Subdomain**: `store.retailx.com`
- **Custom Domain**: `store.com`

### Category Specialization
- Clothing stores
- Grocery stores
- Cosmetics stores
- Electronics stores
- General purpose stores

## Development Workflow

### Local Development
1. Install dependencies: `npm install`
2. Configure environment: Copy `.env.example` to `.env`
3. Start MongoDB locally
4. Run development server: `npm run dev`
5. Load seed data: `npm run seed`

### Production Deployment
1. Build application: `npm run build`
2. Set production environment variables
3. Configure MongoDB connection
4. Start application: `npm start`
5. Configure reverse proxy (nginx)
6. Set up SSL certificates

## Monitoring and Observability

### Logging
- Console logging for development
- Structured logging for production (to be implemented)
- Error tracking and alerting (to be implemented)

### Metrics
- Request rate per tenant
- Order processing time
- Database query performance
- Inventory levels

### Health Checks
- `/health` endpoint for load balancer
- Database connectivity check
- System status monitoring

## Future Enhancements

### Phase 1 (Essential)
- User authentication and authorization
- Email notifications (order confirmations, shipping updates)
- Advanced search with Elasticsearch
- Image upload and management

### Phase 2 (Enhanced Features)
- Customer reviews and ratings
- Wishlist functionality
- Discount codes and promotions
- Advanced analytics dashboard
- Multi-currency support
- Internationalization (i18n)

### Phase 3 (Advanced)
- AI-powered product recommendations
- Inventory forecasting
- Customer segmentation
- A/B testing framework
- Mobile app API support
- Real-time notifications with WebSockets

## Technology Stack

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js 5.x
- **Language**: TypeScript 4.5+
- **Database**: MongoDB 4.4+
- **ODM**: Mongoose 9.x

### Development Tools
- **Compiler**: TypeScript Compiler (tsc)
- **Dev Server**: Nodemon + ts-node
- **Package Manager**: npm

### Production Dependencies
- express: Web framework
- mongoose: MongoDB ODM
- cors: Cross-origin resource sharing
- dotenv: Environment configuration
- bcryptjs: Password hashing (ready for auth)
- jsonwebtoken: JWT tokens (ready for auth)
- uuid: Unique ID generation

## Conclusion

RetailX provides a solid foundation for building multi-tenant eCommerce platforms. The architecture is designed for:
- **Scalability**: Handle multiple stores and growing traffic
- **Flexibility**: Support various business types and categories
- **Security**: Tenant isolation and data protection
- **Maintainability**: Clean code structure and documentation
- **Extensibility**: Easy to add new features and integrations

The platform is production-ready for MVP deployments and can be extended with additional features as needed.
