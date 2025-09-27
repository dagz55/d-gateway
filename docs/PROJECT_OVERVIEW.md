# Zignal Login Project Overview

## 📋 Project Summary

**Zignal Login** is a comprehensive authentication and dashboard platform built with Next.js 15, featuring role-based access control, PayPal payment integration, and real-time trading capabilities.

### Key Information
- **Technology Stack**: Next.js 15.5.4 + React 19.1.1
- **Authentication**: Clerk with OAuth
- **Database**: Supabase (PostgreSQL with RLS)
- **Styling**: Tailwind CSS + shadcn/ui
- **Version**: v2.11.18
- **Repository**: `/Users/robertsuarez/zignals/zignal-login`

## 🏗️ Architecture Overview

### Frontend Stack
| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | Next.js 15.5.4 | App Router, SSR/SSG |
| **UI Library** | React 19.1.1 | Component-based UI |
| **Authentication** | Clerk | OAuth, session management |
| **Database** | Supabase | PostgreSQL with RLS |
| **Styling** | Tailwind CSS + shadcn/ui | Design system |
| **State Management** | TanStack Query + Zustand | Data fetching + global state |
| **Charts** | Recharts | Trading visualization |
| **Animation** | Framer Motion | UI transitions |
| **Build Tool** | Turbopack | Fast development builds |

### Core Features
- ✅ **Role-based Authentication** (Admin/Member dashboards)
- ✅ **PayPal Payment Integration** (Complete API suite)
- ✅ **Real-time Notifications** (Supabase subscriptions)
- ✅ **Wallet Management** (Dual-wallet system)
- ✅ **Trading Dashboard** (Market data & charts)
- ✅ **Responsive Design** (Mobile-first approach)
- ✅ **Theme Support** (Light/dark modes)

## 📁 Directory Structure

```
zignal-login/
├── app/                          # Next.js App Router
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── dashboard/           # Role-based dashboards
│   │   ├── market/             # Market data pages
│   │   ├── wallet/             # Wallet management
│   │   └── settings/           # User settings
│   ├── api/                    # API routes
│   │   └── payments/paypal/    # PayPal integration
│   ├── sign-in/               # Authentication pages
│   └── sign-up/
├── components/                 # React components
│   ├── dashboard/             # Trading components
│   ├── layout/               # Layout components
│   ├── ui/                   # shadcn/ui library (26 components)
│   ├── wallet/               # Wallet components
│   ├── settings/             # Settings forms
│   ├── landing/              # Landing page
│   └── auth/                 # Auth components
├── lib/                      # Utilities and configurations
│   ├── supabase/            # Database clients
│   ├── actions.ts           # Server actions
│   └── types.ts             # TypeScript types
├── docs/                     # Project documentation
└── middleware.ts             # Route protection
```

## 🔑 Key Components

### Authentication System
- **Provider**: Clerk with OAuth
- **Route Protection**: Middleware-based
- **Role Management**: Admin/Member roles
- **Session Management**: Persistent across refreshes

### PayPal Integration
- **API Endpoints**: Complete CRUD operations
- **Webhook Support**: Real-time payment updates
- **Status Tracking**: Pending/Completed/Failed states
- **Admin Dashboard**: Payment management interface

### Database Architecture
- **Provider**: Supabase (PostgreSQL)
- **Security**: Row Level Security (RLS)
- **Real-time**: Subscription-based updates
- **Client Types**: Server, Browser, and Admin clients

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Clerk account
- PayPal developer account (optional)

### Essential Commands
```bash
npm run dev          # Start development server
npm run build        # Build production bundle
npm run lint         # Run ESLint + validation
npm run test:all     # Run all tests
```

### Environment Variables
```bash
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📈 Recent Updates (January 2025)

### PayPal Integration Fixes
- ✅ Fixed middleware authentication issues
- ✅ Implemented admin client for database operations
- ✅ Resolved React hydration errors in admin dashboard
- ✅ Updated all PayPal API routes to use proper authentication

### Technical Improvements
- ✅ Enhanced error handling in API routes
- ✅ Improved database client selection
- ✅ Updated middleware configuration
- ✅ Streamlined authentication flow

## 🔗 Documentation Index

1. **[Technical Architecture](./TECHNICAL_ARCHITECTURE.md)** - Detailed system architecture
2. **[API Reference](./API_REFERENCE.md)** - Complete API documentation
3. **[PayPal Integration](./PAYPAL_INTEGRATION.md)** - Payment system details
4. **[Authentication System](./AUTHENTICATION.md)** - Auth implementation guide
5. **[Development Workflow](./DEVELOPMENT_WORKFLOW.md)** - Development guidelines
6. **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment steps

## 📞 Support & Maintenance

### Current Status
- **Development**: Active
- **PayPal Integration**: ✅ Fully Operational
- **Authentication**: ✅ Working
- **Database**: ✅ Connected
- **Deployment**: Ready for production

### Known Issues
- None currently reported

### Performance Metrics
- **Build Time**: ~2-3 seconds (Turbopack)
- **Bundle Size**: Optimized for production
- **Core Web Vitals**: Meeting standards

---
*Last updated: January 2025 (v2.11.18)*
*Documentation maintained by: Claude Code Assistant*