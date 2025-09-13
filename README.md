# Zignal - Advanced Trading Signals Platform v2.1.0

A production-ready Next.js trading platform featuring advanced signals analytics, real-time market data, comprehensive trading tools, and modern authentication with enhanced security UI/UX.

## 🚀 Features

### Authentication (v2.1.0 Enhanced)

- **Supabase Auth Integration** - Secure, scalable authentication system
- **Modern Password UI** - Animated visibility toggles with smooth transitions
- **Password Strength Indicator** - Real-time feedback with color-coded bars
- **Sign Up** with email verification and password strength validation
- **Login** with email/password and modern password field
- **Password Reset** with secure token-based flow
- **Protected Routes** with middleware-based session management
- **Google OAuth** - Ready for configuration

### Dashboard

- **Real-time Stats** - Balance, P&L, Open Signals, Last Deposit
- **Crypto Price Chart** - Interactive BTC/USDT price chart with Recharts
- **Trading History** - Searchable, filterable table with pagination
- **Trading Signals** - Copy-to-clipboard functionality
- **Deposit/Withdrawal** - Forms with validation and history tables
- **Crypto News Feed** - Latest news with external links

### Settings

- **Profile Management** - Change username, password, profile photo
- **Form Validation** - Zod schemas with react-hook-form
- **Real-time Updates** - React Query for data synchronization

## 🛠 Tech Stack

- **Framework**: Next.js 15+ (App Router, TypeScript, ESLint)
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with SSR support (v2.0.0+)
- **Styling**: Tailwind CSS 4 + shadcn/ui + lucide-react
- **Animations**: Framer Motion for smooth interactions
- **UI Components**: Custom PasswordInput with strength meter (v2.1.0)
- **State Management**: Zustand + React Query (TanStack Query)
- **Charts**: Recharts for crypto price visualization
- **Forms**: Zod + react-hook-form for validation
- **UI Components**: shadcn/ui with Radix UI primitives

## 📁 Project Structure

```text
src/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (app)/           # Protected dashboard pages
│   └── api/             # API routes
├── components/
│   ├── auth/            # Authentication forms
│   ├── dashboard/       # Dashboard components
│   ├── layout/          # Layout components
│   ├── settings/        # Settings forms
│   └── ui/              # shadcn/ui components
├── hooks/
│   └── api/             # React Query hooks
├── lib/
│   ├── auth.ts          # NextAuth configuration
│   └── utils.ts         # Utility functions
├── server/
│   └── mock-db.ts       # Mock database
└── types/
    ├── index.ts         # TypeScript types
    └── next-auth.d.ts   # NextAuth type extensions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd zignal
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Update `.env.local`:

   ```env
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3002
   
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3002](http://localhost:3002)

## 🔐 Getting Started

The application starts with an empty database. You'll need to create an account to begin using the platform.

## 📱 Features Overview

### Authentication Flow

1. **Sign Up**: Create account with email verification
2. **OTP Verification**: 6-digit code (displayed in UI for development)
3. **Login**: Access dashboard with credentials
4. **Password Reset**: Request OTP and reset password

### Dashboard Features

- **Overview Tab**: Stats, crypto chart, recent signals, news
- **Trading Tab**: Complete trading history with filters
- **Signals Tab**: Active trading signals with copy functionality
- **Deposits Tab**: Deposit form and transaction history
- **Withdrawals Tab**: Withdrawal form and transaction history
- **News Tab**: Crypto news feed with search

### Settings Features

- **Profile Photo**: Upload with preview (mock implementation)
- **Username Change**: Update username with validation
- **Password Change**: Secure password update

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **Dark Mode**: System preference detection with theme switching
- **Modern Password Fields** (v2.1.0):
  - Animated eye icon toggle (300ms transitions)
  - Password strength indicator with real-time feedback
  - Color-coded strength bars (red → orange → yellow → green)
  - Complexity validation (length, mixed case, numbers, special chars)
- **Accessibility**: ARIA labels, keyboard navigation, focus management
- **Loading States**: Skeleton loaders and loading indicators
- **Error Handling**: Toast notifications and form validation
- **Empty States**: Helpful CTAs for empty data states
- **Cursor & Hover Effects**: Enhanced button interactions (v2.0.0)

## 🔧 API Endpoints

### Authentication Endpoints

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/request-reset` - Request password reset
- `POST /api/auth/verify-otp` - Verify OTP code

### Data

- `GET /api/trades` - Trading history with pagination
- `GET /api/signals` - Trading signals
- `GET /api/deposits` - Deposit history
- `POST /api/deposits` - Create deposit
- `GET /api/withdrawals` - Withdrawal history
- `POST /api/withdrawals` - Create withdrawal
- `GET /api/news` - Crypto news feed
- `GET /api/crypto/prices` - Price data for charts
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/profile` - User profile
- `PATCH /api/profile` - Update profile

## 🧪 Testing

The application includes:

- **TypeScript**: Strict type checking
- **ESLint**: Code quality and consistency
- **Form Validation**: Zod schemas for all forms
- **Error Boundaries**: Graceful error handling
- **Mock Data**: Realistic sample data for development

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Environment Variables

Ensure all required environment variables are set in production:

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## 📝 Development Notes

### Database Configuration

The application uses Supabase (PostgreSQL) for production-ready data storage with automatic fallback to mock database for development. ✅ CONFIGURED

**Current Status:**

- ✅ Supabase integration with Row Level Security (RLS)
- ✅ Database migrations and schema ready
- ✅ Mock database fallback for development
- ✅ All data operations (users, trades, signals, transactions) working
- ✅ Authentication with Supabase Auth + NextAuth.js

**Database Setup:**

1. Create Supabase project
2. Apply migrations in SQL Editor:
   - `supabase/migrations/20240101000000_initial_schema.sql`
   - `supabase/migrations/20240101000001_rls_policies.sql`
   - `supabase/migrations/20240101000002_auth_triggers.sql`
3. Configure environment variables

### Authentication Configuration

NextAuth.js is configured with credentials provider. For production:

- Add OAuth providers (Google, GitHub, etc.)
- Implement proper password hashing
- Add email service for OTP delivery
- Configure session storage

### API Integration

All API routes are currently mocked. For production:

- Connect to real trading APIs
- Implement proper error handling
- Add rate limiting and security
- Use proper database queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Recharts](https://recharts.org/) - Charts
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [TanStack Query](https://tanstack.com/query) - Data fetching