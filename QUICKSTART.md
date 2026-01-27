# RetailX Quick Start Guide

Get up and running with RetailX in 5 minutes!

## Prerequisites

Before you begin, ensure you have:
- Node.js 16+ installed
- MongoDB 4.4+ installed and running
- A terminal/command prompt
- A REST client (curl, Postman, or similar)

## Step 1: Installation (2 minutes)

```bash
# Clone the repository
git clone https://github.com/bala177/retailX.git
cd retailX

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

Edit `.env` if needed (default values work for local development):
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/retailx
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

## Step 2: Build and Start (1 minute)

```bash
# Build the TypeScript project
npm run build

# Start the development server
npm run dev
```

You should see:
```
🚀 RetailX server running on port 3000
📝 Environment: development
MongoDB connected successfully
```

## Step 3: Load Sample Data (30 seconds)

Open a new terminal and run:

```bash
npm run seed
```

This creates sample stores and products:
- Fashion Forward (clothing store)
- Fresh Grocers (grocery store)
- Beauty Bliss (cosmetics store)
- Tech Haven (electronics store)

## Step 4: Test the API (1.5 minutes)

### Check Health
```bash
curl http://localhost:3000/health
```

### List All Stores
```bash
curl http://localhost:3000/api/tenants
```

### Get Products from Fashion Forward
First, copy a tenant ID from the previous response, then:

```bash
curl -X GET http://localhost:3000/api/products \
  -H "X-Tenant-ID: PASTE_TENANT_ID_HERE"
```

### Create a New Store

```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My New Store",
    "subdomain": "mystore",
    "category": "general",
    "contactEmail": "contact@mystore.com",
    "primaryColor": "#FF5733",
    "description": "My awesome store"
  }'
```

## What's Next?

### Explore the API
- Read [API_EXAMPLES.md](API_EXAMPLES.md) for comprehensive API examples
- Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system design
- Check [README.md](README.md) for complete documentation

### Common Tasks

**Add a Product:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: YOUR_TENANT_ID" \
  -d '{
    "name": "My Product",
    "description": "Product description",
    "sku": "PROD-001",
    "price": 29.99,
    "category": "General",
    "inventory": {
      "quantity": 100,
      "trackInventory": true
    },
    "status": "active"
  }'
```

**Create an Order:**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "X-Tenant-ID: YOUR_TENANT_ID" \
  -d '{
    "customer": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "items": [{
      "productId": "YOUR_PRODUCT_ID",
      "quantity": 2
    }],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zipCode": "10001"
    },
    "paymentMethod": "credit_card"
  }'
```

**Get Store Statistics:**
```bash
curl http://localhost:3000/api/orders/stats \
  -H "X-Tenant-ID: YOUR_TENANT_ID"
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod` or check your system services
- Verify connection string in `.env` file
- Check MongoDB logs for errors

### Port Already in Use
- Change `PORT` in `.env` file to another port (e.g., 3001)
- Or stop the process using port 3000

### TypeScript Compilation Errors
- Run `npm run build` to see detailed errors
- Ensure all dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be 16+)

### Seed Data Issues
- Ensure MongoDB is running
- Clear existing data manually if needed
- Check the seed script output for specific errors

## Next Steps

1. **Customize**: Modify models, controllers, and routes to fit your needs
2. **Extend**: Add authentication, email notifications, payment gateways
3. **Deploy**: Follow deployment guide in README.md
4. **Integrate**: Build a frontend or mobile app using the API

## Getting Help

- Check the [README.md](README.md) for detailed documentation
- Review [API_EXAMPLES.md](API_EXAMPLES.md) for more examples
- Study [ARCHITECTURE.md](ARCHITECTURE.md) to understand the design
- Open an issue on GitHub for bugs or questions

---

🎉 **Congratulations!** You're now running a multi-tenant eCommerce platform!
