import { mockDb } from '@/server/mock-db';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Find user in mock database
        const user = Array.from(mockDb.users.values()).find(
          u => u.username === credentials.username || u.email === credentials.username
        );

        if (!user) {
          return null;
        }

        // In a real app, you would hash and compare passwords
        // For now, we'll just check if password is not empty
        if (!credentials.password || credentials.password.length < 1) {
          return null;
        }

        return {
          id: user.id,
          name: user.fullName,
          email: user.email,
          username: user.username,
          age: user.age,
          gender: user.gender,
          traderLevel: user.traderLevel,
          accountBalance: user.accountBalance,
          isVerified: user.isVerified,
          package: user.package,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }: { token: any; user: any; account: any }) {
      if (user) {
        // Handle Google OAuth users
        if (account?.provider === 'google') {
          // Create or find user in mock database
          let existingUser = Array.from(mockDb.users.values()).find(
            u => u.email === user.email
          );
          
          if (!existingUser) {
            // Create new user for Google OAuth
            const newUser = {
              id: user.id,
              email: user.email,
              username: user.email.split('@')[0], // Use email prefix as username
              fullName: user.name || user.email,
              password: '', // No password for OAuth users
              age: 25, // Default age
              gender: 'OTHER' as const,
              traderLevel: 'BEGINNER' as const,
              accountBalance: 0,
              isVerified: true, // Google users are pre-verified
              package: 'BASIC' as const,
              status: 'ONLINE' as const,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            mockDb.users.set(user.id, newUser);
            existingUser = newUser;
          }
          
          token.id = existingUser.id;
          token.username = existingUser.username;
          token.age = existingUser.age;
          token.gender = existingUser.gender;
          token.traderLevel = existingUser.traderLevel;
          token.accountBalance = existingUser.accountBalance;
          token.isVerified = existingUser.isVerified;
          token.package = existingUser.package;
          token.status = existingUser.status;
        } else {
          // Handle credentials users
          token.id = user.id;
          token.username = user.username;
          token.age = user.age;
          token.gender = user.gender;
          token.traderLevel = user.traderLevel;
          token.accountBalance = user.accountBalance;
          token.isVerified = user.isVerified;
          token.package = user.package;
          token.status = user.status;
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        (session.user as any).id = token.id as string;
        (session.user as any).username = token.username as string;
        (session.user as any).age = token.age as number;
        (session.user as any).gender = token.gender as string;
        (session.user as any).traderLevel = token.traderLevel as string;
        (session.user as any).accountBalance = token.accountBalance as number;
        (session.user as any).isVerified = token.isVerified as boolean;
        (session.user as any).package = token.package as string;
        (session.user as any).status = token.status as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signUp: '/signup',
  },
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};