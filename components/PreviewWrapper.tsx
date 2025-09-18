'use client'

import { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

interface PreviewWrapperProps {
  children: ReactNode
}

// Simple fallback component for error boundary
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  const headingId = 'error-heading'
  const messageId = 'error-message'
  
  return (
    <div 
      className="p-4 border border-red-200 rounded-lg bg-red-50"
      role="alert"
      aria-live="assertive"
      aria-labelledby={headingId}
      aria-describedby={messageId}
    >
      <h2 id={headingId} className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h2>
      <p id={messageId} className="text-red-600 mb-3">{error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        aria-label="Try again to reload the component"
      >
        Try again
      </button>
    </div>
  )
}

export default function PreviewWrapper({ children }: PreviewWrapperProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="preview-container">
        {children}
      </div>
    </ErrorBoundary>
  )
}

