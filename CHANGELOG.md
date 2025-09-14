# Changelog

All notable changes to the Zignal Trading Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2025-01-13

### Profile Management & User Experience Enhancement

#### **🆕 New Features**
- **Complete Profile Photo Upload System**: Full-featured photo upload with dual-path reliability
  - Supabase Storage integration with automatic bucket creation
  - Base64 fallback for maximum reliability
  - 5MB file size limit with support for JPG, PNG, GIF, WebP
  - Real-time preview and avatar updates
  - Automatic cleanup of old photos
- **Enhanced Profile Dropdown**: Interactive user menu in dashboard header
  - Current avatar display with fallback to user initials
  - Active subscription status indicator
  - Real-time online/offline status detection
  - Quick access to profile settings and logout
- **Comprehensive Profile Page**: Complete user profile management interface
  - Account information display
  - Profile photo upload section
  - Username and password change forms
  - Organized sections with proper navigation

#### **🔧 Technical Improvements**
- **Robust Error Handling**: Comprehensive error management for upload operations
- **Client-Server Architecture**: Proper separation of browser and server-side operations
- **Fallback Systems**: Multiple upload paths ensure reliability
- **Real-time Updates**: Avatar changes immediately reflect across the application
- **Security Enhancements**: Server-side validation and secure file handling

#### **🐛 Bug Fixes**
- **Module Resolution**: Fixed webpack chunk errors causing dashboard loading issues
- **FileReader Server Errors**: Moved browser API usage to client-side only
- **Storage Bucket Issues**: Added automatic bucket creation and error handling
- **Build Cache**: Resolved Next.js build cache corruption issues

#### **📱 User Interface**
- **Responsive Design**: All new components work seamlessly on mobile and desktop
- **Theme Integration**: Profile components follow existing dark/light theme system
- **Loading States**: Proper loading indicators during upload operations
- **Toast Notifications**: Clear success/error feedback for all operations

#### **🔒 Security & Performance**
- **File Validation**: Comprehensive client and server-side file validation
- **Size Optimization**: Smart handling of large files with multiple storage options
- **Clean Architecture**: Separation of concerns between upload methods
- **Error Recovery**: Graceful degradation when storage services are unavailable

## [3.0.0] - 2024-12-13

### MAJOR INTEGRATION RELEASE
- **Complete Dashboard Integration**: Successfully merged comprehensive trading dashboard with original authentication system
- **Repository Integration**: Merged into https://github.com/dagz55/zignal-login.git with integrate-dashboard branch
- **Next.js 15.5.2**: Upgraded to latest Next.js with React 19 support
- **Production Ready**: Full build success with optimized bundle and code splitting

### Added
- **Complete Trading Dashboard**: Full-featured trading interface with real-time charts
- **Advanced Analytics**: Portfolio distribution, profit/loss tracking, and performance metrics
- **Signal Management**: Professional trading signals with copy trading capabilities
- **Financial Operations**: Deposit and withdrawal management with history tracking
- **News Integration**: Real-time cryptocurrency news feed
- **Modern UI Components**: Complete shadcn/ui component library (26 components)
- **Theme System**: Dark/light mode with persistence and smooth transitions
- **State Management**: TanStack Query for data fetching and Zustand for state
- **API Infrastructure**: Complete trading API routes for all operations
- **Database Ready**: Supabase migrations included for production deployment
- **Responsive Design**: Mobile-first approach with full responsiveness

### Architecture
- **Protected Route Groups**: Clean separation with `(dashboard)` route group
- **Middleware Protection**: Secure authentication flow with automatic redirects
- **Component Organization**: Well-structured components with dashboard, layout, and UI separation
- **Type Safety**: Complete TypeScript definitions and type safety
- **Performance**: Optimized bundle with proper code splitting and lazy loading

### Technical Improvements
- **Next.js 15.5.2**: Latest framework with App Router and React 19
- **Supabase Integration**: Complete authentication and database setup
- **Build Optimization**: Fixed TypeScript errors and Tailwind configuration
- **Dependency Management**: Updated all dependencies to latest compatible versions

### Routing Structure
- **Landing Page**: `/` - Original login/landing (preserved)
- **Authentication**: `/auth/*` - Login system with OAuth (preserved)
- **Dashboard**: `/dashboard` - Main trading dashboard
- **Profile**: `/profile` - User profile management
- **Settings**: `/settings` - User preferences
- **Admin**: `/admin` - Admin panel (preserved)

### Breaking Changes
- **Supabase Migration**: Complete migration from NextAuth to Supabase Auth
- **Route Structure**: New protected route group structure
- **Component Architecture**: New component organization and structure

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