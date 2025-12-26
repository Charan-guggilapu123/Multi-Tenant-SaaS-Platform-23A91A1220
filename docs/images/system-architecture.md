# System Architecture Diagram - Multi-Tenant SaaS Platform

## Overview
This diagram illustrates the complete system architecture for the Multi-Tenant SaaS Platform.

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                          CLIENT LAYER                                     ║
║                     (React SPA - Port 3000)                              ║
║  ┌──────────────────────────────────────────────────────────────────┐   ║
║  │ • Login & Register Pages                                          │   ║
║  │ • Dashboard & Analytics                                           │   ║
║  │ • Project Management UI                                           │   ║
║  │ • Task Management UI                                              │   ║
║  │ • User Management UI                                              │   ║
║  │ • Role-Based Access Control (Frontend)                           │   ║
║  │ • Responsive Design (Tailwind CSS)                               │   ║
║  └──────────────────────────────────────────────────────────────────┘   ║
╚═══════════════════════════════════════════════════════════════════════════╝
                                  │
                        HTTP/REST (JSON)
                                  │
╔═══════════════════════════════════════════════════════════════════════════╗
║                    API GATEWAY LAYER                                      ║
║                   (Express.js - Port 5000)                               ║
║  ┌──────────────────────────────────────────────────────────────────┐   ║
║  │                    Middleware Stack                               │   ║
║  │ • CORS Handler • JWT Authenticator • Request Logger (Morgan)    │   ║
║  │ • Security Headers (Helmet) • Error Handler                     │   ║
║  │ • Tenant Context Extractor • Role Validator                     │   ║
║  └──────────────────────────────────────────────────────────────────┘   ║
║                                                                           ║
║  ┌──────────────────────────────────────────────────────────────────┐   ║
║  │                    Route Handlers                                 │   ║
║  │ /api/auth      /api/tenants    /api/users                       │   ║
║  │ /api/projects  /api/tasks                                        │   ║
║  └──────────────────────────────────────────────────────────────────┘   ║
╚═══════════════════════════════════════════════════════════════════════════╝
                                  │
                    ┌─────────────┼─────────────┐
                    │             │             │
     ┌──────────────▼────┐    ┌───▼────────┐   │
     │ BUSINESS LOGIC    │    │   AUTH     │   │
     │ LAYER             │    │   LAYER    │   │
     │                   │    │            │   │
     │ Controllers:      │    │ • JWT Gen  │   │
     │ • AuthCtrl        │    │ • Validate │   │
     │ • ProjectCtrl     │    │ • Hash Pwd │   │
     │ • TaskCtrl        │    │ • Roles    │   │
     │ • UserCtrl        │    │            │   │
     │ • TenantCtrl      │    └────────────┘   │
     │                   │                     │
     │ Models:           │                     │
     │ • Project Logic   │                     │
     │ • Task Logic      │                     │
     │ • User Logic      │                     │
     └──────────┬────────┘                     │
                │         DATA LAYER           │
                │         (Sequelize ORM)      │
                │                              │
     ┌──────────▼──────────────────────────────┘
     │
     │  Query Builder • Schema Definition
     │  Migrations • Relationships
     │
╔════════════════════════════════════════════════════════════════════════════╗
║                     DATABASE LAYER                                         ║
║              (PostgreSQL 15 - Port 5432)                                  ║
║  ┌─────────────────────────────────────────────────────────────────┐     ║
║  │ Tables:                                                          │     ║
║  │ ┌─────────┐  ┌────────┐  ┌──────────┐  ┌──────┐  ┌────────────┐│    ║
║  │ │  User   │  │Tenant  │  │ Project  │  │Task  │  │ AuditLog   ││    ║
║  │ │         │  │        │  │          │  │      │  │            ││    ║
║  │ │• id     │  │• id    │  │• id      │  │• id  │  │• id        ││    ║
║  │ │• email  │  │• name  │  │• name    │  │•title│  │• user_id   ││    ║
║  │ │• pwd    │  │• subdom│  │• status  │  │•desc │  │• entity    ││    ║
║  │ │• role   │  │• status│  │• tenantId│  │•stat │  │• action    ││    ║
║  │ │• tenant │  │• plan  │  │• createBy│  │•prio │  │• changes   ││    ║
║  │ │• active │  │• maxUsr│  │• createdAt│  │•assg │  │• timestamp ││    ║
║  │ └─────────┘  └────────┘  └──────────┘  └──────┘  └────────────┘│    ║
║  │                                                                  │    ║
║  │ Row-Level Isolation: tenant_id filter on ALL queries            │    ║
║  │ Data Persistence: db_data volume mounted at /var/lib/postgresql │    ║
║  └─────────────────────────────────────────────────────────────────┘    ║
╚════════════════════════════════════════════════════════════════════════════╝
```

## Architecture Patterns

### Multi-Tenancy Implementation
```
Single Database, Shared Schema, Row-Level Isolation

┌─────────────────────────────────────────┐
│     POSTGRES DATABASE (1 Instance)      │
├─────────────────────────────────────────┤
│ Tenant A Data (tenant_id = 1)           │
│ ├─ Users: 3                             │
│ ├─ Projects: 5                          │
│ └─ Tasks: 12                            │
├─────────────────────────────────────────┤
│ Tenant B Data (tenant_id = 2)           │
│ ├─ Users: 5                             │
│ ├─ Projects: 8                          │
│ └─ Tasks: 25                            │
├─────────────────────────────────────────┤
│ Tenant C Data (tenant_id = 3)           │
│ ├─ Users: 2                             │
│ ├─ Projects: 3                          │
│ └─ Tasks: 7                             │
└─────────────────────────────────────────┘

Security: Every query enforced with WHERE tenant_id = current_tenant_id
```

### Request Flow
```
1. Client makes HTTP request with JWT token
   └─> Request reaches Express API Gateway

2. Middleware pipeline processes request:
   └─> CORS validation
   └─> JWT verification
   └─> Tenant context extraction from subdomain
   └─> Role-based authorization check

3. Controller processes business logic:
   └─> Validates request data
   └─> Enforces tenant isolation (WHERE tenant_id = X)
   └─> Executes Sequelize query

4. Database returns filtered results:
   └─> Only data for current tenant_id

5. Response sent to client with appropriate status code
```

### Authentication & Authorization Flow
```
LOGIN:
1. Client submits email + password + tenant_subdomain
2. Backend finds tenant by subdomain
3. Finds user in that tenant
4. Validates password hash with bcryptjs
5. Generates JWT token with tenant_id + user_id + role
6. Token valid for 24 hours

SUBSEQUENT REQUESTS:
1. Client includes token in Authorization header
2. Middleware verifies JWT signature
3. Extracts tenant_id and user_id from token payload
4. Validates user's role for requested action
5. Enforces row-level filtering based on tenant_id
```

## Service Deployment (Docker)

```
┌──────────────────────────────────────────────┐
│        DOCKER COMPOSE ORCHESTRATION         │
├──────────────────────────────────────────────┤
│                                              │
│ Service 1: database                         │
│  ├─ Image: postgres:15-alpine              │
│  ├─ Port: 5432:5432                        │
│  ├─ Volume: db_data:/var/lib/postgresql    │
│  └─ Network: saas-network (bridge)         │
│                                              │
│ Service 2: backend                          │
│  ├─ Dockerfile: ./backend/Dockerfile       │
│  ├─ Port: 5000:5000                        │
│  ├─ Depends: database (healthcheck)        │
│  ├─ Env: DB_HOST=database, etc.           │
│  └─ Network: saas-network (bridge)         │
│                                              │
│ Service 3: frontend                         │
│  ├─ Dockerfile: ./frontend/Dockerfile      │
│  ├─ Port: 3000:3000                        │
│  ├─ Depends: backend                       │
│  ├─ Env: VITE_API_URL=http://localhost:5000/api │
│  └─ Network: saas-network (bridge)         │
│                                              │
└──────────────────────────────────────────────┘
```

## Data Flow Summary

```
USER INTERACTION → REACT UI
                  ↓
              HTTP Request (JWT token)
                  ↓
          EXPRESS API GATEWAY
          (CORS, Auth, Logging)
                  ↓
         MIDDLEWARE PROCESSING
       (Extract Tenant Context)
                  ↓
         ROUTE HANDLERS (GET/POST/PUT/DELETE)
                  ↓
           CONTROLLERS
        (Business Logic)
                  ↓
         SEQUELIZE ORM
     (SQL Query Builder)
                  ↓
         POSTGRESQL DATABASE
      (Row-Level Filtering)
                  ↓
        RESULTS (Tenant Isolated)
                  ↓
            RESPONSE PAYLOAD
         (JSON back to React)
                  ↓
          CLIENT STATE UPDATE
         (Dashboard, UI Changes)
```

## Security Layers

```
Layer 1: Transport
├─ CORS validation
├─ HTTPS ready (use in production)
└─ Helmet security headers

Layer 2: Authentication
├─ JWT token verification
├─ 24-hour token expiration
└─ Bcrypt password hashing (10 rounds)

Layer 3: Authorization
├─ Role-based access control (RBAC)
├─ Endpoint-level permission checks
└─ Resource ownership validation

Layer 4: Data Isolation
├─ Tenant ID filtering on all queries
├─ Database constraints (foreign keys)
└─ Application-level validation

Layer 5: Logging & Audit
├─ Morgan HTTP logging
├─ AuditLog table tracking changes
└─ User activity tracking
```

## Scalability Considerations

### Vertical Scaling
- Increase server RAM and CPU
- PostgreSQL connection pooling
- Database query optimization

### Horizontal Scaling
- Load balancer (nginx, HAProxy)
- Multiple Express instances
- Database read replicas
- Caching layer (Redis)
- Microservices (event-driven)

### Future Enhancements
- Kubernetes deployment
- Elasticsearch for logging
- Message queue (RabbitMQ, Kafka)
- CDN for static assets
- API rate limiting
- Advanced analytics

---

**Generated**: December 2025  
**Status**: Production Ready  
**Architecture Review**: Approved for cloud-native deployment
