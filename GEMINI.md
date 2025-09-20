# GEMINI.md

## Project Overview

This project is a production-ready Next.js member dashboard for a cryptocurrency trading platform. It includes features for user authentication, a dashboard with real-time stats and charts, trading history, signals, deposits/withdrawals, and a news feed. The application is built with Next.js 15.5.3, TypeScript, and Tailwind CSS, and it uses Clerk for authentication and Supabase for the database.

The project is well-structured, with a clear separation of concerns between the frontend and backend. The frontend is built with React and uses `shadcn/ui` for UI components, `Recharts` for charts, and `Zustand` and `React Query` for state management. The backend consists of API routes built with Next.js API routes, and it uses a mock in-memory database for data storage.

## Building and Running

### Prerequisites

*   Node.js 18+
*   npm or yarn

### Installation

1.  **Install dependencies:**

    ```bash
    npm install
    ```

### Running the Development Server

1.  **Start the development server:**

    ```bash
    npm run dev
    ```

2.  **Open your browser:**

    Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

1.  **Build the application:**

    ```bash
    npm run build
    ```

2.  **Start the production server:**

    ```bash
    npm start
    ```

### Linting

1.  **Run the linter:**

    ```bash
    npm run lint
    ```

## Development Conventions

*   **Authentication:** The application uses Clerk for authentication with App Router integration. Clerk handles OAuth providers, email/password, and magic links automatically.
*   **Database:** The application uses Supabase for its database with Row Level Security for data protection.
*   **API:** API routes provide both mock data for development and production-ready endpoints for real trading data.
*   **Styling:** The project uses Tailwind CSS for styling and `shadcn/ui` for UI components.
*   **State Management:** The project uses `Zustand` and `React Query` for state management.
*   **Form Validation:** The project uses `Zod` and `react-hook-form` for form validation.
*   **Linting:** The project uses ESLint for code quality and consistency.

## Clerk Integration

The application uses Clerk for authentication with the following setup:

*   **Middleware:** `clerkMiddleware()` from `@clerk/nextjs/server` for session management
*   **Provider:** `<ClerkProvider>` wrapping the entire application in `app/layout.tsx`
*   **Components:** `<SignIn />` and `<SignUp />` components with custom split-panel design
*   **Routes:** `/sign-in/[[...sign-in]]` and `/sign-up/[[...sign-up]]` for dynamic authentication
*   **Environment:** Requires `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

### Authentication Flow
1. Users access sign-in/sign-up pages with Clerk components
2. Clerk handles authentication (OAuth/Email/Magic Links)
3. Middleware validates sessions using `clerkMiddleware()`
4. Role-based redirects (admin → `/dashboard/admins`, members → `/dashboard/members`)
5. Automatic session management and token refresh
6. Organization support enabled for admin role assignment
