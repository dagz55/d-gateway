# Backend Knowledge - Zignal Trading Platform

## Backend Architecture

### Core Stack
- **Framework**: Next.js 15.5.3 API Routes with App Router
- **Runtime**: Edge Runtime compatible for serverless deployment
- **Authentication**: Clerk with Supabase integration
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **File Storage**: Supabase Storage with public_image bucket
- **Deployment**: Vercel serverless functions
- **Security**: CSRF protection, rate limiting, session management

### Project Structure
```
app/api/               # API Routes
├── auth/
│   └── supabase/
│       └── me/        # User profile endpoint
├── admin/             # Admin API endpoints
│   ├── health/        # System health checks
│   ├── errors/        # Error logging
│   ├── users/         # User management
│   ├── signals/       # Signal management
│   └── assign-role/   # Role assignment
├── crypto/prices/     # Cryptocurrency data
├── signals/           # Trading signals
├── trades/            # Trade management
├── deposits/          # Deposit operations
├── withdrawals/       # Withdrawal operations
├── upload/avatar/     # File upload endpoint
└── news/              # News feed

lib/                   # Core backend utilities
├── supabase/          # Database clients
│   ├── server.ts      # Server-side client
│   ├── browserClient.ts # Client-side client
│   ├── adminClient.ts # Admin operations
│   └── types.ts       # Database type definitions
├── actions.ts         # Server actions
├── security/          # Security implementations
└── utils.ts           # Utility functions

middleware.ts          # Edge middleware
supabase/migrations/   # Database migrations
```

## Database Architecture (Supabase)

### Core Tables
```sql
-- User profiles (synced with Clerk)
profiles (
  id UUID PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,      -- Legacy Clerk user ID (main reference)
  clerk_user_id TEXT UNIQUE,         -- Current Clerk user ID (for photo uploads and newer features)
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  is_admin BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- Trading signals
signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  action TEXT NOT NULL,              -- 'BUY', 'SELL', 'HOLD'
  entry_price DECIMAL,
  target_price DECIMAL,
  stop_loss DECIMAL,
  take_profits DECIMAL[],            -- Multiple take profit levels
  confidence INTEGER,                 -- 1-100
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
)

-- User trades
trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES profiles(user_id),
  signal_id UUID REFERENCES signals(id),
  symbol TEXT NOT NULL,
  action TEXT NOT NULL,
  quantity DECIMAL,
  entry_price DECIMAL,
  exit_price DECIMAL,
  profit_loss DECIMAL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
)

-- Security events
security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  user_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- Notifications
notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,                -- 'trade', 'success', 'warning', 'error', 'system'
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- Packages (subscription tiers)
packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  duration_days INTEGER NOT NULL,
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- User packages (subscriptions)
user_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES profiles(user_id),
  package_id UUID REFERENCES packages(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
)
```

### Row Level Security (RLS) Policies
```sql
-- Profiles: Users can only access their own data
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Trades: Users can only see their own trades
CREATE POLICY "Users can view own trades" ON trades
  FOR SELECT USING (auth.uid()::text = user_id);

-- Signals: Public read access, admin write access
CREATE POLICY "Anyone can view signals" ON signals
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage signals" ON signals
  FOR ALL USING (is_admin_user(auth.uid()::text));

-- Notifications: Users can only see their own
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid()::text = user_id);
```

### Database Functions
```sql
-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin_user(user_id_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = user_id_param 
    AND (is_admin = true OR role = 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user profile by Clerk ID
CREATE OR REPLACE FUNCTION get_user_profile_by_clerk_id(clerk_id TEXT)
RETURNS profiles AS $$
DECLARE
  profile_record profiles;
BEGIN
  SELECT * INTO profile_record
  FROM profiles
  WHERE clerk_user_id = clerk_id;
  
  RETURN profile_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update avatar by Clerk ID
CREATE OR REPLACE FUNCTION update_user_avatar_by_clerk_id(
  clerk_id TEXT, 
  new_avatar_url TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE profiles
  SET avatar_url = new_avatar_url, updated_at = NOW()
  WHERE clerk_user_id = clerk_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Authentication Architecture

### Clerk + Supabase Integration
- **Clerk**: Handles user authentication, session management, OAuth
- **Supabase**: Stores user data, trading data, with Clerk user ID references
- **JWT Tokens**: Clerk access tokens authenticate with Supabase APIs
- **Session Sync**: User profiles synced between Clerk and Supabase

### Authentication Flow
1. User authenticates via Clerk (OAuth/Email/Magic Links)
2. Clerk provides JWT access token
3. Middleware validates Clerk session using `clerkMiddleware()`
4. API routes use Clerk token to access Supabase with RLS
5. User data synced between Clerk and `profiles` table

### Middleware Implementation
```typescript
// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

## API Endpoints

### Authentication Endpoints
- `GET /api/auth/supabase/me` - Get current user profile
- `/sign-in/[[...sign-in]]` - Clerk sign-in (dynamic routes)
- `/sign-up/[[...sign-up]]` - Clerk sign-up (dynamic routes)
- `/auth/oauth-success` - OAuth callback compatibility handler

### Trading Endpoints
```typescript
// GET /api/signals - Get active trading signals
export async function GET() {
  const supabase = createClient()
  const { data: signals, error } = await supabase
    .from('signals')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  
  return Response.json({ signals })
}

// POST /api/trades - Create new trade
export async function POST(request: NextRequest) {
  const { userId } = auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })
  
  const body = await request.json()
  // Validate and create trade
}
```

### Admin Endpoints
- `GET /api/admin/health` - System health checks
- `POST /api/admin/errors` - Error logging
- `GET /api/admin/users` - User management
- `GET /api/admin/signals` - Signal management
- `POST /api/admin/assign-role` - Role assignment

### External Integration Endpoints
- `GET /api/crypto/prices` - CoinGecko API integration
- `GET /api/news` - Cryptocurrency news feed
- `POST /api/upload/avatar` - File upload (up to 10MB)

## Security Implementation

### CSRF Protection
```typescript
// lib/csrf-protection.ts
const CSRF_CONFIG = {
  SECRET_KEY: process.env.CSRF_SECRET_KEY,
  COOKIE_NAME: 'csrf-token',
  HEADER_NAME: 'x-csrf-token',
  PROTECTED_METHODS: ['POST', 'PUT', 'DELETE', 'PATCH'],
  EXCLUDE_PATHS: [
    '/api/auth/supabase/me',
    '/api/crypto/prices',
    '/_next/',
    '/favicon.ico'
  ]
}
```

### Rate Limiting
```typescript
// lib/rate-limiter.ts
const RATE_LIMITS = {
  default: { requests: 100, window: '15m' },
  auth: { requests: 5, window: '15m' },
  upload: { requests: 10, window: '1h' },
  admin: { requests: 1000, window: '15m' }
}
```

### Session Security
- **JWT Validation**: Clerk handles JWT validation and refresh
- **Session Versioning**: Track sessions for invalidation
- **Device Fingerprinting**: Detect suspicious activity
- **Concurrent Limits**: Limit concurrent sessions per user

### Security Event Logging
```typescript
// lib/security-events.ts
interface SecurityEvent {
  event_type: 'login' | 'logout' | 'failed_auth' | 'suspicious_activity'
  severity: 'low' | 'medium' | 'high' | 'critical'
  user_id?: string
  ip_address: string
  user_agent: string
  message: string
  metadata?: any
}

export async function logSecurityEvent(event: SecurityEvent) {
  const supabase = createAdminClient()
  await supabase.from('security_events').insert(event)
}
```

## File Storage & Upload System

### Supabase Storage Configuration
```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('public_image', 'public_image', true);

-- Storage policies
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public_image' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'avatars'
);
```

### File Upload API (Primary Implementation)
```typescript
// app/api/upload/avatar/route.ts - Recommended approach
export async function POST(request: NextRequest) {
  const user = await currentUser()
  if (!user) return NextResponse.json(
    { success: false, error: 'User not authenticated' },
    { status: 401 }
  )
  
  const formData = await request.formData()
  const file = formData.get('file') as File
  
  // Validate file (type, size, format)
  if (!file || file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid file or file too large (max 10MB)' 
    }, { status: 400 })
  }
  
  const supabase = createClient()
  
  // Generate unique filename
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const fileName = `${user.id}/avatar-${timestamp}-${randomString}.${fileExtension}`
  
  try {
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('public_image')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })
    
    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`)
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('public_image')
      .getPublicUrl(fileName)
    
    // Update user profile
    await supabase
      .from('user_profiles')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', user.id)
    
    return NextResponse.json({
      success: true,
      avatarUrl: publicUrl,
      message: 'Avatar updated successfully',
    })
    
  } catch (error) {
    // Fallback to base64 if storage fails
    const base64Data = formData.get('base64') as string
    if (base64Data) {
      await supabase
        .from('user_profiles')
        .update({
          avatar_url: base64Data,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_user_id', user.id)
      
      return NextResponse.json({
        success: true,
        avatarUrl: base64Data,
        message: 'Avatar updated successfully (base64 fallback)',
      })
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload avatar',
    }, { status: 500 })
  }
}

// DELETE endpoint for avatar removal
export async function DELETE() {
  const user = await currentUser()
  if (!user) return NextResponse.json(
    { success: false, error: 'User not authenticated' },
    { status: 401 }
  )
  
  const supabase = createClient()
  
  // Remove avatar URL from profile
  await supabase
    .from('user_profiles')
    .update({
      avatar_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq('clerk_user_id', user.id)
  
  return NextResponse.json({
    success: true,
    message: 'Avatar removed successfully',
  })
}
```

### Alternative Server Action Implementation
The project also includes a Server Action approach in `lib/actions.ts` for form-based uploads, but the API route is the recommended primary implementation for better performance and flexibility.

## Real-time Features

### Supabase Real-time Subscriptions
```typescript
// Real-time notifications
const supabase = createClient()
supabase
  .channel('notifications')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`
    },
    (payload) => {
      // Handle new notification
      setNotifications(prev => [payload.new, ...prev])
    }
  )
  .subscribe()
```

### Live Data Updates
- **Market Data**: CoinGecko API with 30-second refresh
- **Trading Signals**: Real-time updates via Supabase subscriptions
- **Portfolio**: Live balance calculations
- **Notifications**: Instant delivery via WebSocket

## External Integrations

### CoinGecko API
```typescript
// app/api/crypto/prices/route.ts
export async function GET() {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=1h%2C24h%2C7d'
  )
  
  const data = await response.json()
  
  return Response.json({
    prices: data,
    lastUpdated: new Date().toISOString()
  })
}
```

### News Feed Integration
```typescript
// app/api/news/route.ts
export async function GET() {
  // Integrate with news API for cryptocurrency news
  const newsData = await fetchCryptoNews()
  return Response.json({ news: newsData })
}
```

## Deployment & Environment

### Vercel Serverless Configuration
```bash
# Production Environment Variables
AUTH_SERVICE_MODE=serverless
EDGE_COMPATIBLE=true
SERVERLESS_FUNCTIONS_URL=https://zignals.org/api
AUTH_MICROSERVICE_URL=https://zignals.org/api/auth
VERCEL_ENV=production
NODE_ENV=production

# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Security Configuration
CSRF_SECRET_KEY=your_csrf_secret_key
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret_key
```

### Edge Runtime Compatibility
```typescript
// API route with edge runtime
export const runtime = 'edge'

export async function GET(request: NextRequest) {
  // Edge-compatible code only
  // No Node.js APIs (fs, crypto, etc.)
}
```

## Database Migrations

### Migration System
```bash
# Apply migrations
node apply-migrations.js

# Create specific tables
node create-packages-tables.js

# Apply RLS policies
node apply-rls-fix.sh
```

### Migration Files
```
supabase/migrations/
├── 20240101000000_initial_schema.sql
├── 20240101000001_rls_policies.sql
├── 20240101000002_auth_triggers.sql
├── 20250920000001_add_clerk_user_id_to_user_profiles.sql
└── 20250919190000_fix_missing_rls_policies.sql
```

## Admin System

### Admin Detection
```typescript
// lib/admin.ts
export async function isAdmin(userId: string): Promise<boolean> {
  const { sessionClaims } = auth()
  
  // Check Clerk organization role
  if (sessionClaims?.o?.rol === 'admin') return true
  
  // Check Supabase profile
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, role')
    .eq('clerk_user_id', userId)
    .single()
  
  return profile?.is_admin || profile?.role === 'admin'
}
```

### Admin API Protection
```typescript
// Admin route protection
export async function GET(request: NextRequest) {
  const { userId } = auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })
  
  const isUserAdmin = await isAdmin(userId)
  if (!isUserAdmin) {
    return new Response('Forbidden', { status: 403 })
  }
  
  // Admin functionality
}
```

## Error Handling & Logging

### Error Logging System
```typescript
// lib/error-logger.ts
interface ErrorLog {
  message: string
  stack?: string
  user_id?: string
  request_url: string
  method: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export async function logError(error: ErrorLog) {
  const supabase = createAdminClient()
  await supabase.from('error_logs').insert({
    ...error,
    created_at: new Date().toISOString()
  })
}
```

### Build-time Protection
```typescript
// Prevent authentication during Next.js build
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
  return Response.json({ 
    message: 'Build-time execution' 
  }, { status: 200 })
}
```

## Performance Optimization

### Database Optimization
- **Indexes**: Strategic indexes on frequently queried columns
- **Connection Pooling**: Supabase handles connection pooling
- **Query Optimization**: Use proper WHERE clauses and LIMIT
- **RLS Performance**: Efficient RLS policies using indexes

### API Performance
- **Edge Runtime**: Ultra-fast serverless functions
- **Caching**: Cache static data and API responses
- **Pagination**: Implement proper pagination for large datasets
- **Rate Limiting**: Prevent abuse and manage resources

### Monitoring & Analytics
- **Vercel Analytics**: Built-in performance monitoring
- **Supabase Metrics**: Database performance tracking
- **Error Tracking**: Comprehensive error logging and alerting
- **Security Monitoring**: Real-time security event tracking

## Common Issues & Solutions

### Build Errors
- **Problem**: "Failed to collect page data" for admin routes
- **Solution**: Add build-time protection to prevent auth during static generation

### Authentication Issues
- **Problem**: Clerk session not found errors
- **Solution**: Ensure proper Clerk provider setup and middleware configuration

### Database Connection Issues
- **Problem**: Connection timeouts or rate limits
- **Solution**: Use connection pooling, implement retry logic, optimize queries

### File Upload Issues
- **Problem**: File size limits or upload failures
- **Solution**: Implement progressive enhancement with base64 fallback

### Lockfile Issues
- **Problem**: Next.js "Multiple lockfiles detected" warning
- **Solution**: 
  1. Remove conflicting package-lock.json, use only bun.lockb as primary package manager
  2. Configure `outputFileTracingRoot: path.resolve(process.cwd())` in next.config.mjs
  3. Remove duplicate Next.js config files to avoid conflicts

### Clerk Internal Routes
- **Problem**: Clerk catchall check routes causing middleware overhead
- **Solution**: Middleware already optimized with early return for clerk_catchall_check routes
