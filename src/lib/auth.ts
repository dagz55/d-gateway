import { createClient } from '@/lib/supabase/server';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';

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

        const supabase = await createClient();
        
        // Find user by username or email
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .or(`username.eq.${credentials.username},email.eq.${credentials.username}`)
          .single();

        if (!profile || !profile.password) {
          return null;
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(credentials.password, profile.password);
        if (!passwordMatch) {
          return null;
        }

        return {
          id: profile.user_id,
          name: profile.full_name,
          email: profile.email,
          username: profile.username,
          avatarUrl: profile.avatar_url,
          age: profile.age,
          gender: profile.gender,
          traderLevel: profile.trader_level,
          accountBalance: profile.account_balance,
          isVerified: profile.is_verified,
          package: profile.package,
          status: profile.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }: { token: any; user: any; account: any }) {
      if (user) {
        const supabase = await createClient();
        
        // Handle Google OAuth users
        if (account?.provider === 'google') {
          // Check if user profile exists
          let { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', user.email)
            .single();
          
          if (!profile) {
            // Create new user profile for Google OAuth
            const { data: newProfile } = await supabase
              .from('user_profiles')
              .insert({
                user_id: user.id,
                email: user.email,
                username: user.email?.split('@')[0] || 'user',
                full_name: user.name || user.email,
                avatar_url: user.image,
                age: 25,
                gender: 'OTHER',
                trader_level: 'BEGINNER',
                account_balance: 0,
                is_verified: true,
                package: 'BASIC',
                status: 'ONLINE',
              })
              .select()
              .single();
            
            profile = newProfile;
          }
          
          if (profile) {
            token.id = profile.user_id;
            token.username = profile.username;
            token.avatarUrl = profile.avatar_url;
            token.age = profile.age;
            token.gender = profile.gender;
            token.traderLevel = profile.trader_level;
            token.accountBalance = profile.account_balance;
            token.isVerified = profile.is_verified;
            token.package = profile.package;
            token.status = profile.status;
          }
        } else {
          // Handle credentials users
          token.id = user.id;
          token.username = user.username;
          token.avatarUrl = user.avatarUrl;
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
        (session.user as any).avatarUrl = token.avatarUrl as string | undefined;
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