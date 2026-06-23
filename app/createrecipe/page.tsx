"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Toolbar from "@/components/toolbar";
import Space from "@/components/space";
import { getSupabaseClient } from "@/config/supabase";
import { compressImage } from "@/services/image-compress";
import { estimateIngredientPrices, PricedIngredient } from "@/services/gemini-food";
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
  flex: 1,
  height: 52,
  borderRadius: 14,
  border: "none",
  background: "#0A84FF",
  color: "#fff",
  fontSize: 16,
  fontWeight: 600,
  fontFamily: FONT,
  cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
  flex: 1,
  height: 52,
  borderRadius: 14,
  border: "none",
  background: "rgba(118,118,128,0.24)",
  color: "#F5F5F5",
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
  color: "#0A84FF",
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

const TITLES = ["Photo", "Ingredients", "Cooking steps", "Nutrition", "Review"];

export default function CreateRecipePage() {
  useProtectedRoute();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);

  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [kcal, setKcal] = useState("");

  const [prices, setPrices] = useState<{ items: PricedIngredient[]; total: number } | null>(null);
  const [pricing, setPricing] = useState(false);
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

  // ---- Validation per step ----
  const canNext = () => {
    if (step === 1) return !!photo && !!name.trim();
    if (step === 2)
      return ingredients.length > 0 && ingredients.every((i) => i.name.trim() && i.amount.trim());
    if (step === 3) return steps.length > 0 && steps.every((s) => s.text.trim());
    return true;
  };

  const goToReview = async () => {
    setStep(5);
    setPricing(true);
    try {
      const result = await estimateIngredientPrices(
        ingredients.map((i) => ({ name: i.name, amount: i.amount, unit: i.unit }))
      );
      setPrices(result);
    } catch (err) {
      console.error("Pricing failed:", err);
      setPrices({ items: ingredients.map((i) => ({ name: i.name, price: 0 })), total: 0 });
    } finally {
      setPricing(false);
    }
  };

  const handleNext = () => {
    setError("");
    if (!canNext()) {
      setError("Please fill in the required fields.");
      return;
    }
    if (step === 4) {
      goToReview();
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError("");
    if (step === 1) {
      router.back();
    } else {
      setStep((s) => s - 1);
    }
  };

  const handleSave = async () => {
    if (!photo) return;
    setSaving(true);
    setError("");
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Please sign in first"); setSaving(false); return; }

      const ingredientsText = ingredients
        .map((i) => `${i.name.trim()} — ${i.amount.trim()}${i.unit}`)
        .join("\n");

      const instructionsText = steps
        .map((s, i) => {
          const attached =
            s.ingredientIndex != null && ingredients[s.ingredientIndex]
              ? ` (uses: ${ingredients[s.ingredientIndex].name.trim()})`
              : "";
          return `${i + 1}. ${s.text.trim()}${attached}`;
        })
        .join("\n");

      const { error: dbError } = await supabase.from("recipes").insert([{
        user_id: user.id,
        name: name.trim(),
        ingredients: ingredientsText || null,
        instructions: instructionsText || null,
        kcal: Math.round(num(kcal)),
        protein: Math.round(num(protein)),
        carbs: Math.round(num(carbs)),
        fat: Math.round(num(fat)),
        price: prices?.total || 0,
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
      <Space size={40} />
      <Toolbar title={`${TITLES[step - 1]} · ${step}/5`} showIcon1={false} showIcon2={false} />
      <Space size={16} />

      <div style={{ padding: "0 20px" }}>
        {/* STEP 1 — Photo + name */}
        {step === 1 && (
          <>
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
            <Space size={16} />
            <label style={labelStyle}>Recipe name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Greek salad" style={fieldStyle} />
          </>
        )}

        {/* STEP 2 — Ingredients (horizontal cards) */}
        {step === 2 && (
          <>
            {ingredients.length > 0 && (
              <div className="hide-scrollbar" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
                {ingredients.map((ing, i) => (
                  <div key={i} style={{ ...cardStyle, flex: "0 0 160px", padding: 12, position: "relative" }}>
                    <button
                      onClick={() => removeIngredient(i)}
                      aria-label="Remove"
                      style={{
                        position: "absolute", top: 8, right: 8, width: 22, height: 22,
                        borderRadius: 11, border: "none", background: "rgba(255,69,58,0.15)",
                        color: "#FF453A", fontSize: 15, lineHeight: 1, cursor: "pointer",
                      }}
                    >×</button>
                    <input
                      value={ing.name}
                      onChange={(e) => updateIngredient(i, { name: e.target.value })}
                      placeholder="Name"
                      style={{ ...fieldStyle, padding: "8px 10px", fontSize: 15, marginBottom: 8 }}
                    />
                    <div style={{ display: "flex", gap: 6 }}>
                      <input
                        value={ing.amount}
                        onChange={(e) => updateIngredient(i, { amount: e.target.value })}
                        placeholder="0"
                        inputMode="decimal"
                        style={{ ...fieldStyle, padding: "8px 10px", fontSize: 15, width: 0, flex: 1 }}
                      />
                      <button
                        onClick={() => updateIngredient(i, { unit: ing.unit === "g" ? "ml" : "g" })}
                        style={{
                          width: 44, borderRadius: 10, border: "none",
                          background: "rgba(118,118,128,0.24)", color: "#F5F5F5",
                          fontSize: 14, fontWeight: 600, cursor: "pointer",
                        }}
                      >{ing.unit}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {ingredients.length > 0 && <Space size={10} />}
            <button onClick={addIngredient} style={addBtn}>
              + Add ingredient
            </button>
          </>
        )}

        {/* STEP 3 — Cooking steps (vertical cards) */}
        {step === 3 && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {steps.map((st, i) => (
                <div key={i} style={{ ...cardStyle, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#0A84FF", fontWeight: 700, fontSize: 15 }}>Step {i + 1}</span>
                    <button
                      onClick={() => removeStep(i)}
                      aria-label="Remove"
                      style={{
                        width: 24, height: 24, borderRadius: 12, border: "none",
                        background: "rgba(255,69,58,0.15)", color: "#FF453A", fontSize: 16, lineHeight: 1, cursor: "pointer",
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
            {steps.length > 0 && <Space size={10} />}
            <button onClick={addStep} style={addBtn}>
              + Add step
            </button>
          </>
        )}

        {/* STEP 4 — Nutrition (optional) */}
        {step === 4 && (
          <>
            <div style={{ color: "rgba(235,235,245,0.45)", fontSize: 14, marginBottom: 14 }}>
              Optional — you can skip this step.
            </div>
            <div style={{ marginBottom: 12 }}>
              <input value={kcal} onChange={(e) => setKcal(e.target.value)} inputMode="numeric" placeholder="Calories" style={fieldStyle} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <input value={protein} onChange={(e) => setProtein(e.target.value)} inputMode="numeric" placeholder="Protein (g)" style={fieldStyle} />
              <input value={carbs} onChange={(e) => setCarbs(e.target.value)} inputMode="numeric" placeholder="Carbs (g)" style={fieldStyle} />
              <input value={fat} onChange={(e) => setFat(e.target.value)} inputMode="numeric" placeholder="Fat (g)" style={fieldStyle} />
            </div>
          </>
        )}

        {/* STEP 5 — Review */}
        {step === 5 && (
          <>
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={name} style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: 20 }} />
            )}
            <Space size={14} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h1 style={{ margin: 0, color: "#fff", fontSize: 24, fontWeight: 800 }}>{name}</h1>
              <div style={{ ...cardStyle, padding: "8px 14px", borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 16 }}>
                {pricing ? "…" : `$${(prices?.total || 0).toFixed(2)}`}
              </div>
            </div>
            <Space size={8} />
            <div style={{ color: "rgba(235,235,245,0.65)", fontSize: 14, display: "flex", gap: 16, flexWrap: "wrap" }}>
              <span>{Math.round(num(kcal))} kcal</span>
              <span>Protein {Math.round(num(protein))}g</span>
              <span>Carbs {Math.round(num(carbs))}g</span>
              <span>Fat {Math.round(num(fat))}g</span>
            </div>

            <Space size={20} />
            <label style={labelStyle}>Ingredients</label>
            <div className="hide-scrollbar" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
              {ingredients.map((ing, i) => {
                const price = prices?.items[i]?.price;
                return (
                  <div key={i} style={{ ...cardStyle, flex: "0 0 150px", padding: 12 }}>
                    <div style={{ color: "#fff", fontWeight: 600, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {ing.name}
                    </div>
                    <div style={{ color: "rgba(235,235,245,0.5)", fontSize: 12, marginTop: 2 }}>
                      {ing.amount}{ing.unit}
                    </div>
                    <div style={{ color: "#0A84FF", fontWeight: 700, fontSize: 14, marginTop: 8 }}>
                      {pricing ? "…" : `$${(price || 0).toFixed(2)}`}
                    </div>
                  </div>
                );
              })}
            </div>

            <Space size={20} />
            <label style={labelStyle}>Steps</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {steps.map((st, i) => (
                <div key={i} style={{ ...cardStyle, padding: 14 }}>
                  <div style={{ color: "#0A84FF", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Step {i + 1}</div>
                  <div style={{ color: "#F5F5F5", fontSize: 15, lineHeight: 1.45 }}>{st.text}</div>
                  {st.ingredientIndex != null && ingredients[st.ingredientIndex] && (
                    <div style={{ color: "rgba(235,235,245,0.5)", fontSize: 12, marginTop: 6 }}>
                      uses: {ingredients[st.ingredientIndex].name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {error && (
          <>
            <Space size={12} />
            <div style={{ color: "#FF453A", fontSize: 13 }}>{error}</div>
          </>
        )}
      </div>

      {/* Spacer so content isn't hidden behind the fixed bar */}
      <div style={{ height: step === 4 ? 150 : 96 }} />

      {/* Fixed bottom navigation */}
      <div
        style={{
          position: "fixed",
          left: "50%",
          bottom: 0,
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 402,
          padding: "16px 20px 28px",
          boxSizing: "border-box",
          background: "linear-gradient(to top, #000 60%, rgba(0,0,0,0))",
          zIndex: 50,
        }}
      >
        {step < 5 ? (
          <>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleBack} style={secondaryBtn}>Back</button>
              <button onClick={handleNext} style={primaryBtn}>Next</button>
            </div>
            {step === 4 && (
              <>
                <Space size={10} />
                <button onClick={goToReview} style={{ ...secondaryBtn, width: "100%" }}>Skip</button>
              </>
            )}
          </>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(4)} style={secondaryBtn}>Back</button>
            <button onClick={handleSave} disabled={saving || pricing} style={{ ...primaryBtn, opacity: saving || pricing ? 0.6 : 1 }}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
