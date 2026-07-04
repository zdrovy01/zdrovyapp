"use client";

import Space from "@/components/space";
import ToolbarWin from "@/components/toolbarwin";
import RecipeCard from "@/components/recipecard";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { getSupabaseClient } from "@/config/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Recipe {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
  image_url: string | null;
}

export default function SavesPage() {
  useProtectedRoute();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
      if (!user) {
        setRecipes([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("saved_recipes")
        .select("recipe_id, created_at, recipes(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load saves:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        setRecipes([]);
      } else {
        const list = (data || [])
          .map((row: { recipes: Recipe | Recipe[] | null }) =>
            Array.isArray(row.recipes) ? row.recipes[0] : row.recipes
          )
          .filter((r): r is Recipe => !!r);
        setRecipes(list);
      }
    } catch (err) {
      console.error("Failed to load saves:", err);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnsave = async (recipeId: string) => {
    const prev = recipes;
    setRecipes((cur) => cur.filter((r) => r.id !== recipeId));
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
      if (!user) return;
      const { error } = await supabase
        .from("saved_recipes")
        .delete()
        .eq("user_id", user.id)
        .eq("recipe_id", recipeId);
      if (error) {
        console.error("Failed to unsave:", error);
        setRecipes(prev);
      }
    } catch (err) {
      console.error("Failed to unsave:", err);
      setRecipes(prev);
    }
  };

  return (
    <>
      <Space size={40} />
      <ToolbarWin title="Saved" />
      <Space size={16} />

      {loading ? (
        <div style={{ padding: "0 20px", color: "rgba(235,235,245,0.6)" }}>Loading...</div>
      ) : recipes.length === 0 ? (
        <div style={{ padding: "30px 20px", color: "rgba(235,235,245,0.5)", textAlign: "center" }}>
          No saved recipes yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 20px" }}>
          {recipes.map((r) => (
            <RecipeCard
              key={r.id}
              title={r.name}
              image={r.image_url}
              kcal={r.kcal}
              protein={r.protein}
              carbs={r.carbs}
              fat={r.fat}
              price={r.price}
              onClick={() => router.push(`/recipe/${r.id}`)}
              onDelete={() => handleUnsave(r.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
