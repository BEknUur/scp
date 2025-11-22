# Supplier-Consumer Platform (SCP)

A B2B mobile and web application that connects food suppliers with institutional consumers (restaurants and hotels). This platform facilitates direct collaboration, order management, and communication between suppliers and their approved business partners.

## Project Overview

SCP is a private B2B platform where consumers must request and be approved for a "link" with suppliers before they can view products, prices, and place orders. This is not a public marketplace - all relationships are managed through an approval-based linking system.

### Key Features

**For Consumers (Restaurants/Hotels):**
- Discover and request links with suppliers
- Browse product catalogs after link approval
- Create bulk orders with multiple items
- Real-time chat with supplier representatives
- File and track complaints related to orders
- Monitor order status and history

**For Suppliers:**
- Create and manage company profiles
- Manage product catalogs (prices, stock, minimum order quantities)
- Approve or reject consumer link requests
- Accept or reject incoming orders
- Multi-role system: Owner, Manager, Sales
- Handle customer complaints with escalation workflow
- Communicate with linked consumers via chat

## Technology Stack

### Backend
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL 16
- **ORM:** SQLAlchemy 2.0
- **Migrations:** Alembic
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Pydantic
- **Containerization:** Docker & Docker Compose

### Frontend
- **Framework:** React Native with Expo
- **Navigation:** Expo Router
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Internationalization:** react-i18next (English, Russian)
- **UI Components:** Custom components with theming

### Infrastructure
- **Containerization:** Docker Compose
- **Database:** PostgreSQL container
- **API Server:** Uvicorn (ASGI)

## Prerequisites

Before running the project, ensure you have the following installed:

- Docker and Docker Compose
- Node.js 18 or higher
- npm or yarn
- Make (optional, for convenience commands)
- ngrok (for testing on physical devices)

## Project Structure

```
scp/
├── backend/          # FastAPI backend application
│   ├── app/
│   │   ├── core/     # Configuration, security, dependencies
│   │   ├── models/   # SQLAlchemy database models
│   │   ├── schemas/  # Pydantic schemas for API
│   │   ├── routers/  # API route handlers
│   │   ├── services/ # Business logic
│   │   └── repositories/ # Data access layer
│   ├── alembic/      # Database migrations
│   └── Dockerfile
├── frontend/          # React Native Expo application
│   ├── app/          # Expo Router pages
│   ├── components/   # Reusable UI components
│   ├── api/          # API client functions
│   ├── contexts/     # React contexts
│   ├── hooks/        # Custom React hooks
│   └── locales/      # i18n translation files
├── docker-compose.yml # Docker services configuration
└── Makefile          # Convenience commands
```

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd scp
```

### 2. Backend Setup

The backend runs in Docker containers. Start the services:

```bash
make start-backend
```

Or manually:

```bash
docker compose up --build -d
```

This will start:
- PostgreSQL database on port 5432
- FastAPI server on port 8000

The API will be available at `http://localhost:8000`

API documentation (Swagger UI): `http://localhost:8000/docs`

### 3. Database Migrations

Run migrations to set up the database schema:

```bash
docker exec scp_api alembic upgrade head
```

### 4. Frontend Setup

Install dependencies:

```bash
cd frontend
npm install
```

Start the development server:

```bash
make start-frontend
```

Or manually:

```bash
npm run start -- --tunnel
```

The `--tunnel` flag uses Expo's tunnel mode, which allows you to access the app from physical devices on the same network.

### 5. Testing on Physical Devices

To test the mobile app on a physical device, you have two options:

#### Option A: Using Expo Tunnel (Recommended)

When you run `npm run start -- --tunnel`, Expo will provide a URL that works from any device. Scan the QR code with:
- **iOS:** Camera app
- **Android:** Expo Go app

#### Option B: Using ngrok

If you need a more stable tunnel or want to test with a custom domain:

1. Install ngrok:
```bash
npm install -g ngrok
# or
brew install ngrok  # macOS
```

2. Start the frontend normally:
```bash
cd frontend
npm run start
```

3. In another terminal, create a tunnel:
```bash
ngrok http 8081
```

4. Use the ngrok URL (e.g., `https://abc123.ngrok.io`) to access the app from your device.

Note: The default Expo dev server runs on port 8081. Adjust the ngrok command if your port differs.

### 6. Access the Application

**Web Interface:**
- Press `w` in the Expo terminal to open in web browser

**Mobile Devices:**
- Scan the QR code with Expo Go app (Android) or Camera app (iOS)
- Or use the ngrok URL if configured

**API:**
- Swagger UI: http://localhost:8000/docs
- API Base: http://localhost:8000

## Environment Configuration

### Backend

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql://nu:swe@db:5432/scpnu
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

The default configuration in `docker-compose.yml` uses:
- Database: `scpnu`
- User: `nu`
- Password: `swe`

### Frontend

The frontend uses environment variables for API configuration. Update the API base URL in `frontend/api/client.ts` if needed.

## User Roles

The platform supports multiple user roles:

- **CONSUMER:** Restaurants and hotels that purchase from suppliers
- **SUPPLIER_OWNER:** Company owner with full access
- **SUPPLIER_MANAGER:** Manager with order and link management access
- **SUPPLIER_SALES:** Sales representative with communication and complaint handling access

## Development

### Running Migrations

Create a new migration:
```bash
docker exec scp_api alembic revision -m "migration_name"
```

Apply migrations:
```bash
docker exec scp_api alembic upgrade head
```

### Viewing Logs

Backend logs:
```bash
docker compose logs -f api
```

Database logs:
```bash
docker compose logs -f db
```

### Stopping Services

Stop all services:
```bash
docker compose down
```

Stop and remove volumes (clears database):
```bash
docker compose down -v
```

## API Documentation

Full API documentation is available at `http://localhost:8000/docs` when the backend is running.

For detailed endpoint documentation, see `BACKEND_ENDPOINTS.md`.

## Internationalization

The frontend supports multiple languages:
- English (default)
- Russian

Language can be changed in the user profile settings.

## Troubleshooting

**Backend won't start:**
- Check if ports 8000 and 5432 are available
- Ensure Docker is running
- Check logs: `docker compose logs api`

**Frontend connection issues:**
- Ensure backend is running and accessible
- Check API base URL in `frontend/api/client.ts`
- Verify network connectivity if using tunnel mode

**Database connection errors:**
- Ensure PostgreSQL container is running: `docker compose ps`
- Check database credentials in `.env` file
- Verify migrations are applied: `docker exec scp_api alembic current`

**Mobile device can't connect:**
- Ensure device is on the same network (for LAN mode)
- Use `--tunnel` flag or ngrok for external access
- Check firewall settings
- Verify Expo Go app is installed on device

