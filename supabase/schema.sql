-- ============================================================
-- CineProx - Día de la Familia :: Esquema de base de datos
-- Ejecutar en Supabase: SQL Editor -> New query -> pegar -> Run
-- ============================================================

-- Colaboradores inscritos
create table if not exists public.colaboradores (
  id                 uuid primary key default gen_random_uuid(),
  nombre_completo    text        not null,
  cedula             text        not null unique,
  sede               text,
  estado_civil       text,
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
  categoria        text,
  edad             smallint not null check (edad >= 0 and edad <= 120),
  genero           text check (genero in ('masculino','femenino')),
  created_at       timestamptz not null default now()
);

create index if not exists idx_acompanantes_colaborador
  on public.acompanantes(colaborador_id);

-- Si ya tenías las tablas creadas antes, corre también:
--   alter table public.colaboradores add column if not exists estado_civil text;
--   alter table public.colaboradores add column if not exists sede         text;
--   alter table public.acompanantes  add column if not exists categoria    text;


-- Configuración global (abrir/cerrar inscripciones)
create table if not exists public.configuracion (
  id                      int  primary key default 1,
  inscripciones_abiertas  boolean not null default true,
  updated_at              timestamptz not null default now(),
  constraint config_una_fila check (id = 1)
);
insert into public.configuracion (id, inscripciones_abiertas)
  values (1, true) on conflict (id) do nothing;

-- Seguridad (RLS): todo el acceso pasa por el servidor (service_role).
alter table public.colaboradores enable row level security;
alter table public.acompanantes  enable row level security;
alter table public.configuracion  enable row level security;
