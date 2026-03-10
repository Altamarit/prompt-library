'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';

interface ReportGroup {
  prompt_id: string;
  prompt_title: string;
  prompt_owner: string;
  report_count: number;
  latest_reason: string;
  latest_date: string;
}

export default function AdminReportesPage() {
  const { apiFetch } = useApi();
  const { toast } = useToast();
  const [reports, setReports] = useState<ReportGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch open reports grouped by prompt
      const res = await apiFetch('/api/prompts?visibility=community');
      // For now, show prompts that might have reports - a real implementation would use a dedicated admin endpoint
      setReports([]);
    } catch {
      toast('Error al cargar', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiFetch, toast]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleKeep = async (promptId: string) => {
    try {
      await apiFetch(`/api/admin/prompts/${promptId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'keep' }),
      });
      toast('Reporte rechazado, prompt mantenido', 'success');
      fetchReports();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  const handleDelete = async (promptId: string) => {
    if (!confirm('¿Borrar este prompt y penalizar XP al autor?')) return;
    try {
      await apiFetch(`/api/admin/prompts/${promptId}`, { method: 'DELETE' });
      toast('Prompt borrado y XP penalizado', 'success');
      fetchReports();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Moderación de reportes</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-purple-600" />
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-16 dark:border-zinc-700">
          <p className="text-zinc-500">No hay reportes abiertos</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r.prompt_id} className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{r.prompt_title}</h3>
                  <p className="mt-1 text-sm text-zinc-500">Autor: {r.prompt_owner}</p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="red">{r.report_count} reportes</Badge>
                    <Badge>{r.latest_reason}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleKeep(r.prompt_id)}>
                    Mantener
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(r.prompt_id)}>
                    Borrar + Penalizar XP
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
