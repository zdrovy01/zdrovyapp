"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { COLORS } from "@/config/theme";

const FONT = "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif";

interface CreateSheetProps {
  open: boolean;
  onClose: () => void;
}

const options: { label: string; href: string; icon: React.ReactNode }[] = [
  {
    label: "Log",
    href: "/add",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="2" width="18" height="18" rx="2" stroke="#F5F5F5" strokeWidth="1.8" />
        <path d="M6 8h10M6 12h10M6 16h6" stroke="#F5F5F5" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Spend",
    href: "/addspend",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 22" fill="none">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4 2.5C1.79086 2.5 0 4.29086 0 6.5V15.5C0 17.7091 1.79086 19.5 4 19.5H20C22.2091 19.5 24 17.7091 24 15.5V13H18C16.3431 13 15 11.6569 15 10C15 8.34315 16.3431 7 18 7H24V6.5C24 4.29086 22.2091 2.5 20 2.5H4ZM24 9H18C17.4477 9 17 9.44772 17 10C17 10.5523 17.4477 11 18 11H24V9Z"
          fill="#F5F5F5"
        />
      </svg>
    ),
  },
  {
    label: "Recipe",
    href: "/createrecipe",
    icon: (
      <svg width="18" height="22" viewBox="0 0 17 27" fill="none">
        <path d="M4.0957 26.833C3.59766 26.833 3.19922 26.6982 2.90039 26.4287C2.60742 26.1592 2.4668 25.7842 2.47852 25.3037L2.70703 12.4365C2.71289 12.1904 2.6748 11.9971 2.59277 11.8564C2.51074 11.7158 2.37305 11.6016 2.17969 11.5137C1.66406 11.2793 1.24219 11.0215 0.914062 10.7402C0.585938 10.459 0.351562 10.0986 0.210938 9.65918C0.0703125 9.21973 0.0175781 8.64551 0.0527344 7.93652L0.37793 1.02832C0.389648 0.764648 0.46875 0.556641 0.615234 0.404297C0.761719 0.251953 0.960938 0.175781 1.21289 0.175781C1.45898 0.175781 1.64941 0.254883 1.78418 0.413086C1.91895 0.571289 1.98633 0.785156 1.98633 1.05469L1.90723 7.75195C1.90137 7.96289 1.9541 8.12695 2.06543 8.24414C2.18262 8.36133 2.33496 8.41992 2.52246 8.41992C2.71582 8.41992 2.87109 8.36426 2.98828 8.25293C3.10547 8.13574 3.16406 7.97754 3.16406 7.77832L3.28711 0.834961C3.29297 0.577148 3.36621 0.375 3.50684 0.228516C3.65332 0.0761719 3.84961 0 4.0957 0C4.3418 0 4.53516 0.0761719 4.67578 0.228516C4.82227 0.375 4.89844 0.577148 4.9043 0.834961L5.02734 7.77832C5.02734 7.9834 5.08594 8.1416 5.20312 8.25293C5.32031 8.36426 5.47559 8.41992 5.66895 8.41992C5.85059 8.41992 6 8.36133 6.11719 8.24414C6.23438 8.12695 6.29297 7.96289 6.29297 7.75195L6.20508 1.05469C6.20508 0.785156 6.27246 0.571289 6.40723 0.413086C6.54199 0.254883 6.73242 0.175781 6.97852 0.175781C7.23047 0.175781 7.42969 0.251953 7.57617 0.404297C7.72266 0.550781 7.80469 0.758789 7.82227 1.02832L8.13867 7.93652C8.16797 8.64551 8.1123 9.21973 7.97168 9.65918C7.83105 10.0986 7.59961 10.459 7.27734 10.7402C6.95508 11.0215 6.5332 11.2793 6.01172 11.5137C5.81836 11.6016 5.68066 11.7158 5.59863 11.8564C5.5166 11.9971 5.47852 12.1904 5.48438 12.4365L5.71289 25.3037C5.71875 25.7783 5.5752 26.1504 5.28223 26.4199C4.98926 26.6953 4.59375 26.833 4.0957 26.833ZM13.0693 16.875C13.0811 16.6348 13.04 16.4326 12.9463 16.2686C12.8584 16.0986 12.7119 15.9434 12.5068 15.8027L11.9531 15.4248C11.6309 15.2021 11.3965 14.9473 11.25 14.6602C11.1035 14.373 11.0303 14.0156 11.0303 13.5879V12.9287C11.0303 11.7861 11.1064 10.6348 11.2588 9.47461C11.4111 8.30859 11.625 7.18359 11.9004 6.09961C12.1816 5.01563 12.5127 4.0166 12.8936 3.10254C13.2803 2.18848 13.7051 1.40625 14.168 0.755859C14.3496 0.498047 14.5225 0.307617 14.6865 0.18457C14.8506 0.0615234 15.041 0 15.2578 0C15.4863 0 15.6797 0.0732422 15.8379 0.219727C16.002 0.366211 16.084 0.585937 16.084 0.878906V25.3389C16.084 25.8135 15.9375 26.1797 15.6445 26.4375C15.3574 26.7012 14.959 26.833 14.4492 26.833C13.957 26.833 13.5615 26.6953 13.2627 26.4199C12.9639 26.1445 12.8203 25.7461 12.832 25.2246L13.0693 16.875Z" fill="#F5F5F5" />
      </svg>
    ),
  },
];

export default function CreateSheet({ open, onClose }: CreateSheetProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Lock scroll & close on Escape while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        animation: "createFade 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(440px, 100vw)",
          background: COLORS.surface,
          paddingBottom: "max(16px, env(safe-area-inset-bottom))",
          animation: "createSlide 0.26s cubic-bezier(0.2,0.8,0.2,1)",
        }}
      >
        {/* Grabber */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 10 }}>
          <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.2)" }} />
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", color: "#F5F5F5", fontSize: 17, fontWeight: 700, fontFamily: FONT, padding: "14px 0 6px" }}>
          Create
        </div>

        {/* Options */}
        {options.map((o, i) => (
          <button
            key={o.href}
            onClick={() => go(o.href)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "18px 22px",
              background: "transparent",
              border: "none",
              borderTop: i === 0 ? "none" : "0.5px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            <span style={{ display: "flex", width: 24, justifyContent: "center" }}>{o.icon}</span>
            <span style={{ color: "#F5F5F5", fontSize: 16, fontWeight: 500 }}>{o.label}</span>
          </button>
        ))}
      </div>

      <style>{`
        @keyframes createFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes createSlide { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </div>,
    document.body
  );
}
