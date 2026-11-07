CREATE TABLE public.owner_access (email text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, DELETE ON public.owner_access TO authenticated;
GRANT ALL ON public.owner_access TO service_role;
ALTER TABLE public.owner_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage access" ON public.owner_access FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE OR REPLACE FUNCTION public.has_owner_access(_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id,'admin') OR EXISTS (SELECT 1 FROM public.owner_access a JOIN auth.users u ON lower(u.email)=a.email WHERE u.id=_user_id)
$$;
GRANT EXECUTE ON FUNCTION public.has_owner_access(uuid) TO authenticated, service_role;