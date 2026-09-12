"use client";

import styles from "./TypedText.module.css";

export default function TypedText({
  text,
  className,
  step = 0.045,
}: {
  text: string;
  className?: string;
  step?: number;
}) {
  return (
    <p className={`${styles.wrap} ${className ?? ""}`} aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          className={styles.char}
          style={{ animationDelay: `${(i * step).toFixed(3)}s` }}
          aria-hidden
        >
          {ch}
        </span>
      ))}
    </p>
  );
}
