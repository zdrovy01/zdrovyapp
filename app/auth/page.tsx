"use client";

import { useState } from "react";
import { useAuth } from "@/config/auth-context";
import { useRouter } from "next/navigation";
import Space from "@/components/space";

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
        background: "#000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 340,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        {/* Logo / Title */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#F5F5F5",
              marginBottom: 8,
            }}
          >
            Zdrovy
          </div>
          <div
            style={{
              fontSize: 14,
              color: "rgba(235,235,245,0.6)",
            }}
          >
            Nutrition Tracker
          </div>
        </div>

        <Space size={40} />

        {/* Sign In Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: "100%",
            height: 56,
            borderRadius: 12,
            background: "#F5F5F5",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            fontSize: 16,
            fontWeight: 600,
            color: "#000",
            opacity: loading ? 0.6 : 1,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.opacity = "1";
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
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
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>

        {/* Error Message */}
        {error && (
          <div
            style={{
              color: "#FF453A",
              fontSize: 14,
              textAlign: "center",
              padding: "12px 16px",
              background: "rgba(255,69,58,0.1)",
              borderRadius: 8,
              width: "100%",
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
