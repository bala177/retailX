# Local Development Setup Guide

This guide ensures you have the same seed data and products locally as in production, making testing consistent across environments.

---

## 🚀 Quick Start: Local Development

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0
MongoDB (local or Atlas)
```

### 1. Install Dependencies

```bash
# Install all workspace dependencies
npm install

# Or install individually:
cd backend && npm install && cd ../admin && npm install && cd ../storefront && npm install && cd ..
```

### 2. Setup Environment Variables

#### Backend (.env)

Create `backend/.env` file:

```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database - Use Local MongoDB OR Atlas
# Option A: Local MongoDB (default)
MONGODB_URI=mongodb://localhost:27017/retailx

# Option B: MongoDB Atlas (same as production)
# MONGODB_URI=mongodb+srv://retailx-admin:j8KnSAZUKXaLSchp@retailx-prod.hnix2mf.mongodb.net/retailx?appName=retailx-prod

# JWT Secrets (Use strong values in production, any value for local dev)
JWT_SECRET=dev-jwt-secret-local-development
REFRESH_TOKEN_SECRET=dev-refresh-secret-local-development
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
JWT_COOKIE_EXPIRES_IN=7

# CORS (local dev)
CORS_ORIGIN=http://localhost:5001,http://localhost:5002

# API Configuration
API_VERSION=v1

# Logging
LOG_LEVEL=debug

# Email (optional, uses mock mailer in dev)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=465
SMTP_USER=dev@example.com
SMTP_PASSWORD=dev-password
```

#### Admin (.env.local)

Create `admin/.env.local`:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

#### Storefront (.env.local)

Create `storefront/.env.local`:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 3. Setup Local MongoDB

#### Option A: MongoDB Community Server (Recommended)

**Mac (Homebrew):**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**

```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**Windows:**

- Download: https://www.mongodb.com/try/download/community
- Run installer and follow prompts
- MongoDB runs as a service

#### Option B: Docker

```bash
docker run --name retailx-mongo -d -p 27017:27017 mongo:latest
```

#### Option C: MongoDB Atlas (Cloud)

Skip local MongoDB and use the same connection string as production:

```
MONGODB_URI=mongodb+srv://retailx-admin:j8KnSAZUKXaLSchp@retailx-prod.hnix2mf.mongodb.net/retailx?appName=retailx-prod
```

---

## 🌱 Seed Database with Demo Data

### Option 1: Seed from Backend

```bash
cd backend

# Seed with LOCAL MongoDB
node src/seeds/index.js

# OR Seed with PRODUCTION MongoDB Atlas
MONGODB_URI=mongodb+srv://retailx-admin:j8KnSAZUKXaLSchp@retailx-prod.hnix2mf.mongodb.net/retailx?appName=retailx-prod node src/seeds/index.js
```

Output should show:

```
✓ Connected to MongoDB
✓ Creating super admin...
✓ Creating FreshMart Grocery store...
✓ Creating Glamour Hair Studio...
✓ Creating Tranquil Touch Spa...
✓ Creating Healthy Feet Clinic...
✓ Updating store statistics...
✓ Creating demo customers...

DATABASE SEEDING COMPLETED SUCCESSFULLY!

DEMO STORES CREATED (4 Stores):
1. FreshMart Grocery (fresh-mart)
2. Glamour Hair Studio (glamour-hair)
3. Tranquil Touch Spa (tranquil-spa)
4. Healthy Feet Clinic (healthy-feet)

STORE OWNERS (All use Password: Owner@123456):
owner@freshmart.com         owner@glamourhair.com
owner@tranquilspa.com       owner@healthyfeet.com

DEMO CUSTOMER:
Email: customer@demo.com
Password: Customer@123
```

### Option 2: NPM Script (Recommended)

```bash
# From root directory
npm run seed

# This runs: cd backend && node src/seeds/index.js
```

---

## 🎯 Start Local Development Servers

### Terminal 1: Backend API

```bash
cd backend
npm run dev

# Expected output:
# ╔═══════════════════════════════════════════════════════════╗
# ║                                                           ║
# ║   🚀 RetailX Platform API Server                          ║
# ║                                                           ║
# ║   Environment: development                               ║
# ║   Port: 5000                                             ║
# ║   API Version: v1                                        ║
# ║                                                           ║
# ║   Health Check: http://localhost:5000/api/v1/health    ║
# ║                                                           ║
# ╚═══════════════════════════════════════════════════════════╝
```

### Terminal 2: Admin Dashboard

```bash
cd admin
npm run dev

# Expected output:
# VITE v5.4.21  ready in 500 ms
# ➜  Local:   http://localhost:5001/
# ➜  Press h to show help
```

### Terminal 3: Customer Storefront

```bash
cd storefront
npm run dev

# Expected output:
# VITE v5.4.21  ready in 500 ms
# ➜  Local:   http://localhost:5002/
# ➜  Press h to show help
```

### Or Use Concurrency (All in One Terminal)

```bash
# From root directory
npm run dev

# Runs all three servers in parallel
```

---

## 🧪 Access Local Development URLs

| Service             | URL                                 | Purpose                     |
| ------------------- | ----------------------------------- | --------------------------- |
| **API**             | http://localhost:5000               | Backend API server          |
| **API Health**      | http://localhost:5000/api/v1/health | API status check            |
| **Admin Dashboard** | http://localhost:5001               | Store owner admin panel     |
| **Storefront**      | http://localhost:5002               | Customer shopping interface |

---

## 🔐 Demo Credentials (Same as Production)

### Admin Panel Login

```
Super Admin:
Email: superadmin@retailx.com
Password: SuperAdmin@123456

Store Owners (All password: Owner@123456):
FreshMart: owner@freshmart.com
Glamour Hair: owner@glamourhair.com
Tranquil Spa: owner@tranquilspa.com
Healthy Feet: owner@healthyfeet.com
```

### Storefront Login

```
Demo Customer:
Email: customer@demo.com
Password: Customer@123
```

---

## 📝 Seed File Location & Customization

**File:** `backend/src/seeds/index.js`

### What Gets Seeded:

- ✅ 1 Super Admin user
- ✅ 4 Demo stores with full configurations
- ✅ Store owners for each store
- ✅ Categories per store
- ✅ 30+ demo products/services across all stores
- ✅ 1 demo customer with address
- ✅ Store statistics and metadata

### To Clear & Reseed:

```bash
# This is automatic - seed script clears existing data first
cd backend
node src/seeds/index.js

# Or via npm
npm run seed
```

---

## 🔄 Sync Production Data to Local

To test with real production data locally:

### Step 1: Export from Production MongoDB

```bash
# Make sure you're connected to production MongoDB
mongodump --uri="mongodb+srv://retailx-admin:j8KnSAZUKXaLSchp@retailx-prod.hnix2mf.mongodb.net/retailx" --out=./mongodb_backup
```

### Step 2: Import to Local

```bash
mongorestore --db retailx ./mongodb_backup/retailx
```

### Step 3: Verify Import

```bash
# Connect to local MongoDB
mongo retailx

# Check collections
show collections

# Count documents
db.tenants.count()
db.users.count()
db.products.count()
```

---

## 🧹 Clean Database Commands

### Clear All Collections (Keep Database)

```bash
cd backend

# Via MongoDB CLI:
mongo retailx
db.tenants.deleteMany({})
db.users.deleteMany({})
db.products.deleteMany({})
db.categories.deleteMany({})
db.orders.deleteMany({})
db.carts.deleteMany({})
exit

# Or reseed:
node src/seeds/index.js
```

### Drop Entire Database

```bash
mongo retailx
db.dropDatabase()
exit
```

---

## 🐛 Debugging & Troubleshooting

### Backend Not Connecting to MongoDB

```bash
# Check if MongoDB is running
ps aux | grep mongod

# Check MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log

# Verify connection string
echo $MONGODB_URI

# Test connection manually
mongosh "your-connection-string"
```

### Port Already in Use

```bash
# Kill process using port 5000 (Backend)
lsof -ti:5000 | xargs kill -9

# Kill process using port 5001 (Admin)
lsof -ti:5001 | xargs kill -9

# Kill process using port 5002 (Storefront)
lsof -ti:5002 | xargs kill -9
```

### Clear npm Cache

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Check API Health

```bash
# From any terminal
curl http://localhost:5000/api/v1/health

# Expected response:
# {"status":"ok","message":"API is healthy","timestamp":"2026-02-08T..."}
```

---

## 🚀 Common Development Tasks

### Run Tests

```bash
npm run test

# Or in backend only:
cd backend && npm test
```

### Run Linting

```bash
npm run lint

# Fix linting issues:
npm run lint:fix
```

### Build for Production

```bash
npm run build

# Builds admin and storefront (outputs to /dist folders)
```

### View Logs

```bash
# Backend logs show in terminal where you ran npm run dev

# Admin/Storefront build logs show in their terminals

# MongoDB logs:
tail -f /usr/local/var/log/mongodb/mongo.log

# Linux MongoDB:
sudo journalctl -u mongod -f
```

---

## 📋 Development Workflow Example

```bash
# 1. Start MongoDB (if local)
mongod

# 2. Seed database with demo data
npm run seed

# 3. Start all development servers
npm run dev

# 4. Access services:
# - Admin: http://localhost:5001
# - Storefront: http://localhost:5002
# - API: http://localhost:5000

# 5. Test with demo credentials
# Admin: superadmin@retailx.com / SuperAdmin@123456
# Customer: customer@demo.com / Customer@123

# 6. Make code changes (hot reload enabled)
# Edit files, save, browser auto-refreshes

# 7. Stop servers (Ctrl+C in each terminal)
```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] MongoDB is running locally or connected to Atlas
- [ ] `npm install` completed successfully
- [ ] `.env` files created in backend, admin, storefront
- [ ] Seed script ran successfully with 4 stores created
- [ ] Backend starts on port 5000 without errors
- [ ] Admin dashboard loads on http://localhost:5001
- [ ] Storefront loads on http://localhost:5002
- [ ] Can login with demo credentials
- [ ] All 4 stores visible in both admin and storefront
- [ ] API health check returns 200: `curl http://localhost:5000/api/v1/health`

---

**Troubleshooting Reference:** See "Debugging & Troubleshooting" section above

**Updated:** February 8, 2026
