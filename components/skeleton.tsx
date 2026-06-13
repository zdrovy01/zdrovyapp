"use client";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

export default function Skeleton({ width = "100%", height = 20, borderRadius = 10, style }: SkeletonProps) {
  return (
    <div style={{
      width, height, borderRadius,
      background: "rgba(120,120,128,0.15)",
      animation: "skeleton-pulse 1.4s ease-in-out infinite",
      ...style,
    }} />
  );
}

export function SkeletonList({ rows = 4, gap = 12 }: { rows?: number; gap?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap, padding: "0 20px" }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Skeleton width={52} height={52} borderRadius="50%" />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <Skeleton width="55%" height={15} />
            <Skeleton width="35%" height={13} />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
