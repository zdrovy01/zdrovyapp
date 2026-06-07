"use client";

import Link from "next/link";
import React from "react";

interface OptionProps {
  buttons?: 1 | 2 | 3;
  text1?: string;
  text2?: string;
  text3?: string;
  icon1?: React.ReactNode;
  icon2?: React.ReactNode;
  icon3?: React.ReactNode;
  href1?: string;
  href2?: string;
  href3?: string;
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
}: OptionProps) {
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
      {buttons >= 1 && (
        <Link href={href1} style={buttonStyle}>
          <div style={{ color: "white", display: "flex" }}>{icon1}</div>
          <div style={textStyle}>{text1}</div>
        </Link>
      )}
      {buttons >= 2 && (
        <Link href={href2} style={buttonStyle}>
          <div style={{ color: "white", display: "flex" }}>{icon2}</div>
          <div style={textStyle}>{text2}</div>
        </Link>
      )}
      {buttons >= 3 && (
        <Link href={href3} style={buttonStyle}>
          <div style={{ color: "white", display: "flex" }}>{icon3}</div>
          <div style={textStyle}>{text3}</div>
        </Link>
      )}
    </div>
  );
}
