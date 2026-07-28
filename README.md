# CineProx · Día de la Familia

Aplicación web para el registro de colaboradores de CineProx y sus acompañantes
al evento **Día de la Familia**, con un panel administrativo (dashboard, tabla y
exportación a Excel).

Stack: **Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres)
· Recharts · SheetJS (xlsx)**. Pensada para desplegarse gratis en **Vercel**.

---

## 1. Requisitos

- Node.js 18.18+ (recomendado 20+)
- Una cuenta gratuita de [Supabase](https://supabase.com)
- Una cuenta de [Vercel](https://vercel.com) para el despliegue

## 2. Configurar la base de datos (Supabase)

1. Crea un proyecto nuevo en Supabase.
2. Ve a **SQL Editor → New query**, pega el contenido de
   [`supabase/schema.sql`](supabase/schema.sql) y ejecútalo (Run).
   Esto crea las tablas `colaboradores` y `acompanantes`, la restricción de
   **cédula única** y habilita RLS (todo el acceso pasa por el servidor).
3. En **Project Settings → API** copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (secreta) → `SUPABASE_SERVICE_ROLE_KEY`

## 3. Variables de entorno

Copia `.env.local.example` a `.env.local` y complétalo:

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

ADMIN_USER=admin
ADMIN_PASSWORD=una-clave-fuerte
AUTH_SECRET=<cadena larga aleatoria>   # genera con: openssl rand -base64 32
```

- `ADMIN_USER` / `ADMIN_PASSWORD`: credenciales del panel administrativo.
- `AUTH_SECRET`: firma la cookie de sesión del admin (httpOnly).

## 4. Ejecutar en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000

- **/** — pantalla de bienvenida pública
- **/inscripcion** — formulario de registro
- **/admin/login** — acceso administrativo
- **/admin/dashboard** — panel (protegido)

## 5. Desplegar en Vercel

1. Sube el proyecto a un repositorio de GitHub.
2. En Vercel: **Add New → Project → Import** ese repositorio.
3. En **Settings → Environment Variables** agrega las 6 variables del paso 3.
4. Deploy. Vercel detecta Next.js automáticamente.

> Con 500–600 inscritos te mantienes de sobra en los planes gratuitos tanto de
> Vercel como de Supabase.

---

## Estructura

```
src/
  app/
    page.tsx                     Landing pública
    inscripcion/page.tsx         Formulario de inscripción
    admin/login/page.tsx         Login administrativo
    admin/dashboard/page.tsx     Dashboard (KPIs, gráficas, tabla, detalle, export)
    api/
      inscripciones/route.ts     POST crear (público) · GET listar (protegido)
      auth/login/route.ts        Inicio de sesión
      auth/logout/route.ts       Cierre de sesión
  lib/
    supabaseAdmin.ts             Cliente servidor (service_role)
    auth.ts                      Sesión JWT + validación de credenciales
    utils.ts                     Cálculo de antigüedad, fechas
    stats.ts                     Indicadores del dashboard
    exportExcel.ts               Exportación a Excel (una fila por acompañante)
    types.ts                     Tipos compartidos
  middleware.ts                  Protege /admin/dashboard
supabase/schema.sql              Esquema de base de datos
```

## Reglas de negocio implementadas

- Antigüedad en meses calculada automáticamente desde mes/año de ingreso
  (ej.: Marzo 2023 → hoy = N meses). Campo de solo lectura.
- "Solo" oculta la sección de acompañantes; "Acompañado" la habilita.
- Máximo 4 acompañantes; cada tarjeta se puede eliminar.
- Campo **Género** aparece solo si la edad del acompañante es ≤ 14 años.
- Validaciones (cliente y servidor): campos obligatorios, sin nombres vacíos,
  edades entre 0 y 120, y **cédula única** (garantizada por la base de datos).
- Dashboard: colaboradores, acompañantes, total de asistentes, menores de 14,
  antigüedad promedio; gráfica de rangos de edad (0-5, 6-10, 11-14) y de género
  de menores; tabla con búsqueda, ordenamiento y paginación; vista de detalle
  con los acompañantes de cada colaborador.
- Exportar Excel: un único archivo con una fila por acompañante; si el
  colaborador va solo, aparece igualmente con las columnas de acompañante vacías.

## Notas

- La exportación usa `xlsx` (SheetJS) desde el registro de npm (`^0.18.5`). Si
  prefieres la última versión oficial, SheetJS recomienda instalar desde su CDN:
  `npm i https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`.
- Autenticación pensada para **un** administrador. Para varios admins se puede
  migrar a Supabase Auth sin tocar el resto de la app.
- Recomendado mantener Next.js actualizado a la última 14.2.x por parches de
  seguridad: `npm i next@^14.2.33`.
