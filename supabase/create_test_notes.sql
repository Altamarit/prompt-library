-- Crear la tabla test_notes
-- Ejecuta este SQL en el Supabase Dashboard: SQL Editor

CREATE TABLE public.test_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.test_notes ENABLE ROW LEVEL SECURITY;

-- Políticas para desarrollo/pruebas (ajusta en producción)
CREATE POLICY "Allow public read" ON public.test_notes FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.test_notes FOR INSERT WITH CHECK (true);
