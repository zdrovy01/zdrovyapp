"use client";

import { useAuth } from "@/config/auth-context";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import Option2 from "@/components/option2";

export default function PreferencesPage() {
  useProtectedRoute();
  const { user, loading, loginWithGoogle, logout } = useAuth();

  if (loading) {
    return <div style={{ color: "white", padding: 20 }}>Loading...</div>;
  }

  return (
    <>
      <Space size={40} />
      <ToolbarWin title="Settings" />
      <Space size={20} />

      {/* Language Section */}
      <div style={{ paddingLeft: 20, paddingRight: 20 }}>
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
          Language
        </div>
      </div>

      {["English", "Українська", "Polski", "Русский"].map((lang, idx) => (
        <Option2
          key={lang}
          text={lang}
          onClick={() => console.log(`Selected: ${lang}`)}
          style={{ marginBottom: idx < 3 ? 0 : 16 }}
        />
      ))}

      <Space size={20} />

      {/* Account Section */}
      <div style={{ paddingLeft: 20, paddingRight: 20 }}>
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
          Account
        </div>
      </div>

      {user ? (
        <>
          <Option2
            text={user.email}
            onClick={() => { }}
            style={{ cursor: "default" }}
          />
          <Option2
            text="Sign Out"
            onClick={logout}
            style={{
              color: "#FF453A",
            }}
          />
        </>
      ) : (
        <Option2 text="Sign in with Google" onClick={loginWithGoogle} />
      )}
    </>
  );
}
