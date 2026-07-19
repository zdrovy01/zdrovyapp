"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COLORS } from "@/config/theme";

interface SearchbarProps {
  placeholder?: string;
  onChange?: (value: string) => void;
}

export default function Searchbar({ placeholder = "Search", onChange }: SearchbarProps) {
  const router = useRouter();
  const [value, setValue] = useState("");

  const handleClose = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div style={{
      width: "100%",
      paddingTop: 4,
      paddingBottom: 24,
      paddingLeft: 20,
      paddingRight: 20,
      display: "flex",
      alignItems: "center",
      gap: 10,
      boxSizing: "border-box",
    }}>
      {/* Search field */}
      <div style={{
        flex: "1 1 0",
        height: 52,
        paddingLeft: 16,
        paddingRight: 14,
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: COLORS.surface,
        boxSizing: "border-box",
      }}>
        {/* Search icon */}
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" style={{ flexShrink: 0 }}>
          <path d="M6.5 0C10.09 0 13 2.91 13 6.5C13 8.02 12.48 9.42 11.61 10.53L16.54 15.46C16.83 15.75 16.83 16.22 16.54 16.51C16.25 16.8 15.78 16.8 15.49 16.51L10.53 11.58C9.42 12.47 8.02 13 6.5 13C2.91 13 0 10.09 0 6.5C0 2.91 2.91 0 6.5 0ZM6.5 1.5C3.74 1.5 1.5 3.74 1.5 6.5C1.5 9.26 3.74 11.5 6.5 11.5C9.26 11.5 11.5 9.26 11.5 6.5C11.5 3.74 9.26 1.5 6.5 1.5Z"
            fill="rgba(235,235,245,0.4)" />
        </svg>

        {/* Input */}
        <input
          value={value}
          onChange={(e) => { setValue(e.target.value); onChange?.(e.target.value); }}
          placeholder={placeholder}
          style={{
            flex: "1 1 0",
            minWidth: 0,
            background: "transparent",
            border: "none",
            outline: "none",
            color: COLORS.text,
            fontSize: 16,
            fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
          }}
        />
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        aria-label="Close"
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          background: COLORS.surface,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 1L13 13M13 1L1 13"
            stroke={COLORS.text} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
