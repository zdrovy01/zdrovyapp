"use client";

import { useAuth } from "@/config/auth-context";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { getSupabaseClient } from "@/config/supabase";
import { COLORS } from "@/config/theme";
import { compressImage } from "@/services/image-compress";
import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import Option2 from "@/components/option2";
import { useRef, useState, useEffect } from "react";

export default function AccountSettingsPage() {
  useProtectedRoute();
  const { user, loading, refreshUser } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (user?.username) setUsernameInput(user.username);
  }, [user?.username]);

  useEffect(() => {
    if (user?.name) setNameInput(user.name);
  }, [user?.name]);

  const handleSaveName = async () => {
    if (!user) return;
    const clean = nameInput.trim();
    if (!clean || clean === user.name) return;

    setSavingName(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from("user_profiles")
        .upsert({ user_id: user.id, name: clean }, { onConflict: "user_id" });
      if (error) {
        console.error("Failed to update name:", error);
        alert("Failed to update name");
      } else {
        await refreshUser();
      }
    } finally {
      setSavingName(false);
    }
  };

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
      const { error } = await supabase
        .from("user_profiles")
        .upsert({ user_id: user.id, username: clean }, { onConflict: "user_id" });
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

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      // Avatars can be smaller; cap around 0.8MB at 512px
      const dataUrl = await compressImage(file, {
        maxDimension: 512,
        maxBytes: 0.8 * 1024 * 1024,
      });
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from("user_profiles")
        .upsert(
          { user_id: user.id, avatar_url: dataUrl },
          { onConflict: "user_id" }
        );
      if (error) {
        console.error("Failed to update avatar:", error);
        alert("Failed to update avatar");
      } else {
        await refreshUser();
      }
    } catch (err) {
      console.error("Failed to process avatar:", err);
      alert("Failed to process image");
    } finally {
      setUploading(false);
    }
  };

  const initial = (user?.name || user?.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  if (loading) {
    return <div style={{ color: "white", padding: 20 }}>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Space size={8} />
      <ToolbarWin title="Account settings" />
      <Space size={10} />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarSelect}
        style={{ display: "none" }}
      />

      {/* Avatar + email + ID */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "0 20px",
          marginBottom: 24,
        }}
      >
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{
            position: "relative",
            width: 72,
            height: 72,
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
            <span style={{ fontSize: 28, fontWeight: 700, color: "#F5F5F5" }}>
              {initial}
            </span>
          )}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 22,
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

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 16,
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
              color: COLORS.accent,
              wordBreak: "break-all",
              marginTop: 2,
            }}
          >
            ID: {user.id}
          </div>
        </div>
      </div>

      {/* Name editor */}
      <div style={{ padding: "0 20px", marginBottom: 24 }}>
        <div
          style={{
            color: "rgba(235,235,245,0.5)",
            fontSize: 12,
            marginBottom: 6,
          }}
        >
          Name
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              background: "rgba(118,118,128,0.24)",
              borderRadius: 4,
              padding: "0 12px",
              height: 44,
            }}
          >
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName();
              }}
              placeholder="Your name"
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
            onClick={handleSaveName}
            disabled={
              savingName || !nameInput.trim() || nameInput.trim() === user.name
            }
            style={{
              height: 44,
              padding: "0 16px",
              borderRadius: 4,
              border: "none",
              background: COLORS.accent,
              color: COLORS.onAccent,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              opacity:
                savingName || !nameInput.trim() || nameInput.trim() === user.name
                  ? 0.5
                  : 1,
            }}
          >
            {savingName ? "..." : "Save"}
          </button>
        </div>
      </div>

      {/* Username editor */}
      <div style={{ padding: "0 20px", marginBottom: 24 }}>
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
              borderRadius: 4,
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
              borderRadius: 4,
              border: "none",
              background: COLORS.accent,
              color: COLORS.onAccent,
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

      {/* More options (sign out, delete account) */}
      <Option2 text="More options" href="/moreoptions" />

      <Space size={40} />
    </>
  );
}
