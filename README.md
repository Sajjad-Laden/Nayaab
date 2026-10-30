# Nayaab Store — E-commerce Starter

A responsive multi-category storefront built with HTML, CSS and vanilla JavaScript, Supabase (Postgres/Auth/Edge Functions), and GitHub Pages.

## Included
- Responsive storefront, categories, product search/sort, cart and checkout.
- Supabase product catalog.
- Secure order creation Edge Function (server-side price/stock validation).
- Admin login, dashboard, order status management and product CRUD.
- COD and manual bKash transaction-ID submission.

## 1. Create Supabase project
1. Create a project at https://supabase.com.
2. Open **SQL Editor**, paste and run `supabase/schema.sql`.
3. In **Project Settings → API**, copy the Project URL and anon/publishable key.
4. Edit `js/config.js`: set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `BKASH_MERCHANT_NUMBER`, and `DELIVERY_CHARGE`.
5. Never put the `service_role` key in `js/config.js` or any browser file.

## 2. Deploy the order function
Install the Supabase CLI, sign in, link the project, then from this project directory run:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy create-order --no-verify-jwt
```

The deployed Edge Function receives `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the Supabase runtime. Do not expose the service role key in GitHub. If you have changed the function's secrets or deployment setup, configure them through Supabase's function secrets interface.

**Important:** the function currently uses a simple stock check/update. For a high-volume store, use a single PostgreSQL transaction/RPC with row locks to prevent simultaneous orders overselling the same stock.

## 3. Create the first admin
1. In Supabase Dashboard → Authentication → Users, create an admin user with email and password.
2. Copy that user's UUID (or simply run `supabase/create_admin.sql`, which looks the user up by email).
3. Run this SQL in SQL Editor, replacing the UUID:

```sql
insert into public.admin_users(user_id)
values ('PASTE_AUTH_USER_UUID_HERE');
```

4. Open `admin/login.html` on your deployed site and sign in.
5. Do not add a public admin sign-up page. Only manually provision trusted admin users.

## 4. Configure bKash
This starter supports **manual bKash payment reference collection**, not automatic bKash gateway payment. Put your approved merchant number in `js/config.js`. Customers pay using your merchant instructions and submit their TrxID. Verify each payment in your merchant app/portal before marking it paid. Never ask customers for PIN or OTP. For automatic payment, obtain a merchant account and integrate the official bKash Checkout API through a secure server-side function.

## 5. Deploy frontend on GitHub Pages
1. Create a GitHub repository, e.g. `nayaab-store`.
2. Upload/push all files and folders in this project.
3. GitHub → repository Settings → Pages → Deploy from a branch → `main` / root.
4. Wait for the Pages URL, then open it over HTTPS.
5. Test checkout and admin on the deployed URL. Configure Supabase Auth allowed redirect URLs/site URL to your GitHub Pages domain if needed.

## 6. Before accepting real orders
- Replace sample product names, photos, prices and stock with your real products.
- Set the real delivery charge in **both** `js/config.js` and `supabase/functions/create-order/index.ts` (currently BDT 80); keep these values identical.
- Add your support contact, delivery/return policy, privacy policy and terms.
- Test with a small test order; verify customer details, order items, stock and admin access.
- Review Supabase RLS policies and logs. The browser only receives the anon/publishable key; service role stays server-side.
- Configure domain, analytics, backups and email/notification service before launch.

## Project structure

```text
index.html
css/style.css
js/config.js
js/store.js
admin/login.html
admin/index.html
js/admin-login.js
js/admin.js
supabase/schema.sql
supabase/functions/create-order/index.ts
```

## Current MVP limitations
- Demo products display if Supabase is not configured; checkout is intentionally disabled until Supabase is configured.
- bKash payment is manual verification only.
- Order tracking page, customer accounts, automated email/Telegram notifications, image upload storage and transactional stock reservation are future enhancements.
