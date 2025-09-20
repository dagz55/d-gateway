########################################
# ZIGNALS — Production (Vercel)
# Domain: zignals.org
########################################

# ---- Cookies / CSRF (prod: no bypass) ----
COOKIE_DOMAIN=.zignals.org
CSRF_DEV_BYPASS_TOKEN=

# ---- Public URLs ----
NEXT_PUBLIC_BASE_URL=https://zignals.org
NEXT_PUBLIC_APP_URL=https://zignals.org
NEXT_PUBLIC_SITE_URL=https://zignals.org
NEXTAUTH_URL=https://zignals.org

# ---- Auth secrets ----
# Generate with: openssl rand -hex 32
NEXTAUTH_SECRET=REPLACE_ME_LONG_RANDOM
JWT_SECRET=REPLACE_ME_LONG_RANDOM

# ---- Admins & CORS ----
ALLOWED_ADMIN_EMAILS=robert@zignals.org,admin@zignals.org
# List all allowed origins explicitly (no wildcards in prod)
ALLOWED_ORIGINS=https://zignals.org,https://zignals-org.vercel.app

# ---- Rate limiting ----
RATE_LIMITING_ENABLED=true
RATE_LIMIT_STORAGE=redis
RATE_LIMIT_WHITELIST_IPS=127.0.0.1,::1
RATE_LIMIT_WHITELIST_UA=PostmanRuntime,Insomnia

# ---- Redis (Upstash) ----
# From your Upstash console:
# redis-cli -u redis://default:<TOKEN>@tolerant-kodiak-64394.upstash.io:6379
REDIS_HOST=tolerant-kodiak-64394.upstash.io:6379
REDIS_PASSWORD=REPLACE_ME_UPSTASH_TOKEN
# Optional: some libs prefer a full URL; keep both to be safe
REDIS_URL=redis://default:REPLACE_ME_UPSTASH_TOKEN@tolerant-kodiak-64394.upstash.io:6379

# ---- Security logging & processing ----
SECURITY_LOGGING_ENABLED=true
SECURITY_LOG_LEVEL=info           # debug|info|warn|error
SECURITY_REALTIME_PROCESSING=true
SECURITY_ALERTING_ENABLED=true    # set to true if you wire alerts
SECURITY_BATCH_LOGGING=true
SECURITY_BATCH_SIZE=50            # number of events per batch
SECURITY_BATCH_INTERVAL=2000      # ms between flushes

# Instance identifier for logs/metrics
SERVER_INSTANCE=zignals-prod-1

# ---- GeoIP (only if used) ----
GEOIP_SERVICE_URL=https://geoip.example.com
GEOIP_API_KEY=REPLACE_ME_GEOIP_KEY

# ---- WorkOS / AuthKit (replace with your real values) ----
# Get API key & client ID from: https://dashboard.workos.com/
WORKOS_API_KEY=REPLACE_ME_WORKOS_API_KEY
WORKOS_CLIENT_ID=REPLACE_ME_WORKOS_CLIENT_ID

# Your company email domain(s) allowed for org login / magic links
WORKOS_EMAIL_DOMAIN=zignals.org

# Core WorkOS endpoints (keep defaults unless your template expects overrides)
WORKOS_AUTH_API_DOMAIN=https://api.workos.com
WORKOS_ISSUER_URL=https://api.workos.com
# If your code uses AuthKit-hosted endpoints:
WORKOS_AUTHKIT_DOMAIN=https://auth.workos.com
WORKOS_AUTHKIT_URL=https://auth.workos.com

# WorkOS Admin Portal (set if your app links to a managed portal; else leave blank)
WORKOS_ADMIN_PORTAL_DOMAIN=

# App routes used by WorkOS OAuth/OIDC
# Make sure these URIs are also whitelisted in the WorkOS dashboard.
WORKOS_REDIRECT_URI=https://zignals.org/api/auth/workos/callback
WORKOS_LOGIN_ENDPOINT=/api/auth/workos/login
WORKOS_LOGOUT_REDIRECT_URI=https://zignals.org

# Cookie crypto for WorkOS sessions (32+ chars)
# Generate with: openssl rand -base64 48
WORKOS_COOKIE_PASSWORD=REPLACE_ME_LONG_RANDOM

# ---- Debug (leave empty in prod) ----
DEBUG_TOKENS=