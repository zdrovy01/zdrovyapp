"use client";

import { useRouter } from "next/navigation";

interface UserRowProps {
  username: string;
  name: string;
  avatar_url?: string | null;
}

const FONT = "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif";

export default function UserRow({ username, name, avatar_url }: UserRowProps) {
  const router = useRouter();
  const initial = (name || username || "?").charAt(0).toUpperCase();

  return (
    <div
      onClick={() => router.push(`/${username}`)}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "12px 20px", cursor: "pointer",
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
        background: "rgba(120,120,128,0.3)", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar_url} alt={name} referrerPolicy="no-referrer"
            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 20, fontWeight: 700, color: "#F5F5F5", fontFamily: FONT }}>{initial}</span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ color: "#F5F5F5", fontSize: 15, fontWeight: 600, fontFamily: FONT }}>
          {name || username}
        </span>
        <span style={{ color: "rgba(235,235,245,0.45)", fontSize: 14, fontFamily: FONT }}>
          {" "}@{username}
        </span>
      </div>
    </div>
  );
}
