"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import { getGoals, setGoals, Goals } from "@/config/goals";
import { useProtectedRoute } from "@/hooks/use-protected-route";

const FONT = "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif";

const labelStyle: React.CSSProperties = {
  color: "rgba(235,235,245,0.5)",
  fontSize: 12,
  marginBottom: 6,
  display: "block",
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(118,118,128,0.24)",
  border: "none",
  outline: "none",
  borderRadius: 10,
  color: "#F5F5F5",
  fontSize: 15,
  padding: "11px 13px",
  boxSizing: "border-box",
  fontFamily: FONT,
};

export default function GoalPage() {
  useProtectedRoute();
  const router = useRouter();

  const [g, setG] = useState<Goals>(getGoals);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof Goals, v: string) =>
    setG((prev) => ({ ...prev, [key]: v === "" ? 0 : Math.max(0, Math.round(Number(v) || 0)) }));

  const handleSave = () => {
    setGoals(g);
    setSaved(true);
    setTimeout(() => router.push("/options"), 350);
  };

  return (
    <>
      <Space size={8} />
      <ToolbarWin title="Goal" />
      <Space size={10} />

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>Calories</label>
          <input value={g.kcal || ""} onChange={(e) => update("kcal", e.target.value)} inputMode="numeric" placeholder="2000" style={fieldStyle} />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Protein (g)</label>
            <input value={g.protein || ""} onChange={(e) => update("protein", e.target.value)} inputMode="numeric" placeholder="150" style={fieldStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Carbs (g)</label>
            <input value={g.carbs || ""} onChange={(e) => update("carbs", e.target.value)} inputMode="numeric" placeholder="250" style={fieldStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Fat (g)</label>
            <input value={g.fat || ""} onChange={(e) => update("fat", e.target.value)} inputMode="numeric" placeholder="70" style={fieldStyle} />
          </div>
        </div>

        <button
          onClick={handleSave}
          style={{
            width: "100%", height: 48, borderRadius: 12, border: "none",
            background: "#F5F5F5", color: "#000",
            fontSize: 16, fontWeight: 600, fontFamily: FONT, cursor: "pointer",
          }}
        >
          {saved ? "Saved ✓" : "Save goal"}
        </button>
      </div>

      <Space size={24} />
    </>
  );
}
