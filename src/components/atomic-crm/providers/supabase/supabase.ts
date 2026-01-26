import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const getSupabaseConfig = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase env missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }

  return { supabaseUrl, supabaseAnonKey };
};

let supabaseClient: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    const { supabaseUrl: url, supabaseAnonKey: key } = getSupabaseConfig();
    supabaseClient = createClient(url, key);
  }

  return supabaseClient;
};
