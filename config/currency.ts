"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "zdrovy-currency";
const EVENT = "zdrovy-currency-change";

export const CURRENCY_SYMBOL: Record<string, string> = { USD: "$", EUR: "€", PLN: "zł" };

export function getCurrencyCode(): string {
  if (typeof window === "undefined") return "USD";
  return localStorage.getItem(STORAGE_KEY) || "USD";
}

export function getCurrencySymbol(): string {
  return CURRENCY_SYMBOL[getCurrencyCode()] || "$";
}

export function setCurrency(code: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, code);
  // Notify listeners in the same tab (the native `storage` event only fires in other tabs).
  window.dispatchEvent(new Event(EVENT));
}

/** Reactive currency symbol — re-renders when the user changes currency anywhere. */
export function useCurrencySymbol(): string {
  const [sym, setSym] = useState("$");

  useEffect(() => {
    const update = () => setSym(getCurrencySymbol());
    update();
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return sym;
}
