import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/api/auth';

export async function GET(request: Request) {
  const { error, client, userId } = await getAuthenticatedClient(request);
  if (error) return error;

  const { data: profile } = await client!.from('profiles').select('role').eq('id', userId!).single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const url = new URL(request.url);
  const search = url.searchParams.get('search');

  let query = client!.from('profiles').select('*').order('created_at', { ascending: false });

  if (search) {
    query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error: dbError } = await query.limit(100);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ data });
}
