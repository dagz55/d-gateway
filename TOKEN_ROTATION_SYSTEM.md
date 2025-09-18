# Token Rotation System - Implementation Guide

## Overview

This document describes the comprehensive JWT token rotation system implemented for enhanced session security. The system implements a dual-token approach with automatic rotation, family tracking, and comprehensive security features.

## Architecture

### Core Components

1. **Token Manager** (`/lib/token-manager.ts`)
   - JWT token creation and validation
   - Token rotation logic
   - Family ID generation and tracking
   - Security utilities

2. **Refresh Token Store** (`/lib/refresh-token-store.ts`)
   - Secure token storage in Supabase
   - Token family management
   - Cleanup and revocation utilities

3. **Token Validation** (`/lib/token-validation.ts`)
   - Comprehensive token validation
   - Permission checking
   - Security validation with rate limiting

4. **Token Rotation Hook** (`/hooks/useTokenRotation.ts`)
   - React hook for automatic token refresh
   - Client-side token management
   - Background refresh scheduling

## Token Structure

### Access Token
```typescript
interface AccessToken {
  type: 'access';
  userId: string;
  sessionId: string;
  permissions: string[];
  iat: number;        // Issued at
  exp: number;        // Expires at
  jti: string;        // Unique token ID
  version: string;    // Token version
}
```

### Refresh Token
```typescript
interface RefreshToken {
  type: 'refresh';
  userId: string;
  sessionId: string;
  accessTokenId: string;
  familyId: string;   // Token family tracking
  iat: number;
  exp: number;
  jti: string;
  version: string;
}
```

## Security Features

### 1. Token Family Tracking
- Each refresh token belongs to a "family"
- Family lineage tracks token rotation chain
- Suspicious usage patterns trigger family revocation
- Maximum chain length prevents infinite rotation

### 2. One-Time Use Tokens
- Refresh tokens are invalidated after use
- New refresh token generated on each rotation
- Previous tokens become immediately invalid

### 3. Token Binding
- Tokens bound to user agent and session
- CSRF protection through token binding
- Device fingerprinting for additional security

### 4. Automatic Rotation
- Access tokens expire in 1 hour
- Auto-refresh 5 minutes before expiry
- Background refresh prevents user interruption
- Failed rotation triggers re-authentication

### 5. Threat Detection
- Token reuse detection
- Family chain analysis
- Suspicious pattern identification
- Automatic security responses

## Configuration

### Environment Variables
```bash
# Required
JWT_SECRET=your-256-bit-secret-key-here
WORKOS_COOKIE_PASSWORD=32-character-cookie-password

# Optional
TOKEN_CLEANUP_INTERVAL=3600  # 1 hour in seconds
MAX_TOKEN_FAMILIES_PER_USER=10
```

### Token Configuration
```typescript
const TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRY: 60 * 60,        // 1 hour
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60, // 7 days
  REFRESH_BEFORE_EXPIRY: 5 * 60,       // 5 minutes
  MAX_FAMILY_CHAIN_LENGTH: 10,
};
```

## Database Schema

### Token Families Table
```sql
CREATE TABLE token_families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    token_chain TEXT[] NOT NULL DEFAULT '{}',
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMPTZ NULL,
    revoked_reason TEXT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_hash VARCHAR(64) UNIQUE NOT NULL,
    family_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    access_token_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    invalidated BOOLEAN NOT NULL DEFAULT FALSE,
    invalidated_at TIMESTAMPTZ NULL
);
```

## API Endpoints

### Token Refresh
```
POST /api/auth/workos/refresh
```

**Request:**
```json
{
  "refreshToken": "jwt_refresh_token_here"
}
```

**Response:**
```json
{
  "accessToken": "new_access_token",
  "refreshToken": "new_refresh_token", 
  "expiresIn": 3600,
  "refreshExpiresIn": 604800,
  "tokenType": "Bearer",
  "rotated": true
}
```

### Token Status
```
GET /api/auth/workos/refresh
```

**Response:**
```json
{
  "hasRefreshToken": true,
  "canRefresh": true,
  "expiresAt": 1703980800000
}
```

### Token Revocation
```
DELETE /api/auth/workos/refresh
```

**Response:**
```json
{
  "revoked": true
}
```

## Usage Examples

### Client-Side Token Management
```typescript
import { useTokenRotation } from '@/hooks/useTokenRotation';
import { useWorkOSAuth } from '@/contexts/WorkOSAuthContext';

function MyComponent() {
  const { tokenRotation } = useWorkOSAuth();
  
  // Access token rotation state
  const {
    isRotating,
    canRotate,
    hasError,
    lastError,
    forceRotation,
    revokeTokens,
    getTokenExpiry
  } = tokenRotation;

  // Manual token refresh
  const handleRefresh = async () => {
    const result = await forceRotation();
    if (result.success) {
      console.log('Tokens refreshed successfully');
    } else {
      console.error('Token refresh failed:', result.error);
    }
  };

  // Token expiry information
  const expiry = getTokenExpiry();
  
  return (
    <div>
      <p>Token expires in: {expiry.accessTokenExpiry}</p>
      <p>Should refresh: {expiry.shouldRefresh}</p>
      <button onClick={handleRefresh} disabled={isRotating}>
        {isRotating ? 'Refreshing...' : 'Refresh Tokens'}
      </button>
    </div>
  );
}
```

### Server-Side Token Validation
```typescript
import { tokenValidator } from '@/lib/token-validation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Validate token with permissions
  const validation = await tokenValidator.validateForAPI(request, ['admin']);
  
  if (!validation.authorized) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Access user information
  const { user, shouldRefresh } = validation;
  
  // Suggest token refresh if needed
  const headers = shouldRefresh 
    ? { 'X-Token-Refresh-Suggested': 'true' }
    : {};

  return new Response('Protected data', { headers });
}
```

### Middleware Integration
```typescript
import { tokenValidator } from '@/lib/token-validation';

export async function middleware(request: NextRequest) {
  const validation = await tokenValidator.validateAccessToken(request);
  
  if (!validation.valid) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (validation.shouldRefresh) {
    // Add header to suggest client refresh
    const response = NextResponse.next();
    response.headers.set('X-Token-Refresh-Required', 'true');
    return response;
  }

  return NextResponse.next();
}
```

## Security Considerations

### 1. Token Storage
- **Access tokens**: Stored in HTTP-only cookies
- **Refresh tokens**: Stored in HTTP-only cookies with longer expiry
- **Never** store tokens in localStorage or sessionStorage
- Use secure, SameSite=Strict cookies in production

### 2. Token Transmission
- Always use HTTPS in production
- Include tokens in Authorization header: `Bearer <token>`
- Validate token binding on each request
- Rate limit token refresh endpoints

### 3. Error Handling
- Never expose token content in error messages
- Log security events for monitoring
- Implement proper fallback mechanisms
- Clear tokens on security violations

### 4. Monitoring and Alerts
- Track token usage patterns
- Monitor for suspicious rotation rates
- Alert on family revocations
- Log all security events

## Migration Guide

### From Session-Only Authentication
1. Deploy token system alongside existing sessions
2. Update authentication middleware to support both
3. Gradually migrate users to token authentication
4. Phase out session authentication after migration

### Database Migration
```bash
# Apply the token system migration
npx supabase migration up --linked

# Verify tables were created
npx supabase db show
```

### Environment Setup
1. Add JWT_SECRET to environment variables
2. Ensure WORKOS_COOKIE_PASSWORD is set (32 characters)
3. Configure token cleanup schedules
4. Update security headers and CSP

## Testing

### Unit Tests
```bash
# Test token system components
node test-token-system.js

# Run full test suite
npm test
```

### Integration Tests
```bash
# Test authentication flow
npm run test:auth

# Test token rotation
npm run test:rotation
```

### Performance Testing
- Token validation latency < 10ms
- Token rotation latency < 100ms
- Database cleanup performance
- Memory usage monitoring

## Troubleshooting

### Common Issues

1. **Token Validation Fails**
   - Check JWT_SECRET configuration
   - Verify token format and structure
   - Check token expiry times

2. **Rotation Not Working**
   - Verify refresh token validity
   - Check token family status
   - Ensure database connectivity

3. **Performance Issues**
   - Monitor database query performance
   - Check token cleanup frequency
   - Optimize token validation logic

### Debug Mode
```typescript
// Enable debug logging
process.env.DEBUG_TOKENS = 'true';

// Check token information
const decoded = tokenManager.decodeTokenUnsafe(token);
console.log('Token payload:', decoded);
```

## Security Audit Checklist

- [ ] JWT secrets are properly configured
- [ ] Tokens use secure algorithms (HS256/RS256)
- [ ] Token expiry times are appropriate
- [ ] Refresh token rotation is working
- [ ] Token families are properly tracked
- [ ] Suspicious usage detection is active
- [ ] Security events are logged
- [ ] Database access is secured
- [ ] HTTPS is enforced in production
- [ ] Rate limiting is implemented
- [ ] Error messages don't leak information
- [ ] Token cleanup is automated

## Performance Optimization

### Database Optimization
- Index token_hash for fast lookups
- Index family_id for family operations
- Partition tables by date for cleanup
- Use connection pooling

### Caching Strategy
- Cache valid tokens for validation
- Use Redis for token blacklists
- Implement token validation cache
- Cache user permissions

### Monitoring Metrics
- Token validation rate
- Token rotation frequency
- Database query performance
- Error rates and types
- Security event frequency

## Future Enhancements

1. **Multi-Device Support**
   - Device-specific token families
   - Remote device revocation
   - Device trust levels

2. **Advanced Security**
   - Biometric token binding
   - Geolocation validation
   - Behavioral analysis

3. **Scalability**
   - Distributed token validation
   - Multi-region token stores
   - Load balancing strategies

---

## Support

For questions or issues with the token rotation system:

1. Check the troubleshooting section
2. Review security event logs
3. Test with debug mode enabled
4. Consult the API documentation

**Security Issues**: Report immediately through secure channels