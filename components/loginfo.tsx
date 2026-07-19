"use client";

import { useRef } from "react";
import { COLORS } from "@/config/theme";

const FONT = "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif";

interface ButtonConfig {
  text: string;
  onClick: () => void;
}

interface LogInfoProps {
  name?: string;
  kcal?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  image?: string;
  onNameChange?: (name: string) => void;
  onImageAdd?: (dataUrl: string) => void;
  buttons?: [ButtonConfig] | [ButtonConfig, ButtonConfig];
}

export default function LogInfo({
  name = "Meal",
  kcal = 0,
  protein = 0,
  carbs = 0,
  fat = 0,
  image,
  onNameChange,
  onImageAdd,
  buttons,
}: LogInfoProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageAdd) return;
    const reader = new FileReader();
    reader.onload = () => onImageAdd(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{
      width: "100%",
      background: "#0A0A0A",
      borderRadius: 16,
      padding: 20,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      gap: 16,
    }}>
      {/* Photo */}
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="Food" style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 16 }} />
      ) : onImageAdd ? (
        <>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
          <button onClick={() => fileRef.current?.click()} style={{
            alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.07)", border: "none", borderRadius: 16,
            padding: "6px 12px", cursor: "pointer", color: "rgba(235,235,245,0.5)",
            fontSize: 13, fontFamily: FONT, fontWeight: 500,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            Add photo
          </button>
        </>
      ) : null}

      {/* Editable title */}
      {onNameChange ? (
        <input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#F5F5F5",
            fontSize: 22,
            fontWeight: 700,
            fontFamily: FONT,
            width: "100%",
            padding: 0,
          }}
        />
      ) : (
        <div style={{ color: "#F5F5F5", fontSize: 22, fontWeight: 700, fontFamily: FONT }}>{name}</div>
      )}

      {/* Calories */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ color: "#F5F5F5", fontSize: 36, fontWeight: 700, fontFamily: FONT }}>{kcal}</span>
        <span style={{ color: "rgba(235,235,245,0.45)", fontSize: 15, fontFamily: FONT }}>kcal</span>
      </div>

      {/* Macros row */}
      <div style={{ display: "flex", gap: 0 }}>
        {[
          { label: "Protein", value: protein, color: "#FF6B6B" },
          { label: "Carbs", value: carbs, color: "#FFD93D" },
          { label: "Fat", value: fat, color: "#6BCB77" },
        ].map((m, i) => (
          <div key={m.label} style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            paddingLeft: i === 0 ? 0 : 16,
            borderLeft: i === 0 ? "none" : "1px solid rgba(255,255,255,0.07)",
          }}>
            <span style={{ color: m.color, fontSize: 18, fontWeight: 700, fontFamily: FONT }}>{m.value}g</span>
            <span style={{ color: "rgba(235,235,245,0.4)", fontSize: 12, fontFamily: FONT }}>{m.label}</span>
          </div>
        ))}
      </div>

      {/* Buttons */}
      {buttons && (
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          {buttons.map((btn, idx) => (
            <button key={idx} onClick={btn.onClick} style={{
              flex: 1,
              height: 52,
              background: idx === 0 ? COLORS.accent : "rgba(255,255,255,0.08)",
              border: "none",
              borderRadius: 16,
              color: idx === 0 ? COLORS.onAccent : "#fff",
              fontSize: 16,
              fontWeight: 600,
              fontFamily: FONT,
              cursor: "pointer",
            }}>
              {btn.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
