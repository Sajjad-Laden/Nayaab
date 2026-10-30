// Public browser config. Supabase anon/publishable key is designed for browser use with RLS.
// NEVER put service_role/secret keys or an admin password in this file.
export const SUPABASE_URL = 'https://ggrckhgttrkbbuyrladj.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_rtfHa9c-DxSF5KXFQAP1xA_xv8DFndj';
export const BKASH_PERSONAL_NUMBER = '01649117840';
export const NAGAD_PERSONAL_NUMBER = '01649117840';
export const CURRENCY = 'BDT';
export const DELIVERY_CHARGE = 80; // Change this in config AND Edge Function before launch.
export const STORE_NAME = 'Nayaab Store';
export const isSupabaseConfigured = SUPABASE_URL.startsWith('https://') && !SUPABASE_ANON_KEY.startsWith('PASTE_');
