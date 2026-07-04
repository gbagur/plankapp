import { localDateKey } from '@/lib/date';
import type { AttemptLike } from '@/features/stats/compute-stats';

export interface ChartPoint {
  label: string;
  value: number;
}

function averageOverWindow(byDate: Map<string, number>, endDate: Date, days: number): number {
  let sum = 0;
  const cursor = new Date(endDate);
  for (let i = 0; i < days; i++) {
    sum += byDate.get(localDateKey(cursor)) ?? 0;
    cursor.setDate(cursor.getDate() - 1);
  }
  return sum / days;
}

function toByDate(attempts: AttemptLike[]): Map<string, number> {
  return new Map(attempts.map((attempt) => [attempt.date, attempt.durationSeconds]));
}

export function buildDailySeries(attempts: AttemptLike[], days = 14): ChartPoint[] {
  const byDate = toByDate(attempts);
  const points: ChartPoint[] = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() - (days - 1));
  for (let i = 0; i < days; i++) {
    points.push({
      label: `${cursor.getMonth() + 1}/${cursor.getDate()}`,
      value: byDate.get(localDateKey(cursor)) ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return points;
}

export function buildWeeklySeries(attempts: AttemptLike[], weeks = 8): ChartPoint[] {
  const byDate = toByDate(attempts);
  const points: ChartPoint[] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - w * 7);
    points.push({
      label: `${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`,
      value: averageOverWindow(byDate, weekEnd, 7),
    });
  }
  return points;
}

export function buildMonthlySeries(attempts: AttemptLike[], months = 6): ChartPoint[] {
  const byDate = toByDate(attempts);
  const points: ChartPoint[] = [];
  for (let m = months - 1; m >= 0; m--) {
    const monthEnd = new Date();
    monthEnd.setDate(monthEnd.getDate() - m * 30);
    points.push({
      label: monthEnd.toLocaleDateString(undefined, { month: 'short' }),
      value: averageOverWindow(byDate, monthEnd, 30),
    });
  }
  return points;
}

/** Rolling monthly buckets spanning the user's full history (capped at 24 months). */
export function buildAllTimeSeries(attempts: AttemptLike[]): ChartPoint[] {
  if (attempts.length === 0) return [];
  const [earliestDate] = [...attempts.map((attempt) => attempt.date)].sort();
  const daysSinceFirst = Math.max(1, Math.round((Date.now() - new Date(earliestDate).getTime()) / 86_400_000));
  const months = Math.min(24, Math.max(1, Math.ceil(daysSinceFirst / 30)));
  return buildMonthlySeries(attempts, months);
}
