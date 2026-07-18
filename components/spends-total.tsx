"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseClient } from "@/config/supabase";
import { useAuth } from "@/config/auth-context";
import { useCached } from "@/hooks/use-cached";
import { useCurrencySymbol } from "@/config/currency";

const FONT = "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif";

// Eases the displayed number from its current value up to `target`.
function useCountUp(target: number, duration = 900): number {
  const [val, setVal] = useState(0);
  const valRef = useRef(0);
  valRef.current = val;

  useEffect(() => {
    const from = valRef.current;
    if (from === target) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(from + (target - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setVal(target);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return val;
}

export default function SpendsTotal() {
  const { user } = useAuth();
  const sym = useCurrencySymbol();

  const { data } = useCached<{ month: number; last: { title: string; amount: number } | null }>(
    `spends-month:${user?.id || "none"}`,
    async () => {
      if (!user) return { month: 0, last: null };
      const supabase = getSupabaseClient();
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - 1);

      const { data: rows } = await supabase
        .from("spends")
        .select("title, amount, created_at")
        .eq("user_id", user.id)
        .gte("created_at", monthStart.toISOString())
        .order("created_at", { ascending: false });

      const list = rows || [];
      const month = list.reduce((sum, r) => sum + (r.amount || 0), 0);
      const last = list[0] ? { title: list[0].title, amount: list[0].amount || 0 } : null;
      return { month, last };
    },
    { month: 0, last: null }
  );

  const anim = useCountUp(data.month);

  return (
    <span style={{ display: "flex", width: "100%", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
      <span style={{ color: "#fff", fontSize: 22, fontWeight: 700, fontFamily: FONT, lineHeight: 1 }}>
        {sym}{anim.toFixed(2)}
      </span>
      {data.last && (
        <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, minWidth: 0, textAlign: "right" }}>
          <span style={{ color: "rgba(235,235,245,0.4)", fontSize: 10, fontFamily: FONT, lineHeight: 1 }}>
            Last
          </span>
          <span
            style={{
              color: "rgba(235,235,245,0.7)",
              fontSize: 12,
              fontFamily: FONT,
              lineHeight: 1.1,
              maxWidth: "100%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {data.last.title} · {sym}{data.last.amount.toFixed(2)}
          </span>
        </span>
      )}
    </span>
  );
}
