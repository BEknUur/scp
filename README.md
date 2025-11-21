# Supplier-Consumer Platform (SCP)

**B2B platform connecting food suppliers with restaurants and hotels**

Version 1.0 MVP | CSCI 361 - Software Engineering | Fall 2025

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Development](#development)
- [Testing](#testing)

---

## 🎯 Overview

The Supplier-Consumer Platform (SCP) is a B2B mobile and web application that facilitates direct collaboration between food suppliers and institutional consumers (restaurants/hotels). 

**Key Concept:** This is NOT a public marketplace. Consumers must request and be approved for a "link" with suppliers before they can view products and place orders.

---

## ✨ Features

### For Consumers (Restaurants/Hotels)
- 🔗 Request links with suppliers
- 📦 View catalogs only after link approval
- 🛒 Create bulk orders with multiple items
- 💬 Chat with supplier sales representatives
- 📝 File complaints tied to orders
- ✅ Track order status

### For Suppliers (Producers/Distributors)
- 🏢 Create company profile
- 📋 Manage product catalog (prices, stock, MOQ)
- ✔️ Approve/reject link requests (Owner/Manager only)
- 📨 Accept/reject orders (Owner/Manager only)
- 👥 Multi-role system: Owner, Manager, Sales
- 💬 Communicate with linked consumers
- 🎯 Sales handles first-line complaints → escalate to Manager

### Technical Features
- 🔐 JWT authentication
- 🎭 Role-based access control (RBAC)
- 🗂️ Populated API responses (no N+1 queries)
- 🐳 Docker Compose setup
- 📱 React Native mobile app
- 🌐 FastAPI backend

---

## 🛠️ Tech Stack

### Backend
- **Framework:** FastAPI
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Migrations:** Alembic
- **Authentication:** JWT (python-jose)

### Frontend
- **Mobile:** React Native (Expo)
- **Language:** TypeScript
- **HTTP Client:** Axios
- **State:** Context API

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Database:** PostgreSQL 16

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for mobile development)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd scp
```

### 2. Backend Setup
```bash
cd backend

# Create environment file
cp .env.example .env

# Start services (PostgreSQL + API)
cd ..
docker-compose up --build
```

The API will be available at `http://localhost:8000`

**API Docs:** http://localhost:8000/docs (Swagger UI)

### 3. Run Migrations
```bash
# In a new terminal
docker exec -it scp_api alembic upgrade head
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm start
```

Choose platform:
- Press `a` for Android
- Press `i` for iOS
- Press `w` for web

### 5. Test Accounts

Create accounts via `/auth/register` or use the mobile app:

**Consumer:**
- Email: `consumer@test.com`
- Password: `password123`
- Role: `CONSUMER`

**Supplier Owner:**
- Email: `owner@test.com`
- Password: `password123`
- Role: `SUPPLIER_OWNER`

---

## 📁 Project Structure

```
scp/
├── backend/
│   ├── app/
│   │   ├── core/           # Config, dependencies, security
│   │   ├── db/             # Database session
│   │   ├── enums/          # Role, Status enums
│   │   ├── models/         # SQLAlchemy models
│   │   ├── repositories/   # Data access layer
│   │   ├── routers/        # FastAPI endpoints
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   ├── alembic/            # Database migrations
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── api/                # API clients
│   ├── app/                # Expo Router screens
│   │   ├── (auth)/         # Login, Register
│   │   ├── (consumer)/     # Consumer screens
│   │   └── (supplier)/     # Supplier screens
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React Context (Auth)
│   ├── enums/              # TypeScript enums
│   ├── types/              # TypeScript interfaces
│   └── utils/              # Utilities
└── docker-compose.yml
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Key Endpoints

#### Authentication
```
POST /auth/register         # Register new user
POST /auth/login            # Login and get JWT token
GET  /auth/me              # Get current user info
```

#### Suppliers
```
GET  /suppliers             # List all suppliers (consumer discovery)
POST /suppliers             # Create supplier (owner only)
GET  /suppliers/me          # Get my supplier profile
```

#### Links (Connection Management)
```
POST /links/{supplier_id}   # Consumer requests link
POST /links/{link_id}/accept    # Owner/Manager accepts
POST /links/{link_id}/reject    # Owner/Manager rejects
GET  /links/me              # Get my links
```

#### Products
```
GET  /products              # List products (filtered by supplier)
POST /products              # Create product (owner/manager)
GET  /products/me           # Get my supplier's products
PUT  /products/{id}         # Update product
DELETE /products/{id}       # Delete product
```

#### Orders
```
POST /orders                # Consumer creates order
GET  /orders/me             # Get my orders
POST /orders/{id}/accept    # Supplier accepts order
POST /orders/{id}/reject    # Supplier rejects order
```

#### Chat
```
POST /chat/{link_id}/messages    # Send message
GET  /chat/{link_id}/messages    # Get messages for link
```

#### Complaints
```
POST /complaints                      # Create complaint
GET  /complaints                      # List complaints
POST /complaints/{id}/escalate        # Sales escalates to Manager
PATCH /complaints/{id}/status         # Update status
```

---

## 👥 User Roles

### Consumer (Restaurant/Hotel)
- Request links with suppliers
- View catalogs (only after link accepted)
- Place orders
- File complaints

### Supplier Owner
- Full control over supplier account
- Create/manage Manager and Sales accounts
- Approve/reject link requests
- Accept/reject orders
- Manage catalog

### Supplier Manager
- Same as Owner EXCEPT:
  - Cannot create/remove Manager accounts
  - Cannot delete supplier account
- Manages catalog and orders
- Resolves escalated complaints

### Supplier Sales
- Handles consumer communication (chat)
- Receives and responds to inquiries
- First-line complaint handling
- **Cannot** approve links or accept orders
- Can escalate issues to Manager/Owner

---

## 🔧 Development

### Backend Development

#### Run locally (without Docker)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://nu:swe@localhost:5432/scpnu"
export SECRET_KEY="your-secret-key"

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

#### Create new migration
```bash
cd backend
alembic revision -m "description"
# Edit the generated file in alembic/versions/
alembic upgrade head
```

### Frontend Development

#### Environment Setup
```bash
cd frontend
cp .env.example .env
# Update API_URL if needed
```

#### Run on different platforms
```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web browser
npm run web
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
pytest --cov=app  # With coverage
```

### API Manual Testing
Use the Swagger UI at `http://localhost:8000/docs` or import the OpenAPI spec into Postman.

---

## 🗂️ Database Schema

### Core Tables
- **users** - All users (consumers + suppliers)
- **suppliers** - Supplier companies
- **links** - Consumer ↔ Supplier relationships
- **products** - Supplier catalog items
- **orders** - Bulk orders from consumers
- **order_items** - Line items in orders
- **messages** - Chat messages between parties
- **complaints** - Customer complaints with escalation

### Key Relationships
- User (owner) → Supplier (1:1)
- Consumer (user) → Link ← Supplier (M:N)
- Link → Messages (1:N)
- Order → OrderItems → Products
- Link → Complaints

---

## 🎯 MVP Scope

### ✅ Included
- Consumer-Supplier linking system
- Catalog visible only to linked consumers
- Order creation, acceptance/rejection
- Chat with file support
- Complaint handling with escalation
- Role-based access control

### ❌ Not Included (Post-MVP)
- In-app payments
- Delivery scheduling
- Analytics dashboards
- Platform Admin functionality
- Ratings & reviews
- Subscription management

---

## 📝 License

This project is developed as part of CSCI 361 coursework at Nazarbayev University.

---

## 👨‍💻 Authors

**Group NN** - CSCI 361 Fall 2025

**Instructor:** Dr. Umair Arif, PhD

**Date:** November 2025

---

## 🆘 Troubleshooting

### Docker Issues
```bash
# Reset everything
docker-compose down -v
docker-compose up --build
```

### Database Connection Error
Check that PostgreSQL is running:
```bash
docker ps  # Should see scp_db container
```

### Migration Errors
```bash
# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d db
docker exec -it scp_api alembic upgrade head
```

### Frontend Cannot Connect to API
- Ensure API is running on `http://localhost:8000`
- Check `frontend/.env` has correct `API_URL`
- For Android emulator, use `http://10.0.2.2:8000`
- For iOS simulator, use `http://localhost:8000`

---

## 📞 Support

For issues and questions:
- Check `/docs` for API documentation
- Review SRS document for requirements
- Contact project team

---

**Built with ❤️ for CSCI 361**

