## CU04 – Dar like a un prompt y actualizar XP

**Nombre**  
CU04 – Dar like a un prompt

**Actor principal**  
Usuario autenticado (rol `user` o `admin`) distinto del autor del prompt.

**Objetivo**  
Valorar positivamente un prompt mediante un “like”, aumentando su contador de likes y otorgando XP al creador.

**Precondiciones**

- Usuario autenticado en la app web.  
- El prompt es visible para ese usuario (público o compartido).  
- El usuario no ha dado like antes a ese prompt (no existe registro en `prompt_likes`).

**Flujo principal (dar like)**

1. El usuario navega por la lista de prompts (página de exploración, colección, resultados de búsqueda, etc.).  
2. Junto a cada prompt ve un icono de like (por ejemplo un corazón vacío) y el número de likes actuales.  
3. El usuario pulsa el icono de like en un prompt.  
4. El frontend envía una petición al backend (ej. `POST /api/prompts/{id}/like`).  
5. El backend verifica que el usuario no haya likeado antes ese prompt (no hay entrada `prompt_likes` con ese `user_id` y `prompt_id`).  
6. El backend crea una fila en `prompt_likes` y actualiza el prompt:  
   - Incrementa `likes_count` en `prompts`.  
7. El backend crea un evento en `xp_events` para el **autor** del prompt:  
   - `type = "like_received"`, `amount = +XP_like`.  
8. La API devuelve éxito con el nuevo `likes_count`.  
9. El frontend actualiza el icono a “like activo” (corazón lleno) y el contador de likes en la UI.

**Flujo alternativo – Quitar like (unlike)**

3B. El usuario pulsa el icono de like cuando ya lo tenía activo:

1. El frontend llama a `POST /api/prompts/{id}/unlike` (o `DELETE` sobre la misma ruta).  
2. El backend encuentra la fila en `prompt_likes` para ese usuario y prompt.  
3. El backend elimina esa fila y decrementa `likes_count` en `prompts`.  
4. (Versión simple recomendada) No se modifica el XP ganado previamente por ese like.  
5. La API devuelve el nuevo `likes_count`.  
6. El frontend vuelve a mostrar el icono de like como inactivo y el nuevo contador.

**Flujos alternativos / errores**

- 5A. El usuario ya tiene un like registrado sobre ese prompt  
  - El backend devuelve un error controlado (o simplemente ignora la operación).  
  - El frontend asegura que no se duplique el estado de like.  
- 4A. Error de autenticación  
  - La API devuelve 401/403.  
  - La UI muestra “Debes iniciar sesión para dar like” y puede ofrecer un botón de login.  
- 6A. Error al actualizar la base de datos  
  - Se devuelve error, la UI muestra un aviso y revierte el estado visual del like.
