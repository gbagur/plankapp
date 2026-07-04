import { localDateKey } from '@/lib/date';

export interface AttemptLike {
  date: string;
  durationSeconds: number;
}

export interface MemberStats {
  todayDuration: number;
  currentStreak: number;
  longestStreak: number;
  personalBest: number;
  weeklyAverage: number;
  /** Percent change in average daily duration vs. the prior 7-day window; null if that window has no data. */
  weekOverWeekChangePct: number | null;
  /** Percent change in average daily duration vs. the prior 30-day window; null if that window has no data. */
  monthOverMonthChangePct: number | null;
}

function rollingAverage(byDate: Map<string, number>, endDate: Date, days: number): number {
  let sum = 0;
  const cursor = new Date(endDate);
  for (let i = 0; i < days; i++) {
    sum += byDate.get(localDateKey(cursor)) ?? 0;
    cursor.setDate(cursor.getDate() - 1);
  }
  return sum / days;
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

/**
 * Aggregates a user's attempts into the metrics used by personal stats (FR-4.1)
 * and the group leaderboard (FR-5.2). Missed days count as 0 toward averages,
 * and a missed day breaks the current streak (per SRS section 6 defaults).
 */
export function computeStats(attempts: AttemptLike[]): MemberStats {
  const byDate = new Map(attempts.map((attempt) => [attempt.date, attempt.durationSeconds]));
  const today = new Date();
  const todayKey = localDateKey(today);
  const todayDuration = byDate.get(todayKey) ?? 0;

  let currentStreak = 0;
  const cursor = new Date(today);
  if (!byDate.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (byDate.has(localDateKey(cursor))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const sortedDates = [...byDate.keys()].sort();
  let longestStreak = 0;
  let run = 0;
  let previousDate: Date | null = null;
  for (const dateKey of sortedDates) {
    const currentDate = new Date(dateKey);
    if (previousDate) {
      const diffDays = Math.round((currentDate.getTime() - previousDate.getTime()) / 86_400_000);
      run = diffDays === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    longestStreak = Math.max(longestStreak, run);
    previousDate = currentDate;
  }

  const personalBest = attempts.reduce((max, attempt) => Math.max(max, attempt.durationSeconds), 0);

  const weeklyAverage = rollingAverage(byDate, today, 7);
  const lastWeekEnd = new Date(today);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
  const previousWeeklyAverage = rollingAverage(byDate, lastWeekEnd, 7);

  const monthlyAverage = rollingAverage(byDate, today, 30);
  const lastMonthEnd = new Date(today);
  lastMonthEnd.setDate(lastMonthEnd.getDate() - 30);
  const previousMonthlyAverage = rollingAverage(byDate, lastMonthEnd, 30);

  return {
    todayDuration,
    currentStreak,
    longestStreak,
    personalBest,
    weeklyAverage,
    weekOverWeekChangePct: percentChange(weeklyAverage, previousWeeklyAverage),
    monthOverMonthChangePct: percentChange(monthlyAverage, previousMonthlyAverage),
  };
}
