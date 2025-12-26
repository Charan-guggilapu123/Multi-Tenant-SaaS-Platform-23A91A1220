# API Rate Limiting & Throttling

## Configuration

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

## Tenant-Specific Limits

```javascript
const tenantLimiter = {
  starter: 1000,    // requests/day
  pro: 10000,       // requests/day
  enterprise: null  // unlimited
};
```
