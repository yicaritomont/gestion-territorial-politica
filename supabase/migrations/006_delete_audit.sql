create table if not exists public.admin_delete_audit (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  record_data jsonb not null,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_email text not null,
  deleted_at timestamptz not null default now()
);

create index if not exists admin_delete_audit_deleted_at_idx
  on public.admin_delete_audit (deleted_at desc);

alter table public.admin_delete_audit enable row level security;
revoke all on public.admin_delete_audit from anon, authenticated;

create or replace function public.delete_admin_content(
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
  if p_table not in ('featured_content', 'profile_sections', 'offices', 'communes') then
    raise exception 'Tipo de contenido no permitido';
  end if;

  execute format(
    'select to_jsonb(t) from public.%I t where id = $1 for update',
    p_table
  ) into deleted_row using p_id;

  if deleted_row is null then
    raise exception 'No existe el registro solicitado';
  end if;

  execute format('delete from public.%I where id = $1', p_table) using p_id;

  insert into public.admin_delete_audit (
    table_name, record_id, record_data, actor_user_id, actor_email
  ) values (
    p_table, p_id, deleted_row, p_actor_user_id, p_actor_email
  );
end;
$$;

revoke all on function public.delete_admin_content(text, uuid, uuid, text)
  from public, anon, authenticated;
grant execute on function public.delete_admin_content(text, uuid, uuid, text)
  to service_role;
