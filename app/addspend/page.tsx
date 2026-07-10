"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import { getSupabaseClient } from "@/config/supabase";
import { cacheSet } from "@/hooks/use-cached";
import { useProtectedRoute } from "@/hooks/use-protected-route";

const FONT = "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif";

const labelStyle: React.CSSProperties = {
  color: "rgba(235,235,245,0.5)",
  fontSize: 12,
  marginBottom: 6,
  display: "block",
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(118,118,128,0.24)",
  border: "none",
  outline: "none",
  borderRadius: 10,
  color: "#F5F5F5",
  fontSize: 15,
  padding: "11px 13px",
  boxSizing: "border-box",
  fontFamily: FONT,
};

export default function AddSpendPage() {
  useProtectedRoute();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    const amt = parseFloat(amount.replace(",", "."));
    if (!title.trim()) { setError("Please enter a title."); return; }
    if (isNaN(amt) || amt <= 0) { setError("Please enter a valid amount."); return; }

    setSaving(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) { setError("Please sign in first"); setSaving(false); return; }

      const { error: dbError } = await supabase.from("spends").insert([{
        user_id: user.id,
        title: title.trim(),
        amount: Math.round(amt * 100) / 100,
        created_at: new Date().toISOString(),
      }]);

      if (dbError) throw dbError;

      // Invalidate cache so the list refetches fresh
      cacheSet(`spends:${user.id}`, undefined);
      router.push("/spends");
    } catch (err) {
      console.error("Failed to save spend:", err);
      setError("Failed to save. Try again.");
      setSaving(false);
    }
  };

  return (
    <>
      <Space size={8} />
      <ToolbarWin title="New spend" />
      <Space size={10} />

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Title */}
        <div>
          <label style={labelStyle}>Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Groceries"
            style={fieldStyle}
          />
        </div>

        {/* Amount */}
        <div>
          <label style={labelStyle}>Amount *</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="0.00"
            style={fieldStyle}
          />
        </div>

        {error && <div style={{ color: "#FF453A", fontSize: 13, fontFamily: FONT }}>{error}</div>}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%", height: 48, borderRadius: 12, border: "none",
            background: "#F5F5F5", color: "#000",
            fontSize: 16, fontWeight: 600, fontFamily: FONT,
            cursor: "pointer", opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Saving..." : "Save spend"}
        </button>
      </div>

      <Space size={24} />
    </>
  );
}
