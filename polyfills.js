// Polyfills for server-side rendering compatibility
if (typeof globalThis !== 'undefined') {
  if (typeof globalThis.self === 'undefined') {
    globalThis.self = globalThis;
  }
  if (typeof globalThis.window === 'undefined') {
    globalThis.window = {};
  }
  if (typeof globalThis.document === 'undefined') {
    globalThis.document = {};
  }
  if (typeof globalThis.navigator === 'undefined') {
    globalThis.navigator = {};
  }
  if (typeof globalThis.location === 'undefined') {
    globalThis.location = {};
  }
}

// Legacy global support
if (typeof global !== 'undefined') {
  if (typeof global.self === 'undefined') {
    global.self = global;
  }
  if (typeof global.window === 'undefined') {
    global.window = {};
  }
}