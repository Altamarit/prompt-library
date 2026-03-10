'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';
import type { Profile } from '@/lib/types/database';

export default function AdminUsersPage() {
  const { apiFetch } = useApi();
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Use supabase directly via admin endpoint - for now list via profiles
      const token = await (await import('@/lib/firebase/auth')).getIdToken();
      const res = await fetch('/api/admin/users' + (search ? `?search=${search}` : ''), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data ?? []);
      }
    } catch {
      toast('Error al cargar', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Gestión de usuarios</h1>

      <div className="mb-4">
        <Input placeholder="Buscar por nombre o email..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Usuario</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Rol</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">XP</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Nivel</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Miembro desde</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-zinc-100 dark:border-zinc-800">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="h-8 w-8 rounded-full" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-medium dark:bg-zinc-700">
                          {u.display_name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{u.display_name ?? 'Sin nombre'}</p>
                        <p className="text-xs text-zinc-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === 'admin' ? 'purple' : 'default'}>{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">{u.xp_total}</td>
                  <td className="px-4 py-3 text-zinc-500">{u.level}</td>
                  <td className="px-4 py-3 text-zinc-500">{new Date(u.created_at).toLocaleDateString('es')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
