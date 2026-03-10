import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/api/auth';
import { estimateTokens } from '@/lib/utils/tokens';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, client, userId } = await getAuthenticatedClient(request);
  if (error) return error;

  const { data, error: dbError } = await client!
    .from('prompts')
    .select('*, owner:profiles!owner_id(*), usage:usages!usage_id(*), collection:collections!collection_id(*)')
    .eq('id', id)
    .eq('is_deleted', false)
    .single();

  if (dbError) return NextResponse.json({ error: 'Prompt no encontrado' }, { status: 404 });

  const { data: liked } = await client!
    .from('prompt_likes')
    .select('id')
    .eq('prompt_id', id)
    .eq('user_id', userId!)
    .maybeSingle();

  return NextResponse.json({ data: { ...data, user_has_liked: !!liked } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, client, userId } = await getAuthenticatedClient(request);
  if (error) return error;

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.title !== undefined) updates.title = body.title;
  if (body.current_version !== undefined) {
    updates.current_version = body.current_version;
    updates.tokens_estimated = estimateTokens(body.current_version);
  }
  if (body.usage_id !== undefined) updates.usage_id = body.usage_id || null;
  if (body.collection_id !== undefined) updates.collection_id = body.collection_id || null;
  if (body.visibility !== undefined) updates.visibility = body.visibility;

  const { data, error: dbError } = await client!
    .from('prompts')
    .update(updates)
    .eq('id', id)
    .eq('owner_id', userId!)
    .select('*, owner:profiles!owner_id(*), usage:usages!usage_id(*), collection:collections!collection_id(*)')
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'No autorizado o prompt no encontrado' }, { status: 403 });

  return NextResponse.json({ data });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, client, userId } = await getAuthenticatedClient(request);
  if (error) return error;

  const { error: dbError } = await client!
    .from('prompts')
    .update({ is_deleted: true })
    .eq('id', id)
    .eq('owner_id', userId!);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
