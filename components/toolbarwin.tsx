"use client";

import Link from "next/link";

interface ToolbarWinProps {
  title?: string;
  backHref?: string;
}

export default function ToolbarWin({ title = "Title", backHref = "/" }: ToolbarWinProps) {
  return (
    <div
      style={{
        width: "100%",
        paddingBottom: 10,
        paddingLeft: 16,
        paddingRight: 16,
        position: "relative",
        justifyContent: "space-between",
        alignItems: "flex-start",
        display: "flex",
        boxSizing: "border-box",
      }}
    >
      {/* Back button */}
      <Link
        href={backHref}
        style={{
          height: 44,
          minWidth: 44,
          borderRadius: 296,
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          textDecoration: "none",
          flexShrink: 0,
          background: "linear-gradient(0deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.06) 100%), rgba(0,0,0,0.60)",
          boxShadow: "0px 8px 40px rgba(0,0,0,0.12)",
        }}
      >
        <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
          <path d="M8.5 15.5L1.5 8.5L8.5 1.5" stroke="#F5F5F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      {/* Title — centered absolutely */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          color: "#F5F5F5",
          fontSize: 17,
          fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
          fontWeight: 590,
          lineHeight: "22px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}
      >
        {title}
      </div>

      {/* Trailing placeholder (balance) */}
      <div style={{ width: 44, height: 44, flexShrink: 0 }} />
    </div>
  );
}
