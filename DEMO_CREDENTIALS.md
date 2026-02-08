# RetailX Demo Credentials & Stores

## 📋 Overview

RetailX is now deployed with **4 demo stores** on Render. All demo accounts are fully functional and ready to test.

---

## 🏪 Demo Stores

### 1. FreshMart Grocery

**Type:** Supermarket / Grocery Store  
**Owner Email:** `owner@freshmart.com`  
**Password:** `Owner@123456`  
**Services:** Fresh produce, dairy, bakery, pantry items, beverages

### 2. Glamour Hair Studio

**Type:** Hair Salon Business  
**Owner Email:** `owner@glamourhair.com`  
**Password:** `Owner@123456`  
**Services:** Haircuts, coloring, treatments, bridal styling, professional products

### 3. Tranquil Touch Spa

**Type:** Massage & Wellness Spa  
**Owner Email:** `owner@tranquilspa.com`  
**Password:** `Owner@123456`  
**Services:** Thai massage, reflexology, aromatherapy, body treatments, couples packages

### 4. Healthy Feet Clinic

**Type:** Podology / Foot Care  
**Owner Email:** `owner@healthyfeet.com`  
**Password:** `Owner@123456`  
**Services:** Medical pedicure, fungal treatment, diabetic care, custom orthotics, reflexology

---

## 🔑 Platform Access

### Super Admin

- **Email:** `superadmin@retailx.com`
- **Password:** `SuperAdmin@123456`
- **Access:** Full platform control, all stores, user management
- **URL:** [https://retailx-admin.onrender.com](https://retailx-admin.onrender.com)

### Demo Customer (Storefront)

- **Email:** `customer@demo.com`
- **Password:** `Customer@123`
- **Access:** Browse all stores, make purchases
- **URL:** [https://retailx-storefront.onrender.com](https://retailx-storefront.onrender.com)

---

## 🌐 Live URLs

| Service                 | URL                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| **API Backend**         | [https://retailx-api.onrender.com/api/v1/health](https://retailx-api.onrender.com/api/v1/health) |
| **Admin Dashboard**     | [https://retailx-admin.onrender.com](https://retailx-admin.onrender.com)                         |
| **Customer Storefront** | [https://retailx-storefront.onrender.com](https://retailx-storefront.onrender.com)               |

---

## 📊 Database

- **Provider:** MongoDB Atlas
- **Cluster:** `retailx-prod`
- **Region:** Oregon (us-west-2)
- **Database:** `retailx`

---

## ✅ Quick Test Workflow

### For Admin:

1. Visit [Admin Dashboard](https://retailx-admin.onrender.com)
2. Click "Super Admin" quick login button
3. Browse all 4 stores, view products/services, manage orders

### For Customer:

1. Visit [Storefront](https://retailx-storefront.onrender.com)
2. Select "FreshMart Grocery" (or any store)
3. Browse products, add to cart, checkout
4. Login with `customer@demo.com` / `Customer@123`

---

## 🛠️ Store Management

Each store owner can:

- ✅ View & manage products/services
- ✅ Handle customer orders
- ✅ Manage store settings & branding
- ✅ View analytics & statistics
- ✅ Configure shipping (for product stores)
- ✅ Setup booking (for service businesses)

---

## 📝 Notes

- All passwords use the format `Owner@123456` for consistency
- Demo accounts are pre-populated with products/services and sample data
- Customer demo account has a default address on file
- Database is automatically seeded on deployment
- Free tier cold starts: ~30-50 seconds on first request after 15 min inactivity

---

**Last Updated:** February 8, 2026  
**Deployment:** Render (Blueprints)  
**Framework:** MERN Stack (MongoDB, Express, React, Node.js)
