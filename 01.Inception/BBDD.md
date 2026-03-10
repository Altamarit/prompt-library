# Contexto de Base de Datos – Prompt Library (Supabase)

Este documento resume el modelo de datos para que Cursor entienda las tablas y relaciones del proyecto.

## 1. Visión general del modelo

- Base de datos: Postgres en Supabase (schema `public`).  
- Autenticación: Firebase Auth, integrado como Third‑Party Auth en Supabase.  
- Identidad: usamos el `sub` del JWT de Firebase como `profiles.id` (user_id lógico).  
- RLS: políticas basadas en `auth.jwt() ->> 'sub'` para filtrar por `owner_id` / `user_id`.

---

## 2. Tablas principales

### 2.1. `profiles`

Perfil de usuario, enlazado al `sub` de Firebase.

Campos:

- `id` (uuid, PK) → igual al `sub` del JWT de Firebase.  
- `email` (text)  
- `display_name` (text)  
- `avatar_url` (text)  
- `role` (text, default `'user'`) → `user` | `admin`.  
- `xp_total` (integer, default 0) → XP denormalizado.  
- `level` (integer, default 1)  
- `created_at` (timestamptz, default `now()`)

Uso:

- Identificar roles (user/admin) y acumular XP.

---

### 2.2. `usages`

Categorías de uso de los prompts (investigar, cocina, etc.).

Campos:

- `id` (uuid, PK, default `gen_random_uuid()`)  
- `name` (text, not null)  
- `description` (text)  
- `created_by` (uuid, FK → profiles.id, puede ser null si es global)  
- `created_at` (timestamptz, default `now()`)

---

### 2.3. `collections`

Agrupa prompts por tema/proyecto.

Campos:

- `id` (uuid, PK, default `gen_random_uuid()`)  
- `name` (text, not null)  
- `description` (text)  
- `owner_id` (uuid, FK → profiles.id, not null)  
- `is_public` (boolean, default false)  
- `created_at` (timestamptz, default `now()`)

---

### 2.4. `prompts`

Entidad central: cada prompt guardado.

Campos:

- `id` (uuid, PK, default `gen_random_uuid()`)  
- `owner_id` (uuid, FK → profiles.id, not null)  
- `usage_id` (uuid, FK → usages.id, null)  
- `collection_id` (uuid, FK → collections.id, null)

- `title` (text, not null)  
- `initial_version` (text, not null)  
- `current_version` (text, not null)

- `visibility` (text, default `'private'`)  
  - Valores lógicos: `'private'`, `'community'`.  
- `tokens_estimated` (integer, null)  

- `created_at` (timestamptz, default `now()`)  
- `last_used_at` (timestamptz, null)  
- `usage_count` (integer, default 0)  
- `likes_count` (integer, default 0)

- `total_sessions` (integer, default 0)  
- `successful_sessions` (integer, default 0)  
- `avg_iterations` (numeric, default 0)

Uso:

- Soporta dashboard, detalle, métricas básicas y filtros.

---

### 2.5. `prompt_versions`

Historial de versiones de un prompt.

Campos:

- `id` (uuid, PK, default `gen_random_uuid()`)  
- `prompt_id` (uuid, FK → prompts.id, not null)  
- `version_number` (integer, not null)  
- `content` (text, not null)  
- `tokens_estimated` (integer, null)  
- `note` (text, null)  
- `created_at` (timestamptz, default `now()`)

Uso:

- Al guardar con CREATE, podemos insertar una nueva versión.

---

### 2.6. `prompt_likes`

Likes de usuarios sobre prompts.

Campos:

- `id` (uuid, PK, default `gen_random_uuid()`)  
- `prompt_id` (uuid, FK → prompts.id, not null)  
- `user_id` (uuid, FK → profiles.id, not null)  
- `created_at` (timestamptz, default `now()`)

Restricción:

- Índice único `(prompt_id, user_id)` para un único like por usuario.

Relación con XP:

- Cada like genera un evento en `xp_events` para el autor del prompt.

---

### 2.7. `prompt_usage_logs`

Log de cada vez que se usa un prompt.

Campos:

- `id` (uuid, PK, default `gen_random_uuid()`)  
- `prompt_id` (uuid, FK → prompts.id, not null)  
- `user_id` (uuid, FK → profiles.id, not null)  
- `used_at` (timestamptz, default `now()`)  
- `context` (text, null) → origen del uso (ej. “chatgpt.com”, “gmail”).  
- `session_id` (uuid, null) → para agrupar usos en una misma sesión.

Uso:

- Servir métricas de:
  - `usage_count` (sum).  
  - `total_sessions` / `avg_iterations`.  
- Cada uso también genera un `xp_events` para el autor del prompt.

---

### 2.8. `xp_events`

Todos los cambios de XP.

Campos:

- `id` (uuid, PK, default `gen_random_uuid()`)  
- `user_id` (uuid, FK → profiles.id, not null)  
- `type` (text, not null)
  - Ejemplos: `prompt_created`, `prompt_used`, `like_received`, `milestone`, `prompt_deleted_due_to_report`.  
- `amount` (integer, not null) → positivo o negativo.  
- `source_prompt_id` (uuid, FK → prompts.id, null)  
- `metadata` (jsonb, null)  
- `created_at` (timestamptz, default `now()`)

Uso:

- `profiles.xp_total` puede derivarse de la suma de `amount`.  
- Panel admin puede ver historial de XP de cada usuario.

---

### 2.9. `prompt_reports`

Reportes de contenido problemático.

Campos:

- `id` (uuid, PK, default `gen_random_uuid()`)  
- `prompt_id` (uuid, FK → prompts.id, not null)  
- `reporter_id` (uuid, FK → profiles.id, not null)  
- `reason` (text, not null)  
- `comment` (text, null)  
- `status` (text, default `'open'`)
  - `open`, `resolved`, `rejected`.  
- `created_at` (timestamptz, default `now()`)  
- `resolved_at` (timestamptz, null)  
- `resolved_by` (uuid, FK → profiles.id, null)

Uso:

- Cola de moderación en `/admin/reportes`.  
- Al borrar un prompt por reportes, se crea un evento XP negativo para el autor.

---

### 2.10. `models`

Configuración de modelos LLM y precios.

Campos:

- `id` (uuid, PK, default `gen_random_uuid()`)  
- `name` (text, not null) → p.ej. `gpt-4o`.  
- `provider` (text, not null) → p.ej. `openai`.  
- `max_context_tokens` (integer, not null)  
- `input_price_per_million_tokens` (numeric, not null)  
- `output_price_per_million_tokens` (numeric, not null)  
- `is_active` (boolean, default true)  
- `is_default_reference` (boolean, default false)  
- `created_at` (timestamptz, default `now()`)

---

### 2.11. `prompt_model_stats` (opcional)

Métricas de coste por prompt y modelo.

Campos:

- `id` (uuid, PK, default `gen_random_uuid()`)  
- `prompt_id` (uuid, FK → prompts.id, not null)  
- `model_id` (uuid, FK → models.id, not null)  
- `estimated_input_tokens` (integer)  
- `estimated_cost_per_call` (numeric)  
- `estimated_cost_per_session` (numeric)  
- `updated_at` (timestamptz, default `now()`)

---

## 3. Relaciones principales

- `profiles` 1–N `prompts` (via `owner_id`).  
- `profiles` 1–N `collections` (via `owner_id`).  
- `usages` 1–N `prompts` (via `usage_id`).  
- `collections` 1–N `prompts` (via `collection_id`).  
- `prompts` 1–N `prompt_versions`.  
- `prompts` 1–N `prompt_likes`.  
- `profiles` 1–N `prompt_likes`.  
- `prompts` 1–N `prompt_usage_logs`.  
- `profiles` 1–N `prompt_usage_logs`.  
- `profiles` 1–N `xp_events`.  
- `prompts` 1–N `xp_events` (via `source_prompt_id`).  
- `prompts` 1–N `prompt_reports`.  
- `profiles` 1–N `prompt_reports` (reporter y resolved_by).  
- `models` 1–N `prompt_model_stats`.  
- `prompts` 1–N `prompt_model_stats`.

---

## 4. Ideas de RLS (nivel conceptual)

Para `prompts`:

- Usuarios ven:
  - Sus prompts (`owner_id = auth.jwt() ->> 'sub'`).  
  - Prompts con `visibility = 'community'`.  
- Admins ven todo (`profiles.role = 'admin'` para el `id` del JWT).

Para `prompt_likes` y `prompt_usage_logs`:

- Usuarios solo pueden leer y escribir sus propias filas (`user_id = auth.jwt() ->> 'sub'`).  
- Admins pueden ver todo para analítica.

---

## 5. Uso típico desde el código

- En el servidor (Next.js API / server components), se creará un cliente Supabase con `accessToken` = ID token de Firebase, para que Supabase aplique RLS en base a ese JWT.  
- En consultas para el dashboard:
  - `prompts` + joins con `usages`, `collections`, `profiles` (autor), más agregados de `prompt_likes` y `prompt_usage_logs` si hace falta.  
- En la extensión:
  - Se llamará a endpoints de la API que internamente usan estas tablas para crear prompts, registrar usos y likes.

Este contexto debería ser suficiente para que Cursor autogenere consultas, modelos TypeScript y hooks basados en estas tablas.
