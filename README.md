# Mini ERP + CRM System

A full-stack business management application designed to streamline customer relationship management (CRM), product inventory tracking, and sales delivery challan generation with automated GST tax calculation and inventory movement logs.

---

## 🚀 Tech Stack

### **Frontend**
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS (v4) & Custom Dark Theme
- **Language**: TypeScript
- **Icons**: Lucide React
- **HTTP Client**: Axios (with Bearer Token Interceptor)

### **Backend**
- **Runtime**: Node.js & Express.js
- **Database ORM**: Prisma (v5)
- **Database**: SQLite (Local Dev) / PostgreSQL (Production)
- **Language**: TypeScript (`ts-node`, `tsc`)
- **Authentication**: JSON Web Tokens (JWT) & `bcryptjs` password hashing
- **Security**: Helmet, CORS

---

## ✨ Core Features

### 1. User Authentication & Role-Based Access Control (RBAC)
- Secure JWT-based authentication flow with local storage persistence.
- Granular permissions based on 4 user roles:
  - **ADMIN**: Access to all CRM, Inventory, and Sales Challan features.
  - **SALES**: Manage Customer CRM, add follow-up notes, view inventory, and generate Sales Challans.
  - **WAREHOUSE**: Manage Product Inventory, add new products, and track stock movements.
  - **ACCOUNTS**: View Customer CRM and read-only Sales Challans history log.

### 2. Customer CRM & Follow-up Tracking
- Create and manage retail, wholesale, and distributor customer profiles.
- Capture customer details: Name, Mobile, Email, Business Name, GST Number, Address, Type, and Lead/Active Status.
- Add time-stamped follow-up notes with author attribution to track customer communications.
- Real-time search by customer name, business name, mobile, or email.

### 3. Product Inventory Management
- Catalog products with essential metrics: SKU, Name, Category, MRP (₹), Sale Price (₹), GST %, Unit of Measurement (UOM), and Location.
- Visual stock status indicators (e.g., Low Stock Alerts when stock falls below threshold).
- Automated creation of initial stock movement logs upon product creation.

### 4. Sales Delivery Challan Generation
- Create draft or confirmed delivery challans associated with specific customers.
- Multi-item line selector with real-time stock availability check.
- **GST Tax Calculation**:
  - Item-level GST rate configuration (0%, 5%, 12%, 18%, 28%).
  - Taxable value calculation per item.
  - Automatic SGST & CGST split calculation.
  - Tax rate-wise breakdown summary for multi-slab orders.
- **Automated Stock Deduction**: Deducts product stock and records `StockMovementLog` entries upon challan confirmation.

### 5. Sales History Log
- Comprehensive audit trail of all generated sales challans.
- Quick summary of customer details, item quantities, challan status, and creation timestamps.

---

## 🛠️ Setup & Installation Guide

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

---

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd fundsroom
```

---

### Step 2: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure Environment Variables
# Create or verify .env file:
# DATABASE_URL="file:./dev.db"
# JWT_SECRET="your_super_secret_jwt_key"
# PORT=5000

# Push Prisma Database Schema (SQLite dev.db)
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Seed Database with Default Demo Accounts
npx prisma db seed

# Start Backend Dev Server
npm run dev
```
The backend server will start at `http://localhost:5000`.

---

### Step 3: Frontend Setup
Open a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure Environment Variables
# Create or verify .env file:
# VITE_API_URL=http://localhost:5000/api

# Start Frontend Dev Server
npm run dev
```
The frontend application will be accessible at `http://localhost:5173`.

---

### 🔑 Demo Logins (Default Credentials)

After seeding the database, use any of the pre-configured demo credentials on the login screen:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `password123` |
| **Sales** | `sales@company.com` | `password123` |
| **Warehouse** | `warehouse@company.com` | `password123` |
| **Accounts** | `accounts@company.com` | `password123` |

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates user and returns JWT token & user profile |
| `GET` | `/api/auth/me` | Authenticated | Retrieves profile of currently logged-in user |

### 👥 Customer CRM (`/api/customers`)
| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/customers` | `ADMIN`, `SALES`, `ACCOUNTS` | Lists all customers (supports `?search=`, `?status=`, `?type=`) |
| `GET` | `/api/customers/:id` | `ADMIN`, `SALES`, `ACCOUNTS` | Retrieves customer details with follow-up notes & challan history |
| `POST` | `/api/customers` | `ADMIN`, `SALES` | Creates a new customer profile |
| `POST` | `/api/customers/:id/notes` | `ADMIN`, `SALES` | Adds a follow-up note to a specific customer |

### 📦 Product Inventory (`/api/products`)
| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Authenticated | Fetches all inventory products ordered by creation date |
| `POST` | `/api/products` | `ADMIN`, `WAREHOUSE` | Creates a new product and logs initial stock entry |

### 📋 Sales Challans (`/api/challans`)
| Method | Endpoint | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/challans` | `ADMIN`, `SALES`, `ACCOUNTS` | Fetches sales delivery challan history log |
| `POST` | `/api/challans` | `ADMIN`, `SALES` | Generates a new delivery challan (DRAFT or CONFIRMED) |

---

## ☁️ Deployment Guide

### **Deploying Backend to Render**
1. **Create Web Service**:
   - Connect your GitHub repository to [Render](https://render.com/).
   - Set **Root Directory** to `backend`.
   - **Environment**: Node
   - **Build Command**: `npm install && npx prisma db push && npx prisma generate && npm run build`
   - **Start Command**: `npm start` (or `node dist/src/index.js`).
2. **Environment Variables**:
   - `DATABASE_URL`: Your production PostgreSQL database URL (e.g., Supabase / Render Postgres).
   - `JWT_SECRET`: A secure random secret string.
   - `PORT`: `5000` (or leave default assigned by Render).
3. **Database Setup**:
   - If using PostgreSQL, update `schema.prisma` datasource provider to `postgresql` before building.

---

### **Deploying Frontend to Vercel**
1. **Import Project**:
   - Connect your GitHub repository to [Vercel](https://vercel.com/).
   - Set **Root Directory** to `frontend`.
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
2. **Environment Variables**:
   - Set `VITE_API_URL` to your deployed backend URL (e.g., `https://your-backend.onrender.com/api`).
3. **Deploy**:
   - Trigger deployment. Vercel will build the frontend assets and host the static SPA.
