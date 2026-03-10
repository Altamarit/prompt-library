-- Prompt Library: Seed Data
-- Run after 001_schema.sql

-- Default usage categories
INSERT INTO public.usages (name, description) VALUES
  ('Investigar', 'Prompts para investigación y análisis de información'),
  ('Coding', 'Prompts para programación y desarrollo de software'),
  ('Cocina', 'Prompts para recetas y técnicas culinarias'),
  ('Marketing', 'Prompts para estrategias de marketing y copywriting'),
  ('Escritura', 'Prompts para redacción creativa y profesional'),
  ('Educación', 'Prompts para enseñanza y aprendizaje'),
  ('Diseño', 'Prompts para diseño gráfico, UX/UI y creatividad visual'),
  ('Negocios', 'Prompts para estrategia empresarial y análisis de negocio'),
  ('Productividad', 'Prompts para organización personal y eficiencia'),
  ('Otro', 'Otros usos no categorizados');

-- Default LLM models with approximate pricing (as of early 2026)
INSERT INTO public.models (name, provider, max_context_tokens, input_price_per_million_tokens, output_price_per_million_tokens, is_active, is_default_reference) VALUES
  ('GPT-4o',       'openai',    128000, 2.50,  10.00, true, true),
  ('GPT-4o mini',  'openai',    128000, 0.15,   0.60, true, false),
  ('GPT-4.1',      'openai',   1048576, 2.00,   8.00, true, false),
  ('Claude 4 Sonnet', 'anthropic', 200000, 3.00, 15.00, true, false),
  ('Claude 4 Haiku',  'anthropic', 200000, 0.80,  4.00, true, false),
  ('Gemini 2.5 Pro',  'google',  1048576, 1.25,  10.00, true, false),
  ('Gemini 2.5 Flash', 'google', 1048576, 0.15,   0.60, true, false);

-- Drop test table if exists (from initial setup)
DROP TABLE IF EXISTS public.test_notes;
