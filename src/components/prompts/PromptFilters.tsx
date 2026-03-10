'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useApi } from '@/hooks/useApi';
import type { Usage, Collection } from '@/lib/types/database';

interface Filters {
  search: string;
  usage_id: string;
  collection_id: string;
  visibility: string;
  sort: string;
}

interface PromptFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function PromptFilters({ filters, onChange }: PromptFiltersProps) {
  const { apiFetch } = useApi();
  const [usages, setUsages] = useState<Usage[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    apiFetch('/api/usages').then((r) => setUsages(r.data ?? [])).catch(() => {});
    apiFetch('/api/collections').then((r) => setCollections(r.data ?? [])).catch(() => {});
  }, [apiFetch]);

  const update = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => value && key !== 'sort'
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por título o contenido..."
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
          />
        </div>
        <Select
          options={usages.map((u) => ({ value: u.id, label: u.name }))}
          placeholder="Uso"
          value={filters.usage_id}
          onChange={(e) => update('usage_id', e.target.value)}
        />
        <Select
          options={collections.map((c) => ({ value: c.id, label: c.name }))}
          placeholder="Colección"
          value={filters.collection_id}
          onChange={(e) => update('collection_id', e.target.value)}
        />
        <Select
          options={[
            { value: '', label: 'Todos' },
            { value: 'mine', label: 'Solo míos' },
            { value: 'community', label: 'Comunidad' },
          ]}
          value={filters.visibility}
          onChange={(e) => update('visibility', e.target.value)}
        />
        <Select
          options={[
            { value: 'recent', label: 'Más recientes' },
            { value: 'likes', label: 'Más likes' },
            { value: 'usage', label: 'Más usados' },
            { value: 'efficient', label: 'Más eficientes' },
          ]}
          value={filters.sort}
          onChange={(e) => update('sort', e.target.value)}
        />
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map(([key, value]) => (
            <button
              key={key}
              onClick={() => update(key as keyof Filters, '')}
              className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
            >
              {key}: {value.length > 20 ? value.slice(0, 20) + '...' : value}
              <span className="ml-1">×</span>
            </button>
          ))}
          <button
            onClick={() =>
              onChange({ search: '', usage_id: '', collection_id: '', visibility: '', sort: 'recent' })
            }
            className="text-xs text-zinc-500 hover:text-zinc-700"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
