/**
 * Suppress browser extension errors that are outside of our control
 * These errors are typically caused by extensions like MetaMask, password managers, etc.
 */

export function suppressExtensionErrors() {
  if (typeof window === 'undefined') return;

  const originalError = window.console.error;
  
  window.console.error = (...args) => {
    const errorMessage = args[0]?.toString() || '';
    
    // List of known extension-related errors to suppress
    const extensionErrors = [
      'A listener indicated an asynchronous response by returning true',
      'message channel closed',
      'Extension context invalidated',
      'Cannot access a chrome:// URL',
      'Access to fetch at \'chrome-extension://',
      'Failed to fetch dynamically imported module',
    ];
    
    // Check if this is an extension-related error
    const isExtensionError = extensionErrors.some(pattern => 
      errorMessage.includes(pattern)
    );
    
    // Only log non-extension errors
    if (!isExtensionError) {
      originalError.apply(window.console, args);
    }
  };
  
  // Also suppress unhandled promise rejections from extensions
  window.addEventListener('unhandledrejection', (event) => {
    const errorMessage = event.reason?.toString() || '';
    
    if (errorMessage.includes('message channel closed') ||
        errorMessage.includes('A listener indicated an asynchronous response')) {
      event.preventDefault(); // Prevent the error from appearing in console
    }
  });
}