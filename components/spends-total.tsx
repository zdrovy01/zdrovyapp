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

  const { data: month } = useCached<number>(
    `spends-month:${user?.id || "none"}`,
    async () => {
      if (!user) return 0;
      const supabase = getSupabaseClient();
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - 1);

      const { data } = await supabase
        .from("spends")
        .select("amount")
        .eq("user_id", user.id)
        .gte("created_at", monthStart.toISOString());

      return (data || []).reduce((sum, r) => sum + (r.amount || 0), 0);
    },
    0
  );

  const anim = useCountUp(month);

  return (
    <span style={{ color: "#fff", fontSize: 22, fontWeight: 700, fontFamily: FONT, lineHeight: 1 }}>
      {sym}{anim.toFixed(2)}
    </span>
  );
}
