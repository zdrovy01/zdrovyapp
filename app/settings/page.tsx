"use client";

import { useAuth } from "@/config/auth-context";
import { useLanguage } from "@/config/language-context";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import Option2 from "@/components/option2";
import { COLORS } from "@/config/theme";
import { useState } from "react";

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
        stroke={COLORS.accent}
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
  const { user, loading, loginWithGoogle } = useAuth();
  const { lang, setLang } = useLanguage();

  const [openRow, setOpenRow] = useState<string | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [theme, setTheme] = useState("dark");

  const toggleRow = (id: string) =>
    setOpenRow((cur) => (cur === id ? null : id));

  const langLabel = LANGUAGES.find((l) => l.code === lang)?.label || "English";
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
