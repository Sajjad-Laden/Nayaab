// Public browser configuration only. Never put a Supabase service_role key here.
   export const SUPABASE_URL = 'https://ggrckhgttrkbbuyrladj.supabase.co';
   export const SUPABASE_ANON_KEY = 'sb_publishable_rtfHa9c-DxSF5KXFQAP1xA_xv8DFndj';
export const BKASH_MERCHANT_NUMBER = '01XXXXXXXXX';
export const CURRENCY = 'BDT';
export const DELIVERY_CHARGE = 80; // Set your real delivery fee before launch.
export const STORE_NAME = 'Nayaab Store';
export const isSupabaseConfigured = !SUPABASE_URL.includes('YOUR_PROJECT_ID') && !SUPABASE_ANON_KEY.startsWith('YOUR_');
