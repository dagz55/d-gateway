# Changelog

All notable changes to the Zignal Trading Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2024-12-13

### Added
- Modern password visibility toggle component with smooth animations
- Password strength indicator with real-time feedback
- Animated eye icon transitions (300ms rotation/scale effects)
- Color-coded strength bars (red → orange → yellow → green)
- Password complexity validation (length, mixed case, numbers, special chars)
- Accessible password inputs with ARIA labels and keyboard navigation

### Changed
- Enhanced LoginForm with modern password input component
- Updated SignupForm with password strength indicator
- Improved ChangePasswordForm with visual strength feedback
- Modernized ResetPasswordConfirm with animated password fields
- Better UX with focus state highlighting and hover effects

### UI Improvements
- Smooth icon transitions between Eye/EyeOff states
- Real-time password strength feedback
- Descriptive strength text (Very Weak, Weak, Fair, Good, Strong)
- Consistent 200ms-300ms animation durations
- Fully responsive password inputs

## [2.0.0] - 2024-12-13

### BREAKING CHANGES
- Migrated authentication system from NextAuth to Supabase Auth
- Removed all NextAuth dependencies and configuration
- Changed authentication API endpoints structure
- Updated session management to use Supabase SSR

### Added
- Supabase Auth Provider with React Context (`src/providers/supabase-auth-provider.tsx`)
- Comprehensive auth test page at `/auth-test` for validation
- Compatibility `useSession` hook for easier migration
- Session persistence with SSR cookies
- Detailed Supabase auth implementation report
- Support for Google OAuth (ready for configuration)
- Middleware-based route protection for `/dashboard`, `/settings`, `/profile`

### Changed
- All API routes now use async/await with Supabase client
- Database references updated from `user_profiles` to `profiles` table
- Authentication flow uses Supabase's latest SSR patterns for Next.js 15
- Updated all components to use new auth provider
- Enhanced security with proper cookie-based session management

### Fixed
- Critical async/await bug in `createClient()` calls across all API routes
- TypeScript errors with Supabase client Promise handling
- Database schema misalignment issues
- Build errors related to mixed auth systems
- Session persistence across page refreshes
- Protected route redirects

### Removed
- NextAuth configuration (`src/lib/auth.ts`)
- NextAuth API route (`src/app/api/auth/[...nextauth]/route.ts`)
- NextAuth TypeScript definitions (`src/types/next-auth.d.ts`)
- NextAuth dependencies from package.json

### Security
- Implemented Row Level Security (RLS) ready architecture
- Added CSRF protection via SameSite cookies
- Secured API routes with proper authentication checks
- Protected sensitive operations with middleware

### Known Issues
- Profile updates temporarily return mock data (pending type generation)
- Dashboard RPC functions using demo data (pending database setup)
- Email verification requires SMTP configuration in Supabase

## [1.0.0] - 2024-12-11

### Added
- Initial release of Zignal Trading Platform
- Dashboard with real-time trading statistics
- Trading history and signals management
- Deposit and withdrawal functionality
- Cryptocurrency news feed
- Portfolio distribution charts
- User profile management
- Dark/Light theme support
- Responsive design for mobile and desktop

### Features
- Real-time Bitcoin price chart
- Trading activity visualization
- Profit/Loss tracking
- Copy trading signals
- Account settings management
- Avatar upload functionality

---

For more details on upgrading from v1.0.0 to v2.0.0, see the [Migration Guide](./MIGRATION_GUIDE.md).