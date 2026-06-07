"use client";

import { useState } from "react";

interface DateTimeProps {
  date?: Date;
  onChange?: (date: Date) => void;
  showTime?: boolean;
}

export default function DateTime({ date = new Date(), onChange, showTime = false }: DateTimeProps) {
  const [selected, setSelected] = useState(date);

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
          borderRadius: 6,
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
            input.value = selected.toISOString().split("T")[0];
            input.onchange = (e: any) => {
              const newDate = new Date(e.target.value);
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
