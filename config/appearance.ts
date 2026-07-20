"use client";

import { useEffect, useState } from "react";

export type ThemeMode = "dark" | "light";

const STORAGE_KEY = "zdrovy-theme";
const EVENT = "zdrovy-theme-change";

export function getTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem(STORAGE_KEY) as ThemeMode) || "dark";
}

export function applyTheme(mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", mode);
}

export function setTheme(mode: ThemeMode): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, mode);
  applyTheme(mode);
  window.dispatchEvent(new Event(EVENT));
}

/** Reactive theme mode — re-renders when the theme changes anywhere. */
export function useTheme(): ThemeMode {
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    const update = () => setMode(getTheme());
    update();
    applyTheme(getTheme());
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return mode;
}
