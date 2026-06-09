"use client";

import { useAuth } from "@/config/auth-context";
import { useLanguage } from "@/config/language-context";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { getSupabaseClient } from "@/config/supabase";
import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import Option2 from "@/components/option2";
import { useRef, useState, useEffect } from "react";

const LANGUAGES = [
  { label: "English", code: "en-US" },
  { label: "Українська", code: "uk-UA" },
  { label: "Polski", code: "pl-PL" },
  { label: "Русский", code: "ru-RU" },
];

const CURRENCIES = [
  { label: "US Dollar ($)", code: "USD" },
  { label: "Euro (€)", code: "EUR" },
  { label: "Hryvnia (₴)", code: "UAH" },
  { label: "Zloty (zł)", code: "PLN" },
];

const THEMES = [
  { label: "Dark", code: "dark" },
  { label: "Light", code: "light" },
];

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

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M3.5 9.5L7 13L14.5 5"
        stroke="#0A84FF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface SelectRowProps {
  label: string;
  value: string;
  open: boolean;
  onToggle: () => void;
  options: { label: string; code: string }[];
  selectedCode: string;
  onSelect: (code: string) => void;
}

function SelectRow({
  label,
  value,
  open,
  onToggle,
  options,
  selectedCode,
  onSelect,
}: SelectRowProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          height: 56,
          padding: "0 20px",
          background: "#0A0A0A",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "none",
          cursor: "pointer",
          boxSizing: "border-box",
        }}
      >
        <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
          {label}
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "rgba(235,235,245,0.5)",
            fontSize: 15,
          }}
        >
          {value}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          >
            <path
              d="M2 4L6 8L10 4"
              stroke="rgba(235,235,245,0.5)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open && (
        <div style={{ background: "#060606" }}>
          {options.map((opt) => {
            const active = opt.code === selectedCode;
            return (
              <button
                key={opt.code}
                onClick={() => onSelect(opt.code)}
                style={{
                  width: "100%",
                  height: 48,
                  padding: "0 20px 0 32px",
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "none",
                  cursor: "pointer",
                  boxSizing: "border-box",
                }}
              >
                <span
                  style={{
                    color: active ? "#fff" : "rgba(235,235,245,0.75)",
                    fontSize: 15,
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {opt.label}
                </span>
                {active && <Check />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  useProtectedRoute();
  const { user, loading, loginWithGoogle, logout, refreshUser } = useAuth();
  const { lang, setLang } = useLanguage();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);

  const [openRow, setOpenRow] = useState<string | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    if (user?.username) setUsernameInput(user.username);
  }, [user?.username]);

  const toggleRow = (id: string) =>
    setOpenRow((cur) => (cur === id ? null : id));

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

  const langLabel =
    LANGUAGES.find((l) => l.code === lang)?.label || "English";
  const currencyLabel =
    CURRENCIES.find((c) => c.code === currency)?.label.split(" ")[0] || "USD";
  const themeLabel = THEMES.find((t) => t.code === theme)?.label || "Dark";

  if (loading) {
    return <div style={{ color: "white", padding: 20 }}>Loading...</div>;
  }

  return (
    <>
      <Space size={40} />
      <ToolbarWin title="Settings" />
      <Space size={20} />

      {/* Preferences */}
      <SectionHeader text="Preferences" />
      <SelectRow
        label="Speech Language"
        value={langLabel}
        open={openRow === "lang"}
        onToggle={() => toggleRow("lang")}
        options={LANGUAGES}
        selectedCode={lang}
        onSelect={(code) => setLang(code)}
      />
      <SelectRow
        label="Currency"
        value={currencyLabel}
        open={openRow === "currency"}
        onToggle={() => toggleRow("currency")}
        options={CURRENCIES}
        selectedCode={currency}
        onSelect={(code) => setCurrency(code)}
      />
      <SelectRow
        label="Theme"
        value={themeLabel}
        open={openRow === "theme"}
        onToggle={() => toggleRow("theme")}
        options={THEMES}
        selectedCode={theme}
        onSelect={(code) => setTheme(code)}
      />

      <Space size={28} />

      {/* Account */}
      <SectionHeader text="Account" />

      {user ? (
        <>
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
              marginBottom: 16,
            }}
          >
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
            style={{ color: "#FF453A" }}
          />
        </>
      ) : (
        <Option2 text="Sign in with Google" onClick={loginWithGoogle} />
      )}

      <Space size={40} />
    </>
  );
}
