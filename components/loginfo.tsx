"use client";

interface ButtonConfig {
  text: string;
  onClick: () => void;
}

interface LogInfoProps {
  name?: string;
  kcal?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  price?: number;
  image?: string;
  buttons?: [ButtonConfig] | [ButtonConfig, ButtonConfig];
}

export default function LogInfo({
  name = "Meal",
  kcal = 0,
  protein = 0,
  carbs = 0,
  fat = 0,
  price = 0,
  image,
  buttons,
}: LogInfoProps) {
  const macros = [
    { label: "Protein", value: protein, unit: "g", color: "#FF6B6B" },
    { label: "Carbs", value: carbs, unit: "g", color: "#FFD93D" },
    { label: "Fat", value: fat, unit: "g", color: "#6BCB77" },
  ];

  return (
    <div
      style={{
        width: "100%",
        background: "#0A0A0A",
        borderRadius: 16,
        padding: 20,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Image */}
      {image && (
        <div
          style={{
            width: "100%",
            height: 200,
            borderRadius: 12,
            background: "rgba(255,255,255,0.05)",
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* Title */}
      <div
        style={{
          color: "#F5F5F5",
          fontSize: 22,
          fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
          fontWeight: 600,
        }}
      >
        {name}
      </div>

      {/* Calories & Price */}
      <div style={{ display: "flex", gap: 12 }}>
        {/* Calories */}
        <div
          style={{
            flex: 1,
            padding: 16,
            background: "rgba(255,255,255,0.05)",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              color: "rgba(235,235,245,0.6)",
              fontSize: 12,
              fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
              marginBottom: 6,
            }}
          >
            Calories
          </div>
          <div
            style={{
              color: "#F5F5F5",
              fontSize: 28,
              fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
              fontWeight: 700,
            }}
          >
            {kcal}
          </div>
          <div
            style={{
              color: "rgba(235,235,245,0.5)",
              fontSize: 11,
              fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
            }}
          >
            kcal
          </div>
        </div>

        {/* Price */}
        <div
          style={{
            flex: 1,
            padding: 16,
            background: "rgba(255,255,255,0.05)",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              color: "rgba(235,235,245,0.6)",
              fontSize: 12,
              fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
              marginBottom: 6,
            }}
          >
            Price
          </div>
          <div
            style={{
              color: "#F5F5F5",
              fontSize: 28,
              fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
              fontWeight: 700,
            }}
          >
            ${price}
          </div>
          <div
            style={{
              color: "rgba(235,235,245,0.5)",
              fontSize: 11,
              fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
            }}
          >
            approx
          </div>
        </div>
      </div>

      {/* Macros */}
      <div style={{ display: "flex", gap: 10 }}>
        {macros.map((macro) => (
          <div
            key={macro.label}
            style={{
              flex: 1,
              padding: 12,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 100,
                background: macro.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  color: "white",
                  fontSize: 18,
                  fontWeight: 600,
                }}
              >
                {macro.value}
              </div>
            </div>
            <div
              style={{
                color: "rgba(235,235,245,0.6)",
                fontSize: 12,
                fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
              }}
            >
              {macro.label}
            </div>
            <div
              style={{
                color: "rgba(235,235,245,0.5)",
                fontSize: 10,
                fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
              }}
            >
              {macro.unit}
            </div>
          </div>
        ))}
      </div>

      {/* Buttons */}
      {buttons && (
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 8,
          }}
        >
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.onClick}
              style={{
                flex: 1,
                padding: "12px 16px",
                background: idx === 0 ? "#0A84FF" : "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: 10,
                color: idx === 0 ? "white" : "#F5F5F5",
                fontSize: 15,
                fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              {btn.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
