# AGENT.md

## Project Overview

Zignal is a modern crypto signals platform built with Next.js 14 that turns professional trading signals into clear actions. The application provides a sleek interface for accessing member dashboards and admin tools with real-time signal visualization.

### Project Structure

```
zignal/
├── app/                    # Next.js app directory (App Router)
│   ├── auth/              # Authentication pages and routes
│   ├── dashboard/         # Member dashboard
│   ├── admin/             # Admin panel
│   ├── globals.css        # Global styles with Tailwind CSS
│   ├── layout.tsx         # Root layout with metadata
│   └── page.tsx           # Home/login page
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components
│   ├── AuthCard.tsx      # Authentication card component
│   └── HeroSection.tsx   # Hero section with animated background
├── lib/                  # Utility functions and configurations
│   ├── supabase/         # Supabase client configurations
│   └── utils.ts          # Utility functions
├── public/               # Static assets
│   ├── zignal-logo.svg   # Main logo (SVG)
│   ├── zignal-logo.png   # Logo (PNG)
│   └── favicon.ico       # Browser favicon
├── middleware.ts         # Next.js middleware for auth
├── tailwind.config.ts    # Tailwind CSS configuration
├── postcss.config.mjs    # PostCSS configuration
└── package.json          # Dependencies and scripts
```

## Setup Commands

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account (for authentication)

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Environment Configuration

Create a `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Development redirect URL
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

## Code Style Guidelines

### TypeScript Configuration
- **Strict Mode**: Enabled in `tsconfig.json`
- **Target**: ES2022
- **Module Resolution**: Node
- **JSX**: React JSX

### Code Conventions
- **Formatting**: Use Prettier (configured in project)
- **Indentation**: 2 spaces
- **Quotes**: Double quotes for strings, single quotes for JSX attributes
- **Semicolons**: Required
- **Trailing Commas**: Yes for multi-line objects/arrays

### Naming Conventions
- **Variables and functions**: `camelCase`
- **Components**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Files**: `kebab-case` for pages, `PascalCase` for components
- **CSS Classes**: `kebab-case` (Tailwind CSS)

### Component Structure
```typescript
// Component imports
import React from 'react'
import { ComponentProps } from '@/types'

// Type definitions
interface ComponentNameProps {
  // Props definition
}

// Component definition
export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // Component logic
  return (
    // JSX
  )
}
```

## Styling Guidelines

### Tailwind CSS
- **Version**: 4.1.9 with PostCSS plugin
- **Configuration**: Custom theme in `tailwind.config.ts`
- **Colors**: Custom color palette for Zignal branding
- **Responsive**: Mobile-first approach
- **Dark Mode**: Class-based dark mode

### Custom CSS
- **Global Styles**: Defined in `app/globals.css`
- **Component Styles**: Use Tailwind classes
- **Custom Properties**: CSS variables for theming
- **Animations**: Use Tailwind's animation utilities

## Testing Instructions

### Test Structure
```bash
# Unit tests (when implemented)
npm run test

# E2E tests (when implemented)
npm run test:e2e

# Type checking
npm run type-check
```

### Testing Guidelines
- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user flows
- **Coverage**: Aim for >80% code coverage

## Authentication Flow

### Supabase Integration
- **Client**: `lib/supabase/browserClient.ts`
- **Server**: `lib/supabase/serverClient.ts`
- **Providers**: Google OAuth and email/password
- **Middleware**: `middleware.ts` handles route protection

### Protected Routes
- `/dashboard` - Member dashboard (requires auth)
- `/admin` - Admin panel (requires auth)
- `/auth/callback` - OAuth callback handler

### Authentication States
- **Unauthenticated**: Shows login page
- **Authenticated**: Redirects to dashboard
- **Error**: Shows error page with retry options

## Security Considerations

### Environment Variables
- **Never commit**: `.env.local` files
- **Public variables**: Must be prefixed with `NEXT_PUBLIC_`
- **Server variables**: Keep server-side only
- **Validation**: Check for required variables at startup

### Input Validation
- **Client-side**: Basic validation with form libraries
- **Server-side**: Validate all inputs with Zod schemas
- **Sanitization**: Sanitize user inputs before processing

### Security Headers
- **CSP**: Content Security Policy configured
- **CORS**: Configured for allowed origins
- **CSRF**: Protection via SameSite cookies

## Database Schema (Supabase)

### Tables Structure
```sql
-- Users table (managed by Supabase Auth)
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Signals table
signals (
  id UUID PRIMARY KEY,
  symbol TEXT NOT NULL,
  action TEXT NOT NULL, -- 'BUY', 'SELL', 'HOLD'
  price DECIMAL,
  target_price DECIMAL,
  stop_loss DECIMAL,
  created_at TIMESTAMP,
  expires_at TIMESTAMP
)

-- User subscriptions
subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP
)
```

## API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/signin` - User login
- `POST /auth/signout` - User logout
- `GET /auth/callback` - OAuth callback

### Signals
- `GET /api/signals` - Get trading signals
- `POST /api/signals` - Create new signal (admin)
- `PUT /api/signals/:id` - Update signal (admin)
- `DELETE /api/signals/:id` - Delete signal (admin)

## Deployment Instructions

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Environment Variables (Production)
Set the following in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL`

### Build Configuration
- **Node.js Version**: 18.x
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Git Workflow

### Branching Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `hotfix/*` - Critical fixes

### Commit Convention
```
[Component] Brief description

- Detailed change 1
- Detailed change 2

Fixes #123
```

### Pull Request Process
1. Create feature branch from `develop`
2. Make changes with tests
3. Run linting and tests
4. Create PR to `develop`
5. Code review and approval
6. Merge to `develop`
7. Deploy to staging
8. Merge `develop` to `main` for production

## Performance Optimization

### Next.js Optimizations
- **Image Optimization**: Use `next/image` component
- **Font Optimization**: Use `next/font` for custom fonts
- **Code Splitting**: Automatic with App Router
- **Static Generation**: Use `generateStaticParams` where possible

### Bundle Analysis
```bash
# Analyze bundle size
npm run analyze
```

### Performance Monitoring
- **Vercel Analytics**: Built-in performance monitoring
- **Core Web Vitals**: Track LCP, FID, CLS
- **Lighthouse**: Regular performance audits

## Troubleshooting

### Common Issues

#### PostCSS Error
```
Error: It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin
```
**Solution**: Ensure `postcss.config.mjs` uses `@tailwindcss/postcss` instead of `tailwindcss`

#### Supabase Connection Error
```
Error: Missing Supabase environment variables
```
**Solution**: Check `.env.local` file has correct Supabase credentials

#### Image Loading Error
```
The requested resource isn't a valid image
```
**Solution**: Ensure images are in `public/` directory and use correct paths

### Debug Commands
```bash
# Check environment variables
npm run env:check

# Validate Supabase connection
npm run supabase:test

# Check TypeScript types
npm run type-check
```

## Additional Notes

### Logo Assets
- **SVG**: `public/zignal-logo.svg` - High-quality vector logo
- **PNG**: `public/zignal-logo.png` - Raster logo for compatibility
- **Favicon**: `public/favicon.ico` - Browser tab icon

### Brand Colors
- **Primary**: `#1A7FB3` (Blue)
- **Secondary**: `#33E1DA` (Teal)
- **Background**: `#0A0F1F` (Dark blue)
- **Text**: `#EAF2FF` (Light blue)

### Dependencies
- **Framework**: Next.js 14.2.32
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: shadcn/ui
- **Authentication**: Supabase
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Mono

### Development Tools
- **TypeScript**: 5.x
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **PostCSS**: CSS processing
- **Vercel**: Deployment platform

---

This AGENT.md file provides comprehensive guidance for AI coding agents working on the Zignal project. Keep it updated as the project evolves.
