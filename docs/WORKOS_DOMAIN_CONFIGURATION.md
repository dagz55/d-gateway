# WorkOS Domain Configuration

This document outlines the WorkOS domain configuration for the Zignal project based on the WorkOS admin panel settings.

## Domain Configuration

### Email Domain
- **Domain**: `workos.dev` (Default)
- **Purpose**: Domain used in sender address for Admin Portal invitations and in AuthKit authentication flows
- **Environment Variable**: `WORKOS_EMAIL_DOMAIN=workos.dev`

### Admin Portal
- **Domain**: `setup.workos.com` (Default)
- **Purpose**: Domain to use for Admin Portal, a self-serve onboarding experience for organization admins
- **Environment Variable**: `WORKOS_ADMIN_PORTAL_DOMAIN=setup.workos.com`

### Authentication API
- **Domain**: `auth.workos.com` (Default)
- **Purpose**: Domain to use for WorkOS authentication requests. End users may see it briefly when they are redirected to an identity provider
- **Environment Variable**: `WORKOS_AUTH_API_DOMAIN=auth.workos.com`

### AuthKit
- **Domain**: `exciting-tea-84-staging.authkit.app` (Default)
- **Purpose**: Domain to use for AuthKit, a hosted authentication UI by WorkOS
- **Environment Variable**: `WORKOS_AUTHKIT_DOMAIN=exciting-tea-84-staging.authkit.app`

## Environment Variables Setup

Add the following environment variables to your `.env.local` file:

```bash
# ===== CORE WORKOS CONFIGURATION =====
WORKOS_API_KEY=your_workos_api_key_here
WORKOS_CLIENT_ID=your_workos_client_id_here
WORKOS_COOKIE_PASSWORD=your_32_character_cookie_password_here

# ===== WORKOS DOMAIN CONFIGURATION =====
WORKOS_EMAIL_DOMAIN=workos.dev
WORKOS_ADMIN_PORTAL_DOMAIN=setup.workos.com
WORKOS_AUTH_API_DOMAIN=auth.workos.com
WORKOS_AUTHKIT_DOMAIN=exciting-tea-84-staging.authkit.app

# ===== APPLICATION URLS =====
NEXT_PUBLIC_SITE_URL=https://zignals.org
WORKOS_REDIRECT_URI=https://zignals.org/api/auth/workos/callback
WORKOS_LOGOUT_REDIRECT_URI=https://zignals.org/
WORKOS_AUTHKIT_URL=https://exciting-tea-84-staging.authkit.app
WORKOS_ISSUER_URL=https://api.workos.com/user_management/your_client_id_here

# ===== DEVELOPMENT OVERRIDES =====
# For local development, use:
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
# WORKOS_REDIRECT_URI=http://localhost:3000/api/auth/workos/callback
# WORKOS_LOGOUT_REDIRECT_URI=http://localhost:3000/

# ===== SERVERLESS CONFIGURATION =====
AUTH_SERVICE_MODE=serverless
EDGE_COMPATIBLE=true
SERVERLESS_FUNCTIONS_URL=https://zignals.org/api
AUTH_MICROSERVICE_URL=https://zignals.org/api/auth
```

## Implementation Details

### WorkOS Authentication Service
The project includes a comprehensive WorkOS authentication service (`lib/workos-auth-service.ts`) that:

1. **Handles Domain Configuration**: Uses the configured domains for all WorkOS operations
2. **Manages Authentication Flow**: Provides methods for login, callback handling, and user management
3. **Security Features**: Includes state validation, health checks, and security logging
4. **Error Handling**: Proper error handling with detailed logging and user-friendly messages

### API Endpoints
The following API endpoints have been updated to use the new WorkOS configuration:

- `/api/auth/workos/login` - Initiates WorkOS authentication
- `/api/auth/workos/callback` - Handles OAuth callback
- `/api/auth/workos/me` - Gets current authenticated user
- `/api/auth/workos/logout` - Signs out user

### Authentication Context
The AuthContext has been updated to:

1. **Handle 401 Responses Properly**: 401 responses are now treated as normal "not authenticated" state rather than errors
2. **Improved Error Handling**: Better error categorization and logging
3. **Security Logging**: Integration with the security logging system

## Testing the Configuration

1. **Health Check**: Use the WorkOS health check endpoint to verify configuration
2. **Authentication Flow**: Test the complete login/logout flow
3. **Error Handling**: Verify proper error handling for various scenarios

## Security Considerations

1. **Cookie Security**: Ensure `WORKOS_COOKIE_PASSWORD` is exactly 32 characters
2. **Domain Validation**: Verify all domains match your WorkOS configuration
3. **HTTPS**: Use HTTPS in production for secure cookie handling
4. **CORS**: Configure proper CORS settings for your domains

## Troubleshooting

### Common Issues

1. **401 Unauthorized Errors**: 
   - Check if WorkOS credentials are correct
   - Verify domain configuration matches WorkOS admin panel
   - Ensure redirect URIs are properly configured

2. **Authentication Redirects**:
   - Verify `WORKOS_REDIRECT_URI` matches WorkOS configuration
   - Check that domains are accessible and properly configured

3. **Cookie Issues**:
   - Ensure `WORKOS_COOKIE_PASSWORD` is exactly 32 characters
   - Verify cookie security settings for your environment

### Debug Mode
Enable debug logging by setting:
```bash
SECURITY_LOGGING_ENABLED=true
SECURITY_LOG_LEVEL=debug
```

This will provide detailed logs for troubleshooting authentication issues.
