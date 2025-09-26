# Technical Architecture Documentation

## 🏗️ System Architecture

The Zignal Login project follows a modern full-stack architecture built on Next.js 15 with TypeScript, emphasizing security, scalability, and developer experience.

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────┤
│  React 19.1.1 + Next.js 15.5.4 (App Router)              │
│  ├── Role-based Dashboards (/dashboard/admins|members)     │
│  ├── Authentication Pages (/sign-in, /sign-up)            │
│  ├── Market Data Pages (/market)                          │
│  ├── Wallet Management (/wallet)                          │
│  └── Settings (/settings)                                 │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                  MIDDLEWARE LAYER                          │
├─────────────────────────────────────────────────────────────┤
│  Clerk Middleware                                          │
│  ├── Route Protection                                      │
│  ├── Authentication Validation                            │
│  ├── Role-based Redirects                                │
│  └── Public Route Exemptions                             │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  Next.js API Routes                                        │
│  ├── /api/payments/paypal/* (PayPal Integration)          │
│  ├── /api/crypto/* (Market Data)                          │
│  ├── /api/webhooks/* (External Webhooks)                  │
│  └── Server Actions (lib/actions.ts)                      │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATA LAYER                                │
├─────────────────────────────────────────────────────────────┤
│  Supabase (PostgreSQL + Real-time)                        │
│  ├── Row Level Security (RLS)                             │
│  ├── Real-time Subscriptions                              │
│  ├── Database Functions                                   │
│  └── Storage (Optional)                                   │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                 EXTERNAL SERVICES                          │
├─────────────────────────────────────────────────────────────┤
│  ├── Clerk (Authentication)                               │
│  ├── PayPal (Payments)                                    │
│  ├── CoinGecko (Market Data)                             │
│  └── MCP Gateway (6 Services)                            │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Technology Stack

### Core Framework
- **Next.js 15.5.4**: React framework with App Router
- **React 19.1.1**: UI library with concurrent features
- **TypeScript**: Static type checking
- **Turbopack**: Fast development build tool

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library (26 components)
- **Framer Motion**: Animation library
- **next-themes**: Dark/light theme support

### State Management
- **TanStack Query**: Data fetching and caching
- **Zustand**: Global state management
- **React Context**: Local state sharing

### Database & Authentication
- **Supabase**: PostgreSQL with real-time capabilities
- **Clerk**: Authentication and user management
- **Row Level Security**: Database-level security

### Development Tools
- **ESLint**: Code linting
- **TypeScript**: Type checking
- **Husky**: Git hooks
- **CommitLint**: Commit message validation

## 🏢 Application Structure

### Route Organization

```
app/
├── (dashboard)/              # Protected route group
│   ├── dashboard/
│   │   ├── admins/          # Admin-only pages
│   │   └── members/         # Member-accessible pages
│   ├── market/              # Market data
│   ├── wallet/              # Wallet management
│   └── settings/            # User settings
├── api/                     # API routes
│   ├── payments/paypal/     # PayPal integration
│   ├── crypto/              # Market data API
│   └── webhooks/            # External webhooks
├── sign-in/                 # Authentication
├── sign-up/
└── globals.css              # Global styles
```

### Component Architecture

```
components/
├── ui/                      # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ... (23 more components)
├── layout/                  # Layout components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── Footer.tsx
├── dashboard/               # Dashboard-specific components
│   ├── TradingChart.tsx
│   ├── PortfolioOverview.tsx
│   └── TransactionHistory.tsx
├── wallet/                  # Wallet components
│   ├── WalletBalance.tsx
│   ├── DepositForm.tsx
│   └── WithdrawForm.tsx
├── admin/                   # Admin components
│   ├── PayPalPaymentsManager.tsx
│   └── UserManagement.tsx
└── auth/                    # Authentication components
    ├── SignInForm.tsx
    └── SignUpForm.tsx
```

## 🔐 Security Architecture

### Authentication Flow

```
1. User visits protected route
2. Middleware checks authentication status
3. If unauthenticated → redirect to /sign-in
4. Clerk handles OAuth flow
5. Post-login → role-based redirect
6. Admin → /dashboard/admins
7. Member → /dashboard/members
```

### Database Security

```sql
-- Row Level Security policies
CREATE POLICY "Users can only access their own data"
ON user_profiles
FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can access all payment data"
ON paypal_payments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);
```

### API Security

- **Middleware Protection**: Routes protected by Clerk middleware
- **Public Routes**: Explicitly defined public endpoints
- **Database RLS**: Row-level security enforced at database level
- **Environment Variables**: Sensitive data in environment variables
- **Input Validation**: Request validation on all API endpoints

## 📊 Data Flow

### Client-Side Data Flow

```
1. Component Mount
2. TanStack Query Hook
3. API Route Call
4. Database Query (Supabase)
5. Response Transform
6. Cache Update
7. Component Re-render
```

### Real-time Data Flow

```
1. Database Change (INSERT/UPDATE/DELETE)
2. Supabase Real-time Trigger
3. WebSocket Message
4. Client Subscription Handler
5. State Update
6. Component Re-render
```

## 🔄 State Management Strategy

### Global State (Zustand)
- User preferences
- Theme settings
- Navigation state
- Modal states

### Server State (TanStack Query)
- API data caching
- Background refetching
- Optimistic updates
- Error handling

### Local State (useState/useReducer)
- Form data
- Component-specific UI state
- Temporary data

## 🗄️ Database Design

### Core Tables

```sql
-- User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  user_id UUID REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE,
  role VARCHAR(20) DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PayPal Payments
CREATE TABLE paypal_payments (
  id UUID PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  description TEXT,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  payment_link TEXT,
  paypal_order_id VARCHAR(255),
  transaction_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallet Transactions
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  wallet_type VARCHAR(20) NOT NULL, -- 'trading' or 'income'
  amount DECIMAL(15,8) NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- 'deposit', 'withdrawal', 'trade'
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  category VARCHAR(50) DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Configuration Management

### Environment Configuration

```typescript
// lib/config.ts
export const config = {
  app: {
    name: 'Zignal Login',
    version: '2.11.18',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },
  auth: {
    clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
    clerkSecretKey: process.env.CLERK_SECRET_KEY!,
  },
  database: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  external: {
    coinGeckoApiKey: process.env.COINGECKO_API_KEY,
    paypalClientId: process.env.PAYPAL_CLIENT_ID,
    paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET,
  },
};
```

## 🚀 Performance Optimizations

### Client-Side Optimizations
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Bundle size monitoring
- **React Suspense**: Loading state management

### Server-Side Optimizations
- **Turbopack**: Fast development builds
- **Edge Runtime**: API routes on edge
- **Database Indexing**: Optimized database queries
- **Caching Strategy**: TanStack Query caching

### Network Optimizations
- **Compression**: Gzip/Brotli compression
- **CDN**: Static asset delivery
- **Prefetching**: Link prefetching
- **Service Worker**: Offline capabilities (future)

## 🧪 Testing Strategy

### Unit Testing
- **Components**: React Testing Library
- **Utilities**: Jest
- **API Routes**: Supertest

### Integration Testing
- **Database**: Supabase local testing
- **Authentication**: Clerk test environment
- **API Endpoints**: End-to-end API testing

### E2E Testing
- **User Flows**: Playwright
- **Cross-browser**: Multiple browser testing
- **Mobile**: Responsive testing

## 📈 Monitoring & Analytics

### Performance Monitoring
- **Core Web Vitals**: Performance metrics
- **Error Tracking**: Error boundary logging
- **API Monitoring**: Response time tracking

### Business Analytics
- **User Engagement**: Dashboard usage
- **Payment Tracking**: Transaction analytics
- **Feature Usage**: Component interaction tracking

## 🔄 Development Workflow

### Local Development
```bash
npm run dev          # Start development server
npm run build        # Test production build
npm run lint         # Code quality check
npm run test:all     # Run test suite
npm run validate-env # Check environment variables
```

### Deployment Pipeline
1. **Development**: Local development with hot reload
2. **Staging**: Feature branch deployment
3. **Production**: Main branch automatic deployment
4. **Monitoring**: Real-time performance tracking

---
*Last updated: January 2025 (v2.11.18)*
*Architecture Status: ✅ Production Ready*