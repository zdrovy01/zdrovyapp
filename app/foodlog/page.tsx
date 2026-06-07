"use client";

import Toolbar from "@/components/toolbar";
import Space from "@/components/space";
import Option from "@/components/option";
import DateTime from "@/components/datetime";
import { useState, useEffect } from "react";
import Log from "@/components/log";
import Title from "@/components/title";
import { getSupabaseClient } from "@/config/supabase";
import { useProtectedRoute } from "@/hooks/use-protected-route";

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

export default function FoodlogPage() {
  useProtectedRoute();
  const [date, setDate] = useState(new Date());
  const [logs, setLogs] = useState<FoodLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs(date);
  }, [date]);

  const loadLogs = async (selectedDate: Date) => {
    setLoading(true);
    try {
      const supabase = await getSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLogs([]);
        setLoading(false);
        return;
      }

      // Day boundaries for the selected date
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

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div>
      <Space size={40} />
      <Toolbar title="Food Log" showIcon1={false} showIcon2={false} />
      <DateTime
        date={date}
        onChange={(newDate) => setDate(newDate)}
        showTime={false}
      />
      <Space size={10} />
      <Option buttons={1} text1="Add new log" href1="/add" icon1={<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.54297 18.8418C4.65495 18.8418 3.86361 18.7165 3.16895 18.4658C2.48145 18.2223 1.90853 17.8678 1.4502 17.4023C0.483398 16.457 0 15.0892 0 13.2988V5.55371C0 3.76335 0.483398 2.39193 1.4502 1.43945C1.90853 0.98112 2.48145 0.626628 3.16895 0.375977C3.86361 0.125326 4.65495 0 5.54297 0H13.2988C15.0749 0 16.4427 0.479818 17.4023 1.43945C18.3691 2.39193 18.8525 3.76335 18.8525 5.55371V13.2988C18.8525 15.0892 18.3691 16.457 17.4023 17.4023C16.944 17.8678 16.3675 18.2223 15.6729 18.4658C14.9854 18.7165 14.194 18.8418 13.2988 18.8418H5.54297ZM9.39941 14.2764C9.67871 14.2764 9.90788 14.1904 10.0869 14.0186C10.266 13.8395 10.3555 13.6104 10.3555 13.3311V10.3555H13.3311C13.6104 10.3555 13.8359 10.2695 14.0078 10.0977C14.1868 9.91862 14.2764 9.69303 14.2764 9.4209C14.2764 9.1416 14.1868 8.91243 14.0078 8.7334C13.8359 8.55436 13.6104 8.46484 13.3311 8.46484H10.3555V5.48926C10.3555 5.20996 10.266 4.98079 10.0869 4.80176C9.90788 4.62272 9.67871 4.5332 9.39941 4.5332C9.12728 4.5332 8.90169 4.62272 8.72266 4.80176C8.55078 4.98079 8.46484 5.20996 8.46484 5.48926V8.46484H5.48926C5.20996 8.46484 4.98079 8.55436 4.80176 8.7334C4.62272 8.91243 4.5332 9.1416 4.5332 9.4209C4.5332 9.69303 4.62272 9.91862 4.80176 10.0977C4.98079 10.2695 5.20996 10.3555 5.48926 10.3555H8.46484V13.3311C8.46484 13.6032 8.55078 13.8288 8.72266 14.0078C8.90169 14.1868 9.12728 14.2764 9.39941 14.2764Z" fill="white" />
      </svg>
      } />

      <Space size={20} />
      <Title text="Today's Calories" />

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
          No food logs for this day. Tap “Add new log”.
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
              kcal={log.kcal}
              protein={log.protein}
              carbs={log.carbs}
              fat={log.fat}
              time={formatTime(log.created_at)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
