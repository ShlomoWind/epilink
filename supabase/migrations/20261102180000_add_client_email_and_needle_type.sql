alter table public.clients
  add column if not exists email text,
  add column if not exists needle_type text;
