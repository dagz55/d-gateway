# AGENT.md

## Project Overview

Zignal is a modern crypto signals platform built with Next.js 15 that turns professional trading signals into clear actions. The application provides a sleek interface with enterprise-grade authentication, real-time trading signals, and comprehensive admin tools.

### Project Structure

```
zignal/
├── app/                    # Next.js app directory (App Router)
│   ├── (dashboard)/       # Protected route group with AppLayout
│   │   ├── dashboard/     # Main trading dashboard
│   │   ├── profile/       # User profile management
│   │   └── wallet/        # Wallet management
│   ├── admin/             # Admin panel with security controls
│   ├── auth/              # Authentication pages (Clerk)
│   ├── api/               # API routes for data and auth
│   │   ├── auth/workos/   # WorkOS authentication endpoints
│   │   └── admin/         # Admin API endpoints
│   ├── enterprise/        # Enterprise landing page
│   ├── globals.css        # Global styles with Tailwind CSS
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Home/login page
├── components/            # Reusable React components
│   ├── ui/               # Complete shadcn/ui library (30+ components)
│   ├── dashboard/        # Trading dashboard components
│   ├── layout/           # AppLayout, Header, Sidebar, ProfileDropdown
│   ├── admin/            # Admin-specific components
│   ├── settings/         # Profile settings and configuration
│   ├── wallet/           # Wallet and transaction components
│   └── WorkOSAuthCard.tsx # WorkOS authentication UI
├── contexts/              # React Context providers
│   ├── WorkOSAuthContext.tsx # Main authentication context
│   └── ThemeContext.tsx   # Theme management context
├── lib/                  # Core utilities and integrations
│   ├── supabase/         # Supabase database clients
│   ├── workos.ts         # WorkOS configuration
│   ├── security/         # Security implementations
│   │   ├── csrf-protection.ts      # CSRF token management
│   │   ├── rate-limiter.ts         # Rate limiting engine
│   │   ├── session-security.ts     # Session management
│   │   ├── token-manager.ts        # JWT token rotation
│   │   ├── security-logger.ts      # Security event logging
│   │   └── threat-detection.ts     # Threat analysis system
│   └── utils.ts          # Utility functions
├── middleware/           # Middleware components
│   ├── csrf.ts           # CSRF middleware
│   └── rate-limiting.ts  # Rate limiting middleware
├── hooks/                # Custom React hooks
│   ├── api/              # Data fetching hooks (TanStack Query)
│   └── useSessionManager.ts # Session management hook
├── public/               # Static assets
├── middleware.ts         # Simplified Edge-compatible middleware
├── next.config.mjs       # Next.js configuration (optimized)
└── package.json          # Dependencies and scripts
```

## Setup Commands

### Prerequisites
- Node.js 18+ 
- npm (recommended) or yarn/pnpm
- Supabase account (for database)
- WorkOS account (for enterprise authentication)

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Environment Configuration

Create a `.env.local` file with the following variables:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Supabase Configuration (Database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# WorkOS Authentication (Primary Auth)
WORKOS_API_KEY=your_workos_api_key
WORKOS_CLIENT_ID=your_workos_client_id
WORKOS_COOKIE_PASSWORD=32_character_random_string_here
WORKOS_REDIRECT_URI=http://localhost:3000/api/auth/workos/callback

# Security Configuration
CSRF_SECRET_KEY=your_csrf_secret_key
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret
SESSION_SECRET=your_session_secret_key
```

## Code Style Guidelines

### TypeScript Configuration
- **Strict Mode**: Enabled in `tsconfig.json`
- **Target**: ES2022
- **Module Resolution**: Node
- **JSX**: React JSX

### Code Conventions
- **Formatting**: Use Prettier (configured in project)
- **Indentation**: 2 spaces
- **Quotes**: Double quotes for strings, single quotes for JSX attributes
- **Semicolons**: Required
- **Trailing Commas**: Yes for multi-line objects/arrays

### Naming Conventions
- **Variables and functions**: `camelCase`
- **Components**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Files**: `kebab-case` for pages, `PascalCase` for components
- **CSS Classes**: `kebab-case` (Tailwind CSS)

### Component Structure
```typescript
// Component imports
import React from 'react'
import { ComponentProps } from '@/types'

// Type definitions
interface ComponentNameProps {
  // Props definition
}

// Component definition
export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // Component logic
  return (
    // JSX
  )
}
```

## Styling Guidelines

### Tailwind CSS
- **Version**: 4.1.9 with PostCSS plugin
- **Configuration**: Custom theme in `tailwind.config.ts`
- **Colors**: Custom color palette for Zignal branding
- **Responsive**: Mobile-first approach
- **Dark Mode**: Class-based dark mode

### Custom CSS
- **Global Styles**: Defined in `app/globals.css`
- **Component Styles**: Use Tailwind classes
- **Custom Properties**: CSS variables for theming
- **Animations**: Use Tailwind's animation utilities

## Testing Instructions

### Test Structure
```bash
# Unit tests (when implemented)
npm run test

# E2E tests (when implemented)
npm run test:e2e

# Type checking
npm run type-check
```

### Testing Guidelines
- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user flows
- **Coverage**: Aim for >80% code coverage

## Authentication Architecture

### Hybrid Authentication System
- **Primary Auth**: WorkOS (Enterprise SSO, OAuth, Magic Links)
- **Database**: Supabase (User data, profiles, application data)
- **Session Management**: JWT tokens with rotation and versioning
- **Security**: CSRF protection, rate limiting, threat detection

### WorkOS Integration
- **Client Context**: `contexts/WorkOSAuthContext.tsx`
- **API Routes**: `/api/auth/workos/*` endpoints
- **Configuration**: `lib/workos.ts`
- **Middleware**: Simplified Edge-compatible authentication checks

### Supabase Database
- **Browser Client**: `lib/supabase/browserClient.ts`
- **Server Client**: `lib/supabase/serverClient.ts`
- **Admin Client**: Server-side with service role key
- **Data Storage**: User profiles, signals, transactions

### Protected Routes
- `/dashboard/*` - Trading dashboard (requires auth)
- `/profile` - User profile management (requires auth)
- `/wallet` - Wallet management (requires auth)
- `/admin/*` - Admin panel (requires auth + admin role)
- `/api/admin/*` - Admin API endpoints (requires admin)

### Authentication Flow
1. User initiates login via WorkOS (OAuth/Magic Link)
2. WorkOS validates and returns user data
3. System creates/updates Supabase profile
4. JWT tokens issued with refresh capability
5. Session tracked with versioning for invalidation
6. Middleware validates tokens on protected routes

## Security Implementation

### Enhanced Security Features
1. **CSRF Protection** (`lib/csrf-protection.ts`)
   - Double-submit cookie pattern
   - Token rotation on each request
   - Origin/Referer validation
   - Excluded paths configuration

2. **Rate Limiting** (`lib/rate-limiter.ts`)
   - Sliding window algorithm
   - IP-based and user-based limits
   - Configurable per endpoint
   - DDoS protection

3. **Session Security** (`lib/session-security.ts`)
   - Session versioning for invalidation
   - Device fingerprinting
   - Concurrent session limits
   - Activity tracking

4. **Token Management** (`lib/token-manager.ts`)
   - JWT with automatic rotation
   - Refresh token implementation
   - Token family tracking
   - Secure storage patterns

5. **Security Monitoring** (`lib/security-logger.ts`)
   - Real-time event logging
   - Threat detection system
   - Anomaly detection
   - Alert notifications

6. **Threat Detection** (`lib/threat-detection.ts`)
   - Pattern-based threat analysis
   - Risk scoring system
   - Automated responses
   - Security analytics

### Security Headers
- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **Referrer-Policy**: strict-origin-when-cross-origin
- **X-XSS-Protection**: 1; mode=block
- **Content-Security-Policy**: Configured with strict policies

## Database Schema (Supabase)

### Core Tables Structure
```sql
-- User profiles (synced with WorkOS)
profiles (
  id UUID PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,      -- WorkOS user ID
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  is_admin BOOLEAN DEFAULT false,
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

-- Security events table
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

-- Session management
user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  refresh_token TEXT UNIQUE,
  device_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

## API Endpoints

### WorkOS Authentication
- `GET /api/auth/workos/login` - Initiate WorkOS login
- `GET /api/auth/workos/callback` - OAuth callback handler
- `POST /api/auth/workos/logout` - User logout
- `GET /api/auth/workos/me` - Get current user
- `POST /api/auth/workos/refresh` - Refresh JWT tokens
- `GET /api/auth/workos/profile` - Get user profile
- `POST /api/auth/workos/supabase-user` - Sync with Supabase

### Trading Signals
- `GET /api/signals` - Get active trading signals
- `POST /api/signals` - Create new signal (admin)
- `PUT /api/signals/:id` - Update signal (admin)
- `DELETE /api/signals/:id` - Delete signal (admin)

### User Trades
- `GET /api/trades` - Get user's trades
- `POST /api/trades` - Create new trade
- `PUT /api/trades/:id` - Update trade
- `DELETE /api/trades/:id` - Close trade

### Admin Endpoints
- `GET /api/admin/users` - List all users
- `GET /api/admin/signals` - Manage signals
- `GET /api/admin/security` - Security dashboard
- `POST /api/admin/security/events` - Log security events

## Deployment Instructions

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Environment Variables (Production)
Set the following in Vercel dashboard:

**Public Variables:**
- `NEXT_PUBLIC_APP_URL` - Production URL
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

**Server Variables:**
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role
- `WORKOS_API_KEY` - WorkOS API key
- `WORKOS_CLIENT_ID` - WorkOS client ID
- `WORKOS_COOKIE_PASSWORD` - 32-char password
- `WORKOS_REDIRECT_URI` - Production callback URL
- `CSRF_SECRET_KEY` - CSRF protection secret
- `JWT_SECRET` - JWT signing key
- `JWT_REFRESH_SECRET` - Refresh token secret
- `SESSION_SECRET` - Session encryption key

### Build Configuration
- **Node.js Version**: 18.x or 20.x
- **Build Command**: `npm run build`
- **Output Directory**: `dist` (configured in next.config.mjs)
- **Install Command**: `npm install`
- **Framework Preset**: Next.js

## Git Workflow

### Branching Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `hotfix/*` - Critical fixes

### Commit Convention
```
[Component] Brief description

- Detailed change 1
- Detailed change 2

Fixes #123
```

### Pull Request Process
1. Create feature branch from `develop`
2. Make changes with tests
3. Run linting and tests
4. Create PR to `develop`
5. Code review and approval
6. Merge to `develop`
7. Deploy to staging
8. Merge `develop` to `main` for production

## Performance Optimization

### Next.js Optimizations
- **Image Optimization**: Use `next/image` component
- **Font Optimization**: Use `next/font` for custom fonts
- **Code Splitting**: Automatic with App Router
- **Static Generation**: Use `generateStaticParams` where possible

### Bundle Analysis
```bash
# Analyze bundle size
npm run analyze
```

### Performance Monitoring
- **Vercel Analytics**: Built-in performance monitoring
- **Core Web Vitals**: Track LCP, FID, CLS
- **Lighthouse**: Regular performance audits

## Troubleshooting

### Common Issues

#### Node.js Module in Edge Runtime
```
Error: Module build failed: Reading from 'node:crypto' is not handled
```
**Solution**: Use simplified middleware without Node.js imports. WorkOS SDK operations should be in API routes only.

#### WorkOS Import Error
```
Error: 'getSession' is not exported from '@workos-inc/authkit-nextjs'
```
**Solution**: Use the correct WorkOS SDK methods. The getSession function may not be available in all versions.

#### Multiple Lockfiles Warning
```
Warning: Multiple lockfiles found
```
**Solution**: Remove extra lockfiles (bun.lockb, yarn.lock) and keep only package-lock.json

#### Webpack Devtool Warning
```
Warning: Changing webpack devtool can cause severe performance regressions
```
**Solution**: Remove custom devtool configuration from next.config.mjs

#### Hydration Mismatch
```
Error: Prop className did not match
```
**Solution**: Add `suppressHydrationWarning` to html element and ensure theme provider is properly configured

#### 401 Authentication Errors
```
GET /api/auth/workos/me 401 Unauthorized
```
**Note**: This is expected behavior for unauthenticated users, not an error

### Debug Commands
```bash
# Check TypeScript types
npm run type-check

# Clear Next.js cache
rm -rf .next dist

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for conflicting dependencies
npm ls @workos-inc/node
npm ls @supabase/supabase-js
```

## Additional Notes

### Logo Assets
- **Icon**: `public/zignal-icon.svg` - Transparent mark for UI components
- **Wordmark**: `public/zignal-logo.svg` - High-quality horizontal logo
- **Favicon**: `public/favicon.ico` - Browser tab icon

### Brand Colors
- **Primary**: `#1A7FB3` (Blue)
- **Secondary**: `#33E1DA` (Teal)
- **Background**: `#0A0F1F` (Dark blue)
- **Text**: `#EAF2FF` (Light blue)

### Core Dependencies
- **Framework**: Next.js 15.5.3
- **React**: 19.0.0
- **Styling**: Tailwind CSS 4.1.9 with PostCSS plugin
- **UI Components**: shadcn/ui (30+ components)
- **Authentication**: WorkOS SDK + Supabase
- **State Management**: Zustand + TanStack Query
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Mono
- **Theme**: next-themes for dark mode

### Security Libraries
- **JWT**: jsonwebtoken for token management
- **Crypto**: Built-in crypto for secure operations
- **Cookie Parser**: For secure cookie handling
- **Rate Limiting**: Custom implementation
- **CSRF**: Custom double-submit pattern

### Development Tools
- **TypeScript**: 5.x with strict mode
- **ESLint**: Code linting with Next.js config
- **Prettier**: Code formatting
- **PostCSS**: CSS processing with Tailwind
- **Vercel**: Deployment platform

### Known Limitations
- **Edge Runtime**: Some security features require API Routes instead of Edge middleware
- **WorkOS SDK**: Must be used server-side only (Node.js runtime)
- **Token Rotation**: Requires client-side implementation for refresh

## Recent Updates

### v2.11.1 (2025-09-20)
- **🧭 Market Page Navigation**: Added professional navigation header to `/market` page
  - Integrated consistent navigation structure matching landing page design
  - Added Logo component with gradient text styling for brand consistency
  - Included navigation links (Home, Market, Features, About) with active states
  - Added authentication buttons (Sign In, Get Started) with proper styling
  - Maintained responsive design and mobile navigation handling
  - Replaced `<a>` tags with Next.js `<Link>` components for proper routing
  - Fixed ESLint warnings and improved code quality standards

### v2.11.0 (2025-09-20)
- **🔧 Code Quality & Performance**: Major bug fixes and optimizations
  - Fixed invalid CSS utility directives and improved styling consistency
  - Enhanced accessibility with proper ARIA attributes on all interactive elements
  - Fixed React hydration mismatches and memory leaks in animation components
  - Improved TypeScript typing and component organization
  - Made animation counts configurable for better performance scaling

---

This AGENT.md file provides comprehensive guidance for AI coding agents working on the Zignal project. Keep it updated as the project evolves.
