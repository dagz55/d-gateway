# 🚀 Quick Start Guide

## **Option 1: Interactive Setup (Recommended)**

Run the interactive setup script:

```bash
npm run setup:workos
```

This will guide you through setting up all required environment variables.

## **Option 2: Manual Setup**

1. **Create `.env.local` file** with your credentials:

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

2. **Configure WorkOS Dashboard:**
   - Go to [WorkOS Dashboard](https://dashboard.workos.com)
   - Add redirect URI: `http://localhost:3000/api/auth/workos/callback`
   - Set login endpoint: `http://localhost:3000/api/auth/workos/login`
   - Create JWT template (see `docs/workos-jwt-template.json`)

3. **Configure Supabase Dashboard:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Add WorkOS as third-party provider
   - Issuer URL: `https://api.workos.com/user_management/client_YOUR_CLIENT_ID`

## **Test the Integration**

```bash
# Validate configuration
npm run test:workos

# Start development server
npm run dev

# Open http://localhost:3000
```

## **Need Help?**

- 📋 **Complete Setup**: See `SETUP_CHECKLIST.md`
- 📚 **Detailed Guide**: See `WORKOS_SETUP.md`
- 🔧 **Integration Docs**: See `docs/WORKOS_SUPABASE_INTEGRATION.md`
- 🧪 **Test Script**: `npm run test:workos`

## **Success Indicators**

✅ Test script shows all green checkmarks  
✅ Authentication flow works end-to-end  
✅ User can access protected routes  
✅ Database queries work with WorkOS tokens  
✅ Logout clears both sessions  

---

**Ready to get started?** Run `npm run setup:workos` to begin! 🚀
