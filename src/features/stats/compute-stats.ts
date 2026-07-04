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

  let weeklySum = 0;
  const day = new Date(today);
  for (let i = 0; i < 7; i++) {
    weeklySum += byDate.get(localDateKey(day)) ?? 0;
    day.setDate(day.getDate() - 1);
  }

  return {
    todayDuration,
    currentStreak,
    longestStreak,
    personalBest,
    weeklyAverage: weeklySum / 7,
  };
}
