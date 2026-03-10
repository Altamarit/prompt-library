import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function getAuthenticatedClient(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }), client: null, userId: null };
  }

  const token = authHeader.slice(7);

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub || payload.user_id;
    if (!userId) {
      return { error: NextResponse.json({ error: 'Token inválido' }, { status: 401 }), client: null, userId: null };
    }

    const client = createServerSupabaseClient(token);
    return { error: null, client, userId };
  } catch {
    return { error: NextResponse.json({ error: 'Token inválido' }, { status: 401 }), client: null, userId: null };
  }
}
