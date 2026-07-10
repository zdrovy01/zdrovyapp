"use client";

import { useEffect, useRef, useState } from "react";
import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import { getSupabaseClient } from "@/config/supabase";
import { useAuth } from "@/config/auth-context";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { useCached } from "@/hooks/use-cached";

const FONT = "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif";

const CURRENCY_SYMBOL: Record<string, string> = { USD: "$", EUR: "€", PLN: "zł" };

function currencySymbol(): string {
  if (typeof window === "undefined") return "$";
  return CURRENCY_SYMBOL[localStorage.getItem("zdrovy-currency") || "USD"] || "$";
}

interface Spend {
  id: string;
  title: string;
  amount: number;
  created_at: string;
}

interface SpendData {
  today: number;
  week: number;
  month: number;
  items: Spend[];
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

function computeTotals(items: Spend[]): SpendData {
  const now = Date.now();
  const dayStart = startOfDay(new Date());
  const weekStart = dayStart - 6 * 24 * 60 * 60 * 1000;
  let today = 0, week = 0, month = 0;
  for (const r of items) {
    const t = new Date(r.created_at).getTime();
    const p = r.amount || 0;
    month += p;
    if (t >= weekStart) week += p;
    if (t >= dayStart && t <= now) today += p;
  }
  return { today, week, month, items };
}

// Eases the displayed number from its current value up (or down) to `target`.
function useCountUp(target: number, duration = 800): number {
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

export default function SpendsPage() {
  useProtectedRoute();
  const { user } = useAuth();
  const sym = currencySymbol();

  const { data, loading, setData } = useCached<SpendData>(
    `spends:${user?.id || "none"}`,
    async () => {
      if (!user) return computeTotals([]);
      const supabase = getSupabaseClient();

      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - 1);

      const { data: rows } = await supabase
        .from("spends")
        .select("id, title, amount, created_at")
        .eq("user_id", user.id)
        .gte("created_at", monthStart.toISOString())
        .order("created_at", { ascending: false });

      return computeTotals((rows as Spend[]) || []);
    },
    { today: 0, week: 0, month: 0, items: [] }
  );

  const monthAnim = useCountUp(data.month);
  const todayAnim = useCountUp(data.today);
  const weekAnim = useCountUp(data.week);

  const fmt = (n: number) => `${sym}${n.toFixed(2)}`;
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const handleDelete = async (id: string) => {
    const newItems = data.items.filter((x) => x.id !== id);
    setData(computeTotals(newItems)); // optimistic
    try {
      await getSupabaseClient().from("spends").delete().eq("id", id);
    } catch (err) {
      console.error("Failed to delete spend:", err);
    }
  };

  return (
    <>
      <Space size={8} />
      <ToolbarWin
        title="Spends"
        href1="/addspend"
        icon1={
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3.5v13M3.5 10h13" stroke="#F5F5F5" strokeWidth="2" strokeLinecap="round" />
          </svg>
        }
      />
      <Space size={10} />

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Month total */}
        <div style={{ background: "#0A0A0A", borderRadius: 16, padding: "18px 20px" }}>
          <div style={{ color: "rgba(235,235,245,0.5)", fontSize: 13, fontFamily: FONT }}>Last 30 days</div>
          <div style={{ color: "#F5F5F5", fontSize: 34, fontWeight: 700, fontFamily: FONT, marginTop: 4 }}>
            {fmt(monthAnim)}
          </div>
        </div>

        {/* Today / Week */}
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { label: "Today", value: todayAnim },
            { label: "This week", value: weekAnim },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, background: "#0A0A0A", borderRadius: 16, padding: "14px 16px" }}>
              <div style={{ color: "rgba(235,235,245,0.5)", fontSize: 12, fontFamily: FONT }}>{s.label}</div>
              <div style={{ color: "#F5F5F5", fontSize: 20, fontWeight: 700, fontFamily: FONT, marginTop: 2 }}>
                {fmt(s.value)}
              </div>
            </div>
          ))}
        </div>

        {/* Recent purchases */}
        <div style={{ color: "rgba(235,235,245,0.5)", fontSize: 12, fontFamily: FONT, marginTop: 6 }}>
          Recent purchases
        </div>

        {loading && data.items.length === 0 ? (
          <div style={{ color: "rgba(235,235,245,0.4)", fontSize: 14, fontFamily: FONT, textAlign: "center", padding: "20px 0" }}>
            Loading…
          </div>
        ) : data.items.length === 0 ? (
          <div style={{ color: "rgba(235,235,245,0.35)", fontSize: 14, fontFamily: FONT, textAlign: "center", padding: "24px 0" }}>
            No spending yet
          </div>
        ) : (
          <div style={{ background: "#0A0A0A", borderRadius: 16, overflow: "hidden" }}>
            {data.items.map((it, i) => (
              <div
                key={it.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "13px 16px",
                  borderTop: i === 0 ? "none" : "0.5px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ minWidth: 0, marginRight: 12 }}>
                  <div style={{ color: "#F5F5F5", fontSize: 15, fontWeight: 500, fontFamily: FONT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {it.title}
                  </div>
                  <div style={{ color: "rgba(235,235,245,0.4)", fontSize: 12, fontFamily: FONT }}>
                    {fmtDate(it.created_at)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <div style={{ color: "#F5F5F5", fontSize: 15, fontWeight: 600, fontFamily: FONT }}>
                    {fmt(it.amount)}
                  </div>
                  <button
                    onClick={() => handleDelete(it.id)}
                    aria-label="Delete"
                    style={{
                      width: 28, height: 28, flexShrink: 0, borderRadius: "50%", border: "none",
                      background: "rgba(255,255,255,0.08)", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <path d="M3 3l8 8M11 3l-8 8" stroke="rgba(235,235,245,0.6)" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Space size={24} />
    </>
  );
}
