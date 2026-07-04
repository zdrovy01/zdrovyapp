"use client";

import Log from "@/components/log";
import Title from "@/components/title";
import { getSupabaseClient } from "@/config/supabase";
import { useCached } from "@/hooks/use-cached";

interface FoodLogItem {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
  image_url: string | null;
  created_at: string;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

interface DayLogsProps {
  date: Date;
}

export default function DayLogs({ date }: DayLogsProps) {
  const dateKey = date.toDateString();

  const { data: logs, loading, setData: setLogs } = useCached<FoodLogItem[]>(
    `logs:${dateKey}`,
    async () => {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return [];

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const { data, error } = await supabase
        .from("food_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load logs:", error);
        return [];
      }
      return data || [];
    },
    []
  );

  const handleDelete = async (id: string) => {
    const prev = logs;
    setLogs(logs.filter((l) => l.id !== id));
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from("food_logs").delete().eq("id", id);
      if (error) {
        console.error("Failed to delete log:", error);
        setLogs(prev); // revert on failure
      }
    } catch (err) {
      console.error("Failed to delete log:", err);
      setLogs(prev);
    }
  };

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const title = isSameDay(date, new Date())
    ? "Today's Calories"
    : date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

  return (
    <div>
      <Title text={title} />

      {loading ? (
        <div style={{ padding: "0 20px", color: "rgba(235,235,245,0.6)" }}>
          Loading...
        </div>
      ) : logs.length === 0 ? (
        <div
          style={{
            padding: "30px 20px",
            color: "rgba(235,235,245,0.5)",
            textAlign: "center",
          }}
        >
          No food logs for this day. Tap “Add”.
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
          {logs.map((log) => (
            <Log
              key={log.id}
              title={log.name}
              image={log.image_url}
              kcal={log.kcal}
              protein={log.protein}
              carbs={log.carbs}
              fat={log.fat}
              time={formatTime(log.created_at)}
              onDelete={() => handleDelete(log.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
