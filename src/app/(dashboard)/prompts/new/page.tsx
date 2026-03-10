'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';
import { estimateTokens, formatTokens } from '@/lib/utils/tokens';
import type { Usage, Collection } from '@/lib/types/database';

export default function NewPromptPage() {
  const router = useRouter();
  const { apiFetch } = useApi();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [usages, setUsages] = useState<Usage[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [usageId, setUsageId] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [visibility, setVisibility] = useState('private');

  const tokens = estimateTokens(content);

  useEffect(() => {
    apiFetch('/api/usages').then((r) => setUsages(r.data ?? [])).catch(() => {});
    apiFetch('/api/collections').then((r) => setCollections(r.data ?? [])).catch(() => {});
  }, [apiFetch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      toast('Título y contenido son requeridos', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch('/api/prompts', {
        method: 'POST',
        body: JSON.stringify({
          title,
          content,
          usage_id: usageId || undefined,
          collection_id: collectionId || undefined,
          visibility,
        }),
      });
      toast('Prompt creado correctamente', 'success');
      router.push(`/prompts/${res.data.id}`);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al crear', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Header title="Nuevo prompt" />
      <div className="mx-auto max-w-3xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Título"
            id="title"
            placeholder="Nombre descriptivo del prompt"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Contenido del prompt
            </label>
            <textarea
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              rows={10}
              placeholder="Escribe o pega tu prompt aquí..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <p className="text-xs text-zinc-500">{formatTokens(tokens)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Uso"
              id="usage"
              options={usages.map((u) => ({ value: u.id, label: u.name }))}
              placeholder="Selecciona un uso"
              value={usageId}
              onChange={(e) => setUsageId(e.target.value)}
            />
            <Select
              label="Colección"
              id="collection"
              options={collections.map((c) => ({ value: c.id, label: c.name }))}
              placeholder="Selecciona una colección"
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
            />
          </div>

          <Select
            label="Visibilidad"
            id="visibility"
            options={[
              { value: 'private', label: 'Privado' },
              { value: 'community', label: 'Comunidad' },
            ]}
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
          />

          <div className="flex gap-3">
            <Button type="submit" loading={saving}>
              Guardar prompt
            </Button>
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
