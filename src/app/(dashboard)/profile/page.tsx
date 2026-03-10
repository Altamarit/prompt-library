'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/components/auth/AuthProvider';
import { useApi } from '@/hooks/useApi';
import type { XpEvent } from '@/lib/types/database';

export default function ProfilePage() {
  const { profile } = useAuth();
  const { apiFetch } = useApi();
  const [xpEvents, setXpEvents] = useState<XpEvent[]>([]);

  useEffect(() => {
    // XP events would need a dedicated endpoint; for now show profile info
  }, [apiFetch]);

  if (!profile) return null;

  const xpToNextLevel = profile.level * 100;
  const progress = Math.min((profile.xp_total / xpToNextLevel) * 100, 100);

  return (
    <div>
      <Header title="Perfil" />
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <div className="flex items-center gap-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-20 w-20 rounded-full" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
              {profile.display_name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{profile.display_name}</h2>
            <p className="text-sm text-zinc-500">{profile.email}</p>
            <div className="mt-2 flex gap-2">
              <Badge variant="blue">Nivel {profile.level}</Badge>
              <Badge variant="purple">{profile.xp_total} XP</Badge>
              <Badge variant={profile.role === 'admin' ? 'red' : 'default'}>{profile.role}</Badge>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-3 text-sm font-medium text-zinc-500">Progreso al siguiente nivel</h3>
          <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            {profile.xp_total} / {xpToNextLevel} XP para nivel {profile.level + 1}
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-3 text-sm font-medium text-zinc-500">Miembro desde</h3>
          <p className="text-zinc-900 dark:text-zinc-100">
            {new Date(profile.created_at).toLocaleDateString('es', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
