"use client";

import Link from "next/link";
import React from "react";

interface OptionProps {
  buttons?: 1 | 2 | 3;
  text1?: React.ReactNode;
  text2?: React.ReactNode;
  text3?: React.ReactNode;
  icon1?: React.ReactNode;
  icon2?: React.ReactNode;
  icon3?: React.ReactNode;
  href1?: string;
  href2?: string;
  href3?: string;
  onClick1?: () => void;
  onClick2?: () => void;
  onClick3?: () => void;
}

const buttonStyle: React.CSSProperties = {
  flex: "1 1 0",
  height: 94,
  padding: 16,
  background: "#0A0A0A",
  borderRadius: 25,
  flexDirection: "column",
  justifyContent: "space-between",
  alignItems: "flex-start",
  display: "flex",
  textDecoration: "none",
  boxSizing: "border-box",
};

const textStyle: React.CSSProperties = {
  color: "white",
  fontSize: 16,
  fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
  fontWeight: 400,
};

export default function Option({
  buttons = 2,
  text1 = "Text",
  text2 = "Text",
  text3 = "Text",
  icon1,
  icon2,
  icon3,
  href1 = "/",
  href2 = "/",
  href3 = "/",
  onClick1,
  onClick2,
  onClick3,
}: OptionProps) {
  const renderButton = (
    text: React.ReactNode,
    icon: React.ReactNode,
    href: string,
    onClick?: () => void
  ) => {
    if (onClick) {
      return (
        <button onClick={onClick} style={{ ...buttonStyle, border: "none", cursor: "pointer" }}>
          <div style={{ color: "white", display: "flex" }}>{icon}</div>
          <div style={textStyle}>{text}</div>
        </button>
      );
    }
    return (
      <Link href={href} style={buttonStyle}>
        <div style={{ color: "white", display: "flex" }}>{icon}</div>
        <div style={textStyle}>{text}</div>
      </Link>
    );
  };

  return (
    <div
      style={{
        width: "100%",
        paddingLeft: 20,
        paddingRight: 20,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        display: "flex",
        boxSizing: "border-box",
      }}
    >
      {buttons >= 1 && renderButton(text1, icon1, href1, onClick1)}
      {buttons >= 2 && renderButton(text2, icon2, href2, onClick2)}
      {buttons >= 3 && renderButton(text3, icon3, href3, onClick3)}
    </div>
  );
}
