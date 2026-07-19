"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ToolbarWin from "@/components/toolbarwin";
import Space from "@/components/space";
import { getSupabaseClient } from "@/config/supabase";
import { COLORS } from "@/config/theme";
import { useCurrencySymbol } from "@/config/currency";
import { useProtectedRoute } from "@/hooks/use-protected-route";

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

interface ParsedIngredient {
  name: string;
  amount: string;
  unit: string;
  price: number | null;
}
interface ParsedStep {
  text: string;
  ingredient: string | null;
}

const cardStyle: React.CSSProperties = {
  background: "#0A0A0A",
  borderRadius: 16,
  boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  color: "rgba(235,235,245,0.5)",
  fontSize: 12,
  marginBottom: 8,
  display: "block",
};

function parseIngredients(raw: string | null): ParsedIngredient[] {
  if (!raw) return [];
  try {
    const j = JSON.parse(raw);
    if (Array.isArray(j))
      return j.map((it) => ({
        name: it.name || "",
        amount: it.amount || "",
        unit: it.unit || "",
        price: typeof it.price === "number" ? it.price : null,
      }));
  } catch {}
  // Fallback: plain lines
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => ({ name: l, amount: "", unit: "", price: null }));
}

function parseSteps(raw: string | null): ParsedStep[] {
  if (!raw) return [];
  try {
    const j = JSON.parse(raw);
    if (Array.isArray(j))
      return j.map((it) => ({ text: it.text || "", ingredient: it.ingredient || null }));
  } catch {}
  // Fallback: numbered lines
  return raw
    .split("\n")
    .map((l) => l.replace(/^\s*\d+\.\s*/, "").trim())
    .filter(Boolean)
    .map((t) => ({ text: t, ingredient: null }));
}

export default function RecipeDetailPage() {
  useProtectedRoute();
  const sym = useCurrencySymbol();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [creator, setCreator] = useState<string>("user");
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [savingState, setSavingState] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

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

        const { data: profile } = await supabase
          .from("user_profiles")
          .select("username, name")
          .eq("user_id", data.user_id)
          .maybeSingle();
        setCreator(profile?.username || profile?.name || "user");

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
      const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
      if (!user) return;

      if (saved) {
        const { error } = await supabase
          .from("saved_recipes")
          .delete()
          .eq("user_id", user.id)
          .eq("recipe_id", recipe.id);
        if (!error) setSaved(false);
      } else {
        const { error } = await supabase
          .from("saved_recipes")
          .insert({ user_id: user.id, recipe_id: recipe.id });
        if (!error) setSaved(true);
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
        <Space size={8} />
        <ToolbarWin title="Recipe" />
        <div style={{ padding: 20, color: "rgba(235,235,245,0.6)" }}>Recipe not found.</div>
      </>
    );
  }

  const ingredients = parseIngredients(recipe.ingredients);
  const steps = parseSteps(recipe.instructions);

  return (
    <>
      <Space size={8} />
      <ToolbarWin title={`@${creator}`} />
      <Space size={10} />

      <div style={{ padding: "0 20px" }}>
        {/* Photo */}
        {recipe.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.image_url}
            alt={recipe.name}
            style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: 16 }}
          />
        )}

        <Space size={14} />

        {/* Title + price */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h1 style={{ margin: 0, color: "#fff", fontSize: 24, fontWeight: 800 }}>{recipe.name}</h1>
          <div style={{ ...cardStyle, padding: "8px 14px", borderRadius: 16, color: "#fff", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
            {sym}{recipe.price.toFixed(2)}
          </div>
        </div>

        <Space size={8} />

        {/* Macros */}
        <div style={{ color: "rgba(235,235,245,0.65)", fontSize: 14, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <span>{recipe.kcal} kcal</span>
          <span>Protein {recipe.protein}g</span>
          <span>Carbs {recipe.carbs}g</span>
          <span>Fat {recipe.fat}g</span>
        </div>

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <>
            <Space size={20} />
            <label style={labelStyle}>Ingredients</label>
            <div className="hide-scrollbar" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
              {ingredients.map((ing, i) => (
                <div key={i} style={{ ...cardStyle, flex: "0 0 150px", padding: 12 }}>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {ing.name}
                  </div>
                  {(ing.amount || ing.unit) && (
                    <div style={{ color: "rgba(235,235,245,0.5)", fontSize: 12, marginTop: 2 }}>
                      {ing.amount}{ing.unit}
                    </div>
                  )}
                  {ing.price != null && (
                    <div style={{ color: COLORS.accent, fontWeight: 700, fontSize: 14, marginTop: 8 }}>
                      {sym}{ing.price.toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <>
            <Space size={20} />
            <label style={labelStyle}>Steps</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {steps.map((st, i) => (
                <div key={i} style={{ ...cardStyle, padding: 14 }}>
                  <div style={{ color: COLORS.accent, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Step {i + 1}</div>
                  <div style={{ color: "#F5F5F5", fontSize: 15, lineHeight: 1.45 }}>{st.text}</div>
                  {st.ingredient && (
                    <div style={{ color: "rgba(235,235,245,0.5)", fontSize: 12, marginTop: 6 }}>
                      uses: {st.ingredient}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <Space size={28} />

        {/* Actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={toggleSave}
            disabled={savingState}
            style={{
              flex: 1, height: 54, borderRadius: 16,
              border: saved ? "1.5px solid rgba(235,235,245,0.3)" : "none",
              background: saved ? "transparent" : "#fff",
              color: saved ? "#fff" : "#000",
              fontSize: 16, fontWeight: 600,
              cursor: savingState ? "default" : "pointer",
              opacity: savingState ? 0.6 : 1,
            }}
          >
            {saved ? "Unsave" : "Save"}
          </button>
          <button
            onClick={() => router.push(`/cook?recipe=${recipe.id}`)}
            style={{
              flex: 1, height: 54, borderRadius: 16, border: "none",
              background: COLORS.accent, color: COLORS.onAccent, fontSize: 16, fontWeight: 600, cursor: "pointer",
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
