"use client";

import { useEffect, useRef, useState } from "react";
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
const DELETE_WIDTH = 88;

function SwipeRow({
  children,
  onDelete,
}: {
  children: React.ReactNode;
  onDelete: () => void;
}) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const current = useRef(0);
  const horizontal = useRef<boolean | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    horizontal.current = null;
    setDragging(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;
    if (horizontal.current === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      horizontal.current = Math.abs(dx) > Math.abs(dy);
    }
    if (!horizontal.current) return;
    const next = Math.max(-DELETE_WIDTH, Math.min(0, current.current + dx));
    setOffset(next);
  };
  const onTouchEnd = () => {
    if (!dragging) return;
    setDragging(false);
    const snapped = offset < -DELETE_WIDTH / 2 ? -DELETE_WIDTH : 0;
    current.current = snapped;
    setOffset(snapped);
  };

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
      {offset < 0 && (
        <button
          onClick={onDelete}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            width: DELETE_WIDTH,
            background: "#FF3B30",
            border: "none",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: FONT,
            cursor: "pointer",
          }}
        >
          Delete
        </button>
      )}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          position: "relative",
          transform: `translateX(${offset}px)`,
          transition: dragging ? "none" : "transform 0.25s ease",
          background: "#0A0A0A",
          borderBottom: "1px solid rgba(235,235,245,0.06)",
          touchAction: "pan-y",
        }}
      >
        {children}
      </div>
    </div>
  );
}

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

      // Batch-load all sender profiles in a single query (avoids N+1).
      const senderIds = Array.from(new Set(data.map((n) => n.from_user_id)));
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, name, username, avatar_url")
        .in("user_id", senderIds);

      const byId = new Map(
        (profiles || []).map((p) => [p.user_id, p])
      );
      const withProfiles = data.map((n) => ({
        ...n,
        from_profile: byId.get(n.from_user_id) || undefined,
      }));
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

  const handleDelete = async (id: string) => {
    const prev = notifications;
    setNotifications((cur) => cur.filter((n) => n.id !== id));
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete notification:", error);
      setNotifications(prev);
    }
  };

  return (
    <>
      <Space size={8} />
      <ToolbarWin title="Notifications" />
      <Space size={10} />

      {loading ? (
        <div style={{ padding: "0 20px", color: "rgba(235,235,245,0.5)", fontFamily: FONT }}>Loading...</div>
      ) : notifications.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "rgba(235,235,245,0.35)", fontFamily: FONT }}>
          No notifications
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            {notifications.map((n) => {
              const name = n.from_profile?.name || "Someone";
              const initial = name.charAt(0).toUpperCase();
              const isPending = n.status === "pending";
              const isAccepted = n.status === "accepted";

              return (
                <SwipeRow key={n.id} onDelete={() => handleDelete(n.id)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px" }}>
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
                          height: 36, padding: "0 16px", borderRadius: 4, border: "none",
                          background: "#fff", color: "#000", fontSize: 14, fontWeight: 600,
                          fontFamily: FONT, cursor: "pointer",
                        }}>
                          Accept
                        </button>
                        <button onClick={() => handleDecline(n)} style={{
                          height: 36, padding: "0 16px", borderRadius: 4, border: "none",
                          background: "rgba(255,255,255,0.1)", color: "#F5F5F5", fontSize: 14, fontWeight: 600,
                          fontFamily: FONT, cursor: "pointer",
                        }}>
                          Decline
                        </button>
                      </div>
                    )}

                    {n.type === "friend_request" && isAccepted && (
                      <div style={{
                        height: 36, padding: "0 14px", borderRadius: 4,
                        background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center",
                        color: "rgba(235,235,245,0.5)", fontSize: 13, fontFamily: FONT, flexShrink: 0,
                      }}>
                        Friends ✓
                      </div>
                    )}
                  </div>
                </SwipeRow>
              );
            })}
          </div>

        </>
      )}
    </>
  );
}
