'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import type { Profile } from '@/lib/types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  error: null,
  signIn: async () => {},
  logOut: async () => {},
  getToken: async () => null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function init() {
      try {
        const { onAuthStateChange } = await import('@/lib/firebase/auth');
        const { createSupabaseClient } = await import('@/lib/supabase/client');

        unsubscribe = onAuthStateChange(async (firebaseUser) => {
          setUser(firebaseUser);

          if (firebaseUser) {
            try {
              const supabase = createSupabaseClient();
              const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', firebaseUser.uid)
                .single();

              if (data) {
                setProfile(data as Profile);
              } else {
                const newProfile: Partial<Profile> = {
                  id: firebaseUser.uid,
                  email: firebaseUser.email,
                  display_name: firebaseUser.displayName,
                  avatar_url: firebaseUser.photoURL,
                  role: 'user',
                  xp_total: 0,
                  level: 1,
                };

                const { data: created } = await supabase
                  .from('profiles')
                  .upsert(newProfile)
                  .select()
                  .single();

                setProfile(created as Profile);
              }
            } catch (err) {
              console.error('Error loading profile:', err);
            }
          } else {
            setProfile(null);
          }

          setLoading(false);
        });
      } catch (err) {
        console.error('Firebase init error:', err);
        setError(err instanceof Error ? err.message : 'Error al inicializar autenticación');
        setLoading(false);
      }
    }

    init();
    return () => unsubscribe?.();
  }, []);

  const signIn = async () => {
    const { signInWithGoogle } = await import('@/lib/firebase/auth');
    await signInWithGoogle();
  };

  const logOut = async () => {
    const { signOut } = await import('@/lib/firebase/auth');
    await signOut();
    setProfile(null);
  };

  const getToken = async () => {
    const { getIdToken } = await import('@/lib/firebase/auth');
    return getIdToken();
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-zinc-900">
          <h2 className="mb-2 text-lg font-semibold text-red-600">Error de configuración</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{error}</p>
          <p className="mt-4 text-xs text-zinc-500">
            Verifica que las variables NEXT_PUBLIC_FIREBASE_* estén configuradas en Vercel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, signIn, logOut, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
