// src/components/SupabaseProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabaseClient';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code).finally(() => {
        // Clean the URL so we don't re-exchange on refresh/back
        url.searchParams.delete('code');
        window.history.replaceState({}, '', url.toString());
      });
    }

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle auth state changes
        if (event === 'SIGNED_OUT') {
          router.push('/login');
        } else if (event === 'TOKEN_REFRESHED' && !session) {
          router.push('/login');
        }
        else if (event === 'PASSWORD_RECOVERY') {
          const newPassword = prompt('What would you like your new password to be?');
          if (!newPassword) return;
          const { error } = await supabase.auth.updateUser({ password: newPassword });
          if (error) alert('There was an error updating your password.');
          else {
            alert('Password updated successfully!');
            router.push('/login?reset=success');
          }
        }
      }
    );

    // Set up periodic session check
    const interval = setInterval(async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        router.push('/login');
      }
    }, 4 * 60 * 1000); // 4 minutes

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SupabaseProvider');
  }
  return context;
};