import { NextResponse } from 'next/server';
import { getAuthenticatedClient } from '@/lib/api/auth';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, client, userId } = await getAuthenticatedClient(request);
  if (error) return error;

  const body = await request.json();
  const { reason, comment } = body;

  if (!reason) return NextResponse.json({ error: 'Motivo es requerido' }, { status: 400 });

  const { data: existing } = await client!
    .from('prompt_reports')
    .select('id')
    .eq('prompt_id', id)
    .eq('reporter_id', userId!)
    .eq('status', 'open')
    .maybeSingle();

  if (existing) return NextResponse.json({ error: 'Ya has reportado este prompt' }, { status: 409 });

  const { data, error: dbError } = await client!
    .from('prompt_reports')
    .insert({
      prompt_id: id,
      reporter_id: userId,
      reason,
      comment: comment || null,
    })
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({ data }, { status: 201 });
}
