# Nayaab Store — E-commerce Starter

A responsive multi-category storefront built with HTML, CSS and vanilla JavaScript, Supabase (Postgres/Auth/Edge Functions), and GitHub Pages.

## Included
- Responsive storefront, categories, product search/sort, cart and checkout.
- Supabase product catalog.
- Secure order creation Edge Function (server-side price/stock validation).
- Admin login, dashboard, order status management and product CRUD.
- COD plus manual bKash/Nagad transaction-reference submission.

## 1. Create Supabase project
1. Create a project at https://supabase.com.
2. Open **SQL Editor**, paste and run `supabase/schema.sql`.
3. In **Project Settings → API**, copy the Project URL and anon/publishable key.
4. Edit `js/config.js`: set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `BKASH_PERSONAL_NUMBER and NAGAD_PERSONAL_NUMBER`, and `DELIVERY_CHARGE`.
5. Never put the `service_role` key in `js/config.js` or any browser file.

## 2. Deploy the order function
Install the Supabase CLI, sign in, link the project, then from this project directory run:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy create-order
```

The deployed Edge Function receives `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the Supabase runtime. Do not expose the service role key in GitHub. If you have changed the function's secrets or deployment setup, configure them through Supabase's function secrets interface.

**Important:** the function currently uses a simple stock check/update. For a high-volume store, use a single PostgreSQL transaction/RPC with row locks to prevent simultaneous orders overselling the same stock.

## 3. Create the first admin
1. In Supabase Dashboard → Authentication → Users → Add user, create the account with email `sajjad@gmail.com` and a strong password that you choose privately. The password is NOT included in this repository and should never be sent in chat or committed to GitHub.
2. Confirm the account if Supabase asks, then copy its UUID from Authentication → Users.
3. Run this SQL in SQL Editor, replacing the UUID with the actual Auth user UUID:

```sql
insert into public.admin_users(user_id)
select id from auth.users where email = 'sajjad@gmail.com'
on conflict (user_id) do nothing;
```

4. Open `/admin/login.html` and sign in using that email and the private password you set. The email alone cannot create an admin account; the matching Auth user must exist and be allow-listed in `admin_users`.

4. Open `admin/login.html` on your deployed site and sign in.
5. Do not add a public admin sign-up page. Only manually provision trusted admin users.

## 4. Configure bKash and Nagad
This build supports **manual personal-account Send Money reference collection** for bKash and Nagad, not automatic gateway payments. The supplied number `01649117840` is configured for both methods in `js/config.js`. Confirm that this number is active for both services before launch. Customers submit the transaction reference; verify each payment in the relevant official app/account before marking it paid. Never ask customers for PIN or OTP. Personal accounts may have provider terms/limits that restrict commercial use; check the providers' current merchant/business requirements before accepting business payments. For automatic payment, obtain approved merchant accounts and integrate the official checkout APIs through secure server-side functions. For automatic payment, obtain a merchant account and integrate the official bKash Checkout API through a secure server-side function.

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

## Project-specific settings (provided by store owner)
- Supabase Project URL: `https://ggrckhgttrkbbuyrladj.supabase.co`
- Admin login email: `sajjad@gmail.com` (create this Auth user yourself; set a private strong password in Supabase)
- bKash personal number: `01649117840`
- Nagad personal number: `01649117840`
- Delivery fee: BDT 80 placeholder; confirm/change before accepting orders.

**Still required from the owner:** copy the project's anon/publishable key from Supabase → Project Settings → API and paste it into `js/config.js`. Do not provide or use the `service_role` key in browser code.
