"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "zdrovy-goals";
const EVENT = "zdrovy-goals-change";

export interface Goals {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const DEFAULT_GOALS: Goals = { kcal: 2000, protein: 150, carbs: 250, fat: 70 };

export function getGoals(): Goals {
  if (typeof window === "undefined") return DEFAULT_GOALS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_GOALS;
    const parsed = JSON.parse(raw);
    return {
      kcal: Number(parsed.kcal) || DEFAULT_GOALS.kcal,
      protein: Number(parsed.protein) || DEFAULT_GOALS.protein,
      carbs: Number(parsed.carbs) || DEFAULT_GOALS.carbs,
      fat: Number(parsed.fat) || DEFAULT_GOALS.fat,
    };
  } catch {
    return DEFAULT_GOALS;
  }
}

export function setGoals(goals: Goals): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  window.dispatchEvent(new Event(EVENT));
}

/** Reactive goals — re-renders when the user updates them anywhere. */
export function useGoals(): Goals {
  const [goals, setGoalsState] = useState<Goals>(DEFAULT_GOALS);

  useEffect(() => {
    const update = () => setGoalsState(getGoals());
    update();
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return goals;
}
