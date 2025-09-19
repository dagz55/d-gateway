# GEMINI.md

## Project Overview

This project is a production-ready Next.js member dashboard for a cryptocurrency trading platform. It includes features for user authentication, a dashboard with real-time stats and charts, trading history, signals, deposits/withdrawals, and a news feed. The application is built with Next.js 14, TypeScript, and Tailwind CSS, and it uses Clerk for authentication and Supabase for the database.

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

*   **Authentication:** The application uses Clerk for authentication. For development, it uses a mock database, but for production, it should be configured with an OAuth provider and a proper database.
*   **Database:** The application uses Supabase for its database. For production, it should be configured with an OAuth provider and a proper database.
*   **API:** All API routes are currently mocked. For production, these should be connected to real trading APIs and a database.
*   **Styling:** The project uses Tailwind CSS for styling and `shadcn/ui` for UI components.
*   **State Management:** The project uses `Zustand` and `React Query` for state management.
*   **Form Validation:** The project uses `Zod` and `react-hook-form` for form validation.
*   **Linting:** The project uses ESLint for code quality and consistency.
