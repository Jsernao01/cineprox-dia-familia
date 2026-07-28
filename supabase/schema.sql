-- ============================================================
-- CineProx - Día de la Familia :: Esquema de base de datos
-- Ejecutar en Supabase: SQL Editor -> New query -> pegar -> Run
-- ============================================================

-- Colaboradores inscritos
create table if not exists public.colaboradores (
  id                 uuid primary key default gen_random_uuid(),
  nombre_completo    text        not null,
  cedula             text        not null unique,
  ingreso_mes        smallint    not null check (ingreso_mes between 1 and 12),
  ingreso_anio       smallint    not null check (ingreso_anio between 1980 and 2100),
  antiguedad_meses   integer     not null default 0,
  asistencia         text        not null check (asistencia in ('solo','acompanado')),
  created_at         timestamptz not null default now()
);

-- Acompañantes (relación 1..N con colaborador)
create table if not exists public.acompanantes (
  id               uuid primary key default gen_random_uuid(),
  colaborador_id   uuid not null references public.colaboradores(id) on delete cascade,
  nombre_completo  text not null,
  edad             smallint not null check (edad >= 0 and edad <= 120),
  genero           text check (genero in ('masculino','femenino')),
  created_at       timestamptz not null default now()
);

create index if not exists idx_acompanantes_colaborador
  on public.acompanantes(colaborador_id);

-- ------------------------------------------------------------
-- Seguridad (RLS):
-- El servidor usa la SERVICE ROLE KEY, que ignora RLS. Habilitamos
-- RLS y NO creamos políticas públicas, de modo que la anon key no
-- pueda leer ni escribir directamente. Todo pasa por las API routes.
-- ------------------------------------------------------------
alter table public.colaboradores enable row level security;
alter table public.acompanantes  enable row level security;
