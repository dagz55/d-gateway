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
- **Framework**: Next.js 15.5.3 with App Router and React 19
- **Authentication**: Clerk with App Router integration
- **Database**: Supabase with Row Level Security
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query + Zustand
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion

### Key Architecture Patterns

#### Route Protection & Middleware
- Middleware uses `clerkMiddleware()` from `@clerk/nextjs/server` for session management
- Protected routes use `(dashboard)` route group with shared layout
- Clerk handles OAuth flows automatically with `/sign-in` and `/sign-up` routes

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
- **Auth**: `/sign-in/[[...sign-in]]` and `/sign-up/[[...sign-up]]` - Clerk authentication with split-panel design
- **Dashboard**: `/dashboard` - Main trading dashboard with AppLayout
- **Market**: `/market` - Live cryptocurrency market data with professional navigation
- **Wallet**: `/wallet` - Comprehensive wallet management system
- **Profile**: `/profile` - User profile management
- **Settings**: `/settings` - User preferences and account settings
- **Admin**: `/admin` - Admin panel for system management
- **Member**: `/member` - Member-specific dashboard and features

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