import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/api/auth';

export async function POST(request: Request) {
  const { error, client, userId } = await getAuthenticatedClient(request);
  if (error) return error;

  const body = await request.json();
  const { prompt_id, context, session_id } = body;

  if (!prompt_id) return NextResponse.json({ error: 'prompt_id es requerido' }, { status: 400 });

  await client!.from('prompt_usage_logs').insert({
    prompt_id,
    user_id: userId,
    context: context || null,
    session_id: session_id || null,
  });

  const { data: prompt } = await client!
    .from('prompts')
    .select('usage_count, owner_id')
    .eq('id', prompt_id)
    .single();

  if (prompt) {
    await client!.from('prompts').update({
      usage_count: prompt.usage_count + 1,
      last_used_at: new Date().toISOString(),
    }).eq('id', prompt_id);

    if (prompt.owner_id !== userId) {
      await client!.from('xp_events').insert({
        user_id: prompt.owner_id,
        type: 'prompt_used',
        amount: 2,
        source_prompt_id: prompt_id,
      });
    }
  }

  return NextResponse.json({ success: true });
}
