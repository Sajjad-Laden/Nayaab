import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL,SUPABASE_ANON_KEY,isSupabaseConfigured } from './config.js';
const form=document.querySelector('#loginForm'),msg=document.querySelector('#loginMessage'),btn=document.querySelector('#loginButton');
if(!isSupabaseConfigured)msg.textContent='Configure Supabase URL and anon key in js/config.js first.';
const supabase=isSupabaseConfigured?createClient(SUPABASE_URL,SUPABASE_ANON_KEY):null;
form.addEventListener('submit',async e=>{e.preventDefault();if(!supabase)return;btn.disabled=true;msg.textContent='Signing in...';const fd=new FormData(form);const {error}=await supabase.auth.signInWithPassword({email:fd.get('email'),password:fd.get('password')});if(error){msg.textContent=error.message;btn.disabled=false;return}location.href='index.html'});
