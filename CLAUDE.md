# CLAUDE.md

> **Development Guide for Claude Code**
> This file provides comprehensive guidance for AI assistants working with the Zignal Login codebase.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Development Workflow](#development-workflow)
4. [Authentication & Security](#authentication--security)
5. [Database & Data Management](#database--data-management)
6. [Component Guidelines](#component-guidelines)
7. [Deployment & Environment](#deployment--environment)
8. [Troubleshooting](#troubleshooting)
9. [Reference](#reference)

---

## Quick Start

### Essential Commands
```bash
npm run dev          # Start development server
npm run build        # Build production bundle
npm run lint         # Run ESLint + validation
npm run test:all     # Run all tests
```

### Required Environment Variables
```bash
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Architecture Overview

### Technology Stack
| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 15.5.4 + React 19.1.1 | App Router, SSR/SSG |
| **Authentication** | Clerk | OAuth, session management |
| **Database** | Supabase | PostgreSQL with RLS |
| **Styling** | Tailwind CSS + shadcn/ui | Design system |
| **State** | TanStack Query + Zustand | Data fetching + global state |
| **Visualization** | Recharts | Trading charts |
| **Animation** | Framer Motion | UI transitions |
| **Integration** | MCP Gateway | 6 external services |
| **Build** | Turbopack | Fast development builds |

### Application Structure

#### Directory Organization
```
app/
├── (dashboard)/           # Protected dashboard routes
│   ├── dashboard/         # Role-based dashboards
│   ├── market/           # Market data pages
│   ├── wallet/           # Wallet management
│   └── settings/         # User settings
├── sign-in/              # Authentication pages
├── sign-up/
└── api/                  # API routes

components/
├── dashboard/            # Trading components
├── layout/              # Layout components
├── ui/                  # shadcn/ui library (26 components)
├── wallet/              # Wallet components
├── settings/            # Settings forms
├── landing/             # Landing page
└── auth/                # Auth components

lib/
├── supabase/            # Database clients
├── actions.ts           # Server actions
└── types.ts             # TypeScript types
```

#### Key Patterns

**Route Protection**
- Uses `clerkMiddleware()` for session management
- `(dashboard)` route group for protected pages
- Role-based redirects: admin → `/dashboard/admins`, member → `/dashboard/members`

**Database Access**
- Server components: `lib/supabase/server.ts`
- Client components: `lib/supabase/browserClient.ts`
- Admin operations: `createAdminClient()`

**Data Fetching**
- TanStack Query hooks in `hooks/api/`
- Server actions in `lib/actions.ts`
- API routes for external services

---

## Development Workflow

### Adding New Features

1. **Component Creation**
   ```bash
   # Create in appropriate directory
   components/dashboard/    # Trading features
   components/ui/          # Reusable UI components
   components/wallet/      # Wallet features
   ```

2. **Data Integration**
   ```bash
   hooks/api/             # TanStack Query hooks
   app/api/              # External API routes
   lib/actions.ts        # Server actions
   ```

3. **Route Creation**
   ```bash
   app/(dashboard)/      # Protected pages
   app/                  # Public pages
   ```

### Testing & Validation

**Required Checks**
```bash
npm run build         # Production build test
npm run lint          # Code quality
npm run test:all      # All tests
```

**Manual Testing**
- ✅ Light/dark themes
- ✅ Mobile responsiveness
- ✅ Authentication flows
- ✅ Role-based access

---

## Authentication & Security

### Clerk Integration

**✅ ALWAYS USE**
```typescript
import { clerkMiddleware } from '@clerk/nextjs/server'  // ✅ Current
import { auth } from '@clerk/nextjs/server'             // ✅ App Router
```

**❌ NEVER USE**
```typescript
import { authMiddleware } from '@clerk/nextjs/server'   // ❌ Deprecated
import { currentUser } from '@clerk/nextjs'            // ❌ Pages Router
```

### Route Structure

| Route | Environment | Purpose |
|-------|-------------|---------|
| `/sign-in` | Development | Local auth |
| `/sign-up` | Development | Local registration |
| `https://account.zignals.org/*` | Production | External auth domain |
| `/dashboard/admins/*` | Both | Admin panel |
| `/dashboard/members/*` | Both | Member dashboard |

---

## Database & Data Management

### Supabase Configuration

**Client Usage by Context**
```typescript
// Server Components
import { createServerClient } from 'lib/supabase/server'

// Client Components
import { createBrowserClient } from 'lib/supabase/browserClient'

// Admin Operations
import { createAdminClient } from 'lib/supabase/server'
```

### Key Features

**Notification System**
- Real-time Supabase subscriptions
- Bell icon with unread badge in header
- Categories: trade, success, warning, error, system
- Testing: `/test-notifications` + `/api/test-notifications`

**Wallet Management**
- Dual-wallet system (Trading + Income)
- Deposit/withdrawal flows with validation
- Transaction history with filtering
- Portfolio integration

---

## Component Guidelines

### UI Standards

**Theme Support**
- `next-themes` with persistence
- All components support light/dark modes
- CSS variables in `app/globals.css`

**Component Structure**
```typescript
// Always include proper TypeScript typing
interface ComponentProps {
  // Define all props
}

export function Component({ ...props }: ComponentProps) {
  // Implementation
}
```

**Styling Approach**
- Tailwind CSS with existing patterns
- shadcn/ui components from `components/ui/`
- Responsive design with mobile-first approach

---

## Deployment & Environment

### Production Configuration

**Vercel Environment Variables**
```bash
# Required
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
JWT_SECRET=your_jwt_secret

# Optional
COINGECKO_API_KEY=your_api_key
ALLOWED_ADMIN_EMAILS=admin@zignals.org,dagz55@gmail.com
```

### MCP Gateway Integration

**Available Services**
1. **Filesystem** (`/mcp/filesystem`) - File operations, CSS analysis
2. **Memory** (`/mcp/memory`) - Data caching, session management
3. **Supabase** (`/mcp/supabase`) - Database operations
4. **ReactBits** (`/mcp/reactbits`) - Component analysis
5. **Puppeteer** (`/mcp/puppeteer`) - Browser automation
6. **Context7** (`/mcp/context7`) - Documentation search

**Quick Setup**
```bash
# Start all MCP services
docker-compose -f docker-compose.mcp.yml up -d
curl -X POST http://localhost:8080/services/start-all

# Health check
curl -s http://localhost:8080/health
```

---

## Troubleshooting

### Common Issues

**Build Failures**
```bash
# Vercel deployment errors
npm run validate-env     # Check environment variables
npm run build           # Test local build

# Module resolution issues
npm run clean           # Clear cache
npm install             # Reinstall dependencies
```

**Authentication Problems**
```bash
npm run test:clerk      # Test Clerk integration
# Check middleware configuration
# Verify environment variables
```

**Database Issues**
```bash
npm run test:supabase   # Test database connection
# Check RLS policies
# Verify service role key
```

**MCP Gateway Issues**
```bash
docker logs zignal-login-mcp-gateway-1  # Check logs
curl -s http://localhost:8080/health     # Health check
docker-compose -f docker-compose.mcp.yml restart  # Restart
```

---

## Reference

### Current Version
**v2.11.14** - Vercel Deployment & User Profile Integration (January 2025)

### Key Scripts
| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Code quality check |
| `npm run test:all` | Run all tests |
| `npm run validate-env` | Check environment setup |

### Important Files
| File | Purpose |
|------|---------|
| `middleware.ts` | Route protection |
| `lib/supabase/server.ts` | Server-side DB client |
| `lib/supabase/browserClient.ts` | Client-side DB client |
| `lib/actions.ts` | Server actions |
| `app/globals.css` | Theme CSS variables |

### External Documentation
- [Clerk App Router Docs](https://clerk.dev/docs/nextjs)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/with-nextjs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TanStack Query Docs](https://tanstack.com/query)

---

*Last updated: January 2025 (v2.11.14)*

> For detailed version history, see `CHANGELOG.md`
> For additional documentation, see `README.md` and `/docs` directory