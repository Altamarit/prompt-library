'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { PromptFilters } from '@/components/prompts/PromptFilters';
import { PromptTable } from '@/components/prompts/PromptTable';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';
import type { PromptWithRelations } from '@/lib/types/database';

export default function PromptsPage() {
  const { apiFetch } = useApi();
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<PromptWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    usage_id: '',
    collection_id: '',
    visibility: '',
    sort: 'recent',
  });

  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.usage_id) params.set('usage_id', filters.usage_id);
      if (filters.collection_id) params.set('collection_id', filters.collection_id);
      if (filters.visibility) params.set('visibility', filters.visibility);
      if (filters.sort) params.set('sort', filters.sort);

      const res = await apiFetch(`/api/prompts?${params}`);
      setPrompts(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error al cargar prompts', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiFetch, filters, toast]);

  useEffect(() => {
    const timeout = setTimeout(fetchPrompts, 300);
    return () => clearTimeout(timeout);
  }, [fetchPrompts]);

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast('Prompt copiado al portapapeles', 'success');
  };

  return (
    <div>
      <Header
        title="Mis prompts"
        actions={
          <Link href="/prompts/new">
            <Button>+ Nuevo prompt</Button>
          </Link>
        }
      />
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-white px-4 py-2 text-sm dark:bg-zinc-900">
            <span className="text-zinc-500">Total: </span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{total}</span>
          </div>
        </div>

        <PromptFilters filters={filters} onChange={setFilters} />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-blue-600" />
          </div>
        ) : (
          <PromptTable prompts={prompts} onCopy={handleCopy} />
        )}
      </div>
    </div>
  );
}
