'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatTokens } from '@/lib/utils/tokens';
import type { PromptWithRelations } from '@/lib/types/database';

interface PromptTableProps {
  prompts: PromptWithRelations[];
  onCopy: (content: string) => void;
}

export function PromptTable({ prompts, onCopy }: PromptTableProps) {
  if (prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 py-16 dark:border-zinc-700">
        <p className="text-zinc-500">No se han encontrado prompts</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800">
            <th className="px-4 py-3 text-left font-medium text-zinc-500">Título</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-500">Uso</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-500">Colección</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-500">Tokens</th>
            <th className="px-4 py-3 text-left font-medium text-zinc-500">Likes / Usos</th>
            <th className="px-4 py-3 text-right font-medium text-zinc-500">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {prompts.map((prompt) => (
            <tr
              key={prompt.id}
              className="border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/prompts/${prompt.id}`}
                  className="font-medium text-zinc-900 hover:text-blue-600 dark:text-zinc-100"
                >
                  {prompt.title}
                </Link>
                <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
                  {prompt.current_version.slice(0, 120)}
                </p>
              </td>
              <td className="px-4 py-3">
                {prompt.usage && <Badge variant="blue">{prompt.usage.name}</Badge>}
              </td>
              <td className="px-4 py-3">
                {prompt.collection && (
                  <span className="text-zinc-600 dark:text-zinc-400">{prompt.collection.name}</span>
                )}
              </td>
              <td className="px-4 py-3 text-zinc-500">
                {prompt.tokens_estimated ? formatTokens(prompt.tokens_estimated) : '—'}
              </td>
              <td className="px-4 py-3 text-zinc-500">
                <span className="text-red-500">♥</span> {prompt.likes_count} · {prompt.usage_count} usos
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Link href={`/prompts/${prompt.id}`}>
                    <Button variant="ghost" size="sm">Ver</Button>
                  </Link>
                  <Link href={`/prompts/${prompt.id}/improve`}>
                    <Button variant="ghost" size="sm">CREATE</Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopy(prompt.current_version)}
                  >
                    Copiar
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
