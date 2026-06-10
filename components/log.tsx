"use client";

import { useRef, useState } from "react";
import FoodCard from "@/components/foodcard";

interface LogProps {
  title?: string;
  image?: string | null;
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
  image,
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
        borderRadius: 16,
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
      <FoodCard
        title={title}
        image={image}
        kcal={kcal}
        protein={protein}
        carbs={carbs}
        fat={fat}
        time={time}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleCardClick}
        style={{
          position: "relative",
          transform: `translateX(${offset}px)`,
          transition: dragging ? "none" : "transform 0.25s ease",
          cursor: onClick ? "pointer" : "default",
          touchAction: "pan-y",
          userSelect: "none",
        }}
      />
    </div>
  );
}
