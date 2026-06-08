"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import Option from "@/components/option";
import TextInput from "@/components/textinput";
import LogInfo from "@/components/loginfo";
import { analyzeFoodWithGemini, analyzeFoodWithGeminiPhoto, FoodLog } from "@/services/gemini-food";
import { getSupabaseClient } from "@/config/supabase";
import { useProtectedRoute } from "@/hooks/use-protected-route";

export default function AddPage() {
  useProtectedRoute();
  const router = useRouter();
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
    setPhotoPreview(URL.createObjectURL(file));

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
      router.push("/log");
    } catch (err) {
      setError("Failed to save log");
      console.error(err);
    }
  };

  return (
    <>
      <Space size={40} />
      <ToolbarWin title="Add new log" />

      {/* Hidden file input for camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handlePhotoSelect}
        style={{ display: "none" }}
      />

      <Option
        buttons={2}
        text1="Recipe"
        text2="Photo"
        onClick2={() => fileInputRef.current?.click()}
      />
      <Space size={10} />

      <TextInput
        placeholder="Describe your meal..."
        onSend={handleFoodAnalysis}
      />

      {/* Photo preview */}
      {photoPreview && (
        <div style={{ padding: "12px 20px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoPreview}
            alt="Food preview"
            style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 16 }}
          />
        </div>
      )}

      {error && (
        <div style={{ paddingLeft: 20, paddingRight: 20, marginTop: 12, color: "#FF453A", fontSize: 13 }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ paddingLeft: 20, paddingRight: 20, marginTop: 16, color: "rgba(235,235,245,0.6)", fontSize: 14 }}>
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
