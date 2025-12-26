# Authentication & OAuth Integration

## JWT Authentication

### Token Structure
```
Header.Payload.Signature

Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "userId": "user-id",
  "tenantId": "tenant-id",
  "email": "user@example.com",
  "role": "tenant_admin",
  "iat": 1672041600,
  "exp": 1672128000
}
```

### Token Expiration
- Access Token: 24 hours
- Refresh Token: 7 days
- Session Timeout: 30 minutes of inactivity

## Multi-Factor Authentication (MFA)

### Supported Methods
1. TOTP (Time-based One-Time Password)
   - Google Authenticator
   - Microsoft Authenticator
   
2. SMS OTP
   - Twilio integration
   
3. Email OTP
   - Sent via email

## OAuth 2.0 Integration

### Supported Providers
- Google (social login)
- GitHub (developer accounts)
- Microsoft (enterprise)

```javascript
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  // User authenticated
}));
```

## Security Best Practices

1. HTTPS only in production
2. Secure token storage
3. CSRF protection
4. SameSite cookie policy
5. Token rotation
6. Session management
7. Brute-force protection
