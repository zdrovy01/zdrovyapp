"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import { getSupabaseClient } from "@/config/supabase";
import { compressImage } from "@/services/image-compress";
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState<string[]>([""]);
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [showNutrition, setShowNutrition] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const num = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  const addStep = () => setSteps((s) => [...s, ""]);
  const removeStep = (i: number) =>
    setSteps((s) => s.filter((_, idx) => idx !== i));
  const updateStep = (i: number, value: string) =>
    setSteps((s) => s.map((step, idx) => (idx === i ? value : step)));

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      const compressed = await compressImage(file, {
        maxBytes: 3 * 1024 * 1024,
        square: true,
      });
      setPhoto(compressed);
    } catch (err) {
      console.error("Failed to process image:", err);
      setError("Failed to process image. Try another photo.");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Please enter a recipe name");
      return;
    }
    if (!photo) {
      setError("Please attach a photo");
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

      const instructionsText = steps
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s, i) => `${i + 1}. ${s}`)
        .join("\n");

      const { error: dbError } = await supabase.from("recipes").insert([
        {
          user_id: user.id,
          name: name.trim(),
          ingredients: ingredients.trim() || null,
          instructions: instructionsText || null,
          kcal: Math.round(num(kcal)),
          protein: Math.round(num(protein)),
          carbs: Math.round(num(carbs)),
          fat: Math.round(num(fat)),
          price: 0,
          image_url: photo,
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
        {/* Photo (required) */}
        <div>
          <label style={labelStyle}>Photo *</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            style={{ display: "none" }}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: 14,
              background: "rgba(118,118,128,0.24)",
              border: photo ? "none" : "1.5px dashed rgba(235,235,245,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt="Recipe"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ color: "rgba(235,235,245,0.5)", fontSize: 15 }}>
                Tap to add a photo
              </span>
            )}
          </div>
        </div>

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
          <label style={labelStyle}>Steps</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 44,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(235,235,245,0.6)",
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  {i + 1}.
                </div>
                <textarea
                  value={step}
                  onChange={(e) => updateStep(i, e.target.value)}
                  placeholder={`Step ${i + 1}`}
                  rows={1}
                  style={{ ...fieldStyle, resize: "vertical", minHeight: 44 }}
                />
                {steps.length > 1 && (
                  <button
                    onClick={() => removeStep(i)}
                    aria-label="Remove step"
                    style={{
                      width: 44,
                      height: 44,
                      flexShrink: 0,
                      borderRadius: 10,
                      border: "none",
                      background: "rgba(255,69,58,0.12)",
                      color: "#FF453A",
                      fontSize: 22,
                      lineHeight: 1,
                      cursor: "pointer",
                    }}
                  >
                    −
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={addStep}
            style={{
              marginTop: 10,
              height: 44,
              width: "100%",
              borderRadius: 10,
              border: "1.5px dashed rgba(235,235,245,0.25)",
              background: "transparent",
              color: "rgba(235,235,245,0.8)",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Add step
          </button>
        </div>

        {/* Nutrition (collapsible) */}
        <div>
          <button
            onClick={() => setShowNutrition((s) => !s)}
            style={{
              width: "100%",
              height: 52,
              padding: "0 16px",
              background: "rgba(118,118,128,0.24)",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxSizing: "border-box",
            }}
          >
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
              Nutrition
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{
                transform: showNutrition ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            >
              <path
                d="M2 4L6 8L10 4"
                stroke="rgba(235,235,245,0.6)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {showNutrition && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
              <div>
                <label style={labelStyle}>Calories</label>
                <input
                  value={kcal}
                  onChange={(e) => setKcal(e.target.value)}
                  inputMode="numeric"
                  placeholder="0"
                  style={fieldStyle}
                />
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
            </div>
          )}
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
