# EDUbit

Aplicación educativa inspirada en blockchain. La base actual cubre autenticación, roles, cursos, usuarios, solicitudes de acceso, recuperación de cuenta y seguridad transversal.

## Stack

- Next.js App Router
- React
- TypeScript
- TailwindCSS
- Supabase Auth
- Supabase PostgreSQL
- Supabase Row Level Security
- Vercel

## Alcance Implementado

- Login y logout con Supabase Auth.
- Persistencia de sesión mediante cookies de Supabase.
- Protección server-side por rol y estado.
- Panel administrador en `/admin`.
- Gestión de usuarios en `/admin/users`.
- Invitación de usuarios en `/admin/users/invite`.
- Detalle administrativo de usuario en `/admin/users/[id]`.
- Gestión de cursos, docentes e inscripciones en `/admin/courses`.
- Panel docente en `/teacher` y cursos propios en `/teacher/courses`.
- Panel alumno en `/student` y cursos propios en `/student/courses`.
- Recuperación de contraseña en `/forgot-password`.
- Reset de contraseña en `/reset-password`.
- Solicitud pública de acceso en `/request-access`.
- Revisión de solicitudes en `/admin/access-requests`.
- Perfil propio en `/account/profile`.
- Cambio de contraseña autenticado en `/account/security`.
- Onboarding de invitados en `/onboarding`.
- Auditoría mínima en `/admin/audit-logs`.
- Pantallas de cuenta pendiente, bloqueada, deshabilitada e incompleta.

## Fuera De Alcance

No se implementan todavía transacciones EDUbit, bloques, hashes, nonce, proof of work, marketplace, votaciones, badges, smart contracts, estadísticas avanzadas ni Blockchain Lab.

## Configuración Local

Instalar dependencias:

```bash
npm install
```

Crear `.env.local` a partir de `.env.example`:

```bash
cp .env.example .env.local
```

Completar:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

La clave `SUPABASE_SERVICE_ROLE_KEY` se usa solo en server actions. Nunca debe exponerse al frontend ni commitearse.

## Configuración De Supabase

1. Crear un proyecto en Supabase.
2. Copiar URL, anon key y service role key a `.env.local`.
3. Ejecutar [supabase/iteration-1.sql](supabase/iteration-1.sql) en el SQL Editor.
4. Ejecutar [supabase/iteration-1-1.sql](supabase/iteration-1-1.sql) en el SQL Editor.
5. Crear el primer usuario administrador desde Supabase Auth.
6. Insertar su perfil como admin activo:

```sql
insert into public.profiles (id, email, full_name, role, status)
values ('UUID_DEL_USUARIO', 'admin@edubit.local', 'Administrador EDUbit', 'admin', 'active')
on conflict (id) do update
set role = 'admin',
    status = 'active',
    full_name = excluded.full_name;
```

## Supabase Auth

Configurar redirect URLs para recuperación e invitación:

```text
http://localhost:3000/reset-password
http://localhost:3000/onboarding
http://localhost:3000/auth/callback
https://TU-DOMINIO-VERCEL/reset-password
https://TU-DOMINIO-VERCEL/onboarding
https://TU-DOMINIO-VERCEL/auth/callback
```

Para emails reales de recuperación e invitación, revisar SMTP en Supabase.

## Correr La App

```bash
npm run dev
```

Abrir `http://localhost:3000`.

## Deploy En Vercel

1. Subir el repositorio a GitHub.
2. Importar el proyecto en Vercel.
3. Configurar variables de entorno:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=https://TU-DOMINIO-VERCEL
```

4. Ejecutar deploy.

## Decisiones Técnicas

- La creación e invitación de usuarios se ejecuta server-side con service role.
- La recuperación de contraseña usa Supabase Auth y mensajes neutros.
- No se guardan contraseñas ni tokens sensibles en tablas propias.
- `profiles.status = 'active'` es obligatorio para acceder a dashboards.
- Los estados `pending`, `invited`, `blocked` y `disabled` redirigen a pantallas controladas.
- Las tablas nuevas tienen RLS activado.
- Los logs de auditoría no aceptan escritura directa desde cliente.
- No se usa LocalStorage como fuente de datos de negocio.

## Pendientes Recomendados Para Iteración 1.2

- Templates de email institucionales en Supabase.
- Reenvío avanzado de invitación con expiración visible.
- Gestión más fina de asociaciones usuario-curso desde detalle de usuario.
- Pruebas E2E de auth/onboarding.
- Panel específico para configuración institucional.

## Pendientes Iteración 2

- Transacciones EDUbit.
- Bloques, hashes y hash anterior.
- Nonce y simulación de proof of work.
- Marketplace de beneficios.
- Solicitudes de canje.
- Votaciones.
- Badges.
- Smart contracts visuales.
- Estadísticas y Blockchain Lab.
- Carga masiva de alumnos.
