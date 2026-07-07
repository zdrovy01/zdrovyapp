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
import { compressImage } from "@/services/image-compress";
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
    setLoading(true);
    try {
      const dataUrl = await compressImage(file, { maxBytes: 3 * 1024 * 1024 });
      setPhotoPreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      const result = await analyzeFoodWithGeminiPhoto(base64, "image/jpeg");
      setFoodLog(result);
    } catch (err) {
      setError("Failed to analyze photo. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLog = async () => {
    if (!foodLog) return;
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
      if (!user) { setError("Please sign in first"); return; }

      const { error: dbError } = await supabase.from("food_logs").insert([{
        user_id: user.id,
        name: foodLog.name,
        kcal: foodLog.kcal,
        protein: foodLog.protein,
        carbs: foodLog.carbs,
        fat: foodLog.fat,
        price: foodLog.price,
        image_url: photoPreview, // photo it was calculated from (null for text)
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
      <Space size={8} />
      <ToolbarWin title="Add new log" />
      <Space size={10} />

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
        text1="Manual"
        href1="/addmanual"
        text2="Photo"
        onClick2={() => fileInputRef.current?.click()}
      />
      <Space size={10} />

      <TextInput
        placeholder="Describe your meal..."
        onSend={handleFoodAnalysis}
      />

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
              image={photoPreview || undefined}
              onNameChange={(n) => setFoodLog({ ...foodLog, name: n })}
              onImageAdd={(dataUrl) => setPhotoPreview(dataUrl)}
              buttons={[{ text: "Save Log", onClick: handleSaveLog }]}
            />
          </div>
        </>
      )}
    </>
  );
}
