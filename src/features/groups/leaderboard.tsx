import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { GroupMember } from '@/features/groups/use-group-members';
import { useGroupAttempts } from '@/features/groups/use-group-attempts';
import { computeStats } from '@/features/stats/compute-stats';
import { formatDuration } from '@/lib/date';

type Metric = 'today' | 'streak' | 'weeklyAverage' | 'personalBest';

const METRICS: { key: Metric; label: string }[] = [
  { key: 'today', label: "Today's time" },
  { key: 'streak', label: 'Current streak' },
  { key: 'weeklyAverage', label: 'Weekly average' },
  { key: 'personalBest', label: 'Personal best' },
];

function metricValue(
  metric: Metric,
  stats: ReturnType<typeof computeStats>
): number {
  switch (metric) {
    case 'today':
      return stats.todayDuration;
    case 'streak':
      return stats.currentStreak;
    case 'weeklyAverage':
      return stats.weeklyAverage;
    case 'personalBest':
      return stats.personalBest;
  }
}

function formatMetric(metric: Metric, value: number): string {
  return metric === 'streak' ? `${Math.round(value)} day${Math.round(value) === 1 ? '' : 's'}` : formatDuration(value);
}

export function Leaderboard({ members }: { members: GroupMember[] }) {
  const [metric, setMetric] = useState<Metric>('today');
  const memberIds = useMemo(() => members.map((member) => member.userId), [members]);
  const attemptsByUser = useGroupAttempts(memberIds);

  const rows = useMemo(() => {
    return members
      .map((member) => {
        const stats = computeStats(attemptsByUser[member.userId] ?? []);
        return { member, stats, value: metricValue(metric, stats) };
      })
      .sort((a, b) => b.value - a.value);
  }, [members, attemptsByUser, metric]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="smallBold">Leaderboard</ThemedText>

      <ThemedView style={styles.metricRow}>
        {METRICS.map(({ key, label }) => (
          <Pressable key={key} onPress={() => setMetric(key)}>
            <ThemedView type={metric === key ? 'backgroundSelected' : 'backgroundElement'} style={styles.metricChip}>
              <ThemedText type="small" themeColor={metric === key ? 'text' : 'textSecondary'}>
                {label}
              </ThemedText>
            </ThemedView>
          </Pressable>
        ))}
      </ThemedView>

      {rows.map(({ member, stats, value }, index) => (
        <ThemedView key={member.userId} type="backgroundElement" style={styles.row}>
          <ThemedText type="smallBold" style={styles.rank}>
            {index + 1}
          </ThemedText>
          <View style={styles.rowMain}>
            <ThemedText>{member.displayName}</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              {stats.todayDuration > 0 ? 'Logged today' : 'Not logged today'}
            </ThemedText>
          </View>
          <ThemedText type="smallBold">{formatMetric(metric, value)}</ThemedText>
        </ThemedView>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  metricChip: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  rank: {
    width: 20,
  },
  rowMain: {
    flex: 1,
    gap: Spacing.half,
  },
});
