"use client";

import { useState } from "react";
import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import Option from "@/components/option";
import TextInput from "@/components/textinput";
import LogInfo from "@/components/loginfo";
import { analyzeFoodWithGemini, FoodLog } from "@/services/gemini-food";
import { getSupabaseClient } from "@/config/supabase";
import { useProtectedRoute } from "@/hooks/use-protected-route";

export default function AddPage() {
  useProtectedRoute();
  const [foodLog, setFoodLog] = useState<FoodLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleSaveLog = async () => {
    if (!foodLog) return;

    try {
      const supabase = await getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Please sign in first");
        return;
      }

      const { error: dbError } = await supabase.from("food_logs").insert([
        {
          user_id: user.id,
          name: foodLog.name,
          kcal: foodLog.kcal,
          protein: foodLog.protein,
          carbs: foodLog.carbs,
          fat: foodLog.fat,
          price: foodLog.price,
          created_at: new Date().toISOString(),
        },
      ]);

      if (dbError) throw dbError;

      setFoodLog(null);
      window.location.href = "/foodlog";
    } catch (err) {
      setError("Failed to save log");
      console.error(err);
    }
  };

  return (
    <>
      <Space size={40} />
      <ToolbarWin title="Add new log" />
      <Option buttons={2} text1="Recipe" text2="Photo" />
      <Space size={10} />

      <TextInput
        placeholder="Describe your meal..."
        onSend={handleFoodAnalysis}
      />

      {error && (
        <div
          style={{
            paddingLeft: 20,
            paddingRight: 20,
            marginTop: 12,
            color: "#FF453A",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div
          style={{
            paddingLeft: 20,
            paddingRight: 20,
            marginTop: 16,
            color: "rgba(235,235,245,0.6)",
            fontSize: 14,
          }}
        >
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
              buttons={[
                {
                  text: "Save Log",
                  onClick: handleSaveLog,
                },
              ]}
            />
          </div>
        </>
      )}
    </>
  );
}
