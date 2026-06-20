"use client";

import React from "react";

interface FoodCardProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: string | null;
  title: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  price?: number | null;
  time?: string;
}

const FONT =
  "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif";

export default function FoodCard({
  image,
  title,
  kcal,
  protein,
  carbs,
  fat,
  price,
  time,
  style,
  ...rest
}: FoodCardProps) {
  const showPrice = price !== undefined && price !== null;

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "#0A0A0A",
        borderRadius: 20,
        padding: 12,
        ...style,
      }}
      {...rest}
    >
      {/* Photo (optional) */}
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={title}
          referrerPolicy="no-referrer"
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            objectFit: "cover",
            flexShrink: 0,
          }}
        />
      )}

      {/* Middle: title + macros */}
      <div style={{ flex: "1 1 0", minWidth: 0, textAlign: "left" }}>
        <div
          style={{
            color: "#fff",
            fontSize: 16,
            fontFamily: FONT,
            fontWeight: 600,
            marginBottom: 4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: "rgba(235,235,245,0.6)",
            fontSize: 12,
            fontFamily: FONT,
            fontWeight: 400,
            display: "flex",
            gap: 12,
          }}
        >
          <span>{kcal} kcal</span>
          <span>p {protein}</span>
          <span>c {carbs}</span>
          <span>f {fat}</span>
        </div>
      </div>

      {/* Right: price or time */}
      {(showPrice || time) && (
        <div
          style={{
            flexShrink: 0,
            textAlign: "right",
            fontFamily: FONT,
          }}
        >
          {showPrice && (
            <div style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>
              ${(price as number).toFixed(2)}
            </div>
          )}
          {time && (
            <div style={{ color: "rgba(235,235,245,0.5)", fontSize: 13, fontWeight: 500 }}>
              {time}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
