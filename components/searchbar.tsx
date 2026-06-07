"use client";

import Link from "next/link";

interface SearchbarProps {
  placeholder?: string;
}

export default function Searchbar({ placeholder = "Search" }: SearchbarProps) {
  return (
    <div style={{
      width: "100%",
      paddingTop: 4,
      paddingBottom: 32,
      paddingLeft: 28,
      paddingRight: 28,
      display: "flex",
      alignItems: "center",
      gap: 12,
      boxSizing: "border-box",
    }}>

      {/* Search field */}
      <div style={{
        flex: "1 1 0",
        height: 48,
        paddingLeft: 11,
        paddingRight: 10,
        borderRadius: 296,
        display: "flex",
        alignItems: "center",
        gap: 8,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        background: "rgba(30, 30, 30, 0.72)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.28), inset 0 0.5px 0 rgba(255,255,255,0.12)",
      }}>

        {/* Search icon */}
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" style={{ flexShrink: 0 }}>
          <path d="M6.5 0C10.09 0 13 2.91 13 6.5C13 8.02 12.48 9.42 11.61 10.53L16.54 15.46C16.83 15.75 16.83 16.22 16.54 16.51C16.25 16.8 15.78 16.8 15.49 16.51L10.53 11.58C9.42 12.47 8.02 13 6.5 13C2.91 13 0 10.09 0 6.5C0 2.91 2.91 0 6.5 0ZM6.5 1.5C3.74 1.5 1.5 3.74 1.5 6.5C1.5 9.26 3.74 11.5 6.5 11.5C9.26 11.5 11.5 9.26 11.5 6.5C11.5 3.74 9.26 1.5 6.5 1.5Z"
            fill="#8A8A8A" />
        </svg>

        {/* Placeholder */}
        <div style={{
          flex: "1 1 0",
          color: "#404040",
          fontSize: 17,
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontWeight: 510,
        }}>
          {placeholder}
        </div>

        {/* Mic icon */}
        <svg width="14" height="19" viewBox="0 0 14 19" fill="none" style={{ flexShrink: 0 }}>
          <path d="M7 0C5.34 0 4 1.34 4 3V9C4 10.66 5.34 12 7 12C8.66 12 10 10.66 10 9V3C10 1.34 8.66 0 7 0ZM0 9C0 12.53 2.61 15.43 6 15.92V18H8V15.92C11.39 15.43 14 12.53 14 9H12C12 11.76 9.76 14 7 14C4.24 14 2 11.76 2 9H0Z"
            fill="#8A8A8A" />
        </svg>
      </div>

      {/* Close button */}
      <Link
        href="/"
        style={{
          width: 48,
          height: 48,
          borderRadius: 100,
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          background: "rgba(30, 30, 30, 0.72)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.28), inset 0 0.5px 0 rgba(255,255,255,0.12)",
          textDecoration: "none",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 1L13 13M13 1L1 13"
            stroke="#F5F5F5" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </Link>

    </div>
  );
}
