import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/api/auth';

async function isAdmin(client: ReturnType<typeof import('@/lib/supabase/server').createServerSupabaseClient>, userId: string) {
  const { data } = await client.from('profiles').select('role').eq('id', userId).single();
  return data?.role === 'admin';
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, client, userId } = await getAuthenticatedClient(request);
  if (error) return error;

  if (!(await isAdmin(client!, userId!))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { data: prompt } = await client!
    .from('prompts')
    .select('owner_id')
    .eq('id', id)
    .single();

  if (!prompt) return NextResponse.json({ error: 'Prompt no encontrado' }, { status: 404 });

  await client!.from('prompts').update({ is_deleted: true }).eq('id', id);

  await client!.from('prompt_reports')
    .update({ status: 'resolved', resolved_at: new Date().toISOString(), resolved_by: userId })
    .eq('prompt_id', id)
    .eq('status', 'open');

  await client!.from('xp_events').insert({
    user_id: prompt.owner_id,
    type: 'prompt_deleted_due_to_report',
    amount: -50,
    source_prompt_id: id,
  });

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, client, userId } = await getAuthenticatedClient(request);
  if (error) return error;

  if (!(await isAdmin(client!, userId!))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const body = await request.json();

  if (body.action === 'keep') {
    await client!.from('prompt_reports')
      .update({ status: 'rejected', resolved_at: new Date().toISOString(), resolved_by: userId })
      .eq('prompt_id', id)
      .eq('status', 'open');
    return NextResponse.json({ success: true });
  }

  const updates: Record<string, unknown> = {};
  if (body.visibility !== undefined) updates.visibility = body.visibility;
  if (body.is_deleted !== undefined) updates.is_deleted = body.is_deleted;

  if (Object.keys(updates).length > 0) {
    await client!.from('prompts').update(updates).eq('id', id);
  }

  return NextResponse.json({ success: true });
}
