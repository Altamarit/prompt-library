'use client';

import { useCallback, useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/components/ui/Toast';
import type { Collection } from '@/lib/types/database';

export default function CollectionsPage() {
  const { apiFetch } = useApi();
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const fetchCollections = useCallback(async () => {
    try {
      const res = await apiFetch('/api/collections');
      setCollections(res.data ?? []);
    } catch {
      toast('Error al cargar', 'error');
    } finally {
      setLoading(false);
    }
  }, [apiFetch, toast]);

  useEffect(() => { fetchCollections(); }, [fetchCollections]);

  const handleCreate = async () => {
    if (!newName) return;
    try {
      await apiFetch('/api/collections', {
        method: 'POST',
        body: JSON.stringify({ name: newName }),
      });
      toast('Colección creada', 'success');
      setShowCreate(false);
      setNewName('');
      fetchCollections();
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error', 'error');
    }
  };

  return (
    <div>
      <Header
        title="Colecciones"
        actions={<Button onClick={() => setShowCreate(true)}>+ Nueva colección</Button>}
      />
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-blue-600" />
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-16 dark:border-zinc-700">
            <p className="text-zinc-500">No tienes colecciones todavía</p>
            <Button className="mt-4" onClick={() => setShowCreate(true)}>Crear tu primera colección</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c) => (
              <div key={c.id} className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{c.name}</h3>
                {c.description && <p className="mt-1 text-sm text-zinc-500">{c.description}</p>}
                <p className="mt-2 text-xs text-zinc-400">
                  {c.is_public ? 'Pública' : 'Privada'} · {new Date(c.created_at).toLocaleDateString('es')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Nueva colección">
        <div className="space-y-4">
          <Input label="Nombre" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ej.: Recetas, Proyectos..." />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={handleCreate}>Crear</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
