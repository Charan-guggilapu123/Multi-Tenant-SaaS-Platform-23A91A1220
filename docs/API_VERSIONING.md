# API Versioning Strategy

## URL-Based Versioning

```
/api/v1/projects
/api/v2/projects
```

## Header-Based Versioning

```
Accept: application/vnd.saas-platform.v2+json
```

## Backward Compatibility

### Version 1.0
- Current stable version
- Fully supported
- Deprecation warnings added

### Version 2.0 (Future)
- Breaking changes allowed
- New features
- Improved performance
- Parallel running with v1.0

## Migration Path

1. Release v2.0 alongside v1.0
2. Provide 6-month transition period
3. v1.0 deprecated after 1 year
4. v1.0 sunset after 18 months

## Example Deprecated Endpoint

```javascript
/**
 * @deprecated Use /api/v2/projects instead
 * @removed 2026-12-31
 */
app.get('/api/v1/projects', (req, res) => {
  res.header('Deprecation', 'true');
  res.header('Sunset', 'Sun, 31 Dec 2026 23:59:59 GMT');
  // Return data with warning
});
```
