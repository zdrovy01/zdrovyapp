"use client";

import { useState, useEffect } from "react";
import Log from "@/components/log";
import Title from "@/components/title";
import { getSupabaseClient } from "@/config/supabase";

interface FoodLogItem {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  price: number;
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
  const [logs, setLogs] = useState<FoodLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const dateKey = date.toDateString();

  useEffect(() => {
    loadLogs(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey]);

  const loadLogs = async (selectedDate: Date) => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLogs([]);
        setLoading(false);
        return;
      }

      const start = new Date(selectedDate);
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
        console.error("Failed to load logs:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        setLogs([]);
      } else {
        setLogs(data || []);
      }
    } catch (err) {
      console.error("Failed to load logs:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const prev = logs;
    setLogs((cur) => cur.filter((l) => l.id !== id));
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from("food_logs").delete().eq("id", id);
      if (error) {
        console.error("Failed to delete log:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
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
            padding: "0 0px",
          }}
        >
          {logs.map((log) => (
            <Log
              key={log.id}
              title={log.name}
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
