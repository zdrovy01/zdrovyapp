"use client";

import { useState, useEffect } from "react";
import { getUserTodayStats } from "@/services/supabase-logs";

export default function Tracker() {
  const [stats, setStats] = useState({
    totalKcal: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getUserTodayStats();
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

  const caloriesTotal = 2000;
  const caloriesEaten = Math.round(stats.totalKcal);
  const caloriesPercent = Math.min(1, caloriesEaten / caloriesTotal);

  const proteinTotal = 200;
  const carbsTotal = 250;
  const fatTotal = 180;

  const macros = [
    { label: "Protein", value: Math.round(stats.totalProtein), color: "#22C55E", total: proteinTotal },
    { label: "Carbs", value: Math.round(stats.totalCarbs), color: "#F97316", total: carbsTotal },
    { label: "Fat", value: Math.round(stats.totalFat), color: "#3B82F6", total: fatTotal },
  ];

  const radius = 38;
  const stroke = 5;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const dashOffset = circumference * caloriesPercent;

  return (
    <div
      data-layer="Tracker"
      className="Tracker"
      style={{
        width: '100%',
        paddingLeft: 20,
        paddingRight: 20,
        boxSizing: 'border-box' as const,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        display: "flex",
      }}
    >
      <div
        data-layer="container"
        className="Container"
        style={{
          flex: "1 1 0",
          height: 200,
          background: "#0A0A0A",
          borderRadius: 25,
          padding: "20px 24px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top row: calories + ring */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 36, fontWeight: 700, color: "#FFFFFF", lineHeight: 1 }}>
              {caloriesEaten}
            </div>
            <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Calories</div>
          </div>

          {/* Circular progress */}
          <div style={{ position: "relative", width: radius * 2, height: radius * 2 }}>
            <svg width={radius * 2} height={radius * 2} style={{ transform: "rotate(-90deg)" }}>
              {/* Track */}
              <circle
                cx={radius}
                cy={radius}
                r={normalizedRadius}
                fill="none"
                stroke="#2A2A2A"
                strokeWidth={stroke}
              />
              {/* Progress */}
              <circle
                cx={radius}
                cy={radius}
                r={normalizedRadius}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={circumference - dashOffset}
                strokeLinecap="round"
              />
            </svg>
            {/* Flame icon centered */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                <path
                  d="M8 0C8 0 10.5 3.5 10.5 6C10.5 6 12 4.5 12 3C12 3 15 6 15 10C15 13.866 11.866 17 8 17C4.134 17 1 13.866 1 10C1 7 3.5 4.5 3.5 4.5C3.5 4.5 3.5 7 5.5 8C5.5 8 4 5.5 8 0Z"
                  fill="white"
                />
              </svg>
              <span style={{ fontSize: 8, color: "#888", letterSpacing: 0.3 }}>kcal</span>
            </div>
          </div>
        </div>

        {/* Bottom row: macros */}
        <div style={{ display: "flex", gap: 16 }}>
          {macros.map((m) => {
            const pct = (m.value / m.total) * 100;
            return (
              <div key={m.label} style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#FFFFFF" }}>{m.value}g</div>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>{m.label}</div>
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
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}