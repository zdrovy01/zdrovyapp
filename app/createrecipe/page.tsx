"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import { getSupabaseClient } from "@/config/supabase";
import { useProtectedRoute } from "@/hooks/use-protected-route";

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
  fontSize: 16,
  padding: "12px 14px",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

export default function CreateRecipePage() {
  useProtectedRoute();
  const router = useRouter();

  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const num = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter a recipe name");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const supabase = getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Please sign in first");
        setSaving(false);
        return;
      }

      const { error: dbError } = await supabase.from("recipes").insert([
        {
          user_id: user.id,
          name: name.trim(),
          ingredients: ingredients.trim() || null,
          instructions: instructions.trim() || null,
          kcal: Math.round(num(kcal)),
          protein: Math.round(num(protein)),
          carbs: Math.round(num(carbs)),
          fat: Math.round(num(fat)),
          price: num(price),
        },
      ]);

      if (dbError) throw dbError;
      router.push("/recipe");
    } catch (err) {
      console.error("Failed to save recipe:", err);
      setError("Failed to save recipe");
      setSaving(false);
    }
  };

  return (
    <>
      <Space size={40} />
      <ToolbarWin title="Create recipe" />
      <Space size={20} />

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Chicken salad"
            style={fieldStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Ingredients</label>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="List the ingredients..."
            rows={4}
            style={{ ...fieldStyle, resize: "vertical" }}
          />
        </div>

        <div>
          <label style={labelStyle}>Instructions</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="How to prepare it..."
            rows={5}
            style={{ ...fieldStyle, resize: "vertical" }}
          />
        </div>

        {/* Nutrition */}
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Calories</label>
            <input
              value={kcal}
              onChange={(e) => setKcal(e.target.value)}
              inputMode="numeric"
              placeholder="0"
              style={fieldStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Price</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              placeholder="0"
              style={fieldStyle}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Protein (g)</label>
            <input
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              inputMode="numeric"
              placeholder="0"
              style={fieldStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Carbs (g)</label>
            <input
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              inputMode="numeric"
              placeholder="0"
              style={fieldStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Fat (g)</label>
            <input
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              inputMode="numeric"
              placeholder="0"
              style={fieldStyle}
            />
          </div>
        </div>

        {error && (
          <div style={{ color: "#FF453A", fontSize: 13 }}>{error}</div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%",
            height: 56,
            borderRadius: 14,
            border: "none",
            background: "#0A84FF",
            color: "#fff",
            fontSize: 17,
            fontWeight: 600,
            cursor: saving ? "default" : "pointer",
            opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Saving..." : "Save recipe"}
        </button>
      </div>

      <Space size={40} />
    </>
  );
}
