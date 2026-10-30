-- Run in Supabase SQL Editor AFTER creating the admin user in Authentication -> Users.
-- Change the email below to exactly the email you used for that user.
insert into public.admin_users (user_id)
select id from auth.users where email = 'sajjad@gmail.com'
on conflict (user_id) do nothing;

-- Should return 1 row:
select a.user_id, u.email from public.admin_users a join auth.users u on u.id = a.user_id;
