    # Code Quality & Standards

## Code Style Guide

### JavaScript Conventions
```javascript
// Use camelCase for variables and functions
const userCount = 10;
function getUserById(id) { }

// Use PascalCase for classes and components
class UserService { }
function UserProfile() { }

// Use UPPER_CASE for constants
const MAX_LOGIN_ATTEMPTS = 5;
const API_BASE_URL = 'http://api.example.com';
```

## ESLint Configuration

```javascript
module.exports = {
  env: {
    node: true,
    es2021: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 13
  },
  rules: {
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-console': 'warn',
    'no-unused-vars': 'error'
  }
};
```

## Prettier Configuration

Auto-format code:
- Indentation: 2 spaces
- Print width: 100
- Single quotes
- Trailing comma: es5

## Code Complexity Limits

- Cyclomatic complexity: < 10
- Function length: < 50 lines
- File size: < 300 lines
- Nesting depth: < 4 levels

## Documentation Standards

```javascript
/**
 * Calculate total project progress
 * @param {number} completedTasks - Number of completed tasks
 * @param {number} totalTasks - Total number of tasks
 * @returns {number} Progress percentage (0-100)
 * @throws {Error} If totalTasks is 0
 */
function calculateProgress(completedTasks, totalTasks) {
  if (totalTasks === 0) throw new Error('Total tasks cannot be 0');
  return (completedTasks / totalTasks) * 100;
}
```

## Code Review Checklist

- [ ] Tests pass
- [ ] Follows code style
- [ ] No console.log statements (use proper logging)
- [ ] No hardcoded values
- [ ] Comments explain why, not what
- [ ] Error handling implemented
- [ ] Security best practices followed
- [ ] Performance considerations addressed
- [ ] Documentation updated
