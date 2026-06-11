create or replace function get_sync_jobs(uid uuid)
returns setof sync_jobs
language sql
as $$
  select *
  from sync_jobs
  where user_id = uid
     or payload->>'user_id' = uid::text
  order by scheduled_at desc;
$$;