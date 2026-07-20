"use client";

import { useState, useEffect } from "react";

interface DateTimeProps {
  date?: Date;
  onChange?: (date: Date) => void;
  showTime?: boolean;
}

// Format a Date as YYYY-MM-DD using LOCAL time (not UTC) for the native input.
function toLocalDateValue(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DateTime({ date = new Date(), onChange, showTime = false }: DateTimeProps) {
  const [selected, setSelected] = useState(date);

  // Keep in sync if the parent changes the date externally.
  useEffect(() => {
    setSelected(date);
  }, [date]);

  const handleDateChange = (newDate: Date) => {
    setSelected(newDate);
    onChange?.(newDate);
  };

  const month = selected.toLocaleString("en-US", { month: "short" });
  const day = selected.getDate();
  const year = selected.getFullYear();
  const hours = selected.getHours().toString().padStart(2, "0");
  const minutes = selected.getMinutes().toString().padStart(2, "0");

  return (
    <div
      style={{
        width: "100%",
        paddingLeft: 20,
        paddingRight: 20,
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 10,
        display: "flex",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          height: 34,
          borderRadius: 4,
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 6,
          display: "flex",
        }}
      >
        <div
          style={{
            paddingLeft: 11,
            paddingRight: 11,
            paddingTop: 6,
            paddingBottom: 6,
            background: "rgba(118, 118, 128, 0.24)",
            borderRadius: 100,
            justifyContent: "center",
            alignItems: "center",
            gap: 5,
            display: "flex",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "date";
            input.value = toLocalDateValue(selected);
            input.onchange = (e: any) => {
              const [y, m, d] = e.target.value.split("-").map(Number);
              // Construct a LOCAL date to avoid UTC day-shift.
              const newDate = new Date(y, m - 1, d);
              handleDateChange(newDate);
            };
            input.click();
          }}
        >
          <div
            style={{
              textAlign: "center",
              color: "white",
              fontSize: 17,
              fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
              fontWeight: 400,
              lineHeight: "22px",
            }}
          >
            {month} {day},
          </div>
          <div
            style={{
              textAlign: "center",
              color: "white",
              fontSize: 17,
              fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
              fontWeight: 400,
              lineHeight: "22px",
            }}
          >
            {year}
          </div>
        </div>

        {showTime && (
          <div
            style={{
              paddingLeft: 11,
              paddingRight: 11,
              paddingTop: 6,
              paddingBottom: 6,
              background: "rgba(118, 118, 128, 0.24)",
              borderRadius: 100,
              justifyContent: "center",
              alignItems: "center",
              gap: 5,
              display: "flex",
              cursor: "pointer",
            }}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "time";
              input.value = `${hours}:${minutes}`;
              input.onchange = (e: any) => {
                const [h, m] = e.target.value.split(":");
                const newDate = new Date(selected);
                newDate.setHours(parseInt(h), parseInt(m));
                handleDateChange(newDate);
              };
              input.click();
            }}
          >
            <div
              style={{
                textAlign: "center",
                color: "white",
                fontSize: 17,
                fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
                fontWeight: 400,
                lineHeight: "22px",
              }}
            >
              {hours}:{minutes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
