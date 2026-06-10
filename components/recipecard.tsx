"use client";

import FoodCard from "@/components/foodcard";

interface RecipeCardProps {
  title: string;
  image?: string | null;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
  onClick?: () => void;
}

export default function RecipeCard(props: RecipeCardProps) {
  const { onClick, ...data } = props;
  return (
    <FoodCard
      {...data}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    />
  );
}
