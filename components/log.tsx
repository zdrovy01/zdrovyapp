"use client";

import { useRef, useState } from "react";

interface LogProps {
  title?: string;
  kcal?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  time?: string;
  onClick?: () => void;
  onDelete?: () => void;
}

const DELETE_WIDTH = 88;
const OPEN_THRESHOLD = 44;

export default function Log({
  title = "Meal",
  kcal = 0,
  protein = 0,
  carbs = 0,
  fat = 0,
  time = "12:00",
  onClick,
  onDelete,
}: LogProps) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const baseRef = useRef(0);
  const startXRef = useRef(0);
  const movedRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!onDelete) return;
    startXRef.current = e.clientX;
    movedRef.current = false;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const delta = e.clientX - startXRef.current;
    if (Math.abs(delta) > 4) movedRef.current = true;
    const next = Math.max(-DELETE_WIDTH, Math.min(0, baseRef.current + delta));
    setOffset(next);
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    const opened = offset < -OPEN_THRESHOLD;
    const snapped = opened ? -DELETE_WIDTH : 0;
    baseRef.current = snapped;
    setOffset(snapped);
  };

  const handleCardClick = () => {
    if (movedRef.current) return; // was a swipe, not a tap
    if (offset !== 0) {
      baseRef.current = 0;
      setOffset(0);
      return;
    }
    onClick?.();
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        background: "#FF3B30",
      }}
    >
      {/* Delete button revealed underneath */}
      {onDelete && (
        <button
          onClick={onDelete}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            height: "100%",
            width: DELETE_WIDTH,
            background: "#FF3B30",
            border: "none",
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Delete
        </button>
      )}

      {/* Foreground draggable card */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleCardClick}
        style={{
          position: "relative",
          width: "100%",
          height: 64,
          paddingLeft: 20,
          paddingRight: 20,
          background: "#0A0A0A",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          display: "flex",
          boxSizing: "border-box",
          transform: `translateX(${offset}px)`,
          transition: dragging ? "none" : "transform 0.25s ease",
          cursor: onClick ? "pointer" : "default",
          touchAction: "pan-y",
          userSelect: "none",
        }}
      >
        {/* Left: Content */}
        <div style={{ flex: "1 1 0", textAlign: "left" }}>
          <div
            style={{
              color: "white",
              fontSize: 16,
              fontFamily:
                "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: "rgba(235,235,245,0.6)",
              fontSize: 12,
              fontFamily:
                "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
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

        {/* Right: Time */}
        <div
          style={{
            color: "rgba(235,235,245,0.5)",
            fontSize: 13,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
            fontWeight: 500,
            flexShrink: 0,
          }}
        >
          {time}
        </div>
      </div>
    </div>
  );
}
