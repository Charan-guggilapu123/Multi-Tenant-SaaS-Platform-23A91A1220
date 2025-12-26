# Deployment Guide

## Production Deployment

### Docker Deployment
```bash
# Build and run
docker-compose -f docker-compose.yml up -d

# Verify services
docker-compose ps
curl http://localhost:5000/api/health
```

### Environment Variables for Production

#### Backend
```
NODE_ENV=production
DB_HOST=production-db-host
DB_PORT=5432
DB_NAME=saas_db_prod
DB_USER=saas_user
DB_PASSWORD=<strong-password>
JWT_SECRET=<64-char-random-key>
JWT_EXPIRES_IN=24h
FRONTEND_URL=https://yourdomain.com
PORT=5000
```

#### Frontend
```
VITE_API_URL=https://api.yourdomain.com/api
```

## AWS Deployment

### ECS (Recommended)
1. Push images to ECR
2. Create ECS task definitions
3. Deploy to ECS cluster
4. Setup RDS PostgreSQL
5. Configure ALB for load balancing

### EC2
1. Install Docker & Docker Compose
2. Clone repository
3. Set environment variables
4. Run docker-compose up -d
5. Setup nginx reverse proxy

## Database Backups

### Manual Backup
```bash
docker exec database pg_dump -U postgres saas_db > backup.sql
```

### Automated Backups
```bash
# AWS RDS automated backups
# GCP Cloud SQL automated backups
# Azure Database automated backups
```

## Monitoring & Logging

### Application Monitoring
- Use Application Insights
- Monitor API response times
- Track error rates
- Alert on anomalies

### Log Aggregation
- Send logs to CloudWatch/ELK
- Monitor Docker container logs
- Archive old logs

## Security Hardening

1. **HTTPS/TLS**: Enable SSL certificates
2. **Environment Secrets**: Use secret managers
3. **Database**: Enable encryption at rest
4. **Firewall**: Restrict network access
5. **DDoS Protection**: Use CDN/WAF
6. **Secrets**: Rotate regularly

## Auto-Scaling

### Horizontal Scaling
```yaml
services:
  backend:
    deploy:
      replicas: 3
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/api/health"]
```

### Load Balancing
- nginx / HAProxy
- AWS ALB
- GCP Cloud Load Balancing
- Azure Load Balancer

## Rollback Strategy

1. Maintain Docker image versions
2. Tag releases: v1.0.0, v1.0.1, etc.
3. Keep previous docker-compose versions
4. Rollback: `docker-compose down && docker-compose up -d`

## Disaster Recovery

1. **RTO**: Target 1 hour
2. **RPO**: Target 15 minutes
3. **Backup Strategy**: Daily full, hourly incremental
4. **Test Recovery**: Monthly DR drill
5. **Documentation**: Maintain runbooks

## Performance Tuning

### Database
- Analyze slow queries
- Add missing indexes
- Optimize connection pooling

### Application
- Enable caching (Redis)
- Implement CDN for static assets
- Use gzip compression
- Minify and bundle JavaScript

### Infrastructure
- Vertical scaling (more CPU/RAM)
- Horizontal scaling (more instances)
- Database replication
- Message queuing
