"use client";

import { useState } from "react";
import { useAuth } from "@/config/auth-context";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { getSupabaseClient } from "@/config/supabase";
import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import Option2 from "@/components/option2";
import { COLORS } from "@/config/theme";

export default function MoreOptionsPage() {
  useProtectedRoute();
  const { user, loading, logout } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmed = window.confirm(
      "Delete your account permanently? This removes all your data and cannot be undone."
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.rpc("delete_user");
      if (error) {
        console.error("Failed to delete account:", error);
        alert("Failed to delete account. Please try again.");
        setDeleting(false);
        return;
      }
      await logout();
      window.location.href = "/auth";
    } catch (err) {
      console.error("Delete account threw:", err);
      alert("Failed to delete account. Please try again.");
      setDeleting(false);
    }
  };

  if (loading) {
    return <div style={{ color: "white", padding: 20 }}>Loading...</div>;
  }
  if (!user) return null;

  return (
    <>
      <Space size={8} />
      <ToolbarWin title="More options" />
      <Space size={10} />

      <Option2 text="Sign Out" onClick={logout} style={{ color: COLORS.danger }} />
      <Option2
        text={deleting ? "Deleting..." : "Delete account"}
        onClick={deleting ? () => {} : handleDeleteAccount}
        style={{ color: COLORS.danger }}
      />
    </>
  );
}
