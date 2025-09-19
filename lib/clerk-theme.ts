import { dark } from '@clerk/themes';

/**
 * Clerk appearance configuration for consistent theming across the application
 */
export const clerkAppearance = {
  baseTheme: dark,
  elements: {
    formButtonPrimary:
      'bg-blue-600 hover:bg-blue-700 text-white transition-colors',
    card: 'shadow-xl border border-gray-800',
    headerTitle: 'text-2xl font-bold',
    headerSubtitle: 'text-gray-400',
    socialButtonsBlockButton:
      'border border-gray-600 hover:bg-gray-800 transition-colors',
    formFieldInput:
      'border-gray-600 bg-gray-800',
    footerActionLink:
      'text-blue-400 hover:text-blue-300',
  },
  variables: {
    colorPrimary: '#1A7FB3',
    colorTextOnPrimaryBackground: '#ffffff',
    colorBackground: '#0A0F1F',
    colorText: '#EAF2FF',
    colorTextSecondary: '#94a3b8',
    colorDanger: '#ef4444',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorNeutral: '#1e293b',
    borderRadius: '0.5rem',
    fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
  },
  layout: {
    socialButtonsPlacement: 'bottom',
    socialButtonsVariant: 'blockButton',
    showOptionalFields: true,
  },
} as const;
