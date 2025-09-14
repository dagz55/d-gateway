# Zignal - Advanced Trading Signals & Analytics Platform

Zignal is a comprehensive crypto trading platform built with [Next.js 15.5.2](https://nextjs.org) that transforms professional trading signals into actionable insights. This application provides a complete trading ecosystem with advanced analytics, real-time data, and modern user experience.

## 🚀 Features

### Core Platform
- 🔐 **Advanced Authentication**: Google OAuth and email-based authentication with Supabase
- 📊 **Trading Dashboard**: Complete trading interface with real-time charts and analytics
- 📈 **Signal Management**: Professional trading signals with copy trading capabilities
- 💰 **Portfolio Management**: Track profits, losses, and portfolio distribution
- 📰 **News Integration**: Real-time cryptocurrency news feed
- 💳 **Financial Operations**: Deposit and withdrawal management
- 👤 **Profile Management**: Complete user profile system with photo uploads and settings
- 🎨 **Profile Dropdown**: Interactive user menu with subscription status and quick access

### Technical Features
- 🎨 **Modern UI**: Built with Tailwind CSS and complete shadcn/ui component library
- 🌙 **Theme System**: Dark/light mode with persistence
- 📱 **Responsive Design**: Mobile-first approach with full responsiveness
- ⚡ **Performance**: Optimized with Next.js 15.5.2 and React 19
- 🔒 **Security**: Supabase-powered authentication with Row Level Security
- 🏗️ **Architecture**: Clean separation with protected route groups
- 📸 **File Upload**: Dual-path photo upload system (Supabase Storage + Base64 fallback)
- 🔄 **Real-time Updates**: Live avatar and profile updates across the application

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
Create a `.env.local` file in the root directory and add your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
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
│   ├── layout/                  # AppLayout, Header, Sidebar, ProfileDropdown
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

- **Landing Page**: `/` - Original login/landing page (preserved)
- **Authentication**: `/auth/*` - Login system with OAuth support
- **Dashboard**: `/dashboard` - Main trading dashboard with analytics
- **Profile**: `/profile` - User profile management
- **Settings**: `/settings` - User preferences and account settings
- **Admin**: `/admin` - Admin panel for system management

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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
