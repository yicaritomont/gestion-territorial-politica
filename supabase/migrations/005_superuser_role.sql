-- Run after 003_auth_roles.sql.
alter table public.app_users
  drop constraint if exists app_users_role_check;

alter table public.app_users
  add constraint app_users_role_check
  check (role in ('admin','facilitator','superuser'));

-- After creating the initial account in Supabase Authentication, grant it superuser:
-- update public.app_users
-- set role='superuser',active=true
-- where user_id=(select id from auth.users where email='TU_CORREO@EJEMPLO.COM');
