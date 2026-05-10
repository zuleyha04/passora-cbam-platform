/**
 * Netlify Functions — Supabase server-side client
 * Service role key'i kullanır → RLS bypass, güvenli
 * Bu dosya asla client'a gitmez (netlify/functions içinde)
 */
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_KEY!;   // secret — NOT anon key

if (!url || !key) {
  throw new Error(
    'SUPABASE_URL ve SUPABASE_SERVICE_KEY ortam değişkenleri ayarlanmamış.\n' +
    'Netlify Dashboard → Site Settings → Environment Variables bölümünden ekleyin.'
  );
}

export const db = createClient(url, key, {
  auth: { persistSession: false },
});
