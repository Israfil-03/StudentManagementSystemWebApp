# Student Management System

This is a full-stack monorepo for a Student Management System, built with a modern tech stack. The project is structured with a clean architecture to ensure maintainability and scalability.

## Tech Stack

**Monorepo:**
- **npm Workspaces** for managing dependencies.
- **TypeScript** for static typing across the entire stack.
- **ESLint & Prettier** for code quality and consistent formatting.
- **concurrently** to run multiple services in development.

**Backend (server/):**
- **Framework:** Node.js with Express.
- **ORM:** Prisma with PostgreSQL.
- **Authentication:** JWT (JSON Web Tokens).
- **Validation:** Zod for schema validation.
- **Language:** TypeScript.

**Frontend (client/):**
- **Framework:** React with Vite.
- **Routing:** React Router.
- **State Management:** Zustand.
- **UI:** Tailwind CSS with Headless UI (placeholders).
- **API Client:** Axios.
- **Language:** TypeScript (strict mode).

## Folder Structure

The project is a monorepo with two main packages: `client` and `server`.

```
/
├── client/           # Frontend React SPA
│   ├── src/
│   │   ├── api/      # Axios client and API hooks
│   │   ├── components/ # Reusable UI components
│   │   ├── features/ # Feature-based modules (auth, students, etc.)
│   │   ├── routes/   # React Router configuration
│   │   ├── store/    # Zustand state management
│   │   └── ...
│   └── package.json
├── server/           # Backend Express API
│   ├── prisma/       # Prisma schema and migrations
│   ├── src/
│   │   ├── config/   # Environment variables and configs
│   │   ├── controllers/ # Request handlers
│   │   ├── middlewares/ # Express middlewares
│   │   ├── routes/   # API route definitions
│   │   ├── services/ # Business logic
│   │   └── ...
│   └── package.json
├── .gitignore
├── .env.example      # Example environment variables
├── package.json      # Root package.json with monorepo scripts
├── README.md
└── tsconfig.base.json
```

## How to Run Locally

### 1. Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)
- PostgreSQL database running locally or on a cloud service.

### 2. Initial Setup

1.  **Clone the repository.**

2.  **Create `.env` file:**
    Duplicate the `.env.example` file in the root directory and rename it to `.env`.

    ```bash
    cp .env.example .env
    ```

3.  **Configure Environment Variables:**
    Open the new `.env` file and update the variables:
    - `DATABASE_URL`: Set your PostgreSQL connection string.
    - `JWT_SECRET`: Change this to a long, secure, random string.
    - The other variables can often be left as their defaults for local development.

4.  **Install Dependencies:**
    From the root directory, run the `install:all` script. This will install dependencies for the root, `server`, and `client`.

    ```bash
    npm run install:all
    ```

### 3. Database Migration

The backend uses Prisma to manage the database schema.

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```

2.  **Run the initial migration:**
    This command will create the tables in your database based on the `prisma/schema.prisma` file.
    ```bash
    npm run migrate
    ```
    You will be prompted to name the migration. Something like "init" is fine.

3.  **(Optional) Seed the database with sample data:**
    ```bash
    npm run seed
    ```
    This creates sample users with the following credentials:
    - **Admin:** admin@school.com / admin123
    - **Teacher:** john.smith@school.com / teacher123
    - **Student:** alice@school.com / student123

### 4. Run in Development Mode

1.  **Go back to the root directory:**
    ```bash
    cd ..
    ```

2.  **Start both frontend and backend:**
    This command uses `concurrently` to start both the Vite dev server (for the client) and the Express API server (for the backend).

    ```bash
    npm run dev
    ```

- The **backend** will be available at `http://localhost:3001` (or the `PORT` you set).
- The **frontend** will be available at `http://localhost:5173` (Vite's default).

You can also run them separately:
- `npm run dev:client`
- `npm run dev:server`

## Build and Deploy

### Building for Production

To build both applications for production, run this command from the root directory:

```bash
npm run build
```
This will:
- Compile the TypeScript server code into the `server/dist` directory.
- Build the static frontend assets into the `client/dist` directory.

### Running in Production

- **Server:** After building, you can start the production server with `npm run start --workspace=server`. This runs the compiled JavaScript.
- **Client:** The `client/dist` folder contains static files. Deploy this folder to a static hosting provider like Netlify, Vercel, or Render.

## Deployment Guide

### Backend Deployment (Azure App Service)

1. **Create an Azure PostgreSQL Database:**
   - Create a "Azure Database for PostgreSQL - Flexible Server" in Azure Portal
   - Note down the connection string

2. **Create Azure App Service:**
   - Create a new Web App with Node.js runtime
   - Configure deployment from GitHub (your repository)

3. **Set Environment Variables in Azure:**
   Go to Configuration > Application settings and add:
   ```
   DATABASE_URL=postgresql://user:password@your-azure-host.postgres.database.azure.com:5432/student_management?schema=public&sslmode=require
   JWT_SECRET=your-secure-random-string
   CORS_ORIGIN=https://your-netlify-app.netlify.app
   NODE_ENV=production
   PORT=8080
   ```

4. **Configure Build Settings:**
   - Build command: `cd server && npm install && npx prisma generate && npm run build`
   - Start command: `cd server && npm run start`

5. **Run Database Migration:**
   After deployment, run migrations via Azure CLI or Kudu console:
   ```bash
   cd server && npx prisma migrate deploy
   ```

### Frontend Deployment (Netlify)

1. **Connect Repository to Netlify:**
   - Go to Netlify Dashboard > "Add new site" > "Import an existing project"
   - Connect your GitHub repository

2. **Configure Build Settings:**
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`

3. **Set Environment Variables:**
   Go to Site settings > Environment variables and add:
   ```
   VITE_API_BASE_URL=https://your-azure-app.azurewebsites.net/api
   ```

4. **Create `client/.env.production`:** (Optional - for build time)
   ```
   VITE_API_BASE_URL=https://your-azure-app.azurewebsites.net/api
   ```

### Important Notes

- **CORS:** Make sure `CORS_ORIGIN` on the backend matches your Netlify frontend URL exactly
- **SSL:** Both services will have HTTPS by default
- **Database:** Use `sslmode=require` in the DATABASE_URL for Azure PostgreSQL

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get current user profile (protected)

### Students (Admin/Teacher)
- `GET /api/students` - List all students
- `GET /api/students/:id` - Get student by ID
- `GET /api/students/me` - Get current student profile (student only)
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Teachers (Admin)
- `GET /api/teachers` - List all teachers
- `GET /api/teachers/:id` - Get teacher by ID
- `GET /api/teachers/me` - Get current teacher profile (teacher only)

### Classes
- `GET /api/classes` - List all classes
- `POST /api/classes` - Create a new class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Subjects
- `GET /api/subjects` - List all subjects
- `POST /api/subjects` - Create subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Attendance (Teacher/Admin)
- `POST /api/attendance` - Mark attendance
- `POST /api/attendance/bulk` - Mark bulk attendance
- `GET /api/attendance/me` - Get student's own attendance
- `GET /api/attendance/class/:classId` - Get class attendance

### Marks (Teacher/Admin)
- `POST /api/marks` - Add/update marks
- `GET /api/marks/me` - Get student's own marks
- `GET /api/marks/student/:studentId` - Get student marks
- `GET /api/marks/class/:classId` - Get class marks

