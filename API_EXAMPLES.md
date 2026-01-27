# RetailX API Examples

This document provides practical examples for using the RetailX multi-tenant eCommerce platform API.

## Prerequisites

- RetailX server running on `http://localhost:3000`
- MongoDB instance running
- Sample data loaded (run `npm run seed`)

## Example Workflows

### 1. Setting Up a New Store

#### Step 1: Create a Tenant
```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Electronics Store",
    "subdomain": "myelectronics",
    "category": "electronics",
    "contactEmail": "contact@myelectronics.com",
    "contactPhone": "+1-555-1234",
    "primaryColor": "#3498db",
    "secondaryColor": "#2ecc71",
    "description": "Your trusted electronics retailer"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Tenant created successfully",
  "data": {
    "_id": "60a7b8c9d4e5f6a7b8c9d4e5",
    "name": "My Electronics Store",
    "subdomain": "myelectronics",
    "status": "active",
    ...
  }
}
```

#### Step 2: Add Products to Your Store
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: 60a7b8c9d4e5f6a7b8c9d4e5" \
  -d '{
    "name": "Smartphone XYZ",
    "description": "Latest smartphone with amazing features",
    "sku": "PHONE-XYZ-001",
    "price": 699.99,
    "compareAtPrice": 799.99,
    "category": "Mobile Phones",
    "subcategory": "Smartphones",
    "inventory": {
      "quantity": 50,
      "lowStockThreshold": 10,
      "trackInventory": true
    },
    "tags": ["smartphone", "electronics", "5G"],
    "status": "active",
    "featured": true
  }'
```

### 2. Customer Shopping Experience

#### Browse Products
```bash
# Get all active products
curl -X GET "http://localhost:3000/api/products?status=active&page=1&limit=20" \
  -H "X-Tenant-ID: 60a7b8c9d4e5f6a7b8c9d4e5"

# Search for products
curl -X GET "http://localhost:3000/api/products?search=smartphone&status=active" \
  -H "X-Tenant-ID: 60a7b8c9d4e5f6a7b8c9d4e5"

# Get products by category
curl -X GET "http://localhost:3000/api/products?category=Mobile%20Phones" \
  -H "X-Tenant-ID: 60a7b8c9d4e5f6a7b8c9d4e5"

# Get featured products
curl -X GET "http://localhost:3000/api/products?featured=true" \
  -H "X-Tenant-ID: 60a7b8c9d4e5f6a7b8c9d4e5"
```

#### View Product Details
```bash
curl -X GET http://localhost:3000/api/products/PRODUCT_ID \
  -H "X-Tenant-ID: 60a7b8c9d4e5f6a7b8c9d4e5"
```

#### Place an Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: 60a7b8c9d4e5f6a7b8c9d4e5" \
  -d '{
    "customer": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1-555-7890"
    },
    "items": [
      {
        "productId": "PRODUCT_ID_HERE",
        "quantity": 1
      }
    ],
    "shippingAddress": {
      "street": "456 Oak Avenue",
      "city": "Chicago",
      "state": "IL",
      "country": "USA",
      "zipCode": "60601"
    },
    "paymentMethod": "stripe"
  }'
```

### 3. Store Management

#### Update Product Inventory
```bash
curl -X PUT http://localhost:3000/api/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: 60a7b8c9d4e5f6a7b8c9d4e5" \
  -d '{
    "inventory": {
      "quantity": 75
    }
  }'
```

#### Update Product Price
```bash
curl -X PUT http://localhost:3000/api/products/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: 60a7b8c9d4e5f6a7b8c9d4e5" \
  -d '{
    "price": 649.99,
    "compareAtPrice": 749.99
  }'
```

#### View All Orders
```bash
# Get all orders
curl -X GET "http://localhost:3000/api/orders?page=1&limit=20" \
  -H "X-Tenant-ID: 60a7b8c9d4e5f6a7b8c9d4e5"

# Filter by order status
curl -X GET "http://localhost:3000/api/orders?orderStatus=pending" \
  -H "X-Tenant-ID: 60a7b8c9d4e5f6a7b8c9d4e5"

# Filter by payment status
curl -X GET "http://localhost:3000/api/orders?paymentStatus=paid" \
  -H "X-Tenant-ID: 60a7b8c9d4e5f6a7b8c9d4e5"
```

#### Update Order Status
```bash
curl -X PUT http://localhost:3000/api/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: 60a7b8c9d4e5f6a7b8c9d4e5" \
  -d '{
    "orderStatus": "shipped",
    "paymentStatus": "paid"
  }'
```

#### Get Store Analytics
```bash
curl -X GET http://localhost:3000/api/orders/stats \
  -H "X-Tenant-ID: 60a7b8c9d4e5f6a7b8c9d4e5"
```

Response:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalOrders": 150,
      "totalRevenue": 45678.90,
      "averageOrderValue": 304.53
    },
    "statusBreakdown": [
      { "_id": "pending", "count": 25 },
      { "_id": "processing", "count": 40 },
      { "_id": "shipped", "count": 60 },
      { "_id": "delivered", "count": 25 }
    ]
  }
}
```

### 4. Multi-Store Management

#### List All Stores
```bash
# Get all tenants
curl -X GET "http://localhost:3000/api/tenants?page=1&limit=10"

# Filter by category
curl -X GET "http://localhost:3000/api/tenants?category=electronics"

# Filter by status
curl -X GET "http://localhost:3000/api/tenants?status=active"
```

#### Update Store Branding
```bash
curl -X PUT http://localhost:3000/api/tenants/TENANT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "primaryColor": "#e74c3c",
    "secondaryColor": "#3498db",
    "logo": "https://example.com/new-logo.png",
    "description": "Updated store description"
  }'
```

### 5. Category Management

#### Get All Product Categories
```bash
curl -X GET http://localhost:3000/api/products/categories \
  -H "X-Tenant-ID: 60a7b8c9d4e5f6a7b8c9d4e5"
```

Response:
```json
{
  "success": true,
  "data": [
    { "_id": "Mobile Phones", "count": 25 },
    { "_id": "Laptops", "count": 15 },
    { "_id": "Accessories", "count": 50 }
  ]
}
```

## Using Different Tenant Identification Methods

### Method 1: Header-based (Recommended for APIs)
```bash
curl -X GET http://localhost:3000/api/products \
  -H "X-Tenant-ID: 60a7b8c9d4e5f6a7b8c9d4e5"
```

### Method 2: Subdomain-based
```bash
# Assumes DNS is configured
curl -X GET http://myelectronics.retailx.com/api/products
```

### Method 3: Custom Domain
```bash
# Assumes custom domain is configured
curl -X GET http://myelectronics.com/api/products
```

## Error Handling

### Tenant Not Found
```bash
curl -X GET http://localhost:3000/api/products \
  -H "X-Tenant-ID: invalid_id"
```

Response:
```json
{
  "success": false,
  "message": "Tenant not found or inactive"
}
```

### Product Not Found
```bash
curl -X GET http://localhost:3000/api/products/invalid_product_id \
  -H "X-Tenant-ID: 60a7b8c9d4e5f6a7b8c9d4e5"
```

Response:
```json
{
  "success": false,
  "message": "Product not found"
}
```

### Insufficient Inventory
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: 60a7b8c9d4e5f6a7b8c9d4e5" \
  -d '{
    "items": [
      {
        "productId": "PRODUCT_ID",
        "quantity": 1000
      }
    ],
    ...
  }'
```

Response:
```json
{
  "success": false,
  "message": "Insufficient inventory for product: Product Name"
}
```

## Testing the Platform

### Health Check
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### API Info
```bash
curl http://localhost:3000/
```

Response:
```json
{
  "message": "Welcome to RetailX - Multi-tenant eCommerce Platform",
  "version": "1.0.0",
  "endpoints": {
    "tenants": "/api/tenants",
    "products": "/api/products",
    "orders": "/api/orders"
  }
}
```

## Pagination

All list endpoints support pagination:

```bash
# Default: page=1, limit=10 (tenants) or limit=20 (products/orders)
curl -X GET "http://localhost:3000/api/products?page=2&limit=50" \
  -H "X-Tenant-ID: 60a7b8c9d4e5f6a7b8c9d4e5"
```

Response includes pagination metadata:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 2,
    "limit": 50,
    "pages": 3
  }
}
```

## Notes

1. Replace `TENANT_ID`, `PRODUCT_ID`, and `ORDER_ID` with actual IDs from your database
2. All timestamps are in ISO 8601 format
3. Prices are in decimal format (e.g., 699.99)
4. Inventory is automatically updated when orders are placed
5. Tax is calculated at 8% (configurable in code)
6. Free shipping is applied for orders over $100
