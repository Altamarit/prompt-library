import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/api/auth';

export async function GET(request: Request) {
  const { error, client, userId } = await getAuthenticatedClient(request);
  if (error) return error;

  const { data: profile } = await client!.from('profiles').select('role').eq('id', userId!).single();
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: totalPrompts },
    { count: recentUsage },
    { count: recentLikes },
    { count: totalUsers },
    { data: topPrompts },
    { data: topUsers },
    { count: openReports },
  ] = await Promise.all([
    client!.from('prompts').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
    client!.from('prompt_usage_logs').select('*', { count: 'exact', head: true }).gte('used_at', sevenDaysAgo),
    client!.from('prompt_likes').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
    client!.from('profiles').select('*', { count: 'exact', head: true }),
    client!.from('prompts').select('id, title, usage_count, likes_count').eq('is_deleted', false).order('usage_count', { ascending: false }).limit(5),
    client!.from('profiles').select('id, display_name, xp_total').order('xp_total', { ascending: false }).limit(5),
    client!.from('prompt_reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
  ]);

  return NextResponse.json({
    totalPrompts: totalPrompts ?? 0,
    recentUsage: recentUsage ?? 0,
    recentLikes: recentLikes ?? 0,
    totalUsers: totalUsers ?? 0,
    openReports: openReports ?? 0,
    topPrompts: topPrompts ?? [],
    topUsers: topUsers ?? [],
  });
}
