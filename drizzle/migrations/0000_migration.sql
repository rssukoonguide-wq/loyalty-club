create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.customers (id uuid primary key default gen_random_uuid(), full_name text not null, phone text not null unique, created_at timestamptz not null default now());
create table public.stamps (id uuid primary key default gen_random_uuid(), customer_id uuid not null references public.customers(id) on delete cascade, stamp_date date not null, created_at timestamptz not null default now(), unique(customer_id, stamp_date));
grant select on public.customers, public.stamps to authenticated;
grant all on public.customers, public.stamps to service_role;
alter table public.customers enable row level security;
alter table public.stamps enable row level security;
create policy "admins read customers" on public.customers for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins read stamps" on public.stamps for select to authenticated using (public.has_role(auth.uid(),'admin'));