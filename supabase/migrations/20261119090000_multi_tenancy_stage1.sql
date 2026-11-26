  begin;

  create function public.appointment_utc_range(
    p_appointment_date timestamptz,
    p_estimated_duration integer
  )
  returns tsrange
  language plpgsql
  immutable
  strict
  parallel safe
  set search_path = pg_catalog
  as $$
  declare
    utc_start timestamp without time zone;
  begin
    if p_estimated_duration <= 0 then
      raise exception 'Estimated appointment duration must be greater than zero';
    end if;

    utc_start := p_appointment_date at time zone 'UTC';

    return tsrange(
      utc_start,
      utc_start + make_interval(mins => p_estimated_duration),
      '[)'
    );
  end
  $$;

  lock table public.clients, public.appointments in access exclusive mode;

  create temporary table _epilink_migration_baseline (
    clients_before bigint not null,
    appointments_before bigint not null
  ) on commit drop;

  insert into _epilink_migration_baseline
  select
    (select count(*) from public.clients),
    (select count(*) from public.appointments);

  do $$
  declare
    unexpected_policies text;
    invalid_fk_count integer;
  begin
    if to_regclass('public.clients') is null
      or to_regclass('public.appointments') is null then
      raise exception 'Expected public.clients and public.appointments';
    end if;

    if to_regprocedure('gen_random_uuid()') is null then
      raise exception 'gen_random_uuid() is unavailable';
    end if;

    if exists (
      select 1
      from public.appointments a
      left join public.clients c on c.id = a.client_id
      where c.id is null
    ) then
      raise exception 'Appointments without a matching client exist';
    end if;

    if exists (
      select 1
      from pg_attribute
      where attrelid in (
        'public.clients'::regclass,
        'public.appointments'::regclass
      )
        and attname in ('clinic_id', 'is_active')
        and attnum > 0
        and not attisdropped
    ) then
      raise exception 'Unexpected pre-existing clinic_id or is_active column';
    end if;

    if exists (
      -- This metadata contract matches the live source-schema inventory.
      -- Default expressions are compared using pg_get_expr()'s canonical output.
      with expected(
        table_name,
        column_name,
        data_type,
        is_nullable,
        default_expression,
        identity_kind,
        generated_kind
      ) as (
        values
          ('clients', 'id', 'uuid', 'NO', 'gen_random_uuid()', '', ''),
          ('clients', 'full_name', 'text', 'NO', null, '', ''),
          ('clients', 'phone', 'text', 'NO', null, '', ''),
          ('clients', 'created_at', 'timestamp with time zone', 'NO',
          'timezone(''utc''::text, now())', '', ''),
          ('clients', 'email', 'text', 'YES', null, '', ''),
          ('clients', 'needle_type', 'text', 'YES', null, '', ''),
          ('clients', 'outstanding_balance', 'numeric(10,2)', 'NO', '0', '', ''),
          ('appointments', 'id', 'uuid', 'NO', 'gen_random_uuid()', '', ''),
          ('appointments', 'client_id', 'uuid', 'NO', null, '', ''),
          ('appointments', 'appointment_date', 'timestamp with time zone', 'NO',
          null, '', ''),
          ('appointments', 'estimated_duration', 'integer', 'NO', '30', '', ''),
          ('appointments', 'actual_duration', 'integer', 'YES', null, '', ''),
          ('appointments', 'calculated_price', 'numeric(10,2)', 'YES', null, '', ''),
          ('appointments', 'status', 'text', 'NO', '''scheduled''::text', '', ''),
          ('appointments', 'created_at', 'timestamp with time zone', 'NO',
          'timezone(''utc''::text, now())', '', '')
      ),
      actual as (
        select
          c.table_name,
          c.column_name,
          format_type(a.atttypid, a.atttypmod) as data_type,
          case when a.attnotnull then 'NO' else 'YES' end as is_nullable,
          pg_get_expr(ad.adbin, ad.adrelid) as default_expression,
          a.attidentity::text as identity_kind,
          a.attgenerated::text as generated_kind
        from information_schema.columns c
        join pg_namespace n
          on n.nspname = c.table_schema
        join pg_class r
          on r.relnamespace = n.oid
        and r.relname = c.table_name
        join pg_attribute a
          on a.attrelid = r.oid
        and a.attname = c.column_name
        and a.attnum > 0
        and not a.attisdropped
        left join pg_attrdef ad
          on ad.adrelid = r.oid
        and ad.adnum = a.attnum
        where c.table_schema = 'public'
          and c.table_name in ('clients', 'appointments')
      )
      select 1
      from expected e
      left join actual a
        on a.table_name = e.table_name
      and a.column_name = e.column_name
      where a.column_name is null
        or a.data_type <> e.data_type
        or a.is_nullable <> e.is_nullable
        or a.default_expression is distinct from e.default_expression
        or a.identity_kind is distinct from e.identity_kind
        or a.generated_kind is distinct from e.generated_kind
    ) then
      raise exception
        'Source column type, nullability, default, identity, or generated metadata differs from the supported copy contract';
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name in ('clients', 'appointments')
      group by table_name
      having count(*) <> case table_name
        when 'clients' then 7
        when 'appointments' then 8
      end
    ) then
      raise exception 'Source table column inventory differs from the supported copy contract';
    end if;

    if exists (
      select 1
      from public.appointments
      where status is not null
        and status not in ('scheduled', 'completed')
    ) then
      raise exception 'Unexpected appointment status requires manual review';
    end if;

    if exists (
      select 1
      from public.appointments
      where estimated_duration is null
        or estimated_duration <= 0
    ) then
      raise exception
        'Appointments with invalid estimated_duration exist; correct them before running the migration';
    end if;

    if exists (
      select 1
      from public.appointments
      where status = 'completed'
        and (
          actual_duration is null
          or actual_duration <= 0
          or calculated_price is null
          or calculated_price < 0
        )
    ) then
      raise exception
        'Completed appointments need a valid actual duration and price before migration';
    end if;

    if exists (
      with expected(table_name, column_name) as (
        values
          ('clients', 'created_at'),
          ('clients', 'email'),
          ('clients', 'full_name'),
          ('clients', 'id'),
          ('clients', 'needle_type'),
          ('clients', 'outstanding_balance'),
          ('clients', 'phone'),
          ('appointments', 'actual_duration'),
          ('appointments', 'appointment_date'),
          ('appointments', 'calculated_price'),
          ('appointments', 'client_id'),
          ('appointments', 'created_at'),
          ('appointments', 'estimated_duration'),
          ('appointments', 'id'),
          ('appointments', 'status')
      ),
      actual(table_name, column_name) as (
        select table_name, column_name
        from information_schema.columns
        where table_schema = 'public'
          and table_name in ('clients', 'appointments')
      )
      select table_name, column_name from actual
      except
      select table_name, column_name from expected
    ) or exists (
      with expected(table_name, column_name) as (
        values
          ('clients', 'created_at'),
          ('clients', 'email'),
          ('clients', 'full_name'),
          ('clients', 'id'),
          ('clients', 'needle_type'),
          ('clients', 'outstanding_balance'),
          ('clients', 'phone'),
          ('appointments', 'actual_duration'),
          ('appointments', 'appointment_date'),
          ('appointments', 'calculated_price'),
          ('appointments', 'client_id'),
          ('appointments', 'created_at'),
          ('appointments', 'estimated_duration'),
          ('appointments', 'id'),
          ('appointments', 'status')
      ),
      actual(table_name, column_name) as (
        select table_name, column_name
        from information_schema.columns
        where table_schema = 'public'
          and table_name in ('clients', 'appointments')
      )
      select table_name, column_name from expected
      except
      select table_name, column_name from actual
    ) then
      raise exception
        'Pilot copy column allowlist does not match the existing schema; review every source column before migration';
    end if;

    select string_agg(format('%I.%I', tablename, policyname), ', ')
    into unexpected_policies
    from pg_policies
    where schemaname = 'public'
      and tablename in ('clients', 'appointments')
      and not (
        (tablename = 'clients'
        and policyname =
          'Allow all operations for authenticated users on clients')
        or
        (tablename = 'appointments'
        and policyname =
          'Allow all operations for authenticated users on appointments')
      );

    if unexpected_policies is not null then
      raise exception 'Unexpected RLS policies require manual review: %',
        unexpected_policies;
    end if;

    if exists (
      select 1
      from pg_class c
      where c.oid in (
        'public.clients'::regclass,
        'public.appointments'::regclass
      )
        and not c.relrowsecurity
    ) then
      raise exception 'RLS must be enabled on clients and appointments';
    end if;

    if (
      select count(*)
      from pg_policies
      where schemaname = 'public'
        and tablename in ('clients', 'appointments')
    ) <> 2
      or exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and (
            (tablename = 'clients'
              and policyname =
                'Allow all operations for authenticated users on clients')
            or
            (tablename = 'appointments'
              and policyname =
                'Allow all operations for authenticated users on appointments')
          )
          and (
            permissive <> 'PERMISSIVE'
            or cmd <> 'ALL'
            or roles <> array['authenticated']::name[]
            or qual is distinct from 'true'
            or with_check is distinct from 'true'
          )
      ) then
      raise exception
        'Existing policies must be exactly the approved permissive authenticated ALL policies with true USING and WITH CHECK';
    end if;

    select count(*) into invalid_fk_count
    from pg_constraint c
    where c.conrelid = 'public.appointments'::regclass
      and c.contype = 'f'
      and c.confrelid = 'public.clients'::regclass
      and (
        c.conname <> 'appointments_client_id_fkey'
        or c.conkey <> array[
          (
            select a.attnum
            from pg_attribute a
            where a.attrelid = 'public.appointments'::regclass
              and a.attname = 'client_id'
              and a.attnum > 0
              and not a.attisdropped
          )
        ]::smallint[]
        or c.confkey <> array[
          (
            select a.attnum
            from pg_attribute a
            where a.attrelid = 'public.clients'::regclass
              and a.attname = 'id'
              and a.attnum > 0
              and not a.attisdropped
          )
        ]::smallint[]
        or c.confdeltype <> 'c'
        or not c.convalidated
      );

    if invalid_fk_count <> 0 or (
      select count(*)
      from pg_constraint c
      where c.conrelid = 'public.appointments'::regclass
        and c.contype = 'f'
        and c.confrelid = 'public.clients'::regclass
    ) <> 1 then
      raise exception
        'Expected exactly appointments_client_id_fkey(client_id) REFERENCES clients(id) ON DELETE CASCADE';
    end if;

    select string_agg(
      format('%s: %s', i.indexrelid::regclass, pg_get_indexdef(i.indexrelid)),
      E'\n' order by i.indexrelid::regclass::text
    )
    into unexpected_policies
    from pg_index i
    where i.indrelid in (
        'public.clients'::regclass,
        'public.appointments'::regclass
      )
      and i.indisunique
      and not i.indisprimary
      and (i.indpred is not null or i.indexprs is not null);

    if unexpected_policies is not null then
      raise exception
        'Partial or expression unique indexes require manual review:%',
        E'\n' || unexpected_policies;
    end if;

    select string_agg(
      format('%s: %s', i.indexrelid::regclass, pg_get_indexdef(i.indexrelid)),
      E'\n' order by i.indexrelid::regclass::text
    )
    into unexpected_policies
    from pg_index i
    where i.indrelid in (
        'public.clients'::regclass,
        'public.appointments'::regclass
      )
      and i.indisunique
      and not i.indisprimary
      and not exists (
        select 1
        from unnest(i.indkey) with ordinality as k(attnum, ordinality)
        join pg_attribute a
          on a.attrelid = i.indrelid
        and a.attnum = k.attnum
        and not a.attisdropped
        where k.ordinality <= i.indnkeyatts
          and a.attname = 'clinic_id'
      )
      and not exists (
        select 1
        from unnest(i.indkey) with ordinality as k(attnum, ordinality)
        join pg_attribute a
          on a.attrelid = i.indrelid
        and a.attnum = k.attnum
        and not a.attisdropped
        where k.ordinality <= i.indnkeyatts
          and a.attname = 'id'
      );

    if unexpected_policies is not null then
      raise exception
        'Global unique indexes without clinic_id or regenerated id require review:%',
        E'\n' || unexpected_policies;
    end if;
  end
  $$;

  create temporary table _clinic_seed (
    clinic_key text primary key,
    clinic_id uuid not null default gen_random_uuid(),
    name text not null
  ) on commit drop;

  create temporary table _membership_seed (
    clinic_key text not null,
    user_id uuid not null,
    primary key (clinic_key, user_id)
  ) on commit drop;

  insert into _clinic_seed (clinic_key, name) values
    ('A', 'malki'),
    ('B', 'st');

  insert into _membership_seed (clinic_key, user_id) values
    ('A', '8c3e2f30-774f-469f-b7fa-474ad4f83be6'),
    ('A', '171d8b76-db1d-4399-b1e3-deecde9c39d9'),
    ('B', 'f14e6f0b-119d-496a-803c-063be5d51ab0');

  do $$
  begin
    if (select count(*) from _clinic_seed) <> 2
      or not exists (select 1 from _clinic_seed where clinic_key = 'A')
      or not exists (select 1 from _clinic_seed where clinic_key = 'B') then
      raise exception 'Provide exactly two approved clinics';
    end if;

    if exists (
      select 1 from _clinic_seed
      where name is null or btrim(name) = '' or name like '<%'
    ) then
      raise exception 'Replace all clinic name placeholders';
    end if;

    if not exists (select 1 from _membership_seed where clinic_key = 'A')
      or not exists (select 1 from _membership_seed where clinic_key = 'B') then
      raise exception 'Provide at least one approved user per clinic';
    end if;

    if exists (
      select 1
      from _membership_seed m
      left join auth.users u on u.id = m.user_id
      where u.id is null
    ) then
      raise exception 'A membership user_id is not present in auth.users';
    end if;
  end
  $$;

  create table public.clinics (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    created_at timestamptz not null default now()
  );

  create table public.clinic_memberships (
    clinic_id uuid not null
      references public.clinics(id) on delete restrict,
    user_id uuid not null
      references auth.users(id) on delete restrict,
    created_at timestamptz not null default now(),
    primary key (clinic_id, user_id)
  );

  create index clinic_memberships_user_clinic_idx
    on public.clinic_memberships (user_id, clinic_id);

  insert into public.clinics (id, name)
  select clinic_id, name from _clinic_seed;

  insert into public.clinic_memberships (clinic_id, user_id)
  select c.clinic_id, m.user_id
  from _membership_seed m
  join _clinic_seed c using (clinic_key);

  alter table public.clients
    add column clinic_id uuid,
    add column is_active boolean not null default true;

  alter table public.appointments
    add column clinic_id uuid;

  update public.clients
  set clinic_id = (select clinic_id from _clinic_seed where clinic_key = 'A');

  update public.appointments
  set clinic_id = (select clinic_id from _clinic_seed where clinic_key = 'A');

  do $$
  begin
    if exists (
      select 1
      from public.appointments a
      join public.appointments b
        on b.id <> a.id
      and b.clinic_id is not distinct from a.clinic_id
      and a.status = 'scheduled'
      and b.status = 'scheduled'
      and public.appointment_utc_range(
            a.appointment_date, a.estimated_duration
          ) &&
          public.appointment_utc_range(
            b.appointment_date, b.estimated_duration
          )
    ) then
      raise exception 'Existing overlapping appointments require manual review';
    end if;
  end
  $$;

  create temporary table _client_copy_map (
    source_client_id uuid primary key,
    clinic_b_client_id uuid not null unique
  ) on commit drop;

  insert into _client_copy_map (source_client_id, clinic_b_client_id)
  select id, gen_random_uuid()
  from public.clients
  where clinic_id = (select clinic_id from _clinic_seed where clinic_key = 'A');

  insert into public.clients (
    id, clinic_id, full_name, phone, created_at, email,
    needle_type, outstanding_balance, is_active
  )
  select
    m.clinic_b_client_id,
    (select clinic_id from _clinic_seed where clinic_key = 'B'),
    c.full_name,
    c.phone,
    c.created_at,
    c.email,
    c.needle_type,
    c.outstanding_balance,
    c.is_active
  from public.clients c
  join _client_copy_map m on m.source_client_id = c.id;

  create temporary table _appointment_copy_map (
    source_appointment_id uuid primary key,
    clinic_b_appointment_id uuid not null unique
  ) on commit drop;

  insert into _appointment_copy_map (source_appointment_id, clinic_b_appointment_id)
  select id, gen_random_uuid()
  from public.appointments
  where clinic_id = (select clinic_id from _clinic_seed where clinic_key = 'A');

  insert into public.appointments (
    id, clinic_id, client_id, appointment_date, estimated_duration,
    actual_duration, calculated_price, status, created_at
  )
  select
    am.clinic_b_appointment_id,
    (select clinic_id from _clinic_seed where clinic_key = 'B'),
    cm.clinic_b_client_id,
    a.appointment_date,
    a.estimated_duration,
    a.actual_duration,
    a.calculated_price,
    a.status,
    a.created_at
  from public.appointments a
  join _appointment_copy_map am on am.source_appointment_id = a.id
  join _client_copy_map cm on cm.source_client_id = a.client_id
  where a.clinic_id = (select clinic_id from _clinic_seed where clinic_key = 'A');

  do $$
  declare
    baseline record;
    clinic_a uuid;
    clinic_b uuid;
  begin
    select * into baseline from _epilink_migration_baseline;
    select clinic_id into clinic_a from _clinic_seed where clinic_key = 'A';
    select clinic_id into clinic_b from _clinic_seed where clinic_key = 'B';

    if clinic_a = clinic_b then
      raise exception 'Pilot clinic IDs must be distinct';
    end if;

    if exists (
      select 1
      from _client_copy_map
      where source_client_id = clinic_b_client_id
    ) or exists (
      select 1
      from _appointment_copy_map
      where source_appointment_id = clinic_b_appointment_id
    ) then
      raise exception 'Copied client and appointment IDs must differ from source IDs';
    end if;

    if (select count(*) from _client_copy_map) <> baseline.clients_before
      or (select count(*) from _appointment_copy_map)
        <> baseline.appointments_before then
      raise exception 'Copy maps do not cover every source row';
    end if;

    if (select count(*) from public.clients) <> 2 * baseline.clients_before
      or (select count(*) from public.appointments) <> 2 * baseline.appointments_before then
      raise exception 'Pilot row counts did not double';
    end if;

    if (select count(*) from public.clients where clinic_id = clinic_a)
        <> baseline.clients_before
      or (select count(*) from public.clients where clinic_id = clinic_b)
        <> baseline.clients_before
      or (select count(*) from public.appointments where clinic_id = clinic_a)
        <> baseline.appointments_before
      or (select count(*) from public.appointments where clinic_id = clinic_b)
        <> baseline.appointments_before then
      raise exception 'Per-clinic pilot counts do not match the baseline';
    end if;

    if exists (
      select 1
      from public.appointments a
      left join public.clients c on c.id = a.client_id
      where c.id is null or a.clinic_id is distinct from c.clinic_id
    ) then
      raise exception 'Missing or cross-clinic appointment/client relationship';
    end if;

    if exists (
      select 1
      from _client_copy_map m
      join public.clients source on source.id = m.source_client_id
      left join public.clients copied on copied.id = m.clinic_b_client_id
      where copied.id is null
        or copied.clinic_id is distinct from clinic_b
        or row(
              copied.full_name, copied.phone, copied.email, copied.needle_type,
              copied.outstanding_balance, copied.is_active, copied.created_at
            ) is distinct from row(
              source.full_name, source.phone, source.email, source.needle_type,
              source.outstanding_balance, source.is_active, source.created_at
            )
    ) then
      raise exception 'A copied client differs from its source';
    end if;

    if exists (
      select 1
      from _appointment_copy_map am
      join public.appointments source
        on source.id = am.source_appointment_id
      join _client_copy_map cm
        on cm.source_client_id = source.client_id
      left join public.appointments copied
        on copied.id = am.clinic_b_appointment_id
      where copied.id is null
        or copied.clinic_id is distinct from clinic_b
        or row(
              copied.client_id, copied.appointment_date,
              copied.estimated_duration, copied.actual_duration,
              copied.calculated_price, copied.status, copied.created_at
            ) is distinct from row(
              cm.clinic_b_client_id, source.appointment_date,
              source.estimated_duration, source.actual_duration,
              source.calculated_price, source.status, source.created_at
            )
    ) then
      raise exception 'A copied appointment or client mapping differs from its source';
    end if;
  end
  $$;

  alter table public.clients
    alter column clinic_id set not null,
    add constraint clients_clinic_id_id_key unique (clinic_id, id),
    add constraint clients_clinic_id_fkey
      foreign key (clinic_id)
      references public.clinics(id) on delete restrict;

  alter table public.appointments
    alter column clinic_id set not null,
    add constraint appointments_clinic_id_fkey
      foreign key (clinic_id)
      references public.clinics(id) on delete restrict,
    add constraint appointments_status_check
      check (status in ('scheduled', 'completed')),
    add constraint appointments_estimated_duration_check
      check (estimated_duration is not null and estimated_duration > 0);

  alter table public.appointments
    drop constraint appointments_client_id_fkey;

  alter table public.appointments
    add constraint appointments_clinic_client_fkey
    foreign key (clinic_id, client_id)
    references public.clients (clinic_id, id)
    on delete restrict;

  alter table public.appointments
    add constraint appointments_clinic_id_id_key unique (clinic_id, id);

  create extension if not exists btree_gist;

  alter table public.appointments
    add constraint appointments_no_overlap
    exclude using gist (
      clinic_id with =,
      public.appointment_utc_range(
        appointment_date, estimated_duration
      ) with &&
    )
    where (status = 'scheduled');

  create index clients_clinic_id_idx
    on public.clients (clinic_id);

  create index appointments_clinic_date_idx
    on public.appointments (clinic_id, appointment_date);

  create table public.client_balance_entries (
    id uuid primary key default gen_random_uuid(),
    clinic_id uuid not null,
    client_id uuid not null,
    appointment_id uuid,
    entry_type text not null
      check (entry_type in (
        'opening', 'manual', 'treatment', 'treatment_correction'
      )),
    amount numeric(10, 2) not null
      check (amount <> 0 and abs(amount) <= 99999999.99),
    note text not null check (btrim(note) <> ''),
    created_by uuid references auth.users(id) on delete restrict,
    created_at timestamptz not null default now(),
    constraint client_balance_entries_client_fkey
      foreign key (clinic_id, client_id)
      references public.clients (clinic_id, id) on delete restrict,
    constraint client_balance_entries_appointment_fkey
      foreign key (clinic_id, appointment_id)
      references public.appointments (clinic_id, id) on delete restrict,
    constraint client_balance_entries_source_check check (
      (entry_type = 'opening' and created_by is null and appointment_id is null)
      or
      (entry_type = 'manual' and created_by is not null and appointment_id is null)
      or
      (entry_type in ('treatment', 'treatment_correction')
        and appointment_id is not null)
    )
  );

  create index client_balance_entries_clinic_client_idx
    on public.client_balance_entries (clinic_id, client_id, created_at);

  create unique index client_balance_entries_treatment_once_idx
    on public.client_balance_entries (appointment_id)
    where entry_type = 'treatment';

  insert into public.client_balance_entries (
    clinic_id, client_id, entry_type, amount, note
  )
  select
    clinic_id,
    id,
    'opening',
    outstanding_balance,
    'Opening balance imported by multi-tenancy migration'
  from public.clients
  where outstanding_balance <> 0;

  drop policy "Allow all operations for authenticated users on clients"
    on public.clients;

  drop policy "Allow all operations for authenticated users on appointments"
    on public.appointments;

  alter table public.clinics enable row level security;
  alter table public.clinic_memberships enable row level security;
  alter table public.clients enable row level security;
  alter table public.appointments enable row level security;
  alter table public.client_balance_entries enable row level security;

  create policy clinic_memberships_select_self
    on public.clinic_memberships
    for select to authenticated
    using (user_id = (select auth.uid()));

  create policy clinics_select_member
    on public.clinics
    for select to authenticated
    using (
      exists (
        select 1
        from public.clinic_memberships m
        where m.clinic_id = clinics.id
          and m.user_id = (select auth.uid())
      )
    );

  create policy clients_select_member
    on public.clients
    for select to authenticated
    using (
      exists (
        select 1
        from public.clinic_memberships m
        where m.clinic_id = clients.clinic_id
          and m.user_id = (select auth.uid())
      )
    );

  create policy clients_insert_member
    on public.clients
    for insert to authenticated
    with check (
      exists (
        select 1
        from public.clinic_memberships m
        where m.clinic_id = clients.clinic_id
          and m.user_id = (select auth.uid())
      )
    );

  create policy clients_update_member
    on public.clients
    for update to authenticated
    using (
      exists (
        select 1
        from public.clinic_memberships m
        where m.clinic_id = clients.clinic_id
          and m.user_id = (select auth.uid())
      )
    )
    with check (
      exists (
        select 1
        from public.clinic_memberships m
        where m.clinic_id = clients.clinic_id
          and m.user_id = (select auth.uid())
      )
    );

  create policy appointments_select_member
    on public.appointments
    for select to authenticated
    using (
      exists (
        select 1
        from public.clinic_memberships m
        where m.clinic_id = appointments.clinic_id
          and m.user_id = (select auth.uid())
      )
    );

  create policy appointments_insert_member
    on public.appointments
    for insert to authenticated
    with check (
      exists (
        select 1
        from public.clinic_memberships m
        where m.clinic_id = appointments.clinic_id
          and m.user_id = (select auth.uid())
      )
    );

  create policy appointments_update_member
    on public.appointments
    for update to authenticated
    using (
      exists (
        select 1
        from public.clinic_memberships m
        where m.clinic_id = appointments.clinic_id
          and m.user_id = (select auth.uid())
      )
    )
    with check (
      exists (
        select 1
        from public.clinic_memberships m
        where m.clinic_id = appointments.clinic_id
          and m.user_id = (select auth.uid())
      )
    );

  create policy appointments_delete_member
    on public.appointments
    for delete to authenticated
    using (
      exists (
        select 1
        from public.clinic_memberships m
        where m.clinic_id = appointments.clinic_id
          and m.user_id = (select auth.uid())
      )
    );

  create policy client_balance_entries_select_member
    on public.client_balance_entries
    for select to authenticated
    using (
      exists (
        select 1
        from public.clinic_memberships m
        where m.clinic_id = client_balance_entries.clinic_id
          and m.user_id = (select auth.uid())
      )
    );

  create or replace function public.prevent_client_physical_delete()
  returns trigger
  language plpgsql
  set search_path = pg_catalog, public
  as $$
  begin
    raise exception using
      errcode = 'P0001',
      message = 'Clients cannot be physically deleted. Set is_active = false instead.';
  end
  $$;

  create or replace function public.apply_client_balance_entry()
  returns trigger
  language plpgsql
  security definer
  set search_path = pg_catalog, public
  as $$
  begin
    if new.entry_type <> 'opening' then
      update public.clients
      set outstanding_balance = outstanding_balance + new.amount
      where clinic_id = new.clinic_id
        and id = new.client_id
        and outstanding_balance + new.amount >= 0;

      if not found then
        raise exception
          'Balance adjustment would make the client balance negative or client is missing'
          using errcode = '23514';
      end if;
    end if;

    return new;
  end
  $$;

  create or replace function public.prevent_client_balance_entry_mutation()
  returns trigger
  language plpgsql
  set search_path = pg_catalog, public
  as $$
  begin
    raise exception 'Balance entries are append-only'
      using errcode = '23514';
  end
  $$;

  create or replace function public.record_client_balance_adjustment(
    p_clinic_id uuid,
    p_client_id uuid,
    p_amount numeric,
    p_note text
  )
  returns numeric
  language plpgsql
  security definer
  set search_path = pg_catalog, public
  as $$
  declare
    resulting_balance numeric(10, 2);
    actor_id uuid := auth.uid();
  begin
    if actor_id is null
      or not exists (
        select 1
        from public.clinic_memberships m
        where m.clinic_id = p_clinic_id
          and m.user_id = actor_id
      ) then
      raise exception 'Not authorized for this clinic'
        using errcode = '42501';
    end if;

    if p_amount is null
      or p_amount = 0
      or abs(p_amount) > 99999999.99 then
      raise exception 'Adjustment amount must be non-zero and within range'
        using errcode = '22023';
    end if;

    if p_note is null or btrim(p_note) = '' or length(btrim(p_note)) > 500 then
      raise exception 'A note of 1 to 500 characters is required'
        using errcode = '22023';
    end if;

    insert into public.client_balance_entries (
      clinic_id, client_id, entry_type, amount, note, created_by
    ) values (
      p_clinic_id, p_client_id, 'manual', p_amount, btrim(p_note), actor_id
    );

    select outstanding_balance
    into resulting_balance
    from public.clients
    where clinic_id = p_clinic_id
      and id = p_client_id;

    return resulting_balance;
  end
  $$;

  create or replace function public.complete_clinic_appointment(
    p_clinic_id uuid,
    p_appointment_id uuid,
    p_actual_duration integer,
    p_price_per_minute numeric
  )
  returns void
  language plpgsql
  security definer
  set search_path = pg_catalog, public
  as $$
  declare
    actor_id uuid := auth.uid();
    treatment_price numeric(10, 2);
  begin
    if actor_id is null
      or not exists (
        select 1
        from public.clinic_memberships m
        where m.clinic_id = p_clinic_id
          and m.user_id = actor_id
      ) then
      raise exception 'Not authorized for this clinic'
        using errcode = '42501';
    end if;

    if p_actual_duration is null or p_actual_duration <= 0
      or p_price_per_minute is null or p_price_per_minute <= 0
      or p_price_per_minute > 99999999.99
      or p_actual_duration::numeric * p_price_per_minute > 99999999.99 then
      raise exception 'Treatment duration and price must be positive and within range'
        using errcode = '22023';
    end if;

    treatment_price :=
      round(p_actual_duration::numeric * p_price_per_minute, 2);

    update public.appointments
    set actual_duration = p_actual_duration,
        calculated_price = treatment_price,
        status = 'completed'
    where clinic_id = p_clinic_id
      and id = p_appointment_id
      and status = 'scheduled';

    if not found then
      raise exception 'Scheduled appointment not found in this clinic'
        using errcode = 'P0002';
    end if;
  end
  $$;

  create or replace function public.correct_completed_clinic_appointment(
    p_clinic_id uuid,
    p_appointment_id uuid,
    p_actual_duration integer,
    p_calculated_price numeric
  )
  returns void
  language plpgsql
  security definer
  set search_path = pg_catalog, public
  as $$
  declare
    actor_id uuid := auth.uid();
  begin
    if actor_id is null
      or not exists (
        select 1
        from public.clinic_memberships m
        where m.clinic_id = p_clinic_id
          and m.user_id = actor_id
      ) then
      raise exception 'Not authorized for this clinic'
        using errcode = '42501';
    end if;

    if p_actual_duration is null or p_actual_duration <= 0
      or p_calculated_price is null
      or p_calculated_price < 0
      or p_calculated_price > 99999999.99 then
      raise exception 'Corrected treatment duration and price are invalid'
        using errcode = '22023';
    end if;

    update public.appointments
    set actual_duration = p_actual_duration,
        calculated_price = p_calculated_price
    where clinic_id = p_clinic_id
      and id = p_appointment_id
      and status = 'completed';

    if not found then
      raise exception 'Completed appointment not found in this clinic'
        using errcode = 'P0002';
    end if;
  end
  $$;

  create or replace function public.sync_completed_appointment_balance()
  returns trigger
  language plpgsql
  security definer
  set search_path = pg_catalog, public
  as $$
  declare
    balance_delta numeric(10, 2);
    entry_type text;
    entry_note text;
  begin
    if new.status = 'completed' then
      if new.actual_duration is null or new.actual_duration <= 0
        or new.calculated_price is null or new.calculated_price < 0 then
        raise exception
          'Completed appointments require a positive actual duration and a non-negative price'
          using errcode = '23514';
      end if;

      if tg_op = 'INSERT' then
        balance_delta := new.calculated_price;
        entry_type := 'treatment';
        entry_note := 'Automatic charge for completed treatment';
      elsif old.status is distinct from 'completed' then
        balance_delta := new.calculated_price;
        entry_type := 'treatment';
        entry_note := 'Automatic charge for completed treatment';
      elsif new.calculated_price is distinct from old.calculated_price then
        balance_delta := new.calculated_price - old.calculated_price;
        entry_type := 'treatment_correction';
        entry_note := 'Automatic correction of completed treatment price';
      end if;

      if balance_delta is not null and balance_delta <> 0 then
        insert into public.client_balance_entries (
          clinic_id, client_id, appointment_id, entry_type,
          amount, note
        ) values (
          new.clinic_id, new.client_id, new.id, entry_type,
          balance_delta, entry_note
        );
      end if;
    end if;

    return new;
  end
  $$;

  create or replace function public.prevent_tenant_truncate()
  returns trigger
  language plpgsql
  set search_path = pg_catalog, public
  as $$
  begin
    raise exception using
      errcode = 'P0001',
      message = format(
        'TRUNCATE of public.%I is blocked to protect tenant data and history.',
        tg_table_name
      );
  end
  $$;

  create or replace function public.protect_completed_appointment_history()
  returns trigger
  language plpgsql
  set search_path = pg_catalog, public
  as $$
  begin
    if tg_op = 'DELETE' then
      if old.status = 'completed' then
        raise exception 'Completed appointments cannot be deleted'
          using errcode = '23514';
      end if;
      return old;
    end if;

    if old.status = 'completed' then
      if new.status is distinct from 'completed' then
        raise exception 'A completed appointment cannot change status'
          using errcode = '23514';
      end if;

      if new.client_id is distinct from old.client_id then
        raise exception 'A completed appointment cannot be reassigned'
          using errcode = '23514';
      end if;

      if new.clinic_id is distinct from old.clinic_id then
        raise exception 'A completed appointment cannot move clinics'
          using errcode = '23514';
      end if;

      if new.appointment_date is distinct from old.appointment_date then
        raise exception 'A completed appointment date cannot be changed'
          using errcode = '23514';
      end if;

      if new.estimated_duration is distinct from old.estimated_duration then
        raise exception 'A completed appointment duration cannot be changed'
          using errcode = '23514';
      end if;
    elsif new.status = 'completed'
      and new.client_id is distinct from old.client_id then
      raise exception
        'An appointment cannot be reassigned while being completed'
        using errcode = '23514';
    elsif new.status = 'completed'
      and new.clinic_id is distinct from old.clinic_id then
      raise exception
        'An appointment cannot move clinics while being completed'
        using errcode = '23514';
    end if;

    return new;
  end
  $$;

  create or replace function public.manage_clinic_membership(
    p_action text,
    p_clinic_id uuid,
    p_user_id uuid
  )
  returns void
  language plpgsql
  security definer
  set search_path = pg_catalog, public
  as $$
  begin
    if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
      raise exception 'Clinic membership changes require service_role';
    end if;

    if p_action = 'add' then
      insert into public.clinic_memberships (clinic_id, user_id)
      values (p_clinic_id, p_user_id)
      on conflict (clinic_id, user_id) do nothing;
    elsif p_action = 'remove' then
      delete from public.clinic_memberships
      where clinic_id = p_clinic_id
        and user_id = p_user_id;
    else
      raise exception 'Unknown membership action';
    end if;
  end
  $$;

  revoke all on function public.prevent_client_physical_delete()
    from public, anon, authenticated;
  revoke all on function public.prevent_tenant_truncate()
    from public, anon, authenticated;
  revoke all on function public.protect_completed_appointment_history()
    from public, anon, authenticated;
  revoke all on function public.apply_client_balance_entry()
    from public, anon, authenticated;
  revoke all on function public.prevent_client_balance_entry_mutation()
    from public, anon, authenticated;
  revoke all on function public.sync_completed_appointment_balance()
    from public, anon, authenticated;
  revoke all on function public.appointment_utc_range(
    timestamptz, integer
  ) from public, anon, authenticated;
  revoke all on function public.record_client_balance_adjustment(
    uuid, uuid, numeric, text
  ) from public, anon, authenticated;
  revoke all on function public.complete_clinic_appointment(
    uuid, uuid, integer, numeric
  ) from public, anon, authenticated;
  revoke all on function public.correct_completed_clinic_appointment(
    uuid, uuid, integer, numeric
  ) from public, anon, authenticated;
  revoke all on function public.manage_clinic_membership(text, uuid, uuid)
    from public, anon, authenticated;
  grant execute on function public.record_client_balance_adjustment(
    uuid, uuid, numeric, text
  ) to authenticated;
  grant execute on function public.appointment_utc_range(
    timestamptz, integer
  ) to authenticated, service_role;
  grant execute on function public.complete_clinic_appointment(
    uuid, uuid, integer, numeric
  ) to authenticated;
  grant execute on function public.correct_completed_clinic_appointment(
    uuid, uuid, integer, numeric
  ) to authenticated;
  grant execute on function public.manage_clinic_membership(text, uuid, uuid)
    to service_role;

  create trigger clients_prevent_physical_delete
  before delete on public.clients
  for each row
  execute function public.prevent_client_physical_delete();

  create trigger clients_prevent_truncate
  before truncate on public.clients
  for each statement
  execute function public.prevent_tenant_truncate();

  create trigger appointments_prevent_truncate
  before truncate on public.appointments
  for each statement
  execute function public.prevent_tenant_truncate();

  create trigger client_balance_entries_prevent_truncate
  before truncate on public.client_balance_entries
  for each statement
  execute function public.prevent_tenant_truncate();

  create trigger protect_completed_appointment_history
  before update or delete on public.appointments
  for each row
  execute function public.protect_completed_appointment_history();

  alter table public.clients
    enable always trigger clients_prevent_physical_delete;
  alter table public.clients
    enable always trigger clients_prevent_truncate;
  alter table public.appointments
    enable always trigger appointments_prevent_truncate;
  alter table public.client_balance_entries
    enable always trigger client_balance_entries_prevent_truncate;
  alter table public.appointments
    enable always trigger protect_completed_appointment_history;

  create trigger client_balance_entries_apply
  after insert on public.client_balance_entries
  for each row
  execute function public.apply_client_balance_entry();

  create trigger client_balance_entries_append_only
  before update or delete on public.client_balance_entries
  for each row
  execute function public.prevent_client_balance_entry_mutation();

  create trigger appointments_sync_completed_balance
  after insert or update of status, calculated_price on public.appointments
  for each row
  execute function public.sync_completed_appointment_balance();

  alter table public.appointments
    enable always trigger appointments_sync_completed_balance;
  alter table public.client_balance_entries
    enable always trigger client_balance_entries_apply;
  alter table public.client_balance_entries
    enable always trigger client_balance_entries_append_only;

  revoke all privileges on table
    public.clients, public.appointments,
    public.clinics, public.clinic_memberships,
    public.client_balance_entries
  from public, anon, authenticated;

  do $$
  declare
    target record;
    column_list text;
  begin
    for target in
      select c.oid, c.oid::regclass as relation_name
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname in (
          'clients', 'appointments', 'clinics', 'clinic_memberships',
          'client_balance_entries'
        )
        and c.relkind in ('r', 'p')
    loop
      select string_agg(format('%I', a.attname), ', ' order by a.attnum)
      into column_list
      from pg_attribute a
      where a.attrelid = target.oid
        and a.attnum > 0
        and not a.attisdropped;

      if column_list is not null then
        execute format(
          'revoke all privileges (%s) on table %s from public, anon, authenticated',
          column_list,
          target.relation_name
        );
      end if;
    end loop;
  end
  $$;

  grant select on public.clinics, public.clinic_memberships to authenticated;
  grant select on public.client_balance_entries to authenticated;

  grant select on public.clients to authenticated;
  grant insert (
    clinic_id, full_name, phone, email, needle_type
  ) on public.clients to authenticated;
  grant update (
    full_name, phone, email, needle_type, is_active
  ) on public.clients to authenticated;

  grant select, delete on public.appointments to authenticated;
  grant insert (
    clinic_id, client_id, appointment_date, estimated_duration
  ) on public.appointments to authenticated;
  grant update (
    client_id, appointment_date, estimated_duration
  ) on public.appointments to authenticated;

  do $$
  declare
    v record;
    expected boolean;
    actual boolean;
    mismatches text := '';
  begin
    for v in
      select r.role_name, t.table_name, p.privilege_name
      from (values ('anon'), ('authenticated')) r(role_name)
      cross join (values
        ('public.clinics'),
        ('public.clinic_memberships'),
        ('public.clients'),
        ('public.appointments'),
        ('public.client_balance_entries')
      ) t(table_name)
      cross join (values
        ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE'),
        ('TRUNCATE'), ('REFERENCES'), ('TRIGGER')
      ) p(privilege_name)
    loop
      expected := case
        when v.role_name = 'anon' then false
        when v.table_name in (
          'public.clinics', 'public.clinic_memberships', 'public.clients'
        ) then v.privilege_name = 'SELECT'
        when v.table_name = 'public.client_balance_entries'
          then v.privilege_name = 'SELECT'
        when v.table_name = 'public.appointments'
          then v.privilege_name in ('SELECT', 'DELETE')
        else false
      end;

      actual := has_table_privilege(
        v.role_name, v.table_name, v.privilege_name
      );

      if actual is distinct from expected then
        mismatches := concat_ws(
          E'\n',
          mismatches,
          format(
            'TABLE %s %s %s: expected %s, got %s',
            v.role_name, v.table_name, v.privilege_name, expected, actual
          )
        );
      end if;
    end loop;

    for v in
      select
        r.role_name,
        n.nspname as schema_name,
        c.relname as table_name,
        a.attname as column_name,
        a.attnum as column_number,
        p.privilege_name
      from (values ('anon'), ('authenticated')) r(role_name)
      cross join pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      join pg_attribute a
        on a.attrelid = c.oid
      and a.attnum > 0
      and not a.attisdropped
      cross join (values
        ('SELECT'), ('INSERT'), ('UPDATE'), ('REFERENCES')
      ) p(privilege_name)
      where n.nspname = 'public'
        and c.relname in (
          'clients', 'appointments', 'clinics', 'clinic_memberships',
          'client_balance_entries'
        )
        and c.relkind in ('r', 'p')
    loop
      expected := case
        when v.role_name = 'anon' then false
        when v.privilege_name = 'SELECT' then true
        when v.privilege_name = 'INSERT'
          and v.table_name = 'clients'
          and v.column_name in (
            'clinic_id', 'full_name', 'phone', 'email', 'needle_type'
          ) then true
        when v.privilege_name = 'UPDATE'
          and v.table_name = 'clients'
          and v.column_name in (
            'full_name', 'phone', 'email', 'needle_type', 'is_active'
          ) then true
        when v.privilege_name = 'INSERT'
          and v.table_name = 'appointments'
          and v.column_name in (
            'clinic_id', 'client_id', 'appointment_date',
            'estimated_duration'
          ) then true
        when v.privilege_name = 'UPDATE'
          and v.table_name = 'appointments'
          and v.column_name in (
            'client_id', 'appointment_date', 'estimated_duration'
          ) then true
        else false
      end;

      actual := has_column_privilege(
        v.role_name,
        format('%I.%I', v.schema_name, v.table_name),
        v.column_name,
        v.privilege_name
      );

      if actual is distinct from expected then
        mismatches := concat_ws(
          E'\n',
          mismatches,
          format(
            'COLUMN %s %I.%I.%I %s: expected %s, got %s',
            v.role_name,
            v.schema_name,
            v.table_name,
            v.column_name,
            v.privilege_name,
            expected,
            actual
          )
        );
      end if;
    end loop;

    if mismatches <> '' then
      raise exception 'Effective privilege mismatches:%', E'\n' || mismatches;
    end if;

    if has_function_privilege(
        'anon',
        'public.appointment_utc_range(timestamp with time zone, integer)',
        'EXECUTE'
      )
      or not has_function_privilege(
        'authenticated',
        'public.appointment_utc_range(timestamp with time zone, integer)',
        'EXECUTE'
      )
      or not has_function_privilege(
        'service_role',
        'public.appointment_utc_range(timestamp with time zone, integer)',
        'EXECUTE'
      )
      or has_function_privilege(
        'anon',
        'public.record_client_balance_adjustment(uuid, uuid, numeric, text)',
        'EXECUTE'
      )
      or not has_function_privilege(
        'authenticated',
        'public.record_client_balance_adjustment(uuid, uuid, numeric, text)',
        'EXECUTE'
      )
      or has_function_privilege(
        'anon',
        'public.complete_clinic_appointment(uuid, uuid, integer, numeric)',
        'EXECUTE'
      )
      or not has_function_privilege(
        'authenticated',
        'public.complete_clinic_appointment(uuid, uuid, integer, numeric)',
        'EXECUTE'
      )
      or has_function_privilege(
        'anon',
        'public.correct_completed_clinic_appointment(uuid, uuid, integer, numeric)',
        'EXECUTE'
      )
      or not has_function_privilege(
        'authenticated',
        'public.correct_completed_clinic_appointment(uuid, uuid, integer, numeric)',
        'EXECUTE'
      )
      or has_function_privilege(
        'authenticated',
        'public.manage_clinic_membership(text, uuid, uuid)',
        'EXECUTE'
      )
      or not has_function_privilege(
        'service_role',
        'public.manage_clinic_membership(text, uuid, uuid)',
        'EXECUTE'
      ) then
      raise exception 'RPC execute privileges do not match the approved roles';
    end if;
  end
  $$;

  commit;
