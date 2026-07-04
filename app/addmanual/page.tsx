"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import { getSupabaseClient } from "@/config/supabase";
import { compressImage } from "@/services/image-compress";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { COLORS } from "@/config/theme";

const FONT = "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif";

const labelStyle: React.CSSProperties = {
  color: "rgba(235,235,245,0.5)",
  fontSize: 12,
  marginBottom: 8,
  display: "block",
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(118,118,128,0.24)",
  border: "none",
  outline: "none",
  borderRadius: 10,
  color: "#F5F5F5",
  fontSize: 16,
  padding: "12px 14px",
  boxSizing: "border-box",
  fontFamily: FONT,
};

export default function AddManualPage() {
  useProtectedRoute();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const num = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      const dataUrl = await compressImage(file, { maxBytes: 3 * 1024 * 1024, square: true });
      setPhoto(dataUrl);
    } catch (err) {
      console.error("Failed to process image:", err);
      setError("Failed to process image. Try another photo.");
    }
  };

  const handleSave = async () => {
    setError("");
    if (!name.trim()) { setError("Please enter a title."); return; }

    setSaving(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
      if (!user) { setError("Please sign in first"); setSaving(false); return; }

      const { error: dbError } = await supabase.from("food_logs").insert([{
        user_id: user.id,
        name: name.trim(),
        kcal: Math.round(num(kcal)),
        protein: Math.round(num(protein)),
        carbs: Math.round(num(carbs)),
        fat: Math.round(num(fat)),
        price: 0,
        image_url: photo,
        created_at: new Date().toISOString(),
      }]);

      if (dbError) throw dbError;
      router.push("/log");
    } catch (err) {
      console.error("Failed to save log:", err);
      setError("Failed to save log");
      setSaving(false);
    }
  };

  return (
    <>
      <Space size={40} />
      <ToolbarWin title="Manual log" />
      <Space size={16} />

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Photo (optional) */}
        <div>
          <label style={labelStyle}>Photo (optional)</label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: "none" }} />
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "100%", aspectRatio: "1 / 1", borderRadius: 20,
              background: "rgba(118,118,128,0.24)",
              border: photo ? "none" : "1.5px dashed rgba(235,235,245,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", overflow: "hidden", boxSizing: "border-box",
            }}
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="Meal" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ color: "rgba(235,235,245,0.5)", fontSize: 15 }}>Tap to add a photo</span>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label style={labelStyle}>Title *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chicken salad" style={fieldStyle} />
        </div>

        {/* Calories */}
        <div>
          <label style={labelStyle}>Calories</label>
          <input value={kcal} onChange={(e) => setKcal(e.target.value)} inputMode="numeric" placeholder="0" style={fieldStyle} />
        </div>

        {/* Macros */}
        <div>
          <label style={labelStyle}>Macros (g)</label>
          <div style={{ display: "flex", gap: 10 }}>
            <input value={protein} onChange={(e) => setProtein(e.target.value)} inputMode="numeric" placeholder="Protein" style={fieldStyle} />
            <input value={carbs} onChange={(e) => setCarbs(e.target.value)} inputMode="numeric" placeholder="Carbs" style={fieldStyle} />
            <input value={fat} onChange={(e) => setFat(e.target.value)} inputMode="numeric" placeholder="Fat" style={fieldStyle} />
          </div>
        </div>

        {error && <div style={{ color: "#FF453A", fontSize: 13 }}>{error}</div>}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%", height: 54, borderRadius: 14, border: "none",
            background: COLORS.accent, color: COLORS.onAccent,
            fontSize: 16, fontWeight: 600, fontFamily: FONT,
            cursor: "pointer", opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Saving..." : "Save log"}
        </button>
      </div>

      <Space size={40} />
    </>
  );
}
