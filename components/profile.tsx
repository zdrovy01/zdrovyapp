"use client";

import { useAuth } from "@/config/auth-context";

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const initial = (user.name || user.email || "?").trim().charAt(0).toUpperCase();

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "20px",
        background: "#0A0A0A",
        backdropFilter: "blur(20px)",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          flexShrink: 0,
          overflow: "hidden",
          background: "rgba(120,120,128,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {user.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar_url}
            alt="Avatar"
            referrerPolicy="no-referrer"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: 26, fontWeight: 700, color: "#F5F5F5" }}>
            {initial}
          </span>
        )}
      </div>

      {/* Name + email */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#F5F5F5",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {user.name || "User"}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "rgba(235,235,245,0.55)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          @{user.username}
        </div>
      </div>
    </div>
  );
}
