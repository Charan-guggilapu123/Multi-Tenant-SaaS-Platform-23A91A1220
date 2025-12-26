# Development Environment Setup

## Prerequisites
- Node.js 18 LTS
- PostgreSQL 15
- Docker & Docker Compose
- Git

## Local Development Without Docker

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev  # Uses nodemon for auto-reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Vite dev server on port 3000
```

### 3. Database Setup
```bash
# Using Docker for database only
docker run --name saas-db \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15

# Or use local PostgreSQL
psql -U postgres
CREATE DATABASE saas_db;
```

## Docker Development

```bash
docker-compose up -d
docker-compose logs -f
docker-compose down
```

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
DB_HOST=database
DB_PORT=5432
DB_NAME=saas_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=dev_secret_key_change_in_production_min_32_chars
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:3000
PORT=5000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Hot Reload

- **Frontend**: Vite HMR enables instant reload on save
- **Backend**: Nodemon restarts on file changes

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Debugging

### Backend Debugging
```bash
node --inspect src/server.js
# Then open chrome://inspect in Chrome DevTools
```

### Frontend Debugging
- Use browser DevTools
- React DevTools extension recommended

## Database Migrations

```bash
# Sequelize auto-migration on sync
# In backend/src/server.js:
await sequelize.sync({ alter: true });
```

## Troubleshooting

### Database Connection Issues
- Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD
- Verify PostgreSQL is running
- Check network connectivity

### Port Already in Use
```bash
# Find and kill process
lsof -i :5000  # Backend
lsof -i :3000  # Frontend
lsof -i :5432  # Database
```

### Module Not Found
```bash
rm -rf node_modules package-lock.json
npm install
```

## Performance Optimization

### Backend
- Use database indexing
- Implement query caching
- Monitor connection pool

### Frontend
- Code splitting with Vite
- Lazy loading components
- Image optimization

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use HTTPS in production
- [ ] Validate all inputs
- [ ] Sanitize database queries
- [ ] Use environment variables for secrets
- [ ] Enable CORS properly in production
- [ ] Use security headers (Helmet)
