-- ============================================================
-- Migración 2: estado civil, sede y parentesco (categoría)
-- Ejecutar en Supabase: SQL Editor -> New query -> pegar -> Run
-- Es segura de correr aunque ya existan datos.
-- ============================================================

alter table public.colaboradores add column if not exists estado_civil text;
alter table public.colaboradores add column if not exists sede         text;
alter table public.acompanantes  add column if not exists categoria    text;
