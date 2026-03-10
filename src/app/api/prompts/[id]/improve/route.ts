import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/api/auth';
import { estimateTokens } from '@/lib/utils/tokens';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, client, userId } = await getAuthenticatedClient(request);
  if (error) return error;

  const body = await request.json();
  const { content, note } = body;

  if (!content) return NextResponse.json({ error: 'Contenido es requerido' }, { status: 400 });

  const { data: prompt } = await client!
    .from('prompts')
    .select('owner_id')
    .eq('id', id)
    .eq('owner_id', userId!)
    .single();

  if (!prompt) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });

  const { data: lastVersion } = await client!
    .from('prompt_versions')
    .select('version_number')
    .eq('prompt_id', id)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  const newVersionNumber = (lastVersion?.version_number ?? 0) + 1;
  const tokens = estimateTokens(content);

  await client!.from('prompt_versions').insert({
    prompt_id: id,
    version_number: newVersionNumber,
    content,
    tokens_estimated: tokens,
    note: note || null,
  });

  const { data: updated, error: updateError } = await client!
    .from('prompts')
    .update({ current_version: content, tokens_estimated: tokens })
    .eq('id', id)
    .select('*, owner:profiles!owner_id(*), usage:usages!usage_id(*), collection:collections!collection_id(*)')
    .single();

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ data: updated });
}
