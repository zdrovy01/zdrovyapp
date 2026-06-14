"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import { getSupabaseClient } from "@/config/supabase";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { useAuth } from "@/config/auth-context";

interface Recipe {
  id: string;
  user_id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
  ingredients: string | null;
  instructions: string | null;
  image_url: string | null;
}

export default function RecipeDetailPage() {
  useProtectedRoute();
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [creator, setCreator] = useState<string>("user");
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [savingState, setSavingState] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("recipes")
          .select("*")
          .eq("id", id)
          .single();

        if (error || !data) {
          console.error("Failed to load recipe:", error);
          setLoading(false);
          return;
        }
        setRecipe(data);

        // Creator username
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("username, name")
          .eq("user_id", data.user_id)
          .maybeSingle();
        setCreator(profile?.username || profile?.name || "user");

        // Saved state
        if (user) {
          const { data: savedRow } = await supabase
            .from("saved_recipes")
            .select("id")
            .eq("user_id", user.id)
            .eq("recipe_id", id)
            .maybeSingle();
          setSaved(!!savedRow);
        }
      } catch (err) {
        console.error("Failed to load recipe:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const toggleSave = async () => {
    if (!recipe) return;
    setSavingState(true);
    try {
      const supabase = getSupabaseClient();
      if (!user) return;

      if (saved) {
        const { error } = await supabase
          .from("saved_recipes")
          .delete()
          .eq("user_id", user.id)
          .eq("recipe_id", recipe.id);
        if (!error) setSaved(false);
        else console.error("Unsave failed:", error);
      } else {
        const { error } = await supabase
          .from("saved_recipes")
          .insert({ user_id: user.id, recipe_id: recipe.id });
        if (!error) setSaved(true);
        else console.error("Save failed:", error);
      }
    } finally {
      setSavingState(false);
    }
  };

  if (loading) {
    return <div style={{ color: "white", padding: 20 }}>Loading...</div>;
  }

  if (!recipe) {
    return (
      <>
        <Space size={40} />
        <ToolbarWin title="Recipe" />
        <div style={{ padding: 20, color: "rgba(235,235,245,0.6)" }}>
          Recipe not found.
        </div>
      </>
    );
  }

  const steps = (recipe.instructions || "")
    .split("\n")
    .map((s) => s.replace(/^\s*\d+\.\s*/, "").trim())
    .filter(Boolean);

  return (
    <>
      <Space size={40} />
      <ToolbarWin title={`@${creator}`} />
      <Space size={16} />

      <div style={{ padding: "0 20px" }}>
        {/* Photo */}
        {recipe.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.image_url}
            alt={recipe.name}
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              objectFit: "cover",
              borderRadius: 20,
            }}
          />
        )}

        <Space size={16} />

        {/* Title */}
        <h1
          style={{
            margin: 0,
            color: "#fff",
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "-0.4px",
          }}
        >
          {recipe.name}
        </h1>

        <Space size={12} />

        {/* Calories + price */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 600 }}>
            {recipe.kcal} kcal
          </div>
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>
            ${recipe.price.toFixed(2)}
          </div>
        </div>

        <Space size={10} />

        {/* Macros */}
        <div
          style={{
            display: "flex",
            gap: 16,
            color: "rgba(235,235,245,0.65)",
            fontSize: 14,
          }}
        >
          <span>Protein {recipe.protein}g</span>
          <span>Carbs {recipe.carbs}g</span>
          <span>Fat {recipe.fat}g</span>
        </div>

        <Space size={20} />

        {/* Steps count */}
        <div style={{ color: "rgba(235,235,245,0.5)", fontSize: 14 }}>
          {steps.length} {steps.length === 1 ? "step" : "steps"} to cook
        </div>

        <Space size={20} />

        {/* Ingredients */}
        {recipe.ingredients && (
          <>
            <div
              style={{
                color: "rgba(235,235,245,0.6)",
                fontSize: 13,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              Ingredients
            </div>
            <div
              style={{
                color: "#F5F5F5",
                fontSize: 15,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
              }}
            >
              {recipe.ingredients}
            </div>
            <Space size={20} />
          </>
        )}

        {/* Steps (collapsible) */}
        {steps.length > 0 && (
          <div style={{ background: "#0A0A0A", borderRadius: 14, overflow: "hidden" }}>
            <button
              onClick={() => setStepsOpen((o) => !o)}
              style={{
                width: "100%",
                height: 52,
                padding: "0 16px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxSizing: "border-box",
              }}
            >
              <span style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>
                Cooking steps
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                style={{
                  transform: stepsOpen ? "rotate(180deg)" : "rotate(0deg)",
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
            {stepsOpen && (
              <div style={{ padding: "0 16px 16px" }}>
                {steps.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: "10px 0",
                      borderTop: "1px solid rgba(235,235,245,0.06)",
                    }}
                  >
                    <span
                      style={{
                        color: "#0A84FF",
                        fontSize: 15,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}.
                    </span>
                    <span style={{ color: "#F5F5F5", fontSize: 15, lineHeight: 1.45 }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Space size={28} />

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={toggleSave}
            disabled={savingState}
            style={{
              flex: 1,
              height: 54,
              borderRadius: 14,
              border: saved ? "1.5px solid rgba(235,235,245,0.3)" : "none",
              background: saved ? "transparent" : "#fff",
              color: saved ? "#fff" : "#000",
              fontSize: 16,
              fontWeight: 600,
              cursor: savingState ? "default" : "pointer",
              opacity: savingState ? 0.6 : 1,
            }}
          >
            {saved ? "Unsave" : "Save"}
          </button>
          <button
            onClick={() => router.push(`/cook?recipe=${recipe.id}`)}
            style={{
              flex: 1,
              height: 54,
              borderRadius: 14,
              border: "none",
              background: "#0A84FF",
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Start cooking
          </button>
        </div>
      </div>

      <Space size={40} />
    </>
  );
}
