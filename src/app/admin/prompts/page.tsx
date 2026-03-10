'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';
import type { PromptWithRelations } from '@/lib/types/database';

export default function AdminPromptsPage() {
  const { apiFetch } = useApi();
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<PromptWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await apiFetch(`/api/prompts?${params}`);
      setPrompts(res.data ?? []);
    } catch {
      toast('Error al cargar', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiFetch, search, toast]);

  useEffect(() => {
    const t = setTimeout(fetchPrompts, 300);
    return () => clearTimeout(t);
  }, [fetchPrompts]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Borrar este prompt y penalizar XP al autor?')) return;
    try {
      await apiFetch(`/api/admin/prompts/${id}`, { method: 'DELETE' });
      toast('Prompt borrado y XP penalizado', 'success');
      fetchPrompts();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Gestión de prompts</h1>

      <div className="mb-4">
        <Input placeholder="Buscar por título..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-purple-600" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Título</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Autor</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Visibilidad</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Likes / Usos</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {prompts.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-3">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{p.title}</span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{p.owner?.display_name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.visibility === 'community' ? 'green' : 'default'}>{p.visibility}</Badge>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">♥ {p.likes_count} · {p.usage_count} usos</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)}>Borrar</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
