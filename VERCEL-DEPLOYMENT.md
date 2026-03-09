# Checklist para solucionar 404 en Vercel

Revisa estos puntos en tu proyecto de Vercel (Settings):

## 1. Framework Preset
**Settings → General → Framework Preset**
- Debe estar en **Next.js** (NO "Other")
- El `vercel.json` ya fuerza esto, pero verifica que no esté sobrescrito

## 2. Root Directory
**Settings → General → Root Directory**
- Debe estar **vacío** o `.` (la app está en la raíz del repo)

## 3. Build & Output Settings
**Settings → Build & Development Settings**
- **Build Command:** `npm run build` o `next build` (o vacío para usar el default)
- **Output Directory:** **vacío** (Next.js lo gestiona automáticamente)
- **Install Command:** `npm install` o vacío

## 4. Variables de entorno
**Settings → Environment Variables**
Asegúrate de tener:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## 5. Revisar logs del último deployment
**Deployments → [último deployment] → Building / Runtime**
- ¿El build terminó correctamente?
- ¿Hay errores en Runtime?

## 6. URL correcta
- ¿Estás usando la URL de **Production** (no Preview)?
- La URL de producción suele ser: `tu-proyecto.vercel.app`
