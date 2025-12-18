# Mirage Student Management System

A full-stack Student Management System built with React, Express, PostgreSQL, and Prisma.

![Mirage Logo](./assets/branding/logo.svg)

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (SUPER_ADMIN, ADMIN, STAFF)
- **Staff Management**: Create and manage staff accounts (ADMIN only)
- **Student Management**: Full CRUD with search and pagination
- **Teacher Management**: Full CRUD with search and pagination
- **Class/Section Management**: Organize students into classes
- **Subject Management**: Define curriculum subjects
- **Enrollment System**: Link students to classes per academic year
- **Attendance Tracking**: Daily attendance with history view
- **Fee Management**: Create dues, track payments
- **Dashboard**: Real-time KPIs and statistics
- **Audit Logs**: Track all system changes

## 📁 Project Structure

```
├── client/                 # Vite + React frontend
├── server/                 # Express backend
├── assets/                 # All images/branding
│   ├── branding/          # logo.svg, favicon.svg, og.png
│   ├── images/            # UI images
│   └── avatars/           # Default avatars
├── docs/                   # Documentation
├── render.yaml            # Render deployment blueprint
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- Vite + React
- React Router
- TailwindCSS
- Axios + TanStack Query
- React Hook Form + Zod
- react-hot-toast

### Backend
- Node.js + Express
- PostgreSQL + Prisma ORM
- JWT Authentication
- Zod validation
- bcrypt password hashing

## 🏃 Local Development

### Prerequisites
- Node.js >= 18
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd StudentManagementSystemWebApp
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment variables**

   Copy the example env files:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

   Edit `server/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/mirage_db"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   SUPER_ADMIN_PASSWORD="YourSecurePassword123!"
   PORT=5000
   CORS_ORIGIN="http://localhost:5173"
   ```

   Edit `client/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. **Set up the database**
   ```bash
   # Run migrations
   npm run prisma:migrate

   # Seed the database
   npm run prisma:seed
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

   This starts:
   - Backend: http://localhost:5000
   - Frontend: http://localhost:5173

### Default Login Credentials

After seeding, you can login with:
- **Super Admin**: `mirage@mirage.local` / (your SUPER_ADMIN_PASSWORD)
- **Admin**: `admin@mirage.local` / `Admin123!`
- **Staff**: `staff@mirage.local` / `Staff123!`

## 🧪 Running Tests

```bash
npm run test
```

## 🚀 Deployment (Render)

1. Push code to GitHub
2. Create a new Blueprint in Render Dashboard
3. Connect your repository
4. Render will auto-detect `render.yaml`
5. **Important**: Set `SUPER_ADMIN_PASSWORD` manually in Render Dashboard for the backend service
6. Deploy!

The blueprint will automatically:
- Provision a PostgreSQL database
- Deploy the backend API with auto-migrations
- Deploy the frontend static site

## 📚 API Documentation

See [docs/API.md](./docs/API.md) for full API documentation.

### API Response Format

All API responses follow this format:

**Success:**
```json
{
  "data": { ... },
  "error": null,
  "meta": { "total": 100, "page": 1, "limit": 10, "totalPages": 10 }
}
```

**Error:**
```json
{
  "data": null,
  "error": { "message": "Error message", "code": "ERROR_CODE", "details": [] },
  "meta": null
}
```

## 🎨 Theme

Mirage uses a dark neon blue theme:
- **Background**: Deep navy/black
- **Primary**: Neon blue (#3B82F6)
- **Accent**: Cyan/Teal (#06B6D4)
- **Secondary Accent**: Purple (#8B5CF6)
- **Text**: Light gray (#E5E7EB)

## 📄 License

MIT License
