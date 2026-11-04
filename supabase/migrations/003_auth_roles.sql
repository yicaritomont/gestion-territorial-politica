-- Execute after 001_initial.sql and 002_full_admin.sql
create table if not exists public.app_users (
 user_id uuid primary key references auth.users(id) on delete cascade,
 role text not null check (role in ('admin','facilitator')),
 active boolean not null default true,
 created_at timestamptz not null default now()
);
alter table public.app_users enable row level security;
-- No anon/authenticated write policies. Server-side service key only.
-- Create the first user in Supabase > Authentication > Users, then run:
-- insert into public.app_users(user_id,role,active)
-- select id,'admin',true from auth.users where email='TU_CORREO_ADMIN@EJEMPLO.COM'
-- on conflict (user_id) do update set role='admin',active=true;
