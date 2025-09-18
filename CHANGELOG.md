# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.9.0] - 2025-01-27

### Fixed
- **Photo Upload System**: Completely resolved photo upload and removal functionality
  - Fixed Next.js 1MB body size limit error by increasing limit to 10MB
  - Replaced Server Actions with dedicated API routes for better file handling
  - Fixed Supabase storage bucket mismatch (`avatars` → `public_image`)
  - Resolved useEffect dependency array warnings in photo components
  - Added proper error handling and fallback mechanisms
- **Settings Page Integration**: Fixed profile settings not saving
  - Updated ChangePhotoForm to use WorkOS authentication context
  - Connected settings page to real profile data instead of mock data
  - Fixed avatar URL display from multiple data sources (profile, user)
- **Database Schema Issues**: Resolved multiple database constraint errors
  - Fixed RLS policy violations and infinite recursion issues
  - Resolved foreign key constraint conflicts during column type changes
  - Added proper admin user setup and permissions
  - Fixed username uniqueness and NOT NULL constraint violations

### Enhanced
- **Photo Upload Performance**: Improved file upload handling
  - Created dedicated `/api/upload/avatar` API route for better performance
  - Added support for larger files (up to 10MB) with proper streaming
  - Implemented automatic cleanup of old avatar files
  - Added comprehensive file validation (type, size, format)
  - Enhanced error messages and user feedback
- **Storage Integration**: Robust Supabase storage configuration
  - Proper `public_image` bucket setup with correct policies
  - Fallback to base64 storage when Supabase storage unavailable
  - Secure file access with authenticated upload/update/delete
  - Public read access for avatar images
- **Authentication System**: Strengthened WorkOS integration
  - Fixed admin detection and permissions system
  - Added proper environment variable configuration
  - Enhanced security logging for all avatar operations

### Added
- **API Routes**: New dedicated endpoints for file operations
  - `POST /api/upload/avatar` - Handle photo uploads with validation
  - `DELETE /api/upload/avatar` - Handle photo removal with cleanup
  - Proper authentication checks and error handling
  - Security event logging for all operations
- **Storage Policies**: Comprehensive Supabase storage security
  - Fine-grained RLS policies for authenticated operations
  - File type validation at the database level
  - Proper bucket configuration with size and MIME type limits

## [2.8.2] - 2025-01-27

### Fixed
- **WorkOS Authentication Flow**: Resolved critical authentication issues
  - Fixed 401 Unauthorized error by updating AuthContext to use correct WorkOS endpoint
  - Added fallback authentication flow for backward compatibility
  - Implemented proper WorkOS authentication endpoint routing
- **Hydration Mismatch**: Fixed React hydration errors in background animations
  - Moved Math.random() calls to useEffect to avoid server/client mismatch
  - Added client-side initialization for FloatingParticle and ParticleField components
  - Eliminated hydration warnings in floating particle animations

### Enhanced
- **WorkOS Authentication UI**: Complete visual redesign with modern enterprise-grade styling
  - Added sophisticated animations using Framer Motion
  - Implemented gradient backgrounds with animated elements
  - Enhanced button interactions with hover and tap animations
  - Improved visual hierarchy with better spacing and typography
  - Added professional loading states with animated indicators
  - Created modern form inputs with focus states and micro-interactions
  - Enhanced features section with interactive hover effects
  - Updated footer with animated links and better accessibility
- **User Experience**: Significantly improved authentication interface
  - Added staggered animations for smooth component entrance
  - Implemented professional color scheme matching enterprise standards
  - Enhanced accessibility with better contrast and focus indicators
  - Added visual feedback for all interactive elements

### Added
- **WorkOS Domain Configuration**: Complete WorkOS domain setup implementation
  - Implemented proper domain configuration based on WorkOS admin panel settings
  - Added comprehensive WorkOS authentication service with domain support
  - Created WorkOS configuration documentation and environment templates
  - Added health checks and service validation for WorkOS integration
- **Enhanced Authentication Service**: New WorkOS authentication service architecture
  - Comprehensive domain configuration support (email, admin portal, auth API, AuthKit)
  - State validation and security features for OAuth flow
  - Proper error handling and logging integration
  - Health check endpoints for service monitoring

### Fixed
- **WorkOS Authentication Errors**: Resolved critical authentication configuration issues
  - Fixed import errors in WorkOS callback route
  - Added environment variable validation and debugging tools
  - Created environment configuration checker script (`npm run check-env`)
  - Provided comprehensive environment template for easy setup
- **Next.js Configuration**: Fixed workspace root detection warning
  - Updated outputFileTracingRoot to use path.resolve for better cross-platform compatibility
  - Resolved "multiple lockfiles detected" warning

### Technical Improvements
- **Authentication Architecture**: Improved authentication flow reliability
  - Enhanced error handling in AuthContext to properly handle 401 responses
  - Fixed 401 "Unauthorized" errors being treated as system errors instead of normal unauthenticated state
  - Added proper fallback mechanisms for authentication methods
  - Improved session management and user profile fetching
  - Integrated security logging for authentication events
- **Development Tools**: Enhanced developer experience
  - Added environment variable validation script
  - Created comprehensive environment template
  - Improved error debugging and configuration validation
- **WorkOS Integration**: Complete overhaul of WorkOS authentication system
  - Updated API endpoints to use new WorkOS authentication service
  - Proper domain configuration and environment-specific settings
  - Enhanced security with state validation and CSRF protection
  - Improved error categorization and user-friendly error messages
- **Animation Performance**: Optimized background animations for better performance
  - Fixed hydration issues that could cause layout shifts
  - Improved animation consistency across different devices
  - Reduced unnecessary re-renders in particle components

## [2.8.1] - 2025-01-27

### Added
- **Serverless Configuration**: Complete serverless deployment configuration and environment setup
  - Added AUTH_SERVICE_MODE, EDGE_COMPATIBLE, SERVERLESS_FUNCTIONS_URL, and AUTH_MICROSERVICE_URL environment variables
  - Updated .env.local template with Vercel deployment URLs and configuration
  - Added comprehensive serverless API endpoint documentation
  - Configured edge-compatible runtime for optimal performance

### Enhanced
- **Environment Management**: Improved environment variable organization
  - Added Vercel project and team identification variables
  - Separated production and development configurations
  - Enhanced security with proper environment variable isolation
- **Documentation**: Updated README.md with serverless deployment information
  - Added complete serverless API endpoint documentation
  - Included deployment information and project details
  - Added environment configuration examples
- **Git Management**: Enhanced .gitignore for better security and deployment
  - Added comprehensive environment file exclusions
  - Included serverless function and deployment artifact exclusions
  - Added IDE, OS, and temporary file exclusions

### Fixed
- **Next.js Workspace Warning**: Resolved lockfile detection conflicts
  - Fixed `outputFileTracingRoot` configuration in next.config.ts
  - Removed conflicting package-lock.json (project uses bun.lockb)
  - Added path import for cross-platform compatibility
  - Eliminated "multiple lockfiles detected" warning

### Technical Improvements
- **Deployment Architecture**: Configured for Vercel serverless functions
  - Edge Runtime compatibility for ultra-fast performance
  - Auto-scaling serverless functions
  - Global CDN distribution
- **Security**: Enhanced environment variable security
  - Protected sensitive configuration files
  - Improved deployment artifact security
- **Performance**: Optimized for serverless execution
  - Edge-compatible functions for reduced latency
  - Efficient memory and execution time optimization
- **Build Configuration**: Improved Next.js configuration
  - Fixed workspace root detection for proper file tracing
  - Resolved lockfile conflicts for cleaner builds

### Files Modified
- `.gitignore` - Enhanced with comprehensive exclusions for security and deployment
- `package.json` - Version bumped to 2.8.1
- `README.md` - Added serverless deployment documentation and API endpoints
- `CHANGELOG.md` - Added version 2.8.1 release notes
- `next.config.ts` - Fixed outputFileTracingRoot and added path import

### Files Removed
- `package-lock.json` - Removed conflicting lockfile (project uses bun.lockb)

### Deployment Information
- **Production URL**: https://zignals.org
- **Vercel Project ID**: prj_r2FP75z7nZCQ5GYTvkCFhNBPW8QR
- **Team**: TriGo (team_AhO7EohVDcoArC9gHpRNylja)
- **Latest Deployment**: dpl_HzbTid353NV6njkKGi2eWX1h8X7C
- **Status**: ✅ READY (Serverless Functions)
- **Region**: IAD1 (US East)

## [2.8.0] - 2025-01-27

### Added
- **Enhanced Landing Page**: Completely redesigned landing page separated from login functionality
  - Created dedicated landing page with professional navigation header and footer
  - Integrated 3D particle animations using React Three Fiber and WebGL shaders
  - Added custom shader materials for dynamic particle effects and noise patterns
  - Implemented mouse-responsive floating elements and gradient overlays

- **Advanced Hero Section**: Professional hero section with cutting-edge animations
  - WebGL particle systems with custom vertex and fragment shaders
  - Real-time animated grids with pulsing signal lines
  - Interactive background effects responding to mouse movement
  - Live cryptocurrency price tickers with animated updates
  - Feature cards with hover animations and gradient effects
  - Promotional banner carousel with smooth transitions

- **Background Animation System**: Comprehensive animation framework
  - Floating particle fields with customizable colors and behaviors
  - Animated grid patterns with pulse effects
  - Wave animations with gradient fills
  - Glowing orbs with scale and opacity animations
  - Matrix rain effect for subtle background texture
  - Combined animation system for layered effects

- **Enhanced Components**: Professional landing page sections
  - Security section with numbered feature list and animations
  - Mission and Vision cards with interactive hover effects
  - Enhanced typography with gradient text effects
  - Smooth scroll animations triggered by viewport intersection

### Technical Improvements
- **3D Graphics**: Added React Three Fiber for WebGL rendering
- **Animation Library**: Integrated Framer Motion for smooth animations
- **Performance**: Optimized particle systems with proper cleanup and device pixel ratio scaling
- **Responsive Design**: Enhanced mobile-first responsive design for all new components
- **TypeScript**: Full type safety for all new components and shader materials

### Dependencies
- Added `framer-motion` for advanced animations
- Added `@react-three/fiber` and `@react-three/drei` for 3D graphics
- Added `three` for WebGL rendering and shader materials

## [2.7.2] - 2025-01-27

### Fixed
- **Theme Management Issues**: Resolved hardcoded dark theme conflicts
  - Removed hardcoded `className="dark"` from root HTML element in app/layout.tsx
  - Fixed ThemeProvider configuration to properly control theme switching
  - Ensured ThemeProvider wraps app root with `attribute="class"` and `defaultTheme="light"`
  - Theme switching now works correctly without conflicts

- **WorkOS Authentication Security**: Enhanced password generation and username handling
  - Replaced `randomUUID()` with cryptographically secure password generator using `crypto.randomBytes`
  - Improved password complexity with upper/lower case, digits, and symbols (24 characters)
  - Enhanced username generation with better collision handling and validation
  - Replaced domain-based username suffixes with numeric zero-padded suffixes for clarity
  - Improved username fallback with timestamp + random component to reduce collision probability
  - Added comprehensive email validation to handle empty local parts safely
  - Replaced PostgREST-specific error checks with database-agnostic uniqueness validation
  - Added supabaseClient parameter validation to prevent runtime errors
  - Increased max attempts for username generation and improved error handling

### Technical Improvements
- **Security**: Enhanced cryptographic password generation for SSO accounts
- **Error Handling**: Improved database-agnostic error detection for uniqueness constraints
- **Validation**: Added comprehensive parameter validation and fallback mechanisms
- **Username Generation**: More predictable and collision-resistant username creation
- **Code Quality**: Better error handling and logging without exposing sensitive data

### Files Modified
- `app/layout.tsx` - Removed hardcoded dark theme className
- `app/api/auth/workos/callback/route.ts` - Enhanced security and username generation
- `CHANGELOG.md` - Added version 2.7.2 release notes

## [2.7.1] - 2025-09-16

### Fixed
- **Dashboard Readability Issues**: Resolved severe contrast and readability problems
  - Fixed CSS variable format conflicts between globals.css and enterprise.css
  - Converted CSS variables from hex/rgba to HSL format for proper Tailwind integration
  - Removed conflicting enterprise.css import that was overriding theme colors
  - Forced light mode by default to prevent dark theme readability issues
  - Improved glass morphism effects with higher opacity for better contrast
  - Enhanced dashboard background gradient for better text visibility
  - Restored proper foreground/background color contrast ratios

### Technical Improvements
- **CSS Architecture**: Fixed Tailwind CSS variable compatibility
  - All CSS variables now use HSL format (e.g., `220 39% 11%` instead of `#0a0f1f`)
  - Removed enterprise.css conflicts that were causing theme override issues
  - Improved glass utility classes for better card visibility
- **Theme Management**: Enforced consistent light theme application
  - Added `className="light"` to HTML element to prevent dark mode issues
  - Enhanced color contrast for accessibility compliance
  - Optimized dashboard background gradients for readability

### Files Modified
- `app/globals.css` - Fixed CSS variable formats and glass effects
- `app/layout.tsx` - Removed conflicting enterprise.css import and enforced light theme
- `CHANGELOG.md` - Added version 2.7.1 release notes

## [2.7.0] - 2025-09-16

### Added
- **Interactive Landing Page Slideshow**: Dynamic slideshow system for the landing page left pane
  - Auto-advancing slideshow with 8-second intervals between slides
  - Manual navigation controls with previous/next buttons and slide indicators
  - 6 comprehensive slides covering platform features:
    - Slide 1: Cryptocurrency trading made simple with risk-free trading promotion
    - Slide 2: Flexible package pricing based on duration
    - Slide 3: Expert guidance and advisor support
    - Slide 4: Comprehensive site security measures (5-point security overview)
    - Slide 5: Company mission statement
    - Slide 6: Company vision statement
  - Responsive design with mobile-first approach
  - Smooth transitions and animations between slides
  - Auto-play pause/resume functionality
  - Different styling themes for different slide types (promo, security, mission, vision)
  - Accessibility features with proper ARIA labels and keyboard navigation
- **HeroSlideshow Component**: New reusable slideshow component with TypeScript support
  - Configurable slide content with different display types
  - Glass-morphism design with backdrop blur effects
  - Gradient backgrounds matching the platform's design language
  - Loading states and smooth transitions
  - Touch-friendly controls for mobile devices

### Enhanced
- **HeroSection Component**: Updated to integrate the new slideshow system
  - Retained animated background canvas with grid and signal lines
  - Improved background opacity for better slideshow visibility
  - Maintained responsive design and gradient overlays
- **Landing Page Experience**: Significantly improved user engagement
  - Professional presentation of platform features and security
  - Clear value proposition communication
  - Enhanced visual appeal with modern UI components

### Fixed
- **Text Readability Issues**: Resolved white background sections that made text unreadable
  - Fixed Mission section card backgrounds from white to dark with proper text contrast
  - Updated CTA section card backgrounds for better readability
  - Changed all text colors from dark to light (`text-[#EAF2FF]`) in affected sections
  - Improved border and accent colors for better visual hierarchy
  - Enhanced trust indicators and stats sections with proper color contrast
- **Theme System Cleanup**: Completely removed light/dark mode theme switching system
  - Removed ThemeProvider and next-themes dependency
  - Deleted theme-provider.tsx and ThemeContext.tsx components
  - Cleaned up globals.css to use single dark theme configuration
  - Updated all Card, Button, and Badge components to use Zignal's consistent dark theme
  - Fixed all remaining gray color references to use proper Zignal colors
  - Removed all `dark:` class modifiers and neutral color references
  - Established consistent color palette throughout the application

### Technical Improvements
- **Component Architecture**: Clean separation of concerns between background animation and content
- **TypeScript Support**: Full type safety for slide configurations and component props
- **Performance**: Optimized rendering and memory usage for smooth animations
- **Responsive Design**: Mobile-first approach with proper breakpoints
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Color Contrast**: Improved accessibility with proper text-to-background contrast ratios

### Files Added
- `components/HeroSlideshow.tsx` - New slideshow component with comprehensive slide management

### Files Modified
- `components/HeroSection.tsx` - Updated to integrate slideshow functionality
- `components/landing/FunctionalLanding.tsx` - Fixed text readability issues in Mission and CTA sections
- `app/globals.css` - Cleaned up theme system, removed light/dark mode switching
- `app/providers.tsx` - Removed ThemeProvider dependency
- `components/enterprise/Card.tsx` - Updated to use consistent Zignal dark theme colors
- `components/enterprise/Button.tsx` - Updated button variants with Zignal color palette
- `components/enterprise/Badge.tsx` - Updated badge variants with consistent dark theme
- `components/ui/button.tsx` - Removed dark mode classes and neutral colors
- `components/ui/animated-stats.tsx` - Fixed trend colors and progress bar backgrounds
- `components/layout/ProfileDropdown.tsx` - Updated gray color references to Zignal colors
- `components/layout/ProfileSection.tsx` - Fixed status indicator colors
- `components/WorkOSAuthCard.tsx` - Updated all gray text colors to proper contrast colors
- `app/page.tsx` - Fixed navigation button colors and right panel background
- `package.json` - Removed next-themes dependency, version bumped to 2.7.0
- `README.md` - Updated with new landing page features
- `CHANGELOG.md` - Added version 2.7.0 release notes

### Files Deleted
- `components/theme-provider.tsx` - Removed theme provider component
- `contexts/ThemeContext.tsx` - Removed theme context

## [2.6.0] - 2025-09-15

### Added
- **WorkOS AuthKit + Supabase Integration**: Enterprise-grade authentication with database integration
  - WorkOS AuthKit as Supabase third-party auth provider
  - WorkOS access tokens authenticate with Supabase APIs
  - Encrypted session management with automatic refresh
  - Enterprise SSO capabilities (SAML, OIDC, Google Workspace, Microsoft 365)
  - SOC 2 Type II compliance for financial services
  - Advanced audit trails and session controls
  - Professional authentication UI components
  - JWT template configuration for Supabase RLS policies
- **WorkOS Configuration**: Complete setup and configuration system
  - Environment variable validation and setup
  - API endpoints for login, callback, logout, and user management
  - Authentication middleware for protected routes
  - WorkOS context provider for React components
- **Testing & Validation**: Comprehensive testing suite
  - WorkOS authentication test script
  - Environment variable validation
  - API endpoint testing
  - Configuration validation
- **Documentation**: Complete setup and usage documentation
  - WORKOS_SETUP.md with detailed configuration instructions
  - Updated README.md with WorkOS authentication features
  - Architecture documentation for hybrid auth/database setup

### Changed
- **Authentication System**: Migrated to WorkOS AuthKit + Supabase integration
  - WorkOS handles authentication, Supabase provides database
  - Updated middleware to use WorkOS session validation
  - WorkOS access tokens authenticate with Supabase APIs
  - Maintained Supabase for trading data and real-time features
  - RLS policies work with WorkOS JWT tokens
- **UI Components**: Updated authentication interface
  - WorkOSAuthCard component with enterprise branding
  - Professional authentication flow and user experience
  - Enhanced security messaging and compliance indicators

### Technical Details
- **Architecture**: WorkOS + Supabase third-party auth integration
  - WorkOS handles all user authentication and session management
  - Supabase provides database with RLS policies using WorkOS tokens
  - WorkOS access tokens authenticate with Supabase APIs
  - Clean separation of concerns between auth and data layers
- **Security**: Enhanced security measures
  - Encrypted session cookies with 32-character passwords
  - Automatic session refresh and validation
  - Enterprise-grade security infrastructure
  - Professional audit trails and compliance reporting
  - JWT template configuration for Supabase RLS compatibility

## [2.5.0] - 2025-09-15

### Added
- **ProfileSection Component**: Comprehensive sidebar profile component with enhanced user experience
  - Avatar display with fallback initials and proper loading states
  - User information display (name, email, online/offline status)
  - Admin badge with crown icon for administrator accounts
  - Quick action buttons for common tasks:
    - Edit Profile - Navigate to profile editing page
    - Account Settings - Access account preferences
    - Notifications - Manage notification preferences
    - Security - Security and privacy settings
    - Billing - Subscription and billing management
    - Help & Support - Customer support access
    - Admin Panel - Administrative functions (admin users only)
    - Sign Out - Secure logout with loading states
- **Loading States**: Skeleton animations during data fetching for smooth UX
- **Error Handling**: Graceful error displays with retry mechanisms and user feedback
- **Accessibility Features**: Full ARIA support and screen reader compatibility
  - Descriptive labels for all interactive elements
  - Proper focus management and keyboard navigation
  - Screen reader announcements for status changes
  - High contrast design with readable text sizes
- **Responsive Design**: Mobile-first approach that adapts to all screen sizes
  - Touch-friendly button sizes on mobile devices
  - Proper spacing and layout optimization
  - Smooth transitions and animations
- **Real-time Updates**: Online/offline status detection and display
- **Interactive Demo**: Comprehensive demo page at `/demo/profile-section`
  - Showcases all component states (normal, admin, loading, error)
  - Desktop and mobile view previews
  - Feature overview and documentation

### Enhanced
- **Sidebar Component**: Integrated new ProfileSection replacing previous implementation
- **User Experience**: Improved profile management with centralized quick actions
- **Documentation**: Added comprehensive component and user documentation
- **README.md**: Updated with ProfileSection features and capabilities

### Technical Improvements
- **Type Safety**: Full TypeScript implementation with strict typing
- **Performance**: Optimized memory usage and proper cleanup
- **Code Quality**: Clean, maintainable code following best practices
- **Testing**: Comprehensive build and lint testing passed

### Documentation
- Added detailed component documentation in `docs/components/ProfileSection.md`
- Created comprehensive user guide in `docs/user-guides/profile-section-guide.md`
- Updated README.md with ProfileSection features
- Added interactive demo showcasing all component states

### Files Added
- `components/layout/ProfileSection.tsx` - Main ProfileSection component
- `app/demo/profile-section/page.tsx` - Interactive demonstration page
- `docs/components/ProfileSection.md` - Technical component documentation
- `docs/user-guides/profile-section-guide.md` - User guide and troubleshooting

### Files Modified
- `components/layout/Sidebar.tsx` - Integrated ProfileSection component
- `README.md` - Updated with new features and documentation
- `package.json` - Version bumped to 2.5.0

### Version Information
- **Version**: 2.5.0 (Minor release - new features, backward compatible)
- **Commit**: fbdf022 - feat: implement comprehensive ProfileSection component
- **Tag**: v2.5.0
- **Date**: September 15, 2025

### Migration Guide
No breaking changes in this release. The ProfileSection automatically replaces the previous sidebar profile implementation while maintaining all existing functionality.

To use the new interactive demo:
```bash
# Navigate to the demo page
http://localhost:3001/demo/profile-section
```

### Browser Compatibility
- Chrome/Chromium 88+
- Firefox 85+
- Safari 14+
- Edge 88+

### Performance Metrics
- Build: ✅ Successful compilation
- Bundle Size: Optimized and reasonable
- Type Checking: ✅ All types validated
- Linting: ✅ Clean code standards

---

## Previous Versions

### [2.4.3] - Previous Release
- Previous version features and improvements
- ...