# Frontend Knowledge - Zignal Trading Platform

## Core Frontend Architecture

### Framework & Tech Stack
- **Framework**: Next.js 15.5.3 with App Router and React 19
- **Styling**: Tailwind CSS 4.1.9 with PostCSS plugin + shadcn/ui component library
- **State Management**: TanStack Query + Zustand for global state
- **Authentication**: Clerk with App Router integration
- **Charts & Visualization**: Recharts for trading charts and data visualization
- **Animations**: Framer Motion for smooth interactions and 3D effects
- **Icons**: Lucide React icon library
- **Fonts**: Geist Sans & Mono (next/font optimized)
- **Theme**: next-themes for dark mode support

### Project Structure
```
app/                    # Next.js App Router
├── (dashboard)/       # Protected route group with AppLayout
│   ├── dashboard/     # Main trading dashboard
│   ├── profile/       # User profile management
│   ├── settings/      # User preferences
│   └── wallet/        # Wallet management
├── sign-in/           # Clerk authentication pages
├── sign-up/           # Clerk registration pages
├── admin-setup/       # Admin role assignment
├── market/            # Public crypto market data
├── enterprise/        # Marketing pages
├── help/              # Support pages
├── layout.tsx         # Root layout with providers
└── page.tsx           # Landing page

components/            # React component library
├── ui/               # Complete shadcn/ui library (30+ components)
├── dashboard/        # Trading dashboard components
├── layout/           # AppLayout, Header, Sidebar, ProfileDropdown
├── landing/          # Landing page components with animations
├── wallet/           # Wallet and transaction components
├── settings/         # Profile settings and photo upload
├── admin/            # Admin panel components
├── auth/             # Authentication components
├── charts/           # Trading chart components
├── animations/       # Background animations and effects
└── trading/          # Trading-specific components
```

## Authentication & Routing

### Clerk Integration (CRITICAL)
**Always use these patterns:**
```typescript
// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server'
export default clerkMiddleware()

// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
<ClerkProvider>{children}</ClerkProvider>

// Server components
import { auth } from '@clerk/nextjs/server'
const { userId } = auth()
```

**Never do:**
- Don't use deprecated `authMiddleware()` 
- Don't reference pages router patterns
- Don't import from deprecated Clerk APIs

### Routing Structure
- **Landing**: `/` - Redirects to dashboard if authenticated
- **Auth**: `/sign-in`, `/sign-up` - Clerk authentication with split-panel design
- **Dashboard**: 
  - `/dashboard/admins/*` - Admin panel with system management
  - `/dashboard/members/*` - Member-specific features
  - `/dashboard` - Redirects based on user role
- **Universal**: `/profile`, `/settings`, `/wallet` - Available to all authenticated users
- **Market**: `/market` - Public crypto market data (integrates with dashboard when signed in)
- **Admin Setup**: `/admin-setup` - Role assignment for predefined admin emails

### Protected Routes Pattern
All dashboard pages use `(dashboard)` route group providing:
- Consistent `AppLayout` with Header and Sidebar
- Protected authentication via middleware
- Real-time notification system in header
- Shared loading and error boundaries

## Component Architecture

### Layout Components
- **AppLayout**: Main dashboard wrapper with sidebar and header
- **Header**: Navigation with notifications, search, and profile dropdown
- **Sidebar**: Navigation menu with ProfileSection
- **ProfileDropdown**: User menu in header with quick actions
- **ProfileSection**: Comprehensive sidebar profile with avatar, badges, and actions

### UI Component Library (shadcn/ui)
Complete component library with 30+ components:
- Form components: `Button`, `Input`, `Select`, `Textarea`, `Checkbox`, etc.
- Layout: `Card`, `Sheet`, `Dialog`, `Tabs`, `Accordion`
- Data: `Table`, `Pagination`, `Chart`, `Progress`
- Feedback: `Alert`, `Badge`, `Skeleton`, `Sonner` (toasts)
- Navigation: `Breadcrumb`, `Command`, `Navigation Menu`

### Dashboard Components
- **SignalsList**: Trading signals with copy trading functionality
- **TradingActivityChart**: Portfolio performance visualization
- **CryptoChart**: Live cryptocurrency price charts
- **StatsRow**: Key trading metrics and statistics
- **PortfolioDistributionChart**: Asset allocation visualization
- **NewsFeed**: Real-time cryptocurrency news
- **DepositForm** & **WithdrawForm**: Wallet transaction forms

### Landing Page Components
- **ZignalLanding**: Main landing page with 3D animations
- **EnhancedHeroSection**: Hero with WebGL particle systems
- **FeatureHighlights**: Interactive feature showcase
- **LiveSignalsChart**: Real-time trading signals demo
- **AnimatedBackground**: 3D particle effects and animations
- **PromotionalBanner**: Marketing banner carousel

## Styling Guidelines

### Tailwind CSS Configuration
- **Version**: 4.1.9 with PostCSS plugin
- **Theme**: Custom Zignal brand colors and dark theme
- **Responsive**: Mobile-first approach with proper breakpoints
- **Components**: Use shadcn/ui for consistent styling

### Brand Colors
```css
--primary: #1A7FB3 (Blue)
--secondary: #33E1DA (Teal)
--background: #0A0F1F (Dark blue)
--foreground: #EAF2FF (Light blue)
--accent: #1199FA (Bright blue)
--muted: rgba(255, 255, 255, 0.1)
```

### CSS Best Practices
- Use Tailwind classes consistently
- Leverage CSS variables for theming
- Follow mobile-first responsive design
- Use glass morphism effects: `bg-white/[0.04] backdrop-blur border border-white/10`
- Consistent spacing with Tailwind scale

## Data Fetching & State Management

### TanStack Query Pattern
```typescript
// hooks/api/useSignals.ts
export function useSignals() {
  return useQuery({
    queryKey: ['signals'],
    queryFn: () => fetch('/api/signals').then(res => res.json()),
    refetchInterval: 30000 // 30 second refresh
  })
}
```

### Data Fetching Hooks
Custom hooks in `hooks/api/` for:
- `useCryptoPrices` - Market data with auto-refresh
- `useSignals` - Trading signals
- `useTrades` - User trading history
- `useDeposits` & `useWithdrawals` - Transaction history
- `useDashboardStats` - Portfolio statistics
- `useNews` - Cryptocurrency news feed

### State Management
- **TanStack Query**: Server state, caching, and synchronization
- **Zustand**: Client-side global state (user preferences, UI state)
- **Clerk**: Authentication state management
- **React Context**: Theme management and providers

## Performance Optimization

### Next.js Optimizations
- **Image Optimization**: Use `next/image` with proper sizing
- **Font Optimization**: `next/font` for Geist fonts
- **Code Splitting**: Automatic with App Router
- **Lazy Loading**: Dynamic imports for heavy components
- **Static Generation**: Use `generateStaticParams` where possible

### Component Performance
- **React.memo()**: Memoize expensive components
- **useMemo()** & **useCallback()**: Optimize computations and callbacks
- **Suspense**: Loading boundaries for async components
- **Error Boundaries**: Graceful error handling

### Animation Performance
- **Framer Motion**: Optimized animations with proper cleanup
- **CSS Transforms**: Hardware acceleration for smooth animations
- **useId()**: Prevent ID conflicts in multiple instances
- **Object URL cleanup**: Prevent memory leaks in file uploads

## File Upload System

### Profile Photo Upload
- **API Route**: `/api/upload/avatar` (supports up to 10MB) - **Recommended Approach**
- **Storage**: Supabase Storage + Base64 fallback
- **Validation**: File type, size, format (including HEIC/HEIF)
- **Security**: Authenticated upload/update/delete with RLS policies
- **Cleanup**: Automatic cleanup of old avatar files

### Implementation Pattern (API Route - Recommended)
```typescript
// Client-side upload to dedicated API route
const uploadAvatar = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/api/upload/avatar', {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to upload avatar')
  }
  
  return response.json()
}

// Component usage
<ChangePhotoForm onUpload={uploadAvatar} />
```

### Alternative Implementation (Server Action)
```typescript
// Server Action approach (available but API route is preferred)
import { uploadAvatar } from '@/lib/actions'

const handleUpload = async (formData: FormData) => {
  const result = await uploadAvatar(formData)
  if (!result.success) {
    throw new Error(result.error)
  }
  return result
}

// Usage in forms with action prop
<form action={handleUpload}>
  <input type="file" name="file" />
  <button type="submit">Upload</button>
</form>
```

### Architecture Decision
The project uses **dedicated API routes** (`/api/upload/avatar`) as the primary implementation because:
- **Better Performance**: Handles larger files (up to 10MB) with proper streaming
- **Enhanced Error Handling**: More granular error responses and status codes
- **Flexibility**: Works with any client-side framework or approach
- **Scalability**: Better suited for serverless deployment on Vercel
- **Debugging**: Easier to monitor and debug API endpoints

The Server Action approach remains available for form-based uploads but API routes are recommended for the file upload system.

## Real-time Features

### Notification System
- **Component**: `NotificationDropdown` in header
- **Real-time**: Supabase real-time subscriptions
- **Database**: `notifications` table with RLS policies
- **Features**: Mark as read, categorized icons, unread badges
- **Colors**: High-contrast colors (emerald-400, amber-400, red-400, cyan-400)

### Live Data Updates
- **Market Data**: Auto-refresh every 30 seconds
- **Trading Signals**: Real-time updates via WebSocket
- **Portfolio**: Live balance and P&L updates
- **News Feed**: Real-time cryptocurrency news

## Mobile & Responsive Design

### Breakpoint Strategy
- **Mobile First**: Design for mobile, enhance for desktop
- **Breakpoints**: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- **Touch Targets**: Minimum 44px for touch elements
- **Navigation**: Collapsible sidebar on mobile

### Mobile Components
- **MobileNav**: Slide-out navigation menu
- **TouchOptimized**: Larger buttons and improved spacing
- **SwipeGestures**: Chart interactions and navigation
- **ResponsiveTable**: Horizontal scroll and mobile layouts

## Accessibility

### Implementation Guidelines
- **ARIA Labels**: Descriptive labels for all interactive elements
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper semantic HTML and announcements
- **Color Contrast**: WCAG AA compliance with high contrast text
- **Focus Management**: Visible focus indicators and logical tab order

### Component Accessibility
- Use semantic HTML elements
- Add `aria-label` and `aria-describedby` attributes
- Implement proper focus management
- Provide alternative text for images and charts
- Use proper heading hierarchy

## Common Patterns & Best Practices

### Component Structure
```typescript
import React from 'react'
import { ComponentProps } from '@/types'

interface ComponentNameProps {
  // Props with proper TypeScript typing
}

export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // Component logic with hooks
  
  return (
    <div className="proper-tailwind-classes">
      {/* JSX with accessibility */}
    </div>
  )
}
```

### Error Handling
- Use Error Boundaries for component-level error catching
- Implement graceful degradation for failed API calls
- Provide user-friendly error messages
- Add retry mechanisms for network failures

### Loading States
- Use Skeleton components for loading states
- Implement proper loading indicators
- Show progress for long operations
- Maintain UI consistency during loading

### Form Handling
- Use React Hook Form for complex forms
- Implement proper validation with Zod schemas
- Provide real-time validation feedback
- Handle form submission states

## Development Commands

### Core Development
```bash
npm run dev          # Start development server
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Testing & Validation
```bash
npm run check-env    # Validate environment variables
npm run generate-secrets  # Generate required secrets
```

## Common Issues & Solutions

### Hydration Mismatch
- **Problem**: Server/client rendering differences
- **Solution**: Add `suppressHydrationWarning` and use `useEffect` for client-only code

### Clerk Session Errors
- **Problem**: "Clerk session not found" in console
- **Solution**: Expected for unauthenticated users, ensure `<ClerkProvider>` wraps app

### Animation Performance
- **Problem**: Laggy animations on low-end devices
- **Solution**: Make animation counts configurable, use CSS transforms, proper cleanup

### Bundle Size
- **Problem**: Large bundle sizes
- **Solution**: Use dynamic imports, tree shaking, analyze bundle with `npm run analyze`

### Lockfile Conflicts
- **Problem**: "Multiple lockfiles detected" warning from Next.js
- **Solution**: 
  1. Remove conflicting package-lock.json, keep only bun.lockb for this project
  2. Add `outputFileTracingRoot: path.resolve(process.cwd())` to next.config.mjs
  3. Remove duplicate config files (keep only next.config.mjs)
