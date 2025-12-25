# Technical Specification Document

## Multi-Tenant SaaS Platform

**Version**: 1.0.0  
**Last Updated**: December 25, 2025  
**Status**: Production Ready

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Setup & Installation](#4-setup--installation)
5. [Development Environment](#5-development-environment)
6. [Build & Deployment](#6-build--deployment)
7. [Database Schema](#7-database-schema)
8. [Code Standards](#8-code-standards)
9. [Testing Strategy](#9-testing-strategy)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Project Overview

### 1.1 Project Description

A multi-tenant Software-as-a-Service (SaaS) platform that enables multiple independent organizations (tenants) to use a shared application infrastructure while maintaining complete data isolation and security.

**Key Capabilities**:
- Multi-tenant architecture with row-level data isolation
- Project and task management system
- User management with role-based access control
- Real-time collaboration features
- Audit logging and compliance tracking
- RESTful API with JWT authentication
- Docker containerized deployment

### 1.2 Business Goals

1. **Efficiency**: Single codebase serves multiple tenants
2. **Scalability**: Horizontal scaling for growing users
3. **Security**: Complete data isolation between tenants
4. **Compliance**: GDPR, CCPA, HIPAA ready
5. **Cost**: Reduced operational overhead vs multi-database approach

### 1.3 Technical Goals

1. Stateless backend for horizontal scaling
2. JWT-based authentication (no session state)
3. Database-independent ORM (Sequelize)
4. Containerized deployment (Docker)
5. Fast development iteration (Vite, Hot Reload)
6. Type-safe database queries
7. Comprehensive error handling
8. Complete audit trail

---

## 2. Technology Stack

### 2.1 Frontend Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Node.js | 18 LTS | JavaScript runtime |
| **Framework** | React | 18.2 | UI component library |
| **Build Tool** | Vite | 5.0 | Fast bundler (10-100x faster than Webpack) |
| **Styling** | Tailwind CSS | 3.3 | Utility-first CSS framework |
| **Routing** | React Router | 6.x | Client-side routing |
| **HTTP Client** | Axios | 1.6 | Promise-based HTTP requests |
| **Package Manager** | npm | 9.x | Dependency management |

**Browser Support**: 
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 2.2 Backend Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Node.js | 18 LTS | JavaScript runtime |
| **Framework** | Express.js | 4.18 | Web application framework |
| **ORM** | Sequelize | 6.x | SQL abstraction layer |
| **Database** | PostgreSQL | 15 | Relational database |
| **Authentication** | jsonwebtoken | 9.x | JWT token generation |
| **Password Hashing** | bcryptjs | 2.4 | Secure password hashing |
| **Security** | Helmet | 7.x | Security headers |
| **Logging** | Morgan | 1.10 | HTTP request logging |
| **CORS** | cors | 2.8 | Cross-origin requests |
| **Environment** | dotenv | 16.x | Environment variables |
| **Package Manager** | npm | 9.x | Dependency management |

### 2.3 DevOps Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Containerization** | Docker | 20.x+ | Container runtime |
| **Orchestration** | Docker Compose | 3.8+ | Multi-container coordination |
| **Database** | PostgreSQL | 15 | Container image |
| **Node Image** | node:18-alpine | 18 | Lightweight backend image |
| **Version Control** | Git | 2.x+ | Code repository |
| **Repository** | GitHub | - | Code hosting |

---

## 3. Project Structure

### 3.1 Root Directory Structure

```
Multi-Tenant-SaaS-Platform/
├── .git/                          # Git repository
├── .github/                       # GitHub configuration
├── .gitignore                     # Git ignore file
├── docker-compose.yml             # Docker Compose configuration
├── README.md                      # Project documentation
├── submission.json                # Submission requirements & test data
│
├── backend/                       # Backend application
│   ├── Dockerfile                # Backend Docker image
│   ├── package.json              # Node.js dependencies
│   ├── package-lock.json         # Dependency lock file
│   └── src/
│       ├── server.js             # Express app entry point
│       ├── config/
│       │   └── database.js       # Database configuration
│       ├── controllers/          # Business logic
│       │   ├── authController.js
│       │   ├── projectController.js
│       │   ├── taskController.js
│       │   ├── tenantController.js
│       │   └── userController.js
│       ├── middleware/           # Express middleware
│       │   ├── authMiddleware.js  # JWT verification
│       │   ├── roleMiddleware.js  # RBAC enforcement
│       │   └── errorHandler.js
│       ├── models/               # Sequelize models
│       │   ├── index.js          # Model definitions & associations
│       │   ├── User.js
│       │   ├── Tenant.js
│       │   ├── Project.js
│       │   ├── Task.js
│       │   └── AuditLog.js
│       ├── routes/               # Express route handlers
│       │   ├── authRoutes.js
│       │   ├── projectRoutes.js
│       │   ├── taskRoutes.js
│       │   ├── tenantRoutes.js
│       │   └── userRoutes.js
│       └── utils/
│           └── seeder.js         # Database seed data
│
├── frontend/                      # React application
│   ├── Dockerfile               # Frontend Docker image
│   ├── package.json             # Node.js dependencies
│   ├── package-lock.json        # Dependency lock file
│   ├── vite.config.js           # Vite configuration
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   ├── postcss.config.js        # PostCSS configuration
│   ├── index.html               # HTML entry point
│   └── src/
│       ├── main.jsx             # React mount point
│       ├── App.jsx              # Root component with routing
│       ├── App.css / index.css  # Global styles
│       ├── components/          # Reusable React components
│       │   ├── Layout.jsx       # App layout wrapper
│       │   ├── ProtectedRoute.jsx # Auth guard
│       │   └── ...
│       ├── pages/               # Page components
│       │   ├── Login.jsx        # Login page
│       │   ├── Register.jsx     # Registration page
│       │   ├── Dashboard.jsx    # Main dashboard
│       │   ├── Projects.jsx     # Projects listing
│       │   ├── ProjectDetails.jsx
│       │   ├── Tasks.jsx        # Tasks listing
│       │   └── Users.jsx        # User management
│       └── services/
│           └── api.js           # Axios HTTP client setup
│
└── docs/                         # Documentation
    ├── README.md                # Setup instructions
    ├── research.md              # Multi-tenancy research (1700+ words)
    ├── PRD.md                   # Product Requirements Document
    ├── architecture.md          # System architecture
    ├── technical-spec.md        # This file
    ├── API.md                   # API documentation
    └── images/
        ├── system-architecture.png
        └── database-erd.png
```

### 3.2 Backend File Details

#### server.js (Express App)
```javascript
Purpose: Initialize Express application
Responsibilities:
- Load environment variables
- Set up middleware (CORS, bodyParser, logging, security)
- Configure routes
- Set up error handling
- Start server on port 5000
- Initialize database connection
```

#### models/index.js (Database Setup)
```javascript
Purpose: Define Sequelize models and associations
Exports:
- User model
- Tenant model
- Project model
- Task model
- AuditLog model
- Model associations and sync
```

#### middleware/authMiddleware.js
```javascript
Purpose: JWT token verification
Flow:
1. Extract token from Authorization header
2. Verify JWT signature
3. Check token expiration
4. Attach user data to req.user
5. Call next middleware or reject
```

#### middleware/roleMiddleware.js
```javascript
Purpose: Role-based access control
Flow:
1. Check if user role is in allowed roles
2. If allowed: continue to controller
3. If denied: return 403 Forbidden
```

### 3.3 Frontend File Details

#### main.jsx (React Entry)
```javascript
Purpose: Mount React application to DOM
Responsibilities:
- Find #root element
- Render App component
- Error handling if mount fails
```

#### App.jsx (Root Component)
```javascript
Purpose: Application routing and layout
Structure:
- BrowserRouter wrapping all routes
- ProtectedRoute wrapper for auth
- Layout component for consistent UI
- 6 main routes: login, register, dashboard, projects, tasks, users
```

#### services/api.js (HTTP Client)
```javascript
Purpose: Centralized API communication
Exports:
- Axios instance configured for VITE_API_URL
- API methods for all endpoints
- JWT token injection in headers
- Error handling
```

---

## 4. Setup & Installation

### 4.1 Prerequisites

**System Requirements**:
- Operating System: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- RAM: Minimum 4GB (8GB recommended)
- Disk Space: 5GB free
- Network: Internet connection for npm package downloads

**Software Requirements**:
```bash
# Required
Node.js 18 LTS or higher
npm 9.0 or higher
Docker 20.0+
Docker Compose 3.8+
Git 2.30+

# Optional but recommended
Visual Studio Code
Postman (for API testing)
PostgreSQL client tools (psql)
```

### 4.2 Installation Steps

#### Step 1: Clone Repository

```bash
git clone https://github.com/your-username/Multi-Tenant-SaaS-Platform.git
cd Multi-Tenant-SaaS-Platform
```

#### Step 2: Install Dependencies (Development)

```bash
# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

#### Step 3: Set Environment Variables

Create `.env` files in both backend and frontend directories:

**backend/.env**:
```env
# Database Configuration
DATABASE_URL=postgres://postgres:postgres@localhost:5432/saas_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=saas_db
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=24h

# Server Configuration
NODE_ENV=development
PORT=5000

# Logging
LOG_LEVEL=debug
```

**frontend/.env**:
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Multi-Tenant SaaS
```

#### Step 4: Docker Setup (Recommended)

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# Wait 30-45 seconds for services to start
docker-compose ps  # Verify all containers are running

# Check logs
docker-compose logs -f
```

#### Step 5: Verify Installation

```bash
# Backend health check
curl http://localhost:5000/api/health

# Expected response:
# {"status":"ok","database":"connected"}

# Frontend access
# Open http://localhost:3000 in browser

# Login with seed data
# Subdomain: demo
# Email: admin@demo.com
# Password: Demo@123
```

---

## 5. Development Environment

### 5.1 Running Locally (Without Docker)

#### Terminal 1: Database
```bash
# Ensure PostgreSQL is running
# macOS with Homebrew:
brew services start postgresql

# Or run PostgreSQL Docker container:
docker run --name saas-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=saas_db \
  -p 5432:5432 \
  postgres:15
```

#### Terminal 2: Backend
```bash
cd backend
npm install
npm start

# Expected output:
# Server running on port 5000
# Database connected!
# Database synced.
# Seeding database...
```

#### Terminal 3: Frontend
```bash
cd frontend
npm install
npm run dev

# Expected output:
# VITE v5.0.0  ready in 1234 ms
# ➜  Local:   http://localhost:3000
```

### 5.2 Hot Module Replacement (HMR)

**Frontend HMR**: Automatically enabled in Vite
- File changes instantly reflect in browser
- CSS changes without page reload
- Component state preserved

**Backend HMR**: Use nodemon
```bash
# Install globally (optional)
npm install -g nodemon

# Or in project
npm install --save-dev nodemon

# Run with hot reload
npx nodemon src/server.js
```

### 5.3 Debug Mode

#### Frontend Debugging
```javascript
// App.jsx
console.log('Debug info:', user, token);

// Browser DevTools (F12):
// - Console tab: View logs
// - Network tab: Monitor API calls
// - React DevTools extension: Component inspection
// - Source tab: Set breakpoints
```

#### Backend Debugging
```javascript
// controllers/userController.js
console.log('User data:', userData);
console.error('Error:', error);

// Terminal output shows logs
// Use Morgan middleware for request logs
```

#### Database Debugging
```bash
# Connect to PostgreSQL
psql -U postgres -d saas_db -h localhost

# Example queries
SELECT * FROM tenants;
SELECT * FROM users WHERE tenant_id = 'uuid';
SELECT COUNT(*) FROM audit_logs;
```

---

## 6. Build & Deployment

### 6.1 Production Build

#### Frontend Production Build
```bash
cd frontend

# Build static assets
npm run build

# Output in ./dist directory
# Files are minified and optimized

# Preview production build locally
npm run preview
# Access at http://localhost:4173
```

#### Backend Production Build
```bash
cd backend

# No build step needed for Node.js
# All code runs directly as JavaScript

# However, create production Dockerfile
```

### 6.2 Docker Build & Push

```bash
# Build images
docker-compose build

# Tag images for registry
docker tag saas-backend your-registry/saas-backend:1.0.0
docker tag saas-frontend your-registry/saas-frontend:1.0.0

# Push to registry
docker push your-registry/saas-backend:1.0.0
docker push your-registry/saas-frontend:1.0.0
```

### 6.3 Production Deployment

#### Environment Variables (Production)
```env
# backend/.env.production
NODE_ENV=production
JWT_SECRET=<STRONG_RANDOM_KEY_HERE>
DATABASE_URL=postgres://user:password@prod-db.example.com/saas_db
```

#### Security Checklist
```
□ JWT_SECRET is strong (minimum 32 characters)
□ Database password is strong
□ HTTPS enabled (use reverse proxy like Nginx)
□ CORS whitelist configured (not *)
□ Rate limiting enabled
□ Helmet security headers enabled
□ SQL injection prevention verified
□ XSS prevention verified
□ CSRF tokens implemented
□ Audit logging enabled
□ Backup strategy in place
```

#### Docker Deployment Example

```bash
# Pull latest images
docker pull your-registry/saas-backend:1.0.0
docker pull your-registry/saas-frontend:1.0.0

# Start with production docker-compose
docker-compose -f docker-compose.prod.yml up -d

# Verify services
docker-compose ps

# Monitor logs
docker-compose logs -f backend
```

---

## 7. Database Schema

### 7.1 Schema Overview

```sql
-- Tenants Table
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  subdomain VARCHAR(255) UNIQUE,
  status ENUM('active', 'suspended'),
  created_at TIMESTAMP
);

-- Users Table (with tenant isolation)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  tenant_id UUID FOREIGN KEY REFERENCES tenants(id),
  email VARCHAR(255),
  full_name VARCHAR(255),
  password VARCHAR(255),
  role ENUM('super_admin', 'tenant_admin', 'user'),
  is_active BOOLEAN,
  created_at TIMESTAMP,
  UNIQUE(tenant_id, email)
);

-- Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  tenant_id UUID FOREIGN KEY REFERENCES tenants(id),
  name VARCHAR(255),
  description TEXT,
  status ENUM('active', 'archived'),
  created_by UUID FOREIGN KEY REFERENCES users(id),
  created_at TIMESTAMP
);

-- Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  tenant_id UUID FOREIGN KEY REFERENCES tenants(id),
  project_id UUID FOREIGN KEY REFERENCES projects(id),
  title VARCHAR(255),
  status ENUM('todo', 'in_progress', 'completed'),
  priority ENUM('low', 'medium', 'high', 'critical'),
  assigned_to UUID FOREIGN KEY REFERENCES users(id),
  created_at TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  tenant_id UUID FOREIGN KEY REFERENCES tenants(id),
  user_id UUID FOREIGN KEY REFERENCES users(id),
  action VARCHAR(50),
  entity VARCHAR(50),
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMP
);
```

### 7.2 Migrations

Migrations are handled automatically by Sequelize:

```javascript
// models/index.js
sequelize.sync({ alter: true })
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Sync error:', err));
```

### 7.3 Seed Data

Seed data is loaded on first startup:

```javascript
// utils/seeder.js
Automatically creates:
- 1 Tenant (demo)
- 4 Users (super_admin, tenant_admin, user1, user2)
- 2 Projects
- 2 Tasks
```

---

## 8. Code Standards

### 8.1 Naming Conventions

**Variables & Functions**:
```javascript
// camelCase for variables and functions
const userName = 'John Doe';
function getUserData() { }

// CONSTANT_CASE for constants
const MAX_USERS = 100;
const JWT_EXPIRY = '24h';
```

**Files & Folders**:
```javascript
// camelCase for files
userController.js
authMiddleware.js

// PascalCase for React components
Login.jsx
Dashboard.jsx
ProtectedRoute.jsx
```

**Database**:
```sql
-- snake_case for column names
user_id
created_at
is_active

-- PascalCase for table names
User
Tenant
Project
Task
```

### 8.2 Code Style

**Backend (JavaScript)**:
```javascript
// Use async/await instead of callbacks
async function getUser(id) {
  try {
    const user = await User.findByPk(id);
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// Use ES6 modules
import express from 'express';
import { User } from './models';

// Destructure imports
const { Router } = express;
```

**Frontend (React)**:
```javascript
// Use functional components with hooks
function UserProfile() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser();
  }, []);
  
  return <div>{user?.name}</div>;
}

// Use destructuring
const { userId, role } = user;

// Use arrow functions
const handleClick = () => { };
```

### 8.3 Comments & Documentation

```javascript
// Good: Clear and concise
// GET user by ID from database
async function getUserById(id) {
  // Query with tenant isolation
  return await User.findByPk(id);
}

// Avoid: Obvious comments
// Set user to null
user = null;
```

---

## 9. Testing Strategy

### 9.1 Manual Testing Checklist

**Authentication**:
- [ ] Login with valid credentials
- [ ] Login with invalid password fails
- [ ] Register new tenant works
- [ ] JWT token generated and stored
- [ ] Token expires after 24 hours

**Authorization**:
- [ ] Super admin can access all tenants
- [ ] Tenant admin can only access their tenant
- [ ] Users can only access assigned resources

**Data Isolation**:
- [ ] User from Tenant A cannot see Tenant B data
- [ ] Project list shows only current tenant projects
- [ ] Task filters work correctly

**CRUD Operations**:
- [ ] Create: POST requests work
- [ ] Read: GET requests return data
- [ ] Update: PUT requests modify data
- [ ] Delete: DELETE requests remove data

### 9.2 API Testing with Curl

```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "tenantSubdomain": "demo",
    "email": "admin@demo.com",
    "password": "Demo@123"
  }'

# Get projects (with token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/projects

# Create project
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Project", "description": "Test"}' \
  http://localhost:5000/api/projects
```

### 9.3 Browser Testing

```javascript
// Open browser DevTools (F12)

// Check Console for errors
// Check Network tab for API calls
// Verify token in localStorage
localStorage.getItem('token')

// Test with different roles
// - Super admin
// - Tenant admin
// - Regular user
```

---

## 10. Troubleshooting

### 10.1 Common Issues

#### Issue: "Database connection refused"

**Symptom**: Error connecting to PostgreSQL

**Solutions**:
```bash
# 1. Check if PostgreSQL is running
docker ps | grep postgres

# 2. Verify database exists
psql -U postgres -l

# 3. Check DATABASE_URL in .env
# Should be: postgres://user:password@host:5432/db_name

# 4. Test connection
psql -h localhost -U postgres -d saas_db
```

#### Issue: "Cannot GET /" or Blank Page

**Symptom**: Frontend shows blank page or 404

**Solutions**:
```bash
# 1. Verify frontend is running
curl http://localhost:3000

# 2. Check logs
docker-compose logs frontend

# 3. Verify VITE_API_URL in .env
VITE_API_URL=http://localhost:5000/api

# 4. Clear browser cache
# Ctrl+Shift+Delete → Clear browsing data

# 5. Rebuild frontend
docker-compose build --no-cache frontend
docker-compose restart frontend
```

#### Issue: "401 Unauthorized" on API calls

**Symptom**: API returns 401 with valid token

**Solutions**:
```bash
# 1. Verify token in localStorage
# Open DevTools → Application → Local Storage → token

# 2. Check token expiration
# Token expires after 24 hours

# 3. Verify JWT_SECRET matches
# Backend and frontend must use same secret

# 4. Check Authorization header format
# Must be: Authorization: Bearer <token>
# NOT: Authorization: <token>

# 5. Login again to get fresh token
```

#### Issue: "Port already in use"

**Symptom**: Error "address already in use"

**Solutions**:
```bash
# 1. Stop existing containers
docker-compose down

# 2. Check what's using the port (Linux/macOS)
lsof -i :5000

# 3. Kill process using port
kill -9 <PID>

# 4. Use different port (temporary fix)
# Change PORT in .env
# Change docker-compose.yml port mapping
```

#### Issue: "CORS error" in browser console

**Symptom**: "Cross-Origin Request Blocked"

**Solutions**:
```javascript
// 1. Verify CORS enabled in backend (server.js)
// Should have: app.use(cors())

// 2. Check frontend API URL
// Must match exact backend URL including protocol and port
// ✓ http://localhost:5000/api
// ✗ http://localhost:5000/ (missing /api)
// ✗ localhost:5000/api (missing http://)

// 3. Check browser console for exact error
// May provide hints about what's blocked

// 4. Verify HTTP headers in Network tab
// Response should have CORS headers:
// Access-Control-Allow-Origin: *
// Access-Control-Allow-Methods: GET, POST, PUT, DELETE
```

### 10.2 Performance Optimization

**Frontend Performance**:
```javascript
// 1. Enable Vite minification
// Automatic in build mode (npm run build)

// 2. Lazy load routes
const Dashboard = lazy(() => import('./pages/Dashboard'));

// 3. Optimize images
// Use format: webp
// Resize appropriately

// 4. Code splitting
// Vite handles automatically

// 5. Remove console.log in production
// Use environment check:
if (import.meta.env.DEV) console.log('debug');
```

**Backend Performance**:
```javascript
// 1. Database query optimization
// Use .include() for eager loading
// Avoid N+1 queries

// 2. Caching
// Cache frequently accessed data
// Consider Redis for production

// 3. Connection pooling
// Configured in sequelize config
// Optimize pool size based on traffic

// 4. Pagination
// Always paginate large result sets
// Default limit: 20 items per page
```

### 10.3 Debug Logging

**Enable verbose logging**:

**Backend**:
```javascript
// .env
LOG_LEVEL=debug
NODE_ENV=development

// server.js
const morganFormat = process.env.LOG_LEVEL === 'debug' 
  ? 'combined' 
  : 'short';
app.use(morgan(morganFormat));
```

**Frontend**:
```javascript
// vite.config.js
export default {
  define: {
    'process.env.DEBUG': JSON.stringify('true')
  }
}

// main.jsx
if (process.env.DEBUG) {
  window.DEBUG = true;
  console.log('Debug mode enabled');
}
```

---

## Summary

This technical specification provides comprehensive guidance for:
- Setting up development environment
- Understanding project structure
- Running and deploying the application
- Following code standards
- Testing and troubleshooting

For questions or issues, refer to the main [README.md](../README.md) or submit an issue on GitHub.

**Version History**:
- v1.0.0 (Dec 25, 2025): Initial release

**Contact**: guggi@example.com
