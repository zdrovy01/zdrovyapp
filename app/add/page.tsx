"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import TextInput from "@/components/textinput";
import LogInfo from "@/components/loginfo";
import { analyzeFoodWithGemini, analyzeFoodWithGeminiPhoto, FoodLog } from "@/services/gemini-food";
import { getSupabaseClient } from "@/config/supabase";
import { useProtectedRoute } from "@/hooks/use-protected-route";

type Tab = "recipe" | "photo";

export default function AddPage() {
  useProtectedRoute();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("recipe");
  const [foodLog, setFoodLog] = useState<FoodLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFoodAnalysis = async (description: string) => {
    if (!description.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await analyzeFoodWithGemini(description);
      setFoodLog(result);
    } catch (err) {
      setError("Failed to analyze food. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setFoodLog(null);

    // Show preview
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      setLoading(true);
      try {
        const result = await analyzeFoodWithGeminiPhoto(base64, file.type);
        setFoodLog(result);
      } catch (err) {
        setError("Failed to analyze photo. Try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveLog = async () => {
    if (!foodLog) return;
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Please sign in first"); return; }

      const { error: dbError } = await supabase.from("food_logs").insert([{
        user_id: user.id,
        name: foodLog.name,
        kcal: foodLog.kcal,
        protein: foodLog.protein,
        carbs: foodLog.carbs,
        fat: foodLog.fat,
        price: foodLog.price,
        created_at: new Date().toISOString(),
      }]);

      if (dbError) throw dbError;
      setFoodLog(null);
      setPhotoPreview(null);
      router.push("/foodlog");
    } catch (err) {
      setError("Failed to save log");
      console.error(err);
    }
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setFoodLog(null);
    setPhotoPreview(null);
    setError("");
  };

  return (
    <>
      <Space size={40} />
      <ToolbarWin title="Add new log" />
      <Space size={10} />

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 8, padding: "0 20px" }}>
        {(["recipe", "photo"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            style={{
              flex: 1,
              height: 44,
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              fontSize: 15,
              fontWeight: 600,
              background: tab === t ? "#fff" : "#0A0A0A",
              color: tab === t ? "#000" : "rgba(235,235,245,0.5)",
              transition: "background 0.2s, color 0.2s",
            }}
          >
            {t === "recipe" ? "Recipe" : "📷 Photo"}
          </button>
        ))}
      </div>

      <Space size={10} />

      {/* Recipe tab */}
      {tab === "recipe" && (
        <TextInput
          placeholder="Describe your meal..."
          onSend={handleFoodAnalysis}
        />
      )}

      {/* Photo tab */}
      {tab === "photo" && (
        <div style={{ padding: "0 20px" }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelect}
            style={{ display: "none" }}
          />

          {!photoPreview ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "100%",
                height: 180,
                borderRadius: 20,
                border: "1.5px dashed rgba(255,255,255,0.15)",
                background: "#0A0A0A",
                color: "rgba(235,235,245,0.5)",
                fontSize: 15,
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <span style={{ fontSize: 36 }}>📷</span>
              <span>Take a photo or choose from gallery</span>
            </button>
          ) : (
            <div style={{ position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoPreview}
                alt="Food preview"
                style={{
                  width: "100%",
                  height: 220,
                  objectFit: "cover",
                  borderRadius: 20,
                  display: "block",
                }}
              />
              <button
                onClick={() => { setPhotoPreview(null); setFoodLog(null); fileInputRef.current?.click(); }}
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  background: "rgba(0,0,0,0.6)",
                  border: "none",
                  borderRadius: 20,
                  color: "#fff",
                  fontSize: 13,
                  padding: "6px 12px",
                  cursor: "pointer",
                }}
              >
                Retake
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{ padding: "12px 20px 0", color: "#FF453A", fontSize: 13 }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ padding: "16px 20px 0", color: "rgba(235,235,245,0.6)", fontSize: 14 }}>
          Analyzing...
        </div>
      )}

      {foodLog && !loading && (
        <>
          <Space size={16} />
          <div style={{ paddingLeft: 20, paddingRight: 20 }}>
            <LogInfo
              name={foodLog.name}
              kcal={foodLog.kcal}
              protein={foodLog.protein}
              carbs={foodLog.carbs}
              fat={foodLog.fat}
              price={foodLog.price}
              buttons={[{ text: "Save Log", onClick: handleSaveLog }]}
            />
          </div>
        </>
      )}
    </>
  );
}
