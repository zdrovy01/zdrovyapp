"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import { useAuth } from "@/config/auth-context";
import { useProtectedRoute } from "@/hooks/use-protected-route";

const ZDROVY_HOSTS = ["app.zdrovy.com", "zdrovy.com"];

function resolveZdrovyUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (!ZDROVY_HOSTS.includes(url.hostname)) return null;
    if (url.hostname === "app.zdrovy.com") return url.pathname || "/";
    return null; // zdrovy.com links open externally
  } catch {
    return null;
  }
}

type Mode = "qr" | "scan";

const BOX = 280;
const BTN_BIG = 64;
const BTN_SMALL = 48;
const BAR_W = 150;
const BAR_H = 64;

const QrIcon = ({ color = "#fff" }: { color?: string }) => (
  <svg width="22" height="22" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.88477 7.82227C1.25977 7.82227 0.78776 7.66602 0.46875 7.35352C0.15625 7.04102 0 6.55924 0 5.9082V1.91406C0 1.26953 0.15625 0.791016 0.46875 0.478516C0.78776 0.159505 1.25977 0 1.88477 0H5.94727C6.57227 0 7.04102 0.159505 7.35352 0.478516C7.67253 0.791016 7.83203 1.26953 7.83203 1.91406V5.9082C7.83203 6.55924 7.67253 7.04102 7.35352 7.35352C7.04102 7.66602 6.57227 7.82227 5.94727 7.82227H1.88477ZM1.875 6.44531H5.94727C6.11003 6.44531 6.23047 6.40299 6.30859 6.31836C6.39323 6.23372 6.43555 6.10352 6.43555 5.92773V1.89453C6.43555 1.71875 6.39323 1.5918 6.30859 1.51367C6.23047 1.42904 6.11003 1.38672 5.94727 1.38672H1.875C1.71224 1.38672 1.58854 1.42904 1.50391 1.51367C1.42578 1.5918 1.38672 1.71875 1.38672 1.89453V5.92773C1.38672 6.10352 1.42578 6.23372 1.50391 6.31836C1.58854 6.40299 1.71224 6.44531 1.875 6.44531ZM3.10547 4.91211C2.98177 4.91211 2.91992 4.83724 2.91992 4.6875V3.125C2.91992 2.98828 2.98177 2.91992 3.10547 2.91992H4.7168C4.84701 2.91992 4.91211 2.98828 4.91211 3.125V4.6875C4.91211 4.83724 4.84701 4.91211 4.7168 4.91211H3.10547ZM11.1914 7.82227C10.5664 7.82227 10.0944 7.66602 9.77539 7.35352C9.46289 7.04102 9.30664 6.55924 9.30664 5.9082V1.91406C9.30664 1.26953 9.46289 0.791016 9.77539 0.478516C10.0944 0.159505 10.5664 0 11.1914 0H15.2539C15.8789 0 16.3477 0.159505 16.6602 0.478516C16.9792 0.791016 17.1387 1.26953 17.1387 1.91406V5.9082C17.1387 6.55924 16.9792 7.04102 16.6602 7.35352C16.3477 7.66602 15.8789 7.82227 15.2539 7.82227H11.1914ZM11.1914 6.44531H15.2734C15.4297 6.44531 15.5469 6.40299 15.625 6.31836C15.7031 6.23372 15.7422 6.10352 15.7422 5.92773V1.89453C15.7422 1.71875 15.7031 1.5918 15.625 1.51367C15.5469 1.42904 15.4297 1.38672 15.2734 1.38672H11.1914C11.0221 1.38672 10.8984 1.42904 10.8203 1.51367C10.7422 1.5918 10.7031 1.71875 10.7031 1.89453V5.92773C10.7031 6.10352 10.7422 6.23372 10.8203 6.31836C10.8984 6.40299 11.0221 6.44531 11.1914 6.44531ZM12.4609 4.91211C12.3372 4.91211 12.2754 4.83724 12.2754 4.6875V3.125C12.2754 2.98828 12.3372 2.91992 12.4609 2.91992H14.082C14.2057 2.91992 14.2676 2.98828 14.2676 3.125V4.6875C14.2676 4.83724 14.2057 4.91211 14.082 4.91211H12.4609ZM1.88477 17.1289C1.25977 17.1289 0.78776 16.9727 0.46875 16.6602C0.15625 16.3477 0 15.8691 0 15.2246V11.2207C0 10.5762 0.15625 10.0977 0.46875 9.78516C0.78776 9.47266 1.25977 9.31641 1.88477 9.31641H5.94727C6.57227 9.31641 7.04102 9.47266 7.35352 9.78516C7.67253 10.0977 7.83203 10.5762 7.83203 11.2207V15.2246C7.83203 15.8691 7.67253 16.3477 7.35352 16.6602C7.04102 16.9727 6.57227 17.1289 5.94727 17.1289H1.88477ZM1.875 15.752H5.94727C6.11003 15.752 6.23047 15.7096 6.30859 15.625C6.39323 15.5404 6.43555 15.4134 6.43555 15.2441V11.2109C6.43555 11.0352 6.39323 10.9049 6.30859 10.8203C6.23047 10.7357 6.11003 10.6934 5.94727 10.6934H1.875C1.71224 10.6934 1.58854 10.7357 1.50391 10.8203C1.42578 10.9049 1.38672 11.0352 1.38672 11.2109V15.2441C1.38672 15.4134 1.42578 15.5404 1.50391 15.625C1.58854 15.7096 1.71224 15.752 1.875 15.752ZM3.10547 14.2188C2.98177 14.2188 2.91992 14.1471 2.91992 14.0039V12.4316C2.91992 12.2949 2.98177 12.2266 3.10547 12.2266H4.7168C4.84701 12.2266 4.91211 12.2949 4.91211 12.4316V14.0039C4.91211 14.1471 4.84701 14.2188 4.7168 14.2188H3.10547ZM9.94141 11.748C9.82422 11.748 9.76562 11.6732 9.76562 11.5234V9.96094C9.76562 9.81771 9.82422 9.74609 9.94141 9.74609H11.5625C11.6927 9.74609 11.7578 9.81771 11.7578 9.96094V11.5234C11.7578 11.6732 11.6927 11.748 11.5625 11.748H9.94141ZM14.873 11.748C14.7493 11.748 14.6875 11.6732 14.6875 11.5234V9.96094C14.6875 9.81771 14.7493 9.74609 14.873 9.74609H16.4844C16.6211 9.74609 16.6895 9.81771 16.6895 9.96094V11.5234C16.6895 11.6732 16.6211 11.748 16.4844 11.748H14.873ZM12.4316 14.209C12.3079 14.209 12.2461 14.1341 12.2461 13.9844V12.4219C12.2461 12.2786 12.3079 12.207 12.4316 12.207H14.043C14.1797 12.207 14.248 12.2786 14.248 12.4219V13.9844C14.248 14.1341 14.1797 14.209 14.043 14.209H12.4316ZM9.94141 16.6699C9.82422 16.6699 9.76562 16.5951 9.76562 16.4453V14.8828C9.76562 14.7396 9.82422 14.668 9.94141 14.668H11.5625C11.6927 14.668 11.7578 14.7396 11.7578 14.8828V16.4453C11.7578 16.5951 11.6927 16.6699 11.5625 16.6699H9.94141ZM14.873 16.6699C14.7493 16.6699 14.6875 16.5951 14.6875 16.4453V14.8828C14.6875 14.7396 14.7493 14.668 14.873 14.668H16.4844C16.6211 14.668 16.6895 14.7396 16.6895 14.8828V16.4453C16.6895 16.5951 16.6211 16.6699 16.4844 16.6699H14.873Z" fill={color} />
  </svg>
);

const ScanIcon = ({ color = "#fff" }: { color?: string }) => (
  <svg width="22" height="22" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 5.19531V3.44727C0 2.38607 0.30599 1.54622 0.917969 0.927734C1.52995 0.309245 2.36979 0 3.4375 0H5.22461C5.45247 0 5.64779 0.0813802 5.81055 0.244141C5.97331 0.406901 6.05469 0.602214 6.05469 0.830078C6.05469 1.05143 5.97331 1.24349 5.81055 1.40625C5.64779 1.56901 5.45247 1.65039 5.22461 1.65039H3.4375C2.8776 1.65039 2.43815 1.8099 2.11914 2.12891C1.80664 2.44792 1.65039 2.88737 1.65039 3.44727V5.19531C1.65039 5.41667 1.56901 5.60872 1.40625 5.77148C1.24349 5.93424 1.04818 6.01562 0.820312 6.01562C0.598958 6.01562 0.406901 5.93424 0.244141 5.77148C0.0813802 5.60872 0 5.41667 0 5.19531ZM18.2031 5.19531C18.2031 5.41667 18.1217 5.60872 17.959 5.77148C17.7962 5.93424 17.6042 6.01562 17.3828 6.01562C17.1615 6.01562 16.9694 5.93424 16.8066 5.77148C16.6439 5.60872 16.5625 5.41667 16.5625 5.19531V3.44727C16.5625 2.88737 16.403 2.44792 16.084 2.12891C15.7715 1.8099 15.332 1.65039 14.7656 1.65039H12.9785C12.7507 1.65039 12.5553 1.56901 12.3926 1.40625C12.2363 1.24349 12.1582 1.05143 12.1582 0.830078C12.1582 0.602214 12.2363 0.406901 12.3926 0.244141C12.5553 0.0813802 12.7507 0 12.9785 0H14.7656C15.8333 0 16.6732 0.309245 17.2852 0.927734C17.8971 1.54622 18.2031 2.38607 18.2031 3.44727V5.19531ZM0 13.0176C0 12.7962 0.0813802 12.6042 0.244141 12.4414C0.406901 12.2786 0.598958 12.1973 0.820312 12.1973C1.04818 12.1973 1.24349 12.2786 1.40625 12.4414C1.56901 12.6042 1.65039 12.7962 1.65039 13.0176V14.7656C1.65039 15.3255 1.80664 15.765 2.11914 16.084C2.43815 16.403 2.8776 16.5625 3.4375 16.5625H5.22461C5.45247 16.5625 5.64779 16.6439 5.81055 16.8066C5.97331 16.9694 6.05469 17.1615 6.05469 17.3828C6.05469 17.6107 5.97331 17.8027 5.81055 17.959C5.64779 18.1217 5.45247 18.2031 5.22461 18.2031H3.4375C2.36979 18.2031 1.52995 17.8939 0.917969 17.2754C0.30599 16.6634 0 15.8268 0 14.7656V13.0176ZM18.2031 13.0176V14.7656C18.2031 15.8268 17.8971 16.6634 17.2852 17.2754C16.6732 17.8939 15.8333 18.2031 14.7656 18.2031H12.9785C12.7507 18.2031 12.5553 18.1217 12.3926 17.959C12.2363 17.8027 12.1582 17.6107 12.1582 17.3828C12.1582 17.1615 12.2363 16.9694 12.3926 16.8066C12.5553 16.6439 12.7507 16.5625 12.9785 16.5625H14.7656C15.332 16.5625 15.7715 16.403 16.084 16.084C16.403 15.765 16.5625 15.3255 16.5625 14.7656V13.0176C16.5625 12.7962 16.6439 12.6042 16.8066 12.4414C16.9694 12.2786 17.1615 12.1973 17.3828 12.1973C17.6042 12.1973 17.7962 12.2786 17.959 12.4414C18.1217 12.6042 18.2031 12.7962 18.2031 13.0176ZM5.08789 13.5156C4.9707 13.5156 4.87305 13.4766 4.79492 13.3984C4.7168 13.3203 4.67773 13.2227 4.67773 13.1055V9.90234C4.67773 9.78516 4.7168 9.6875 4.79492 9.60938C4.87305 9.53125 4.9707 9.49219 5.08789 9.49219H8.30078C8.41146 9.49219 8.50586 9.53125 8.58398 9.60938C8.66211 9.6875 8.70117 9.78516 8.70117 9.90234V13.1055C8.70117 13.2227 8.66211 13.3203 8.58398 13.3984C8.50586 13.4766 8.41146 13.5156 8.30078 13.5156H5.08789ZM5.47852 12.7148H7.89062V10.293H5.47852V12.7148ZM6.19141 12.0117V11.0059H7.19727V12.0117H6.19141ZM5.08789 8.69141C4.9707 8.69141 4.87305 8.6556 4.79492 8.58398C4.7168 8.50586 4.67773 8.4082 4.67773 8.29102V5.08789C4.67773 4.96419 4.7168 4.86654 4.79492 4.79492C4.87305 4.7168 4.9707 4.67773 5.08789 4.67773H8.30078C8.41146 4.67773 8.50586 4.7168 8.58398 4.79492C8.66211 4.86654 8.70117 4.96419 8.70117 5.08789V8.29102C8.70117 8.4082 8.66211 8.50586 8.58398 8.58398C8.50586 8.6556 8.41146 8.69141 8.30078 8.69141H5.08789ZM5.47852 7.89062H7.89062V5.46875H5.47852V7.89062ZM6.19141 7.1875V6.17188H7.19727V7.1875H6.19141ZM9.90234 8.69141C9.78516 8.69141 9.6875 8.6556 9.60938 8.58398C9.53125 8.50586 9.49219 8.4082 9.49219 8.29102V5.08789C9.49219 4.96419 9.53125 4.86654 9.60938 4.79492C9.6875 4.7168 9.78516 4.67773 9.90234 4.67773H13.1152C13.2324 4.67773 13.3301 4.7168 13.4082 4.79492C13.4863 4.86654 13.5254 4.96419 13.5254 5.08789V8.29102C13.5254 8.4082 13.4863 8.50586 13.4082 8.58398C13.3301 8.6556 13.2324 8.69141 13.1152 8.69141H9.90234ZM10.293 7.89062H12.7148V5.46875H10.293V7.89062ZM11.0059 7.1875V6.17188H12.0117V7.1875H11.0059ZM9.60938 13.3887V12.3926H10.6152V13.3887H9.60938ZM12.3926 13.3887V12.3926H13.4082V13.3887H12.3926ZM11.0059 12.0117V11.0059H12.0117V12.0117H11.0059ZM9.60938 10.6152V9.60938H10.6152V10.6152H9.60938ZM12.3926 10.6152V9.60938H13.4082V10.6152H12.3926Z" fill={color} />
  </svg>
);

export default function QrPage() {
  useProtectedRoute();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("qr");
  const [scanResult, setScanResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const scannedRef = useRef(false);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const handleDetected = useCallback((data: string) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    stopCamera();

    const internalPath = resolveZdrovyUrl(data);
    if (internalPath) {
      setScanResult(null);
      router.push(internalPath);
    } else {
      setScanResult(data);
    }
  }, [router, stopCamera]);

  // Scan loop using BarcodeDetector or jsQR
  const startScanLoop = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Try native BarcodeDetector first
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const BarcodeDetector = (window as any).BarcodeDetector;
    if (BarcodeDetector) {
      const detector = new BarcodeDetector({ formats: ["qr_code"] });
      const tick = async () => {
        if (scannedRef.current || !videoRef.current) return;
        try {
          const codes = await detector.detect(video);
          if (codes.length > 0) { handleDetected(codes[0].rawValue); return; }
        } catch { /* ignore */ }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    // Fallback: jsQR
    const jsQR = (await import("jsqr")).default;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const tick = () => {
      if (scannedRef.current || !videoRef.current) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(img.data, img.width, img.height);
      if (code) { handleDetected(code.data); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [handleDetected]);

  // Manage the camera stream when in scan mode
  useEffect(() => {
    let cancelled = false;
    scannedRef.current = false;
    setScanResult(null);

    if (mode === "scan") {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
          if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
            const v = videoRef.current;
            const tryStart = () => { if (v.readyState >= 2) startScanLoop(); else v.onloadeddata = () => startScanLoop(); };
            if (v.readyState >= 2) startScanLoop(); else v.onloadedmetadata = tryStart;
          }
        })
        .catch((err) => console.error("Camera error:", err));
    } else {
      stopCamera();
    }

    return () => {
      cancelled = true;
      stopCamera();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  if (loading) {
    return <div style={{ color: "white", padding: 20 }}>Loading...</div>;
  }
  if (!user) return null;

  const username = user.username || "user";
  const link = `app.zdrovy.com/${username}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=520x520&ecc=H&margin=0&data=${encodeURIComponent(
    `https://${link}`
  )}`;
  const AVATAR_SIZE = 64;
  const initial = (user.name || username || "?").trim().charAt(0).toUpperCase();

  // Button geometry (absolute positions inside the bar)
  const activeLeft = (BAR_W - BTN_BIG) / 2;
  const inactiveLeft = BAR_W - BTN_SMALL;
  const btnStyle = (isActive: boolean): React.CSSProperties => ({
    position: "absolute",
    top: isActive ? 0 : (BAR_H - BTN_SMALL) / 2,
    left: isActive ? activeLeft : inactiveLeft,
    width: isActive ? BTN_BIG : BTN_SMALL,
    height: isActive ? BTN_BIG : BTN_SMALL,
    borderRadius: 16,
    border: "none",
    background: isActive ? "#fff" : "rgba(120,120,128,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
    zIndex: isActive ? 2 : 1,
  });

  return (
    <>
      <Space size={40} />
      <ToolbarWin title={`@${username}`} />
      <Space size={10} />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 20px",
        }}
      >
        {/* Content box: QR or camera */}
        <div
          style={{
            position: "relative",
            width: BOX,
            height: BOX,
            borderRadius: 24,
            overflow: "hidden",
            background: mode === "qr" ? "#FFFFFF" : "#000",
          }}
        >
          {mode === "qr" ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                padding: 20,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrSrc}
                alt="QR code"
                style={{ width: "100%", height: "100%", display: "block" }}
              />
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
          ) : (
            <>
              <video
                ref={videoRef}
                muted
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </>
          )}
        </div>

        <Space size={28} />

        {/* Explanatory text */}
        <div
          style={{
            color: "#fff",
            fontSize: 22,
            fontWeight: 700,
            textAlign: "center",
            lineHeight: 1.25,
            maxWidth: 300,
          }}
        >
          {mode === "qr"
            ? "Let a friend scan this code to open your Zdrovy profile"
            : "Point the camera at a Zdrovy code to open someone's profile"}
        </div>
        {mode === "qr" && (
          <div style={{ color: "rgba(235,235,245,0.45)", fontSize: 14, marginTop: 8 }}>
            {link}
          </div>
        )}
        {mode === "scan" && scanResult && (
          <div style={{
            marginTop: 16, padding: "12px 16px", borderRadius: 14,
            background: "rgba(255,255,255,0.08)", maxWidth: BOX,
            color: "rgba(235,235,245,0.7)", fontSize: 13, wordBreak: "break-all", textAlign: "center",
          }}>
            {scanResult}
          </div>
        )}

        <Space size={40} />

        {/* Mode switch buttons */}
        <div style={{ position: "relative", width: BAR_W, height: BAR_H }}>
          <button
            aria-label="My QR code"
            onClick={() => setMode("qr")}
            style={btnStyle(mode === "qr")}
          >
            <QrIcon color={mode === "qr" ? "#000" : "#fff"} />
          </button>
          <button
            aria-label="Scan a code"
            onClick={() => setMode("scan")}
            style={btnStyle(mode === "scan")}
          >
            <ScanIcon color={mode === "scan" ? "#000" : "#fff"} />
          </button>
        </div>
      </div>
    </>
  );
}
