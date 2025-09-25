# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
npm run dev          # Start development server
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Environment Setup
Environment variables required in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For admin operations
```

## Architecture Overview

### Core Stack
- **Framework**: Next.js 15.5.4 with App Router and React 19.1.1
- **Authentication**: Clerk with App Router integration
- **Database**: Supabase with Row Level Security
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query + Zustand
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion
- **MCP Integration**: Model Context Protocol gateway with 6 services
- **Development**: Turbopack for faster builds

### Key Architecture Patterns

#### Route Protection & Middleware
- Middleware uses `clerkMiddleware()` from `@clerk/nextjs/server` for session management
- Protected routes use `(dashboard)` route group with shared layout
- Clerk handles OAuth flows automatically with `/sign-in` and `/sign-up` routes
- **IMPORTANT**: Deprecated `/auth/*` paths have been removed (production uses external domain)
- Role-based redirects: `/dashboard` → `/dashboard/admins` (admin) or `/dashboard/members` (member)

#### Supabase Client Architecture
- **Server Components**: Use `lib/supabase/server.ts` with cookie-based session management
- **Client Components**: Use `lib/supabase/browserClient.ts` 
- **Admin Operations**: Use `lib/supabase/server.ts` with `createAdminClient()`
- All clients are properly typed with `Database` interface from `lib/supabase/types.ts`

#### Component Organization
```
components/
├── dashboard/          # Trading dashboard components (charts, portfolio, signals)
├── layout/            # AppLayout, Header, Sidebar, ProfileDropdown, NotificationDropdown for dashboard pages
├── ui/                # Complete shadcn/ui component library (26 components)
├── wallet/            # Comprehensive wallet management components (deposit, withdraw, history)
├── settings/          # Profile settings, photo upload, and configuration forms
├── landing/           # Landing page components with navigation and features
└── auth/              # Authentication components (Clerk AuthLayout)
```

#### Data Fetching Pattern
- Custom hooks in `hooks/api/` using TanStack Query
- Server actions in `lib/actions.ts` for form submissions, file uploads, and mutations
- API routes in `app/api/` for external integrations (crypto prices, news, etc.)
- Profile photo uploads use dual-path system (Supabase Storage + Base64 fallback)

### Routing Structure
- **Landing**: `/` - Original login page (redirects to dashboard if authenticated)
- **Authentication**:
  - **Local Dev**: `/sign-in/[[...sign-in]]` and `/sign-up/[[...sign-up]]` - Clerk authentication with split-panel design
  - **Production**: External domain `https://account.zignals.org/sign-in` and `https://account.zignals.org/sign-up`
  - **Admin Setup**: `/admin-setup` - Role assignment for predefined admin emails
  - **OAuth Compatibility**: `/auth/oauth-success` - Temporary redirect handler for Clerk OAuth callbacks
- **Dashboard**:
  - **Admin Dashboard**: `/dashboard/admins/*` - Admin panel with full system management
  - **Member Dashboard**: `/dashboard/members/*` - Member-specific dashboard and features
  - **Legacy Dashboard**: `/dashboard` - Redirects to role-appropriate dashboard based on user role
- **Market**: `/market` - Live cryptocurrency market data with professional navigation
- **Wallet**: `/wallet` - Comprehensive wallet management system
- **Profile**: `/profile` - User profile management
- **Settings**: `/settings` - User preferences and account settings
- **Legacy Routes**: `/admin/*` and `/member/*` - Maintained for backward compatibility
- **Public Pages**: `/enterprise`, `/help` - Marketing and support pages

### Critical Implementation Details

#### Dashboard Layout Pattern
All dashboard pages use the `(dashboard)` route group which provides:
- Consistent `AppLayout` with Header (including NotificationDropdown) and Sidebar
- Protected authentication via middleware
- Shared loading and error boundaries
- Real-time notification system integrated in the header

#### Theme System
- Uses `next-themes` with persistence
- Theme context in `contexts/` directory
- Components support both light and dark modes

#### Type Safety
- Complete TypeScript setup with strict mode
- Database types generated from Supabase schema
- Component props properly typed throughout

#### Notification System
- **Real-time Notifications**: Uses Supabase real-time subscriptions for instant updates
- **Component**: `NotificationDropdown` in header with bell icon and unread badge
- **Database**: `notifications` table with proper RLS policies for user data protection
- **Features**: Mark as read, mark all as read, categorized icons (trade, success, warning, error, system)
- **Colors**: Enhanced contrast colors for better readability (emerald-400, amber-400, red-400, cyan-400)
- **Testing**: `/test-notifications` page and `/api/test-notifications` API for creating sample data
- **Integration**: Fully integrated with Clerk authentication and existing dashboard layout

## Clerk Integration Guidelines

### CRITICAL INSTRUCTIONS FOR AI MODELS

#### ALWAYS DO THE FOLLOWING
1. **Use `clerkMiddleware()`** from `@clerk/nextjs/server` in `middleware.ts`
2. **Wrap** app with `<ClerkProvider>` in `app/layout.tsx`
3. **Import** Clerk features from `@clerk/nextjs` (e.g., `<SignInButton>`, `<SignUpButton>`, `<UserButton>`)
4. **Reference** App Router approach (folders like `app/page.tsx`, `app/layout.tsx`)
5. **Check** imports for methods like `auth()` from `@clerk/nextjs/server` with `async/await`

#### NEVER DO THE FOLLOWING
1. **Do not** reference old `_app.tsx` or pages router instructions
2. **Do not** suggest `authMiddleware()` from older tutorials—use `clerkMiddleware()`
3. **Do not** recommend deprecated environment variable patterns
4. **Do not** import from deprecated APIs (`withAuth`, `currentUser` from older versions)

### Required Environment Variables
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

### Correct Implementation Pattern
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

```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

#### Wallet Management System
- **Comprehensive Wallet**: Dual-wallet system (Trading Wallet + Income Wallet) with real-time balance tracking
- **Deposit Flow**: Complete deposit form with amount, reference number, payment method, and screenshot upload
- **Withdrawal Flow**: Portfolio-integrated withdrawal with balance validation and multiple wallet sources
- **Transaction History**: Detailed history tracking for both deposits and withdrawals with filtering and search
- **Components**:
  - `DepositComponent`: Full deposit form with file upload and validation
  - `WithdrawComponent`: Portfolio-aware withdrawal with balance checks
  - `DepositHistory`: Searchable deposit transaction history
  - `WithdrawalHistory`: Searchable withdrawal transaction history
- **Features**: Real portfolio integration, file upload validation, payment method selection, and transaction tracking

## Development Workflow

### Adding New Features
1. Create components in appropriate directory (`components/dashboard/`, `components/ui/`)
2. Add API routes in `app/api/` if external data needed
3. Create data fetching hooks in `hooks/api/` using TanStack Query
4. Add routes in `app/(dashboard)/` for protected pages or `app/` for public pages
5. Update types in relevant type files if needed

### Working with Supabase
- Always use the appropriate client based on context (server vs client components)
- Server components: Import from `lib/supabase/server.ts`
- Client components: Import from `lib/supabase/browserClient.ts`  
- Admin operations: Use `createAdminClient()` from server.ts
- File uploads: Use server actions in `lib/actions.ts` (uploadAvatar, uploadAvatarBase64, removeAvatar)
- Storage bucket: `avatars` bucket for profile photos with 5MB limit

### Styling Guidelines
- Use Tailwind CSS classes consistently with existing patterns
- Leverage shadcn/ui components from `components/ui/`
- Follow dark/light theme patterns established in existing components
- Use CSS variables defined in `app/globals.css` for theme colors

### Testing & Validation
- Always run `npm run build` before considering features complete
- Check `npm run lint` for code quality
- Test both light and dark themes
- Verify responsive design on mobile devices
- Test authentication flows including OAuth

## Recent Changes & Version History

### v2.11.14 - Vercel Deployment & User Profile Integration (January 2025)
- **🔧 Vercel Deployment Fix**: Resolved critical build error with MCP adapter imports
  - Fixed `Module not found: Can't resolve '@vercel/mcp-adapter'` error
  - Separated combined import statements into individual imports for better module resolution
  - Ensured Vercel deployment compatibility while maintaining all MCP functionality
  - Verified build success both locally and for Vercel deployment

- **👤 User Profile Integration**: Resolved Supabase profile creation issues for Clerk users
  - Fixed "User profile not found in Supabase for Clerk ID" errors
  - Added automatic profile creation when users exist in Clerk but not in Supabase
  - Updated wallet page to auto-create profiles using Clerk user data
  - Modified avatar upload routes to use upsert operations for missing profiles
  - Implemented graceful fallbacks for profile creation failures
  - Enhanced error handling and logging for better debugging

- **📱 Mobile Responsiveness**: Enhanced mobile user experience across dashboard
  - Optimized sidebar width and spacing for mobile devices (reduced from 64px to 48px)
  - Reduced padding and margins for better space utilization
  - Scaled typography and form elements for mobile screens
  - Enhanced profile settings page mobile layout
  - Improved form component responsiveness across all settings pages

- **🎛️ Configurable Market Overview**: Enhanced market dashboard with user preferences
  - Added display count selector (10, 20, 30, 50, 100 cryptocurrencies)
  - Implemented localStorage persistence for user preferences
  - Enhanced market data filtering and display options
  - Added settings icon and improved UI controls

- **🏠 Landing Page Navigation**: Enhanced navigation for dashboard users
  - Added "Dashboard" button to landing page navigation for signed-in users
  - Implemented responsive design for both desktop and mobile
  - Maintained consistent styling with landing page theme

- **🔌 MCP Gateway Integration**: Comprehensive Model Context Protocol gateway implementation
  - Created centralized MCP gateway with Docker containerization
  - Added Clerk OAuth token authentication for MCP requests
  - Implemented metadata validation and response enhancement
  - Added environment variable override functionality in containers
  - Created comprehensive test suite for MCP gateway functionality
  - Added NextJS API integration at `/api/mcp/nextjs`
  - Implemented service discovery and health monitoring
  - Added support for multiple MCP services (filesystem, supabase, memory, puppeteer, context7, reactbits)
  - Created Docker Compose configurations for testing and production
  - Added comprehensive documentation and test results

### v2.11.13 - MCP Gateway Integration (September 2025)
- **🔌 MCP Gateway Integration**: Comprehensive Model Context Protocol gateway implementation
  - Created centralized MCP gateway with Docker containerization
  - Added Clerk OAuth token authentication for MCP requests
  - Implemented metadata validation and response enhancement
  - Added environment variable override functionality in containers
  - Created comprehensive test suite for MCP gateway functionality
  - Added NextJS API integration at `/api/mcp/nextjs`
  - Implemented service discovery and health monitoring
  - Added support for multiple MCP services (filesystem, supabase, memory, puppeteer, context7, reactbits)
  - Created Docker Compose configurations for testing and production
  - Added comprehensive documentation and test results

### v2.11.6 - OAuth Redirect Fix (September 2025)
- **HOTFIX**: Added temporary `/auth/oauth-success` redirect handler for Clerk compatibility
- **Fixed**: 404 errors during OAuth login flow that broke user authentication
- **Added**: Compatibility layer until Clerk OAuth URLs can be updated in dashboard
- **Updated**: Middleware to allow OAuth callback route as public

### v2.11.5 - Auth Path Cleanup (September 2025)
- **BREAKING**: Removed deprecated `/auth/*` paths - production uses external domain
- **Fixed**: Dashboard route conflicts that caused build errors
- **Removed**: Conflicting `app/(dashboard)/dashboard/page.tsx`
- **Updated**: Hardcoded auth links from `/auth` to `/sign-in`
- **Improved**: Middleware routing logic for role-based redirects
- **Performance**: Optimized landing page with lazy loading and image optimization
- **Build**: Resolved "Cannot find module for page: /dashboard" error

## MCP Gateway Integration

### Available MCP Services
The project includes a comprehensive MCP (Model Context Protocol) gateway with the following services:

#### 1. Filesystem Service (`/mcp/filesystem`)
- **Tools**: `read_text_file`, `write_file`, `edit_file`, `list_directory`, `search_files`, `get_file_info`
- **Use Case**: File operations, CSS analysis, code inspection
- **Endpoint**: `http://localhost:8080/mcp/filesystem`

#### 2. Memory Service (`/mcp/memory`)
- **Tools**: `store`, `retrieve`, `delete`, `list`
- **Use Case**: Data caching, session management
- **Endpoint**: `http://localhost:8080/mcp/memory`

#### 3. Supabase Service (`/mcp/supabase`)
- **Tools**: `query`, `insert`, `update`, `delete`, `get_schema`
- **Use Case**: Database operations, user management
- **Endpoint**: `http://localhost:8080/mcp/supabase`

#### 4. ReactBits Service (`/mcp/reactbits`)
- **Tools**: `analyze_component`, `generate_component`, `optimize_component`
- **Use Case**: React component analysis and optimization
- **Endpoint**: `http://localhost:8080/mcp/reactbits`

#### 5. Puppeteer Service (`/mcp/puppeteer`)
- **Tools**: `navigate`, `screenshot`, `extract_data`, `click_element`, `fill_form`
- **Use Case**: Browser automation, web scraping, testing
- **Endpoint**: `http://localhost:8080/mcp/puppeteer`

#### 6. Context7 Service (`/mcp/context7`)
- **Tools**: `search_docs`, `get_context`, `summarize`
- **Use Case**: Documentation search, knowledge retrieval
- **Endpoint**: `http://localhost:8080/mcp/context7`

### MCP Gateway Setup
```bash
# Start MCP Gateway and all services
docker-compose -f docker-compose.mcp.yml up -d

# Start all services
curl -X POST http://localhost:8080/services/start-all

# Check gateway health
curl -s http://localhost:8080/health
```

### MCP Usage Examples
```bash
# Read file using filesystem service
curl -X POST http://localhost:8080/mcp/filesystem \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "read_text_file",
      "arguments": {"path": "app/globals.css"}
    }
  }'

# Query database using Supabase service
curl -X POST http://localhost:8080/mcp/supabase \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "query",
      "arguments": {"sql": "SELECT COUNT(*) FROM user_profiles"}
    }
  }'
```

## Environment Variables & Deployment

### Required Environment Variables for Vercel
```bash
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here

# Supabase Database (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Site Configuration (Required)
NEXT_PUBLIC_SITE_URL=https://your-production-domain.example.com
JWT_SECRET=your_jwt_secret_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Optional API Keys
COINGECKO_API_KEY=your_coingecko_api_key_here
ALLOWED_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### Vercel Deployment Configuration
- **Environment Variables**: Must be configured in Vercel dashboard (Settings → Environment Variables)
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Node.js Version**: 18.x or higher
- **Framework**: Next.js

### Production URLs
- **Sign In**: `https://account.zignals.org/sign-in`
- **Sign Up**: `https://account.zignals.org/sign-up`
- **Development**: Local `/sign-in` and `/sign-up` routes via Clerk

## Development Tools & Scripts

### Available NPM Scripts
```bash
npm run dev              # Start development server with Turbopack
npm run dev:qa           # Start QA development server on port 3002
npm run build            # Build production bundle
npm run start            # Start production server
npm run lint             # Run ESLint
npm run clean            # Clean build cache and node_modules
npm run fresh            # Clean, install, and start dev server
npm run check-env        # Check environment variables
npm run validate-env     # Validate environment variables for deployment
npm run generate-secrets # Generate JWT secrets
npm run setup-clerk      # Setup Clerk authentication
npm run setup-db         # Setup database tables
npm run test:clerk       # Test Clerk integration
npm run test:supabase    # Test Supabase connection
npm run test:all         # Run all tests
```

### MCP Gateway Scripts
```bash
# Start MCP Gateway
docker-compose -f docker-compose.mcp.yml up -d

# Start specific service
curl -X POST http://localhost:8080/services/filesystem/start

# Check service status
curl -s http://localhost:8080/health | jq '.services'

# Stop all services
curl -X POST http://localhost:8080/services/stop-all
```

## Troubleshooting

### Common Issues

#### 1. Vercel Deployment Failures
- **Issue**: `Module not found: Can't resolve '@vercel/mcp-adapter'`
- **Solution**: Ensure environment variables are configured in Vercel dashboard
- **Check**: Run `npm run validate-env` locally before deployment

#### 2. User Profile Errors
- **Issue**: "User profile not found in Supabase for Clerk ID"
- **Solution**: Profiles are now auto-created when missing
- **Check**: Verify Supabase connection and RLS policies

#### 3. MCP Gateway Issues
- **Issue**: Services not starting
- **Solution**: Check Docker containers and restart gateway
- **Check**: `docker logs zignal-login-mcp-gateway-1`

#### 4. CSS Build Errors
- **Issue**: CSS parsing errors with square brackets
- **Solution**: Ensure proper Tailwind CSS syntax
- **Check**: Run `npm run build` to verify CSS compilation

### Debug Commands
```bash
# Check environment variables
npm run validate-env

# Test database connection
npm run test:supabase

# Test Clerk integration
npm run test:clerk

# Check MCP gateway health
curl -s http://localhost:8080/health

# View build logs
npm run build 2>&1 | grep -i error
```

## Documentation Files

### Key Documentation
- **CLAUDE.md**: This file - comprehensive development guide
- **VERCEL_DEPLOYMENT_FIX.md**: Vercel deployment troubleshooting guide
- **KILO_CODE_MCP_PROMPT.md**: MCP gateway integration for Kilo Code
- **KILO_CODE_QUICK_START.md**: Quick start guide for MCP tools
- **README.md**: Project overview and setup instructions
- **CHANGELOG.md**: Detailed version history and changes

### MCP Documentation
- **mcp-config.json**: MCP gateway configuration
- **docker-compose.mcp.yml**: MCP services Docker configuration
- **scripts/validate-env.js**: Environment variable validation script