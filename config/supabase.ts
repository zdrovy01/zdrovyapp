// Supabase configuration
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.warn("SUPABASE_URL is not set in .env.local");
}

if (!SUPABASE_ANON_KEY) {
  console.warn("SUPABASE_ANON_KEY is not set in .env.local");
}

// Initialize Supabase client (for client-side)
let supabaseClient: any = null;

export const getSupabaseClient = async () => {
  if (!supabaseClient) {
    const { createClient } = await import("@supabase/supabase-js");

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Supabase is not configured properly");
    }

    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return supabaseClient;
};
