alter table public.clients
  add column if not exists outstanding_balance numeric(10, 2) not null default 0
  check (outstanding_balance >= 0);
