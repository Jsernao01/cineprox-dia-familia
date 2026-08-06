-- ============================================================
-- Migración 3: configuración global (abrir/cerrar inscripciones)
-- Ejecutar en Supabase: SQL Editor -> New query -> pegar -> Run
-- ============================================================

create table if not exists public.configuracion (
  id                      int  primary key default 1,
  inscripciones_abiertas  boolean not null default true,
  updated_at              timestamptz not null default now(),
  constraint config_una_fila check (id = 1)
);

insert into public.configuracion (id, inscripciones_abiertas)
  values (1, true)
  on conflict (id) do nothing;

alter table public.configuracion enable row level security;
