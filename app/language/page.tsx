"use client";

import Space from "@/components/space";
import ToolbarWin from "@/components/toolbarwin";
import { useLanguage } from "@/config/language-context";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { COLORS } from "@/config/theme";

const FONT = "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif";

const LANGUAGES = [
  { label: "English", code: "en-US" },
  { label: "Українська", code: "uk-UA" },
  { label: "Polski", code: "pl-PL" },
  { label: "Русский", code: "ru-RU" },
];

export default function LanguagePage() {
  useProtectedRoute();
  const { lang, setLang } = useLanguage();

  return (
    <>
      <Space size={40} />
      <ToolbarWin title="Speech Language" />
      <Space size={16} />

      <div style={{ display: "flex", flexDirection: "column" }}>
        {LANGUAGES.map((l) => {
          const active = l.code === lang;
          return (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
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
                fontFamily: FONT,
              }}
            >
              <span style={{ color: "#fff", fontSize: 16, fontWeight: active ? 600 : 400 }}>
                {l.label}
              </span>
              {active && (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3.5 9.5L7 13L14.5 5" stroke={COLORS.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
