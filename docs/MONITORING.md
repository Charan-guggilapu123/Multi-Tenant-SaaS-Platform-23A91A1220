# Monitoring & Observability

## Application Metrics

### Key Performance Indicators
- Request latency (p50, p95, p99)
- Error rates by endpoint
- Database query times
- Cache hit rates
- Active user sessions

## Health Checks

```bash
curl http://localhost:5000/api/health
# Response: {"status":"ok","database":"connected"}
```

## Log Levels

```javascript
// ERROR: Errors that need immediate attention
logger.error('Database connection failed');

// WARN: Warnings that may need attention
logger.warn('Slow query detected');

// INFO: General informational messages
logger.info('User login successful');

// DEBUG: Detailed debugging information
logger.debug('Query parameters', params);
```

## Alerting

Setup alerts for:
- CPU usage > 80%
- Memory usage > 90%
- Error rate > 1%
- Response time > 1s
- Database connection pool exhausted
