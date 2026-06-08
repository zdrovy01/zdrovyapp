"use client";

import { useState } from "react";
import { useAuth } from "@/config/auth-context";
import { useRouter } from "next/navigation";
import Space from "@/components/space";
import Logo3D from "@/components/logo3d";

export default function AuthPage() {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await loginWithGoogle();
    } catch (err) {
      setError("Failed to sign in with Google");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#000000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 0 48px",
        boxSizing: "border-box",
      }}
    >
      {/* Top: logo card filling space from top of screen to titles */}
      <div
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0A",
          borderRadius: "0 0 64px 64px",
        }}
      >
        <Logo3D width={220} />
      </div>

      <Space size={32} />

      {/* Bottom: title + subtitle + Google sign in */}
      <div
        style={{
          maxWidth: 360,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 24px",
          boxSizing: "border-box",
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: 34,
            fontWeight: 800,
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 1.15,
            margin: 0,
            letterSpacing: "-0.5px",
          }}
        >
          Healthy food.
          <br />
          Real prices.
        </h1>

        <Space size={16} />

        {/* Subtitle */}
        <p
          style={{
            fontSize: 16,
            color: "rgba(235,235,245,0.55)",
            textAlign: "center",
            lineHeight: 1.45,
            margin: 0,
            maxWidth: 320,
          }}
        >
          See what every meal costs — from stores you already shop at.
        </p>

        <Space size={32} />

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: "100%",
            height: 64,
            borderRadius: 999,
            background: "#FFFFFF",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            fontSize: 17,
            fontWeight: 600,
            color: "#000",
            opacity: loading ? 0.6 : 1,
            transition: "transform 0.15s, opacity 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.opacity = "0.92";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.opacity = "1";
          }}
          onMouseDown={(e) => {
            if (!loading) e.currentTarget.style.transform = "scale(0.98)";
          }}
          onMouseUp={(e) => {
            if (!loading) e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        {/* Error Message */}
        {error && (
          <>
            <Space size={16} />
            <div
              style={{
                color: "#FF453A",
                fontSize: 14,
                textAlign: "center",
                padding: "12px 16px",
                background: "rgba(255,69,58,0.1)",
                borderRadius: 12,
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              {error}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
