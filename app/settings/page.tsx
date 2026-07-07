"use client";

import { useAuth } from "@/config/auth-context";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import Option2 from "@/components/option2";

function SectionHeader({ text }: { text: string }) {
  return (
    <div style={{ padding: "0 20px" }}>
      <div
        style={{
          color: "rgba(235,235,245,0.6)",
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 12,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {text}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  useProtectedRoute();
  const { user, loading, loginWithGoogle } = useAuth();

  if (loading) {
    return <div style={{ color: "white", padding: 20 }}>Loading...</div>;
  }

  return (
    <>
      <Space size={8} />
      <ToolbarWin title="Settings" />
      <Space size={10} />

      {/* Preferences */}
      <SectionHeader text="Preferences" />
      <Option2 text="Speech Language" href="/language" />
      <Option2 text="Currency" href="/currency" />
      <Option2 text="Theme" href="/theme" />
      <Option2 text="Shops" href="/shops" />

      <Space size={28} />

      {/* Account */}
      <SectionHeader text="Account" />
      {user ? (
        <Option2 text="Account settings" href="/accountsettings" />
      ) : (
        <Option2 text="Sign in with Google" onClick={loginWithGoogle} />
      )}

      <Space size={40} />
    </>
  );
}
