# Caching Strategy

## Application Caching

### In-Memory Caching
```javascript
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

// Cache tenant metadata
cache.set(tenantId, tenantData, 3600);
```

### Redis Caching
```javascript
const redis = require('redis');
const client = redis.createClient({
  host: 'localhost',
  port: 6379
});

// Cache user permissions
client.setex(`user:${userId}:permissions`, 3600, JSON.stringify(permissions));
```

## Cache Invalidation

1. **Time-based (TTL)**: Automatic expiration
2. **Event-based**: Invalidate on data change
3. **Pattern-based**: Clear related keys

## Database Query Caching

```javascript
// Cache frequently accessed data
const projectsCache = {};

// Invalidate on update
projectsCache[projectId] = null;
```
