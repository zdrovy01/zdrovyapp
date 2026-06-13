"use client";

import { useRef, useState } from "react";
import FoodCard from "@/components/foodcard";

interface RecipeCardProps {
  title: string;
  image?: string | null;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
  onClick?: () => void;
  onDelete?: () => void;
}

const DELETE_WIDTH = 88;

export default function RecipeCard({
  onClick,
  onDelete,
  ...data
}: RecipeCardProps) {
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

    if (isHorizontal.current === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      isHorizontal.current = Math.abs(dx) > Math.abs(dy);
    }
    if (!isHorizontal.current) return;

    e.preventDefault();
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

  const handleClick = () => {
    if (offset !== 0) {
      currentOffset.current = 0;
      setOffset(0);
      return;
    }
    onClick?.();
  };

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden", borderRadius: 16, background: "#FF3B30" }}>
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
      <FoodCard
        {...data}
        onClick={handleClick}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          position: "relative",
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
