## CU03 – Mejorar un prompt con la regla CREATE

**Nombre**  
CU03 – Mejorar prompt con CREATE

**Actor principal**  
Usuario autenticado (rol `user` o `admin`), autor del prompt o con permisos de edición.

**Objetivo**  
Refactorizar un prompt existente aplicando la estructura CREATE (Contexto, Rol, Ejemplos, Acción, Tono/Estilo, Evaluación) y guardar una versión mejorada.

**Precondiciones**

- El usuario ha iniciado sesión en la app web.  
- Existe al menos un prompt creado y accesible para ese usuario.  
- El prompt tiene una `current_version` de texto.

**Flujo principal (happy path)**

1. El usuario accede a la app web y abre la pantalla de detalle de un prompt.  
2. En la ficha del prompt, el usuario pulsa el botón **“Mejorar (CREATE)”**.  
3. La app abre una vista de edición estructurada con dos columnas:  
   - Izquierda: formularios para cada sección CREATE (Contexto, Rol, Ejemplos, Acción, Tono/Estilo, Evaluación).  
   - Derecha: vista previa del prompt final ensamblado + métricas (tokens estimados, coste, coste efectivo).  
4. La app intenta pre-rellenar los campos CREATE a partir de la `current_version` del prompt (o los deja vacíos si no puede).  
5. El usuario rellena o ajusta cada sección:  
   - Añade/edita contexto.  
   - Define un rol claro para la IA.  
   - Añade ejemplos de entrada/salida.  
   - Especifica la acción principal.  
   - Define tono y estilo.  
   - Añade instrucciones de evaluación.  
6. Conforme el usuario escribe, la app reconstruye el **prompt final** en la columna derecha y recalcula:  
   - `tokens_estimated` (por longitud).  
   - Coste estimado por modelo configurado.  
   - Indicadores de eficiencia (si ya existen datos históricos para ese prompt).  
7. El usuario revisa la vista previa y, cuando está conforme, pulsa **“Guardar versión mejorada”**.  
8. La app envía una petición al backend (ej. `POST /api/prompts/{id}/improve`) con las secciones CREATE y el texto final.  
9. El backend:  
   - Actualiza `current_version` con el nuevo texto.  
   - Opcional: inserta una fila en `prompt_versions` con `version_number` + contenido + `tokens_estimated`.  
   - Mantiene `initial_version` intacta.  
10. La app muestra un mensaje de éxito y vuelve a la ficha del prompt con la nueva `current_version` visible.

**Flujos alternativos / errores**

- 4A. No se puede pre-rellenar CREATE  
  - Se muestran las secciones vacías con un aviso tipo “Este prompt aún no está estructurado; empieza desde cero con CREATE”.  
- 6A. El prompt se vuelve demasiado largo para un modelo específico  
  - En la vista previa se resalta el exceso de tokens respecto a `max_context_tokens` del modelo seleccionado y se sugiere reducir contexto o ejemplos.  
- 8A. Error en la petición al backend  
  - Se muestra el error, se mantiene el contenido en el editor y se ofrece “Reintentar” sin perder el trabajo.  
- 9A. El usuario no es el autor del prompt y no tiene permisos de edición  
  - El backend devuelve error de autorización; la UI muestra “No tienes permisos para mejorar este prompt” y desactiva el botón de guardar.
