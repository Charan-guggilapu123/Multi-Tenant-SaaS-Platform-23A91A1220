# Testing Strategy

## Unit Testing

### Backend Tests
```bash
cd backend
npm install --save-dev jest supertest
npm test
```

### Test Structure
```
backend/
├── src/
│   └── __tests__/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       └── routes/
```

### Example Test
```javascript
describe('AuthController', () => {
  test('should register new tenant', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        tenantName: 'Test Co',
        tenantSubdomain: 'test-co',
        email: 'admin@testco.com',
        password: 'Test@123'
      });
    expect(response.status).toBe(201);
  });
});
```

## Integration Testing

### API Tests
```bash
# Test all endpoints
npm run test:api

# Test specific endpoint
npm run test:api -- auth
```

### End-to-End Tests
```javascript
// Frontend E2E test
describe('User Login Flow', () => {
  test('should login and access dashboard', async () => {
    // Navigate to login
    // Enter credentials
    // Submit form
    // Verify redirect to dashboard
  });
});
```

## Security Testing

### OWASP Top 10
1. SQL Injection: ✓ (Using Sequelize ORM)
2. Authentication: ✓ (JWT + Bcrypt)
3. Sensitive Data: ✓ (Environment variables)
4. Entity Access: ✓ (Row-level isolation)
5. XSS Prevention: ✓ (React escaping)
6. CSRF Protection: ✓ (SameSite cookies)

### Security Scanning
```bash
# Dependency scanning
npm audit
npm audit fix

# Code scanning
npm run lint
npx eslint . --ext .js,.jsx
```

## Performance Testing

### Load Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:5000/api/health

# Using wrk
wrk -t12 -c400 -d30s http://localhost:5000/api/health
```

### Database Performance
```sql
-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Analyze query plan
EXPLAIN ANALYZE SELECT * FROM projects WHERE tenantId = '...';
```

## Test Coverage

### Target Metrics
- Statements: 80%+
- Branches: 75%+
- Functions: 80%+
- Lines: 80%+

### Generate Report
```bash
npm run test:coverage
# Open coverage/index.html
```

## Continuous Integration

### GitHub Actions
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run lint
```

## Test Data

### Seed Data for Testing
```javascript
// Uses submission.json credentials
const testUsers = {
  superAdmin: 'superadmin@system.com',
  tenantAdmin: 'admin@demo.com',
  regularUser: 'user1@demo.com'
};
```

## Accessibility Testing

### Manual Testing
- Keyboard navigation
- Screen reader compatibility
- Color contrast (WCAG AA)
- Focus indicators

### Automated Testing
```bash
npm install --save-dev jest-axe
# Run accessibility checks
```

## Mobile Testing

### Responsive Design
- Test on iPhone 12/13
- Test on Android devices
- Test on tablets
- Test on desktop

### Browser Compatibility
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Metrics

### Key Metrics
- **FCP**: First Contentful Paint < 1s
- **LCP**: Largest Contentful Paint < 2.5s
- **CLS**: Cumulative Layout Shift < 0.1
- **API Response**: < 200ms

### Measurement Tools
- Google Lighthouse
- WebPageTest
- New Relic
- Datadog
