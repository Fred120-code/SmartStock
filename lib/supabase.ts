import { createClient } from "@supabase/supabase-js";

// URL de ton projet Supabase (depuis .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Clé publique ANON (pour frontend/public API)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
