# Zignal - Advanced Trading Signals & Analytics Platform

Zignal is a comprehensive crypto trading platform built with [Next.js 15.5.3](https://nextjs.org) that transforms professional trading signals into actionable insights. This application provides a complete trading ecosystem with advanced analytics, real-time data, and modern user experience.

## 🚀 Features

### Latest Improvements (v2.11.13)

- 🔌 **MCP Gateway Integration**: Implemented comprehensive MCP (Model Context Protocol) gateway
  - Created centralized MCP gateway with Docker containerization
  - Added Clerk OAuth token authentication for MCP requests
  - Implemented metadata validation and response enhancement
  - Added environment variable override functionality in containers
  - Created comprehensive test suite for MCP gateway functionality
  - Added NextJS API integration at `/api/mcp/nextjs`
  - Implemented service discovery and health monitoring
  - Added support for multiple MCP services (filesystem, supabase, memory, puppeteer, context7, reactbits)
  - Created Docker Compose configurations for testing and production
  - Added comprehensive documentation and test results

### Previous Improvements (v2.11.12)

- 📱 **Mobile Layout Overlapping Fixed**: Resolved mobile sidebar overlapping main content
  - Sidebar now always visible on mobile in compact mode (64px wide)
  - Main content properly indented with 64px left margin to prevent overlap
  - Removed mobile overlay and menu button complexity
  - Simplified mobile navigation - sidebar icons always accessible
  - Improved mobile responsive grid layouts for admin components
  - Enhanced mobile user experience with consistent sidebar access

- 🎨 **Admin Panel Mobile Responsiveness Enhanced**: Improved mobile layout for admin components
  - Admin stats cards now stack properly on mobile (1 column → 2 columns → 4 columns)
  - Member stats grid improved for mobile devices
  - Quick actions layout optimized for mobile screens
  - Better mobile spacing and padding throughout admin interface

### Previous Improvements (v2.11.11)
- 🔧 **Clerk Deprecated Props Fixed**: Updated deprecated Clerk authentication props
  - Replaced `afterSignInUrl` with `fallbackRedirectUrl` in SignIn component
  - Replaced `afterSignUpUrl` with `fallbackRedirectUrl` in SignUp component
  - Updated ClerkProvider configuration to use modern redirect URL props
  - Eliminated console warnings about deprecated Clerk props
  - Improved compatibility with latest Clerk v5 API

- 🚫 **Organization Creation 403 Error Fixed**: Disabled Clerk organization features
  - Added `allowOrganizationCreation={false}` to ClerkProvider
  - Added `allowOrganizationInvitation={false}` to ClerkProvider
  - Prevented automatic organization creation attempts during sign-in
  - Eliminated 403 Forbidden errors when users try to create organizations
  - Simplified authentication flow by removing unnecessary organization prompts

- ⚡ **Resource Preloading Optimization**: Fixed preload resource warnings
  - Removed unused image preloads from layout.tsx
  - Optimized preload strategy to only load critical resources
  - Added proper error handling for background image preloading
  - Eliminated browser warnings about unused preloaded resources
  - Improved page load performance by reducing unnecessary preloads

- 📚 **Production Deployment Guide**: Added comprehensive Clerk production setup
  - Created `CLERK_PRODUCTION_SETUP.md` with step-by-step production configuration
  - Added guidance for switching from development to production Clerk keys
  - Documented organization settings and security configurations
  - Provided troubleshooting guide for common production issues
  - Updated environment template with production key examples

- 🔧 **Build Errors Fixed**: Resolved React Client Component issues

  - Added `'use client'` directive to signin/signup pages
  - Fixed `useState` usage in server components
  - Removed duplicate redirect code causing build conflicts
  - Ensured proper client-side rendering for interactive components
  - Build now compiles successfully without errors

- 🐍 **Script Enhancement**: Converted bash script to Python
  - Created `push_to_github.py` equivalent of `push_to_github.sh`
  - Fixed repository URL to point to correct `zignal-login.git`
  - Enhanced error handling and code structure with type hints
  - Improved deployment automation with Python implementation

### Recent Improvements (v2.11.9)
- 📊 **Advanced Mini Charts**: Completely redesigned cryptocurrency cards with sophisticated trading charts
- 🎯 **Interactive Data Points**: Hover over charts to see precise date, time, and value information
- 📈 **Real-time Time Series**: 24-hour realistic data with proper timestamps for all crypto cards
- ✨ **Visual Grid System**: Both horizontal and vertical grid lines for better data visualization
- 🌟 **Professional Tooltips**: Detailed hover information showing crypto name, price, date, and time
- ⚡ **Performance Optimized**: Smooth hover interactions with proper event handling
- 🚀 **Live Signal Workspace**: Enhanced main trading chart with live Bitcoin data from CoinGecko API
- 📊 **Interactive Trading Chart**: Grid lines, tooltips, and live data for the Pro momentum strategy chart
- 🔄 **Real-time Data Integration**: Replaced mock data with live cryptocurrency price data
- ⚡ **Performance Optimized**: Fixed loading issues and removed static mock values
- 📈 **Live P&L Calculation**: Real-time profit/loss and volatility risk calculations
- 🎨 **Advanced Technical Analysis**: RSI, MACD, support/resistance levels, and volatility indicators
- 📊 **Volume Analysis**: Volume bars and comprehensive market data visualization
- 🎭 **Smooth Animations**: Framer Motion powered animations for professional user experience

### Previous Improvements (v2.11.8)
- 🎯 **Logo-Based Loading System**: Animated loading spinner featuring rotating Zignal logo with signal effects
- 🚀 **Smooth Page Transitions**: Integrated loading states for all navigation with contextual messages
- ✨ **Global Loading Management**: Complete loading infrastructure with overlay and state management
- 🌟 **Enhanced User Experience**: Loading animations during logo clicks and sidebar navigation
- ⚡ **Performance Optimized**: Proper loading state cleanup and smooth transitions

### Previous Improvements (v2.11.7)
- 🎨 **Enhanced Logo Component**: Official Zignal logo with advanced signal effect animations
- ✨ **Interactive Animations**: Smooth hover zoom (150% scale) and click fade animations
- 🌟 **Signal Effects**: Continuous pulsing rings with Zignal brand colors (#33E1DA, #0577DA, #1199FA)
- 🔗 **Homepage Integration**: All logos now properly link to homepage with enhanced user experience
- ♿ **Accessibility**: Added `prefers-reduced-motion` support for inclusive design
- ⚡ **Performance**: Optimized animations with proper cleanup and memory management

### Previous Improvements (v2.11.6)
- 🔧 **Authentication Flow Fixed**: Resolved critical sign-in page redirect issues by removing deprecated Clerk environment variables
- 🎨 **Custom Authentication Pages**: Beautiful split-layout sign-in and sign-up pages with Zignals wallpaper and animated logo
- 🚀 **Stable User Experience**: Eliminated automatic redirects and page bouncing issues
- ⚡ **Performance**: Fixed CORS issues with CoinGecko API using server-side proxy
- 🎯 **Professional Branding**: Added animated Zignals logo with glow effects and hover animations

### Previous Improvements (v2.11.2)
- 🗃️ **Database Enhancement**: Added `clerk_user_id` column to user_profiles for seamless photo upload management
- 🔧 **Clerk Integration**: Complete TypeScript utilities for Clerk-Supabase user profile synchronization
- 📚 **Documentation**: Comprehensive migration guide and usage examples for photo upload functionality
- 🔒 **Security**: Enhanced RLS policies and helper functions for secure user data management

### Previous Improvements (v2.11.0-2.11.1)
- 🔧 **Code Quality & Performance**: Fixed critical issues including hydration mismatches, memory leaks, and accessibility improvements
- 🎯 **Enhanced Landing Header**: Professional conversion-focused messaging with trust indicators and improved CTAs
- 🏎️ **Performance Optimizations**: Configurable animation counts for better performance on low-end devices
- ♿ **Accessibility**: Added proper ARIA labels and semantic markup to all interactive elements
- 🔒 **Type Safety**: Improved TypeScript definitions with proper Lucide icon typing
- 🎨 **UI Polish**: Fixed button behaviors and prevented unintended form submissions

### Core Platform
- 🔐 **Enterprise Authentication**: Clerk authentication with role-based access control
- 🎬 **Enhanced Landing Page**: Fully separated landing page with 3D particle animations, shader effects, floating elements, and interactive background animations
- 🌟 **Advanced Hero Section**: Professional hero section with WebGL particle systems, animated grids, wave animations, and mouse-responsive floating orbs
- 📊 **Role-Based Dashboards**: Separate dashboards for members (`/member/dashboard`) and administrators (`/admin/dashboard`)
- 🔑 **Smart Routing**: Automatic routing based on user roles - admins to admin panel, members to member dashboard
- 👤 **Profile Routes**: Universal profile access at `/profile` for all authenticated users with role-based content
- 📈 **Live Market Data**: Real-time cryptocurrency market tracking with CoinGecko API integration
- 📊 **Signal Management**: Professional trading signals with copy trading capabilities
- 🎯 **ZIG TRADES Workflow**: Comprehensive trading workflow with signals, history, and active trading management
- 💰 **Portfolio Management**: Track profits, losses, and portfolio distribution
- 🏦 **Wallet System**: Complete wallet management with deposits, withdrawals, and transaction history
- 📰 **News Integration**: Real-time cryptocurrency news feed
- 📊 **Market Analytics**:
  - Live cryptocurrency prices from CoinGecko API
  - Real-time market statistics (total market cap, 24h volume, gainers/losers)
  - Interactive favorites system for tracking preferred coins
  - 7-day price sparkline charts for trend visualization
  - Advanced sorting and filtering capabilities
  - Auto-refresh every 30 seconds with manual refresh option
- 👤 **Profile Management**: Complete user profile system with photo uploads and settings
- 🎨 **Profile Dropdown**: Interactive user menu with subscription status and quick access
- 🏷️ **Enhanced Profile Section**: Comprehensive sidebar profile component with avatar, user info, admin badges, and quick actions

### Technical Features
- 🎨 **Modern UI**: Built with Tailwind CSS and complete shadcn/ui component library with consistent Zignal dark theme
- 🎬 **Advanced Animations**: Framer Motion animations, 3D WebGL particle systems, shader materials, and interactive background effects
- 🌟 **3D Graphics**: React Three Fiber integration with custom shader materials, floating particles, and real-time rendering
- 🎭 **Interactive Elements**: Mouse-responsive animations, animated grids, wave effects, and glowing orbs
- 🌙 **Consistent Dark Theme**: Fixed dark theme implementation without light/dark mode switching
- 👤 **Enhanced Profile System**: Modern user profile dropdown with comprehensive account management
- 🏷️ **ProfileSection Component**: Comprehensive sidebar profile component with loading states, error handling, and accessibility
- 🧠 **Memory Management**: Optimized memory usage with proper object URL cleanup
- ✅ **Type Safety**: Full TypeScript implementation with strict type checking
- 📱 **Responsive Design**: Mobile-first approach with full responsiveness
- ⚡ **Performance**: Optimized with Next.js 15.5.2 and React 19
- 🔒 **Security**: Clerk authentication for enterprise-grade security + Supabase for trading data
- 🏗️ **Architecture**: Clean separation with protected route groups
- 📸 **Advanced File Upload**: Robust photo upload system with multiple improvements
  - Dedicated API routes for better performance and larger file support (up to 10MB)
  - Supabase Storage integration with `public_image` bucket and proper RLS policies
  - Automatic cleanup of old avatars to prevent storage bloat
  - Base64 fallback system when storage is unavailable
  - Comprehensive file validation (type, size, format) with HEIC/HEIF support
- 🔄 **Real-time Updates**: Live avatar and profile updates across the application
- 🔐 **OAuth Optimization**: Streamlined Google OAuth implementation with proper redirect handling
- 🛡️ **Enhanced Validation**: Robust file upload validation with HEIC/HEIF support and security improvements
- 🎯 **Better UX**: Improved error messages and user feedback for authentication and file operations
- ♿ **Accessibility**: Full ARIA support and screen reader compatibility
- 🎨 **Theme Management**: Fixed dashboard readability with proper CSS variable formatting and light theme enforcement
- 🔧 **Authentication Security**: Enhanced Clerk integration with secure password generation and improved username handling
- 🚀 **Deployment Ready**: Fixed Vercel deployment issues with build-time protection for admin API routes

### ZIG TRADES Workflow
- 🎯 **Trading Signals**: Multiple signal offers (ZIGNALS OFFER 1, 2, 3) with different profit rates and durations
- 📋 **Copy Trading**: One-click copy trading functionality with real-time execution
- 📊 **Trading History**: Complete history tracking with date, time, amount, and profit/loss details
- ⚡ **Active Trading**: Real-time active trade management with progress tracking and profit monitoring
- 📈 **Performance Analytics**: Win rate calculation, total profit tracking, and trade statistics
- 🎛️ **Advanced Filters**: Filter trades by status, action type, and time periods

### Wallet System
- 💳 **Deposit Management**: Complete deposit system with amount, reference number, and screenshot verification
- 📊 **Deposit History**: Comprehensive history with date/time, amount, MOP type, and wallet details
- 💰 **Withdrawal System**: Portfolio value display with complete withdrawal forms including bank/ewallet details
- 📋 **Withdrawal History**: Detailed withdrawal tracking with date/time, amount, MOP type, and wallet details
- 🏦 **Dual Wallet Support**: Separate Trading Wallet and Income Wallet with independent balances
- 🔍 **Advanced Search & Filters**: Filter transactions by status, payment method, wallet type, and date ranges
- 📄 **Transaction Receipts**: Download receipts for all deposit and withdrawal transactions

### ProfileSection Component
- 🖼️ **Avatar Display**: User profile pictures with fallback initials and proper loading states
- 👑 **Admin Badge**: Special visual indicator for admin users with crown icon
- 🔄 **Loading States**: Skeleton animations during data fetching for smooth UX
- ⚠️ **Error Handling**: Graceful error displays with retry mechanisms
- 📱 **Responsive Design**: Adapts perfectly to desktop and mobile screen sizes
- ♿ **Accessible**: Full ARIA support and keyboard navigation compatibility
- ⚙️ **Quick Actions**: Fast access to profile editing, settings, notifications, security, billing, and help
- 🔐 **Admin Panel Access**: Special admin panel button for administrator users
- 🚪 **Secure Sign Out**: Loading states during logout process with proper error handling
- 🌐 **Online Status**: Real-time online/offline status indicator
- 🎨 **Modern Design**: Consistent with application theme and branding

## 🔐 Clerk Authentication

Zignal uses **Clerk** for enterprise-grade authentication, providing:

### Enterprise Features
- 🏢 **Professional Authentication**: Enterprise-grade security and compliance
- 🔒 **SOC 2 Type II**: Certified security standards for financial services
- 🎯 **B2B Ready**: Built for trading firms, hedge funds, and institutions
- 📊 **Advanced SSO**: SAML, OIDC, Google Workspace, Microsoft 365 integration
- 🔍 **Audit Trails**: Comprehensive authentication and user activity logs
- 🛡️ **Session Management**: Advanced session controls and policies

### Recent Improvements (v2.8.2)
- ✅ **Fixed Authentication Flow**: Resolved 401 Unauthorized errors with proper endpoint routing
- 🎨 **Enhanced UI**: Complete visual redesign with modern enterprise-grade styling
- ⚡ **Smooth Animations**: Added sophisticated Framer Motion animations and micro-interactions
- 🔄 **Improved Reliability**: Enhanced error handling and fallback authentication mechanisms
- 🚀 **Better Performance**: Fixed hydration issues and optimized animation performance

### Architecture
- **Authentication**: Clerk handles all user authentication with role-based access control
- **Database**: Supabase for trading data and real-time features
- **Routing**: Smart role-based routing with middleware-level protection
- **Session Management**: Clerk session management with automatic refresh
- **Security**: Bank-grade security infrastructure with 99.99% uptime
- **UI/UX**: Modern, accessible interface with professional animations and interactions

### Routing Structure
The application uses role-based routing to provide different experiences for different user types:

#### Universal Routes (Accessible to all authenticated users)
- `/profile` - User profile management (works for both admin and member users)
- `/settings` - Account settings and preferences
- `/wallet` - Wallet management and transactions

#### Member Routes (`/member/*`)
- `/member/dashboard` - Member trading dashboard with portfolio overview
- `/member/profile` - Alternative member-specific profile route
- `/member/settings` - Member-specific settings
- `/member/wallet` - Member-specific wallet management

#### Admin Routes (`/admin/*`)
- `/admin/dashboard` - Administrative dashboard with system overview
- `/admin/users` - User management and permissions
- `/admin/signals` - Trading signals management
- `/admin/test-errors` - Development error testing (dev only)

#### Authentication Pages
- **Custom Sign-in (`/signin`)**: Beautiful split-layout page with Zignals wallpaper and animated logo
- **Custom Sign-up (`/signup`)**: Matching design for user registration
- **Legacy Redirect (`/sign-in`)**: Automatically redirects to `/signin` for consistent experience
- **Features**: 
  - Split layout design (wallpaper left, form right)
  - Animated Zignals logo with glow effects
  - Responsive design for all screen sizes
  - Professional branding with Zignals colors
  - Loading states and error handling

#### Smart Redirects
- **Root (`/`)**: Automatically redirects based on user role
  - Admins → `/admin/dashboard`
  - Members → `/member/dashboard`
- **Legacy (`/dashboard`)**: Redirects to appropriate role-based dashboard
- **Authentication Flow**: After successful login, users are redirected to their role-appropriate dashboard

### Setup
See [CLERK_SETUP_GUIDE.md](./CLERK_SETUP_GUIDE.md) for detailed configuration instructions.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account (for authentication)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd zignal
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory. You can use the provided template:

```bash
# Check current environment configuration
npm run check-env

# Generate required secrets (32+ character random strings)
npm run generate-secrets

# Copy the template (use env-template.txt as reference)
cp env-template.txt .env.local
```

Then edit `.env.local` with your actual credentials:
```bash
# Vercel Serverless Configuration
NEXT_PUBLIC_SITE_URL=https://zignals.org
AUTH_SERVICE_MODE=serverless
EDGE_COMPATIBLE=true
SERVERLESS_FUNCTIONS_URL=https://zignals.org/api
AUTH_MICROSERVICE_URL=https://zignals.org/api/auth

# Vercel Project Information
VERCEL_PROJECT_ID=your_vercel_project_id
VERCEL_TEAM_ID=your_vercel_team_id
VERCEL_ORG_ID=your_vercel_org_id

# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# For local development, use:
# AUTH_SERVICE_MODE=local
# EDGE_COMPATIBLE=false
# SERVERLESS_FUNCTIONS_URL=http://localhost:3000/api
# AUTH_MICROSERVICE_URL=http://localhost:3000/api/auth
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🧪 Testing & Development

### Setting Up Test Accounts

To test the ProfileSection, ProfileDropdown, and authentication functionality, you need to create test users in your Supabase project:

#### Prerequisites
1. Add your Supabase Service Role Key to `.env.local`:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```
> ⚠️ **Important**: Get this key from your Supabase project dashboard → Settings → API → service_role key

#### Create Test Users
Run the setup script to create test accounts:
```bash
node scripts/setup-test-users.js
```

This creates two test accounts:

#### Regular User Account
- **Email**: `member@zignal.dev`
- **Password**: `ZignalMember2024!`
- **Role**: Standard user
- **Features**: Dashboard access, wallet management, trading signals
- **Profile**: Shows standard user interface without admin privileges

#### Admin Account
- **Email**: `admin@zignal.dev`
- **Password**: `ZignalAdmin2024!`
- **Role**: Administrator
- **Features**: Full dashboard access + admin panel
- **Profile**: Shows admin badge, special styling, and admin panel access button

#### Testing Workflow
1. Run the setup script: `node scripts/setup-test-users.js`
2. Start development server: `npm run dev`
3. Navigate to `http://localhost:3000`
4. Login with either test account
5. Verify ProfileSection (sidebar) and ProfileDropdown (header) functionality
6. Test logout functionality with both accounts
7. Confirm admin features work correctly for admin account

#### Testing Notes
- Both accounts are created in Supabase Auth and `user_profiles` table
- Admin account displays crown badges and admin-specific UI elements
- Test logout functionality with both accounts to verify proper state clearing
- ProfileSection in sidebar and ProfileDropdown in header should both work correctly
- Online/offline status indicators update in real-time
- Script handles existing users gracefully (won't create duplicates)

### Project Structure

```
zignal-login/
├── app/
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── dashboard/           # Main trading dashboard
│   │   ├── profile/             # User profile management
│   │   ├── settings/            # User preferences
│   │   └── layout.tsx           # Dashboard layout with AppLayout
│   ├── auth/                    # Authentication routes
│   │   ├── callback/            # OAuth callback handling
│   │   └── auth-code-error/     # Error handling
│   ├── api/                     # Trading API endpoints
│   │   ├── crypto/prices/       # Cryptocurrency data
│   │   ├── dashboard/stats/     # Dashboard statistics
│   │   ├── signals/             # Trading signals
│   │   ├── trades/              # Trade management
│   │   ├── deposits/            # Deposit operations
│   │   ├── withdrawals/         # Withdrawal operations
│   │   └── news/                # News feed
│   ├── admin/                   # Admin panel
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Landing page
├── components/
│   ├── dashboard/               # Complete trading dashboard components
│   ├── layout/                  # AppLayout, Header, Sidebar, ProfileDropdown, ProfileSection
│   ├── ui/                      # Full shadcn/ui component library
│   └── settings/                # Profile settings and photo upload forms
├── hooks/api/                   # Data fetching hooks
├── contexts/                    # Theme and other contexts
├── types/                       # TypeScript definitions
├── lib/
│   ├── supabase/                # Supabase client configurations
│   ├── actions.ts               # Server actions
│   └── utils.ts                 # Utility functions
└── supabase/                    # Database migrations
```

## 🛣️ Routing Structure

- **Landing Page**: `/` - Interactive slideshow landing page with platform features, security info, mission, and vision
- **Authentication**: `/auth/*` - Login system with OAuth support
- **Dashboard**: `/dashboard` - Main trading dashboard with analytics
- **Wallet**: `/wallet` - Complete wallet management with deposits and withdrawals
- **Profile**: `/profile` - User profile management
- **Settings**: `/settings` - User preferences and account settings
- **Admin**: `/admin` - Admin panel for system management
- **Demo**: `/demo/profile-section` - Interactive ProfileSection component demonstration

## 🔧 Development

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Key Technologies
- **Framework**: Next.js 15.5.2 with App Router
- **React**: React 19 with latest features
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase with Row Level Security
- **State Management**: TanStack Query + Zustand
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion for smooth interactions

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 🚀 Serverless Deployment

Zignal is deployed as a serverless application on Vercel with edge-compatible functions for optimal performance.

### Deployment Information
- **Production URL**: https://zignals.org
- **Vercel URL**: https://zignals.vercel.app
- **Project ID**: prj_r2FP75z7nZCQ5GYTvkCFhNBPW8QR
- **Team**: TriGo (team_AhO7EohVDcoArC9gHpRNylja)
- **Framework**: Next.js 15.5.2 with serverless functions
- **Runtime**: Edge Runtime compatible

### Serverless API Endpoints

#### Authentication Microservice
- `https://zignals.org/api/auth/session` - Session management
- `https://zignals.org/api/auth/supabase/me` - Authentication status
- OAuth callbacks handled by Clerk
- Secure logout handled by Clerk
- `https://zignals.org/api/auth/supabase/me` - User profile data

#### Trading Functions
- `https://zignals.org/api/crypto/prices` - Real-time crypto prices
- `https://zignals.org/api/signals` - Trading signals
- `https://zignals.org/api/trades` - Trade management
- `https://zignals.org/api/deposits` - Deposit operations
- `https://zignals.org/api/withdrawals` - Withdrawal operations

#### Admin Functions
- `https://zignals.org/api/admin/users` - User management
- `https://zignals.org/api/admin/signals` - Signal administration
- `https://zignals.org/api/admin/security/alerts` - Security monitoring

### Environment Configuration

For production deployment, use the secure environment setup:

```bash
# 1. Copy the environment template
cp env.production.example .env.production

# 2. Fill in your actual credentials in .env.production
# 3. Run the Vercel setup script to configure environment variables
./vercel-setup.sh

# 4. Verify deployment works with new credentials
```

**Important**: Never commit actual secrets to version control. Use the provided templates and scripts for secure deployment.

Production Environment Variables:
```bash
AUTH_SERVICE_MODE=serverless
EDGE_COMPATIBLE=true
SERVERLESS_FUNCTIONS_URL=https://zignals.org/api
AUTH_MICROSERVICE_URL=https://zignals.org/api/auth
VERCEL_ENV=production
NODE_ENV=production
```

### Deployment Features
- ⚡ **Edge Runtime**: Ultra-fast serverless functions
- 🔄 **Auto-scaling**: Handles traffic spikes automatically
- 🌍 **Global CDN**: Distributed across Vercel's edge network
- 🔒 **Secure**: Enterprise-grade security with Clerk
- 📊 **Monitoring**: Built-in analytics and performance tracking
- ✅ **Build-Time Protection**: Admin API routes handle build-time execution properly

### Recent Deployment Fixes
- **Fixed Vercel Build Error**: Resolved "Failed to collect page data" error for admin API routes
- **Build-Time Protection**: Added proper handling for authentication during Next.js build process
- **See**: `VERCEL_DEPLOYMENT_FIX.md` for technical details

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
