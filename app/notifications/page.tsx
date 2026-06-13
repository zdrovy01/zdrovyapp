"use client";

import { useEffect, useState } from "react";
import Space from "@/components/space";
import ToolbarWin from "@/components/toolbarwin";
import { getSupabaseClient } from "@/config/supabase";
import { useAuth } from "@/config/auth-context";
import { useProtectedRoute } from "@/hooks/use-protected-route";

interface Notification {
  id: string;
  type: string;
  from_user_id: string;
  status: string;
  created_at: string;
  from_profile?: { name: string; username: string; avatar_url: string | null };
}

const FONT = "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif";

export default function NotificationsPage() {
  useProtectedRoute();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!data) { setNotifications([]); return; }

      // Load sender profiles
      const withProfiles = await Promise.all(
        data.map(async (n) => {
          const { data: p } = await supabase
            .from("user_profiles")
            .select("name, username, avatar_url")
            .eq("user_id", n.from_user_id)
            .single();
          return { ...n, from_profile: p || undefined };
        })
      );
      setNotifications(withProfiles);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (notif: Notification) => {
    const supabase = getSupabaseClient();
    await Promise.all([
      supabase.from("friend_requests")
        .update({ status: "accepted" })
        .eq("sender_id", notif.from_user_id)
        .eq("receiver_id", user!.id),
      supabase.from("notifications")
        .update({ status: "accepted" })
        .eq("id", notif.id),
    ]);
    setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, status: "accepted" } : n));
  };

  const handleDecline = async (notif: Notification) => {
    const supabase = getSupabaseClient();
    await Promise.all([
      supabase.from("friend_requests")
        .delete()
        .eq("sender_id", notif.from_user_id)
        .eq("receiver_id", user!.id),
      supabase.from("notifications")
        .update({ status: "declined" })
        .eq("id", notif.id),
    ]);
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
  };

  return (
    <>
      <Space size={40} />
      <ToolbarWin title="Notifications" />
      <Space size={10} />

      {loading ? (
        <div style={{ padding: "0 20px", color: "rgba(235,235,245,0.5)", fontFamily: FONT }}>Loading...</div>
      ) : notifications.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "rgba(235,235,245,0.35)", fontFamily: FONT }}>
          No notifications
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 20px" }}>
          {notifications.map((n) => {
            const name = n.from_profile?.name || "Someone";
            const initial = name.charAt(0).toUpperCase();
            const isPending = n.status === "pending";
            const isAccepted = n.status === "accepted";

            return (
              <div key={n.id} style={{
                background: "#0A0A0A", borderRadius: 20, padding: "16px",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                {/* Avatar */}
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(120,120,128,0.3)", overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {n.from_profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={n.from_profile.avatar_url} alt={name} referrerPolicy="no-referrer"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: 20, fontWeight: 700, color: "#F5F5F5", fontFamily: FONT }}>{initial}</span>
                  )}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#F5F5F5", fontSize: 15, fontWeight: 600, fontFamily: FONT }}>
                    {name}
                  </div>
                  <div style={{ color: "rgba(235,235,245,0.5)", fontSize: 13, fontFamily: FONT }}>
                    {n.type === "friend_request"
                      ? isAccepted ? "You are now friends" : "sent you a friend request"
                      : n.type}
                  </div>
                </div>

                {/* Actions */}
                {n.type === "friend_request" && isPending && (
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button onClick={() => handleAccept(n)} style={{
                      height: 36, padding: "0 16px", borderRadius: 10, border: "none",
                      background: "#fff", color: "#000", fontSize: 14, fontWeight: 600,
                      fontFamily: FONT, cursor: "pointer",
                    }}>
                      Accept
                    </button>
                    <button onClick={() => handleDecline(n)} style={{
                      height: 36, padding: "0 16px", borderRadius: 10, border: "none",
                      background: "rgba(255,255,255,0.1)", color: "#F5F5F5", fontSize: 14, fontWeight: 600,
                      fontFamily: FONT, cursor: "pointer",
                    }}>
                      Decline
                    </button>
                  </div>
                )}

                {n.type === "friend_request" && isAccepted && (
                  <div style={{
                    height: 36, padding: "0 14px", borderRadius: 10,
                    background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center",
                    color: "rgba(235,235,245,0.5)", fontSize: 13, fontFamily: FONT, flexShrink: 0,
                  }}>
                    Friends ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
