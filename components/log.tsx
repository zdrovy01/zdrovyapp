"use client";

interface LogProps {
  title?: string;
  kcal?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  time?: string;
  onClick?: () => void;
}

export default function Log({
  title = "Meal",
  kcal = 0,
  protein = 0,
  carbs = 0,
  fat = 0,
  time = "12:00",
  onClick,
}: LogProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        height: 64,
        paddingLeft: 20,
        paddingRight: 20,
        background: "#0A0A0A",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        display: "flex",
        border: "none",
        cursor: "pointer",
        borderRadius: 0,
        boxSizing: "border-box",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(10,10,10,0.8)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#0A0A0A";
      }}
    >
      {/* Left: Content */}
      <div style={{ flex: "1 1 0", textAlign: "left" }}>
        <div
          style={{
            color: "white",
            fontSize: 16,
            fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
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
            fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
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
          fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
          fontWeight: 500,
          flexShrink: 0,
        }}
      >
        {time}
      </div>
    </button>
  );
}
