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

const cameraIcon = (
  <svg width="28" height="22" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.0039 8.625C23.3867 8.61719 23.7148 8.47656 23.9883 8.20312C24.2617 7.92969 24.3984 7.59766 24.3984 7.20703C24.3984 6.82422 24.2617 6.49609 23.9883 6.22266C23.7148 5.94922 23.3867 5.8125 23.0039 5.8125C22.6133 5.8125 22.2773 5.94922 21.9961 6.22266C21.7227 6.49609 21.5859 6.82422 21.5859 7.20703C21.5859 7.59766 21.7227 7.93359 21.9961 8.21484C22.2773 8.48828 22.6133 8.625 23.0039 8.625ZM3.5625 21.2812C2.39062 21.2812 1.50391 20.9844 0.902344 20.3906C0.300781 19.8047 0 18.9297 0 17.7656V6.15234C0 4.98828 0.300781 4.10938 0.902344 3.51562C1.50391 2.92187 2.39062 2.625 3.5625 2.625H6.5625C6.99219 2.625 7.30859 2.57422 7.51172 2.47266C7.72266 2.37109 7.96094 2.18359 8.22656 1.91016L9.10547 0.9375C9.38672 0.632812 9.69531 0.402344 10.0312 0.246094C10.3672 0.0820312 10.8164 0 11.3789 0H15.8672C16.4375 0 16.8906 0.0820312 17.2266 0.246094C17.5625 0.402344 17.8672 0.632812 18.1406 0.9375L19.0312 1.91016C19.2031 2.08984 19.3594 2.23438 19.5 2.34375C19.6484 2.44531 19.8086 2.51953 19.9805 2.56641C20.1602 2.60547 20.3984 2.625 20.6953 2.625H23.7539C24.9258 2.625 25.8125 2.92187 26.4141 3.51562C27.0156 4.10938 27.3164 4.98828 27.3164 6.15234V17.7656C27.3164 18.9297 27.0156 19.8047 26.4141 20.3906C25.8125 20.9844 24.9258 21.2812 23.7539 21.2812H3.5625ZM13.6641 17.918C14.7734 17.918 15.7812 17.6484 16.6875 17.1094C17.6016 16.5703 18.3281 15.8477 18.8672 14.9414C19.4062 14.0273 19.6758 13.0117 19.6758 11.8945C19.6758 10.7695 19.4062 9.75391 18.8672 8.84766C18.3281 7.94141 17.6016 7.21875 16.6875 6.67969C15.7812 6.13281 14.7734 5.85938 13.6641 5.85938C12.5547 5.85938 11.543 6.13281 10.6289 6.67969C9.71484 7.21875 8.98828 7.94141 8.44922 8.84766C7.91797 9.75391 7.65234 10.7695 7.65234 11.8945C7.65234 13.0117 7.91797 14.0273 8.44922 14.9414C8.98828 15.8477 9.71484 16.5703 10.6289 17.1094C11.543 17.6484 12.5547 17.918 13.6641 17.918ZM13.6641 16.0781C12.8906 16.0781 12.1875 15.8906 11.5547 15.5156C10.9297 15.1406 10.4258 14.6367 10.043 14.0039C9.66797 13.3711 9.48047 12.668 9.48047 11.8945C9.48047 11.1133 9.66797 10.4062 10.043 9.77344C10.418 9.14062 10.9219 8.64062 11.5547 8.27344C12.1875 7.89844 12.8906 7.71094 13.6641 7.71094C14.4375 7.71094 15.1367 7.89844 15.7617 8.27344C16.3945 8.64062 16.8984 9.14062 17.2734 9.77344C17.6562 10.4062 17.8477 11.1133 17.8477 11.8945C17.8477 12.668 17.6562 13.3711 17.2734 14.0039C16.8984 14.6367 16.3945 15.1406 15.7617 15.5156C15.1367 15.8906 14.4375 16.0781 13.6641 16.0781Z" fill="rgba(235,235,245,0.5)"/>
  </svg>
);

const FONT = "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif";

// Monochrome selected-segment fill (iOS-style)
const SEG_ACTIVE = "rgba(120,120,128,0.5)";

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

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "0.5px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  boxSizing: "border-box",
};

const primaryBtn: React.CSSProperties = {
  width: "100%",
  height: 48,
  borderRadius: 12,
  border: "none",
  background: "#F5F5F5",
  color: "#000",
  fontSize: 16,
  fontWeight: 600,
  fontFamily: FONT,
  cursor: "pointer",
};

const addBtn: React.CSSProperties = {
  width: "100%",
  height: 44,
  borderRadius: 12,
  border: "1px dashed rgba(235,235,245,0.22)",
  background: "transparent",
  color: "rgba(235,235,245,0.7)",
  fontSize: 14,
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

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Photo */}
        <div>
          <label style={labelStyle}>Photo *</label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: "none" }} />
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "100%", aspectRatio: "16 / 7", borderRadius: 14,
              background: COLORS.surface,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", overflow: "hidden", boxSizing: "border-box",
            }}
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="Recipe" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              cameraIcon
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
                  flex: 1, height: 36, borderRadius: 9, border: "none", cursor: "pointer",
                  background: active ? SEG_ACTIVE : "transparent",
                  color: active ? "#F5F5F5" : "rgba(235,235,245,0.6)",
                  fontSize: 14, fontWeight: 600, fontFamily: FONT,
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
                <div key={i} style={{ ...cardStyle, padding: 12 }}>
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
                        background: "rgba(255,255,255,0.08)", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 3l8 8M11 3l-8 8" stroke="rgba(235,235,245,0.6)" strokeWidth="1.8" strokeLinecap="round" />
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
                              width: 44, height: 34, borderRadius: 8, border: "none", cursor: "pointer",
                              background: active ? SEG_ACTIVE : "transparent",
                              color: active ? "#F5F5F5" : "rgba(235,235,245,0.6)",
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
                <div key={i} style={{ ...cardStyle, padding: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#F5F5F5", fontWeight: 700, fontSize: 14 }}>Step {i + 1}</span>
                    <button
                      onClick={() => removeStep(i)}
                      aria-label="Remove"
                      style={{
                        width: 24, height: 24, borderRadius: 12, border: "none",
                        background: "rgba(255,255,255,0.08)", color: "rgba(235,235,245,0.6)", fontSize: 16, lineHeight: 1, cursor: "pointer",
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
