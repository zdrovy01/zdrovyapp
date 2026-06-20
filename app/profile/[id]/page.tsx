"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Space from "@/components/space";
import ToolbarWin from "@/components/toolbarwin";
import AvatarViewer from "@/components/avatarviewer";
import { getSupabaseClient } from "@/config/supabase";
import { useAuth } from "@/config/auth-context";
import { useProtectedRoute } from "@/hooks/use-protected-route";

interface ProfileData {
  user_id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  recipes_count: number;
  followers_count: number;
  following_count: number;
}

type FriendStatus = "none" | "pending" | "accepted";

const FONT = "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif";

const btnStyle = (bg: string, color: string, disabled = false): React.CSSProperties => ({
  flex: 1,
  height: 44,
  borderRadius: 14,
  border: "none",
  background: bg,
  color,
  fontSize: 15,
  fontWeight: 600,
  fontFamily: FONT,
  cursor: disabled ? "default" : "pointer",
  opacity: disabled ? 0.5 : 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export default function ProfilePage() {
  useProtectedRoute();
  const { user: me } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>("none");
  const isOwnProfile = me?.id === id;

  useEffect(() => {
    if (!id) return;
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, me]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();

      // Load profile + counts
      const [profileRes, recipesRes, followersRes, followingRes] = await Promise.all([
        supabase.from("user_profiles").select("*").eq("user_id", id).single(),
        supabase.from("recipes").select("id", { count: "exact", head: true }).eq("user_id", id),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", id),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", id),
      ]);

      if (profileRes.data) {
        setProfile({
          user_id: id,
          name: profileRes.data.name || "User",
          username: profileRes.data.username || id,
          avatar_url: profileRes.data.avatar_url || null,
          recipes_count: recipesRes.count || 0,
          followers_count: followersRes.count || 0,
          following_count: followingRes.count || 0,
        });
      }

      // Load follow & friend status for current user
      if (me && !isOwnProfile) {
        const [followRes, friendRes] = await Promise.all([
          supabase.from("follows").select("id").eq("follower_id", me.id).eq("following_id", id).maybeSingle(),
          supabase.from("friend_requests").select("id, status").eq("sender_id", me.id).eq("receiver_id", id).maybeSingle(),
        ]);
        setIsFollowing(!!followRes.data);
        setFriendStatus((friendRes.data?.status as FriendStatus) || "none");
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!me) return;
    const supabase = getSupabaseClient();
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", me.id).eq("following_id", id);
      setIsFollowing(false);
      setProfile((p) => p ? { ...p, followers_count: p.followers_count - 1 } : p);
    } else {
      await supabase.from("follows").insert({ follower_id: me.id, following_id: id });
      setIsFollowing(true);
      setProfile((p) => p ? { ...p, followers_count: p.followers_count + 1 } : p);
    }
  };

  const handleFriendRequest = async () => {
    if (!me || friendStatus !== "none") return;
    const supabase = getSupabaseClient();
    await supabase.from("friend_requests").insert({ sender_id: me.id, receiver_id: id, status: "pending" });
    // Create notification for receiver
    await supabase.from("notifications").insert({ user_id: id, type: "friend_request", from_user_id: me.id, status: "pending" });
    setFriendStatus("pending");
  };

  if (loading) {
    return (
      <>
        <Space size={40} />
        <ToolbarWin title="" />
        <div style={{ padding: "40px 20px", textAlign: "center", color: "rgba(235,235,245,0.5)", fontFamily: FONT }}>
          Loading...
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Space size={40} />
        <ToolbarWin title="Profile" />
        <div style={{ padding: "40px 20px", textAlign: "center", color: "rgba(235,235,245,0.5)", fontFamily: FONT }}>
          User not found
        </div>
      </>
    );
  }

  const initial = profile.name.charAt(0).toUpperCase();

  return (
    <>
      <Space size={40} />
      <ToolbarWin title={`@${profile.username}`} />
      <Space size={20} />

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Avatar + stats row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Avatar */}
          <AvatarViewer src={profile.avatar_url} initial={initial} size={80} />

          {/* Stats */}
          {[
            { label: "Recipes", value: profile.recipes_count, href: null },
            { label: "Followers", value: profile.followers_count, href: `/followers/${profile.username}` },
            { label: "Following", value: profile.following_count, href: `/following/${profile.username}` },
          ].map((s) => (
            <div key={s.label}
              onClick={() => s.href && router.push(s.href)}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: s.href ? "pointer" : "default" }}>
              <span style={{ color: "#F5F5F5", fontSize: 20, fontWeight: 700, fontFamily: FONT }}>{s.value}</span>
              <span style={{ color: "rgba(235,235,245,0.5)", fontSize: 12, fontFamily: FONT }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Name */}
        <div>
          <div style={{ color: "#F5F5F5", fontSize: 17, fontWeight: 700, fontFamily: FONT }}>{profile.name}</div>
          <div style={{ color: "rgba(235,235,245,0.45)", fontSize: 14, fontFamily: FONT }}>@{profile.username}</div>
        </div>

        {/* Action buttons */}
        {!isOwnProfile && (
          <div style={{ display: "flex", gap: 10 }}>
            {/* Follow / Unfollow */}
            <button
              onClick={handleFollow}
              style={btnStyle(
                isFollowing ? "rgba(255,255,255,0.1)" : "#fff",
                isFollowing ? "#F5F5F5" : "#000"
              )}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>

            {/* Friend request */}
            <button
              onClick={handleFriendRequest}
              disabled={friendStatus !== "none"}
              style={btnStyle(
                friendStatus === "accepted"
                  ? "rgba(255,255,255,0.1)"
                  : friendStatus === "pending"
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(255,255,255,0.12)",
                "#F5F5F5",
                friendStatus === "pending"
              )}
            >
              {friendStatus === "accepted" ? "Message" : friendStatus === "pending" ? "Sent ✓" : "Add Friend"}
            </button>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 0.5, background: "rgba(255,255,255,0.08)", marginTop: 4 }} />

        {/* Placeholder grid for recipes */}
        <div style={{ color: "rgba(235,235,245,0.35)", fontSize: 14, fontFamily: FONT, textAlign: "center", paddingTop: 20 }}>
          {profile.recipes_count === 0 ? "No recipes yet" : `${profile.recipes_count} recipe${profile.recipes_count !== 1 ? "s" : ""}`}
        </div>
      </div>
    </>
  );
}
