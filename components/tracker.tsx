"use client";

import { useState, useEffect } from "react";
import { getUserStatsForDate } from "@/services/supabase-logs";

interface TrackerProps {
  date?: Date;
}

export default function Tracker({ date }: TrackerProps) {
  const [stats, setStats] = useState({
    totalKcal: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
  });
  const [loading, setLoading] = useState(true);

  const dateKey = date ? date.toDateString() : "today";

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await getUserStatsForDate(date || new Date());
      setStats({
        totalKcal: data.totalKcal,
        totalProtein: data.totalProtein,
        totalCarbs: data.totalCarbs,
        totalFat: data.totalFat,
      });
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const items = [
    { label: "Calories", value: Math.round(stats.totalKcal), unit: "", color: "#FFFFFF", total: 2000 },
    { label: "Protein", value: Math.round(stats.totalProtein), unit: "g", color: "#22C55E", total: 200 },
    { label: "Carbs", value: Math.round(stats.totalCarbs), unit: "g", color: "#F97316", total: 250 },
    { label: "Fat", value: Math.round(stats.totalFat), unit: "g", color: "#3B82F6", total: 180 },
  ];

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
      <div
        style={{
          flex: "1 1 0",
          background: "#0A0A0A",
          borderRadius: 20,
          padding: "16px 18px",
          boxSizing: "border-box",
          display: "flex",
          gap: 14,
        }}
      >
        {items.map((m) => {
          const pct = Math.min(100, (m.value / m.total) * 100);
          return (
            <div key={m.label} style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.1 }}>
                {m.value}
                {m.unit}
              </div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2, marginBottom: 8 }}>
                {m.label}
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
                    background: m.color,
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}