import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/api/auth';

export async function GET(request: Request) {
  const { error, client } = await getAuthenticatedClient(request);
  if (error) return error;

  const { data, error: dbError } = await client!
    .from('usages')
    .select('*')
    .order('name');

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const { error, client, userId } = await getAuthenticatedClient(request);
  if (error) return error;

  const body = await request.json();
  const { name, description } = body;

  if (!name) return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 });

  const { data, error: dbError } = await client!
    .from('usages')
    .insert({ name, description: description || null, created_by: userId })
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
