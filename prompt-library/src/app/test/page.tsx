import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default async function TestPage() {
  const { data, error } = await supabase.from('test_notes').select('*')

  return (
    <div className="min-h-screen p-8 bg-zinc-50 dark:bg-zinc-900">
      <Link href="/" className="text-blue-600 hover:underline mb-4 block">
        ← Volver al inicio
      </Link>
      <h1 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
        Test Supabase
      </h1>
      {error ? (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-800 dark:text-red-200">
          <p className="font-semibold">Error:</p>
          <pre className="mt-2 overflow-auto">{JSON.stringify(error, null, 2)}</pre>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-green-600 dark:text-green-400 font-medium">✓ Conexión exitosa</p>
          {!data?.length ? (
            <p className="text-zinc-600 dark:text-zinc-400">
              La tabla está vacía. Añade registros desde el Supabase Dashboard → Table Editor.
            </p>
          ) : (
            <pre className="p-4 bg-white dark:bg-zinc-800 rounded-lg overflow-auto text-sm text-zinc-900 dark:text-zinc-100">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
