"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Sheet.module.css";

export default function Sheet({
  open,
  onClose,
  title,
  children,
  peek = 17, // % from top when the sheet rests (17 = ~83% tall)
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  peek?: number;
}) {
  const PEEK = peek;
  const [pct, setPct] = useState(100); // 0 full, PEEK peek, 100 closed
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startY: 0, startPct: 0, lastPct: 100 });

  useEffect(() => {
    setPct(open ? PEEK : 100);
  }, [open, PEEK]);

  const onDown = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { active: true, startY: e.clientY, startPct: pct, lastPct: pct };
    el.style.transition = "none";
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const el = ref.current;
    if (!el) return;
    const dy = ((e.clientY - drag.current.startY) / window.innerHeight) * 100;
    const p = Math.min(100, Math.max(0, drag.current.startPct + dy));
    drag.current.lastPct = p;
    el.style.transform = `translateY(${p}%)`;
  };
  const onUp = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const el = ref.current;
    if (el) el.style.transition = "";
    const p = drag.current.lastPct;
    let target: number;
    if (p <= PEEK / 2) target = 0;
    else if (p >= (PEEK + 100) / 2) target = 100;
    else target = PEEK;
    if (target === 100) onClose();
    else setPct(target);
  };

  return (
    <>
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ""}`}
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={ref}
        className={styles.sheet}
        style={{ transform: `translateY(${pct}%)` }}
        aria-hidden={!open}
      >
        <div
          className={styles.dragZone}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <span className={styles.handle} aria-hidden />
        </div>
        <button
          type="button"
          className={styles.close}
          aria-label="Close"
          onClick={onClose}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className={styles.body}>
          {title && <h1 className={styles.title}>{title}</h1>}
          {children}
        </div>
      </div>
    </>
  );
}
