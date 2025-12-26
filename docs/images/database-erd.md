# Database Entity Relationship Diagram (ERD)

## Multi-Tenant SaaS Platform - Database Schema

### Entity Relationship Overview

```
                          ┌──────────────────┐
                          │    Tenant        │
                          ├──────────────────┤
                          │ id (PK)          │
                          │ name             │
                          │ subdomain (U)    │
                          │ status           │
                          │ subscriptionPlan │
                          │ maxUsers         │
                          │ maxProjects      │
                          │ createdAt        │
                          │ updatedAt        │
                          └────────┬─────────┘
                                   │ 1
                                   │
                ┌──────────────────┼──────────────────┐
                │ 1:N              │                  │
                │                  │                  │
        ┌───────▼────────┐  ┌──────▼──────┐  ┌──────▼──────┐
        │ User           │  │ Project      │  │ AuditLog    │
        ├────────────────┤  ├──────────────┤  ├─────────────┤
        │ id (PK)        │  │ id (PK)      │  │ id (PK)     │
        │ tenantId (FK)  │  │ tenantId(FK) │  │ tenantId(FK)│
        │ email (U)      │  │ name         │  │ userId (FK) │
        │ passwordHash   │  │ description  │  │ entityType  │
        │ fullName       │  │ status       │  │ entityId    │
        │ role           │  │ createdBy(FK)│  │ action      │
        │ isActive       │  │ createdAt    │  │ changes     │
        │ createdAt      │  │ updatedAt    │  │ timestamp   │
        │ updatedAt      │  └──────┬───────┘  │ createdAt   │
        └────────────────┘         │          │ updatedAt   │
                                   │          └─────────────┘
                                   │ 1
                                   │
                                   │ 1:N
                                   │
                          ┌────────▼────────┐
                          │ Task            │
                          ├─────────────────┤
                          │ id (PK)         │
                          │ tenantId (FK)   │
                          │ projectId (FK)  │
                          │ title           │
                          │ description     │
                          │ status          │
                          │ priority        │
                          │ dueDate         │
                          │ assignedTo (FK) │
                          │ createdAt       │
                          │ updatedAt       │
                          └─────────────────┘
```

## Detailed Table Schemas

### 1. Tenant Table
```
CREATE TABLE "Tenants" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(50) NOT NULL UNIQUE,
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  subscriptionPlan ENUM('starter', 'pro', 'enterprise') DEFAULT 'pro',
  maxUsers INTEGER DEFAULT 10,
  maxProjects INTEGER DEFAULT 5,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INDEXES:
- PRIMARY KEY (id)
- UNIQUE (subdomain)
- INDEX ON status
- INDEX ON createdAt
```

**Purpose**: Represents organizational tenants in the system  
**Row Count**: ~100-10,000 tenants  
**Data Isolation**: All other tables filtered by tenantId

---

### 2. User Table
```
CREATE TABLE "Users" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenantId UUID FOREIGN KEY REFERENCES "Tenants"(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  fullName VARCHAR(255),
  role ENUM('super_admin', 'tenant_admin', 'user') DEFAULT 'user',
  isActive BOOLEAN DEFAULT true,
  lastLoginAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_email_per_tenant UNIQUE (tenantId, email),
  CONSTRAINT super_admin_no_tenant CHECK (
    (role = 'super_admin' AND tenantId IS NULL) OR
    (role != 'super_admin' AND tenantId IS NOT NULL)
  )
);

INDEXES:
- PRIMARY KEY (id)
- FOREIGN KEY (tenantId)
- UNIQUE (tenantId, email)
- INDEX ON email
- INDEX ON role
- INDEX ON isActive
- INDEX ON createdAt
```

**Purpose**: Stores user accounts with role-based access  
**Row Count**: ~10,000-100,000 users  
**Data Isolation**: Filtered by tenantId (except super_admin with tenantId=NULL)  
**Key Constraint**: Email unique per tenant, not globally

---

### 3. Project Table
```
CREATE TABLE "Projects" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenantId UUID NOT NULL FOREIGN KEY REFERENCES "Tenants"(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('active', 'archived', 'on_hold') DEFAULT 'active',
  createdBy UUID NOT NULL FOREIGN KEY REFERENCES "Users"(id) ON DELETE SET NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_tenant_project FOREIGN KEY (tenantId) REFERENCES "Tenants"(id),
  CONSTRAINT fk_creator_project FOREIGN KEY (createdBy) REFERENCES "Users"(id)
);

INDEXES:
- PRIMARY KEY (id)
- FOREIGN KEY (tenantId)
- FOREIGN KEY (createdBy)
- COMPOSITE INDEX (tenantId, status)
- INDEX ON createdAt
- INDEX ON status
```

**Purpose**: Project management and organization  
**Row Count**: ~1,000-50,000 projects  
**Data Isolation**: WHERE tenantId = :tenantId on all queries  
**Key Relationship**: Many-to-One with Tenant, One-to-Many with Task

---

### 4. Task Table
```
CREATE TABLE "Tasks" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenantId UUID NOT NULL FOREIGN KEY REFERENCES "Tenants"(id) ON DELETE CASCADE,
  projectId UUID NOT NULL FOREIGN KEY REFERENCES "Projects"(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('todo', 'in_progress', 'completed', 'blocked') DEFAULT 'todo',
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  dueDate TIMESTAMP,
  assignedTo UUID FOREIGN KEY REFERENCES "Users"(id) ON DELETE SET NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_tenant_task FOREIGN KEY (tenantId) REFERENCES "Tenants"(id),
  CONSTRAINT fk_project_task FOREIGN KEY (projectId) REFERENCES "Projects"(id),
  CONSTRAINT fk_assigned_user FOREIGN KEY (assignedTo) REFERENCES "Users"(id)
);

INDEXES:
- PRIMARY KEY (id)
- FOREIGN KEY (tenantId)
- FOREIGN KEY (projectId)
- FOREIGN KEY (assignedTo)
- COMPOSITE INDEX (tenantId, status)
- COMPOSITE INDEX (projectId, status)
- COMPOSITE INDEX (assignedTo, status)
- INDEX ON priority
- INDEX ON dueDate
```

**Purpose**: Task tracking and assignment  
**Row Count**: ~5,000-500,000 tasks  
**Data Isolation**: Cascading delete on project and tenant deletion  
**Key Feature**: Assigned user must be from same tenant

---

### 5. AuditLog Table
```
CREATE TABLE "AuditLogs" (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenantId UUID NOT NULL FOREIGN KEY REFERENCES "Tenants"(id) ON DELETE CASCADE,
  userId UUID FOREIGN KEY REFERENCES "Users"(id) ON DELETE SET NULL,
  entityType VARCHAR(50) NOT NULL,
  entityId UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  changes JSONB,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_tenant_audit FOREIGN KEY (tenantId) REFERENCES "Tenants"(id),
  CONSTRAINT fk_user_audit FOREIGN KEY (userId) REFERENCES "Users"(id)
);

INDEXES:
- PRIMARY KEY (id)
- FOREIGN KEY (tenantId)
- FOREIGN KEY (userId)
- COMPOSITE INDEX (tenantId, createdAt)
- COMPOSITE INDEX (entityType, entityId)
- COMPOSITE INDEX (userId, createdAt)
- INDEX ON action
```

**Purpose**: Compliance and audit trail logging  
**Row Count**: ~100,000-10,000,000 entries  
**Data Isolation**: WHERE tenantId = :tenantId for queries  
**Format**: Changes stored as JSONB for flexibility  
**Use Cases**:
  - GDPR compliance tracking
  - User activity reporting
  - Data change history
  - Security auditing

---

## Data Integrity Constraints

### Foreign Key Relationships
```
User.tenantId → Tenant.id (CASCADE DELETE)
Project.tenantId → Tenant.id (CASCADE DELETE)
Project.createdBy → User.id (SET NULL on delete)
Task.tenantId → Tenant.id (CASCADE DELETE)
Task.projectId → Project.id (CASCADE DELETE)
Task.assignedTo → User.id (SET NULL on delete)
AuditLog.tenantId → Tenant.id (CASCADE DELETE)
AuditLog.userId → User.id (SET NULL on delete)
```

### Unique Constraints
```
Tenant.subdomain - Global uniqueness
User(tenantId, email) - Per-tenant uniqueness
```

### Check Constraints
```
User.role = 'super_admin' IMPLIES tenantId IS NULL
User.role IN ('tenant_admin', 'user') IMPLIES tenantId IS NOT NULL
```

## Query Patterns

### Row-Level Isolation Pattern
```sql
-- All queries follow this pattern:
SELECT * FROM Projects 
WHERE tenantId = :currentTenantId 
  AND id = :projectId;

-- Prevents cross-tenant data leakage
-- Enforced at application layer AND database layer
```

### Common Query Patterns
```
1. List all projects for current tenant
   WHERE tenantId = :tenantId

2. Get tasks assigned to current user
   WHERE tenantId = :tenantId 
     AND assignedTo = :userId

3. Get audit log for compliance
   WHERE tenantId = :tenantId 
     AND createdAt BETWEEN :start AND :end

4. Find user by email in tenant
   WHERE tenantId = :tenantId 
     AND email = :email
```

## Performance Optimization

### Indexes Strategy
- **Composite indexes** on frequently filtered columns
- **Foreign key indexes** for join operations
- **Status/Priority indexes** for filtering
- **Timestamp indexes** for date range queries

### Query Optimization
- Use database view for common joins
- Implement cursor pagination for large result sets
- Cache frequently accessed data (user permissions)
- Archive old audit logs periodically

## Backup & Recovery

### Data Backup
```
pg_dump -U postgres -h database saas_db > backup.sql
```

### Restore
```
psql -U postgres -h database saas_db < backup.sql
```

### Tenant Data Export (GDPR)
```sql
SELECT * FROM "Users" WHERE tenantId = :tenantId;
SELECT * FROM "Projects" WHERE tenantId = :tenantId;
SELECT * FROM "Tasks" WHERE tenantId = :tenantId;
SELECT * FROM "AuditLogs" WHERE tenantId = :tenantId;
```

---

## Database Statistics

### Expected Growth
- **Small SaaS** (1-10 tenants): 
  - Tables: <100KB
  - Logs: <10MB/month

- **Medium SaaS** (100-1000 tenants):
  - Tables: 1-100MB
  - Logs: 1-10GB/month

- **Large SaaS** (10,000+ tenants):
  - Tables: 100MB-10GB
  - Logs: 100GB+/month (require archival)

### Maintenance Tasks
- Vacuum & Analyze: Weekly
- Index Rebuild: Monthly
- Partition old audit logs: Quarterly
- Full backup: Daily
- Transaction log backups: Hourly

---

**Status**: Production Ready  
**Last Updated**: December 2025  
**PostgreSQL Version**: 15+  
**Isolation Level**: Read Committed (default, suitable for most operations)
