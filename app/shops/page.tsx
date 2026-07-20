"use client";

import Space from "@/components/space";
import ToolbarWin from "@/components/toolbarwin";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { useState } from "react";
import { COLORS } from "@/config/theme";

const FONT = "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif";

const SHOPS = ["Biedronka", "Lidl"];

export default function ShopsPage() {
  useProtectedRoute();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (shop: string) => {
    setSelected((prev) =>
      prev.includes(shop) ? prev.filter((s) => s !== shop) : [...prev, shop]
    );
  };

  return (
    <>
      <Space size={8} />
      <ToolbarWin title="Shops" />
      <Space size={10} />

      <div style={{ display: "flex", flexDirection: "column" }}>
        {SHOPS.map((shop) => {
          const active = selected.includes(shop);
          return (
            <div
              key={shop}
              onClick={() => toggle(shop)}
              style={{
                height: 56,
                background: COLORS.surface,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
                cursor: "pointer",
                boxSizing: "border-box",
              }}
            >
              <span style={{ color: COLORS.text, fontSize: 16, fontWeight: 600, fontFamily: FONT }}>
                {shop}
              </span>
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                border: active ? "none" : "2px solid rgba(235,235,245,0.3)",
                background: active ? COLORS.text : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {active && (
                  <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                    <path d="M1 4L4.5 7.5L11 1" stroke="var(--c-text,#F5F5F5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
