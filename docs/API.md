# API Documentation

## Multi-Tenant SaaS Platform - Complete API Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication
All endpoints except `/auth/*` require JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Health Check

### GET /health
System health check endpoint - no authentication required.

**Request**:
```bash
curl http://localhost:5000/api/health
```

**Response** (200 OK):
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## 2. Authentication Endpoints

### POST /auth/register
Register a new tenant and tenant admin user.

**Request**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Acme Corporation",
    "tenantSubdomain": "acme",
    "email": "admin@acme.com",
    "password": "SecurePassword@123"
  }'
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Tenant and admin created successfully",
  "data": {
    "tenant": {
      "id": "uuid",
      "name": "Acme Corporation",
      "subdomain": "acme",
      "status": "active"
    },
    "user": {
      "id": "uuid",
      "email": "admin@acme.com",
      "fullName": "Admin User",
      "role": "tenant_admin"
    }
  }
}
```

### POST /auth/login
Authenticate user and receive JWT token.

**Request**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "tenantSubdomain": "demo",
    "email": "admin@demo.com",
    "password": "Demo@123"
  }'
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "admin@demo.com",
      "fullName": "Demo Admin",
      "role": "tenant_admin",
      "tenantId": "uuid"
    },
    "expiresIn": "24h"
  }
}
```

**Errors**:
- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: Invalid credentials
- `404 Not Found`: Tenant not found

---

## 3. User Management Endpoints

### GET /users
List all users in the current tenant.

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search by email or name
- `role`: Filter by role (tenant_admin, user)
- `status`: Filter by status (active, inactive)

**Request**:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  'http://localhost:5000/api/users?page=1&limit=10'
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "fullName": "John Doe",
        "role": "user",
        "isActive": true,
        "createdAt": "2025-12-25T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### GET /users/:id
Get specific user details.

**Request**:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/users/user-uuid
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "user",
    "isActive": true,
    "createdAt": "2025-12-25T10:00:00Z",
    "updatedAt": "2025-12-25T10:00:00Z"
  }
}
```

### POST /users
Create a new user in the tenant.

**Required Role**: tenant_admin

**Request**:
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "fullName": "Jane Smith",
    "password": "SecurePassword@123",
    "role": "user"
  }' \
  http://localhost:5000/api/users
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "email": "newuser@example.com",
    "fullName": "Jane Smith",
    "role": "user",
    "isActive": true
  }
}
```

### PUT /users/:id
Update user information.

**Required Role**: tenant_admin or self

**Request**:
```bash
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Smith Updated",
    "isActive": true
  }' \
  http://localhost:5000/api/users/user-uuid
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "email": "newuser@example.com",
    "fullName": "Jane Smith Updated",
    "role": "user",
    "isActive": true
  }
}
```

### DELETE /users/:id
Delete a user from the tenant.

**Required Role**: tenant_admin

**Request**:
```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/users/user-uuid
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 4. Project Management Endpoints

### GET /projects
List all projects in the current tenant.

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status (active, archived)
- `search`: Search by project name

**Request**:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  'http://localhost:5000/api/projects?page=1&limit=10'
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "uuid",
        "name": "Project Alpha",
        "description": "First demo project",
        "status": "active",
        "createdBy": "uuid",
        "taskCount": 5,
        "createdAt": "2025-12-25T10:00:00Z",
        "updatedAt": "2025-12-25T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 12,
      "totalPages": 2
    }
  }
}
```

### GET /projects/:id
Get specific project details.

**Request**:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/projects/project-uuid
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Project Alpha",
    "description": "First demo project",
    "status": "active",
    "createdBy": {
      "id": "uuid",
      "fullName": "Demo Admin"
    },
    "tasks": [
      {
        "id": "uuid",
        "title": "Task Title",
        "status": "in_progress"
      }
    ],
    "createdAt": "2025-12-25T10:00:00Z"
  }
}
```

### POST /projects
Create a new project.

**Required Role**: tenant_admin, user

**Request**:
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Project",
    "description": "Project description here",
    "status": "active"
  }' \
  http://localhost:5000/api/projects
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": "uuid",
    "name": "New Project",
    "description": "Project description here",
    "status": "active",
    "createdBy": "uuid"
  }
}
```

### PUT /projects/:id
Update project information.

**Required Role**: Project creator or tenant_admin

**Request**:
```bash
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Project Name",
    "description": "Updated description",
    "status": "active"
  }' \
  http://localhost:5000/api/projects/project-uuid
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "id": "uuid",
    "name": "Updated Project Name",
    "description": "Updated description",
    "status": "active"
  }
}
```

### DELETE /projects/:id
Delete a project and its associated tasks.

**Required Role**: Project creator or tenant_admin

**Request**:
```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/projects/project-uuid
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

## 5. Task Management Endpoints

### GET /tasks
List all tasks in the current tenant.

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status (todo, in_progress, completed)
- `priority`: Filter by priority (low, medium, high, critical)
- `projectId`: Filter by project
- `assignedTo`: Filter by assigned user
- `search`: Search by task title

**Request**:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  'http://localhost:5000/api/tasks?status=in_progress&priority=high'
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "uuid",
        "title": "Design UI",
        "description": "Create initial mockups",
        "status": "in_progress",
        "priority": "high",
        "projectId": "uuid",
        "assignedTo": {
          "id": "uuid",
          "fullName": "User Name"
        },
        "createdAt": "2025-12-25T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 8,
      "totalPages": 1
    }
  }
}
```

### GET /tasks/:id
Get specific task details.

**Request**:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/tasks/task-uuid
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Design UI",
    "description": "Create initial mockups",
    "status": "in_progress",
    "priority": "high",
    "projectId": "uuid",
    "project": {
      "id": "uuid",
      "name": "Project Alpha"
    },
    "assignedTo": {
      "id": "uuid",
      "fullName": "User Name"
    },
    "createdAt": "2025-12-25T10:00:00Z",
    "updatedAt": "2025-12-25T10:00:00Z"
  }
}
```

### POST /tasks
Create a new task.

**Required Role**: tenant_admin, user

**Request**:
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Task",
    "description": "Task description",
    "projectId": "project-uuid",
    "priority": "medium",
    "status": "todo",
    "assignedTo": "user-uuid"
  }' \
  http://localhost:5000/api/tasks
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "uuid",
    "title": "New Task",
    "description": "Task description",
    "projectId": "project-uuid",
    "priority": "medium",
    "status": "todo",
    "assignedTo": "user-uuid"
  }
}
```

### PUT /tasks/:id
Update task information.

**Required Role**: Task creator, assignee, or tenant_admin

**Request**:
```bash
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Task Title",
    "status": "in_progress",
    "priority": "high",
    "assignedTo": "new-user-uuid"
  }' \
  http://localhost:5000/api/tasks/task-uuid
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "uuid",
    "title": "Updated Task Title",
    "status": "in_progress",
    "priority": "high",
    "assignedTo": "new-user-uuid"
  }
}
```

### DELETE /tasks/:id
Delete a task.

**Required Role**: Task creator, assignee, or tenant_admin

**Request**:
```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/tasks/task-uuid
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## 6. Tenant Management Endpoints

### GET /tenants
List all tenants (super_admin only).

**Request**:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/tenants
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "tenants": [
      {
        "id": "uuid",
        "name": "Demo Company",
        "subdomain": "demo",
        "status": "active",
        "subscriptionPlan": "pro",
        "maxUsers": 25,
        "maxProjects": 15,
        "createdAt": "2025-12-25T10:00:00Z"
      }
    ]
  }
}
```

### GET /tenants/:id
Get specific tenant details (super_admin or tenant_admin).

**Request**:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/tenants/tenant-uuid
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Demo Company",
    "subdomain": "demo",
    "status": "active",
    "subscriptionPlan": "pro",
    "maxUsers": 25,
    "maxProjects": 15,
    "userCount": 3,
    "projectCount": 2,
    "createdAt": "2025-12-25T10:00:00Z"
  }
}
```

### PUT /tenants/:id
Update tenant information (super_admin only).

**Request**:
```bash
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active",
    "subscriptionPlan": "enterprise",
    "maxUsers": 100,
    "maxProjects": 50
  }' \
  http://localhost:5000/api/tenants/tenant-uuid
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Tenant updated successfully",
  "data": {
    "id": "uuid",
    "name": "Demo Company",
    "status": "active",
    "subscriptionPlan": "enterprise",
    "maxUsers": 100,
    "maxProjects": 50
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required. Please provide valid JWT token."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You don't have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error. Please try again later."
}
```

---

## Status Codes Summary

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Permission denied |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal error |

---

## Rate Limiting

The API includes rate limiting:
- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

When limit is exceeded, the response includes:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1234567890
```

---

**Last Updated**: December 25, 2025
**API Version**: 1.0.0
**Status**: Production Ready
