"use client";

import { useAuth } from "@/config/auth-context";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { getSupabaseClient } from "@/config/supabase";
import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import Option2 from "@/components/option2";
import { useRef, useState, useEffect } from "react";

export default function PreferencesPage() {
  useProtectedRoute();
  const { user, loading, loginWithGoogle, logout, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);

  useEffect(() => {
    if (user?.username) setUsernameInput(user.username);
  }, [user?.username]);

  const handleSaveUsername = async () => {
    if (!user) return;
    const clean = usernameInput
      .trim()
      .replace(/^@+/, "")
      .replace(/\s+/g, "")
      .toLowerCase();
    if (!clean || clean === user.username) return;

    setSavingUsername(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from("user_profiles").upsert(
        { user_id: user.id, username: clean },
        { onConflict: "user_id" }
      );
      if (error) {
        console.error("Failed to update username:", error);
        alert("Failed to update username");
      } else {
        await refreshUser();
      }
    } finally {
      setSavingUsername(false);
    }
  };

  const handleAvatarSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Basic size guard (~1.5MB) to keep the data URL reasonable
    if (file.size > 1.5 * 1024 * 1024) {
      alert("Image is too large. Please pick one under 1.5MB.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const supabase = getSupabaseClient();
        const { error } = await supabase.from("user_profiles").upsert(
          { user_id: user.id, avatar_url: dataUrl },
          { onConflict: "user_id" }
        );
        if (error) {
          console.error("Failed to update avatar:", error);
          alert("Failed to update avatar");
        } else {
          await refreshUser();
        }
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const initial = (user?.name || user?.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

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
          {/* Avatar + email + ID */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarSelect}
            style={{ display: "none" }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "0 20px",
              marginBottom: 16,
            }}
          >
            {/* Avatar (click to change) */}
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              style={{
                position: "relative",
                width: 64,
                height: 64,
                borderRadius: "50%",
                flexShrink: 0,
                overflow: "hidden",
                background: "rgba(120,120,128,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: uploading ? "default" : "pointer",
                opacity: uploading ? 0.6 : 1,
              }}
            >
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar_url}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span
                  style={{ fontSize: 26, fontWeight: 700, color: "#F5F5F5" }}
                >
                  {initial}
                </span>
              )}
              {/* Edit badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 20,
                  background: "rgba(0,0,0,0.55)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {uploading ? "..." : "Edit"}
              </div>
            </div>

            {/* Email + ID */}
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#F5F5F5",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user.email}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "rgba(10,132,255,0.75)",
                  wordBreak: "break-all",
                  marginTop: 2,
                }}
              >
                ID: {user.id}
              </div>
            </div>
          </div>

          {/* Username editor */}
          <div style={{ padding: "0 20px", marginBottom: 16 }}>
            <div
              style={{
                color: "rgba(235,235,245,0.5)",
                fontSize: 12,
                marginBottom: 6,
              }}
            >
              Username
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "rgba(118,118,128,0.24)",
                  borderRadius: 10,
                  padding: "0 12px",
                  height: 44,
                }}
              >
                <span style={{ color: "rgba(235,235,245,0.5)", fontSize: 16 }}>
                  @
                </span>
                <input
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveUsername();
                  }}
                  placeholder="username"
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#F5F5F5",
                    fontSize: 16,
                  }}
                />
              </div>
              <button
                onClick={handleSaveUsername}
                disabled={
                  savingUsername ||
                  !usernameInput.trim() ||
                  usernameInput.trim().replace(/^@+/, "").toLowerCase() ===
                    user.username
                }
                style={{
                  height: 44,
                  padding: "0 16px",
                  borderRadius: 10,
                  border: "none",
                  background: "#0A84FF",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  opacity:
                    savingUsername ||
                    !usernameInput.trim() ||
                    usernameInput.trim().replace(/^@+/, "").toLowerCase() ===
                      user.username
                      ? 0.5
                      : 1,
                }}
              >
                {savingUsername ? "..." : "Save"}
              </button>
            </div>
          </div>

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
