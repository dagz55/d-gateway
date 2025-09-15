# Changelog

All notable changes to the Zignal Trading Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.4.3] - 2025-01-15

### UI/UX Improvements and Validation Enhancements

#### **🎨 UI/UX Fixes**
- **HTML Entity Cleanup**: Fixed HTML entities (`&quot;`) in PrivacyModal and TermsModal components, replaced with proper double-quote characters
- **Better Error Messages**: Improved ChangePhotoForm validation with separate user authentication and file selection error messages
- **Enhanced Button States**: Fixed Upload button disabled state to properly check for both user authentication and file selection

#### **🛡️ File Upload Security & Validation**
- **HEIC/HEIF Support**: Added support for HEIC and HEIF image formats in file upload validation
- **Single Source of Truth**: Created centralized file extension management in validation.ts to prevent duplication
- **MIME Type Security**: Fixed MIME type validation to prevent spoofed files from bypassing security checks
- **Improved Accept Attribute**: Fixed file input accept attribute to properly handle multiple file types without duplicates

#### **🔧 Component Reliability**
- **Mount State Management**: Fixed isMountedRef initialization in DepositComponent to accurately reflect component mount state
- **Memory Leak Prevention**: Added proper mount guards to prevent state updates after component unmount
- **Error Recovery**: Enhanced error handling in file upload operations with better user feedback

#### **📝 Code Quality**
- **TypeScript Improvements**: Enhanced type safety across file upload and validation components
- **Linting Compliance**: All modified files pass linting checks without errors
- **Performance Optimization**: Improved memory management and reduced potential memory leaks

## [2.4.2] - 2025-01-15

### Bug Fixes and Performance Improvements

#### **🐛 Memory Management Fixes**
- **Memory Leak Prevention**: Fixed memory leaks in ChangePhotoForm.tsx by properly revoking object URLs before clearing state
- **Blob URL Management**: Added proper cleanup of blob URLs to prevent memory accumulation during file preview operations

#### **🔧 Validation Improvements**
- **Accurate Error Messages**: Fixed file size validation to use Math.floor instead of Math.round for precise error messaging
- **File Size Limits**: Ensured error messages accurately reflect the actual file size limits (5MB)

#### **⚡ TypeScript Compilation Fixes**
- **Server Client Error**: Resolved TypeScript compilation error in serverClient.ts with cookies().getAll() method
- **Build Stability**: Fixed build failures and improved overall compilation stability

#### **📝 Code Quality**
- **Linting**: All files now pass linting checks without errors
- **Type Safety**: Improved TypeScript type safety across the application
- **Performance**: Enhanced memory management and reduced potential memory leaks

## [2.4.1] - 2025-01-15

### Critical Fix: REQUEST_HEADER_TOO_LARGE Error Resolution

#### **🚨 Critical Bug Fix**
- **REQUEST_HEADER_TOO_LARGE Error**: Fixed Error Code 494 that was causing application crashes on Vercel
- **OAuth State Issues**: Resolved invalid OAuth state errors that were accumulating in headers
- **Cookie Size Management**: Implemented automatic filtering of large cookies (>4KB) to prevent header overflow
- **Session Cleanup**: Added automatic session cleanup when headers become too large

#### **🔧 Technical Improvements**
- **Header Size Monitoring**: Added middleware checks for header size (30KB threshold with 2KB buffer)
- **Cookie Filtering**: Automatic filtering of oversized cookies in both middleware and Supabase client
- **Secure Cookie Configuration**: Enhanced cookie security with proper flags and expiration
- **Error Recovery Flow**: Implemented `/auth/clean-session` route for graceful error recovery

#### **🛡️ Security Enhancements**
- **Cookie Security**: Added httpOnly, secure, and sameSite flags to all cookies
- **Path Restrictions**: Limited cookies to appropriate paths
- **Expiration Management**: Set reasonable 7-day default expiration for session cookies
- **Header Validation**: Added comprehensive header size validation

#### **📊 Monitoring & Logging**
- **Warning System**: Added console warnings for oversized cookies and headers
- **Error Tracking**: Enhanced logging for OAuth state errors and header overflow
- **Recovery Metrics**: Track session cleanup and recovery operations

#### **🔄 Error Recovery**
- **Automatic Detection**: Middleware automatically detects large headers and redirects to cleanup
- **Complete Session Reset**: Clean session route clears all cookies, localStorage, and sessionStorage
- **Graceful Fallback**: Users are automatically redirected to home page after cleanup
- **OAuth Error Handling**: Specific handling for OAuth state errors with automatic recovery

## [2.4.0] - 2025-01-15

### Wallet System Implementation

#### **🏦 New Wallet System**
- **Complete Wallet Page**: Dedicated `/wallet` route with tabbed interface for all wallet operations
- **Deposit Management**: Comprehensive deposit system with amount, reference number, and screenshot verification
- **Deposit History**: Full transaction history with date/time, amount, MOP type, and wallet details
- **Withdrawal System**: Portfolio value display with complete withdrawal forms including bank/ewallet details
- **Withdrawal History**: Detailed withdrawal tracking with date/time, amount, MOP type, and wallet details

#### **💰 Dual Wallet Architecture**
- **Trading Wallet**: Separate wallet for trading operations with independent balance tracking
- **Income Wallet**: Dedicated wallet for profit withdrawals and income management
- **Balance Overview**: Real-time portfolio value display with separate wallet balances
- **Transfer Management**: Seamless wallet-to-wallet operations

#### **🔍 Advanced Features**
- **Multiple Payment Methods**: Support for Bank Transfer, Credit Card, PayPal, Cryptocurrency, and E-Wallet
- **Screenshot Verification**: Upload and preview system for deposit verification screenshots
- **Advanced Filtering**: Filter transactions by status, payment method, wallet type, and date ranges
- **Search Functionality**: Search transactions by reference number, transaction ID, or notes
- **Transaction Receipts**: Download receipts for all deposit and withdrawal transactions

#### **🎨 UI/UX Enhancements**
- **Tabbed Interface**: Organized wallet operations with Deposit, Deposit History, Withdraw, and Withdrawal History tabs
- **Interactive Forms**: Real-time form validation with balance checking and amount verification
- **Status Indicators**: Color-coded status badges for completed, pending, processing, and failed transactions
- **Responsive Design**: Mobile-first approach with full responsiveness across all wallet components

#### **📊 Analytics & Reporting**
- **Transaction Statistics**: Total deposits, withdrawals, pending amounts, and transaction counts
- **Performance Tracking**: Win rates, success rates, and transaction volume analytics
- **Real-time Updates**: Live balance updates and transaction status monitoring

#### **🔧 Technical Implementation**
- **Component Architecture**: Modular wallet components with reusable form elements and data tables
- **TypeScript Integration**: Full type safety with comprehensive interfaces for wallet operations
- **State Management**: Client-side state management for forms, filters, and transaction data
- **File Upload System**: Secure screenshot upload with preview functionality
- **Mock Data Integration**: Comprehensive mock data for development and demonstration

#### **📋 Navigation Updates**
- **Sidebar Consolidation**: Consolidated individual wallet items into single "Wallet" navigation entry
- **Route Optimization**: Dedicated wallet route with clean URL structure
- **Navigation Flow**: Seamless navigation between dashboard and wallet operations

## [2.3.0] - 2025-01-15

### ZIG TRADES Workflow Implementation

#### **🎯 New Features**
- **ZIG TRADES Workflow**: Complete trading workflow system integrated into main dashboard
- **Trading Signals Component**: Multiple signal offers (ZIGNALS OFFER 1, 2, 3) with different profit rates and durations
- **Copy Trading Functionality**: One-click copy trading with real-time execution and visual feedback
- **Trading History Component**: Comprehensive history tracking with date, time, amount, and profit/loss details
- **Active Trading Component**: Real-time active trade management with progress tracking and profit monitoring

#### **📊 Enhanced Analytics**
- **Performance Metrics**: Win rate calculation, total profit tracking, and trade statistics
- **Advanced Filtering**: Filter trades by status (completed, pending, failed) and action type (BUY, SELL)
- **Real-time Updates**: Live profit/loss tracking for active trades
- **Progress Tracking**: Visual progress bars for trade duration and completion status

#### **🎨 UI/UX Improvements**
- **Tabbed Interface**: Organized workflow with Trading Signals, Trading History, and Active Trading tabs
- **Interactive Components**: Expandable trade details with action buttons (Close Trade, Modify)
- **Visual Indicators**: Color-coded profit/loss indicators and status badges
- **Responsive Design**: Mobile-first approach with full responsiveness across all screen sizes

#### **🔧 Technical Implementation**
- **Component Architecture**: Modular design with separate components for each workflow section
- **TypeScript Integration**: Full type safety with comprehensive interfaces for trading data
- **State Management**: Client-side state management for filters, selections, and interactions
- **Mock Data**: Comprehensive mock data for demonstration and development

#### **📋 Dashboard Integration**
- **Full Width Layout**: ZIG TRADES workflow prominently displayed on main dashboard
- **Seamless Integration**: Maintains existing dashboard functionality while adding new workflow
- **Performance Optimized**: Efficient rendering with proper component lifecycle management

## [2.2.1] - 2025-01-14

### Google OAuth Cleanup & Optimization

#### **🔧 Technical Improvements**
- **Simplified OAuth Implementation**: Removed custom redirect paths to let Supabase handle OAuth callbacks internally
- **Environment Configuration**: Added `NEXT_PUBLIC_SITE_URL` for proper OAuth redirect handling
- **Code Cleanup**: Removed unnecessary custom `redirectTo` parameters from Google OAuth calls
- **Documentation Cleanup**: Removed conflicting OAuth documentation files and consolidated into single source of truth
- **Callback Route Optimization**: Simplified auth callback route to handle only email confirmations and password resets

#### **✅ Testing & Validation**
- **OAuth Flow Testing**: Comprehensive testing of Google OAuth URL generation and redirect flow
- **Configuration Validation**: Verified Supabase integration and Google OAuth configuration
- **Environment Variables**: Confirmed all required environment variables are properly set
- **Redirect URI Validation**: Verified correct Supabase callback URL format

#### **📋 Configuration Updates**
- **Google Cloud Console**: Updated redirect URIs to use base URLs only for localhost development
- **Supabase Dashboard**: Configured proper site URL and redirect URLs
- **Environment Variables**: Added `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

#### **🎯 Results**
- ✅ **OAuth Flow**: Seamless Google OAuth sign-in without redirect URI mismatch errors
- ✅ **Port Robustness**: OAuth works on any development port (3000, 3001, 3002, etc.)
- ✅ **Code Simplicity**: Cleaner, more maintainable OAuth implementation
- ✅ **Documentation**: Single, accurate source of truth for OAuth configuration

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