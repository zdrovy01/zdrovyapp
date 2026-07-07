"use client";

import { useParams } from "next/navigation";
import Space from "@/components/space";
import ToolbarWin from "@/components/toolbarwin";
import UserRow from "@/components/userrow";
import { getSupabaseClient } from "@/config/supabase";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { useCached } from "@/hooks/use-cached";

interface UserProfile {
  username: string;
  name: string;
  avatar_url: string | null;
}

const FONT = "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif";

export default function FollowingPage() {
  useProtectedRoute();
  const { username } = useParams<{ username: string }>();

  const { data: users, loading } = useCached<UserProfile[]>(
    `following:${username || "none"}`,
    async () => {
      if (!username) return [];
      const supabase = getSupabaseClient();
      const { data: profile } = await supabase
        .from("user_profiles").select("user_id").eq("username", username).single();
      if (!profile) return [];

      const { data } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", profile.user_id);
      if (!data?.length) return [];

      const ids = data.map((r) => r.following_id);
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("username, name, avatar_url")
        .in("user_id", ids);
      return profiles || [];
    },
    []
  );

  return (
    <>
      <Space size={8} />
      <ToolbarWin title="Following" />
      <Space size={10} />
      {loading ? (
        <div style={{ padding: "0 20px", color: "rgba(235,235,245,0.5)", fontFamily: FONT }}>Loading...</div>
      ) : users.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "rgba(235,235,245,0.35)", fontFamily: FONT }}>Not following anyone yet</div>
      ) : (
        users.map((u) => <UserRow key={u.username} {...u} />)
      )}
    </>
  );
}
