# Quick Production Setup - Essential Variables

## 🔑 Required Environment Variables

You need to set these essential variables for production. Here are the commands:

### 1. WorkOS Configuration
```bash
# Get these from your WorkOS Dashboard (https://dashboard.workos.com/)
vercel env add WORKOS_API_KEY production
# Enter your production API key (starts with sk_live_)

vercel env add WORKOS_CLIENT_ID production  
# Enter your production client ID (starts with client_)
```

### 2. Site Configuration
```bash
vercel env add NEXT_PUBLIC_SITE_URL production
# Enter: https://zignal-login.vercel.app (or your custom domain)

vercel env add WORKOS_REDIRECT_URI production
# Enter: https://zignal-login.vercel.app/api/auth/workos/callback

vercel env add WORKOS_LOGOUT_REDIRECT_URI production
# Enter: https://zignal-login.vercel.app/
```

### 3. Supabase Configuration
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Enter your Supabase project URL

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Enter your Supabase anon key

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Enter your Supabase service role key
```

### 4. Admin Configuration
```bash
vercel env add ALLOWED_ADMIN_EMAILS production
# Enter: dagz55@gmail.com,admin@signals.org,admin@zignals.org
```

## ✅ Already Set
- WORKOS_COOKIE_PASSWORD ✅
- JWT_SECRET ✅
- SECURITY_LOGGING_ENABLED ✅
- SECURITY_LOG_LEVEL ✅

## 🚀 After Setting Variables
```bash
# Deploy to production
vercel --prod
```

## 📋 WorkOS Dashboard Setup
1. Go to https://dashboard.workos.com/
2. Navigate to Configuration → Redirect URIs
3. Add: `https://your-domain.vercel.app/api/auth/workos/callback`
4. Save changes
