-- Epilink Stage 1 structural verification.
-- Run only against a disposable staging database.
-- The transaction is rolled back so test fixtures and mutations are never retained.

begin;

do $$
declare
  clinic_a uuid;
  clinic_b uuid;
  user_a uuid;
  user_a2 uuid;
  user_b uuid;
  client_a uuid;
  client_a2 uuid;
  client_b uuid;
  completed_a uuid;
  completed_overlap_one uuid;
  completed_overlap_two uuid;
  scheduled_a uuid;
  scheduled_b uuid;
  scheduled_over_completed uuid;
  rejected_constraint text;
  base_time timestamptz;
  overlap_one uuid;
  adjacent_one uuid;
  adjacent_two uuid;
  duration_one uuid;
  duration_two uuid;
  clinic_a_appointment uuid;
  clinic_b_appointment uuid;
begin
  select id into clinic_a
  from public.clinics
  where name = 'malki';

  select id into clinic_b
  from public.clinics
  where name = 'st';

  select user_id into user_a
  from public.clinic_memberships
  where clinic_id = clinic_a
    and user_id = '8c3e2f30-774f-469f-b7fa-474ad4f83be6';

  select user_id into user_a2
  from public.clinic_memberships
  where clinic_id = clinic_a
    and user_id = '171d8b76-db1d-4399-b1e3-deecde9c39d9';

  select user_id into user_b
  from public.clinic_memberships
  where clinic_id = clinic_b
    and user_id = 'f14e6f0b-119d-496a-803c-063be5d51ab0';

  if clinic_a is null or clinic_b is null
     or clinic_a = clinic_b
     or user_a is null or user_a2 is null or user_b is null then
    raise exception
      'Fixtures require seeded malki/st clinics and their approved memberships';
  end if;

  client_a := gen_random_uuid();
  client_a2 := gen_random_uuid();
  client_b := gen_random_uuid();
  completed_a := gen_random_uuid();
  scheduled_a := gen_random_uuid();
  scheduled_b := gen_random_uuid();
  select greatest(
    clock_timestamp(),
    coalesce(
      max(appointment_date + estimated_duration * interval '1 minute'),
      clock_timestamp()
    )
  ) + interval '1 day'
  into base_time
  from public.appointments;

  insert into public.clients (
    id, clinic_id, full_name, phone, is_active
  ) values
    (
      client_a, clinic_a, 'Stage1 fixture A1',
      'stage1-' || gen_random_uuid()::text, true
    ),
    (
      client_a2, clinic_a, 'Stage1 fixture A2',
      'stage1-' || gen_random_uuid()::text, true
    ),
    (
      client_b, clinic_b, 'Stage1 fixture B1',
      'stage1-' || gen_random_uuid()::text, true
    );

  insert into public.appointments (
    id, clinic_id, client_id, appointment_date, estimated_duration,
    actual_duration, calculated_price, status
  ) values
    (
      completed_a, clinic_a, client_a, base_time + interval '10 days',
      30, 30, 30.00, 'completed'
    ),
    (
      scheduled_a, clinic_a, client_a, base_time + interval '20 days',
      30, null, null, 'scheduled'
    ),
    (
      scheduled_b, clinic_b, client_b, base_time + interval '10 days',
      30, null, null, 'scheduled'
    );

  perform set_config('epilink.test.clinic_a', clinic_a::text, true);
  perform set_config('epilink.test.clinic_b', clinic_b::text, true);
  perform set_config('epilink.test.user_a', user_a::text, true);
  perform set_config('epilink.test.user_a2', user_a2::text, true);
  perform set_config('epilink.test.user_b', user_b::text, true);
  perform set_config('epilink.test.client_a', client_a::text, true);
  perform set_config('epilink.test.client_a2', client_a2::text, true);
  perform set_config('epilink.test.client_b', client_b::text, true);
  perform set_config('epilink.test.completed_a', completed_a::text, true);
  perform set_config('epilink.test.scheduled_a', scheduled_a::text, true);
  perform set_config('epilink.test.scheduled_b', scheduled_b::text, true);
  perform set_config('epilink.test.base_time', base_time::text, true);

  -- The composite FK itself must reject a cross-clinic relationship.
  begin
    insert into public.appointments (
      clinic_id,
      client_id,
      appointment_date,
      estimated_duration,
      status
    )
    values (
      clinic_a,
      client_b,
      base_time,
      30,
      'scheduled'
    );

    raise exception using
      errcode = 'P0002',
      message = 'Test failure: cross-clinic appointment insert unexpectedly succeeded';
  exception
    when sqlstate '23503' then
      get stacked diagnostics rejected_constraint = constraint_name;
      if rejected_constraint <> 'appointments_clinic_client_fkey' then
        raise exception
          'Cross-clinic insert failed on unexpected constraint: %',
          rejected_constraint;
      end if;
  end;

  -- Client deletion is always forbidden; deactivation remains allowed.
  begin
    delete from public.clients where id = client_a;

    raise exception using
      errcode = 'P0002',
      message = 'Test failure: physical client deletion unexpectedly succeeded';
  exception
    when sqlstate 'P0001' then
      if sqlerrm <>
         'Clients cannot be physically deleted. Set is_active = false instead.'
      then
        raise;
      end if;
  end;

  update public.clients
  set is_active = false
  where id = client_a;

  if not exists (
    select 1 from public.clients
    where id = client_a and is_active = false
  ) then
    raise exception 'is_active=false did not deactivate the client';
  end if;

  -- Scheduled appointments may use a time occupied by completed history.
  insert into public.appointments (
    clinic_id, client_id, appointment_date, estimated_duration, status
  )
  values (
    clinic_a,
    client_a2,
    base_time + interval '10 days',
    30,
    'scheduled'
  )
  returning id into scheduled_over_completed;

  if not exists (
    select 1
    from public.appointments
    where id = scheduled_over_completed
      and status = 'scheduled'
      and appointment_date = base_time + interval '10 days'
  ) then
    raise exception 'Scheduled appointment overlapping completed history was not retained';
  end if;

  delete from public.appointments
  where id = scheduled_over_completed;

  -- Completed appointments do not reserve calendar slots, even against
  -- another completed treatment at the same clinic and time.
  insert into public.appointments (
    clinic_id, client_id, appointment_date, estimated_duration,
    actual_duration, calculated_price, status
  )
  values (
    clinic_a, client_a2, base_time + interval '12 days',
    30, 30, 30.00, 'completed'
  )
  returning id into completed_overlap_one;

  insert into public.appointments (
    clinic_id, client_id, appointment_date, estimated_duration,
    actual_duration, calculated_price, status
  )
  values (
    clinic_a, client_a2, base_time + interval '12 days',
    30, 30, 30.00, 'completed'
  )
  returning id into completed_overlap_two;

  if (
    select count(*)
    from public.appointments
    where id in (completed_overlap_one, completed_overlap_two)
      and status = 'completed'
      and appointment_date = base_time + interval '12 days'
  ) <> 2 then
    raise exception 'Overlapping completed appointments were not both retained';
  end if;

  if not exists (
    select 1
    from public.clients c
    join public.appointments a
      on a.clinic_id = c.clinic_id
     and a.client_id = c.id
    where c.id = client_a
      and c.is_active = false
      and a.id = completed_a
  ) then
    raise exception 'Deactivating a client hid or detached completed history';
  end if;

  if exists (
    select 1
    from (values
      ('public.clients'::regclass, 'clients_prevent_truncate'),
      ('public.appointments'::regclass, 'appointments_prevent_truncate'),
      ('public.client_balance_entries'::regclass,
       'client_balance_entries_prevent_truncate')
    ) expected(table_oid, trigger_name)
    left join pg_trigger t
      on t.tgrelid = expected.table_oid
     and t.tgname = expected.trigger_name
     and t.tgfoid = 'public.prevent_tenant_truncate()'::regprocedure
     and t.tgenabled = 'A'
     and (t.tgtype & 32) = 32
     and not t.tgisinternal
    where t.oid is null
  ) then
    raise exception
      'A required TRUNCATE protection trigger is missing or not ENABLE ALWAYS';
  end if;

  -- Completed appointment DELETE must return the trigger's exact error.
  begin
    delete from public.appointments where id = completed_a;

    raise exception using
      errcode = 'P0002',
      message = 'Test failure: completed appointment DELETE unexpectedly succeeded';
  exception
    when sqlstate '23514' then
      if sqlerrm <> 'Completed appointments cannot be deleted' then
        raise;
      end if;
  end;

  -- A completed appointment cannot be downgraded.
  begin
    update public.appointments
    set status = 'scheduled'
    where id = completed_a;

    raise exception using
      errcode = 'P0002',
      message = 'Test failure: completed appointment downgrade unexpectedly succeeded';
  exception
    when sqlstate '23514' then
      if sqlerrm <> 'A completed appointment cannot change status' then
        raise;
      end if;
  end;

  -- Completed appointment date and estimated duration are immutable through
  -- direct table updates; only the dedicated correction RPC may amend treatment
  -- details.
  begin
    update public.appointments
    set appointment_date = appointment_date + interval '1 day'
    where id = completed_a;

    raise exception using
      errcode = 'P0002',
      message = 'Test failure: completed appointment date change unexpectedly succeeded';
  exception
    when sqlstate '23514' then
      if sqlerrm <> 'A completed appointment date cannot be changed' then
        raise;
      end if;
  end;

  begin
    update public.appointments
    set estimated_duration = estimated_duration + 5
    where id = completed_a;

    raise exception using
      errcode = 'P0002',
      message = 'Test failure: completed appointment duration change unexpectedly succeeded';
  exception
    when sqlstate '23514' then
      if sqlerrm <> 'A completed appointment duration cannot be changed' then
        raise;
      end if;
  end;

  -- A completed appointment cannot be assigned to another client.
  begin
    update public.appointments
    set client_id = client_a2
    where id = completed_a;

    raise exception using
      errcode = 'P0002',
      message = 'Test failure: completed appointment reassignment unexpectedly succeeded';
  exception
    when sqlstate '23514' then
      if sqlerrm <> 'A completed appointment cannot be reassigned' then
        raise;
      end if;
  end;

  -- A completed appointment cannot move to another clinic.
  begin
    update public.appointments
    set clinic_id = clinic_b
    where id = completed_a;

    raise exception using
      errcode = 'P0002',
      message = 'Test failure: completed appointment clinic move unexpectedly succeeded';
  exception
    when sqlstate '23514' then
      if sqlerrm <> 'A completed appointment cannot move clinics' then
        raise;
      end if;
  end;

  -- Completing and reassigning in one UPDATE is forbidden.
  begin
    update public.appointments
    set status = 'completed',
        client_id = client_a2
    where id = scheduled_a;

    raise exception using
      errcode = 'P0002',
      message = 'Test failure: completion plus reassignment unexpectedly succeeded';
  exception
    when sqlstate '23514' then
      if sqlerrm <>
         'An appointment cannot be reassigned while being completed'
      then
        raise;
      end if;
  end;

  -- Completing and moving clinics in one UPDATE is forbidden.
  begin
    update public.appointments
    set status = 'completed',
        clinic_id = clinic_b
    where id = scheduled_a;

    raise exception using
      errcode = 'P0002',
      message = 'Test failure: completion plus clinic move unexpectedly succeeded';
  exception
    when sqlstate '23514' then
      if sqlerrm <>
         'An appointment cannot move clinics while being completed'
      then
        raise;
      end if;
  end;

  -- A true overlap in one clinic must fail on the exclusion constraint.
  insert into public.appointments (
    clinic_id, client_id, appointment_date, estimated_duration, status
  )
  values (
    clinic_a, client_a, base_time, 30, 'scheduled'
  )
  returning id into overlap_one;

  begin
    insert into public.appointments (
      clinic_id, client_id, appointment_date, estimated_duration, status
    )
    values (
      clinic_a, client_a, base_time + interval '15 minutes', 30, 'scheduled'
    );

    raise exception using
      errcode = 'P0002',
      message = 'Test failure: overlapping appointment unexpectedly succeeded';
  exception
    when sqlstate '23P01' then
      get stacked diagnostics rejected_constraint = constraint_name;
      if rejected_constraint <> 'appointments_no_overlap' then
        raise exception
          'Overlap was rejected by unexpected constraint: %',
          rejected_constraint;
      end if;
  end;

  delete from public.appointments
  where id = overlap_one;

  -- Half-open ranges permit appointments whose endpoints touch.
  insert into public.appointments (
    clinic_id, client_id, appointment_date, estimated_duration, status
  )
  values (
    clinic_a, client_a, base_time + interval '1 day', 30, 'scheduled'
  )
  returning id into adjacent_one;

  insert into public.appointments (
    clinic_id, client_id, appointment_date, estimated_duration, status
  )
  values (
    clinic_a, client_a,
    base_time + interval '1 day 30 minutes', 30, 'scheduled'
  )
  returning id into adjacent_two;

  delete from public.appointments
  where id in (adjacent_one, adjacent_two);

  -- Increasing duration so that it overlaps another appointment is blocked.
  insert into public.appointments (
    clinic_id, client_id, appointment_date, estimated_duration, status
  )
  values (
    clinic_a, client_a, base_time + interval '2 days', 30, 'scheduled'
  )
  returning id into duration_one;

  insert into public.appointments (
    clinic_id, client_id, appointment_date, estimated_duration, status
  )
  values (
    clinic_a, client_a,
    base_time + interval '2 days 45 minutes', 30, 'scheduled'
  )
  returning id into duration_two;

  begin
    update public.appointments
    set estimated_duration = 60
    where id = duration_one;

    raise exception using
      errcode = 'P0002',
      message = 'Test failure: duration change creating overlap unexpectedly succeeded';
  exception
    when sqlstate '23P01' then
      get stacked diagnostics rejected_constraint = constraint_name;
      if rejected_constraint <> 'appointments_no_overlap' then
        raise exception
          'Duration change was rejected by unexpected constraint: %',
          rejected_constraint;
      end if;
  end;

  delete from public.appointments
  where id in (duration_one, duration_two);

  -- Identical time ranges in different clinics are permitted.
  insert into public.appointments (
    clinic_id, client_id, appointment_date, estimated_duration, status
  )
  values (
    clinic_a, client_a, base_time + interval '3 days', 30, 'scheduled'
  )
  returning id into clinic_a_appointment;

  insert into public.appointments (
    clinic_id, client_id, appointment_date, estimated_duration, status
  )
  values (
    clinic_b, client_b, base_time + interval '3 days', 30, 'scheduled'
  )
  returning id into clinic_b_appointment;

  delete from public.appointments
  where id in (clinic_a_appointment, clinic_b_appointment);
end
$$;

-- Simulate authenticated Supabase requests by setting the JWT claim GUCs and
-- switching to the authenticated database role. PostgREST/JWT tests are still
-- required to verify the complete HTTP authentication path.
set local role authenticated;

do $$
declare
  clinic_a uuid := current_setting('epilink.test.clinic_a')::uuid;
  clinic_b uuid := current_setting('epilink.test.clinic_b')::uuid;
  user_a uuid := current_setting('epilink.test.user_a')::uuid;
  user_a2 uuid := current_setting('epilink.test.user_a2')::uuid;
  user_b uuid := current_setting('epilink.test.user_b')::uuid;
  client_a uuid := current_setting('epilink.test.client_a')::uuid;
  client_a2 uuid := current_setting('epilink.test.client_a2')::uuid;
  client_b uuid := current_setting('epilink.test.client_b')::uuid;
  completed_a uuid := current_setting('epilink.test.completed_a')::uuid;
  scheduled_a uuid := current_setting('epilink.test.scheduled_a')::uuid;
  scheduled_b uuid := current_setting('epilink.test.scheduled_b')::uuid;
  fixture_base_time timestamptz :=
    current_setting('epilink.test.base_time')::timestamptz;
  visible_count integer;
  affected_rows integer;
  rejected boolean;
  error_message text;
  error_state text;
  other_clinic uuid;
  other_client uuid;
  other_appointment uuid;
  current_user_id uuid;
  own_membership_visible boolean;
  resulting_balance numeric;
  balance_entry_count integer;
begin
  if current_user <> 'authenticated' then
    raise exception 'RLS simulation must execute as authenticated';
  end if;

  foreach current_user_id in array array[user_a, user_a2, user_b]
  loop
    perform set_config('request.jwt.claim.sub', current_user_id::text, true);
    perform set_config(
      'request.jwt.claims',
      jsonb_build_object(
        'sub', current_user_id,
        'role', 'authenticated'
      )::text,
      true
    );

    if auth.uid() is distinct from current_user_id then
      raise exception 'auth.uid() did not resolve the simulated JWT subject';
    end if;

    if current_user_id = user_b then
      other_clinic := clinic_a;
      other_client := client_a;
      other_appointment := scheduled_a;
      visible_count := 1;
    else
      other_clinic := clinic_b;
      other_client := client_b;
      other_appointment := scheduled_b;
      visible_count := 2;
    end if;

    select count(*) into affected_rows
    from public.clinics
    where id in (clinic_a, clinic_b);
    if affected_rows <> 1 then
      raise exception 'Authenticated user can see a clinic they do not belong to';
    end if;

    select
      count(*),
      coalesce(bool_or(user_id = current_user_id), false)
    into affected_rows, own_membership_visible
    from public.clinic_memberships
    where user_id in (user_a, user_a2, user_b);
    if affected_rows <> 1 or not own_membership_visible then
      raise exception 'Authenticated user can see another user membership';
    end if;

    select count(*) into affected_rows
    from public.clients
    where id in (client_a, client_a2, client_b);
    if affected_rows <> visible_count then
      raise exception
        'Authenticated user % sees % fixture clients; expected %',
        current_user_id, affected_rows, visible_count;
    end if;

    select count(*) into affected_rows
    from public.appointments
    where id in (completed_a, scheduled_a, scheduled_b);
    if affected_rows <> visible_count then
      raise exception
        'Authenticated user % sees % fixture appointments; expected %',
        current_user_id, affected_rows, visible_count;
    end if;

    if current_user_id <> user_b and not exists (
      select 1
      from public.clients c
      join public.appointments a
        on a.clinic_id = c.clinic_id
       and a.client_id = c.id
      where c.id = client_a
        and c.is_active = false
        and a.id = completed_a
        and a.status = 'completed'
    ) then
      raise exception
        'Inactive client or its completed history is hidden from a clinic member';
    end if;

    update public.clients
    set full_name = 'cross-clinic update must be hidden'
    where id = other_client;
    get diagnostics affected_rows = row_count;
    if affected_rows <> 0 then
      raise exception 'Authenticated user updated another clinic client';
    end if;

    update public.appointments
    set appointment_date = appointment_date + interval '1 minute'
    where id = other_appointment;
    get diagnostics affected_rows = row_count;
    if affected_rows <> 0 then
      raise exception 'Authenticated user updated another clinic appointment';
    end if;

    delete from public.appointments
    where id = other_appointment;
    get diagnostics affected_rows = row_count;
    if affected_rows <> 0 then
      raise exception 'Authenticated user deleted another clinic appointment';
    end if;

    rejected := false;
    begin
      insert into public.clients (
        clinic_id, full_name, phone
      ) values (
        other_clinic,
        'Cross-clinic RLS insert',
        'stage1-cross-' || current_user_id::text
      );
    exception
      when insufficient_privilege then
        get stacked diagnostics error_message = message_text;
        if error_message not like
           'new row violates row-level security policy for table "clients"%'
        then
          raise exception 'Client insert failed for another reason: %',
            error_message;
        end if;
        rejected := true;
    end;
    if not rejected then
      raise exception 'Cross-clinic client INSERT unexpectedly succeeded';
    end if;

    rejected := false;
    begin
      insert into public.appointments (
        clinic_id, client_id, appointment_date, estimated_duration
      ) values (
        other_clinic,
        other_client,
        fixture_base_time + interval '40 days',
        30
      );
    exception
      when insufficient_privilege then
        get stacked diagnostics error_message = message_text;
        if error_message not like
           'new row violates row-level security policy for table "appointments"%'
        then
          raise exception 'Appointment insert failed for another reason: %',
            error_message;
        end if;
        rejected := true;
    end;
    if not rejected then
      raise exception 'Cross-clinic appointment INSERT unexpectedly succeeded';
    end if;

    rejected := false;
    begin
      insert into public.clinic_memberships (clinic_id, user_id)
      values (other_clinic, current_user_id);
    exception
      when insufficient_privilege then
        get stacked diagnostics error_message = message_text;
        if error_message <> 'permission denied for table clinic_memberships' then
          raise exception 'Membership INSERT failed for an unexpected reason: %',
            error_message;
        end if;
        rejected := true;
    end;
    if not rejected then
      raise exception 'Authenticated user added themself to another clinic';
    end if;

    rejected := false;
    begin
      delete from public.clients where id = other_client;
    exception
      when insufficient_privilege then
        get stacked diagnostics error_message = message_text;
        if error_message <> 'permission denied for table clients' then
          raise exception 'Client DELETE failed for an unexpected reason: %',
            error_message;
        end if;
        rejected := true;
    end;
    if not rejected then
      raise exception 'Client DELETE unexpectedly had table permission';
    end if;
  end loop;

  perform set_config('request.jwt.claim.sub', user_a::text, true);
  perform set_config(
    'request.jwt.claims',
    jsonb_build_object('sub', user_a, 'role', 'authenticated')::text,
    true
  );

  rejected := false;
  begin
    update public.clients
    set outstanding_balance = 999
    where id = client_a;
  exception
    when insufficient_privilege then
      get stacked diagnostics
        error_state = returned_sqlstate,
        error_message = message_text;
      if error_state <> '42501'
         or error_message not like 'permission denied%' then
        raise exception 'Direct balance write failed unexpectedly: % [%]',
          error_message, error_state;
      end if;
      rejected := true;
  end;
  if not rejected then
    raise exception 'Direct client balance update unexpectedly succeeded';
  end if;

  rejected := false;
  begin
    update public.appointments
    set status = 'completed'
    where id = scheduled_a;
  exception
    when insufficient_privilege then
      get stacked diagnostics
        error_state = returned_sqlstate,
        error_message = message_text;
      if error_state <> '42501'
         or error_message not like 'permission denied%' then
        raise exception 'Direct appointment completion failed unexpectedly: % [%]',
          error_message, error_state;
      end if;
      rejected := true;
  end;
  if not rejected then
    raise exception 'Direct appointment status update unexpectedly succeeded';
  end if;

  select public.record_client_balance_adjustment(
    clinic_a, client_a, 2.00, 'Staging test manual adjustment'
  ) into resulting_balance;
  if resulting_balance <> 32.00 then
    raise exception 'Manual balance adjustment returned an incorrect balance';
  end if;

  perform public.complete_clinic_appointment(
    clinic_a, scheduled_a, 20, 1.50
  );

  rejected := false;
  begin
    update public.appointments
    set appointment_date = appointment_date + interval '1 day'
    where id = scheduled_a;
  exception
    when sqlstate '23514' then
      get stacked diagnostics
        error_state = returned_sqlstate,
        error_message = message_text;
      if error_state <> '23514'
         or error_message <> 'A completed appointment date cannot be changed'
      then
        raise exception 'Completed date update failed unexpectedly: % [%]',
          error_message, error_state;
      end if;
      rejected := true;
  end;
  if not rejected then
    raise exception
      'Authenticated direct update changed appointment_date on a completed treatment';
  end if;

  rejected := false;
  begin
    update public.appointments
    set estimated_duration = estimated_duration + 5
    where id = scheduled_a;
  exception
    when sqlstate '23514' then
      get stacked diagnostics
        error_state = returned_sqlstate,
        error_message = message_text;
      if error_state <> '23514'
         or error_message <>
           'A completed appointment duration cannot be changed'
      then
        raise exception 'Completed duration update failed unexpectedly: % [%]',
          error_message, error_state;
      end if;
      rejected := true;
  end;
  if not rejected then
    raise exception
      'Authenticated direct update changed estimated_duration on a completed treatment';
  end if;

  perform public.correct_completed_clinic_appointment(
    clinic_a, scheduled_a, 25, 35.00
  );
  if not exists (
    select 1
    from public.appointments
    where id = scheduled_a
      and status = 'completed'
      and actual_duration = 25
      and calculated_price = 35.00
  ) then
    raise exception
      'Dedicated correction RPC did not update actual_duration and calculated_price';
  end if;

  update public.clients
  set full_name = 'Shared malki fixture update'
  where id = client_a;
  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'Member of malki could not update a clinic-owned client';
  end if;

  perform set_config('request.jwt.claim.sub', user_a2::text, true);
  perform set_config(
    'request.jwt.claims',
    jsonb_build_object('sub', user_a2, 'role', 'authenticated')::text,
    true
  );
  if not exists (
    select 1
    from public.clients
    where id = client_a
      and full_name = 'Shared malki fixture update'
  ) then
    raise exception 'Second malki member did not see the first member update';
  end if;

  select outstanding_balance
  into resulting_balance
  from public.clients
  where id = client_a;
  if resulting_balance <> 67.00 then
    raise exception 'Completed treatment charge/correction was not applied to client balance';
  end if;

  select count(*)
  into balance_entry_count
  from public.client_balance_entries
  where clinic_id = clinic_a
    and client_id = client_a;
  if balance_entry_count <> 4 then
    raise exception 'Second clinic member cannot see the balance ledger';
  end if;
end
$$;

reset role;

-- Effective table and column ACL verification for anon/authenticated.
-- has_*_privilege includes PUBLIC grants and inherited role memberships.
do $$
declare
  v record;
  expected boolean;
  actual boolean;
  mismatches text := '';
begin
  for v in
    select
      r.role_name,
      n.nspname as schema_name,
      c.relname as table_name,
      p.privilege_name
    from (values ('anon'), ('authenticated')) r(role_name)
    cross join pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    cross join (values
      ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE'),
      ('TRUNCATE'), ('REFERENCES'), ('TRIGGER')
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
      when v.table_name = 'client_balance_entries'
        and v.privilege_name = 'SELECT' then true
      when v.table_name = 'appointments'
        and v.privilege_name = 'DELETE' then true
      else false
    end;

    actual := has_table_privilege(
      v.role_name,
      format('%I.%I', v.schema_name, v.table_name),
      v.privilege_name
    );

    if actual is distinct from expected then
      mismatches := concat_ws(
        E'\n',
        mismatches,
        format(
          'TABLE %s %I.%I %s: expected %s, got %s',
          v.role_name, v.schema_name, v.table_name,
          v.privilege_name, expected, actual
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
          v.role_name, v.schema_name, v.table_name, v.column_name,
          v.privilege_name, expected, actual
        )
      );
    end if;
  end loop;

  if mismatches <> '' then
    raise exception 'Effective privilege mismatches:%', E'\n' || mismatches;
  end if;

  if has_function_privilege(
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
     ) then
    raise exception 'RPC execute privileges do not match the approved roles';
  end if;
end
$$;

-- Required constraints, indexes, triggers, policies, and RLS state.
do $$
declare
  missing_object text;
  unexpected_policy text;
  invalid_policy text;
begin
  select required.object_name
  into missing_object
  from (values
    ('constraint:clinics_pkey'),
    ('constraint:clinics_name_key'),
    ('constraint:clinic_memberships_pkey'),
    ('constraint:clinic_memberships_clinic_id_fkey'),
    ('constraint:clinic_memberships_user_id_fkey'),
    ('constraint:clients_clinic_id_id_key'),
    ('constraint:clients_clinic_id_fkey'),
    ('constraint:appointments_clinic_id_fkey'),
    ('constraint:appointments_status_check'),
    ('constraint:appointments_estimated_duration_check'),
    ('constraint:appointments_clinic_client_fkey'),
    ('constraint:appointments_clinic_id_id_key'),
    ('constraint:appointments_no_overlap'),
    ('constraint:client_balance_entries_client_fkey'),
    ('constraint:client_balance_entries_appointment_fkey'),
    ('constraint:client_balance_entries_source_check'),
    ('index:clinic_memberships_user_clinic_idx'),
    ('index:clients_clinic_id_idx'),
    ('index:appointments_clinic_date_idx'),
    ('index:client_balance_entries_clinic_client_idx'),
    ('index:client_balance_entries_treatment_once_idx'),
    ('trigger:clients_prevent_physical_delete'),
    ('trigger:clients_prevent_truncate'),
    ('trigger:appointments_prevent_truncate'),
    ('trigger:client_balance_entries_prevent_truncate'),
    ('trigger:protect_completed_appointment_history'),
    ('trigger:client_balance_entries_apply'),
    ('trigger:client_balance_entries_append_only'),
    ('trigger:appointments_sync_completed_balance')
  ) required(object_name)
  where case
    when required.object_name like 'constraint:%' then not exists (
      select 1
      from pg_constraint c
      where c.conrelid in (
        'public.clinics'::regclass,
        'public.clinic_memberships'::regclass,
        'public.clients'::regclass,
        'public.appointments'::regclass,
        'public.client_balance_entries'::regclass
      )
        and c.conname = split_part(required.object_name, ':', 2)
    )
    when required.object_name like 'index:%' then to_regclass(
      'public.' || split_part(required.object_name, ':', 2)
    ) is null
    when required.object_name like 'trigger:%' then not exists (
      select 1
      from pg_trigger t
      where t.tgrelid in (
        'public.clients'::regclass,
        'public.appointments'::regclass,
        'public.client_balance_entries'::regclass
      )
        and t.tgname = split_part(required.object_name, ':', 2)
        and not t.tgisinternal
        and t.tgenabled = 'A'
    )
    else false
  end
  limit 1;

  if missing_object is not null then
    raise exception 'Required database object is missing or disabled: %',
      missing_object;
  end if;

  if exists (
    select 1
    from (values
      ('public.clinics'::regclass),
      ('public.clinic_memberships'::regclass),
      ('public.clients'::regclass),
      ('public.appointments'::regclass),
      ('public.client_balance_entries'::regclass)
    ) as required(table_oid)
    join pg_class c on c.oid = required.table_oid
    where not c.relrowsecurity
  ) then
    raise exception 'RLS is not enabled on every tenant table';
  end if;

  select expected.policy_name
  into missing_object
  from (values
    ('public.clinic_memberships'::regclass, 'clinic_memberships_select_self'),
    ('public.clinics'::regclass, 'clinics_select_member'),
    ('public.clients'::regclass, 'clients_select_member'),
    ('public.clients'::regclass, 'clients_insert_member'),
    ('public.clients'::regclass, 'clients_update_member'),
    ('public.client_balance_entries'::regclass, 'client_balance_entries_select_member'),
    ('public.appointments'::regclass, 'appointments_select_member'),
    ('public.appointments'::regclass, 'appointments_insert_member'),
    ('public.appointments'::regclass, 'appointments_update_member'),
    ('public.appointments'::regclass, 'appointments_delete_member')
  ) expected(table_oid, policy_name)
  left join pg_policy p
    on p.polrelid = expected.table_oid
   and p.polname = expected.policy_name
  where p.oid is null
  limit 1;

  if missing_object is not null then
    raise exception 'Expected RLS policy is missing: %', missing_object;
  end if;

  select p.polname
  into unexpected_policy
  from pg_policy p
  where p.polrelid in (
      'public.clinics'::regclass,
      'public.clinic_memberships'::regclass,
      'public.clients'::regclass,
      'public.appointments'::regclass,
      'public.client_balance_entries'::regclass
    )
    and not exists (
      select 1
      from (values
        ('public.clinic_memberships'::regclass, 'clinic_memberships_select_self'),
        ('public.clinics'::regclass, 'clinics_select_member'),
        ('public.clients'::regclass, 'clients_select_member'),
        ('public.clients'::regclass, 'clients_insert_member'),
        ('public.clients'::regclass, 'clients_update_member'),
        ('public.client_balance_entries'::regclass, 'client_balance_entries_select_member'),
        ('public.appointments'::regclass, 'appointments_select_member'),
        ('public.appointments'::regclass, 'appointments_insert_member'),
        ('public.appointments'::regclass, 'appointments_update_member'),
        ('public.appointments'::regclass, 'appointments_delete_member')
      ) expected(table_oid, policy_name)
      where expected.table_oid = p.polrelid
        and expected.policy_name = p.polname
    )
  limit 1;

  if unexpected_policy is not null then
    raise exception 'Unexpected RLS policy found: %', unexpected_policy;
  end if;

  with expected(
    table_name, policy_name, command, using_expression, check_expression
  ) as (
    values
      (
        'clinic_memberships', 'clinic_memberships_select_self', 'SELECT',
        'user_id = (select auth.uid())', null::text
      ),
      (
        'clinics', 'clinics_select_member', 'SELECT',
        'exists (select 1 from public.clinic_memberships m where m.clinic_id = clinics.id and m.user_id = (select auth.uid()))',
        null::text
      ),
      (
        'clients', 'clients_select_member', 'SELECT',
        'exists (select 1 from public.clinic_memberships m where m.clinic_id = clients.clinic_id and m.user_id = (select auth.uid()))',
        null::text
      ),
      (
        'clients', 'clients_insert_member', 'INSERT', null::text,
        'exists (select 1 from public.clinic_memberships m where m.clinic_id = clients.clinic_id and m.user_id = (select auth.uid()))'
      ),
      (
        'clients', 'clients_update_member', 'UPDATE',
        'exists (select 1 from public.clinic_memberships m where m.clinic_id = clients.clinic_id and m.user_id = (select auth.uid()))',
        'exists (select 1 from public.clinic_memberships m where m.clinic_id = clients.clinic_id and m.user_id = (select auth.uid()))'
      ),
      (
        'client_balance_entries', 'client_balance_entries_select_member',
        'SELECT',
        'exists (select 1 from public.clinic_memberships m where m.clinic_id = client_balance_entries.clinic_id and m.user_id = (select auth.uid()))',
        null::text
      ),
      (
        'appointments', 'appointments_select_member', 'SELECT',
        'exists (select 1 from public.clinic_memberships m where m.clinic_id = appointments.clinic_id and m.user_id = (select auth.uid()))',
        null::text
      ),
      (
        'appointments', 'appointments_insert_member', 'INSERT', null::text,
        'exists (select 1 from public.clinic_memberships m where m.clinic_id = appointments.clinic_id and m.user_id = (select auth.uid()))'
      ),
      (
        'appointments', 'appointments_update_member', 'UPDATE',
        'exists (select 1 from public.clinic_memberships m where m.clinic_id = appointments.clinic_id and m.user_id = (select auth.uid()))',
        'exists (select 1 from public.clinic_memberships m where m.clinic_id = appointments.clinic_id and m.user_id = (select auth.uid()))'
      ),
      (
        'appointments', 'appointments_delete_member', 'DELETE',
        'exists (select 1 from public.clinic_memberships m where m.clinic_id = appointments.clinic_id and m.user_id = (select auth.uid()))',
        null::text
      )
  ),
  normalized as (
    select
      p.policyname,
      p.permissive,
      p.cmd,
      p.roles,
      replace(
        regexp_replace(
          replace(lower(p.qual), 'public.', ''),
          '[[:space:]()]',
          '',
          'g'
        ),
        'asuid',
        ''
      ) as actual_using,
      replace(
        regexp_replace(
          replace(lower(p.with_check), 'public.', ''),
          '[[:space:]()]',
          '',
          'g'
        ),
        'asuid',
        ''
      ) as actual_check,
      replace(
        regexp_replace(
          replace(lower(expected.using_expression), 'public.', ''),
          '[[:space:]()]',
          '',
          'g'
        ),
        'asuid',
        ''
      ) as expected_using,
      replace(
        regexp_replace(
          replace(lower(expected.check_expression), 'public.', ''),
          '[[:space:]()]',
          '',
          'g'
        ),
        'asuid',
        ''
      ) as expected_check,
      expected.command
    from expected
    join pg_policies p
      on p.schemaname = 'public'
     and p.tablename = expected.table_name
     and p.policyname = expected.policy_name
  )
  select policyname
  into invalid_policy
  from normalized
  where permissive <> 'PERMISSIVE'
     or cmd <> command
     or roles <> array['authenticated']::name[]
     or actual_using is distinct from expected_using
     or actual_check is distinct from expected_check
  limit 1;

  if invalid_policy is not null then
    raise exception
      'RLS policy definition does not match the required command, role, permissiveness, and tenant predicate: %',
      invalid_policy;
  end if;
end
$$;

-- A successful run always discards its temporary fixtures and mutations.
rollback;
