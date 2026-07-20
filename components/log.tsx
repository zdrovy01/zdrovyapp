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
  const startX = useRef(0);
  const startY = useRef(0);
  const currentOffset = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    if (!onDelete) return;
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isHorizontal.current = null;
    setDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!onDelete || !dragging) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    // Determine direction on first significant move
    if (isHorizontal.current === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      isHorizontal.current = Math.abs(dx) > Math.abs(dy);
    }

    if (!isHorizontal.current) return; // vertical scroll — don't interfere

    e.preventDefault(); // block scroll during horizontal swipe
    const next = Math.max(-DELETE_WIDTH, Math.min(0, currentOffset.current + dx));
    setOffset(next);
  };

  const onTouchEnd = () => {
    if (!dragging) return;
    setDragging(false);
    const snapped = offset < -DELETE_WIDTH / 2 ? -DELETE_WIDTH : 0;
    currentOffset.current = snapped;
    setOffset(snapped);
  };

  const handleCardClick = () => {
    if (offset !== 0) {
      currentOffset.current = 0;
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
        borderRadius: 4,
        background: "#0A0A0A",
      }}
    >
      {/* Delete button */}
      {onDelete && offset < 0 && (
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
            color: "#fff",
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

      {/* Swipeable card */}
      <FoodCard
        title={title}
        image={image}
        kcal={kcal}
        protein={protein}
        carbs={carbs}
        fat={fat}
        time={time}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={handleCardClick}
        style={{
          position: "relative",
          borderRadius: 0,
          transform: `translateX(${offset}px)`,
          transition: dragging ? "none" : "transform 0.25s ease",
          touchAction: "pan-y",
          userSelect: "none",
          cursor: onClick ? "pointer" : "default",
        }}
      />
    </div>
  );
}
