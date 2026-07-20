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
import { COLORS } from "@/config/theme";

const FONT = "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif";

const fieldStyle: React.CSSProperties = {
  width: "100%",
  background: COLORS.fill,
  border: "none",
  outline: "none",
  borderRadius: 4,
  color: COLORS.text,
  fontSize: 15,
  padding: "11px 13px",
  boxSizing: "border-box",
  fontFamily: FONT,
};

const cameraIcon = (
  <svg width="28" height="22" viewBox="0 0 28 22" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.0039 8.625C23.3867 8.61719 23.7148 8.47656 23.9883 8.20312C24.2617 7.92969 24.3984 7.59766 24.3984 7.20703C24.3984 6.82422 24.2617 6.49609 23.9883 6.22266C23.7148 5.94922 23.3867 5.8125 23.0039 5.8125C22.6133 5.8125 22.2773 5.94922 21.9961 6.22266C21.7227 6.49609 21.5859 6.82422 21.5859 7.20703C21.5859 7.59766 21.7227 7.93359 21.9961 8.21484C22.2773 8.48828 22.6133 8.625 23.0039 8.625ZM3.5625 21.2812C2.39062 21.2812 1.50391 20.9844 0.902344 20.3906C0.300781 19.8047 0 18.9297 0 17.7656V6.15234C0 4.98828 0.300781 4.10938 0.902344 3.51562C1.50391 2.92187 2.39062 2.625 3.5625 2.625H6.5625C6.99219 2.625 7.30859 2.57422 7.51172 2.47266C7.72266 2.37109 7.96094 2.18359 8.22656 1.91016L9.10547 0.9375C9.38672 0.632812 9.69531 0.402344 10.0312 0.246094C10.3672 0.0820312 10.8164 0 11.3789 0H15.8672C16.4375 0 16.8906 0.0820312 17.2266 0.246094C17.5625 0.402344 17.8672 0.632812 18.1406 0.9375L19.0312 1.91016C19.2031 2.08984 19.3594 2.23438 19.5 2.34375C19.6484 2.44531 19.8086 2.51953 19.9805 2.56641C20.1602 2.60547 20.3984 2.625 20.6953 2.625H23.7539C24.9258 2.625 25.8125 2.92187 26.4141 3.51562C27.0156 4.10938 27.3164 4.98828 27.3164 6.15234V17.7656C27.3164 18.9297 27.0156 19.8047 26.4141 20.3906C25.8125 20.9844 24.9258 21.2812 23.7539 21.2812H3.5625ZM13.6641 17.918C14.7734 17.918 15.7812 17.6484 16.6875 17.1094C17.6016 16.5703 18.3281 15.8477 18.8672 14.9414C19.4062 14.0273 19.6758 13.0117 19.6758 11.8945C19.6758 10.7695 19.4062 9.75391 18.8672 8.84766C18.3281 7.94141 17.6016 7.21875 16.6875 6.67969C15.7812 6.13281 14.7734 5.85938 13.6641 5.85938C12.5547 5.85938 11.543 6.13281 10.6289 6.67969C9.71484 7.21875 8.98828 7.94141 8.44922 8.84766C7.91797 9.75391 7.65234 10.7695 7.65234 11.8945C7.65234 13.0117 7.91797 14.0273 8.44922 14.9414C8.98828 15.8477 9.71484 16.5703 10.6289 17.1094C11.543 17.6484 12.5547 17.918 13.6641 17.918ZM13.6641 16.0781C12.8906 16.0781 12.1875 15.8906 11.5547 15.5156C10.9297 15.1406 10.4258 14.6367 10.043 14.0039C9.66797 13.3711 9.48047 12.668 9.48047 11.8945C9.48047 11.1133 9.66797 10.4062 10.043 9.77344C10.418 9.14062 10.9219 8.64062 11.5547 8.27344C12.1875 7.89844 12.8906 7.71094 13.6641 7.71094C14.4375 7.71094 15.1367 7.89844 15.7617 8.27344C16.3945 8.64062 16.8984 9.14062 17.2734 9.77344C17.6562 10.4062 17.8477 11.1133 17.8477 11.8945C17.8477 12.668 17.6562 13.3711 17.2734 14.0039C16.8984 14.6367 16.3945 15.1406 15.7617 15.5156C15.1367 15.8906 14.4375 16.0781 13.6641 16.0781Z" fill="rgba(235,235,245,0.5)"/>
  </svg>
);

export default function AddPage() {
  useProtectedRoute();
  const router = useRouter();
  const [foodLog, setFoodLog] = useState<FoodLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [proMode, setProMode] = useState(false);
  const [info, setInfo] = useState("");

  const handleBarcode = () => setInfo("Barcode scanning is coming soon.");

  // Manual log form
  const manualPhotoRef = useRef<HTMLInputElement>(null);
  const [mPhoto, setMPhoto] = useState<string | null>(null);
  const [mName, setMName] = useState("");
  const [mKcal, setMKcal] = useState("");
  const [mProtein, setMProtein] = useState("");
  const [mCarbs, setMCarbs] = useState("");
  const [mFat, setMFat] = useState("");
  const [savingManual, setSavingManual] = useState(false);

  const num = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  const handleManualPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      const dataUrl = await compressImage(file, { maxBytes: 3 * 1024 * 1024, square: true });
      setMPhoto(dataUrl);
    } catch (err) {
      console.error("Failed to process image:", err);
      setError("Failed to process image. Try another photo.");
    }
  };

  const handleSaveManual = async () => {
    setError("");
    if (!mName.trim()) { setError("Please enter a title."); return; }
    setSavingManual(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) { setError("Please sign in first"); setSavingManual(false); return; }

      const { error: dbError } = await supabase.from("food_logs").insert([{
        user_id: user.id,
        name: mName.trim(),
        kcal: Math.round(num(mKcal)),
        protein: Math.round(num(mProtein)),
        carbs: Math.round(num(mCarbs)),
        fat: Math.round(num(mFat)),
        price: 0,
        image_url: mPhoto,
        created_at: new Date().toISOString(),
      }]);

      if (dbError) throw dbError;
      router.push("/log");
    } catch (err) {
      console.error("Failed to save log:", err);
      setError("Failed to save log");
      setSavingManual(false);
    }
  };

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
        buttons={3}
        text1="Barcode"
        onClick1={handleBarcode}
        text2="Photo"
        onClick2={() => fileInputRef.current?.click()}
        text3="Pro mode"
        onClick3={() => { setProMode((s) => !s); setInfo(""); }}
      />
      <Space size={10} />

      {/* Pro mode: free-text meal description (AI) */}
      {proMode && (
        <>
          <TextInput
            placeholder="Describe your meal..."
            onSend={handleFoodAnalysis}
          />
          <Space size={16} />
        </>
      )}

      {/* AI analysis result (from Photo or Pro mode) */}
      {loading && (
        <div style={{ paddingLeft: 20, paddingRight: 20, marginBottom: 16, color: COLORS.textSecondary, fontSize: 14 }}>
          Analyzing...
        </div>
      )}
      {foodLog && !loading && (
        <div style={{ paddingLeft: 20, paddingRight: 20, marginBottom: 16 }}>
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
      )}

      {/* Manual log form */}
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Photo */}
        <div>
          <input ref={manualPhotoRef} type="file" accept="image/*" onChange={handleManualPhoto} style={{ display: "none" }} />
          <div
            onClick={() => manualPhotoRef.current?.click()}
            style={{
              width: "100%", aspectRatio: "16 / 7", borderRadius: 4,
              background: COLORS.surface,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", overflow: "hidden", boxSizing: "border-box",
            }}
          >
            {mPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mPhoto} alt="Meal" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              cameraIcon
            )}
          </div>
        </div>

        {/* Title */}
        <input value={mName} onChange={(e) => setMName(e.target.value)} placeholder="Title" style={fieldStyle} />

        {/* Nutrition */}
        <input value={mKcal} onChange={(e) => setMKcal(e.target.value)} inputMode="numeric" placeholder="Calories" style={fieldStyle} />
        <div style={{ display: "flex", gap: 10 }}>
          <input value={mProtein} onChange={(e) => setMProtein(e.target.value)} inputMode="numeric" placeholder="Protein (g)" style={fieldStyle} />
          <input value={mCarbs} onChange={(e) => setMCarbs(e.target.value)} inputMode="numeric" placeholder="Carbs (g)" style={fieldStyle} />
          <input value={mFat} onChange={(e) => setMFat(e.target.value)} inputMode="numeric" placeholder="Fat (g)" style={fieldStyle} />
        </div>

        <button
          onClick={handleSaveManual}
          disabled={savingManual}
          style={{
            width: "100%", height: 48, borderRadius: 4, border: "none",
            background: COLORS.text, color: COLORS.background,
            fontSize: 16, fontWeight: 600, fontFamily: FONT,
            cursor: "pointer", opacity: savingManual ? 0.6 : 1,
          }}
        >
          {savingManual ? "Saving..." : "Save log"}
        </button>
      </div>

      {info && (
        <div style={{ paddingLeft: 20, paddingRight: 20, marginTop: 12, color: COLORS.textSecondary, fontSize: 13 }}>
          {info}
        </div>
      )}

      {error && (
        <div style={{ paddingLeft: 20, paddingRight: 20, marginTop: 12, color: COLORS.danger, fontSize: 13 }}>
          {error}
        </div>
      )}
    </>
  );
}
