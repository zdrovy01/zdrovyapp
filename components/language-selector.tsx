"use client";

import { useLanguage } from "@/config/language-context";

const languages = [
  { code: "en-US", name: "English" },
  { code: "uk-UA", name: "Українська" },
  { code: "pl-PL", name: "Polski" },
  { code: "ru-RU", name: "Русский" },
];

export default function LanguageSelector() {
  const { lang, setLang } = useLanguage();

  return (
    <div style={{ width: "100%", paddingLeft: 20, paddingRight: 20, boxSizing: "border-box" }}>
      <div style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
      }}>
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              border: "1px solid",
              borderColor: lang === l.code ? "#0A84FF" : "rgba(255,255,255,0.2)",
              background: lang === l.code ? "rgba(10,132,255,0.15)" : "transparent",
              color: lang === l.code ? "#0A84FF" : "rgba(235,235,245,0.7)",
              fontSize: 14,
              fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
              fontWeight: lang === l.code ? 600 : 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {l.name}
          </button>
        ))}
      </div>
    </div>
  );
}
