'use client';

import { createBrowserClient } from '@supabase/ssr';
import { User, Session } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Database } from '@/lib/supabase/types';

type SupabaseContext = {
  supabase: ReturnType<typeof createBrowserClient<Database>>;
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refetchUser: () => Promise<void>;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export function SupabaseAuthProvider({ 
  children,
  session: initialSession
}: { 
  children: React.ReactNode;
  session?: Session | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null);
  const [session, setSession] = useState<Session | null>(initialSession ?? null);
  const [loading, setLoading] = useState(!initialSession);

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle auth events
      if (event === 'SIGNED_IN') {
        router.refresh();
      } else if (event === 'SIGNED_OUT') {
        // Redirect to login if on protected route
        const protectedPaths = ['/dashboard', '/settings', '/profile'];
        if (protectedPaths.some(path => pathname.startsWith(path))) {
          router.push('/login');
        }
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, pathname]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const refetchUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    setUser(session?.user ?? null);
  };

  return (
    <Context.Provider value={{ supabase, user, session, loading, signOut, refetchUser }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabaseAuth = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used inside SupabaseAuthProvider');
  }
  return context;
};

// Compatibility hook to ease migration from NextAuth
export const useSession = () => {
  const { session, user, loading, refetchUser } = useSupabaseAuth();
  
  return {
    data: session ? {
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.user_metadata?.full_name || user?.user_metadata?.name,
        image: user?.user_metadata?.avatar_url,
        ...user?.user_metadata
      },
      expires: new Date(session.expires_at! * 1000).toISOString()
    } : null,
    status: loading ? 'loading' : session ? 'authenticated' : 'unauthenticated',
    update: refetchUser
  };
};
