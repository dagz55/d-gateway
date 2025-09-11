// NextAuth type declarations

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      username?: string;
      age?: number;
      gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
      traderLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | 'PROFESSIONAL';
      accountBalance?: number;
      isVerified?: boolean;
      package?: 'BASIC' | 'PREMIUM' | 'PRO' | 'VIP';
      status?: 'ONLINE' | 'IDLE' | 'OFFLINE';
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string;
    age?: number;
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
    traderLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | 'PROFESSIONAL';
    accountBalance?: number;
    isVerified?: boolean;
    package?: 'BASIC' | 'PREMIUM' | 'PRO' | 'VIP';
    status?: 'ONLINE' | 'IDLE' | 'OFFLINE';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username?: string;
    age?: number;
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
    traderLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | 'PROFESSIONAL';
    accountBalance?: number;
    isVerified?: boolean;
    package?: 'BASIC' | 'PREMIUM' | 'PRO' | 'VIP';
    status?: 'ONLINE' | 'IDLE' | 'OFFLINE';
  }
}
