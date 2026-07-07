"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import { getSupabaseClient } from "@/config/supabase";
import { compressImage } from "@/services/image-compress";
import { estimateIngredientPrices, generateRecipeFromText } from "@/services/gemini-food";
import { COLORS } from "@/config/theme";
import { useProtectedRoute } from "@/hooks/use-protected-route";

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

const cardStyle: React.CSSProperties = {
  background: "#0A0A0A",
  borderRadius: 20,
  boxSizing: "border-box",
};

const primaryBtn: React.CSSProperties = {
  width: "100%",
  height: 54,
  borderRadius: 14,
  border: "none",
  background: COLORS.accent,
  color: COLORS.onAccent,
  fontSize: 16,
  fontWeight: 600,
  fontFamily: FONT,
  cursor: "pointer",
};

const addBtn: React.CSSProperties = {
  width: "100%",
  height: 50,
  borderRadius: 14,
  border: "1.5px dashed rgba(235,235,245,0.25)",
  background: "transparent",
  color: COLORS.accent,
  fontSize: 15,
  fontWeight: 600,
  fontFamily: FONT,
  cursor: "pointer",
};

interface Ingredient {
  name: string;
  amount: string;
  unit: "g" | "ml";
}

interface Step {
  text: string;
  ingredientIndex: number | null;
}

export default function CreateRecipePage() {
  useProtectedRoute();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [autoText, setAutoText] = useState("");

  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [kcal, setKcal] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const num = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  // ---- Photo ----
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      const compressed = await compressImage(file, { maxBytes: 3 * 1024 * 1024, square: true });
      setPhoto(compressed);
    } catch (err) {
      console.error("Failed to process image:", err);
      setError("Failed to process image. Try another photo.");
    }
  };

  // ---- Ingredients ----
  const addIngredient = () =>
    setIngredients((s) => [...s, { name: "", amount: "", unit: "g" }]);
  const removeIngredient = (i: number) =>
    setIngredients((s) => s.filter((_, idx) => idx !== i));
  const updateIngredient = (i: number, patch: Partial<Ingredient>) =>
    setIngredients((s) => s.map((ing, idx) => (idx === i ? { ...ing, ...patch } : ing)));

  // ---- Steps ----
  const addStep = () => setSteps((s) => [...s, { text: "", ingredientIndex: null }]);
  const removeStep = (i: number) => setSteps((s) => s.filter((_, idx) => idx !== i));
  const updateStep = (i: number, patch: Partial<Step>) =>
    setSteps((s) => s.map((st, idx) => (idx === i ? { ...st, ...patch } : st)));

  const handleAutoSave = async () => {
    setError("");
    if (!photo) { setError("Please add a photo."); return; }
    if (!autoText.trim()) { setError("Describe the recipe first."); return; }

    setSaving(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
      if (!user) { setError("Please sign in first"); setSaving(false); return; }

      const recipe = await generateRecipeFromText(autoText.trim());

      const ingredientsData = recipe.ingredients.map((i) => ({
        name: i.name,
        amount: i.amount,
        unit: i.unit,
        price: i.price,
      }));
      const stepsData = recipe.steps.map((s) => ({
        text: s.text,
        ingredient: s.ingredient || null,
      }));

      const { error: dbError } = await supabase.from("recipes").insert([{
        user_id: user.id,
        name: (name.trim() || recipe.name),
        ingredients: JSON.stringify(ingredientsData),
        instructions: JSON.stringify(stepsData),
        kcal: recipe.kcal,
        protein: recipe.protein,
        carbs: recipe.carbs,
        fat: recipe.fat,
        price: recipe.price,
        image_url: photo,
      }]);

      if (dbError) throw dbError;
      router.push("/recipe");
    } catch (err) {
      console.error("Failed to generate/save recipe:", err);
      setError("Failed to generate recipe. Try again.");
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setError("");
    if (!photo) { setError("Please add a photo."); return; }
    if (!name.trim()) { setError("Please enter a recipe name."); return; }
    if (ingredients.length === 0 || !ingredients.every((i) => i.name.trim() && i.amount.trim())) {
      setError("Add at least one ingredient with a name and amount.");
      return;
    }
    if (steps.length === 0 || !steps.every((s) => s.text.trim())) {
      setError("Add at least one cooking step.");
      return;
    }

    setSaving(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
      if (!user) { setError("Please sign in first"); setSaving(false); return; }

      // AI price estimate
      let prices: { items: { name: string; price: number }[]; total: number };
      try {
        prices = await estimateIngredientPrices(
          ingredients.map((i) => ({ name: i.name, amount: i.amount, unit: i.unit }))
        );
      } catch {
        prices = { items: ingredients.map((i) => ({ name: i.name, price: 0 })), total: 0 };
      }

      const ingredientsData = ingredients.map((ing, i) => ({
        name: ing.name.trim(),
        amount: ing.amount.trim(),
        unit: ing.unit,
        price: prices.items[i]?.price ?? 0,
      }));

      const stepsData = steps.map((s) => ({
        text: s.text.trim(),
        ingredient:
          s.ingredientIndex != null && ingredients[s.ingredientIndex]
            ? ingredients[s.ingredientIndex].name.trim()
            : null,
      }));

      const { error: dbError } = await supabase.from("recipes").insert([{
        user_id: user.id,
        name: name.trim(),
        ingredients: JSON.stringify(ingredientsData),
        instructions: JSON.stringify(stepsData),
        kcal: Math.round(num(kcal)),
        protein: Math.round(num(protein)),
        carbs: Math.round(num(carbs)),
        fat: Math.round(num(fat)),
        price: prices.total || 0,
        image_url: photo,
      }]);

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
      <Space size={8} />
      <ToolbarWin title="New recipe" />
      <Space size={10} />

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Photo */}
        <div>
          <label style={labelStyle}>Photo *</label>
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
              <img src={photo} alt="Recipe" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ color: "rgba(235,235,245,0.5)", fontSize: 15 }}>Tap to add a photo</span>
            )}
          </div>
        </div>

        {/* Name */}
        <div>
          <label style={labelStyle}>Recipe name {mode === "manual" ? "*" : "(optional)"}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Greek salad" style={fieldStyle} />
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", background: "rgba(118,118,128,0.24)", borderRadius: 12, padding: 3 }}>
          {(["manual", "auto"] as const).map((m) => {
            const active = mode === m;
            return (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                style={{
                  flex: 1, height: 40, borderRadius: 9, border: "none", cursor: "pointer",
                  background: active ? COLORS.accent : "transparent",
                  color: active ? COLORS.onAccent : "rgba(235,235,245,0.6)",
                  fontSize: 15, fontWeight: 600, fontFamily: FONT,
                  textTransform: "capitalize",
                }}
              >{m}</button>
            );
          })}
        </div>

        {/* AUTO mode — single description field */}
        {mode === "auto" && (
          <div>
            <label style={labelStyle}>Describe the recipe</label>
            <textarea
              value={autoText}
              onChange={(e) => setAutoText(e.target.value)}
              placeholder="List the ingredients, how to cook it… AI will fill in amounts, steps, calories, macros and prices."
              rows={6}
              style={{ ...fieldStyle, resize: "vertical" }}
            />
          </div>
        )}

        {/* MANUAL mode */}
        {mode === "manual" && (<>
        {/* Ingredients */}
        <div>
          <label style={labelStyle}>Ingredients *</label>
          {ingredients.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
              {ingredients.map((ing, i) => (
                <div key={i} style={{ ...cardStyle, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 30, height: 30, flexShrink: 0, borderRadius: 9,
                      background: "rgba(118,118,128,0.24)", color: "rgba(235,235,245,0.6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700,
                    }}>{i + 1}</div>
                    <input
                      value={ing.name}
                      onChange={(e) => updateIngredient(i, { name: e.target.value })}
                      placeholder="Ingredient name"
                      style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", color: "#F5F5F5", fontSize: 16, fontWeight: 600 }}
                    />
                    <button
                      onClick={() => removeIngredient(i)}
                      aria-label="Remove"
                      style={{
                        width: 30, height: 30, flexShrink: 0, borderRadius: 9, border: "none",
                        background: "rgba(255,69,58,0.12)", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 3l8 8M11 3l-8 8" stroke="#FF453A" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                    <input
                      value={ing.amount}
                      onChange={(e) => updateIngredient(i, { amount: e.target.value })}
                      placeholder="Amount"
                      inputMode="decimal"
                      style={{ ...fieldStyle, flex: 1, padding: "10px 12px", fontSize: 15 }}
                    />
                    <div style={{ display: "flex", background: "rgba(118,118,128,0.24)", borderRadius: 10, padding: 2, flexShrink: 0 }}>
                      {(["g", "ml"] as const).map((u) => {
                        const active = ing.unit === u;
                        return (
                          <button
                            key={u}
                            onClick={() => updateIngredient(i, { unit: u })}
                            style={{
                              width: 44, height: 36, borderRadius: 8, border: "none", cursor: "pointer",
                              background: active ? COLORS.accent : "transparent",
                              color: active ? COLORS.onAccent : "rgba(235,235,245,0.6)",
                              fontSize: 14, fontWeight: 600,
                            }}
                          >{u}</button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={addIngredient} style={addBtn}>+ Add ingredient</button>
        </div>

        {/* Steps */}
        <div>
          <label style={labelStyle}>Cooking steps *</label>
          {steps.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
              {steps.map((st, i) => (
                <div key={i} style={{ ...cardStyle, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: COLORS.accent, fontWeight: 700, fontSize: 15 }}>Step {i + 1}</span>
                    <button
                      onClick={() => removeStep(i)}
                      aria-label="Remove"
                      style={{
                        width: 24, height: 24, borderRadius: 12, border: "none",
                        background: "rgba(255,69,58,0.12)", color: "#FF453A", fontSize: 16, lineHeight: 1, cursor: "pointer",
                      }}
                    >×</button>
                  </div>
                  <textarea
                    value={st.text}
                    onChange={(e) => updateStep(i, { text: e.target.value })}
                    placeholder="Describe this step..."
                    rows={2}
                    style={{ ...fieldStyle, resize: "vertical", marginBottom: 8 }}
                  />
                  {ingredients.length > 0 && (
                    <select
                      value={st.ingredientIndex ?? ""}
                      onChange={(e) =>
                        updateStep(i, { ingredientIndex: e.target.value === "" ? null : Number(e.target.value) })
                      }
                      style={{ ...fieldStyle, padding: "10px 12px", fontSize: 14 }}
                    >
                      <option value="">Attach ingredient (optional)</option>
                      {ingredients.map((ing, idx) => (
                        <option key={idx} value={idx}>{ing.name || `Ingredient ${idx + 1}`}</option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          )}
          <button onClick={addStep} style={addBtn}>+ Add step</button>
        </div>

        {/* Nutrition */}
        <div>
          <label style={labelStyle}>Nutrition (optional)</label>
          <div style={{ marginBottom: 10 }}>
            <input value={kcal} onChange={(e) => setKcal(e.target.value)} inputMode="numeric" placeholder="Calories" style={fieldStyle} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input value={protein} onChange={(e) => setProtein(e.target.value)} inputMode="numeric" placeholder="Protein (g)" style={fieldStyle} />
            <input value={carbs} onChange={(e) => setCarbs(e.target.value)} inputMode="numeric" placeholder="Carbs (g)" style={fieldStyle} />
            <input value={fat} onChange={(e) => setFat(e.target.value)} inputMode="numeric" placeholder="Fat (g)" style={fieldStyle} />
          </div>
        </div>
        </>)}

        {error && <div style={{ color: "#FF453A", fontSize: 13 }}>{error}</div>}

        <button
          onClick={mode === "auto" ? handleAutoSave : handleSave}
          disabled={saving}
          style={{ ...primaryBtn, opacity: saving ? 0.6 : 1 }}
        >
          {saving
            ? mode === "auto" ? "Generating..." : "Saving..."
            : mode === "auto" ? "Generate & save" : "Save recipe"}
        </button>
      </div>

      <Space size={40} />
    </>
  );
}
