## CU01 – Guardar prompt desde botón derecho
**Nombre**  
CU01 – Guardar prompt desde botón derecho

**Actor principal**  
Usuario autenticado (rol `user` o `admin`).

**Objetivo**  
Guardar un texto seleccionado como nuevo prompt en la librería, asignándole uso y colección, desde el menú contextual del navegador y, opcionalmente, abrirlo en la web.

**Precondiciones**

- Usuario con sesión válida (Firebase) y extensión instalada.  
- App web desplegada y accesible (URL conocida por la extensión).  

**Flujo principal (happy path)**

1. El usuario selecciona un texto en cualquier web.  
2. Hace botón derecho y elige “Guardar prompt” del menú de la extensión. [developer.chrome](https://developer.chrome.com/docs/extensions/reference/api/contextMenus)
3. La extensión captura el texto seleccionado.  
4. Se abre un popup con:  
   - Campo texto (editable).  
   - Selector de Uso.  
   - Selector de Colección (con opción “Crear nueva”).  
5. El usuario revisa el texto, selecciona Uso y Colección.  
6. El usuario pulsa “Guardar”.  
7. La extensión envía `POST /api/prompts` con datos y token al backend.  
8. El backend valida el token, crea el prompt en Supabase con los campos iniciales y calcula `tokens_estimated`. [supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
9. La API devuelve el prompt creado, incluyendo su `id` y la URL de detalle (ej. `/prompts/{id}`).  
10. El popup muestra:  
    - Mensaje “Prompt guardado correctamente”.  
    - Dos botones:  
      - “Cerrar” (cierra el popup).  
      - “Abrir en la web” (abre una nueva pestaña con la URL de detalle del prompt).  
11. Si el usuario pulsa “Abrir en la web”, la extensión abre la app en una nueva pestaña en esa URL. [storemyprompt](https://www.storemyprompt.com)

**Flujos alternativos / errores**

- 4A. No hay usos o colecciones aún  
  - El popup permite crear el primer Uso/Colección directamente.  
- 7A. Error de red / API  
  - Muestra mensaje de error y opción “Reintentar”.  
- 8A. Token inválido / sin sesión  
  - El popup muestra “Necesitas iniciar sesión” y un botón “Abrir app para login” que abre la web en la pantalla de login.
