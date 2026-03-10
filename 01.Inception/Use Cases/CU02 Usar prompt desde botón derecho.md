## CU02 – Usar prompt desde botón derecho

**Nombre**  
CU02 – Usar prompt desde botón derecho

**Actor principal**  
Usuario autenticado (rol `user` o `admin`).

**Objetivo**  
Buscar un prompt en la librería desde cualquier web y usarlo rápidamente copiándolo o insertándolo en el campo de texto activo.

**Precondiciones**

- Usuario con sesión válida en la extensión (Firebase).  
- Extensión instalada y activa.  
- El usuario tiene al menos un prompt disponible (propio o público).  
- En la página actual existe al menos un campo de texto donde podría insertarse el prompt (para la opción “Insertar aquí”).

**Flujo principal (happy path – copiar)**

1. El usuario hace botón derecho en cualquier parte de la página (no hace falta seleccionar texto).  
2. En el menú contextual elige la opción “Usar prompt”. [developer.chrome](https://developer.chrome.com/docs/extensions/reference/api/contextMenus)
3. La extensión abre un popup con un **buscador de prompts** que incluye:
   - Campo de búsqueda por texto (título/contenido).  
   - Filtro por Uso.  
   - Filtro por Colección.  
   - Opcionalmente orden (por recientes, más usados, más likes).  
4. El usuario escribe texto de búsqueda y/o ajusta los filtros.  
5. La extensión llama a la API (`GET /api/prompts`) enviando los filtros y el token del usuario. [supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
6. La API devuelve una lista de prompts accesibles para ese usuario (propios + públicos), con información básica:
   - Título.  
   - Extracto del contenido.  
   - Uso, Colección.  
   - Tokens estimados y coste aproximado (opcional).  
   - Likes y usos.  
7. El popup muestra la lista de resultados.  
8. El usuario selecciona un prompt y pulsa el botón **“Copiar”**.  
9. La extensión copia el contenido del prompt al portapapeles del usuario.  
10. En paralelo, la extensión envía `POST /api/prompts/use` para registrar el uso (incrementar `usage_count`, actualizar `last_used_at`, generar XP para el autor).  
11. El popup muestra “Prompt copiado” y puede cerrarse automáticamente o esperar a que el usuario lo cierre.

**Flujo alternativo – Insertar en el campo de texto**

8B. En lugar de “Copiar”, el usuario pulsa **“Insertar aquí”**:

1. La extensión comunica con un content script que intenta localizar el campo de texto actualmente enfocado (textarea/input/contenteditable). [stackoverflow](https://stackoverflow.com/questions/27892282/copy-selected-text-via-a-context-menu-option-in-a-chrome-extension)
2. Si lo encuentra, inserta el contenido del prompt en dicho campo (reemplazando el texto seleccionado o añadiéndolo al final).  
3. Igual que en el happy path:
   - Envía `POST /api/prompts/use` al backend.  
   - Muestra confirmación (“Prompt insertado”).  

**Flujos alternativos / errores**

- 3A. No hay prompts que coincidan con los filtros  
  - El popup muestra mensaje “No se han encontrado prompts” y un enlace/botón “Abrir en la web para crear uno nuevo”, que abre la app en la pantalla de creación de prompt.  
- 5A. Error de red / API al buscar  
  - El popup muestra el error y opción “Reintentar”.  
- 8A. Error al copiar al portapapeles  
  - Se muestra aviso y se ofrece un textarea con el contenido para que el usuario lo copie manualmente.  
- 8B-2A. No se detecta ningún campo de texto activo  
  - Se muestra mensaje “No se ha encontrado un campo de texto donde insertar. Usa ‘Copiar’ en su lugar.”  
- 10A. Error en `POST /api/prompts/use`  
  - No bloquea la acción de copiar/insertar (el usuario sigue usando el prompt), solo se registra el error para debug.
