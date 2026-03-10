'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';
import { formatTokens, estimateCost } from '@/lib/utils/tokens';
import type { PromptWithRelations, Model } from '@/lib/types/database';

export default function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { apiFetch } = useApi();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState<PromptWithRelations | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  const fetchPrompt = useCallback(async () => {
    try {
      const res = await apiFetch(`/api/prompts/${id}`);
      setPrompt(res.data);
      setLiked(res.data.user_has_liked ?? false);
    } catch {
      toast('Error al cargar el prompt', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, apiFetch, toast]);

  useEffect(() => {
    fetchPrompt();
    apiFetch('/api/usages').catch(() => {});
  }, [fetchPrompt, apiFetch]);

  useEffect(() => {
    fetch('/api/models')
      .then(() => {})
      .catch(() => {});
  }, []);

  const handleCopy = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt.current_version);
    toast('Prompt copiado', 'success');

    try {
      await apiFetch('/api/prompts/use', {
        method: 'POST',
        body: JSON.stringify({ prompt_id: id }),
      });
    } catch {}
  };

  const handleLike = async () => {
    if (!prompt) return;
    try {
      if (liked) {
        const res = await apiFetch(`/api/prompts/${id}/like`, { method: 'DELETE' });
        setPrompt({ ...prompt, likes_count: res.likes_count });
        setLiked(false);
      } else {
        const res = await apiFetch(`/api/prompts/${id}/like`, { method: 'POST' });
        setPrompt({ ...prompt, likes_count: res.likes_count });
        setLiked(true);
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-blue-600" />
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">Prompt no encontrado</p>
        <Link href="/prompts"><Button variant="secondary">Volver</Button></Link>
      </div>
    );
  }

  const tokens = prompt.tokens_estimated ?? 0;

  return (
    <div>
      <Header
        title={prompt.title}
        actions={
          <div className="flex gap-2">
            <Link href={`/prompts/${id}/improve`}>
              <Button>Mejorar (CREATE)</Button>
            </Link>
            <Button variant="secondary" onClick={handleCopy}>Copiar prompt</Button>
          </div>
        }
      />
      <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-sm font-medium text-zinc-500">Versión actual</h2>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-900 dark:text-zinc-100">
              {prompt.current_version}
            </pre>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-sm font-medium text-zinc-500">Información</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-500">Creador: </span>
                <span className="text-zinc-900 dark:text-zinc-100">{prompt.owner?.display_name ?? 'Desconocido'}</span>
              </div>
              <div>
                <span className="text-zinc-500">Creado: </span>
                <span className="text-zinc-900 dark:text-zinc-100">{new Date(prompt.created_at).toLocaleDateString('es')}</span>
              </div>
              <div>
                <span className="text-zinc-500">Último uso: </span>
                <span className="text-zinc-900 dark:text-zinc-100">
                  {prompt.last_used_at ? new Date(prompt.last_used_at).toLocaleDateString('es') : 'Nunca'}
                </span>
              </div>
              <div className="flex gap-2">
                {prompt.usage && <Badge variant="blue">{prompt.usage.name}</Badge>}
                {prompt.collection && <Badge>{prompt.collection.name}</Badge>}
                <Badge variant={prompt.visibility === 'community' ? 'green' : 'default'}>
                  {prompt.visibility === 'community' ? 'Público' : 'Privado'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-sm font-medium text-zinc-500">Tokens y coste</h2>
            <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{formatTokens(tokens)}</p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-sm font-medium text-zinc-500">Eficiencia</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-zinc-500">Iteraciones medias: </span>{Number(prompt.avg_iterations).toFixed(1)}</p>
              <p><span className="text-zinc-500">Sesiones: </span>{prompt.total_sessions}</p>
              <p><span className="text-zinc-500">Tasa de éxito: </span>
                {prompt.total_sessions > 0
                  ? `${((prompt.successful_sessions / prompt.total_sessions) * 100).toFixed(0)}%`
                  : 'Sin datos'}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-sm font-medium text-zinc-500">Social</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  liked
                    ? 'bg-red-50 text-red-600 dark:bg-red-900/20'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {liked ? '♥' : '♡'} {prompt.likes_count}
              </button>
              <span className="text-sm text-zinc-500">{prompt.usage_count} usos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
