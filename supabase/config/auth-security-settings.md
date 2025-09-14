# Supabase Auth Security Configuration

This document outlines the required security settings for the Zignal application's authentication system.

## Required Security Settings

### 1. Leaked Password Protection

**Status**: ⚠️ NEEDS TO BE ENABLED

**Description**: Enable protection against compromised passwords by checking against HaveIBeenPwned.org database.

**How to Enable**:
1. Go to your Supabase Dashboard
2. Navigate to Authentication > Settings
3. Find "Password Strength" section
4. Enable "Check passwords against compromised database"

**API Configuration** (if using CLI):
```bash
supabase auth update --enable-leaked-password-protection
```

**Alternative via SQL** (if supported):
```sql
-- Note: This may need to be done via dashboard or CLI
-- Check Supabase documentation for latest method
ALTER SYSTEM SET password_encryption = 'bcrypt';
```

### 2. Password Strength Requirements

**Recommended Settings**:
- Minimum length: 8 characters
- Require uppercase letters: Enabled
- Require lowercase letters: Enabled  
- Require numbers: Enabled
- Require special characters: Enabled
- Check against compromised passwords: ✅ **REQUIRED**

### 3. Additional Security Recommendations

#### Session Management
- Session timeout: 24 hours (configurable)
- Refresh token rotation: Enabled
- Multiple sessions per user: Limited

#### MFA (Multi-Factor Authentication)
- TOTP support: Available
- SMS support: Available (if configured)

#### Rate Limiting
- Login attempts: 5 attempts per 15 minutes
- Password reset: 3 attempts per hour
- Email confirmation: 3 attempts per hour

## Implementation Status

- [x] Database functions security (search_path fixed)
- [ ] **Leaked password protection (MANUAL CONFIGURATION REQUIRED)**
- [x] Password hashing (bcrypt default)
- [x] JWT token validation
- [x] RLS (Row Level Security) policies

## Manual Steps Required

1. **Enable Leaked Password Protection**:
   - This MUST be done manually in the Supabase Dashboard
   - Go to Authentication > Settings > Password Strength
   - Toggle "Check passwords against compromised database" to ON

2. **Verify Settings**:
   - Test password creation with a known compromised password
   - Should be rejected with appropriate error message

## Security Validation

After implementing these changes, run the Supabase linter again to verify:

```bash
# Check for remaining security warnings
supabase db lint
```

Expected result: No more security warnings related to:
- `function_search_path_mutable`
- `auth_leaked_password_protection`

## Notes

- The leaked password protection setting cannot be automated via migrations
- It must be manually enabled in the Supabase Dashboard
- This setting will automatically check new passwords against compromised databases
- Users with existing compromised passwords should be prompted to change them