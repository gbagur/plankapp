import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { formatDuration } from '@/lib/date';
import { getAttempts } from '@/lib/plank-storage';
import type { PlankAttempt } from '@/types/plank';

export default function HistoryScreen() {
  const [attempts, setAttempts] = useState<PlankAttempt[]>([]);

  useFocusEffect(
    useCallback(() => {
      getAttempts().then((all) => {
        setAttempts([...all].sort((a, b) => b.date.localeCompare(a.date)));
      });
    }, [])
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle" style={styles.title}>
          History
        </ThemedText>

        {attempts.length === 0 && (
          <ThemedText themeColor="textSecondary">No planks logged yet.</ThemedText>
        )}

        {attempts.map((attempt) => (
          <ThemedView key={attempt.id} type="backgroundElement" style={styles.row}>
            <ThemedText>{attempt.date}</ThemedText>
            <ThemedText type="smallBold">{formatDuration(attempt.durationSeconds)}</ThemedText>
          </ThemedView>
        ))}
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
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingTop: Spacing.six,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
  },
  title: {
    marginBottom: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
});
