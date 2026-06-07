"use client";

import { useAuth } from "@/config/auth-context";

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "12px",
        background: "rgba(60,60,70,0.5)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(235,235,245,0.1)",
        marginBottom: "20px",
      }}
    >
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            fontSize: "12px",
            color: "rgba(235,235,245,0.6)",
            marginBottom: "4px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Name
        </div>
        <div
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "#F5F5F5",
          }}
        >
          {user.name || "Not set"}
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: "12px",
            color: "rgba(235,235,245,0.6)",
            marginBottom: "4px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          User ID
        </div>
        <div
          style={{
            fontSize: "12px",
            fontFamily: "monospace",
            color: "rgba(10,132,255,0.8)",
            wordBreak: "break-all",
          }}
        >
          {user.id}
        </div>
      </div>
    </div>
  );
}
