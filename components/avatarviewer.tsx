"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

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

      {/* Fullscreen overlay (portal to escape transformed ancestors) */}
      {mounted && open && src &&
        createPortal(
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              background: "rgba(0,0,0,0.94)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              animation: "avatarFade 0.2s ease",
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                position: "fixed",
                top: "max(16px, env(safe-area-inset-top))",
                right: 16,
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.14)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 1001,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M4 4L14 14M14 4L4 14" stroke="#F5F5F5" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

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
          </div>,
          document.body
        )}
    </>
  );
}
