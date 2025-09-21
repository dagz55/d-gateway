'use client';

import { useEffect } from 'react';

// Suppress React DevTools source map warnings in development
export function ConsoleSuppress() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Store original console methods
      const originalError = console.error;
      const originalWarn = console.warn;

      // Filter out specific DevTools warnings
      console.error = (...args) => {
        const message = args[0];
        if (
          typeof message === 'string' && 
          (message.includes('Source map error') ||
           message.includes('installHook.js.map') ||
           message.includes('react_devtools_backend_compact.js.map'))
        ) {
          return; // Suppress these specific warnings
        }
        originalError.apply(console, args);
      };

      console.warn = (...args) => {
        const message = args[0];
        if (
          typeof message === 'string' && 
          (message.includes('Source map error') ||
           message.includes('DevTools'))
        ) {
          return; // Suppress these specific warnings
        }
        originalWarn.apply(console, args);
      };

      // Cleanup on unmount
      return () => {
        console.error = originalError;
        console.warn = originalWarn;
      };
    }
  }, []);

  return null; // This component doesn't render anything
}
