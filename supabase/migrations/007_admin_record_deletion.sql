create or replace function public.delete_admin_record(
  p_table text,
  p_id uuid,
  p_actor_user_id uuid,
  p_actor_email text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  deleted_row jsonb;
begin
  if p_table is null or p_table not in ('people', 'meetings', 'prospects', 'commitments') then
    raise exception 'Tipo de registro no permitido';
  end if;
  if p_actor_user_id is null or nullif(trim(p_actor_email), '') is null then
    raise exception 'No se pudo identificar al usuario que realiza la eliminación';
  end if;

  execute format(
    'select to_jsonb(t) from public.%I t where id = $1 for update',
    p_table
  ) into deleted_row using p_id;

  if deleted_row is null then
    raise exception 'No existe el registro solicitado';
  end if;

  if p_table = 'people' then
    update public.commitments set leader_id = null where leader_id = p_id;
  elsif p_table = 'meetings' then
    update public.commitments set meeting_id = null where meeting_id = p_id;
  end if;

  execute format('delete from public.%I where id = $1', p_table) using p_id;

  insert into public.admin_delete_audit (
    table_name, record_id, record_data, actor_user_id, actor_email
  ) values (
    p_table, p_id, deleted_row, p_actor_user_id, trim(p_actor_email)
  );
end;
$$;

revoke all on function public.delete_admin_record(text, uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.delete_admin_record(text, uuid, uuid, text)
  to service_role;
