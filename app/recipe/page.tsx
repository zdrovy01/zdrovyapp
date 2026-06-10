"use client";

import Toolbar from "@/components/toolbar";
import Space from "@/components/space";
import RecipeCard from "@/components/recipecard";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { getSupabaseClient } from "@/config/supabase";
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

export default function RecipePage() {
  useProtectedRoute();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = getSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setRecipes([]);
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from("recipes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) {
          console.error("Failed to load recipes:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          });
          setRecipes([]);
        } else {
          setRecipes(data || []);
        }
      } catch (err) {
        console.error("Failed to load recipes:", err);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <>
      <Space size={40} />
      <Toolbar
        title="Recipes"
        href1="/createrecipe"
        icon1={
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 2V20M2 11H20" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        }
        showIcon2={false}
      />
      <Space size={16} />

      {loading ? (
        <div style={{ padding: "0 20px", color: "rgba(235,235,245,0.6)" }}>
          Loading...
        </div>
      ) : recipes.length === 0 ? (
        <div
          style={{
            padding: "30px 20px",
            color: "rgba(235,235,245,0.5)",
            textAlign: "center",
          }}
        >
          No recipes yet. Tap + to create one.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: "0 20px",
          }}
        >
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
            />
          ))}
        </div>
      )}
    </>
  );
}
