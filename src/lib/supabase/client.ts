import { createClient } from '@supabase/supabase-js';
import { getIdToken } from '@/lib/firebase/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    accessToken: async () => {
      const token = await getIdToken();
      return token ?? '';
    },
  });
}

export const supabase = createSupabaseClient();
