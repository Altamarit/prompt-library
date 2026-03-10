import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/api/auth';
import { estimateTokens } from '@/lib/utils/tokens';

export async function GET(request: Request) {
  const { error, client, userId } = await getAuthenticatedClient(request);
  if (error) return error;

  const url = new URL(request.url);
  const search = url.searchParams.get('search') ?? '';
  const usageId = url.searchParams.get('usage_id');
  const collectionId = url.searchParams.get('collection_id');
  const visibility = url.searchParams.get('visibility');
  const sort = url.searchParams.get('sort') ?? 'recent';
  const page = parseInt(url.searchParams.get('page') ?? '1');
  const limit = parseInt(url.searchParams.get('limit') ?? '20');
  const offset = (page - 1) * limit;

  let query = client!
    .from('prompts')
    .select('*, owner:profiles!owner_id(id, display_name, avatar_url), usage:usages!usage_id(id, name), collection:collections!collection_id(id, name)', { count: 'exact' })
    .eq('is_deleted', false);

  if (visibility === 'mine') {
    query = query.eq('owner_id', userId!);
  } else if (visibility === 'community') {
    query = query.eq('visibility', 'community');
  } else {
    query = query.or(`owner_id.eq.${userId},visibility.eq.community`);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,current_version.ilike.%${search}%`);
  }
  if (usageId) query = query.eq('usage_id', usageId);
  if (collectionId) query = query.eq('collection_id', collectionId);

  switch (sort) {
    case 'likes': query = query.order('likes_count', { ascending: false }); break;
    case 'usage': query = query.order('usage_count', { ascending: false }); break;
    case 'efficient': query = query.order('avg_iterations', { ascending: true }); break;
    default: query = query.order('created_at', { ascending: false });
  }

  const { data, error: dbError, count } = await query.range(offset, offset + limit - 1);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({ data, total: count, page, limit });
}

export async function POST(request: Request) {
  const { error, client, userId } = await getAuthenticatedClient(request);
  if (error) return error;

  const body = await request.json();
  const { title, content, usage_id, collection_id, visibility } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'Título y contenido son requeridos' }, { status: 400 });
  }

  const tokens = estimateTokens(content);

  const { data, error: dbError } = await client!
    .from('prompts')
    .insert({
      owner_id: userId,
      title,
      initial_version: content,
      current_version: content,
      usage_id: usage_id || null,
      collection_id: collection_id || null,
      visibility: visibility || 'private',
      tokens_estimated: tokens,
    })
    .select('*, owner:profiles!owner_id(id, display_name, avatar_url), usage:usages!usage_id(id, name), collection:collections!collection_id(id, name)')
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  await client!.from('xp_events').insert({
    user_id: userId,
    type: 'prompt_created',
    amount: 10,
    source_prompt_id: data.id,
  });

  await client!
    .from('profiles')
    .update({ xp_total: (await client!.from('profiles').select('xp_total').eq('id', userId!).single()).data?.xp_total + 10 })
    .eq('id', userId!);

  return NextResponse.json({ data }, { status: 201 });
}
