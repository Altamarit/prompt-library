'use client';

import { useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

export function useApi() {
  const { getToken } = useAuth();

  const apiFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const token = await getToken();
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error en la petición');
      return json;
    },
    [getToken]
  );

  return { apiFetch };
}
