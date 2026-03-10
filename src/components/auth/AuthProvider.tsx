'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChange, signInWithGoogle, signOut, getIdToken } from '@/lib/firebase/auth';
import { createSupabaseClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  logOut: async () => {},
  getToken: async () => null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
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
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    await signInWithGoogle();
  };

  const logOut = async () => {
    await signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logOut, getToken: getIdToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
