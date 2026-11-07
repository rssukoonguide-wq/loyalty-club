create table public.store_settings (
  id int primary key default 1 check (id = 1),
  name text not null default 'My Store',
  phone text not null default '',
  instagram text not null default '',
  whatsapp text not null default '',
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.store_settings to authenticated;
grant all on public.store_settings to service_role;
alter table public.store_settings enable row level security;
create policy "admins read settings" on public.store_settings for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admins insert settings" on public.store_settings for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admins update settings" on public.store_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));