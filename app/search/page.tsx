"use client";

import Searchbar from "@/components/searchbar";
import Space from "@/components/space";
import UserRow from "@/components/userrow";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { getSupabaseClient } from "@/config/supabase";
import { useState, useEffect, useRef } from "react";
import { COLORS } from "@/config/theme";

interface Profile {
  user_id: string;
  username: string | null;
  name: string | null;
  avatar_url: string | null;
}

const FONT = "-apple-system, BlinkMacSystemFont, var(--font-inter), sans-serif";

export default function SearchPage() {
  useProtectedRoute();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const supabase = getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        const { data, error } = await supabase
          .from("user_profiles")
          .select("user_id, username, name, avatar_url")
          .or(`username.ilike.%${q}%,name.ilike.%${q}%`)
          .limit(20);

        if (error) {
          console.error("Search failed:", error);
          setResults([]);
        } else {
          setResults((data || []).filter((p) => p.user_id !== user?.id));
        }
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div>
      <Space size={40} />
      <Searchbar placeholder="Search people" onChange={setQuery} />

      {query.trim().length < 3 ? null : loading ? (
        <div style={{ padding: "8px 20px", color: COLORS.textSecondary, fontFamily: FONT }}>
          Searching...
        </div>
      ) : results.length === 0 ? (
        <div style={{ padding: "20px", textAlign: "center", color: COLORS.textTertiary, fontFamily: FONT }}>
          No people found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {results.map((p) => (
            <UserRow
              key={p.user_id}
              username={p.username || "user"}
              name={p.name || "User"}
              avatar_url={p.avatar_url}
            />
          ))}
        </div>
      )}
    </div>
  );
}
