"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/config/supabase";
import { COLORS } from "@/config/theme";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseClient();
    let done = false;

    const finish = async (session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]) => {
      if (done) return;
      done = true;

      if (session?.user) {
          // Create profile ONLY if it doesn't exist yet — never overwrite
          // a user's custom avatar/name/username on subsequent logins.
          try {
            const { data: existing } = await supabase
              .from("user_profiles")
              .select("user_id")
              .eq("user_id", session.user.id)
              .maybeSingle();

            if (!existing) {
              const meta = session.user.user_metadata || {};
              const { error } = await supabase.from("user_profiles").insert({
                user_id: session.user.id,
                name:
                  meta.name ||
                  meta.full_name ||
                  session.user.email?.split("@")[0] ||
                  "User",
                avatar_url: meta.avatar_url || meta.picture || null,
              });

              if (error) {
                console.error("Failed to create profile:", {
                  message: error.message,
                  code: error.code,
                  details: error.details,
                  hint: error.hint,
                });
              }
            }
          } catch (profileErr) {
            console.error("Profile create threw:", profileErr);
          }

          // Redirect to home regardless of profile result
          router.replace("/");
        } else {
          router.replace("/auth");
        }
    };

    // 1) Try existing session immediately (may already be exchanged).
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) finish(data.session);
    });

    // 2) React to the OAuth token exchange completing.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) finish(session);
      }
    );

    // 3) Fallback: if nothing resolved in 6s, bounce to /auth.
    const timeout = setTimeout(() => finish(null), 6000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        color: COLORS.text,
      }}
    >
      Signing in...
    </div>
  );
}
