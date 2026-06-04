# EDUbit

Base funcional de la Iteración 1: aplicación web pública con autenticación, roles, persistencia en Supabase y paneles mínimos para administrador, docentes y alumnos.

## Stack

- Next.js App Router
- React
- TypeScript
- TailwindCSS
- Supabase Auth
- Supabase PostgreSQL
- Supabase Row Level Security
- Vercel

## Alcance implementado

- Página pública inicial.
- Login y logout con Supabase Auth.
- Persistencia de sesión mediante cookies de Supabase.
- Protección server-side por rol.
- Panel administrador en `/admin`.
- Gestión básica de usuarios en `/admin/users`.
- Gestión de cursos, docentes e inscripciones en `/admin/courses`.
- Panel docente en `/teacher` y cursos propios en `/teacher/courses`.
- Panel alumno en `/student` y cursos propios en `/student/courses`.
- Página de acceso denegado.
- SQL para tablas, índices y políticas RLS.

## Fuera de alcance para Iteración 1

No se implementan transacciones EDUbit, bloques, hashes, nonce, proof of work, marketplace, votaciones, badges, smart contracts ni estadísticas avanzadas.

## Configuración local

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
```

La clave `SUPABASE_SERVICE_ROLE_KEY` se usa solo en server actions para crear usuarios administrados. No debe exponerse en componentes cliente ni commitearse.

## Configuración de Supabase

1. Crear un proyecto en Supabase.
2. Copiar URL, anon key y service role key a `.env.local`.
3. Ejecutar el script [supabase/iteration-1.sql](supabase/iteration-1.sql) en el SQL Editor.
4. Crear el primer usuario administrador desde Supabase Auth.
5. Insertar su perfil en `public.profiles` usando el bloque comentado al final del SQL.

Ejemplo:

```sql
insert into public.profiles (id, email, full_name, role)
values ('UUID_DEL_USUARIO', 'admin@edubit.local', 'Administrador EDUbit', 'admin');
```

## Correr la app

```bash
npm run dev
```

Abrir `http://localhost:3000`.

## Deploy en Vercel

1. Subir el repositorio a GitHub.
2. Importar el proyecto en Vercel.
3. Configurar las mismas variables de entorno.
4. Ejecutar deploy.

## Decisiones técnicas

- Se implementa la opción B del documento: creación de docentes y alumnos desde una acción server-side protegida por rol admin.
- No hay registro público en Iteración 1.
- Las consultas de UI filtran por usuario autenticado y las políticas RLS refuerzan la seguridad en base de datos.
- No se usa LocalStorage como fuente de datos de negocio.

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
