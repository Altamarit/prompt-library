# Resumen

Tu producto es una **librería de prompts colaborativa** con extensión de navegador, gamificación y panel admin.

### Concepto general

- Web app en Next.js, datos en Supabase, login con Firebase Auth, desplegado en Vercel.[^1][^2][^3][^4]
- Extensión de navegador que añade opciones al botón derecho para guardar y usar prompts en cualquier web, usando context menus de Chrome.[^5][^6][^7]
- Uso principal: cada usuario organiza sus prompts por categoría de uso (investigar, cocina, etc.) y por colección (libros, vídeos, recetas…), pero puede compartirlos con la comunidad.[^8][^9][^10]


### Modelo de datos (alto nivel)

- Usuarios con roles (`user`, `admin`) y campos de XP y medallas.[^11][^12]
- Prompts con: uso, colección, versión inicial, versión actual, fechas de creación/último uso, contador de usos.[^9][^13]
- Tablas auxiliares: `collections`, `usages`, `prompt_usage_logs` para analítica, `prompt_likes` para likes, `xp_events` para registrar todos los cambios de XP.[^13][^14][^15]


### Extensión: botón derecho

- Acción “Guardar prompt”: toma el texto seleccionado, abre un popup para elegir uso y colección, y lo guarda vía tu API en Supabase.[^6][^16][^5]
- Acción “Usar prompt”: abre un buscador por texto, uso y colección; desde ahí el usuario puede copiar o insertar el prompt en el campo actual, y se registra el uso para métricas y XP.[^16][^17][^18]


### Comunidad, likes y XP

- Comunidad de importancia media: uso personal por defecto, con opción de compartir prompts/colecciones y explotar los mejores de la comunidad.[^10][^19]
- Likes: cada usuario puede dar un like por prompt; eso aumenta `likes_count` y otorga XP al creador.[^14][^20]
- Uso de prompts: cada vez que alguien usa un prompt, sube el contador de usos y el creador gana XP adicional.[^12][^21]
- XP system: puntos por likes, usos y otros hitos, con posibilidad de niveles y medallas según la actividad.[^22][^23][^24]


### Moderación y panel admin

- Varios admins con acceso a un panel `/admin` para ver, editar y borrar prompts, gestionar usuarios y ver estadísticas.[^25][^11]
- Sistema de reportes de usuarios (`prompt_reports`); los admins revisan y pueden borrar prompts reportados.[^20][^24]
- Cuando un prompt se borra por moderación, el creador recibe una penalización de XP mediante un evento negativo en `xp_events`, desincentivando el abuso.[^21][^12]
- Panel de métricas: gráficas de prompts creados, usos, likes, ranking de usuarios y de prompts más utilizados.[^26][^27]

¿Te gustaría que ahora pasemos a la fase de **Casos de Uso** empezando por “Guardar prompt desde el botón derecho” (CU01)?

<div align="center">⁂</div>

[^1]: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs

[^2]: https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs

[^3]: https://firebase.google.com/codelabs/firebase-nextjs

[^4]: https://supabase.com/docs/guides/auth/third-party/firebase-auth

[^5]: https://developer.chrome.com/docs/extensions/reference/api/contextMenus

[^6]: https://developer.chrome.com/docs/extensions/develop/ui/context-menu

[^7]: https://firebase.google.com/docs/auth/web/chrome-extension

[^8]: https://chromewebstore.google.com/detail/prompt-library-llm-prompt/gjohhcmdjhggglfjojmepolgmcdoceif

[^9]: https://supabase.com/docs/guides/getting-started/ai-prompts

[^10]: https://teamai.com/shared-prompt-library/

[^11]: https://makerkit.dev/docs/next-supabase-turbo/development/permissions-and-roles

[^12]: https://trophy.so/blog/how-to-build-an-xp-feature

[^13]: https://supabase.com/docs/guides/getting-started/ai-prompts/declarative-database-schema

[^14]: https://www.reddit.com/r/Supabase/comments/1625pdd/should_i_create_a_separate_likes_table/

[^15]: https://vault.nimc.gov.ng/blog/supabase-database-schema-your-guide-to-database-design-1764798040

[^16]: https://stackoverflow.com/questions/56768235/how-do-i-retain-format-when-getting-text-from-chrome-context-menu

[^17]: https://stackoverflow.com/questions/27892282/copy-selected-text-via-a-context-menu-option-in-a-chrome-extension

[^18]: https://www.flashprompt.app/blog/right-click-save-prompt-chrome-extension-2026

[^19]: https://www.gainsight.com/blog/community-gamification/

[^20]: https://www.higherlogic.com/blog/gamification-community-forums/

[^21]: https://trophy.so/blog/when-your-app-needs-xp-system

[^22]: https://gamificationforteachers.com/classroom-xp-systems/

[^23]: https://www.growthengineering.co.uk/gamification-experience-points/

[^24]: https://www.mightynetworks.com/resources/community-gamification

[^25]: https://www.youtube.com/watch?v=WUD1RLSd3U0

[^26]: https://dev.to/kyleledbetter/supabase-dashboards-that-dont-suck-production-ready-analytics-without-the-setup-hell-330f

[^27]: https://github.com/itsmaleen/supabase-analytics

