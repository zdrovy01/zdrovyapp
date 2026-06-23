"use client";

import Toolbar from "@/components/toolbar";
import Space from "@/components/space";
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

export default function RecipePage() {
  useProtectedRoute();
  const router = useRouter();
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

  const handleDelete = async (id: string) => {
    const prev = recipes;
    setRecipes((cur) => cur.filter((r) => r.id !== id));
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from("recipes").delete().eq("id", id);
      if (error) { console.error("Failed to delete recipe:", error); setRecipes(prev); }
    } catch (err) {
      console.error("Failed to delete recipe:", err);
      setRecipes(prev);
    }
  };

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
        icon2={<svg width="13" height="21" viewBox="0 0 13 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.08398 20.0391C0.751953 20.0391 0.488281 19.9316 0.292969 19.7168C0.0976562 19.502 0 19.2025 0 18.8184V2.72461C0 1.83268 0.227865 1.1556 0.683594 0.693359C1.13932 0.23112 1.8099 0 2.69531 0H9.99023C10.8757 0 11.5462 0.23112 12.002 0.693359C12.4577 1.1556 12.6855 1.83268 12.6855 2.72461V18.8184C12.6855 19.2025 12.5879 19.502 12.3926 19.7168C12.1973 19.9316 11.9303 20.0391 11.5918 20.0391C11.3509 20.0391 11.1296 19.9642 10.9277 19.8145C10.7259 19.6647 10.4199 19.3913 10.0098 18.9941L6.42578 15.4492C6.3737 15.3971 6.31836 15.3971 6.25977 15.4492L2.66602 18.9941C2.26237 19.3913 1.95638 19.6647 1.74805 19.8145C1.54622 19.9642 1.32487 20.0391 1.08398 20.0391Z" fill="white" />
        </svg>}
      />
      <Space size={16} />

      {
        loading ? (
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
                onClick={() => router.push(`/recipe/${r.id}`)}
                onDelete={() => handleDelete(r.id)}
              />
            ))}
          </div>
        )
      }
    </>
  );
}
