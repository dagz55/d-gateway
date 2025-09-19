import '@clerk/nextjs/server';

declare module '@clerk/nextjs/server' {
  interface SessionClaims {
    metadata: {
      role?: 'admin' | 'member';
    };
    publicMetadata: {
      role?: 'admin' | 'member';
    };
  }
}
