"use client";

import { useRouter } from "next/navigation";
import Space from "@/components/space";
import ToolbarWin from "@/components/toolbarwin";
import { getSupabaseClient } from "@/config/supabase";
import { useAuth } from "@/config/auth-context";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { useCached } from "@/hooks/use-cached";

interface Friend {
  user_id: string;
  username: string;
  name: string;
  avatar_url: string | null;
}

const FONT = "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif";

export default function FriendsPage() {
  useProtectedRoute();
  const { user } = useAuth();
  const router = useRouter();

  const { data: friends, loading } = useCached<Friend[]>(
    `friends:${user?.id || "none"}`,
    async () => {
      if (!user) return [];
      const supabase = getSupabaseClient();

      const [sent, received] = await Promise.all([
        supabase.from("friend_requests").select("receiver_id").eq("sender_id", user.id).eq("status", "accepted"),
        supabase.from("friend_requests").select("sender_id").eq("receiver_id", user.id).eq("status", "accepted"),
      ]);

      const ids = [
        ...(sent.data?.map((r) => r.receiver_id) || []),
        ...(received.data?.map((r) => r.sender_id) || []),
      ];
      if (!ids.length) return [];

      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, username, name, avatar_url")
        .in("user_id", ids);

      return profiles || [];
    },
    []
  );

  return (
    <>
      <Space size={40} />
      <ToolbarWin title="Friends" />
      <Space size={8} />

      {loading ? (
        <div style={{ padding: "0 20px", color: "rgba(235,235,245,0.5)", fontFamily: FONT }}>Loading...</div>
      ) : friends.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "rgba(235,235,245,0.35)", fontFamily: FONT }}>No friends yet</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {friends.map((f) => {
            const initial = (f.name || f.username || "?").charAt(0).toUpperCase();
            return (
              <div
                key={f.user_id}
                onClick={() => router.push(`/messages/${f.username}`)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 20px", cursor: "pointer",
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(120,120,128,0.3)", overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                }}>
                  {f.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.avatar_url} alt={f.name} referrerPolicy="no-referrer"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: 20, fontWeight: 700, color: "#F5F5F5", fontFamily: FONT }}>{initial}</span>
                  )}
                </div>

                {/* Name + last message placeholder */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#F5F5F5", fontSize: 15, fontWeight: 600, fontFamily: FONT }}>
                    {f.name || f.username}
                  </div>
                  <div style={{
                    color: "rgba(235,235,245,0.35)", fontSize: 13, fontFamily: FONT,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    Tap to message
                  </div>
                </div>

                {/* Arrow */}
                <svg width="8" height="13" viewBox="0 0 8 13" fill="none">
                  <path d="M1 1L7 6.5L1 12" stroke="rgba(235,235,245,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
