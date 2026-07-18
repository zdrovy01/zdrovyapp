"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getUserStatsForDate } from "@/services/supabase-logs";
import { useCached } from "@/hooks/use-cached";
import { useGoals } from "@/config/goals";

interface TrackerProps {
  date?: Date;
  href?: string;
}

// Smoothly animates a number from its previous value to the target.
function useCountUp(target: number, duration = 900) {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = target;
    if (from === to) return;

    const start = performance.now();
    // easeOutCubic for a natural deceleration
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const value = Math.round(from + (to - from) * ease(progress));
      setDisplay(value);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      fromRef.current = display;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return display;
}

export default function Tracker({ date, href = "/log" }: TrackerProps) {
  const dateKey = date ? date.toDateString() : "today";

  const { data: stats } = useCached(
    `stats:${dateKey}`,
    async () => {
      const data = await getUserStatsForDate(date || new Date());
      return {
        totalKcal: data.totalKcal,
        totalProtein: data.totalProtein,
        totalCarbs: data.totalCarbs,
        totalFat: data.totalFat,
      };
    },
    { totalKcal: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 }
  );

  const goals = useGoals();

  const items = [
    { label: "Calories", value: Math.round(stats.totalKcal), unit: "", color: "#FFFFFF", total: goals.kcal },
    { label: "Protein", value: Math.round(stats.totalProtein), unit: "g", color: "#22C55E", total: goals.protein },
    { label: "Carbs", value: Math.round(stats.totalCarbs), unit: "g", color: "#F97316", total: goals.carbs },
    { label: "Fat", value: Math.round(stats.totalFat), unit: "g", color: "#3B82F6", total: goals.fat },
  ];

  // Daily completion score = average of how close each target is (each capped at 100%).
  const score = Math.round(
    items.reduce((sum, m) => sum + Math.min(100, (m.value / m.total) * 100), 0) / items.length
  );
  const animatedScore = useCountUp(score);

  return (
    <div
      data-layer="Tracker"
      className="Tracker"
      style={{
        width: "100%",
        paddingLeft: 20,
        paddingRight: 20,
        boxSizing: "border-box",
        display: "flex",
      }}
    >
      <Link
        href={href}
        style={{
          flex: "1 1 0",
          background: "#0A0A0A",
          borderRadius: 20,
          padding: "16px 18px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          textDecoration: "none",
          cursor: "pointer",
        }}
      >
        {/* Daily score */}
        <div>
          <div style={{ fontSize: 12, color: "#888" }}>Day completed</div>
          <div style={{ fontSize: 48, fontWeight: 800, color: scoreColor(score), lineHeight: 1.1 }}>
            {animatedScore}%
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 0.5, background: "rgba(255,255,255,0.08)" }} />

        {/* Macros */}
        <div style={{ display: "flex", gap: 14 }}>
          {items.map((m) => (
            <TrackerItem key={m.label} {...m} />
          ))}
        </div>
      </Link>
    </div>
  );
}

// Maps 0→100% completion onto a hue from red (0) through yellow to green (120).
function scoreColor(pct: number): string {
  const clamped = Math.min(100, Math.max(0, pct));
  const hue = (clamped / 100) * 120;
  return `hsl(${hue}, 75%, 52%)`;
}

interface TrackerItemProps {
  label: string;
  value: number;
  unit: string;
  color: string;
  total: number;
}

function TrackerItem({ label, value, unit, color, total }: TrackerItemProps) {
  const animatedValue = useCountUp(value);
  const pct = Math.min(100, (value / total) * 100);

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.1 }}>
        {animatedValue}
        {unit}
      </div>
      <div style={{ fontSize: 11, color: "#888", marginTop: 2, marginBottom: 8 }}>
        {label}
      </div>
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: "#2A2A2A",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 2,
            background: color,
            transition: "width 0.6s ease-out",
          }}
        />
      </div>
    </div>
  );
}