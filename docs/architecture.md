# System Architecture Documentation

## Multi-Tenant SaaS Platform Architecture

### 1. System Overview

The Multi-Tenant SaaS Platform is a comprehensive project and task management system designed for multiple independent organizations (tenants) operating on a single shared infrastructure.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React SPA + Vite (Port 3000)                             │   │
│  │  - Login/Register Pages                                   │   │
│  │  - Dashboard                                              │   │
│  │  - Project Management                                     │   │
│  │  - Task Management                                        │   │
│  │  - User Management                                        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            │
                    HTTP/CORS (REST API)
                            │
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY & MIDDLEWARE                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Express.js (Port 5000)                                  │   │
│  │  - CORS Middleware                                        │   │
│  │  - JWT Authentication                                     │   │
│  │  - Request Logging (Morgan)                              │   │
│  │  - Security Headers (Helmet)                             │   │
│  │  - Error Handling                                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            │
               ┌────────────┴────────────┐
               │                         │
    ┌──────────▼──────────┐   ┌─────────▼──────────┐
    │  BUSINESS LOGIC     │   │  AUTHENTICATION    │
    │  LAYER              │   │  LAYER             │
    │                     │   │                    │
    │ Controllers:        │   │ JWT Generation     │
    │ - Project Ctrl      │   │ Token Validation   │
    │ - Task Ctrl         │   │ Role Validation    │
    │ - User Ctrl         │   │ Permission Check   │
    │ - Tenant Ctrl       │   │                    │
    │ - Auth Ctrl         │   │                    │
    └──────────┬──────────┘   └─────────┬──────────┘
               │                         │
    ┌──────────▼──────────┐   ┌─────────▼──────────┐
    │  DATA ACCESS LAYER  │   │  MIDDLEWARE        │
    │  (ORM)              │   │  LAYER             │
    │                     │   │                    │
    │ Sequelize Models:   │   │ - Auth Middleware  │
    │ - User Model        │   │ - Role Middleware  │
    │ - Tenant Model      │   │ - Error Handling   │
    │ - Project Model     │   │ - Request Logging  │
    │ - Task Model        │   │                    │
    │ - AuditLog Model    │   │                    │
    └──────────┬──────────┘   └────────────────────┘
               │
               │
┌──────────────▼──────────────────────────────────────────────────┐
│                    DATABASE LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL 15 (Port 5432)                               │   │
│  │  - User Table (Tenant Isolation)                         │   │
│  │  - Tenant Table (Organization Data)                      │   │
│  │  - Project Table (Project Data)                          │   │
│  │  - Task Table (Task Data)                                │   │
│  │  - AuditLog Table (Compliance & Tracking)                │   │
│  │  - Row-Level Tenant Isolation                            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture Components

### 2.1 Frontend Architecture

**Technology Stack**:
- **Framework**: React 18.2
- **Build Tool**: Vite (v5.0) - 10-100x faster than Webpack
- **Styling**: Tailwind CSS (utility-first CSS framework)
- **HTTP Client**: Axios (promise-based HTTP requests)
- **Routing**: React Router v6 (client-side routing)
- **Package Manager**: npm

**Component Structure**:
```
frontend/src/
├── App.jsx                    # Root component with routing
├── main.jsx                   # React mount point
├── App.css / index.css        # Global styles
├── components/
│   ├── Layout.jsx            # App layout wrapper
│   ├── ProtectedRoute.jsx    # Auth guard component
│   └── ...other components
├── pages/
│   ├── Login.jsx             # Authentication page
│   ├── Register.jsx          # Registration page
│   ├── Dashboard.jsx         # Main dashboard
│   ├── Projects.jsx          # Projects listing
│   ├── ProjectDetails.jsx    # Project details page
│   ├── Tasks.jsx             # Tasks listing
│   └── Users.jsx             # User management
└── services/
    └── api.js                # Axios instance & API calls
```

**Key Features**:
- Responsive UI with Tailwind CSS
- Protected routes requiring JWT authentication
- Token-based state management (localStorage)
- CORS-enabled API communication
- Real-time form validation
- Error boundary handling

### 2.2 Backend Architecture

**Technology Stack**:
- **Runtime**: Node.js 18 LTS
- **Framework**: Express.js 4.18
- **ORM**: Sequelize (SQL abstraction layer)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Middleware**: 
  - Helmet (security headers)
  - Morgan (request logging)
  - CORS (cross-origin requests)
- **Database**: PostgreSQL 15

**Layered Architecture**:

```
Routes Layer
     ↓
Middleware Layer (Auth, Role, Error handling)
     ↓
Controllers Layer (Business Logic)
     ↓
Models Layer (Data Access via Sequelize)
     ↓
Database Layer (PostgreSQL)
```

**Backend Directory Structure**:
```
backend/src/
├── server.js              # Express app setup
├── config/
│   └── database.js        # Database configuration
├── controllers/
│   ├── authController.js  # Auth logic (login, register)
│   ├── projectController.js
│   ├── taskController.js
│   ├── tenantController.js
│   ├── userController.js
│   └── ...
├── middleware/
│   ├── authMiddleware.js  # JWT verification
│   ├── roleMiddleware.js  # Role-based access control
│   └── ...
├── models/
│   ├── index.js           # Database sync & associations
│   ├── User.js
│   ├── Tenant.js
│   ├── Project.js
│   ├── Task.js
│   ├── AuditLog.js
│   └── ...
├── routes/
│   ├── authRoutes.js      # /api/auth endpoints
│   ├── projectRoutes.js   # /api/projects endpoints
│   ├── taskRoutes.js      # /api/tasks endpoints
│   ├── tenantRoutes.js    # /api/tenants endpoints
│   ├── userRoutes.js      # /api/users endpoints
│   └── ...
└── utils/
    └── seeder.js          # Database seeding
```

---

## 3. Data Models & Database Schema

### 3.1 Entity Relationship Diagram (ERD)

```
┌─────────────────────────┐
│       TENANT            │
├─────────────────────────┤
│ id (UUID, PK)          │
│ name (VARCHAR)         │
│ subdomain (VARCHAR)    │
│ status (ENUM)          │
│ plan (ENUM)            │
│ createdAt (TIMESTAMP)  │
│ updatedAt (TIMESTAMP)  │
└────────────┬────────────┘
             │
             │ 1:N (one tenant has many)
             │
    ┌────────┴─────────────────────────────────────┐
    │                                               │
┌───▼──────────────────┐               ┌──────────▼────────────┐
│        USER          │               │      PROJECT          │
├──────────────────────┤               ├──────────────────────┤
│ id (UUID, PK)       │               │ id (UUID, PK)        │
│ tenantId (UUID, FK) │               │ tenantId (UUID, FK)  │
│ email (VARCHAR)     │               │ name (VARCHAR)       │
│ fullName (VARCHAR)  │               │ description (TEXT)   │
│ password (VARCHAR)  │               │ status (ENUM)        │
│ role (ENUM)         │               │ createdBy (UUID, FK) │
│ isActive (BOOLEAN)  │               │ createdAt (TIMESTAMP)│
│ createdAt (TIMESTAMP)               │ updatedAt (TIMESTAMP)│
│ updatedAt (TIMESTAMP)               └──────────┬───────────┘
└────────────┬─────────┘                         │
             │                          1:N (one project has many)
             │                                   │
             │                    ┌──────────────▼─────────────┐
             │                    │                            │
             │              ┌─────▼──────────────┐   ┌────────▼──────────┐
             │              │       TASK         │   │    AUDIT LOG      │
             │              ├────────────────────┤   ├───────────────────┤
             │              │ id (UUID, PK)     │   │ id (UUID, PK)    │
             │              │ projectId (FK)    │   │ tenantId (FK)    │
             │              │ title (VARCHAR)   │   │ userId (FK)      │
             │              │ description (TEXT)│   │ action (VARCHAR) │
             │              │ status (ENUM)     │   │ entity (VARCHAR) │
             │              │ priority (ENUM)   │   │ changes (JSON)   │
             │              │ assignedTo (FK) ──┼──→│ timestamp        │
             │              │ createdAt (TS)    │   └──────────────────┘
             │              │ updatedAt (TS)    │
             │              └───────────────────┘
             │
             └─ Every table includes tenantId for row-level isolation
```

### 3.2 Database Schema Details

**TENANT Table**:
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(255) UNIQUE NOT NULL,
  status ENUM('active', 'suspended', 'deleted'),
  plan ENUM('free', 'starter', 'pro', 'enterprise'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**USER Table** (Tenant Isolation):
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'tenant_admin', 'user'),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  UNIQUE(tenant_id, email)
);
-- Composite index for tenant isolation
CREATE INDEX idx_user_tenant ON users(tenant_id);
```

**PROJECT Table**:
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('active', 'archived'),
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
CREATE INDEX idx_project_tenant ON projects(tenant_id);
```

**TASK Table**:
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  project_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('todo', 'in_progress', 'completed'),
  priority ENUM('low', 'medium', 'high', 'critical'),
  assigned_to UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);
CREATE INDEX idx_task_tenant ON tasks(tenant_id);
CREATE INDEX idx_task_project ON tasks(project_id);
```

**AUDIT_LOG Table** (Compliance):
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  user_id UUID,
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE INDEX idx_audit_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
```

---

## 4. Multi-Tenancy Implementation

### 4.1 Row-Level Tenant Isolation

The platform implements tenant isolation at the database row level:

```
+─────────────────────────────────────────┐
│         SINGLE SHARED DATABASE          │
├─────────────────────────────────────────┤
│                                         │
│ Tenant A Data (tenant_id = uuid-a)     │
│ ├─ Users (3)                           │
│ ├─ Projects (5)                        │
│ └─ Tasks (12)                          │
│                                         │
│ Tenant B Data (tenant_id = uuid-b)     │
│ ├─ Users (5)                           │
│ ├─ Projects (8)                        │
│ └─ Tasks (25)                          │
│                                         │
│ Tenant C Data (tenant_id = uuid-c)     │
│ ├─ Users (2)                           │
│ ├─ Projects (3)                        │
│ └─ Tasks (7)                           │
│                                         │
+─────────────────────────────────────────+
```

### 4.2 Tenant Isolation Strategy

**Every Query Includes Tenant Filter**:
```javascript
// Example: GET /projects (only returns current tenant's projects)
const projects = await Project.findAll({
  where: { tenantId: req.user.tenantId },  // CRITICAL: Always filter by tenant
  include: [{ model: User, attributes: ['id', 'fullName'] }]
});
```

**Isolation Enforcement Points**:

1. **Route Level**: Router verifies user belongs to tenant
2. **Middleware Level**: authMiddleware extracts tenant from JWT
3. **Controller Level**: All queries filter by `req.user.tenantId`
4. **Database Level**: Foreign key constraints enforce data integrity

**Benefits**:
- ✅ Cost-efficient (single database infrastructure)
- ✅ Operational simplicity (single database backup/restore)
- ✅ High multi-tenancy ratio (thousands of tenants)
- ✅ Data isolation at application level
- ✅ Compliant with GDPR (data segregation)

---

## 5. Authentication & Authorization

### 5.1 JWT Authentication Flow

```
┌──────────────────────────────────────────────────────────┐
│                  CLIENT (Browser)                         │
│                                                           │
│  1. Enter credentials                                     │
│     (email, subdomain, password)                         │
│  ↓                                                        │
│  2. POST /api/auth/login                                │
└────────────────────┬──────────────────────────────────┬──┘
                     │                                  │
                     │ HTTP Request                      │ HTTP Response
                     │ (credentials)                     │ (JWT token)
                     ↓                                  │
┌──────────────────────────────────────────────────────┴──┐
│              BACKEND (Express Server)                   │
│                                                         │
│  3. Validate credentials                               │
│  4. Check tenant subdomain                             │
│  5. Hash password comparison                           │
│  6. Generate JWT token (24 hour expiry)               │
│     - Payload: { userId, tenantId, role, email }      │
│     - Secret: process.env.JWT_SECRET                  │
└────────────────────────────────────────────────────────┘
                     ↑
                     │ Store in localStorage
                     │
┌────────────────────▼──────────────────────────────────┐
│              CLIENT (Next Requests)                    │
│                                                       │
│  7. Include JWT in Authorization header:             │
│     Authorization: Bearer <token>                     │
│                                                       │
│  8. GET /api/projects                                │
│     (with JWT token)                                 │
└──────────────────────┬────────────────────────────────┘
                       │
                       │ Verify JWT signature
                       │ Check token expiry
                       │ Extract user info
                       ↓
┌─────────────────────────────────────────────────────┐
│         BACKEND (authMiddleware.js)                 │
│                                                    │
│  9. Verify JWT token signature                    │
│  10. Check token not expired (24h)                 │
│  11. Extract userId & tenantId                    │
│  12. Attach to req.user                           │
│  13. Next middleware/controller                   │
└─────────────────────────────────────────────────────┘
```

### 5.2 Role-Based Access Control (RBAC)

```
┌─────────────────────────────────────────────────────┐
│           ROLE HIERARCHY                            │
└─────────────────────────────────────────────────────┘

Tier 1: System Administrator
┌──────────────────────────────────────────┐
│ SUPER_ADMIN                              │
│ - Full platform access                   │
│ - Manage all tenants                     │
│ - View audit logs (all tenants)          │
│ - System configuration                   │
│ - No tenant assignment                   │
└──────────────────────────────────────────┘

Tier 2: Tenant Administrator
┌──────────────────────────────────────────┐
│ TENANT_ADMIN                             │
│ - Manage tenant users                    │
│ - Create/edit/delete projects            │
│ - Create/edit/delete tasks               │
│ - View tenant audit logs                 │
│ - Configure tenant settings              │
│ - Limited to assigned tenant             │
└──────────────────────────────────────────┘

Tier 3: Regular User
┌──────────────────────────────────────────┐
│ USER                                     │
│ - View assigned projects                 │
│ - View assigned tasks                    │
│ - Update task status                     │
│ - View other users (read-only)           │
│ - Cannot delete anything                 │
│ - Limited to assigned tenant             │
└──────────────────────────────────────────┘

Permission Matrix:
┌──────────┬──────────┬──────────┬──────────┐
│ Action   │ SUPER    │ TENANT   │ USER     │
│          │ ADMIN    │ ADMIN    │          │
├──────────┼──────────┼──────────┼──────────┤
│ List     │ All      │ Tenant   │ Assigned │
│ Create   │ Tenant   │ Project/ │ Project/ │
│          │          │ Task     │ Task     │
│ Update   │ Tenant   │ Own      │ Own      │
│ Delete   │ Tenant   │ Owned    │ Own      │
│ Admin    │ ✓        │ ✓        │ ✗        │
└──────────┴──────────┴──────────┴──────────┘
```

### 5.3 Permission Enforcement

**Implementation**:
```javascript
// Example: roleMiddleware.js
const checkRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions"
      });
    }
    next();
  };
};

// Usage in routes:
router.delete('/users/:id', 
  authMiddleware,           // Verify JWT
  checkRole(['tenant_admin']), // Check role
  userController.deleteUser  // Execute
);
```

---

## 6. Deployment Architecture

### 6.1 Docker Containerization

```
┌─────────────────────────────────────┐
│     Development Environment         │
│     (docker-compose.yml)            │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐  │
│  │ PostgreSQL Container         │  │
│  │ - Image: postgres:15         │  │
│  │ - Port: 5432 (internal)      │  │
│  │ - Volume: db_data            │  │
│  │ - Health check: pg_isready   │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Backend Container            │  │
│  │ - Image: node:18-alpine      │  │
│  │ - Port: 5000                 │  │
│  │ - Depends on: postgres       │  │
│  │ - Health check: /api/health  │  │
│  │ - Volume: ./backend          │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Frontend Container           │  │
│  │ - Image: node:18-alpine      │  │
│  │ - Port: 3000                 │  │
│  │ - Depends on: backend        │  │
│  │ - Volume: ./frontend         │  │
│  └──────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### 6.2 Service Dependencies

```
Database (PostgreSQL)
       ↑
       │ depends_on
       │
Backend Service (Express.js)
       ↑
       │ depends_on
       │
Frontend Service (React SPA)
```

### 6.3 Docker Compose Configuration

**File**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  database:
    image: postgres:15
    container_name: saas-db
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: saas_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: node:18-alpine
    container_name: saas-backend
    ports:
      - "5000:5000"
    depends_on:
      database:
        condition: service_healthy
    volumes:
      - ./backend:/app
    working_dir: /app
    command: npm start
    environment:
      DATABASE_URL: postgres://postgres:postgres@database:5432/saas_db
      JWT_SECRET: your-secret-key
      NODE_ENV: development
      PORT: 5000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  frontend:
    image: node:18-alpine
    container_name: saas-frontend
    ports:
      - "3000:3000"
    depends_on:
      backend:
        condition: service_healthy
    volumes:
      - ./frontend:/app
    working_dir: /app
    command: npm run dev
    environment:
      VITE_API_URL: http://localhost:5000/api

volumes:
  db_data:
```

---

## 7. API Endpoint Structure

### 7.1 Complete API Endpoints (19 Total)

#### Authentication (3 endpoints)
```
POST   /api/auth/register      - Register new tenant & admin
POST   /api/auth/login         - Login user
GET    /api/auth/me            - Get current user info
```

#### Users (5 endpoints)
```
GET    /api/users              - List all users (paginated)
GET    /api/users/:id          - Get user details
POST   /api/users              - Create new user
PUT    /api/users/:id          - Update user
DELETE /api/users/:id          - Delete user
```

#### Projects (4 endpoints)
```
GET    /api/projects           - List all projects
GET    /api/projects/:id       - Get project details
POST   /api/projects           - Create new project
PUT    /api/projects/:id       - Update project
DELETE /api/projects/:id       - Delete project
```

#### Tasks (4 endpoints)
```
GET    /api/tasks              - List all tasks
GET    /api/tasks/:id          - Get task details
POST   /api/tasks              - Create new task
PUT    /api/tasks/:id          - Update task
DELETE /api/tasks/:id          - Delete task
```

#### Tenants (3 endpoints)
```
GET    /api/tenants            - List all tenants (super_admin)
GET    /api/tenants/:id        - Get tenant details
PUT    /api/tenants/:id        - Update tenant (super_admin)
```

#### Health (1 endpoint)
```
GET    /api/health             - System health check
```

### 7.2 Request/Response Flow

```
HTTP Request (Client)
        ↓
    Express Router
        ↓
    Middleware Chain:
    1. CORS Handler
    2. Body Parser
    3. Logger (Morgan)
    4. Auth Middleware (JWT verification)
    5. Role Middleware (Permission check)
        ↓
    Route Handler (Controller)
        ↓
    Business Logic
        ↓
    Sequelize ORM
        ↓
    PostgreSQL Database
        ↓
    JSON Response (Server)
        ↓
    React Components (Client)
```

---

## 8. Security Architecture

### 8.1 Security Layers

```
Layer 1: Transport Security
├─ HTTPS/TLS (Production)
├─ CORS Whitelist (Development: *)
└─ Security Headers (Helmet.js)

Layer 2: Authentication
├─ JWT Tokens (24-hour expiry)
├─ Bcrypt Password Hashing
├─ Token Storage (localStorage)
└─ Token Validation on Every Request

Layer 3: Authorization
├─ Role-Based Access Control (RBAC)
├─ Tenant Isolation (Row-level)
├─ Resource Ownership Validation
└─ Permission Middleware

Layer 4: Data Protection
├─ SQL Injection Prevention (Sequelize ORM)
├─ XSS Prevention (React escaping)
├─ CSRF Token Protection
├─ Input Validation
└─ Output Encoding

Layer 5: Audit & Compliance
├─ AuditLog Table (all changes)
├─ Activity Logging (Morgan)
├─ Error Logging (structured)
└─ Compliance Ready (GDPR, CCPA, HIPAA)
```

### 8.2 Password Security

```javascript
// Registration
1. User submits password
2. Validate: Minimum 8 chars, 1 uppercase, 1 number, 1 special char
3. Hash with bcryptjs (10 rounds)
4. Store hashed password in database
   
// Login
1. User submits password
2. Retrieve user from database
3. Compare plaintext with bcrypt hash
4. If match: Generate JWT token
5. Return token to client
```

---

## 9. Scalability Considerations

### 9.1 Horizontal Scaling

```
                    Load Balancer (Nginx/HAProxy)
                    /            |            \
                   /             |             \
          Backend Pod 1   Backend Pod 2   Backend Pod 3
                   \             |             /
                    \            |            /
                    Shared PostgreSQL Database
                         (Connection Pool)
```

**Stateless Design Benefits**:
- ✅ No session state on servers
- ✅ JWT tokens for authentication
- ✅ Any pod can handle any request
- ✅ Easy horizontal scaling
- ✅ No session replication needed

### 9.2 Database Scaling

**Current Setup** (Single Database):
- Suitable for: 100-1000 tenants
- Up to: 10,000 concurrent connections

**Future Scaling Options**:

1. **Read Replicas**:
   ```
   Primary DB (Write)
        ↓
   Replica 1 (Read) - Reports
   Replica 2 (Read) - Analytics
   Replica 3 (Read) - Backups
   ```

2. **Database Sharding** (if needed):
   ```
   Shard by Tenant ID
   
   Shard 1: Tenants A-H (PostgreSQL)
   Shard 2: Tenants I-P (PostgreSQL)
   Shard 3: Tenants Q-Z (PostgreSQL)
   
   Shard Router (Application Layer)
   └─ Routes requests to correct shard
   ```

3. **Caching Layer**:
   ```
   Application ↔ Redis Cache ↔ PostgreSQL
   
   Cache Strategy:
   - User sessions (30 min TTL)
   - Tenant config (1 hour TTL)
   - Project list (15 min TTL)
   - Task list (5 min TTL)
   ```

---

## 10. Monitoring & Operations

### 10.1 Health Checks

**Frontend Health**:
```javascript
// Check if React is mounted and running
- Application accessible at http://localhost:3000
- Console errors: None
- API connectivity: Successful
```

**Backend Health**:
```bash
curl http://localhost:5000/api/health

Response:
{
  "status": "ok",
  "database": "connected"
}
```

**Database Health**:
```bash
docker exec saas-db pg_isready -U postgres

Response:
accepting connections
```

### 10.2 Logging Strategy

**Backend Logs**:
```
Morgan Request Logging: All HTTP requests
- Timestamp, Method, Path, Status, Duration
- Client IP, User Agent

Error Logs:
- Unhandled exceptions
- Database errors
- Validation errors
- Authorization failures

Audit Logs:
- User actions (create, update, delete)
- Authentication events
- Permission denials
- Data changes (JSON format)
```

### 10.3 Performance Metrics

**Key Metrics**:
- API Response Time: Target < 200ms
- Database Query Time: Target < 50ms
- Frontend Load Time: Target < 3s
- Uptime Target: 99.9%

---

## 11. Deployment Checklist

```
□ Environment Variables Set
  - DATABASE_URL
  - JWT_SECRET (strong random value)
  - NODE_ENV=production
  - VITE_API_URL (correct endpoint)

□ Database
  - PostgreSQL 15+ installed
  - Database created
  - User/password configured
  - Migrations executed

□ Backend
  - Dependencies installed (npm install)
  - Environment variables loaded
  - API responding (curl health endpoint)
  - All routes registered

□ Frontend
  - Dependencies installed (npm install)
  - Build successful (npm run build)
  - API URL configured
  - Assets loaded correctly

□ Docker
  - All images built
  - All containers running
  - Health checks passing
  - Volumes mounted correctly

□ Security
  - JWT_SECRET is strong
  - HTTPS enabled (production)
  - CORS properly configured
  - Passwords hashed with bcryptjs
  - Helmet headers enabled

□ Testing
  - Authentication working
  - Tenant isolation verified
  - RBAC enforced
  - All endpoints tested
  - Database persistence verified

□ Monitoring
  - Logging enabled
  - Error tracking configured
  - Health checks running
  - Uptime monitoring enabled
```

---

## Summary

The Multi-Tenant SaaS Platform employs a modern, scalable architecture with:

- **Clean Separation**: Frontend, Backend, Database
- **Security-First**: JWT, RBAC, Tenant Isolation
- **Production-Ready**: Docker, Health Checks, Error Handling
- **Developer-Friendly**: Hot Reload, Clear Structure, Good Docs
- **Scalable Design**: Stateless Backends, Horizontal Scaling Ready
- **Compliance-Ready**: Audit Logs, GDPR-Compliant Data Isolation

This architecture can support thousands of tenants and is ready for enterprise deployment.
