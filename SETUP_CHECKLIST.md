# 🚀 WorkOS + Supabase Setup Checklist

## ✅ **Step 1: WorkOS Account Setup**

### 1.1 Create WorkOS Account
- [ ] Go to [workos.com](https://workos.com) and create an account
- [ ] Activate AuthKit in your WorkOS Dashboard
- [ ] Get your API Key and Client ID from the dashboard

### 1.2 Configure WorkOS Dashboard
- [ ] **Redirect URIs** (Authentication → Redirects):
  - Add: `http://localhost:3000/api/auth/workos/callback`
  - Add: `https://yourdomain.com/api/auth/workos/callback` (for production)
- [ ] **Login Endpoint** (Authentication → Redirects):
  - Set: `http://localhost:3000/api/auth/workos/login`
- [ ] **Logout Redirect** (Authentication → Redirects):
  - Set: `http://localhost:3000/`

### 1.3 Set up JWT Template
- [ ] Go to Authentication → Sessions in WorkOS Dashboard
- [ ] Create a new JWT template with this configuration:

```json
{
  "sub": "{{ user.id }}",
  "email": "{{ user.email }}",
  "role": "authenticated",
  "user_role": "{{ user.role }}",
  "aud": "authenticated",
  "exp": "{{ exp }}",
  "iat": "{{ iat }}",
  "iss": "https://api.workos.com/user_management/client_YOUR_CLIENT_ID"
}
```

**Replace `YOUR_CLIENT_ID` with your actual WorkOS Client ID**

## ✅ **Step 2: Supabase Account Setup**

### 2.1 Create Supabase Project
- [ ] Go to [supabase.com](https://supabase.com) and create a project
- [ ] Get your Supabase URL and Anon Key from Settings → API

### 2.2 Configure Supabase Third-Party Auth
- [ ] Go to Authentication → Third-party providers in Supabase Dashboard
- [ ] Add WorkOS as a provider:
  - **Provider**: WorkOS
  - **Issuer URL**: `https://api.workos.com/user_management/client_YOUR_CLIENT_ID`
  - **Client ID**: Your WorkOS Client ID
  - **Client Secret**: Your WorkOS API Key

## ✅ **Step 3: Environment Variables**

Create a `.env.local` file in your project root with:

```bash
# WorkOS Configuration
WORKOS_API_KEY=sk_your_actual_api_key_here
WORKOS_CLIENT_ID=client_your_actual_client_id_here
WORKOS_COOKIE_PASSWORD=8ylhQxRx8fGdLCBYldteGKE/Rt+mmUdU
WORKOS_REDIRECT_URI=http://localhost:3000/api/auth/workos/callback
WORKOS_LOGIN_ENDPOINT=http://localhost:3000/api/auth/workos/login
WORKOS_LOGOUT_REDIRECT_URI=http://localhost:3000/
WORKOS_ISSUER_URL=https://api.workos.com/user_management/client_YOUR_CLIENT_ID

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: Replace all placeholder values with your actual credentials!

## ✅ **Step 4: Test the Integration**

### 4.1 Validate Configuration
```bash
npm run test:workos
```

### 4.2 Start Development Server
```bash
npm run dev
```

### 4.3 Test Authentication Flow
- [ ] Navigate to `http://localhost:3000`
- [ ] Click "Sign in with WorkOS"
- [ ] Complete authentication in WorkOS AuthKit
- [ ] Verify redirect back to dashboard
- [ ] Test logout functionality

## ✅ **Step 5: Verify Integration**

### 5.1 Check WorkOS Authentication
- [ ] User can sign in via WorkOS AuthKit
- [ ] User session is maintained
- [ ] User can sign out successfully

### 5.2 Check Supabase Integration
- [ ] WorkOS tokens authenticate with Supabase
- [ ] Database queries work with RLS policies
- [ ] Real-time features function normally

## 🔧 **Troubleshooting**

### Common Issues:

1. **"Missing required WorkOS environment variables"**
   - Ensure all environment variables are set in `.env.local`
   - Restart your development server after adding variables

2. **"Invalid WorkOS URL format"**
   - Verify your WorkOS API key starts with `sk_`
   - Check that your Client ID starts with `client_`

3. **"Redirect URI mismatch"**
   - Ensure redirect URIs in WorkOS dashboard match your environment variables
   - Check that the callback endpoint is accessible

4. **"Supabase authentication failed"**
   - Verify WorkOS is configured as third-party provider in Supabase
   - Check that JWT template includes required claims
   - Ensure issuer URL matches your WorkOS Client ID

### Debug Mode:
Enable detailed logging by setting `NODE_ENV=development` in your environment variables.

## 📞 **Support**

If you encounter issues:
1. Check the test script output: `npm run test:workos`
2. Review the setup documentation: `WORKOS_SETUP.md`
3. Check the integration guide: `docs/WORKOS_SUPABASE_INTEGRATION.md`
4. Verify all dashboard configurations match the checklist above

## 🎉 **Success Indicators**

You'll know the setup is complete when:
- ✅ Test script shows all green checkmarks
- ✅ Authentication flow works end-to-end
- ✅ User can access protected routes
- ✅ Supabase database queries work with WorkOS tokens
- ✅ Logout clears both WorkOS and Supabase sessions
