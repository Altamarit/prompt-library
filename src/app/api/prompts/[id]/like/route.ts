import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/api/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, client, userId } = await getAuthenticatedClient(request);
  if (error) return error;

  const { data: prompt } = await client!
    .from('prompts')
    .select('owner_id, likes_count')
    .eq('id', id)
    .single();

  if (!prompt) return NextResponse.json({ error: 'Prompt no encontrado' }, { status: 404 });

  const { error: insertError } = await client!
    .from('prompt_likes')
    .insert({ prompt_id: id, user_id: userId });

  if (insertError) {
    if (insertError.code === '23505') {
      return NextResponse.json({ error: 'Ya has dado like' }, { status: 409 });
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const newCount = prompt.likes_count + 1;
  await client!.from('prompts').update({ likes_count: newCount }).eq('id', id);

  if (prompt.owner_id !== userId) {
    await client!.from('xp_events').insert({
      user_id: prompt.owner_id,
      type: 'like_received',
      amount: 5,
      source_prompt_id: id,
    });
  }

  return NextResponse.json({ likes_count: newCount });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, client, userId } = await getAuthenticatedClient(request);
  if (error) return error;

  const { error: deleteError } = await client!
    .from('prompt_likes')
    .delete()
    .eq('prompt_id', id)
    .eq('user_id', userId!);

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

  const { data: prompt } = await client!
    .from('prompts')
    .select('likes_count')
    .eq('id', id)
    .single();

  const newCount = Math.max(0, (prompt?.likes_count ?? 1) - 1);
  await client!.from('prompts').update({ likes_count: newCount }).eq('id', id);

  return NextResponse.json({ likes_count: newCount });
}
