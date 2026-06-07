"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getSupabaseClient } from "@/config/supabase";

interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();

    // Listen for auth state changes (e.g. after OAuth redirect)
    let unsubscribe: (() => void) | null = null;
    getSupabaseClient().then((supabase) => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: import("@supabase/supabase-js").Session | null) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single();
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            name: profile?.name,
            avatar_url: profile?.avatar_url,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      unsubscribe = () => subscription.unsubscribe();
    });

    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const checkAuth = async () => {
    try {
      const supabase = await getSupabaseClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", authUser.id)
          .single();

        setUser({
          id: authUser.id,
          email: authUser.email || "",
          name: profile?.name,
          avatar_url: profile?.avatar_url,
        });
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const supabase = await getSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      const supabase = await getSupabaseClient();
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
