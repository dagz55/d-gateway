// Global polyfill for Node.js environment
// This file should be loaded before any other code that might reference browser globals

if (typeof globalThis !== 'undefined') {
  // Define self if it doesn't exist
  if (!globalThis.self) {
    globalThis.self = globalThis;
  }

  // Define window as empty object if it doesn't exist (for SSR compatibility)
  if (!globalThis.window && typeof window === 'undefined') {
    globalThis.window = {
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
      location: { href: '' },
      navigator: { userAgent: '' }
    };
  }

  // Define document as empty object if it doesn't exist
  if (!globalThis.document && typeof document === 'undefined') {
    globalThis.document = {
      addEventListener: () => {},
      removeEventListener: () => {},
      createElement: () => ({ style: {} }),
      getElementById: () => null,
      querySelector: () => null,
      body: { appendChild: () => {}, removeChild: () => {} }
    };
  }
}

// For legacy Node.js environments
if (typeof global !== 'undefined') {
  if (!global.self) {
    global.self = global;
  }
}

module.exports = {};