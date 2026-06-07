"use client";

import Link from "next/link";

interface Option2Props {
  text?: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

export default function Option2({ text = "Text", icon, href, onClick }: Option2Props) {
  const style = {
    width: "100%",
    height: 64,
    paddingLeft: 20,
    paddingRight: 20,
    background: "#0A0A0A",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
    display: "flex" as const,
    textDecoration: "none",
    border: "none",
    cursor: "pointer",
    borderRadius: 0,
    boxSizing: "border-box" as const,
  };

  const content = (
    <>
      {icon && (
        <div style={{ color: "white", fontSize: 22, display: "flex", alignItems: "center", flexShrink: 0 }}>
          {icon}
        </div>
      )}
      <div style={{
        color: "white",
        fontSize: 16,
        fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
        fontWeight: 600,
      }}>
        {text}
      </div>
    </>
  );

  if (href) {
    return <Link href={href} style={style}>{content}</Link>;
  }

  return <button onClick={onClick} style={style}>{content}</button>;
}
