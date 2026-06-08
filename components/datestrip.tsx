"use client";

import { useEffect, useRef } from "react";

interface DateStripProps {
  selected: Date;
  onSelect: (date: Date) => void;
  /** How many days back from today to show. Default 14. */
  days?: number;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const WEEKDAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

export default function DateStrip({
  selected,
  onSelect,
  days = 14,
}: DateStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Build a list of dates: from (today - days + 1) ... today, plus one future day.
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateList: Date[] = [];
  for (let i = days - 1; i >= -1; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dateList.push(d);
  }

  // Scroll to the end (today) on mount.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  return (
    <div
      ref={scrollRef}
      style={{
        width: "100%",
        display: "flex",
        gap: 6,
        overflowX: "auto",
        padding: "0 20px",
        boxSizing: "border-box",
        scrollbarWidth: "none",
      }}
      className="hide-scrollbar"
    >
      {dateList.map((d) => {
        const isSelected = isSameDay(d, selected);
        const isToday = isSameDay(d, today);
        const isFuture = d.getTime() > today.getTime();
        const letter = WEEKDAY_LETTERS[d.getDay()];

        return (
          <button
            key={d.toISOString()}
            onClick={() => !isFuture && onSelect(d)}
            disabled={isFuture}
            style={{
              flex: "0 0 auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              border: "none",
              cursor: isFuture ? "default" : "pointer",
              padding: 0,
            }}
          >
            {/* Weekday circle */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 600,
                background: isSelected ? "#000000" : "transparent",
                color: isSelected
                  ? "#FFFFFF"
                  : isFuture
                  ? "rgba(235,235,245,0.3)"
                  : "rgba(235,235,245,0.85)",
                border: isSelected
                  ? "1px solid #000000"
                  : isFuture
                  ? "1px dashed rgba(235,235,245,0.15)"
                  : "1px dashed rgba(235,235,245,0.3)",
                transition: "all 0.15s",
              }}
            >
              {letter}
            </div>
            {/* Day number */}
            <div
              style={{
                fontSize: 14,
                fontWeight: isSelected ? 700 : 500,
                color: isSelected
                  ? "#FFFFFF"
                  : isToday
                  ? "rgba(235,235,245,0.95)"
                  : isFuture
                  ? "rgba(235,235,245,0.3)"
                  : "rgba(235,235,245,0.6)",
              }}
            >
              {d.getDate()}
            </div>
          </button>
        );
      })}
    </div>
  );
}
