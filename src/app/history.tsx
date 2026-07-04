import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarChart } from '@/components/bar-chart';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { buildAllTimeSeries, buildDailySeries, buildMonthlySeries, buildWeeklySeries } from '@/features/stats/chart-data';
import { computeStats } from '@/features/stats/compute-stats';
import { formatDuration } from '@/lib/date';
import { getAttempts } from '@/lib/plank-storage';
import type { PlankAttempt } from '@/types/plank';

type Period = 'daily' | 'weekly' | 'monthly' | 'all-time';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'all-time', label: 'All-time' },
];

function formatChangePct(value: number | null): string {
  if (value === null) return '—';
  const rounded = Math.round(value);
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}

export default function HistoryScreen() {
  const [attempts, setAttempts] = useState<PlankAttempt[]>([]);
  const [period, setPeriod] = useState<Period>('daily');

  useFocusEffect(
    useCallback(() => {
      getAttempts().then((all) => {
        setAttempts([...all].sort((a, b) => b.date.localeCompare(a.date)));
      });
    }, [])
  );

  const stats = useMemo(() => computeStats(attempts), [attempts]);

  const chartData = useMemo(() => {
    switch (period) {
      case 'daily':
        return buildDailySeries(attempts);
      case 'weekly':
        return buildWeeklySeries(attempts);
      case 'monthly':
        return buildMonthlySeries(attempts);
      case 'all-time':
        return buildAllTimeSeries(attempts);
    }
  }, [attempts, period]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="subtitle">History</ThemedText>

          <ThemedView style={styles.statRow}>
            <ThemedView type="backgroundElement" style={styles.statCard}>
              <ThemedText type="title" style={styles.statValue}>
                {stats.currentStreak}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Current streak
              </ThemedText>
            </ThemedView>
            <ThemedView type="backgroundElement" style={styles.statCard}>
              <ThemedText type="title" style={styles.statValue}>
                {stats.longestStreak}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Longest streak
              </ThemedText>
            </ThemedView>
            <ThemedView type="backgroundElement" style={styles.statCard}>
              <ThemedText type="title" style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                {formatDuration(stats.personalBest)}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Personal best
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.changeRow}>
            <ThemedText themeColor="textSecondary" type="small">
              Week over week: {formatChangePct(stats.weekOverWeekChangePct)}
            </ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              Month over month: {formatChangePct(stats.monthOverMonthChangePct)}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.periodRow}>
            {PERIODS.map(({ key, label }) => (
              <Pressable key={key} onPress={() => setPeriod(key)}>
                <ThemedView type={period === key ? 'backgroundSelected' : 'backgroundElement'} style={styles.periodChip}>
                  <ThemedText type="small" themeColor={period === key ? 'text' : 'textSecondary'}>
                    {label}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            ))}
          </ThemedView>

          {chartData.length > 0 ? (
            <BarChart data={chartData} />
          ) : (
            <ThemedText themeColor="textSecondary">No planks logged yet.</ThemedText>
          )}

          <ThemedText type="smallBold" style={styles.logTitle}>
            Log
          </ThemedText>
          {attempts.map((attempt) => (
            <ThemedView key={attempt.id} type="backgroundElement" style={styles.row}>
              <ThemedText>{attempt.date}</ThemedText>
              <ThemedText type="smallBold">{formatDuration(attempt.durationSeconds)}</ThemedText>
            </ThemedView>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: BottomTabInset + Spacing.three,
    gap: Spacing.three,
  },
  statRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statCard: {
    flex: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.one,
    borderRadius: Spacing.three,
    alignItems: 'center',
    gap: Spacing.half,
  },
  statValue: {
    fontSize: 20,
    lineHeight: 24,
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  periodChip: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  logTitle: {
    marginTop: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
});
