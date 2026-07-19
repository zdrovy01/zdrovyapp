"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ToolbarWinProps {
  title?: string;
  /** Optional explicit destination. If omitted, goes back to the previous page. */
  backHref?: string;
  /** Optional trailing action buttons (max 2). */
  icon1?: React.ReactNode;
  icon2?: React.ReactNode;
  onIcon1Click?: () => void;
  onIcon2Click?: () => void;
  href1?: string;
  href2?: string;
}

const actionStyle: React.CSSProperties = {
  height: 44,
  minWidth: 44,
  borderRadius: 296,
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  color: "#F5F5F5",
  textDecoration: "none",
  background:
    "linear-gradient(0deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.06) 100%), rgba(0,0,0,0.60)",
  boxShadow: "0px 8px 40px rgba(0,0,0,0.12)",
};

export default function ToolbarWin({
  title = "Title",
  backHref,
  icon1,
  icon2,
  onIcon1Click,
  onIcon2Click,
  href1,
  href2,
}: ToolbarWinProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div
      style={{
        width: "100%",
        paddingTop: 8,
        paddingBottom: 12,
        paddingLeft: 16,
        paddingRight: 16,
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "#000000",
        justifyContent: "space-between",
        alignItems: "center",
        display: "flex",
        boxSizing: "border-box",
        // iOS-style hairline separator under the toolbar
        borderBottom: "0.5px solid rgba(255,255,255,0.12)",
      }}
    >
      {/* Back button — plain chevron */}
      <button
        onClick={handleBack}
        aria-label="Back"
        style={{
          height: 44,
          minWidth: 44,
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          border: "none",
          cursor: "pointer",
          flexShrink: 0,
          background: "transparent",
          padding: 0,
        }}
      >
        <svg width="11" height="19" viewBox="0 0 10 17" fill="none">
          <path d="M8.5 15.5L1.5 8.5L8.5 1.5" stroke="#F5F5F5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

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

      {/* Trailing actions (max 2) or balance placeholder */}
      {icon1 || icon2 ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {icon1 &&
            (href1 ? (
              <Link href={href1} style={actionStyle} aria-label="Action 1">{icon1}</Link>
            ) : (
              <button onClick={onIcon1Click} style={actionStyle} aria-label="Action 1">{icon1}</button>
            ))}
          {icon2 &&
            (href2 ? (
              <Link href={href2} style={actionStyle} aria-label="Action 2">{icon2}</Link>
            ) : (
              <button onClick={onIcon2Click} style={actionStyle} aria-label="Action 2">{icon2}</button>
            ))}
        </div>
      ) : (
        <div style={{ width: 44, height: 44, flexShrink: 0 }} />
      )}
    </div>
  );
}
