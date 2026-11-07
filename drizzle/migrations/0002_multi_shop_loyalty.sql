CREATE TABLE public.shops (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner_id uuid NOT NULL UNIQUE,
 name text NOT NULL DEFAULT 'My Store',
 phone text NOT NULL DEFAULT '',
 instagram text NOT NULL DEFAULT '',
 whatsapp text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.shops TO authenticated;
GRANT ALL ON public.shops TO service_role;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read their shop" ON public.shops FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owners create their shop" ON public.shops FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners update their shop" ON public.shops FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE TABLE public.shop_customers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 shop_id uuid NOT NULL REFERENCES public.shops(id),
 full_name text NOT NULL,
 phone text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(shop_id, phone),
 UNIQUE(id, shop_id)
);
GRANT SELECT ON public.shop_customers TO authenticated;
GRANT ALL ON public.shop_customers TO service_role;
ALTER TABLE public.shop_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read own customers" ON public.shop_customers FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.shops s WHERE s.id = shop_id AND s.owner_id = auth.uid()));
CREATE TABLE public.shop_stamps (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 shop_id uuid NOT NULL REFERENCES public.shops(id),
 customer_id uuid NOT NULL,
 stamp_date date NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(customer_id, shop_id) REFERENCES public.shop_customers(id, shop_id),
 UNIQUE(customer_id, stamp_date)
);
GRANT SELECT ON public.shop_stamps TO authenticated;
GRANT ALL ON public.shop_stamps TO service_role;
ALTER TABLE public.shop_stamps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners read own stamps" ON public.shop_stamps FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.shops s WHERE s.id = shop_id AND s.owner_id = auth.uid()));
INSERT INTO public.shops(id, owner_id, name, phone, instagram, whatsapp)
SELECT '11111111-1111-4111-8111-111111111111'::uuid, r.user_id, s.name, s.phone, s.instagram, s.whatsapp
FROM public.store_settings s CROSS JOIN LATERAL (SELECT user_id FROM public.user_roles WHERE role = 'admin' ORDER BY id LIMIT 1) r WHERE s.id = 1;
INSERT INTO public.shop_customers(id, shop_id, full_name, phone, created_at)
SELECT c.id, s.id, c.full_name, c.phone, c.created_at FROM public.customers c JOIN public.shops s ON s.id = '11111111-1111-4111-8111-111111111111'::uuid;
INSERT INTO public.shop_stamps(id, shop_id, customer_id, stamp_date, created_at)
SELECT t.id, s.id, t.customer_id, t.stamp_date, t.created_at FROM public.stamps t JOIN public.shops s ON s.id = '11111111-1111-4111-8111-111111111111'::uuid;
COMMENT ON TABLE public.store_settings IS 'DEPRECATED: replaced by owner-scoped public.shops';
COMMENT ON TABLE public.customers IS 'DEPRECATED: replaced by public.shop_customers';
COMMENT ON TABLE public.stamps IS 'DEPRECATED: replaced by public.shop_stamps';