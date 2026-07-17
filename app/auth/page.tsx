"use client";

import { useState } from "react";
import { useAuth } from "@/config/auth-context";
import Space from "@/components/space";

export default function AuthPage() {
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        background: "#000000",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 0 48px",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Logo — black on black, revealed by a passing light every few seconds */}
      <div
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <svg
          width="240"
          viewBox="0 0 648 132"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ maxWidth: "62%", height: "auto" }}
        >
          <path
            d="M103.3 129.057H4.29443e-05V95.1043L49.4434 36.4746H4.29443e-05V2.5217H103.3V36.4746L48.813 95.1043H103.3V129.057ZM103.3 129.057V2.5217H152.112C164.421 2.5217 175.678 5.28357 185.885 10.8073C196.152 16.271 204.257 23.8361 210.201 33.5026C216.145 43.1091 219.118 53.8263 219.118 65.6544C219.118 77.5424 216.145 88.3193 210.201 97.9862C204.318 107.653 196.272 115.248 186.065 120.772C175.919 126.295 164.691 129.057 152.382 129.057H103.3ZM153.733 93.3931C159.017 93.3931 163.73 92.2522 167.873 89.9708C172.016 87.6292 175.228 84.3871 177.509 80.2443C179.851 76.0412 181.022 71.178 181.022 65.6544C181.022 60.3104 179.851 55.5374 177.509 51.3346C175.228 47.1318 172.016 43.8896 167.873 41.6081C163.73 39.2665 158.987 38.0957 153.643 38.0957H140.855V93.3931H153.733ZM323.188 129.057H280.86L262.397 90.0609H260.056H252.22V129.057H214.665V2.5217H270.863C279.629 2.5217 287.434 4.38296 294.279 8.10548C301.123 11.828 306.437 17.0215 310.22 23.686C314.062 30.2904 315.983 37.8255 315.983 46.2912C315.983 54.0365 314.423 60.7309 311.3 66.3749C308.238 72.0183 303.946 76.6717 298.422 80.3343L323.188 129.057ZM252.22 36.3846V57.2788H267.351C269.272 57.2788 271.043 56.7682 272.664 55.7476C274.285 54.7269 275.546 53.376 276.447 51.6949C277.408 50.0137 277.888 48.2425 277.888 46.3813C277.888 43.1991 276.837 40.7375 274.736 38.9963C272.695 37.2551 270.353 36.3846 267.711 36.3846H252.22ZM372.218 131.399C359.91 131.399 348.712 128.457 338.625 122.573C328.538 116.629 320.583 108.613 314.759 98.5266C308.995 88.4398 306.113 77.422 306.113 65.4743C306.113 53.466 308.995 42.4786 314.759 32.512C320.583 22.4851 328.538 14.5598 338.625 8.73591C348.712 2.91196 359.91 0 372.218 0C384.407 0 395.514 2.91196 405.54 8.73591C415.627 14.5598 423.552 22.4851 429.316 32.512C435.14 42.4786 438.052 53.466 438.052 65.4743C438.052 77.422 435.14 88.4398 429.316 98.5266C423.552 108.613 415.627 116.629 405.54 122.573C395.514 128.457 384.407 131.399 372.218 131.399ZM372.218 95.3745C377.081 95.3745 381.645 94.0534 385.907 91.4118C390.17 88.7696 393.562 85.1976 396.084 80.6946C398.666 76.1313 399.957 71.0879 399.957 65.5644C399.957 60.1005 398.666 55.1172 396.084 50.6142C393.503 46.0511 390.08 42.4786 385.817 39.8969C381.555 37.2551 377.022 35.9343 372.218 35.9343C367.355 35.9343 362.762 37.2551 358.439 39.8969C354.176 42.4786 350.724 46.0511 348.082 50.6142C345.5 55.1172 344.209 60.1005 344.209 65.5644C344.209 71.0277 345.5 76.0412 348.082 80.6045C350.724 85.1672 354.176 88.7696 358.439 91.4118C362.762 94.0534 367.355 95.3745 372.218 95.3745ZM494.053 129.057H462.892L415.16 2.5217H455.327L478.202 75.8313L478.652 75.9213L501.528 2.5217H541.785L494.053 129.057ZM603.375 129.057H565.82V82.4057L521.6 2.5217H565.009L584.913 47.372L604.006 2.5217H647.595L603.375 82.1355V129.057Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      {/* Google Sign In */}
      <div
        style={{
          maxWidth: 360,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 24px",
          boxSizing: "border-box",
          position: "relative",
          zIndex: 1,
        }}
      >
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
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.92"; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.opacity = "1"; }}
          onMouseDown={(e) => { if (!loading) e.currentTarget.style.transform = "scale(0.98)"; }}
          onMouseUp={(e) => { if (!loading) e.currentTarget.style.transform = "scale(1)"; }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

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
