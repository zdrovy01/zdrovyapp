"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/config/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = getSupabaseClient();

        // Get the session from the callback
        const {
          data: { session },
        } = await supabase.auth.getSession();

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
          router.push("/");
        } else {
          router.push("/auth");
        }
      } catch (err) {
        console.error("Callback error:", err);
        router.push("/auth");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        color: "#F5F5F5",
      }}
    >
      Signing in...
    </div>
  );
}
