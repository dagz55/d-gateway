# Quick Production Setup - Essential Variables

## 🔑 Required Environment Variables

You need to set these essential variables for production. Here are the commands:

### 1. Clerk Configuration
```bash
# Get these from your Clerk Dashboard (https://dashboard.clerk.com/)
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
# Enter your production publishable key (starts with pk_live_)

vercel env add CLERK_SECRET_KEY production  
# Enter your production secret key (starts with sk_live_)
```

### 2. Site Configuration
```bash
vercel env add NEXT_PUBLIC_SITE_URL production
# Enter: https://zignal-login.vercel.app (or your custom domain)

# Clerk handles OAuth redirects automatically
# Just set your domain in Clerk dashboard: https://zignal-login.vercel.app
```

### 3. Supabase Configuration
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Enter your production Supabase URL

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Enter your production anon key

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Enter your production service role key (keep this secret!)
```

### 4. Security Configuration
```bash
vercel env add JWT_SECRET production
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

vercel env add ALLOWED_ADMIN_EMAILS production
# Enter: admin@zignals.org,your-email@example.com
```

## ✅ Verification Checklist

After setting variables, verify in Vercel dashboard:

- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ✅
- CLERK_SECRET_KEY ✅
- NEXT_PUBLIC_SUPABASE_URL ✅
- NEXT_PUBLIC_SUPABASE_ANON_KEY ✅
- SUPABASE_SERVICE_ROLE_KEY ✅
- JWT_SECRET ✅
- ALLOWED_ADMIN_EMAILS ✅

## 🚀 Deploy
```bash
vercel --prod
```

Your production app will be live with all authentication and database features working!