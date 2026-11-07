<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Customers have no login: they are identified by mobile number (kept in browser storage) and all customer reads/writes go through server functions in src/lib/loyalty.functions.ts using the admin client — keeps customer tables locked from the public.
- One-stamp-per-day is enforced by a unique (customer_id, stamp_date) constraint with dates computed in India time (storeDay) — the database is the source of truth, not the UI.
- Each authenticated owner can create one shop; authorize owner reads/writes with shops.owner_id and RLS, never a global admin role. The dashboard lives at /admin and owner Profile includes setup and QR.
- Customer QR destinations come from the public URL configuration in store-links, never the current browser origin, because editor previews require access and printed QR codes must work without owner login.
- Rewards navigation opens a dedicated reward journey page; keep the scan destination separate so browsing rewards never collects a stamp.
- Customer identity storage, query caches and all stamp/customer operations are scoped to the active shop ID; shop_customers and shop_stamps replace legacy single-store tables and preserve the original shop ID for old QR links.
- Owner dashboards require access granted by the app admin (has_owner_access: admin role or email in owner_access); revoked shops cannot collect stamps — app is sold per shop owner.
