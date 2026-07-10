"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Space from "@/components/space";
import ToolbarWin from "@/components/toolbarwin";
import AvatarViewer from "@/components/avatarviewer";
import { getSupabaseClient } from "@/config/supabase";
import { COLORS } from "@/config/theme";
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

interface RecipeThumb {
  id: string;
  name: string;
  image_url: string | null;
}

// Session cache so re-opening a profile shows instantly (revalidates in background).
const profileCache = new Map<string, ProfileData>();

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
  const { username } = useParams<{ username: string }>();

  const cached = username ? profileCache.get(username) : undefined;
  const [profile, setProfile] = useState<ProfileData | null>(cached || null);
  const [loading, setLoading] = useState(!cached);
  const [isFollowing, setIsFollowing] = useState(false);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>("none");
  const [targetId, setTargetId] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<RecipeThumb[]>([]);
  const isOwnProfile = me?.username === username;

  useEffect(() => {
    if (!username) return;
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, me]);

  const loadProfile = async () => {
    try {
      const supabase = getSupabaseClient();

      let { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("username", username)
        .single();

      // fallback: treat the param as user_id
      if (!profileData) {
        const { data: byId } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", username)
          .single();
        profileData = byId;
      }

      if (!profileData) { setProfile(null); setLoading(false); return; }

      const uid = profileData.user_id as string;
      setTargetId(uid);

      const [recipesRes, followersRes, followingRes, recipeListRes] = await Promise.all([
        supabase.from("recipes").select("id", { count: "exact", head: true }).eq("user_id", uid),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", uid),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", uid),
        supabase.from("recipes").select("id, name, image_url").eq("user_id", uid).order("created_at", { ascending: false }),
      ]);

      setRecipes((recipeListRes.data as RecipeThumb[]) || []);

      const built: ProfileData = {
        user_id: uid,
        name: profileData.name || "User",
        username: profileData.username || username,
        avatar_url: profileData.avatar_url || null,
        recipes_count: recipesRes.count || 0,
        followers_count: followersRes.count || 0,
        following_count: followingRes.count || 0,
      };
      if (username) profileCache.set(username, built);
      setProfile(built);

      if (me && !isOwnProfile) {
        const [followRes, friendRes] = await Promise.all([
          supabase.from("follows").select("id").eq("follower_id", me.id).eq("following_id", uid).maybeSingle(),
          supabase.from("friend_requests").select("id, status").eq("sender_id", me.id).eq("receiver_id", uid).maybeSingle(),
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
    if (!me || !targetId) return;
    const supabase = getSupabaseClient();
    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", me.id).eq("following_id", targetId);
      setIsFollowing(false);
      setProfile((p) => p ? { ...p, followers_count: p.followers_count - 1 } : p);
    } else {
      await supabase.from("follows").insert({ follower_id: me.id, following_id: targetId });
      setIsFollowing(true);
      setProfile((p) => p ? { ...p, followers_count: p.followers_count + 1 } : p);
    }
  };

  const handleFriendRequest = async () => {
    if (!me || !targetId || friendStatus !== "none") return;
    const supabase = getSupabaseClient();
    await supabase.from("friend_requests").insert({ sender_id: me.id, receiver_id: targetId, status: "pending" });
    await supabase.from("notifications").insert({ user_id: targetId, type: "friend_request", from_user_id: me.id, status: "pending" });
    setFriendStatus("pending");
  };

  if (loading) {
    return (
      <>
        <Space size={8} />
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
        <Space size={8} />
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
      <Space size={8} />
      <ToolbarWin title={`@${profile.username}`} />
      <Space size={10} />

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Avatar + (name + stats) row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Avatar */}
          <AvatarViewer src={profile.avatar_url} initial={initial} size={80} />

          {/* Right column: name on top, stats below */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Name */}
            <div style={{ color: "#F5F5F5", fontSize: 17, fontWeight: 700, fontFamily: FONT }}>{profile.name}</div>

            {/* Stats */}
            <div style={{ display: "flex" }}>
              {[
                { label: "Recipes", value: profile.recipes_count, href: null },
                { label: "Followers", value: profile.followers_count, href: `/followers/${username}` },
                { label: "Following", value: profile.following_count, href: `/following/${username}` },
              ].map((s) => (
                <div key={s.label}
                  onClick={() => s.href && router.push(s.href)}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: s.href ? "pointer" : "default" }}>
                  <span style={{ color: "#F5F5F5", fontSize: 18, fontWeight: 700, fontFamily: FONT }}>{s.value}</span>
                  <span style={{ color: "rgba(235,235,245,0.5)", fontSize: 11, fontFamily: FONT }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {!isOwnProfile && (
          <div style={{ display: "flex", gap: 10 }}>
            {/* Follow / Unfollow */}
            <button
              onClick={handleFollow}
              style={btnStyle(
                isFollowing ? "rgba(255,255,255,0.1)" : COLORS.accent,
                isFollowing ? COLORS.text : COLORS.onAccent
              )}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>

            {/* Add friend — compact icon button */}
            <button
              onClick={handleFriendRequest}
              disabled={friendStatus !== "none"}
              aria-label={
                friendStatus === "accepted" ? "Friends" : friendStatus === "pending" ? "Request sent" : "Add friend"
              }
              style={{
                width: 52,
                height: 44,
                flexShrink: 0,
                borderRadius: 14,
                border: "none",
                background: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: friendStatus !== "none" ? "default" : "pointer",
              }}
            >
              {friendStatus === "accepted" ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10.5L8 14.5L16 5.5" stroke={COLORS.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : friendStatus === "pending" ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7.5" stroke="rgba(235,235,245,0.5)" strokeWidth="1.5" />
                  <path d="M9 5v4l2.5 1.5" stroke="rgba(235,235,245,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
                  <path d="M8 9a4 4 0 100-8 4 4 0 000 8zM1.5 17c0-3 2.9-5 6.5-5s6.5 2 6.5 5" stroke="#F5F5F5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17.5 6v5M20 8.5h-5" stroke="#F5F5F5" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 0.5, background: "rgba(255,255,255,0.08)", marginTop: 4 }} />

        {/* Recipes grid — Instagram-style, full-bleed 3 columns */}
        {recipes.length === 0 ? (
          <div style={{ color: "rgba(235,235,245,0.35)", fontSize: 14, fontFamily: FONT, textAlign: "center", paddingTop: 20 }}>
            No recipes yet
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, margin: "0 -20px" }}>
            {recipes.map((r) => (
              <div
                key={r.id}
                onClick={() => router.push(`/recipe/${r.id}`)}
                style={{
                  aspectRatio: "1 / 1",
                  background: COLORS.surface,
                  overflow: "hidden",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {r.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.image_url} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                ) : (
                  <span style={{ color: "rgba(235,235,245,0.4)", fontSize: 12, fontFamily: FONT, padding: 6, textAlign: "center" }}>
                    {r.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
