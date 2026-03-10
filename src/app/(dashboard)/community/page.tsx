'use client';

import { useCallback, useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { PromptTable } from '@/components/prompts/PromptTable';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';
import type { PromptWithRelations } from '@/lib/types/database';

export default function CommunityPage() {
  const { apiFetch } = useApi();
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<PromptWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const res = await apiFetch('/api/prompts?visibility=community&sort=likes');
      setPrompts(res.data ?? []);
    } catch {
      toast('Error al cargar', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiFetch, toast]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast('Copiado', 'success');
  };

  return (
    <div>
      <Header title="Comunidad" />
      <div className="p-6">
        <p className="mb-6 text-sm text-zinc-500">Los mejores prompts compartidos por la comunidad.</p>
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
