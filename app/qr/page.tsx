"use client";

import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import { useAuth } from "@/config/auth-context";
import { useProtectedRoute } from "@/hooks/use-protected-route";

export default function QrPage() {
  useProtectedRoute();
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ color: "white", padding: 20 }}>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const username = user.username || "user";
  const link = `app.zdrovy.com/@${username}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=520x520&ecc=H&margin=0&data=${encodeURIComponent(
    `https://${link}`
  )}`;

  const QR_SIZE = 260;
  const AVATAR_SIZE = 64;

  const initial = (user.name || username || "?").trim().charAt(0).toUpperCase();

  return (
    <>
      <Space size={40} />
      <ToolbarWin title={`@${username}`} />
      <Space size={40} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 20px",
        }}
      >
        {/* QR card */}
        <div
          style={{
            position: "relative",
            width: QR_SIZE,
            height: QR_SIZE,
            background: "#FFFFFF",
            borderRadius: 24,
            padding: 20,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrSrc}
            alt="QR code"
            style={{ width: "100%", height: "100%", display: "block" }}
          />

          {/* Avatar in the center */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: AVATAR_SIZE,
              height: AVATAR_SIZE,
              borderRadius: "50%",
              background: "#fff",
              border: "4px solid #fff",
              boxSizing: "border-box",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.06)",
            }}
          >
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt="Avatar"
                referrerPolicy="no-referrer"
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: "#0A0A0A",
                  color: "#fff",
                  fontSize: 24,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {initial}
              </div>
            )}
          </div>
        </div>

        <Space size={24} />

        {/* Link text */}
        <div style={{ color: "#fff", fontSize: 17, fontWeight: 600 }}>
          @{username}
        </div>
        <div
          style={{
            color: "rgba(235,235,245,0.5)",
            fontSize: 14,
            marginTop: 4,
          }}
        >
          {link}
        </div>
      </div>
    </>
  );
}
