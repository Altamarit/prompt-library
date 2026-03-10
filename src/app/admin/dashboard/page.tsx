'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';

interface Stats {
  totalPrompts: number;
  recentUsage: number;
  recentLikes: number;
  totalUsers: number;
  openReports: number;
  topPrompts: { id: string; title: string; usage_count: number; likes_count: number }[];
  topUsers: { id: string; display_name: string; xp_total: number }[];
}

export default function AdminDashboard() {
  const { apiFetch } = useApi();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiFetch('/api/admin/stats').then(setStats).catch(() => {});
  }, [apiFetch]);

  if (!stats) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-purple-600" />
      </div>
    );
  }

  const kpis = [
    { label: 'Prompts totales', value: stats.totalPrompts },
    { label: 'Usos (7 días)', value: stats.recentUsage },
    { label: 'Likes (7 días)', value: stats.recentLikes },
    { label: 'Usuarios', value: stats.totalUsers },
    { label: 'Reportes abiertos', value: stats.openReports },
  ];

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard Admin</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm text-zinc-500">{kpi.label}</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-sm font-medium text-zinc-500">Top 5 prompts por usos</h2>
          <div className="space-y-3">
            {stats.topPrompts.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                    {i + 1}
                  </span>
                  <span className="text-sm text-zinc-900 dark:text-zinc-100">{p.title}</span>
                </div>
                <span className="text-sm text-zinc-500">{p.usage_count} usos</span>
              </div>
            ))}
            {stats.topPrompts.length === 0 && <p className="text-sm text-zinc-400">Sin datos</p>}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-sm font-medium text-zinc-500">Top 5 usuarios por XP</h2>
          <div className="space-y-3">
            {stats.topUsers.map((u, i) => (
              <div key={u.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    {i + 1}
                  </span>
                  <span className="text-sm text-zinc-900 dark:text-zinc-100">{u.display_name ?? 'Anónimo'}</span>
                </div>
                <span className="text-sm text-zinc-500">{u.xp_total} XP</span>
              </div>
            ))}
            {stats.topUsers.length === 0 && <p className="text-sm text-zinc-400">Sin datos</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
