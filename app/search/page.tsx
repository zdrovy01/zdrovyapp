"use client";

import Searchbar from "@/components/searchbar";
import Space from "@/components/space";
import { useProtectedRoute } from "@/hooks/use-protected-route";

export default function SearchPage() {
  useProtectedRoute();
  return (
    <div>
      <Space size={40} />
      <Searchbar />
    </div>
  );
}
