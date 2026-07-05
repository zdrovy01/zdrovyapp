"use client";

import React from "react";
import Link from "next/link";

interface ToolbarProps {
  title?: string;
  icon1?: React.ReactNode;
  icon2?: React.ReactNode;
  icon3?: React.ReactNode;
  onIcon1Click?: () => void;
  onIcon2Click?: () => void;
  onIcon3Click?: () => void;
  href1?: string;
  href2?: string;
  href3?: string;
  showIcon1?: boolean;
  showIcon2?: boolean;
  showIcon3?: boolean;
}

const iconStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 100,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  zIndex: 1,
  color: "#F5F5F5",
  fontSize: 17,
  textDecoration: "none",
  fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
  fontWeight: 510,
};

export default function Toolbar({
  title = "Text",
  icon1 = "􀒲",
  icon2 = "􀍟",
  icon3,
  onIcon1Click,
  onIcon2Click,
  onIcon3Click,
  href1,
  href2,
  href3,
  showIcon1 = true,
  showIcon2 = true,
  showIcon3 = true,
}: ToolbarProps) {
  const has3 = showIcon3 && !!icon3;
  const hasButtons = showIcon1 || showIcon2 || has3;
  return (
    <div
      data-layer="Toolbar"
      style={{
        width: "100%",
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        justifyContent: "space-between",
        alignItems: "center",
        gap: 5,
        display: "flex",
        boxSizing: "border-box",
      }}
    >
      {/* Title */}
      <div style={{ flex: "1 1 0", height: 41, position: "relative" }}>
        <div
          style={{
            left: 0,
            top: 0,
            position: "absolute",
            color: "#F5F5F5",
            fontSize: 34,
            fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
            fontWeight: 700,
            lineHeight: "41px",
            letterSpacing: 0.4,
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </div>
      </div>

      {/* Button group */}
      {hasButtons && (
        <div style={{ justifyContent: "flex-end", alignItems: "center", gap: 10, display: "flex" }}>
          <div
            style={{
              height: 44,
              paddingLeft: 6,
              paddingRight: 6,
              position: "relative",
              borderRadius: 296,
              justifyContent: "flex-start",
              alignItems: "center",
              gap: 20,
              display: "flex",
            }}
          >
            {/* Liquid glass background */}
            <div
              style={{
                width: "100%",
                height: 44,
                left: 0,
                top: 0,
                position: "absolute",
                opacity: 0.67,
                background:
                  "linear-gradient(0deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.06) 100%), rgba(0,0,0,0.60)",
                boxShadow: "0px 8px 40px rgba(0,0,0,0.12)",
                borderRadius: 1000,
              }}
            />

            {/* Icon button 1 */}
            {showIcon1 && (href1
              ? <Link href={href1} style={iconStyle}>{icon1}</Link>
              : <button onClick={onIcon1Click} style={iconStyle}>{icon1}</button>
            )}

            {/* Icon button 2 */}
            {showIcon2 && (href2
              ? <Link href={href2} style={iconStyle}>{icon2}</Link>
              : <button onClick={onIcon2Click} style={iconStyle}>{icon2}</button>
            )}

            {/* Icon button 3 */}
            {has3 && (href3
              ? <Link href={href3} style={iconStyle}>{icon3}</Link>
              : <button onClick={onIcon3Click} style={iconStyle}>{icon3}</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
