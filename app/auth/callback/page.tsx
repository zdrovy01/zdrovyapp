"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/config/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = await getSupabaseClient();

        // Get the session from the callback
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Create or update user profile (best-effort, must not block login)
          try {
            const meta = session.user.user_metadata || {};
            const { error } = await supabase.from("user_profiles").upsert(
              {
                user_id: session.user.id,
                name:
                  meta.name ||
                  meta.full_name ||
                  session.user.email?.split("@")[0] ||
                  "User",
                avatar_url: meta.avatar_url || meta.picture || null,
              },
              { onConflict: "user_id" }
            );

            if (error) {
              console.error("Failed to create profile:", {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
              });
            }
          } catch (profileErr) {
            console.error("Profile upsert threw:", profileErr);
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
