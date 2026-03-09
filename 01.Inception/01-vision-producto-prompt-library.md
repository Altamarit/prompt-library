# Prompt Library – Visión de Producto

## 1. Visión general

- **Producto**: Librería de prompts colaborativa con extensión de navegador, gamificación y panel de administración.[web:42][web:46]  
- **Objetivo**: 
  - Organizar y reutilizar prompts de manera estructurada (uso + colección + versiones).
  - Mejorar la calidad y eficiencia de los prompts (regla CREATE + métricas de tokens/coste).
  - Fomentar una comunidad que comparte y mejora prompts, con reputación (XP, medallas).

- **Stack técnico**:
  - **Frontend**: Next.js (App Router, TypeScript) con código en `src/`.[web:129][web:139]
  - **Backend / BBDD**: Supabase (Postgres + RLS) para datos y analítica.[web:3][web:5]
  - **Autenticación**: Firebase Auth como proveedor de identidad.[web:24][web:48]
  - **Infra**: Vercel para despliegue de la app Next.js.[web:129]
  - **Extensión**: Chrome/Chromium (y potencialmente otros navegadores) usando `chrome.contextMenus`.[web:38][web:40]

---

## 2. Usuarios y comunidad

### Tipos de usuarios

- **Usuario normal (`user`)**:
  - Crea, mejora y organiza sus prompts.
  - Puede compartir prompts/colecciones con la comunidad.
  - Puede dar likes, usar prompts de otros y reportar contenido.

- **Administrador (`admin`)**:
  - Tiene acceso a un panel `/admin`.
  - Puede ver, editar y borrar prompts (especialmente los públicos).
  - Puede gestionar usuarios y revisar reportes.
  - Accede a dashboards de métricas (actividad, XP, rankings).[web:61][web:64]

### Enfoque de comunidad

- Peso de comunidad **medio**:
  - Uso principal: librería personal y de equipo.
  - Pero con la opción de hacer prompts/colecciones públicas y navegar los mejores de la comunidad (likes, usos, XP).[web:56][web:58]
- Comunidad con reputación:
  - Gamificación basada en XP, likes, usos y eficiencia de los prompts.[web:70][web:74][web:81]

---

## 3. Modelo funcional de prompts

### 3.1 Entidades principales

**Prompt**

- Atributos clave:
  - `usage` (categoría de uso: investigar, cocina, coding…).[web:41][web:54]
  - `collection` (agrupación temática: libros, vídeos, recetas, proyectos…).[web:41][web:54]
  - `initial_version` (texto original del prompt).
  - `current_version` (versión actual optimizada).
  - `created_at` (fecha de creación).
  - `last_used_at` (fecha de último uso).
  - `usage_count` (nº de usos totales).
  - `likes_count` (nº de likes recibidos).[web:77][web:78]
  - Métricas adicionales (ver apartado 4):
    - `tokens_estimated`.
    - Métricas de sesiones (nº de sesiones, iteraciones medias, tasa de éxito, coste efectivo).

**Colecciones**

- Agrupan prompts por contexto/proyecto.
- Pueden ser:
  - Privadas (solo el autor/equipo).
  - Compartidas/públicas (visible a otros).[web:41][web:54]

**Usos / categorías**

- Catálogo de categorías de uso (ej. “investigar”, “cocina”, “coding”, “marketing”…).
- Permite filtrar y encontrar prompts según su finalidad.[web:41][web:54]

**Versiones de prompt (opcional, avanzado)**

- Tabla de histórico `prompt_versions`:
  - `prompt_id`, `version_number`, `content`, `created_at`.
  - `tokens_estimated` por versión.
  - `improvement_note` (qué se cambió / por qué).[web:41][web:80]

---

## 4. Mejora de prompts con regla CREATE

### 4.1 Regla CREATE

Regla para estructurar prompts avanzados (plantilla de mejora):

- **C**ontexto: Fondo relevante (ej. “En un proyecto de software en Madrid…”).
- **R**ol: Rol de la IA (ej. “Actúa como arquitecto técnico…”).
- **E**jemplos: Ejemplos de entrada/salida deseada.
- **A**cción: Tarea clara (ej. “Diseña un esquema de base de datos…”).
- **T**ono/Estilo: Formato y voz (ej. “En markdown, tono profesional…”).
- **E**valuación: Pedir que revise su propia respuesta.

Inspirado en buenas prácticas de estructura de prompt: contexto, rol, ejemplos, instrucciones claras, formato y autocheck.[web:102][web:103][web:112]

### 4.2 Pantalla “Mejorar (CREATE)”

En la ficha de cada prompt:

- Botón **“Mejorar (CREATE)”** que abre un editor estructurado:
  - Columna izquierda: secciones CREATE como campos separados:
    - Campo Contexto.
    - Campo Rol.
    - Listado de Ejemplos (varias entradas de “input → output”).
    - Campo Acción.
    - Campo Tono/Estilo (puede ser un selector + texto libre).
    - Campo Evaluación.
  - Columna derecha:
    - Vista previa del **prompt final** (texto ensamblado a partir de las secciones).
    - Métricas de tokens y coste (por modelo).
    - Métricas de eficiencia (iteraciones medias, coste efectivo).

Flujo:

1. Se pre-rellena CREATE a partir de `current_version` (tanto como sea posible).
2. El usuario edita secciones y ve cómo cambia la vista previa.
3. Se recalculan tokens y costes en tiempo real.
4. Al guardar:
   - Se actualiza `current_version`.
   - Opcionalmente se guarda una nueva entrada en `prompt_versions`.

---

## 5. Tokens, modelos y coste efectivo

### 5.1 Estimación de tokens

- Se necesita una estimación rápida para UX y coste:
  - Aproximación genérica: \( tokens \approx \text{nº_palabras} / 0{,}75 \).[web:92][web:94]
  - Esto se calcula tanto para el prompt (entrada) como para una respuesta media estimada.
- `tokens_estimated` se guarda en la entidad `prompts` (y en `prompt_versions`, si se usa).[web:90][web:91]

### 5.2 Modelos configurables

Pantalla de configuración de modelos:

- Tabla `models` con:
  - `id`.
  - `name` (ej. “gpt-4”, “gpt-4o”, etc.).
  - `provider`.
  - `max_context_tokens`.
  - `input_price_per_million_tokens`.
  - `output_price_per_million_tokens`.[web:91][web:97][web:93]

Uso:

- Seleccionar uno o varios modelos “activos”.
- Definir un **modelo de referencia** para comparación (ej. GPT‑4o).

Para cada prompt:

- Calcular coste de una llamada aproximada:
  - `cost ≈ (tokens_prompt + tokens_respuesta_media) * price_per_token`.
- Calcular % del contexto del modelo:
  - `context_usage = tokens_prompt / max_context_tokens`.

### 5.3 Coste efectivo (calidad vs repreguntas)

No solo importa el tamaño del prompt, sino cuántas rondas hace falta para llegar a una buena respuesta.[web:115][web:119][web:126]

Métricas por prompt:

- `total_sessions`: nº de sesiones iniciadas con ese prompt.
- `successful_sessions`: nº de sesiones marcadas como satisfactorias.
- `avg_iterations`: nº medio de iteraciones por sesión:
  - Se puede aproximar contando cuántas veces se reutiliza el mismo prompt en una ventana de tiempo.
- `success_rate = successful_sessions / total_sessions`.

Coste efectivo aproximado:

\[
\text{coste\_efectivo\_tokens} \approx (\text{tokens\_prompt} + \text{tokens\_respuesta\_media}) \times \text{avg\_iterations}
\]

Interpretación:

- Un prompt “malo”:
  - Menos tokens de entrada, pero `avg_iterations` alto (varias repreguntas).
  - Coste efectivo más alto por tarea.
- Un prompt “bueno”:
  - Puede ser más largo, pero `avg_iterations` baja (~1).
  - Coste efectivo igual o menor.

En la UI (detalle del prompt y modo CREATE):

- Mostrar:
  - Tokens de entrada estimados.
  - Coste estimado por llamada (por modelo).
  - `avg_iterations`, `success_rate`.
  - Coste efectivo estimado.
- Mensaje educativo:
  - “No mires solo tokens del prompt; mira coste efectivo y tasa de éxito.”

---

## 6. Extensión de navegador (botón derecho)

### 6.1 Tecnologías

- API `chrome.contextMenus` para añadir elementos al menú contextual.[web:38][web:40]
- `background/service_worker` para gestionar clics en el menú.
- `popup` de la extensión para formularios (guardar/usar prompts).
- `content scripts` para insertar texto en los campos activos.[web:35][web:37]

### 6.2 Acción: “Guardar prompt”

Flujo:

1. Usuario selecciona texto en una web.
2. Botón derecho → “Guardar prompt”.
3. El background recoge `selectionText`.[web:31][web:35]
4. Se abre un popup:
   - Muestra el texto (editable).
   - Dropdown “Uso” (categoría).
   - Dropdown “Colección” (con opción “Crear nueva colección”).
5. Al confirmar:
   - La extensión envía una petición a la API Next.js (`/api/prompts`) con:
     - Prompt (texto), `usage_id`, `collection_id`.
   - La API:
     - Valida token de Firebase (autenticación).
     - Crea el registro en Supabase (`prompts`), inicializa métricas:
       - `initial_version` = texto.
       - `current_version` = texto.
       - `created_at`, `usage_count = 0`, `likes_count = 0`.

### 6.3 Acción: “Usar prompt”

Flujo:

1. Usuario hace botón derecho → “Usar prompt”.
2. Se abre un popup con buscador:
   - Campo de texto (search por título/contenido).
   - Filtro por uso.
   - Filtro por colección.
   - Opcional: orden por likes, usos, fecha.
3. Para cada resultado se muestra:
   - Título.
   - Uso, colección.
   - Tokens estimados, coste aproximado (por modelo).
   - Likes, usos.
4. Acciones por prompt:
   - **Copiar**: copiar texto del prompt al portapapeles.
   - **Insertar aquí**: content script intenta escribir el prompt en el campo activo (chat, email, etc.).[web:35][web:37][web:46]
5. Al usar un prompt:
   - La extensión llama a `/api/prompts/use`:
     - Incrementa `usage_count`.
     - Actualiza `last_used_at`.
     - Crea registro en `prompt_usage_logs`.
     - Añade XP al creador del prompt.

---

## 7. Gamificación, likes y XP

### 7.1 Likes

- Tabla `prompt_likes`:
  - `id`, `prompt_id`, `user_id`, `created_at`.[web:77][web:80]
- Reglas:
  - Un usuario solo puede dar un like por prompt.
  - Al dar like:
    - Se incrementa `likes_count` en `prompts`.
    - Se crea un evento `xp_events` positivo para el autor (`type = like_received`, `amount = +X`).[web:78][web:74]
  - Al hacer “unlike”:
    - Se elimina la fila `prompt_likes`.
    - Se decrementa `likes_count`.
    - Puedes decidir si restas XP o no; de inicio se recomienda NO restar para evitar sistemas punitivos complejos.[web:81]

### 7.2 XP y medallas

- Tabla `xp_events`:
  - `id`, `user_id`, `type`, `amount`, `created_at`.
  - Tipos:
    - `prompt_created`.
    - `prompt_used`.
    - `like_received`.
    - `milestone` (hitos).
    - `prompt_deleted_due_to_report` (penalización).[web:70][web:71][web:79]
- XP total:
  - Se calcula agregando `amount` por usuario.
- Niveles y medallas:
  - Definidos por rangos de XP y/o hitos concretos:
    - “10 prompts creados”.
    - “100 likes recibidos”.
    - “Alta eficiencia (baja `avg_iterations` con buena `success_rate`)”.[web:56][web:81]

### 7.3 Penalización por moderación

- Cuando un prompt es borrado por decisión de admin a raíz de reportes:
  - No solo se marca borrado/elimina el prompt.
  - Se crea un evento XP negativo:
    - `type = prompt_deleted_due_to_report`, `amount = -Y`.
  - Esto desincentiva subir spam o contenido problemático para farmear XP.[web:71][web:79]

---

## 8. Moderación y panel admin

### 8.1 Roles y RLS

- Usuarios tienen un rol:
  - `user`.
  - `admin`.
- Implementación:
  - Columna `role` en `profiles` o tabla `user_roles`.
  - Políticas RLS de Supabase para que:
    - Usuarios vean solo sus datos y los prompts públicos.
    - Admins puedan acceder a más tablas y acciones.[web:64][web:67]

### 8.2 Reportes

- Tabla `prompt_reports`:
  - `id`, `prompt_id`, `reporter_id`, `reason`, `status` (`open`, `reviewed`, `rejected`), `created_at`.[web:78][web:81]
- UX:
  - Botón “Reportar” visible en prompts públicos.
  - El usuario selecciona motivo (spam, contenido sensible, etc.).
  - Se crea un reporte `status = open`.

### 8.3 Panel admin (`/admin`)

Secciones:

- **Moderación**:
  - Lista de `prompt_reports` con filtros.
  - Vista del prompt y contexto:
    - Autor, fecha, likes, usos.
  - Acciones:
    - “Mantener” (marca reporte como `rejected`).
    - “Borrar prompt”:
      - Marca el prompt como borrado o lo elimina.
      - Crea evento XP negativo para el autor.[web:61][web:64]

- **Gestión de prompts**:
  - Listado de prompts con filtros por:
    - Texto, uso, colección.
    - Autor.
    - Likes, usos, fechas.
  - Acciones de editar/ocultar/borrar.

- **Analítica / Dashboard**:
  - Gráficas:
    - Prompts creados por día/semana/mes.
    - Usos totales por periodo.
    - Likes por periodo.
  - Rankings:
    - Top usuarios (por prompts, likes, XP).
    - Top prompts (por likes, usos, eficiencia).[web:66][web:69]

---

## 9. Estado técnico inicial

### 9.1 Creación del proyecto

Comando usado:

```bash
npx create-next-app@latest prompt-library --ts
