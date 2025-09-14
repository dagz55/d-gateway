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
- **Framework**: Next.js 15.5.2 with App Router and React 19
- **Database & Auth**: Supabase with Row Level Security
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query + Zustand
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion

### Key Architecture Patterns

#### Route Protection & Middleware
- Middleware handles authentication state and redirects authenticated users from `/` to `/dashboard`
- Protected routes use `(dashboard)` route group with shared layout
- Auth callbacks handled in `/auth/callback/` for OAuth flows

#### Supabase Client Architecture
- **Server Components**: Use `lib/supabase/server.ts` with cookie-based session management
- **Client Components**: Use `lib/supabase/browserClient.ts` 
- **Admin Operations**: Use `lib/supabase/server.ts` with `createAdminClient()`
- All clients are properly typed with `Database` interface from `lib/supabase/types.ts`

#### Component Organization
```
components/
├── dashboard/          # Trading dashboard components (charts, portfolio, signals)
├── layout/            # AppLayout, Header, Sidebar, ProfileDropdown for dashboard pages
├── ui/                # Complete shadcn/ui component library (26 components)
└── settings/          # Profile settings, photo upload, and configuration forms
```

#### Data Fetching Pattern
- Custom hooks in `hooks/api/` using TanStack Query
- Server actions in `lib/actions.ts` for form submissions, file uploads, and mutations
- API routes in `app/api/` for external integrations (crypto prices, news, etc.)
- Profile photo uploads use dual-path system (Supabase Storage + Base64 fallback)

### Routing Structure
- **Landing**: `/` - Original login page (redirects to dashboard if authenticated)
- **Auth**: `/auth/*` - Authentication flows with OAuth support
- **Dashboard**: `/dashboard` - Main trading dashboard with AppLayout
- **Profile**: `/profile` - User profile management
- **Settings**: `/settings` - User preferences and account settings
- **Admin**: `/admin` - Admin panel for system management

### Critical Implementation Details

#### Dashboard Layout Pattern
All dashboard pages use the `(dashboard)` route group which provides:
- Consistent `AppLayout` with Header and Sidebar
- Protected authentication via middleware
- Shared loading and error boundaries

#### Theme System
- Uses `next-themes` with persistence
- Theme context in `contexts/` directory
- Components support both light and dark modes

#### Type Safety
- Complete TypeScript setup with strict mode
- Database types generated from Supabase schema
- Component props properly typed throughout

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