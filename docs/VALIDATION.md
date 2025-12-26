# Input Validation & Sanitization

## Validation Rules

### User Registration
```javascript
{
  tenantName: { required: true, minLength: 3, maxLength: 100 },
  tenantSubdomain: { required: true, pattern: /^[a-z0-9-]+$/, minLength: 3 },
  email: { required: true, format: 'email' },
  password: { required: true, minLength: 8 }
}
```

### Project Creation
```javascript
{
  name: { required: true, minLength: 1, maxLength: 255 },
  description: { maxLength: 2000 },
  status: { enum: ['active', 'archived'] }
}
```

## Sanitization Methods

1. **Trim whitespace**: Remove leading/trailing spaces
2. **Escape HTML**: Prevent XSS attacks
3. **Validate type**: Ensure correct data type
4. **Range check**: Verify within acceptable bounds
5. **Pattern match**: Verify against regex

## Example Validator

```javascript
const validator = {
  isEmail: (email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email),
  isUrl: (url) => /^https?:\/\/.+/.test(url),
  isStrongPassword: (pwd) => /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(pwd)
};
```

## SQL Injection Prevention

Use parameterized queries with Sequelize ORM:
```javascript
// SAFE: Uses parameterized query
User.findAll({ where: { email: userInput } });

// NEVER: String concatenation
User.findAll({ where: sequelize.where(sequelize.literal(`email = '${userInput}'`)) });
```
