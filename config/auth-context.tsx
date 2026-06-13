"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/config/supabase";

interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CACHE_KEY = "zdrovy_user";

function readCache(): User | null {
  try { return JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null"); }
  catch { return null; }
}

function writeCache(u: User | null) {
  try {
    if (u) sessionStorage.setItem(CACHE_KEY, JSON.stringify(u));
    else sessionStorage.removeItem(CACHE_KEY);
  } catch { /* ignore */ }
}

async function buildUser(session: Session): Promise<User> {
  const supabase = getSupabaseClient();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .single();
  const meta = session.user.user_metadata || {};
  const email = session.user.email || "";
  const fallbackHandle = email.split("@")[0].replace(/[^a-z0-9_]/gi, "") || "user";
  const name = profile?.name || meta.name || meta.full_name || "";

  if (!profile || !profile.username) {
    await supabase.from("user_profiles").upsert({
      user_id: session.user.id,
      username: profile?.username || fallbackHandle,
      name: profile?.name || name,
      avatar_url: profile?.avatar_url || meta.avatar_url || meta.picture || null,
    }, { onConflict: "user_id" });
  }

  return {
    id: session.user.id,
    email,
    name,
    username: profile?.username || fallbackHandle,
    avatar_url: profile?.avatar_url || meta.avatar_url || meta.picture,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Seed from sessionStorage cache for instant render — no loading flicker
  const cached = typeof window !== "undefined" ? readCache() : null;
  const [user, setUser] = useState<User | null>(cached);
  const [loading, setLoading] = useState(!cached);

  const setAndCache = (u: User | null) => { setUser(u); writeCache(u); };

  useEffect(() => {
    const supabase = getSupabaseClient();
    let initialised = false;

    // Validate session in background; if cached user already shown, no loading state needed
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !initialised) {
        buildUser(session).then((u) => { setAndCache(u); setLoading(false); });
      } else if (!session && !initialised) {
        setAndCache(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        if (session?.user) {
          const u = await buildUser(session);
          setAndCache(u);
          setLoading(false);
        } else if (event === "SIGNED_OUT") {
          setAndCache(null);
          setLoading(false);
        } else if (!initialised) {
          setLoading(false);
        }
        initialised = true;
      }
    );

    const fallback = setTimeout(() => setLoading(false), 5000);
    return () => { subscription.unsubscribe(); clearTimeout(fallback); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginWithGoogle = async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  };

  const logout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setAndCache(null);
  };

  const refreshUser = async () => {
    const supabase = getSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) setAndCache(await buildUser(session));
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
