"use client";

import { useEffect, useState } from "react";

const FONT = "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif";

interface AvatarViewerProps {
  src?: string | null;
  initial?: string;
  size?: number;
}

export default function AvatarViewer({
  src,
  initial = "?",
  size = 80,
}: AvatarViewerProps) {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the viewer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Thumbnail */}
      <div
        onClick={() => src && setOpen(true)}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          flexShrink: 0,
          background: "rgba(120,120,128,0.3)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: src ? "pointer" : "default",
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt="Avatar"
            referrerPolicy="no-referrer"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span
            style={{
              fontSize: size * 0.4,
              fontWeight: 700,
              color: "#F5F5F5",
              fontFamily: FONT,
            }}
          >
            {initial}
          </span>
        )}
      </div>

      {/* Fullscreen overlay */}
      {open && src && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            animation: "avatarFade 0.2s ease",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Avatar"
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(86vw, 420px)",
              height: "min(86vw, 420px)",
              borderRadius: "50%",
              objectFit: "cover",
              boxShadow: "0 12px 60px rgba(0,0,0,0.6)",
              animation: "avatarPop 0.22s cubic-bezier(0.2,0.8,0.2,1)",
            }}
          />
          <style>{`
            @keyframes avatarFade { from { opacity: 0 } to { opacity: 1 } }
            @keyframes avatarPop { from { transform: scale(0.85); opacity: 0 } to { transform: scale(1); opacity: 1 } }
          `}</style>
        </div>
      )}
    </>
  );
}
