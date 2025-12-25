# Multi-Tenant SaaS Platform

## Project Overview
This represents a production-ready, multi-tenant SaaS application built for organizations to manage teams, projects, and tasks. It features complete data isolation, role-based access control (RBAC), and subscription management.

## Features
- **Multi-Tenancy**: Data isolation per tenant using `tenant_id`.
- **Authentication**: JWT-based stateless auth with 24h expiry.
- **RBAC**: Super Admin, Tenant Admin, and User roles.
- **Project Management**: Create, list, update, and delete projects.
- **Task Management**: Track tasks with priorities and statuses.
- **Subscription Limits**: Enforced limits on users and projects per plan.
- **Responsive Frontend**: React-based UI with Tailwind CSS.
- **Dockerized**: specific container orchestration for Database, Backend, and Frontend.

## Technology Stack
- **Frontend**: React (Vite), Tailwind CSS, Axios
- **Backend**: Node.js, Express, Sequelize
- **Database**: PostgreSQL
- **DevOps**: Docker, Docker Compose

## Architecture
- **Client**: React SPA
- **API**: RESTful Node.js API
- **DB**: Postgres with Shared Database / Shared Schema pattern

## Installation & Setup

### Prerequisites
- Docker and Docker Compose installed.

### Running the Application
1. **Clone the repository.**
2. **Start the application:**
   ```bash
   docker-compose up -d
   ```
   This cmd will:
   - Start PostgreSQL container.
   - Start Backend container (and run migrations/seeds automatically).
   - Start Frontend container.

3. **Access the application:**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)

### Environment Variables
**Backend (.env)**
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Database connection details.
- `JWT_SECRET`: Secret for signing tokens.
- `FRONTEND_URL`: URL for CORS.

**Frontend**
- `VITE_API_URL`: Backend API URL (default: http://localhost:5000/api).

## API Documentation
The API provides 19 endpoints across the following modules:
- Auth (`/api/auth`)
- Tenants (`/api/tenants`)
- Users (`/api/users` & `/api/tenants/:id/users`)
- Projects (`/api/projects`)
- Tasks (`/api/tasks` & `/api/projects/:id/tasks`)

## Testing
Use the credentials provided in `submission.json` to test the application via the UI or API tools.
- **Super Admin**: `superadmin@system.com` / `Admin@123`
- **Tenant Admin**: `admin@demo.com` / `Demo@123`
