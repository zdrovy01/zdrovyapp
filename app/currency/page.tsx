"use client";

import Space from "@/components/space";
import ToolbarWin from "@/components/toolbarwin";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { COLORS } from "@/config/theme";
import { useState } from "react";

const FONT = "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif";

const CURRENCIES = [
  { label: "US Dollar ($)", code: "USD" },
  { label: "Euro (€)", code: "EUR" },
  { label: "Hryvnia (₴)", code: "UAH" },
  { label: "Zloty (zł)", code: "PLN" },
];

export default function CurrencyPage() {
  useProtectedRoute();
  const [currency, setCurrency] = useState<string>(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("zdrovy-currency") || "USD"
      : "USD"
  );

  const select = (code: string) => {
    setCurrency(code);
    if (typeof window !== "undefined") localStorage.setItem("zdrovy-currency", code);
  };

  return (
    <>
      <Space size={40} />
      <ToolbarWin title="Currency" />
      <Space size={10} />

      <div style={{ display: "flex", flexDirection: "column" }}>
        {CURRENCIES.map((c) => {
          const active = c.code === currency;
          return (
            <button
              key={c.code}
              onClick={() => select(c.code)}
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
                {c.label}
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
