# CSRF Protection Implementation

This document describes the comprehensive Cross-Site Request Forgery (CSRF) protection system implemented for the Zignal authentication application.

## Overview

The CSRF protection system implements a robust defense against state-changing attacks by using:

- **Double-submit cookie pattern** - Tokens stored in both cookies and headers
- **Session fingerprinting** - Tokens bound to session characteristics
- **Automatic token rotation** - Fresh tokens generated periodically
- **Rate limiting** - Protection against token generation abuse
- **Origin validation** - Additional header-based security checks

## Architecture

### Core Components

1. **`/lib/crypto-utils.ts`** - Cryptographic utilities for secure token generation
2. **`/lib/csrf-protection.ts`** - Core CSRF protection logic
3. **`/middleware/csrf.ts`** - CSRF validation middleware
4. **`/middleware.ts`** - Main Next.js middleware integration
5. **`/contexts/WorkOSAuthContext.tsx`** - Client-side CSRF token management
6. **`/hooks/useCSRFProtectedFetch.ts`** - React hooks for protected API calls

### Token Structure

```typescript
interface CSRFTokenData {
  token: string;        // 32-byte random hex token
  timestamp: number;    // Token generation time
  fingerprint: string;  // Session binding fingerprint
  hash: string;         // Integrity verification hash
}
```

### Security Configuration

```typescript
const CSRF_CONFIG = {
  TOKEN_LENGTH: 32,                    // Token byte length
  MAX_AGE: 3600000,                   // 1 hour token lifetime
  HEADER_NAME: 'x-csrf-token',        // Required request header
  COOKIE_NAME: 'csrf-token',          // Cookie storage name
  FINGERPRINT_COOKIE: 'csrf-fp',     // Fingerprint cookie
  PROTECTED_METHODS: ['POST', 'PUT', 'DELETE', 'PATCH'],
  EXCLUDE_PATHS: [
    '/api/auth/workos/callback',
    '/api/auth/workos/login',
    '/api/auth/workos/logout',
    '/api/auth/workos/me',
    '/api/crypto/prices',
    '/_next/',
    '/favicon.ico'
  ]
}
```

## Implementation Details

### 1. Token Generation

**Secure Random Generation:**
```typescript
// Uses Node.js crypto.randomBytes for cryptographically secure tokens
const token = randomBytes(32).toString('hex');

// Session fingerprint binding
const fingerprint = generateSessionFingerprint(
  userAgent, acceptLanguage, acceptEncoding, clientIP
);

// Integrity hash
const hash = createHash('sha256')
  .update(`${token}:${fingerprint}:${timestamp}`)
  .digest('hex');
```

**Rate Limiting:**
- Maximum 10 tokens per IP per minute
- Automatic cleanup of rate limit buckets
- Protection against token generation abuse

### 2. Token Validation

**Multi-layer Validation:**
1. **Presence Check** - Token exists in header and cookie
2. **Format Validation** - Proper token structure
3. **Expiry Check** - Token age within limits
4. **Fingerprint Binding** - Session characteristics match
5. **Integrity Verification** - Hash validation with timing-safe comparison

**Automatic Token Rotation:**
- Tokens older than 30 minutes trigger rotation
- New tokens sent in response headers
- Seamless client-side token updates

### 3. Middleware Integration

**Request Processing Flow:**
```
Request → CSRF Check → Origin Validation → Security Headers → Response
```

**Protected Methods:**
- All state-changing HTTP methods (POST, PUT, DELETE, PATCH)
- GET requests receive fresh tokens when needed

**Security Headers Added:**
- Content Security Policy (CSP)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### 4. Client-Side Integration

**Automatic Token Management:**
```typescript
const { makeAuthenticatedRequest, csrfToken } = useWorkOSAuth();

// CSRF token automatically included in state-changing requests
const response = await makeAuthenticatedRequest('/api/deposits', {
  method: 'POST',
  body: JSON.stringify(data)
});
```

**React Hooks:**
```typescript
// For standard API calls
const { post, put, delete: del } = useCSRFProtectedFetch();

// For form submissions
const { submitForm, isSubmitting } = useCSRFProtectedForm();

// For file uploads
const { uploadFile, uploadProgress } = useCSRFProtectedFileUpload();
```

## Security Features

### 1. Double-Submit Cookie Pattern

- CSRF token stored in both httpOnly cookie and request header
- Prevents attacks that can read/write cookies but not custom headers
- Immune to CSRF attacks from malicious websites

### 2. Session Fingerprinting

```typescript
// Fingerprint components
{
  userAgent: string,     // Browser identification
  acceptLanguage: string, // Language preferences
  acceptEncoding: string, // Compression preferences
  clientIP: string       // Network location
}
```

### 3. Origin/Referer Validation

- Validates request origin matches expected domain
- Fallback to Referer header validation
- Blocks requests from unauthorized origins

### 4. Suspicious Activity Detection

**Monitored Patterns:**
- Unusual user agents (curl, wget, bots)
- Rapid-fire requests
- Multiple failed validations
- Token generation abuse

## Integration Examples

### API Route Protection

```typescript
// Automatic CSRF validation through middleware
export async function POST(request: NextRequest) {
  // CSRF already validated by middleware
  const user = await getCurrentUser();
  // ... handle request
}
```

### Client-Side Usage

```typescript
// Using the auth context
const { makeAuthenticatedRequest } = useWorkOSAuth();

const handleSubmit = async (data) => {
  try {
    const response = await makeAuthenticatedRequest('/api/deposits', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    // Handle success
  } catch (error) {
    // Handle CSRF or other errors
  }
};
```

### Form Component Example

```typescript
const { submitForm, isSubmitting, error } = useCSRFProtectedForm();

const handleFormSubmit = async (formData) => {
  try {
    await submitForm('/api/profile', formData, 'PUT');
    // Success handling
  } catch (error) {
    // Error handling
  }
};
```

## Security Event Logging

The system logs comprehensive security events:

```typescript
// CSRF-specific events
'csrf_token_generated'
'csrf_token_validation_failed'
'csrf_attack_blocked'
'csrf_fingerprint_mismatch'
'csrf_origin_mismatch'
'csrf_suspicious_user_agent'

// General security events
'unauthorized_access_attempt'
'suspicious_deposit_amount'
'invalid_file_type'
'profile_update_unauthorized'
```

## Configuration

### Environment Variables

```bash
# Optional: Domain for secure cookies in production
COOKIE_DOMAIN=yourdomain.com

# Optional: Development bypass token (dev only)
CSRF_DEV_BYPASS_TOKEN=your-dev-token

# Required: HTTPS URL in production

```

### Content Security Policy

The system automatically applies strict CSP headers:

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
frame-ancestors 'none';
form-action 'self'
```

## Development Features

### Development Bypass

For testing purposes, development mode includes:
- Optional CSRF bypass header
- Detailed logging of validation steps
- Non-production security warnings

```typescript
// Development bypass (dev only)
headers: {
  'x-csrf-bypass': process.env.CSRF_DEV_BYPASS_TOKEN
}
```

### Testing

**Manual Testing:**
1. Attempt state-changing request without CSRF token → Should fail
2. Include valid CSRF token → Should succeed
3. Use expired token → Should fail with refresh
4. Cross-origin request → Should fail

**Security Validation:**
- All form submissions require CSRF tokens
- File uploads include CSRF protection
- Profile updates validate tokens
- Financial transactions are protected

## Best Practices

### For Developers

1. **Always use provided hooks** for API calls
2. **Test CSRF protection** in all state-changing operations
3. **Monitor security logs** for suspicious activity
4. **Update tokens** when sessions are refreshed

### For Deployment

1. **Enable HTTPS** in production
2. **Set COOKIE_DOMAIN** for multi-subdomain apps
3. **Monitor security events** in production logs
4. **Regular security audits** of CSRF implementation

## Troubleshooting

### Common Issues

**"CSRF token validation failed"**
- Check that token is included in request header
- Verify token hasn't expired
- Ensure session fingerprint matches

**"Missing CSRF token"**
- Confirm state-changing request includes token
- Check that middleware is properly configured
- Verify token generation is working

**"Origin header mismatch"**
- Validate request origin matches expected domain
- Check for cross-origin request issues
- Verify CORS configuration if needed

### Debugging

Enable detailed logging in development:
```typescript
// Check CSRF token status
console.log('CSRF Token:', csrfToken);

// Monitor security events
// All events logged to console in development
```

## Compliance

This implementation follows:
- **OWASP CSRF Prevention Guidelines**
- **RFC 6265** (HTTP State Management Mechanism)
- **NIST Cybersecurity Framework**
- **Common Weakness Enumeration (CWE-352)**

## Security Audit Checklist

- [ ] CSRF tokens required for all state-changing operations
- [ ] Tokens are cryptographically secure (crypto.randomBytes)
- [ ] Session fingerprinting prevents token theft
- [ ] Rate limiting prevents abuse
- [ ] Origin validation blocks cross-origin attacks
- [ ] Security headers are properly configured
- [ ] All sensitive operations are logged
- [ ] Token rotation prevents long-term exposure
- [ ] Development features disabled in production

## Conclusion

This CSRF protection system provides enterprise-grade security against cross-site request forgery attacks while maintaining excellent user experience. The implementation is transparent to users, automatic for developers, and provides comprehensive protection for all state-changing operations in the application.