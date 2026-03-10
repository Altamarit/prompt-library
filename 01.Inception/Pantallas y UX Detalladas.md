# Prompt Library – Pantallas y UX Detalladas

## 1. Dashboard de Prompts

### 1.1. Layout general

- Ruta: `/prompts` (por defecto)  
- Estructura tipo dashboard:
  - **Sidebar izquierda** (navegación global):
    - Mis prompts
    - Comunidad
    - Colecciones
    - Perfil
    - Admin (solo rol admin)
  - **Área principal**:
    - Cabecera del listado
    - Barra de filtros
    - Tabla/lista de prompts

### 1.2. Cabecera

Elementos:

- Título de sección:
  - Texto: “Mis prompts”
  - Tabs/segmentos:
    - “Todos”
    - “Solo míos”
    - “Comunidad”
- Botón principal:
  - “+ Nuevo prompt”
  - Acción: abre flujo de creación manual (form de título, texto, uso, colección).
- Indicadores rápidos (chips o pequeñas tarjetas):
  - “Total prompts: X”
  - “Prompts usados este mes: Y”
  - “Uso más frecuente: [Uso]”

### 1.3. Barra de filtros y búsqueda

Elementos:

- **Buscador de texto**:
  - Input tipo search
  - Placeholder: “Buscar por título o contenido…”
  - Debe filtrar por título y fragmentos de contenido del prompt.

- **Filtros principales**:
  - Uso:
    - Dropdown o multiselect
    - Opciones: lista de categorías (investigar, cocina, coding, etc.)
  - Colección:
    - Dropdown con colecciones del usuario (más “Todas”)
  - Visibilidad:
    - Selector tipo pill o dropdown:
      - “Solo míos”
      - “Equipo” (si añades esto)
      - “Comunidad”
  - Orden:
    - Dropdown:
      - “Más recientes”
      - “Más usados”
      - “Más likes”
      - “Más eficientes”

- **Chips de filtros activos**:
  - Cuando se aplica un filtro, aparece como chip:
    - Ejemplo: `[Uso: Investigador] [Colección: Libro X] [Orden: Más usados]`
  - Cada chip tiene una “x” para limpiar ese filtro concreto.
  - Botón “Limpiar filtros” para resetear todos.

### 1.4. Tabla / lista de prompts

Formato tipo tabla (en desktop):

**Columnas:**

1. (Opcional) Checkbox  
   - Selección múltiple para acciones en lote en el futuro.

2. Título  
   - Título del prompt (texto principal, clickable → detalle).  
   - Debajo, línea secundaria con snippet de `current_version` (primeras 80–120 chars).

3. Uso  
   - Chip con el nombre de la categoría (ej. “Investigar”).  
   - Color distinto por categoría.

4. Colección  
   - Texto con nombre de la colección.  
   - Chip o enlace (click → filtra por esa colección).

5. Tokens aprox.  
   - Texto tipo `~120 tokens`.  
   - Tooltip explicando “Estimación basada en longitud del prompt”.

6. Likes / Usos  
   - Texto tipo `❤️ 12 · 40 usos`.  
   - El corazón puede ser clickable si es vista de comunidad (para dar like).

7. Eficiencia (opcional v1, pero previsto)  
   - Etiqueta corta:
     - “Alta” / “Media” / “Baja”
   - Basada en `avg_iterations` y `success_rate`.

8. Acciones  
   - Botones:
     - “Ver”
     - “Mejorar (CREATE)”
     - Icono “Copiar” (copiar `current_version` al portapapeles)
     - Menú “⋯” con:
       - Duplicar
       - Cambiar visibilidad
       - Borrar (si es tuyo)

**Interacciones:**

- Clic en título → abre detalle del prompt.
- Botón “Mejorar (CREATE)” → abre `/prompts/[id]/improve`.
- Botón “Copiar” → copia al portapapeles y muestra toast “Prompt copiado”.

### 1.5. Estados especiales

- **Sin prompts (estado vacío)**:
  - Mensaje central: “Aún no tienes prompts guardados.”
  - Botones:
    - “Crear tu primer prompt”
    - “Instalar extensión para guardar desde el botón derecho”

- **Sin resultados tras filtros/búsqueda**:
  - Mensaje: “No se han encontrado prompts con estos filtros.”
  - Botón: “Limpiar filtros”

---

## 2. Detalle de Prompt

### 2.1. Layout

- Ruta: `/prompts/[id]`  
- Layout de dos columnas:

  - Columna izquierda:
    - Contenido del prompt
    - Información básica
  - Columna derecha:
    - Métricas
    - Social
    - Gamificación

### 2.2. Cabecera

Elementos:

- Título del prompt (editable o no según permisos).
- Chips:
  - Uso
  - Colección
  - Visibilidad (Privado / Compartido / Público)
- Acciones:
  - Botón primario: “Mejorar (CREATE)”
  - Botón secundario: “Copiar prompt”
  - (Opcional) Botón “Editar texto” (edición rápida de `current_version`)

### 2.3. Columna izquierda

1. Bloque “Versión actual”
   - Subtítulo: “Versión actual del prompt”
   - Editor/visor:
     - Read‑only por defecto.
     - Modo edición rápida (si el usuario es autor).
   - Texto: `current_version`.

2. Bloque “Información básica”
   - Creador (nombre, email o alias).
   - Fecha de creación.
   - Fecha de último uso.
   - Número de versiones (si existe `prompt_versions` y se quiere mostrar).

3. Enlace a historial de versiones (si lo implementas):
   - “Ver historial de versiones” → modal o página con lista de versiones.

### 2.4. Columna derecha

1. Bloque “Tokens y coste”
   - `~N tokens estimados` (entrada).
   - Pequeña tabla por modelo configurado:

     | Modelo | Coste entrada (aprox) | % contexto usado |
     |--------|-----------------------|------------------|
     | GPT‑4o | $0.000X               | 5 %              |
     | GPT‑4  | $0.000Y               | 3 %              |

2. Bloque “Eficiencia”
   - “Iteraciones medias por sesión: X.Y”
   - “Tasa de éxito estimada: Z %”
   - “Coste efectivo estimado: ~M tokens por tarea”

3. Bloque “Social”
   - Likes:
     - Corazón (estado activo/inactivo).
     - Contador de likes.
   - Usos:
     - Contador total de usos.
   - Botón “Reportar” (si el usuario no es el autor).

4. Bloque “Gamificación”
   - XP generado por este prompt (estimado).
   - Medallas asociadas (si las hay).

---

## 3. Pantalla “Mejorar Prompt con CREATE”

### 3.1. Layout general

- Ruta: `/prompts/[id]/improve`  
- Layout de dos columnas:

  - Izquierda: editor CREATE (secciones).  
  - Derecha: vista previa + métricas.

### 3.2. Cabecera

- Breadcrumb: `Prompts > [Título] > Mejorar (CREATE)`
- Título: “Mejorar prompt con CREATE”
- Subtítulo: “Estructura el prompt en Contexto, Rol, Ejemplos, Acción, Tono y Evaluación.”
- Botones:
  - Primario: “Guardar versión mejorada”
  - Secundario: “Cancelar / Volver al prompt”

### 3.3. Columna izquierda – Editor CREATE

Cada sección incluye título, descripción y control de entrada.

1. **Contexto**
   - Título: “Contexto”
   - Descripción: “Describe el proyecto, dominio y restricciones importantes.”
   - Control: Textarea
   - Placeholder: “Ej.: Estás ayudando a un equipo de desarrollo en Madrid a diseñar la arquitectura de una app SaaS…”

2. **Rol**
   - Título: “Rol de la IA”
   - Descripción: “Define quién debe ser la IA (rol, experiencia, especialidad).”
   - Control: Input/textarea corto
   - Placeholder: “Ej.: Actúa como arquitecto de software senior especializado en SaaS B2B.”

3. **Ejemplos**
   - Título: “Ejemplos (input → output)”
   - Descripción: “Añade ejemplos de entrada y salida deseada.”
   - Control:
     - Lista de tarjetas:
       - Textarea “Entrada de ejemplo”
       - Textarea “Salida esperada”
       - Botón “Eliminar ejemplo”
     - Botón “+ Añadir ejemplo”
   - Estado vacío:
     - Mensaje suave: “Los ejemplos mejoran mucho la calidad, pero son opcionales.”

4. **Acción**
   - Título: “Acción”
   - Descripción: “Especifica la tarea principal que debe realizar la IA.”
   - Control: Textarea corta
   - Placeholder: “Ej.: Diseña un esquema de base de datos relacional para esta aplicación…”

5. **Tono/Estilo**
   - Título: “Tono y estilo”
   - Descripción: “Define el tono y el formato de la respuesta.”
   - Controles:
     - Dropdown “Tono” (Profesional, Casual, Técnico, Didáctico…)
     - Textarea “Formato y estilo”
       - Placeholder: “Ej.: Responde en markdown, con secciones y listas numeradas…”

6. **Evaluación**
   - Título: “Evaluación”
   - Descripción: “Pide a la IA que revise y mejore su propia respuesta.”
   - Controles:
     - Checkbox: “Pide a la IA que revise su respuesta antes de finalizar.”
     - Textarea opcional (instrucciones específicas)
       - Placeholder: “Ej.: Verifica que no falten tablas importantes, que las claves foráneas sean coherentes…”

### 3.4. Columna derecha – Vista previa y métricas

1. **Vista previa del prompt final**
   - Título: “Vista previa del prompt”
   - Control:
     - Textarea read‑only o bloque de texto con formato
   - Contenido:
     - Prompt ensamblado a partir de las secciones CREATE, por ejemplo:

       - “Contexto: …  
          Rol: …  
          Ejemplos: …  
          Acción: …  
          Tono/Estilo: …  
          Evaluación: …”

   - Botón: “Copiar prompt”

2. **Tokens y coste**
   - Título: “Tokens y coste estimado”
   - Contenido:
     - Texto: `~N tokens estimados`
     - Tabla de modelos:

       | Modelo | Coste entrada (aprox) | % contexto usado |
       |--------|-----------------------|------------------|
       | GPT‑4o | $0.000X               | 5 %              |
       | GPT‑4  | $0.000Y               | 3 %              |

   - Tooltip explicando que es una estimación basada en longitud.

3. **Eficiencia histórica**
   - Título: “Eficiencia actual”
   - Datos:
     - “Iteraciones medias: X.Y”
     - “Tasa de éxito: Z %”
     - “Coste efectivo estimado: ~M tokens por tarea”
   - Mensaje:
     - “Un prompt más claro puede aumentar tokens de entrada pero reducir el coste efectivo si disminuye las repreguntas.”

### 3.5. Flujo de guardado

1. El usuario edita secciones CREATE.  
2. La vista previa y las métricas se actualizan en tiempo casi real.  
3. El usuario pulsa “Guardar versión mejorada”.  
4. Se muestra estado de carga en el botón.  
5. Backend:
   - Actualiza `current_version` con el texto ensamblado.
   - Opcional: crea nueva entrada en `prompt_versions`.
6. Al éxito:
   - Toast: “Versión mejorada guardada correctamente.”
   - Redirección a `/prompts/[id]`.
7. En caso de error:
   - Toast de error.
   - El contenido del editor no se pierde.

---

## 4. Panel Admin

### 4.1. Layout general del admin

- Ruta base: `/admin`
- Sidebar con secciones:
  - Dashboard
  - Prompts
  - Reportes
  - Usuarios

---

### 4.2. `/admin/dashboard` – Resumen

**Tarjetas KPI**

- “Prompts totales”
- “Prompts usados (últimos 7 días)”
- “Likes (últimos 7 días)”
- “Usuarios activos (últimos 7 días)”

**Gráficas**

- Línea/área:
  - “Prompts creados por día (últimos 30 días)”
- Barra:
  - “Top 5 prompts por usos”
  - “Top 5 usuarios por XP”

**Listas rápidas**

- “Prompts más reportados”
- “Prompts con peor eficiencia”

---

### 4.3. `/admin/prompts` – Gestión de prompts

**Filtros**

- Texto libre (título/contenido)
- Uso
- Colección
- Visibilidad (privado / compartido / público)
- Estado (activo / oculto / borrado)
- Orden (recentes, likes, usos, reportes)

**Tabla de prompts**

Columnas:

- Título (link a detalle admin)
- Autor (link a ficha de usuario)
- Uso
- Colección
- Likes / Usos
- Tokens aprox.
- Estado (activo / oculto / borrado)
- Acciones:
  - Ver
  - Editar
  - Ocultar de comunidad
  - Borrar

**Detalle admin de prompt**

- Texto completo del prompt
- Autor + métricas (XP, nº prompts, reportes asociados)
- Acciones:
  - Borrar (con confirmación y penalización XP)
  - Cambiar visibilidad

---

### 4.4. `/admin/reportes` – Moderación

**Lista de prompts reportados**

- Prompt (título)
- Autor
- Nº de reportes
- Motivo principal
- Fecha del primer/último reporte
- Acción: “Ver / Resolver”

**Detalle de reportes**

Secciones:

1. Prompt:
   - Texto completo
   - Likes, usos, tokens/coste
2. Autor:
   - Usuario, XP, nº de prompts, historial de moderación
3. Reportes:
   - Lista de cada reporte:
     - Reportado por
     - Motivo
     - Comentario
     - Fecha

**Acciones admin**

- “Mantener prompt”:
  - Marca reportes como rechazados.
- “Borrar prompt y penalizar XP”:
  - Confirmación clara.
  - Marca prompt como borrado.
  - Marca reportes como resueltos.
  - Crea evento XP negativo para el autor.

---

### 4.5. `/admin/users` – Gestión de usuarios

**Filtros**

- Texto libre (nombre/email/ID)
- Rol (user/admin)
- Rango de XP
- Estado (activo/bloqueado)

**Tabla de usuarios**

Columnas:

- Usuario (nombre, email, avatar)
- Rol (user/admin)
- XP total
- Nº prompts creados
- Likes recibidos
- Prompts borrados por moderación
- Acciones:
  - Ver perfil admin
  - Cambiar rol
  - Bloquear/desbloquear

**Detalle admin de usuario**

Secciones:

1. Resumen:
   - Nombre, email, rol
   - XP total, nivel, medallas
2. Actividad de prompts:
   - Lista de prompts con métricas y estado de moderación
3. XP Events:
   - Historial de eventos XP (like_received, prompt_used, prompt_deleted_due_to_report, etc.)
4. Acciones admin:
   - Ajuste manual de XP (opcional)
   - Cambiar rol
   - Bloquear usuario

