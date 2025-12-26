# Error Handling Strategy

## Error Classification

### 4xx Client Errors
- 400: Bad Request (invalid input)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (not authorized)
- 404: Not Found
- 409: Conflict (duplicate resource)

### 5xx Server Errors
- 500: Internal Server Error
- 502: Bad Gateway
- 503: Service Unavailable

## Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      {
        "field": "email",
        "message": "Email must be valid"
      }
    ]
  },
  "timestamp": "2025-12-26T10:00:00Z"
}
```

## Global Error Handler

```javascript
app.use((err, req, res, next) => {
  console.error(err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    success: false,
    error: { code: err.code, message }
  });
});
```

## Logging Best Practices

1. Log all errors with full context
2. Include request ID for tracing
3. Never log sensitive data (passwords, tokens)
4. Use appropriate log levels
5. Implement log rotation
