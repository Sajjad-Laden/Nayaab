// Public browser configuration only. Never put a Supabase service_role key here.
export const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY';
export const BKASH_MERCHANT_NUMBER = '01XXXXXXXXX';
export const CURRENCY = 'BDT';
export const DELIVERY_CHARGE = 80; // Set your real delivery fee before launch.
export const STORE_NAME = 'Nayaab Store';
export const isSupabaseConfigured = !SUPABASE_URL.includes('YOUR_PROJECT_ID') && !SUPABASE_ANON_KEY.startsWith('YOUR_');
