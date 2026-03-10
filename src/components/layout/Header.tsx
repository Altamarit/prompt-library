'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  const { logOut } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{title}</h1>
      <div className="flex items-center gap-3">
        {actions}
        <Button variant="ghost" size="sm" onClick={logOut}>
          Cerrar sesión
        </Button>
      </div>
    </header>
  );
}
