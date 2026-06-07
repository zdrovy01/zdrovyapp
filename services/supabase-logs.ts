import { getSupabaseClient } from "@/config/supabase";

export interface UserStats {
  totalKcal: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  logCount: number;
}

export async function getUserTodayStats(): Promise<UserStats> {
  const supabase = await getSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      totalKcal: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      logCount: 0,
    };
  }

  // Local day boundaries (start of today -> start of tomorrow), as absolute UTC instants
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const { data, error } = await supabase
    .from("food_logs")
    .select("kcal, protein, carbs, fat")
    .eq("user_id", user.id)
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString());

  if (error) {
    console.error("Failed to fetch user stats:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return {
      totalKcal: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      logCount: 0,
    };
  }

  const stats = data?.reduce(
    (acc: { totalKcal: number; totalProtein: number; totalCarbs: number; totalFat: number; logCount: number }, log: { kcal?: number; protein?: number; carbs?: number; fat?: number }) => ({
      totalKcal: acc.totalKcal + (log.kcal || 0),
      totalProtein: acc.totalProtein + (log.protein || 0),
      totalCarbs: acc.totalCarbs + (log.carbs || 0),
      totalFat: acc.totalFat + (log.fat || 0),
      logCount: acc.logCount + 1,
    }),
    { totalKcal: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, logCount: 0 }
  ) || {
    totalKcal: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    logCount: 0,
  };

  return stats;
}
