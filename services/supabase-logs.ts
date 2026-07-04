import { getSupabaseClient } from "@/config/supabase";

export interface UserStats {
  totalKcal: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  logCount: number;
}

export async function getUserStatsForDate(
  date: Date = new Date()
): Promise<UserStats> {
  const supabase = getSupabaseClient();

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) {
    return {
      totalKcal: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      logCount: 0,
    };
  }

  // Local day boundaries for the given date, as absolute UTC instants
  const start = new Date(date);
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

// Backwards-compatible alias
export async function getUserTodayStats(): Promise<UserStats> {
  return getUserStatsForDate(new Date());
}
